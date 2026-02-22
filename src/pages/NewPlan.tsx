import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialPlans } from '@/hooks/useFinancialPlans';
import { MainLayout } from '@/components/layout/MainLayout';
import { FinancialInputForm } from '@/components/planner/FinancialInputForm';
import { ResultsPanel } from '@/components/planner/ResultsPanel';
import { FullPageLoader, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  FinancialInputs, 
  FinancialPlan,
  InvestmentAllocation 
} from '@/types/financial';
import { 
  calculateSavings, 
  calculateGoalFeasibility,
  getDefaultAllocation 
} from '@/lib/calculations';
import { webLlmService } from '@/lib/ai/local-llm-engine';
import { useToast } from '@/hooks/use-toast';

export default function NewPlan() {
  const { user, loading: authLoading } = useAuth();
  const { createPlan } = useFinancialPlans();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<'input' | 'results'>('input');
  const [inputs, setInputs] = useState<FinancialInputs | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // WebLLM States
  const [isAILoading, setIsAILoading] = useState(true);
  const [aiProgressText, setAiProgressText] = useState('Initializing AI Engine...');

  const [results, setResults] = useState<{
    savings: ReturnType<typeof calculateSavings>;
    feasibility: ReturnType<typeof calculateGoalFeasibility>;
    allocation: InvestmentAllocation[];
    aiExplanation: string;
    aiRecommendations: string;
    aiRiskAssessment: string;
  } | null>(null);

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

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }

  const handleFormSubmit = async (formInputs: FinancialInputs) => {
    setInputs(formInputs);
    setCalculating(true);

    try {
      // Calculate savings and feasibility deterministically
      const savings = calculateSavings(formInputs);
      const feasibility = calculateGoalFeasibility(
        savings.monthlyInvestment,
        formInputs.goalAmount,
        formInputs.timePeriod,
        formInputs.riskPreference
      );
      const allocation = getDefaultAllocation(formInputs.riskPreference);

      // Get AI analysis via WebLLM
      let aiExplanation = 'Local AI Engine could not generate an explanation.';
      let aiRecommendations = 'Local AI Engine could not generate recommendations.';
      let aiRiskAssessment = 'Local AI Engine could not assess risk.';

      try {
        if (!webLlmService.isReady()) {
          throw new Error("AI Engine not loaded.");
        }
        
        toast({
          title: "Analyzing Financial Data",
          description: "Generating highly personalized insights locally...",
        });

        const aiResult = await webLlmService.generateFinancialAdvice({ 
          inputs: formInputs, 
          savings, 
          feasibility, 
          allocation 
        });
        
        aiExplanation = aiResult.explanation || aiExplanation;
        aiRecommendations = aiResult.recommendations || aiRecommendations;
        aiRiskAssessment = aiResult.riskAssessment || aiRiskAssessment;
      } catch (aiError) {
        console.error('AI Inference error:', aiError);
        toast({
          title: 'AI Analysis Unavailable',
          description: 'An error occurred while generating insights. Ensure your device supports WebGPU.',
          variant: 'destructive',
        });
      }

      setResults({
        savings,
        feasibility,
        allocation,
        aiExplanation,
        aiRecommendations,
        aiRiskAssessment,
      });
      setStep('results');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to calculate your plan.';
      toast({
        title: 'Calculation Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSavePlan = async (name: string) => {
    if (!inputs || !results) return;

    setSaving(true);
    try {
      const planData: Partial<FinancialPlan> = {
        name,
        ...inputs,
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

  const handleBack = () => {
    setStep('input');
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          {step === 'input' ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Create Your Financial Plan
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Enter your financial details to get personalized savings and investment recommendations
                </p>
              </div>
              
              <FinancialInputForm 
                onSubmit={handleFormSubmit}
                isLoading={calculating}
                isAIEngineLoading={isAILoading}
                aiEngineProgress={aiProgressText}
              />
            </>
          ) : (
            results && inputs && (
              <ResultsPanel
                inputs={inputs}
                savings={results.savings}
                feasibility={results.feasibility}
                allocation={results.allocation}
                aiExplanation={results.aiExplanation}
                aiRecommendations={results.aiRecommendations}
                aiRiskAssessment={results.aiRiskAssessment}
                onSave={handleSavePlan}
                onBack={handleBack}
                isSaving={saving}
              />
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
}