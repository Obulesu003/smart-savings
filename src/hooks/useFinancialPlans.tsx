import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FinancialPlan } from '@/types/financial';

export const PLANS_STORAGE_KEY = 'ssp_plans';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export function useFinancialPlans() {
  const { user } = useAuth();
  const { toast } = useToast();

  const getStoredPlans = () => {
      try {
          const stored = localStorage.getItem(PLANS_STORAGE_KEY);
          return stored ? JSON.parse(stored) : [];
      } catch {
          return [];
      }
  };

  const [plans, setPlans] = useState<FinancialPlan[]>(getStoredPlans());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      setPlans(getStoredPlans());
  }, []);

  const createPlan = async (planData: Partial<FinancialPlan>) => {
      if (!user) return null;

      try {
        const newPlan: FinancialPlan = {
            id: generateId(),
            userId: user.id,
            name: planData.name || 'My Plan',
            monthlyIncome: planData.monthlyIncome || 0,
            monthlyExpenses: planData.monthlyExpenses || 0,
            age: planData.age || 25,
            goalType: planData.goalType || 'retirement',
            goalAmount: planData.goalAmount || 0,
            timePeriod: planData.timePeriod || 1,
            riskPreference: planData.riskPreference || 'medium',
            monthlySavings: planData.monthlySavings || 0,
            monthlyInvestment: planData.monthlyInvestment || 0,
            savingsPercentage: planData.savingsPercentage || 0,
            aiRiskAssessment: planData.aiRiskAssessment || null,
            aiRecommendations: planData.aiRecommendations || null,
            aiExplanation: planData.aiExplanation || null,
            investmentAllocation: planData.investmentAllocation || null,
            goalFeasibilityScore: planData.goalFeasibilityScore || null,
            projectedValue: planData.projectedValue || null,
            isGoalAchievable: planData.isGoalAchievable || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const currentPlans = getStoredPlans();
        const updated = [newPlan, ...currentPlans];
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
        setPlans(updated);

        toast({
            title: 'Plan created',
            description: 'Your financial plan has been saved.',
        });
        return newPlan;
      } catch (error) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          toast({ title: 'Error', description: message, variant: 'destructive' });
          return null;
      }
  };
  
    const updatePlan = async (id: string, updates: Partial<FinancialPlan>) => {
        const currentPlans = getStoredPlans();
        const index = currentPlans.findIndex((p: FinancialPlan) => p.id === id);
        if (index === -1) return false;

        currentPlans[index] = { ...currentPlans[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(currentPlans));
        setPlans(currentPlans);
        toast({ title: 'Plan updated', description: 'Changes saved.' });
        return true;
    };

    const deletePlan = async (id: string) => {
        const currentPlans = getStoredPlans();
        const updated = currentPlans.filter((p: FinancialPlan) => p.id !== id);
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
        setPlans(updated);
        toast({ title: 'Plan deleted', description: 'Plan removed.' });
        return true;
    };

  return { plans, loading, createPlan, updatePlan, deletePlan };
}