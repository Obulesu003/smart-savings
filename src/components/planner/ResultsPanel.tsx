import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FinancialInputs, 
  InvestmentAllocation,
  GOAL_TYPE_LABELS,
  RISK_LABELS
} from '@/types/financial';
import { 
  SavingsCalculation, 
  GoalFeasibility,
  formatCurrency, 
  formatPercentage 
} from '@/lib/calculations';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { InvestmentGrowthChart } from '@/components/charts/InvestmentGrowthChart';
import { AllocationPieChart } from '@/components/charts/AllocationPieChart';
import { 
  ArrowLeft, 
  Save, 
  TrendingUp, 
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Brain,
  PiggyBank,
  BarChart3,
  Download
} from 'lucide-react';

interface ResultsPanelProps {
  inputs: FinancialInputs;
  savings: SavingsCalculation;
  feasibility: GoalFeasibility;
  allocation: InvestmentAllocation[];
  aiExplanation: string;
  aiRecommendations: string;
  aiRiskAssessment: string;
  onSave: (name: string) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function ResultsPanel({
  inputs,
  savings,
  feasibility,
  allocation,
  aiExplanation,
  aiRecommendations,
  aiRiskAssessment,
  onSave,
  onBack,
  isSaving,
}: ResultsPanelProps) {
  const [planName, setPlanName] = useState(`${GOAL_TYPE_LABELS[inputs.goalType]} Plan`);

  const handleSave = () => {
    onSave(planName);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Your Financial Plan
          </h1>
          <p className="mt-1 text-muted-foreground">
            AI-powered recommendations based on your profile
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Plan name"
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
            Save Plan
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(savings.monthlySavings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Investment</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(savings.monthlyInvestment)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(feasibility.projectedValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${
          feasibility.isAchievable 
            ? 'from-accent/10 to-accent/5' 
            : 'from-warning/10 to-warning/5'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                feasibility.isAchievable ? 'bg-accent/20' : 'bg-warning/20'
              }`}>
                {feasibility.isAchievable ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Feasibility</p>
                <p className={`text-2xl font-bold ${
                  feasibility.score >= 80 ? 'text-accent' : 
                  feasibility.score >= 50 ? 'text-warning' : 'text-destructive'
                }`}>
                  {formatPercentage(feasibility.score)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {savings.warnings.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="space-y-2">
                {savings.warnings.map((warning, i) => (
                  <p key={i} className="text-sm text-foreground">{warning}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Not Achievable Suggestions */}
      {!feasibility.isAchievable && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              Suggestions to Reach Your Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your current plan shows a shortfall of {formatCurrency(feasibility.shortfall)}. 
              Here are some options:
            </p>
            <ul className="space-y-2 text-sm">
              {feasibility.suggestedIncrease > 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                  <span>
                    Increase monthly investment by{' '}
                    <strong className="text-primary">{formatCurrency(feasibility.suggestedIncrease)}</strong>
                  </span>
                </li>
              )}
              {feasibility.suggestedExtension > 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                  <span>
                    Extend your timeline by{' '}
                    <strong className="text-primary">{feasibility.suggestedExtension} years</strong>
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />
                <span>
                  Consider a higher risk profile for potentially better returns
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Details */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="allocation" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income vs Expenses</CardTitle>
                <CardDescription>Your monthly financial breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart
                  income={inputs.monthlyIncome}
                  expenses={inputs.monthlyExpenses}
                  savings={savings.monthlySavings}
                  investment={savings.monthlyInvestment}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Growth Projection</CardTitle>
                <CardDescription>
                  Projected growth over {inputs.timePeriod} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentGrowthChart
                  monthlyInvestment={savings.monthlyInvestment}
                  years={inputs.timePeriod}
                  riskPreference={inputs.riskPreference}
                  goalAmount={inputs.goalAmount}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Portfolio Allocation</CardTitle>
              <CardDescription>
                Based on your {RISK_LABELS[inputs.riskPreference].toLowerCase()} preference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <AllocationPieChart allocation={allocation} />
                <div className="space-y-4">
                  {allocation.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">{item.percentage}%</span>
                        <p className="text-xs text-muted-foreground">
                          ~{item.expectedReturn}% annual return
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {aiRiskAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-primary" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{aiRiskAssessment}</p>
              </CardContent>
            </Card>
          )}

          {aiRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Investment Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{aiRecommendations}</p>
              </CardContent>
            </Card>
          )}

          {aiExplanation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Goal Feasibility Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{aiExplanation}</p>
              </CardContent>
            </Card>
          )}

          {!aiRiskAssessment && !aiRecommendations && !aiExplanation && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  AI insights are not available for this plan.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="font-semibold text-foreground">{GOAL_TYPE_LABELS[inputs.goalType]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Amount</p>
              <p className="font-semibold text-foreground">{formatCurrency(inputs.goalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timeline</p>
              <p className="font-semibold text-foreground">{inputs.timePeriod} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Profile</p>
              <p className="font-semibold text-foreground">{RISK_LABELS[inputs.riskPreference]}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}