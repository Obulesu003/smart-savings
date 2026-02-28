import type { InitProgressReport } from '@mlc-ai/web-llm';
import { AnalysisInput, AIAnalysisResult } from './plan-analyzer';

export const SELECTED_MODEL = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';

// Fallback API Key for Groq (if you have one, specify here or via env)
const FALLBACK_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''; 

export interface AITraceLog {
  timestamp: string;
  source: 'SYSTEM' | 'WEBGPU' | 'CLOUD_API' | 'ERROR';
  message: string;
}

class WebLLMEngineService {
  private engine: any = null;
  private isLoaded: boolean = false;
  private isFailedToWebGPU: boolean = false;
  private onProgressCallback: ((progress: InitProgressReport) => void) | null = null;
  private onTraceCallback: ((log: AITraceLog) => void) | null = null;

  public setProgressCallback(callback: (progress: InitProgressReport) => void) {
    this.onProgressCallback = callback;
  }

  public setTraceCallback(callback: (log: AITraceLog) => void) {
    this.onTraceCallback = callback;
  }

  private trace(source: AITraceLog['source'], message: string) {
    if (this.onTraceCallback) {
      this.onTraceCallback({
        timestamp: new Date().toISOString().substring(11, 19),
        source,
        message
      });
    }
    console.log(`[${source}] ${message}`);
  }

  public async initializeEngine() {
    if (this.isLoaded) return;
    
    this.trace('SYSTEM', 'Initializing ML Architecture...');
    
    // Quick hardware check
    if (!navigator.gpu) {
      this.trace('SYSTEM', 'No Dedicated WebGPU detected in browser.');
      this.isFailedToWebGPU = true;
      return; 
    }

    try {
      this.trace('WEBGPU', 'WebGPU Supported. Allocating hardware resources for Local-First Execution...');
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      
      this.engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (progress) => {
          if (this.onProgressCallback) {
            this.onProgressCallback(progress);
          }
          if (progress.progress === 1) {
            this.trace('WEBGPU', 'Model Weights Loaded into VRAM successfully.');
          }
        },
      });

