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
import { webLlmService } from '@/lib/ai/local-llm-engine';
import { useToast } from '@/hooks/use-toast';
import { FinancialInputs, FinancialPlan, GoalType, RiskPreference } from '@/types/financial';
import { calculateSavings, calculateGoalFeasibility, getDefaultAllocation } from '@/lib/calculations';

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

  // Core States
  const [step, setStep] = useState<'chat' | 'results'>('chat');
  const [saving, setSaving] = useState(false);
  const [fullInputs, setFullInputs] = useState<FinancialInputs | null>(null);
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
          await webLlmService.initializeEngine();
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
        setMissingFields(missing);
        setIsExtracting(false);
        return; // Stop generation, ask user for details
      }

      // 3. All data present, proceed to generate plan
      const formInputs = extracted as FinancialInputs;
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
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Failed to process natural language request.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
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
                        <Bot className="h-4 w-4" />
                        WebLLM Engine Ready
                      </>
                    )}
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="gap-2 rounded-full px-6" 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isExtracting || isAILoading}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Extracting Details...
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

            {missingFields.length > 0 && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Information</AlertTitle>
                <AlertDescription>
                  The AI couldn't find all the details needed to run the exact mathematical calculations. 
                  Please update your prompt to include: <span className="font-semibold">{missingFields.join(', ')}</span>.
                </AlertDescription>
              </Alert>
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
