import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/hooks/useGoals';
import { useFinancialPlans } from '@/hooks/useFinancialPlans';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/calculations';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, CreditCard, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subMonths, isSameMonth } from 'date-fns';
import { getCategoryIcon } from '@/components/ui/category-icon';
import { Sparkline } from '@/components/dashboard/Sparkline';
import { GamificationCard } from '@/components/dashboard/GamificationCard';
import { useMemo, useCallback } from 'react';
import { Sparkles as SparklesIcon } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, getExpenses, getIncome } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();
  const { plans } = useFinancialPlans();

  const totalIncome = getIncome().reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = getExpenses().reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  // Helper to get monthly data for sparklines
  const getMonthlyData = useCallback((type: 'income' | 'expense' | 'balance') => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      let amount = 0;

      if (type === 'balance') {
        const monthIncome = transactions
          .filter(t => t.type === 'income' && isSameMonth(new Date(t.date), date))
          .reduce((sum, t) => sum + t.amount, 0);
        const monthExpr = transactions
          .filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), date))
          .reduce((sum, t) => sum + t.amount, 0);
        amount = monthIncome - monthExpr;
      } else {
        amount = transactions
          .filter(t => t.type === type && isSameMonth(new Date(t.date), date))
          .reduce((sum, t) => sum + t.amount, 0);
      }
      data.push(amount);
    }
    return data;
  }, [transactions]);

  const incomeTrend = useMemo(() => getMonthlyData('income'), [transactions]);
  const expenseTrend = useMemo(() => getMonthlyData('expense'), [transactions]);
  // For balance sparkline, let's show net savings trend
  const balanceTrend = useMemo(() => getMonthlyData('balance'), [transactions]);

  // Gamification stats
  const goalsCompleted = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <MainLayout>
      <div className="container py-4 md:py-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/30 p-6 rounded-xl border border-muted/50">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's your financial overview for this month.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
            <Link to="/income">Add Transaction</Link>
          </Button>
        </div>

        {/* AI Smart Planner CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-primary p-8 text-white shadow-xl isolate">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4 backdrop-blur-md border border-white/20">
                <SparklesIcon className="h-4 w-4" />
                <span>New Feature</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Natural Language AI Planner</h2>
              <p className="text-white/80 max-w-xl text-lg">
                Don't want to calculate numbers? Just tell our completely private, local WebLLM what you want to achieve in a single sentence.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="whitespace-nowrap rounded-full px-8 shadow-2xl hover:scale-105 transition-transform">
              <Link to="/smart-plan" className="flex items-center gap-2 font-semibold">
                <SparklesIcon className="h-5 w-5" />
                Try AI Planner
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary/50 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on all transactions
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
              <Sparkline data={balanceTrend} color="hsl(var(--primary))" height={60} showTooltip={false} />
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500/50 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total earnings
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
              <Sparkline data={incomeTrend} color="#10b981" height={60} showTooltip={false} />
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500/50 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total spending
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
              <Sparkline data={expenseTrend} color="#ef4444" height={60} showTooltip={false} />
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-start">
          {/* Recent Transactions - Takes 4/7 columns */}
          <Card className="col-span-full lg:col-span-4 h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest financial activities.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transactions found.</p>
                ) : (
                  recentTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 p-2 rounded-lg transition-colors -mx-2">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'}`}>
                          {getCategoryIcon(t.category)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{t.category}</p>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-auto pt-4">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link to="/expenses">View All Expenses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Gamification & Budgets - Takes 3/7 columns */}
          <div className="col-span-full lg:col-span-3 flex flex-col gap-6">
            {/* Gamification Card */}
            <div className="w-full">
              <GamificationCard
                goalsCompleted={goalsCompleted}
                savingsRate={savingsRate}
                totalBudgets={budgets.length}
              />
            </div>

            {/* Budget & Goals Summary */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Budgets & Goals</CardTitle>
                <CardDescription>Quick look at your targets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Top Goals
                  </h4>
                  {goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="mb-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-muted-foreground">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                      </div>
                      <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2.5 rounded-full" />
                    </div>
                  ))}
                  {goals.length === 0 && <p className="text-xs text-muted-foreground">No goals set.</p>}
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Active Budgets
                  </h4>
                  {budgets.slice(0, 3).map(budget => (
                    <div key={budget.id} className="mb-4">
                      <div className="flex justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(budget.category)}
                          <span className="font-medium">{budget.category}</span>
                        </div>

                        <span className="text-muted-foreground">{formatCurrency(budget.limit)} limit</span>
                      </div>
                      {/* Placeholder value for now, in real app would need to calculate spent amount here or pass it down */}
                      <Progress value={30} className="h-2.5 rounded-full bg-muted" />
                    </div>
                  ))}
                  {budgets.length === 0 && <p className="text-xs text-muted-foreground">No budgets set.</p>}
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/budgets">Manage Budgets</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Financial Plans Section - Simplified/Visual */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Financial Plans</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/new-plan">Create New Plan</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.length === 0 ? (
              <Card className="col-span-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <p className="mb-4">You haven't created any financial plans yet.</p>
                  <Button asChild>
                    <Link to="/new-plan">Create Your First Plan</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              plans.map(plan => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>Goal: {plan.goalType.charAt(0).toUpperCase() + plan.goalType.slice(1)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Amount:</span>
                        <span className="font-medium">{formatCurrency(plan.goalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Savings:</span>
                        <span className="font-medium">{formatCurrency(plan.monthlySavings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Feasibility:</span>
                        <span className={`font-medium ${plan.isGoalAchievable ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {plan.isGoalAchievable ? 'Achievable' : 'Challenging'}
                        </span>
                      </div>
                      <Button variant="secondary" size="sm" className="w-full mt-4" asChild>
                        <Link to={`/plan/${plan.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div >
    </MainLayout >
  );
}