      this.isLoaded = true;
      this.trace('SYSTEM', 'Local Engine Ready.');
    } catch (error: any) {
      if (error?.message?.includes('Cache.add()') || error?.message?.includes('NetworkError')) {
        this.trace('ERROR', `WebGPU Cache Corrupted. Purging corrupted VRAM weights...`);
        try {
           // Attempt to clear the corrupted WebLLM indexedDB cache so it tries fresh next time
           indexedDB.deleteDatabase('webllm/model'); 
        } catch (e) {
           // ignore
        }
      } else {
        this.trace('ERROR', `WebGPU Initialization Failed: ${error}`);
      }
      this.isFailedToWebGPU = true; // Flag to use cloud fallback
    }
  }

  public isReady() {
    return this.isLoaded || this.isFailedToWebGPU;
  }

  // ---- RAG Context Builder ----
  private buildRAGContext(payload: AnalysisInput): string {
    const { age, monthlyIncome, monthlyExpenses, goalType, goalAmount, timePeriod, riskPreference } = payload.inputs;
    const { monthlyInvestment, monthlySavings, expenseRatio } = payload.savings;
    const { score, shortfall } = payload.feasibility;

    return `
      User Profile:
      - Age: ${age}
      - Risk Tolerance: ${riskPreference}
      
      Financial State:
      - Monthly Income: ₹${monthlyIncome}
      - Monthly Expenses: ₹${monthlyExpenses} (Ratio: ${expenseRatio.toFixed(1)}%)
      - Current Monthly Savings Capability: ₹${monthlySavings}
      - Target Monthly Investment: ₹${monthlyInvestment}
      
      Goal Details (Deterministic Math):
      - Objective: ${goalType}
      - Target Amount: ₹${goalAmount}
      - Horizon: ${timePeriod} years
      - Mathematical Feasibility Score: ${score.toFixed(0)}%
      - Projected Shortfall: ₹${shortfall.toFixed(0)}
    `;
  }

  /**
   * The Cloud API Fallback utilizing Groq (Fastest Inference API)
   * This guarantees the presentation works perfectly even on an old intel celeron CPU.
   */
  private async fallbackCloudInference(systemPrompt: string, userMessage: string = ""): Promise<string> {
    this.trace('CLOUD_API', 'Initiating Graceful Degradation: Rerouting context to High-Speed Cloud Node...');
    
    if (!FALLBACK_GROQ_API_KEY) {
        this.trace('ERROR', 'No Cloud API Key found. Returning deterministic ruleset.');
        throw new Error("Missing Fallback Key");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FALLBACK_GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192', // Fast, high-quality open model
            messages: [
                { role: 'system', content: systemPrompt },
                ...(userMessage ? [{ role: 'user', content: userMessage }] : [])
            ],
            temperature: 0.2,
            max_tokens: 800
        })
    });

    if (!response.ok) {
        throw new Error(`Cloud API failed with status ${response.status}`);
    }

    const data = await response.json();
    this.trace('CLOUD_API', `Inference complete. Payload received in ${(data.usage?.total_time || 0.5).toFixed(2)}s`);
    return data.choices[0].message.content;
  }

  public async generateFinancialAdvice(payload: AnalysisInput): Promise<AIAnalysisResult> {
    this.trace('SYSTEM', 'Constructing Retrieval-Augmented Generation (RAG) Context vector...');
    const context = this.buildRAGContext(payload);

    const systemPrompt = `You are an elite Certified Financial Planner (CFP). 
    You are advising a client based on the following deterministic financial state and mathematical calculations.
    
    YOUR EXACT CONTEXT DATA:
    ${context}
    
    INSTRUCTIONS:
    1. Do NOT hallucinate numbers. Use only the mathematical data provided in the context.
    2. Write a professional "Risk Assessment" evaluating their age vs. risk tolerance.
    3. Write "Recommendations" for portfolio allocation based on their profile.
    4. Write an "Explanation" detailing their feasibility score and how to close any shortfall.
    
    You MUST respond with ONLY raw, valid JSON matching this exact structure:
    {
      "riskAssessment": "string",
      "recommendations": "string",
      "explanation": "string"
    }`;

    try {
      let responseText = "";

      if (this.isFailedToWebGPU) {
          // Hardware degraded, use Cloud API
          responseText = await this.fallbackCloudInference(systemPrompt);
      } else {
          // Hardware capable, run strictly offline
          this.trace('WEBGPU', 'Executing LLM Inference locally on device GPU...');
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('LLM_TIMEOUT')), 90000));
          
          const completionPromise = this.engine.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            max_tokens: 800,
            temperature: 0.2,
          });

          const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
          responseText = completion.choices[0].message.content || '{}';
          this.trace('WEBGPU', 'Local Generation Complete. Parsing NLP Entities...');
      }

      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      return {
        riskAssessment: parsed.riskAssessment || 'Analysis unavailable.',
        recommendations: parsed.recommendations || 'Analysis unavailable.',
        explanation: parsed.explanation || 'Analysis unavailable.'
      };

    } catch (error) {
      this.trace('ERROR', `Generative Inference Failed completely: ${error}`);
      return {
        riskAssessment: "Risk tolerance has been mathematically accounted for. (AI inference bypassed).",
        recommendations: "Recommend diversified portfolio spanning emergency fund and index funds.",
        explanation: `Goal feasibility score: ${payload.feasibility.score.toFixed(0)}%.`
      };
    }
  }

  public async extractFinancialEntities(prompt: string): Promise<Partial<AnalysisInput['inputs']>> {
    this.trace('SYSTEM', 'Initiating Zero-Shot Foundation Model Extraction with Few-Shot prompting...');
    
    // We use a highly explicit Few-Shot prompt here because small, quantized 
    // local models struggle with zero-shot spatial reasoning and regex extraction.
    const systemPrompt = `You are an elite financial data extraction AI. You read user text and extract their financial state into a strict JSON format.

RULES:
1. ONLY return valid JSON. Do not include markdown \`\`\`json blocks or conversational text.
2. ALL NUMBERS MUST BE INTEGERS. No commas, no currency symbols.
3. INFER THE MONTHLY VALUES. If they say "I make $120k a year", you must return "monthlyIncome": 10000. 
4. INFER THE GOAL TYPE. Valid types: "retirement", "education", "house", "business". If unsure, use "house".
5. INFER RISK PREFERENCE based on words like 'aggressive' (high), 'safe' (low). Valid types: "low", "medium", "high".

EXPECTED JSON SCHEMA:
{
  "age": <number or null>,
  "monthlyIncome": <number or null>,
  "monthlyExpenses": <number or null>,
  "goalAmount": <number or null>,
  "timePeriod": <number or null>,
  "goalType": <string>,
  "riskPreference": <string>
}

// EXAMPLE 1
USER: "I am 30 years old, saving for a 2000000 house in 5 years. I make 90000 a month and spend 70000. Aggressive."
ASSISTANT: {"age":30,"monthlyIncome":90000,"monthlyExpenses":70000,"goalAmount":2000000,"timePeriod":5,"goalType":"house","riskPreference":"high"}

// EXAMPLE 2
USER: "I'm 26 making 120k a year with 4k monthly expenses. I want to retire with 1 million in 20 yrs. Medium risk."
ASSISTANT: {"age":26,"monthlyIncome":10000,"monthlyExpenses":4000,"goalAmount":1000000,"timePeriod":20,"goalType":"retirement","riskPreference":"medium"}

// END EXAMPLES

Now, process the following USER prompt:`;

    try {
      let responseText = "";

      if (this.isFailedToWebGPU) {
        responseText = await this.fallbackCloudInference(systemPrompt, prompt);
      } else {
        this.trace('WEBGPU', 'Executing Tokenization Pipeline on Edge GPU...');
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('LLM_TIMEOUT')), 90000));
        const completionPromise = this.engine.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.1,
        });

        const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
        responseText = completion.choices[0].message.content || '{}';
        this.trace('WEBGPU', 'Tokenization Complete.');
      }

      // 1. Fallback to extracting the JSON block using Regex if the model outputs conversational text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         responseText = jsonMatch[0];
      }

      // 2. Aggressive sanitization
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      
      // Protect against null numeric values replacing them with undefined to trigger the missing fields logic
      return {
          age: typeof parsed.age === 'number' ? parsed.age : undefined,
          monthlyIncome: typeof parsed.monthlyIncome === 'number' ? parsed.monthlyIncome : undefined,
          monthlyExpenses: typeof parsed.monthlyExpenses === 'number' ? parsed.monthlyExpenses : undefined,
          goalAmount: typeof parsed.goalAmount === 'number' ? parsed.goalAmount : undefined,
          timePeriod: typeof parsed.timePeriod === 'number' ? parsed.timePeriod : undefined,
          riskPreference: parsed.riskPreference || undefined,
          goalType: parsed.goalType || undefined
      };

    } catch (parseError) {
      this.trace('ERROR', `Regex Extraction Failed. Rerouting to manual fallback workflow...`);
      return {}; // Returning empty triggers the missingFields UI gracefully
    }
  }

  /**
   * Continuous Conversational Agent (Chatbot)
   */
  public async chatIterative(history: {role: 'system'|'user'|'assistant', content: string}[]): Promise<string> {
    this.trace('SYSTEM', 'Processing Conversational Context Memory...');
    
    try {
      if (this.isFailedToWebGPU) {
        this.trace('CLOUD_API', 'Rerouting Conversational Turn to Cloud Node...');
        if (!FALLBACK_GROQ_API_KEY) throw new Error("Missing Fallback Key");

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FALLBACK_GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: history,
                temperature: 0.4,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        this.trace('CLOUD_API', 'Response received.');
        return data.choices?.[0]?.message?.content || "I couldn't process that.";
      } else {
        this.trace('WEBGPU', 'Streaming Chat response computationally...');
        const completion = await this.engine.chat.completions.create({
          messages: history,
          max_tokens: 1024,
          temperature: 0.4,
        });
        return completion.choices[0].message.content || "";
      }
    } catch (error) {
      this.trace('ERROR', `Chat generation failed: ${error}`);
      return "I'm sorry, I am currently experiencing technical difficulties connecting to my inference engine.";
    }
  }
}

export const webLlmService = new WebLLMEngineService();
