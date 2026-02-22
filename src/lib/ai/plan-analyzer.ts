/**
 * Local rule-based AI analysis engine.
 * Generates personalized financial insights without any API key or network call.
 */

export interface AIAnalysisResult {
  riskAssessment: string;
  recommendations: string;
  explanation: string;
}

interface AnalysisInput {
  inputs: {
    age: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    goalType: string;
    goalAmount: number;
    timePeriod: number;
    riskPreference: string;
  };
  savings: {
    expenseRatio: number;
    remainingIncome: number;
    monthlySavings: number;
    monthlyInvestment: number;
    optimalSavingsPercentage: number;
  };
  feasibility: {
    projectedValue: number;
    score: number;
    isAchievable: boolean;
    shortfall: number;
  };
  allocation: Array<{ name: string; percentage: number; expectedReturn: number }>;
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ─── Risk Assessment ──────────────────────────────────────────────────────────
function buildRiskAssessment(input: AnalysisInput): string {
  const { age, riskPreference, timePeriod, monthlyIncome, monthlyExpenses } = input.inputs;
  const savingsRate = monthlyIncome > 0
    ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    : 0;

  const parts: string[] = [];

  // Age-based risk context
  if (age < 30) {
    parts.push(`At ${age} years old you have a long investment horizon, which generally supports a higher risk tolerance.`);
  } else if (age < 45) {
    parts.push(`At ${age} years old you are in your prime earning years with a moderate investment horizon.`);
  } else {
    parts.push(`At ${age} years old, capital preservation becomes increasingly important as retirement approaches.`);
  }

  // Risk preference vs age alignment
  if (age < 35 && riskPreference === 'low') {
    parts.push(`A low-risk preference at your age may limit long-term growth potential — consider shifting 20–30% into equity funds to benefit from compounding.`);
  } else if (age > 50 && riskPreference === 'high') {
    parts.push(`A high-risk preference at ${age} carries significant volatility risk. A more balanced or conservative allocation is advisable to protect your corpus.`);
  } else {
    parts.push(`Your stated ${riskPreference} risk preference is well-aligned with your age and ${timePeriod}-year timeline.`);
  }

  // Savings rate note
  if (savingsRate < 10) {
    parts.push(`Your current savings rate of ${savingsRate.toFixed(1)}% leaves limited buffer — building an emergency fund before investing is recommended.`);
  } else if (savingsRate >= 30) {
    parts.push(`Your savings rate of ${savingsRate.toFixed(1)}% is excellent and gives you strong financial flexibility.`);
  }

  return parts.join(' ');
}

// ─── Recommendations ─────────────────────────────────────────────────────────
function buildRecommendations(input: AnalysisInput): string {
  const { riskPreference, timePeriod } = input.inputs;
  const { monthlyInvestment, monthlySavings } = input.savings;
  const topAlloc = [...input.allocation].sort((a, b) => b.percentage - a.percentage).slice(0, 2);

  const parts: string[] = [];

  parts.push(
    `Investing ${fmt(monthlyInvestment)} per month across ${topAlloc.map(a => a.name).join(' and ')} aligns well with your ${riskPreference} risk profile.`
  );

  if (riskPreference === 'low') {
    parts.push(`Debt mutual funds, PPF, and fixed deposits provide stable, predictable returns suitable for conservative investors with a ${timePeriod}-year horizon.`);
  } else if (riskPreference === 'medium') {
    parts.push(`A balanced mix of index funds and debt instruments captures market growth while limiting downside, ideal for a ${timePeriod}-year goal.`);
  } else {
    parts.push(`Equity-heavy portfolios perform best over ${timePeriod}+ years — diversify across large-cap, mid-cap, and international funds to manage volatility.`);
  }

  if (monthlySavings > 0) {
    parts.push(`Setting aside ${fmt(monthlySavings)} monthly into a liquid emergency fund before investing ensures you are never forced to redeem investments early.`);
  }

  parts.push(`Review and rebalance your portfolio every 6 months to maintain your target allocation as market conditions change.`);

  return parts.join(' ');
}

// ─── Goal Feasibility Explanation ────────────────────────────────────────────
function buildExplanation(input: AnalysisInput): string {
  const { goalAmount, goalType, timePeriod } = input.inputs;
  const { score, isAchievable, projectedValue, shortfall } = input.feasibility;
  const { monthlyInvestment } = input.savings;

  const parts: string[] = [];

  if (isAchievable) {
    parts.push(
      `Your ${goalType} goal of ${fmt(goalAmount)} has a strong feasibility score of ${score.toFixed(0)}% — at your current investment rate of ${fmt(monthlyInvestment)}/month, your portfolio is projected to reach ${fmt(projectedValue)} in ${timePeriod} years.`
    );
    if (score > 90) {
      parts.push(`You are well on track and may even reach your goal ahead of schedule if market returns exceed estimates.`);
    } else {
      parts.push(`Maintaining consistency in monthly contributions is key — even a single missed month can compound into a significant gap over ${timePeriod} years.`);
    }
  } else {
    parts.push(
      `Your ${goalType} goal of ${fmt(goalAmount)} currently has a feasibility score of ${score.toFixed(0)}% — at your current pace, the projected shortfall is ${fmt(shortfall)}.`
    );

    // Calculate what's needed
    const additionalMonthly = timePeriod > 0 ? shortfall / (timePeriod * 12) : shortfall;
    parts.push(
      `To close this gap, you would need to increase your monthly investment by approximately ${fmt(additionalMonthly)}, or extend your timeline by ${Math.ceil(shortfall / (monthlyInvestment * 12))} additional year(s).`
    );
    parts.push(`Alternatively, reducing discretionary expenses by 10–15% each month and redirecting those savings toward your goal could significantly improve this score over time.`);
  }

  return parts.join(' ');
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function analyzeFinancialPlan(
  payload: AnalysisInput
): Promise<AIAnalysisResult> {
  // Small async pause to give the UI a realistic "thinking" feel
  await new Promise((r) => setTimeout(r, 600));

  return {
    riskAssessment: buildRiskAssessment(payload),
    recommendations: buildRecommendations(payload),
    explanation: buildExplanation(payload),
  };
}
