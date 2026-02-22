import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FinancialPlan, RiskPreference, RISK_LABELS } from '@/types/financial';
import { calculateSavings, calculateGoalFeasibility, formatCurrency, formatPercentage } from '@/lib/calculations';
import { InvestmentGrowthChart } from '@/components/charts/InvestmentGrowthChart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FlaskConical, RefreshCw, TrendingUp, Target, ArrowRight } from 'lucide-react';

interface WhatIfScenarioProps {
  plan: FinancialPlan;
}

export function WhatIfScenario({ plan }: WhatIfScenarioProps) {
  const [income, setIncome] = useState(plan.monthlyIncome);
  const [expenses, setExpenses] = useState(plan.monthlyExpenses);
  const [timePeriod, setTimePeriod] = useState(plan.timePeriod);
  const [goalAmount, setGoalAmount] = useState(plan.goalAmount);
  const [risk, setRisk] = useState<RiskPreference>(plan.riskPreference);

  const originalSavings = calculateSavings({
    monthlyIncome: plan.monthlyIncome,
    monthlyExpenses: plan.monthlyExpenses,
    age: plan.age,
    goalType: plan.goalType,
    goalAmount: plan.goalAmount,
    timePeriod: plan.timePeriod,
    riskPreference: plan.riskPreference,
  });

  const originalFeasibility = calculateGoalFeasibility(
    originalSavings.monthlyInvestment,
    plan.goalAmount,
    plan.timePeriod,
    plan.riskPreference
  );

  const scenarioSavings = calculateSavings({
    monthlyIncome: income,
    monthlyExpenses: expenses,
    age: plan.age,
    goalType: plan.goalType,
    goalAmount: goalAmount,
    timePeriod: timePeriod,
    riskPreference: risk,
  });

  const scenarioFeasibility = calculateGoalFeasibility(
    scenarioSavings.monthlyInvestment,
    goalAmount,
    timePeriod,
    risk
  );

  const handleReset = () => {
    setIncome(plan.monthlyIncome);
    setExpenses(plan.monthlyExpenses);
    setTimePeriod(plan.timePeriod);
    setGoalAmount(plan.goalAmount);
    setRisk(plan.riskPreference);
  };

  const hasChanges = 
    income !== plan.monthlyIncome ||
    expenses !== plan.monthlyExpenses ||
    timePeriod !== plan.timePeriod ||
    goalAmount !== plan.goalAmount ||
    risk !== plan.riskPreference;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5 text-primary" />
                What-If Scenario Analysis
              </CardTitle>
              <CardDescription>
                Adjust variables to see how changes affect your plan
              </CardDescription>
            </div>
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adjustable Variables */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Monthly Income</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monthly Expenses</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Goal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <Label>Timeline</Label>
                <span className="text-sm font-medium text-primary">{timePeriod} years</span>
              </div>
              <Slider
                value={[timePeriod]}
                onValueChange={([value]) => setTimePeriod(value)}
                min={1}
                max={40}
                step={1}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label>Risk Preference</Label>
              <RadioGroup
                value={risk}
                onValueChange={(value) => setRisk(value as RiskPreference)}
                className="flex gap-4"
              >
                {(['low', 'medium', 'high'] as RiskPreference[]).map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                      risk === r
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={r} />
                    <span className="text-sm font-medium">{RISK_LABELS[r]}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Original Plan */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Original Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Investment</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(originalSavings.monthlyInvestment)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Value</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(originalFeasibility.projectedValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feasibility Score</p>
                <p className={`text-xl font-bold ${
                  originalFeasibility.score >= 80 ? 'text-accent' : 
                  originalFeasibility.score >= 50 ? 'text-warning' : 'text-destructive'
                }`}>
                  {formatPercentage(originalFeasibility.score)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Status</p>
                <p className={`text-xl font-bold ${
                  originalFeasibility.isAchievable ? 'text-accent' : 'text-warning'
                }`}>
                  {originalFeasibility.isAchievable ? 'Achievable' : 'At Risk'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario */}
        <Card className={hasChanges ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {hasChanges && <FlaskConical className="h-5 w-5 text-primary" />}
              {hasChanges ? 'Modified Scenario' : 'Scenario (No Changes)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Investment</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(scenarioSavings.monthlyInvestment)}
                  </p>
                  {hasChanges && scenarioSavings.monthlyInvestment !== originalSavings.monthlyInvestment && (
                    <span className={`text-xs font-medium ${
                      scenarioSavings.monthlyInvestment > originalSavings.monthlyInvestment 
                        ? 'text-accent' : 'text-destructive'
                    }`}>
                      {scenarioSavings.monthlyInvestment > originalSavings.monthlyInvestment ? '+' : ''}
                      {formatCurrency(scenarioSavings.monthlyInvestment - originalSavings.monthlyInvestment)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Value</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(scenarioFeasibility.projectedValue)}
                  </p>
                  {hasChanges && scenarioFeasibility.projectedValue !== originalFeasibility.projectedValue && (
                    <span className={`text-xs font-medium ${
                      scenarioFeasibility.projectedValue > originalFeasibility.projectedValue 
                        ? 'text-accent' : 'text-destructive'
                    }`}>
                      {scenarioFeasibility.projectedValue > originalFeasibility.projectedValue ? '+' : ''}
                      {formatCurrency(scenarioFeasibility.projectedValue - originalFeasibility.projectedValue)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feasibility Score</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-bold ${
                    scenarioFeasibility.score >= 80 ? 'text-accent' : 
                    scenarioFeasibility.score >= 50 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {formatPercentage(scenarioFeasibility.score)}
                  </p>
                  {hasChanges && scenarioFeasibility.score !== originalFeasibility.score && (
                    <span className={`text-xs font-medium ${
                      scenarioFeasibility.score > originalFeasibility.score 
                        ? 'text-accent' : 'text-destructive'
                    }`}>
                      {scenarioFeasibility.score > originalFeasibility.score ? '+' : ''}
                      {(scenarioFeasibility.score - originalFeasibility.score).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Status</p>
                <p className={`text-xl font-bold ${
                  scenarioFeasibility.isAchievable ? 'text-accent' : 'text-warning'
                }`}>
                  {scenarioFeasibility.isAchievable ? 'Achievable' : 'At Risk'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Chart */}
      {hasChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scenario Projection</CardTitle>
            <CardDescription>
              Investment growth with modified variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestmentGrowthChart
              monthlyInvestment={scenarioSavings.monthlyInvestment}
              years={timePeriod}
              riskPreference={risk}
              goalAmount={goalAmount}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}