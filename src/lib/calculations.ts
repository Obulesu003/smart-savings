import {
  FinancialInputs,
  InvestmentAllocation,
  RiskPreference
} from '@/types/financial';

export interface SavingsCalculation {
  remainingIncome: number;
  optimalSavingsPercentage: number;
  monthlySavings: number;
  monthlyInvestment: number;
  expenseRatio: number;
  warnings: string[];
}

export interface GoalFeasibility {
  score: number;
  projectedValue: number;
  isAchievable: boolean;
  shortfall: number;
  suggestedIncrease: number;
  suggestedExtension: number;
}

const RISK_RETURNS: Record<RiskPreference, number> = {
  low: 0.05,    // 5% annual
  medium: 0.08, // 8% annual
  high: 0.12,   // 12% annual
};

export function calculateSavings(inputs: FinancialInputs): SavingsCalculation {
  const remainingIncome = inputs.monthlyIncome - inputs.monthlyExpenses;
  const expenseRatio = (inputs.monthlyExpenses / inputs.monthlyIncome) * 100;

  const warnings: string[] = [];

  if (expenseRatio > 80) {
    warnings.push('Your expenses are over 80% of your income. Consider reducing discretionary spending.');
  }

  if (expenseRatio > 90) {
    warnings.push('Critical: Expenses exceed 90% of income. Achieving your financial goal may be very difficult.');
  }

  if (remainingIncome < 0) {
    warnings.push('Your expenses exceed your income. Please review your budget.');
  }

  // Calculate optimal savings percentage based on age and goal
  let optimalSavingsPercentage = 25; // Default 25%

  if (inputs.age < 30) {
    optimalSavingsPercentage = 20;
  } else if (inputs.age >= 30 && inputs.age < 40) {
    optimalSavingsPercentage = 25;
  } else if (inputs.age >= 40 && inputs.age < 50) {
    optimalSavingsPercentage = 30;
  } else {
    optimalSavingsPercentage = 35;
  }

  // Adjust based on time horizon
  if (inputs.timePeriod < 5) {
    optimalSavingsPercentage = Math.min(optimalSavingsPercentage + 5, 40);
  }

  const maxSavings = Math.max(0, remainingIncome);
  const targetSavings = (inputs.monthlyIncome * optimalSavingsPercentage) / 100;
  const monthlySavings = Math.min(targetSavings, maxSavings);

  // Split: 30% emergency fund, 70% investment
  const emergencyFundPortion = monthlySavings * 0.3;
  const monthlyInvestment = monthlySavings * 0.7;

  return {
    remainingIncome,
    optimalSavingsPercentage,
    monthlySavings: emergencyFundPortion,
    monthlyInvestment,
    expenseRatio,
    warnings,
  };
}

export function calculateGoalFeasibility(
  monthlyInvestment: number,
  goalAmount: number,
  timePeriod: number,
  riskPreference: RiskPreference
): GoalFeasibility {
  const annualReturn = RISK_RETURNS[riskPreference];
  const monthlyReturn = annualReturn / 12;
  const months = timePeriod * 12;

  // Future Value of annuity formula: FV = PMT * [(1 + r)^n - 1] / r
  const projectedValue = monthlyInvestment *
    ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) *
    (1 + monthlyReturn);

  const isAchievable = projectedValue >= goalAmount;
  const shortfall = Math.max(0, goalAmount - projectedValue);
  const score = Math.min(100, (projectedValue / goalAmount) * 100);

  // Calculate suggested increase in monthly savings to meet goal
  let suggestedIncrease = 0;
  if (!isAchievable && monthlyInvestment > 0) {
    // PMT = FV * r / [(1 + r)^n - 1] / (1 + r)
    const requiredMonthly = goalAmount * monthlyReturn /
      ((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn));
    suggestedIncrease = requiredMonthly - monthlyInvestment;
  }

  // Calculate suggested timeline extension
  let suggestedExtension = 0;
  if (!isAchievable && monthlyInvestment > 0) {
    // n = log(FV * r / PMT + 1) / log(1 + r)
    const requiredMonths = Math.log(
      (goalAmount * monthlyReturn) / (monthlyInvestment * (1 + monthlyReturn)) + 1
    ) / Math.log(1 + monthlyReturn);
    suggestedExtension = Math.ceil((requiredMonths - months) / 12);
  }

  return {
    score: Math.round(score * 10) / 10,
    projectedValue: Math.round(projectedValue),
    isAchievable,
    shortfall: Math.round(shortfall),
    suggestedIncrease: Math.round(suggestedIncrease),
    suggestedExtension: Math.max(0, suggestedExtension),
  };
}

export function getDefaultAllocation(riskPreference: RiskPreference): InvestmentAllocation[] {
  switch (riskPreference) {
    case 'low':
      return [
        { name: 'Government Bonds', percentage: 40, expectedReturn: 4, color: 'hsl(217, 91%, 40%)' },
        { name: 'Fixed Deposits', percentage: 30, expectedReturn: 5, color: 'hsl(160, 84%, 39%)' },
        { name: 'PPF/Retirement Funds', percentage: 20, expectedReturn: 7, color: 'hsl(38, 92%, 50%)' },
        { name: 'Blue-chip Stocks', percentage: 10, expectedReturn: 8, color: 'hsl(280, 68%, 50%)' },
      ];
    case 'medium':
      return [
        { name: 'Index Funds', percentage: 35, expectedReturn: 10, color: 'hsl(217, 91%, 40%)' },
        { name: 'Balanced Mutual Funds', percentage: 30, expectedReturn: 9, color: 'hsl(160, 84%, 39%)' },
        { name: 'Corporate Bonds', percentage: 20, expectedReturn: 7, color: 'hsl(38, 92%, 50%)' },
        { name: 'Growth Stocks', percentage: 15, expectedReturn: 12, color: 'hsl(280, 68%, 50%)' },
      ];
    case 'high':
      return [
        { name: 'Growth Stocks', percentage: 40, expectedReturn: 14, color: 'hsl(217, 91%, 40%)' },
        { name: 'Equity Funds', percentage: 30, expectedReturn: 12, color: 'hsl(160, 84%, 39%)' },
        { name: 'Sector ETFs', percentage: 20, expectedReturn: 15, color: 'hsl(38, 92%, 50%)' },
        { name: 'Emerging Markets', percentage: 10, expectedReturn: 18, color: 'hsl(280, 68%, 50%)' },
      ];
  }
}

export function formatCurrency(amount: number): string {
  let currency = 'INR';
  let locale = 'en-IN';

  try {
    const stored = localStorage.getItem('ssp_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings.currency) {
        currency = settings.currency;
        if (currency === 'USD') locale = 'en-US';
        if (currency === 'EUR') locale = 'de-DE';
        if (currency === 'GBP') locale = 'en-GB';
        if (currency === 'JPY') locale = 'ja-JP';
      }
    }
  } catch (e) {
    // defaults
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}