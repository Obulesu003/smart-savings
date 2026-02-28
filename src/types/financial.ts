export type GoalType = 'retirement' | 'education' | 'house' | 'business';
export type RiskPreference = 'low' | 'medium' | 'high';

export interface FinancialInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  age: number;
  goalType: GoalType;
  goalAmount: number;
  timePeriod: number;
  riskPreference: RiskPreference;
}

export interface InvestmentAllocation {
  name: string;
  percentage: number;
  expectedReturn: number;
  color: string;
}

export interface FinancialPlan {
  id: string;
  userId: string;
  name: string;

  // User inputs
  monthlyIncome: number;
  monthlyExpenses: number;
  age: number;
  goalType: GoalType;
  goalAmount: number;
  timePeriod: number;
  riskPreference: RiskPreference;

  // Calculated results
  monthlySavings: number | null;
  monthlyInvestment: number | null;
  savingsPercentage: number | null;

  // AI results
  aiRiskAssessment: string | null;
  aiRecommendations: string | null;
  aiExplanation: string | null;
  investmentAllocation: InvestmentAllocation[] | null;

  // Goal analysis
  goalFeasibilityScore: number | null;
  projectedValue: number | null;
  isGoalAchievable: boolean | null;
  monteCarloProbability?: number | null;

  createdAt: string;
  updatedAt: string;
}


export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  retirement: 'Retirement',
  education: 'Education',
  house: 'House/Property',
  business: 'Business/Startup',
};

export const RISK_LABELS: Record<RiskPreference, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
};

export const GOAL_PRESETS: Record<GoalType, { amount: number; years: number }> = {
  retirement: { amount: 1000000, years: 30 },
  education: { amount: 100000, years: 10 },
  house: { amount: 300000, years: 7 },
  business: { amount: 150000, years: 5 },
};

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  notes?: string;
  isRecurring?: boolean;
  isFixed?: boolean; // For fixed vs variable expenses
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Rental',
  'Other'
];

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Savings',
  'Personal',
  'Entertainment',
  'Miscellaneous'
];

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  alertThreshold?: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  notes?: string;
}