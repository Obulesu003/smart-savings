import type { InitProgressReport } from '@mlc-ai/web-llm';
import { AnalysisInput, AIAnalysisResult } from '@/types/financial';

// We use a relatively small model (Phi-3-mini or Llama-3-8B-Instruct) 
// for reasonable browser performance without APIs.
export const SELECTED_MODEL = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';

class WebLLMEngineService {
  private engine: any = null;
  private isLoaded: boolean = false;
  private onProgressCallback: ((progress: InitProgressReport) => void) | null = null;

  public setProgressCallback(callback: (progress: InitProgressReport) => void) {
    this.onProgressCallback = callback;
  }

  public async initializeEngine() {
    if (this.isLoaded) return;
    
    try {
      // In a real production app, we would use a Web Worker to avoid blocking the main thread.
      // For simplicity in this implementation, we initialize directly.
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      
      this.engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (progress) => {
          console.log(progress);
          if (this.onProgressCallback) {
            this.onProgressCallback(progress);
          }
        },
      });

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to initialize WebLLM engine:', error);
      throw error;
    }
  }

  public isReady() {
    return this.isLoaded;
  }

  // ---- RAG Context Builder ----
  private buildRAGContext(payload: AnalysisInput): string {
    const { age, monthlyIncome, monthlyExpenses, goalType, goalAmount, timePeriod, riskPreference } = payload.inputs;
    const { monthlyInvestment, monthlySavings, expenseRatio } = payload.savings;
    const { score, shortfall } = payload.feasibility;

    // We build a dense statistical context so the LLM acts on exact math, not hallucinations.
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

  public async generateFinancialAdvice(payload: AnalysisInput): Promise<AIAnalysisResult> {
    if (!this.isLoaded || !this.engine) {
      throw new Error("AI Engine is not loaded yet.");
    }

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
    
    You MUST respond with ONLY valid JSON matching this exact structure:
    {
      "riskAssessment": "string",
      "recommendations": "string",
      "explanation": "string"
    }
    `;

    try {
      const completion = await this.engine.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: 800,
        temperature: 0.2, // Low temp for more deterministic, financial-style advice
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(responseText || '{}');
        return {
          riskAssessment: parsed.riskAssessment || 'Analysis unavailable.',
          recommendations: parsed.recommendations || 'Analysis unavailable.',
          explanation: parsed.explanation || 'Analysis unavailable.'
        };
      } catch (parseError) {
        console.error("Failed to parse LLM JSON:", parseError, responseText);
        throw new Error("AI generated malformed output.");
      }

    } catch (error) {
      console.error("LLM Inference Error:", error);
      throw error;
    }
  }

  // ---- NLP Entity Extraction ----
  public async extractFinancialEntities(prompt: string): Promise<Partial<AnalysisInput['inputs']>> {
    if (!this.isLoaded || !this.engine) {
      throw new Error("AI Engine is not loaded yet.");
    }

    const systemPrompt = `You are a financial data extraction engine.
    Extract the following financial details from the user's input.
    If a value is not explicitly mentioned, return null for that field.
    
    Data Types:
    - age: number
    - monthlyIncome: number
    - monthlyExpenses: number
    - goalAmount: number
    - timePeriod: number (in years)
    - goalType: string (must be exactly one of: "retirement", "education", "house", "business") - infer if not explicit.
    - riskPreference: string (must be exactly one of: "low", "medium", "high") - infer if not explicit.
    
    You MUST respond with ONLY valid JSON matching this exact structure:
    {
      "age": number | null,
      "monthlyIncome": number | null,
      "monthlyExpenses": number | null,
      "goalType": "retirement" | "education" | "house" | "business" | null,
      "goalAmount": number | null,
      "timePeriod": number | null,
      "riskPreference": "low" | "medium" | "high" | null
    }
    `;

    try {
      const completion = await this.engine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(responseText || '{}');
        return parsed;
      } catch (parseError) {
        console.error("Failed to parse extraction JSON:", parseError, responseText);
        throw new Error("AI generated malformed extraction output.");
      }

    } catch (error) {
      console.error("LLM Extraction Error:", error);
      throw error;
    }
  }
}

export const webLlmService = new WebLLMEngineService();
