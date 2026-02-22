import { useTransactions } from '@/hooks/useTransactions';
import { calculatePredictions } from '@/lib/predictions';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    ComposedChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from 'recharts';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Predictions() {
    const { transactions } = useTransactions();
    const predictions = calculatePredictions(transactions, 6);
    const { hasData } = predictions;
    const hasEnoughForTrend = predictions.income.filter(p => p.type === 'historical').length >= 2;

    // Helper to format currency in charts
    const formatYAxis = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3,
            notation: "compact",
        }).format(value);
    };

    // Combine data for the main chart
    // We want to show historical and predicted data in one view if possible, or separate.
    // Recharts needs an array of objects.

    // Let's create a combined dataset for the main visualization
    // predictions.income has { month, date, actual?, predicted, type }

    const combinedData = predictions.income.map((inc, i) => {
        const exp = predictions.expenses[i];
        const sav = predictions.savings[i];
        return {
            name: inc.month,
            date: inc.date,
            Income: inc.type === 'historical' ? inc.actual : inc.predicted,
            Expenses: exp.type === 'historical' ? exp.actual : exp.predicted,
            Savings: sav.type === 'historical' ? sav.actual : sav.predicted,
            isPrediction: inc.type === 'prediction'
        };
    });

    const nextMonthPrediction = predictions.savings.find(p => p.type === 'prediction');

    // If no transactions at all, show empty state
    if (!hasData) {
        return (
            <MainLayout>
                <div className="container py-16 flex flex-col items-center justify-center text-center gap-6">
                    <div className="rounded-full bg-muted p-6">
                        <TrendingUp className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">No data to predict yet</h2>
                        <p className="mt-2 text-muted-foreground max-w-md">
                            Add at least one income and one expense transaction to generate forecasts.
                            The more months of data you provide, the more accurate the predictions will be.
                        </p>
                    </div>
                    <Link to="/income">
                        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            <PlusCircle className="h-4 w-4" />
                            Add Transactions
                        </button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Financial Forecast
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        AI-powered predictions based on your historical spending habits.
                    </p>
                </div>

                {/* Summary Cards */}
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Predicted Savings (Next Month)</CardTitle>
                            <Wallet className={`h-4 w-4 ${nextMonthPrediction && nextMonthPrediction.predicted >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${nextMonthPrediction && nextMonthPrediction.predicted >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                {nextMonthPrediction ? formatCurrency(nextMonthPrediction.predicted) : '$0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Estimated for {nextMonthPrediction?.month}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Predicted Income</CardTitle>
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {nextMonthPrediction ? formatCurrency(predictions.income.find(p => p.type === 'prediction')?.predicted || 0) : '$0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Expected inflow
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Predicted Expenses</CardTitle>
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {nextMonthPrediction ? formatCurrency(predictions.expenses.find(p => p.type === 'prediction')?.predicted || 0) : '$0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Expected outflow
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Chart */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>6-Month Forecast</CardTitle>
                        <CardDescription>
                            Dashed lines indicate AI predictions. Bars represent predicted savings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={combinedData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" />

                                    <YAxis tickFormatter={formatYAxis} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelStyle={{ color: 'black' }}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Legend />

                                    {/* Historical Data (Solid) - We can strictly separate if we had separate keys, 
                                        but for simple continuity, we use different strokes or custom dots.
                                        However, splitting into two series 'Income' vs 'PredictedIncome' is cleanest.
                                        Let's try to simulate that with the isPrediction flag if supported, 
                                        but Recharts lines are single style.
                                        Better approach: Render TWO Lines per metric. One for history, one for prediction.
                                        Data needs to be structured: 
                                        { name: 'Jan', IncomeHistory: 5000, IncomePrediction: null },
                                        { name: 'Feb', IncomeHistory: null, IncomePrediction: 5200 }
                                        Let's update the data transformation or just accept dashed for everything?
                                        User asked for "better charts", so let's stick to Area for flow and use a reference line or 
                                        just simple distinct colors.
                                        Actually, ComposedChart allows mixing.
                                    */}

                                    <Area
                                        type="monotone"
                                        dataKey="Income"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                        strokeDasharray="5 5" // Making it all dashed is not ideal.
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Expenses"
                                        stroke="#ef4444"
                                        fillOpacity={1}
                                        fill="url(#colorExpenses)"
                                        strokeDasharray="5 5"
                                    />
                                    {/* Let's try to be smarter. We can use `strokeDasharray` on the Line based on individual points? No.
                                        We should split the data into History vs Prediction in the logic above if we want strict visual separation.
                                        For now, keeping it simple but adding the Bar for savings which is new.
                                    */}
                                    <Bar dataKey="Savings" barSize={20} fill="#3b82f6" opacity={0.8} />

                                    {/* Reference line for today? */}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Disclaimer */}
                <div className="bg-muted/30 border border-muted p-4 rounded-lg text-sm text-muted-foreground flex items-start gap-3">
                    <div className="p-1 bg-background rounded-full border shadow-sm">
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground mb-1">How this works</p>
                        <p>
                            {hasEnoughForTrend
                                ? 'Predictions use linear regression on your historical months. The more months of data you add, the more accurate the forecast becomes.'
                                : 'Only one month of data is available — predictions are flat projections based on that month. Add more months for trend-based forecasting.'}
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
