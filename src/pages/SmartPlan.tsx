import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialPlans } from '@/hooks/useFinancialPlans';
import { MainLayout } from '@/components/layout/MainLayout';
import { ResultsPanel } from '@/components/planner/ResultsPanel';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Sparkles, Send, AlertCircle, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { webLlmService, AITraceLog } from '@/lib/ai/local-llm-engine';
import { useToast } from '@/hooks/use-toast';
import { FinancialInputs, FinancialPlan, GoalType, RiskPreference } from '@/types/financial';
import { calculateSavings, calculateGoalFeasibility, getDefaultAllocation } from '@/lib/calculations';
import { MonteCarloLoadingChart } from '@/components/planner/MonteCarloLoadingChart';

export default function SmartPlan() {
  const { user, loading: authLoading } = useAuth();
  const { createPlan } = useFinancialPlans();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // WebLLM States
  const [isAILoading, setIsAILoading] = useState(true);
  const [aiProgressText, setAiProgressText] = useState('Initializing AI Engine...');
  const [aiLogs, setAiLogs] = useState<AITraceLog[]>([]);

  // Core States
  const [step, setStep] = useState<'chat' | 'results'>('chat');
  const [saving, setSaving] = useState(false);
  const [fullInputs, setFullInputs] = useState<FinancialInputs | null>(null);
  const [partialInputs, setPartialInputs] = useState<Partial<FinancialInputs>>({});
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Initialize WebLLM on mount
  useEffect(() => {
    let mounted = true;

    async function initAI() {
      try {
        if (!webLlmService.isReady()) {
          webLlmService.setProgressCallback((progress) => {
            if (mounted) setAiProgressText(progress.text);
          });
          webLlmService.setTraceCallback((log) => {
            if (mounted) setAiLogs(prev => [...prev, log]);
          });
          await webLlmService.initializeEngine();
        } else {
          // If already ready, just attach the current trace callback
          webLlmService.setTraceCallback((log) => {
            if (mounted) setAiLogs(prev => [...prev, log]);
          });
        }
      } catch (error) {
        console.error("Failed to load AI engine:", error);
        if (mounted) {
          toast({
            title: "AI Initialization Failed",
            description: "Your browser might not support WebGPU, or you are offline.",
            variant: "destructive"
          });
        }
      } finally {
        if (mounted) setIsAILoading(false);
      }
    }

    initAI();

    return () => { mounted = false; };
  }, [toast]);

  if (authLoading) return <FullPageLoader />;
  if (!user) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsExtracting(true);
    setMissingFields([]);

    try {
      if (!webLlmService.isReady()) throw new Error("AI Engine not loaded.");

      toast({
        title: "Analyzing Request",
        description: "Extracting financial data locally...",
      });

      // 1. Extract Entities
      const extracted = await webLlmService.extractFinancialEntities(prompt);
      
      // 2. Validate
      const required: (keyof FinancialInputs)[] = [
        'age', 'monthlyIncome', 'monthlyExpenses', 'goalAmount', 'timePeriod', 'goalType', 'riskPreference'
      ];
      
      const missing = required.filter(field => extracted[field] == null || extracted[field] === undefined);
      
      if (missing.length > 0) {
        setMissingFields(missing as string[]);
        setPartialInputs(extracted);
        setIsExtracting(false);
        return; // Stop generation, ask user for details via the form
      }

      // 3. All data present, proceed to generate plan
      await generatePlanFromInputs(extracted as FinancialInputs);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Parse Error",
        description: "Falling back to manual entry mode due to complex prompt.",
        variant: "destructive"
      });
      setMissingFields(['age', 'monthlyIncome', 'monthlyExpenses', 'goalAmount', 'timePeriod', 'goalType', 'riskPreference']);
    } finally {
      setIsExtracting(false);
    }
  };

  const generatePlanFromInputs = async (formInputs: FinancialInputs) => {
    setIsExtracting(true);
    try {
      setFullInputs(formInputs);

      // Deterministic calculations
      const savings = calculateSavings(formInputs);
      const feasibility = calculateGoalFeasibility(
        savings.monthlyInvestment,
        formInputs.goalAmount,
        formInputs.timePeriod,
        formInputs.riskPreference
      );
      const allocation = getDefaultAllocation(formInputs.riskPreference);

      // 4. Generate AI Recommendations (like in NewPlan)
      toast({
        title: "Generating Plan",
        description: "Drafting highly personalized insights...",
      });

      const aiResult = await webLlmService.generateFinancialAdvice({ 
        inputs: formInputs, 
        savings, 
        feasibility, 
        allocation 
      });

      setResults({
        savings,
        feasibility,
        allocation,
        aiExplanation: aiResult.explanation || 'N/A',
        aiRecommendations: aiResult.recommendations || 'N/A',
        aiRiskAssessment: aiResult.riskAssessment || 'N/A',
      });
      
      
      setStep('results');
      setMissingFields([]); // Clear on success
    } catch (error) {
      console.error("Pipeline Error:", error);
      toast({
        title: "AI Analysis Error",
        description: "Failed to generate financial recommendations.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleManualSubmit = () => {
     // Check if the partial inputs are now fully filled out by the user form
     const required: (keyof FinancialInputs)[] = [
      'age', 'monthlyIncome', 'monthlyExpenses', 'goalAmount', 'timePeriod', 'goalType', 'riskPreference'
     ];
     const stillMissing = required.filter(field => partialInputs[field] == null || partialInputs[field] === undefined || partialInputs[field] === '' as any);
     
     if (stillMissing.length > 0) {
        setMissingFields(stillMissing);
        toast({ title: "Fields still missing", description: "Please fill out all highlighted fields.", variant: "destructive" });
        return;
     }

     generatePlanFromInputs(partialInputs as FinancialInputs);
  };

  const handleSavePlan = async (name: string) => {
    if (!fullInputs || !results) return;

    setSaving(true);
    try {
      const planData: Partial<FinancialPlan> = {
        name,
        ...fullInputs,
        monthlySavings: results.savings.monthlySavings,
        monthlyInvestment: results.savings.monthlyInvestment,
        savingsPercentage: results.savings.optimalSavingsPercentage,
        aiRiskAssessment: results.aiRiskAssessment,
        aiRecommendations: results.aiRecommendations,
        aiExplanation: results.aiExplanation,
        investmentAllocation: results.allocation,
        goalFeasibilityScore: results.feasibility.score,
        projectedValue: results.feasibility.projectedValue,
        isGoalAchievable: results.feasibility.isAchievable,
      };

      const newPlan = await createPlan(planData);
      if (newPlan) {
        navigate(`/plan/${newPlan.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        {step === 'chat' ? (
          <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Natural Language AI Planner
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Don't want to fill out forms? Just tell the AI what you want to achieve.
                All processing happens locally and privately on your device.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 to-blue-500/30 blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xl">
                <Textarea 
                  placeholder="E.g., I am 26 years old making $4000 a month with $1500 in expenses. I want to save for a $30,000 wedding in 2 years. I have medium risk tolerance."
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-lg leading-relaxed shadow-none bg-transparent"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isExtracting || isAILoading}
                />
                
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {isAILoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-medium text-primary">{aiProgressText}</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">WebLLM Engine Ready</span>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="gap-2 rounded-full px-6 transition-all duration-300" 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isExtracting || isAILoading}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Simulating Models...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Smart Plan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* The Pro-Max Visual Loading State */}
            {isExtracting && (
              <MonteCarloLoadingChart 
                goalAmount={partialInputs?.goalAmount || fullInputs?.goalAmount || 1000000}
                timePeriod={partialInputs?.timePeriod || fullInputs?.timePeriod || 10}
                monthlyInvestment={partialInputs?.monthlyIncome ? (partialInputs.monthlyIncome * 0.2) : 2000}
              />
            )}

            {missingFields.length > 0 && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-500 rounded-xl border-2 border-primary/20 bg-card p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                <div className="flex items-center gap-2 mb-4 text-orange-500">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Almost there! Missing some details.</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  The AI extracted what it could, but needs a few more numbers to run accurately. 
                  Please quickly fill in the missing <span className="text-orange-500 font-medium">highlighted</span> fields below:
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {(['age', 'monthlyIncome', 'monthlyExpenses', 'goalAmount', 'timePeriod'] as const).map(field => (
                    <div key={field} className="space-y-2">
                       <label className="text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                       <input 
                         type="number"
                         className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${missingFields.includes(field) ? 'border-orange-500 ring-orange-500/20 bg-orange-500/5' : 'border-input'}`}
                         value={partialInputs[field] || ''}
                         onChange={(e) => setPartialInputs({...partialInputs, [field]: Number(e.target.value)})}
                         placeholder={`Enter ${field}...`}
                       />
                    </div>
                  ))}
                  <div className="space-y-2">
                       <label className="text-sm font-medium">Goal Type</label>
                       <select 
                         className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${missingFields.includes('goalType') ? 'border-orange-500 ring-orange-500/20 bg-orange-500/5' : 'border-input'}`}
                         value={partialInputs.goalType || ''}
                         onChange={(e) => setPartialInputs({...partialInputs, goalType: e.target.value as any})}
                       >
                         <option value="" disabled>Select...</option>
                         <option value="house">House</option>
                         <option value="retirement">Retirement</option>
                         <option value="education">Education</option>
                         <option value="business">Business</option>
                       </select>
                  </div>
                  <div className="space-y-2">
                       <label className="text-sm font-medium">Risk Preference</label>
                       <select 
                         className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${missingFields.includes('riskPreference') ? 'border-orange-500 ring-orange-500/20 bg-orange-500/5' : 'border-input'}`}
                         value={partialInputs.riskPreference || ''}
                         onChange={(e) => setPartialInputs({...partialInputs, riskPreference: e.target.value as any})}
                       >
                         <option value="" disabled>Select...</option>
                         <option value="low">Low (Safe)</option>
                         <option value="medium">Medium</option>
                         <option value="high">High (Aggressive)</option>
                       </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleManualSubmit} disabled={isExtracting}>
                    {isExtracting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Confirm & Generate Plan
                  </Button>
                </div>
              </div>
            )}

            {/* Academic Trace Log Terminal */}
            {aiLogs.length > 0 && (
              <div className="bg-neutral-950 rounded-lg p-4 font-mono text-xs overflow-hidden border border-neutral-800 shadow-inner mt-6 animate-in fade-in">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-800 text-neutral-400">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="uppercase text-[10px] tracking-wider font-semibold">Edge AI Architect Trace</span>
                  {isExtracting && <Loader2 className="h-3 w-3 animate-spin ml-auto text-primary" />}
                </div>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {aiLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-neutral-500 shrink-0">[{log.timestamp}]</span>
                      <span className={
                        log.source === 'WEBGPU' ? 'text-green-400 shrink-0 min-w-[70px]' : 
                        log.source === 'CLOUD_API' ? 'text-blue-400 shrink-0 min-w-[70px]' : 
                        log.source === 'ERROR' ? 'text-red-400 shrink-0 min-w-[70px]' :
                        'text-purple-400 shrink-0 min-w-[70px]'
                      }>
                        [{log.source}]
                      </span>
                      <span className="text-neutral-300 break-words">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div 
                className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setPrompt("I'm a 32 year old developer earning 120000 a year (10000/mo) with 4000/mo expenses. I'm saving for a 600k house in 5 years. I have low risk preference.")}
              >
                <span className="font-medium text-foreground block mb-2">Try an example:</span>
                "I'm a 32 year old developer earning 120000 a year (10000/mo) with 4000/mo expenses. I'm saving for a 600k house in 5 years. I have low risk preference."
              </div>
              <div 
                className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setPrompt("I am 45, making 8000 monthly, spending 6000. I want to build a retirement corpus of 2000000 in 15 years. My risk tolerance is aggressive.")}
              >
                <span className="font-medium text-foreground block mb-2">Try another:</span>
                "I am 45, making 8000 monthly, spending 6000. I want to build a retirement corpus of 2000000 in 15 years. My risk tolerance is aggressive."
              </div>
            </div>

          </div>
        ) : (
          <div className="w-full max-w-4xl py-8">
             <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI Smart Plan Results
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Generated purely from a single sentence using Local WebLLM.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setStep('chat')}>
                  New Prompt
                </Button>
             </div>
             {results && fullInputs && (
              <ResultsPanel
                inputs={fullInputs}
                savings={results.savings}
                feasibility={results.feasibility}
                allocation={results.allocation}
                aiExplanation={results.aiExplanation}
                aiRecommendations={results.aiRecommendations}
                aiRiskAssessment={results.aiRiskAssessment}
                onSave={handleSavePlan}
                onBack={() => setStep('chat')}
                isSaving={saving}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
