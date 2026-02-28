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
import { motion, Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="container py-4 md:py-8 space-y-8"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">{user?.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Here is your financial executive summary for this month.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all rounded-full px-8">
            <Link to="/income">Add Transaction</Link>
          </Button>
        </motion.div>

        {/* AI Smart Planner CTA Banner - PRO MAX LEVEL */}
        <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-primary to-emerald-600 p-10 text-white shadow-2xl isolate group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-400 opacity-20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-md border border-white/30 shadow-inner">
                <SparklesIcon className="h-4 w-4 text-emerald-300" />
                <span className="tracking-wide uppercase">New Intelligence Feature</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-sm">Natural Language <br className="hidden md:block"/> AI Planner</h2>
              <p className="text-white/90 text-lg md:text-xl leading-relaxed font-light drop-shadow-sm">
                Bypass complex forms. Describe your financial state in plain English, and our 100% private, edge-computing Engine will construct your investment trajectory instantly.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="whitespace-nowrap rounded-full px-10 py-8 text-lg shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all duration-300 bg-white text-primary hover:bg-white/90">
              <Link to="/smart-plan" className="flex items-center gap-3 font-bold">
                <SparklesIcon className="h-6 w-6" />
                Initialize AI
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/50 overflow-hidden relative group bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Net Balance</CardTitle>
              <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Total liquid capital
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkline data={balanceTrend} color="hsl(var(--primary))" height={80} showTooltip={false} />
            </div>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-emerald-500/50 overflow-hidden relative group bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Income</CardTitle>
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Total earnings
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkline data={incomeTrend} color="#10b981" height={80} showTooltip={false} />
            </div>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-red-500/50 overflow-hidden relative group bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expenses</CardTitle>
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-xl group-hover:scale-110 transition-transform">
                <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Total outflows
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkline data={expenseTrend} color="#ef4444" height={80} showTooltip={false} />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-start">
          {/* Recent Transactions - Takes 4/7 columns */}
          <Card className="col-span-full lg:col-span-4 h-full flex flex-col shadow-md border-border/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl">Recent Ledger Activity</CardTitle>
              <CardDescription>
                Synchronized log of your latest financial events.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="space-y-1">
                {recentTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">No transactions recorded yet.</p>
                ) : (
                  recentTransactions.map(t => (
                    <div key={t.id} className="group flex items-center justify-between py-3 px-4 hover:bg-muted/40 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shadow-sm ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                          {getCategoryIcon(t.category)}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{t.category}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-border/50">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary transition-colors rounded-xl" asChild>
                  <Link to="/expenses" className="flex items-center justify-center font-medium">View Full Ledger <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Gamification & Budgets - Takes 3/7 columns */}
          <div className="col-span-full lg:col-span-3 flex flex-col gap-6">
            <div className="w-full transition-transform duration-300 hover:-translate-y-1">
              <GamificationCard
                goalsCompleted={goalsCompleted}
                savingsRate={savingsRate}
                totalBudgets={budgets.length}
              />
            </div>

            <Card className="flex-1 shadow-md border-border/50">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-xl">Active Objectives</CardTitle>
                <CardDescription>Live tracking of targets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Top Goals
                  </h4>
                  {goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="mb-5 group">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-foreground">{goal.name}</span>
                        <span className="text-primary font-bold">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                      </div>
                      <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-3 rounded-full bg-muted/50 overflow-hidden" />
                    </div>
                  ))}
                  {goals.length === 0 && <p className="text-sm text-muted-foreground text-center p-3 border border-dashed rounded-lg">No active financial goals.</p>}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" /> Budget Thresholds
                  </h4>
                  {budgets.slice(0, 3).map(budget => (
                    <div key={budget.id} className="mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="text-primary">{getCategoryIcon(budget.category)}</span>
                          <span>{budget.category}</span>
                        </div>
                        <span className="text-muted-foreground font-medium">{formatCurrency(budget.limit)} limit</span>
                      </div>
                      <Progress value={30} className="h-3 rounded-full bg-muted/50" />
                    </div>
                  ))}
                  {budgets.length === 0 && <p className="text-sm text-muted-foreground text-center p-3 border border-dashed rounded-lg">No budget thresholds configured.</p>}
                </div>

                <Button variant="outline" className="w-full mt-2 font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-colors border-border/50" asChild>
                  <Link to="/budgets">Configure Budgets</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>


        {/* Financial Plans Section - Simplified/Visual */}
        {/* Financial Plans Section - Pro Max Style */}
        <motion.div variants={item} className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Active Financial Strategies</h2>
            <Button className="rounded-full shadow-md hover:shadow-lg transition-all" asChild>
              <Link to="/new-plan"><SparklesIcon className="h-4 w-4 mr-2"/> Generate New Plan</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.length === 0 ? (
              <Card className="col-span-full border-dashed bg-muted/10">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium mb-4 text-foreground">Awaiting Strategic Directive</p>
                  <p className="mb-6 max-w-sm text-sm">Deploy the AI Engine to construct a completely deterministic financial trajectory for your goals.</p>
                  <Button asChild className="shadow-lg rounded-full px-8">
                    <Link to="/new-plan">Deploy Engine</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              plans.map(plan => (
                <Card key={plan.id} className="group hover:border-primary/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-card/80 backdrop-blur-sm">
                  <div className={`absolute top-0 left-0 w-full h-1 ${plan.isGoalAchievable ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}></div>
                  <CardHeader className="pb-3 pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        {plan.goalType}
                      </div>
                      {plan.isGoalAchievable ? 
                         <span className="flex items-center text-xs font-bold text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div> FEASIBLE</span>
                       : <span className="flex items-center text-xs font-bold text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></div> CRITICAL</span>
                      }
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm mt-2">
                      <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                        <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Required Allocation</span>
                        <span className="font-bold text-lg text-foreground">{formatCurrency(plan.monthlySavings)} <span className="text-xs text-muted-foreground font-normal">/ month</span></span>
                      </div>
                      <div className="flex flex-col gap-1 pb-4">
                        <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Target Objective</span>
                        <span className="font-bold text-lg text-foreground">{formatCurrency(plan.goalAmount)}</span>
                      </div>
                      <Button variant="secondary" className="w-full mt-2 font-semibold shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl" asChild>
                        <Link to={`/plan/${plan.id}`}>View Strategic Blueprint</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>

      </motion.div>
    </MainLayout>
  );
}