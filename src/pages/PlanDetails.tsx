import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialPlans } from '@/hooks/useFinancialPlans';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { InvestmentGrowthChart } from '@/components/charts/InvestmentGrowthChart';
import { AllocationPieChart } from '@/components/charts/AllocationPieChart';
import { WhatIfScenario } from '@/components/planner/WhatIfScenario';
import { formatCurrency, formatPercentage, getDefaultAllocation } from '@/lib/calculations';
import { GOAL_TYPE_LABELS, RISK_LABELS, FinancialPlan } from '@/types/financial';
import {
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Target,
  Calendar,
  PiggyBank,
  Brain,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Download,
  FlaskConical
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PlanDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { plans, loading: plansLoading, deletePlan, updatePlan } = useFinancialPlans();
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || plansLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }

  const plan = plans.find(p => p.id === id);

  if (!plan) {
    return (
      <MainLayout showFooter={false}>
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Plan not found</h1>
          <p className="mt-2 text-muted-foreground">This plan doesn't exist or you don't have access to it.</p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const allocation = plan.investmentAllocation || getDefaultAllocation(plan.riskPreference);

  const handleDelete = async () => {
    await deletePlan(plan.id);
    navigate('/dashboard');
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      await updatePlan(plan.id, { name: newName.trim() });
    }
    setEditingName(false);
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-2 -ml-2 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="w-64"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl font-bold text-foreground">{plan.name}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setNewName(plan.name); setEditingName(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              {GOAL_TYPE_LABELS[plan.goalType]} · Created {new Date(plan.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <PiggyBank className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.monthlySavings !== null ? formatCurrency(plan.monthlySavings) : 'N/A'}
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
                    {plan.monthlyInvestment !== null ? formatCurrency(plan.monthlyInvestment) : 'N/A'}
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
                    {plan.projectedValue !== null ? formatCurrency(plan.projectedValue) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${plan.isGoalAchievable
              ? 'from-accent/10 to-accent/5'
              : 'from-warning/10 to-warning/5'
            }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${plan.isGoalAchievable ? 'bg-accent/20' : 'bg-warning/20'
                  }`}>
                  {plan.isGoalAchievable ? (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goal Feasibility</p>
                  <p className={`text-2xl font-bold ${plan.goalFeasibilityScore !== null && plan.goalFeasibilityScore >= 80
                      ? 'text-accent'
                      : plan.goalFeasibilityScore !== null && plan.goalFeasibilityScore >= 50
                        ? 'text-warning'
                        : 'text-destructive'
                    }`}>
                    {plan.goalFeasibilityScore !== null ? formatPercentage(plan.goalFeasibilityScore) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="allocation" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="whatif" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              What-If
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="font-semibold text-foreground">{formatCurrency(plan.monthlyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                    <p className="font-semibold text-foreground">{formatCurrency(plan.monthlyExpenses)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold text-foreground">{plan.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Profile</p>
                    <p className="font-semibold text-foreground">{RISK_LABELS[plan.riskPreference]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Goal</p>
                    <p className="font-semibold text-foreground">{GOAL_TYPE_LABELS[plan.goalType]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="font-semibold text-foreground">{formatCurrency(plan.goalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold text-foreground">{plan.timePeriod} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Rate</p>
                    <p className="font-semibold text-foreground">
                      {plan.savingsPercentage !== null ? formatPercentage(plan.savingsPercentage) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Income vs Expenses</CardTitle>
                  <CardDescription>Your monthly financial breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeExpenseChart
                    income={plan.monthlyIncome}
                    expenses={plan.monthlyExpenses}
                    savings={plan.monthlySavings || 0}
                    investment={plan.monthlyInvestment || 0}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investment Growth Projection</CardTitle>
                  <CardDescription>Projected growth over {plan.timePeriod} years</CardDescription>
                </CardHeader>
                <CardContent>
                  <InvestmentGrowthChart
                    monthlyInvestment={plan.monthlyInvestment || 0}
                    years={plan.timePeriod}
                    riskPreference={plan.riskPreference}
                    goalAmount={plan.goalAmount}
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
                  Based on your {RISK_LABELS[plan.riskPreference].toLowerCase()} preference
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
            {plan.aiRiskAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-primary" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{plan.aiRiskAssessment}</p>
                </CardContent>
              </Card>
            )}

            {plan.aiRecommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Investment Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{plan.aiRecommendations}</p>
                </CardContent>
              </Card>
            )}

            {plan.aiExplanation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Goal Feasibility Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{plan.aiExplanation}</p>
                </CardContent>
              </Card>
            )}

            {!plan.aiRiskAssessment && !plan.aiRecommendations && !plan.aiExplanation && (
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

          <TabsContent value="whatif">
            <WhatIfScenario plan={plan} />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{plan.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}