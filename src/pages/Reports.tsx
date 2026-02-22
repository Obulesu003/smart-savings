import { useTransactions } from '@/hooks/useTransactions';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/calculations';
import { Download, BarChart2, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function Reports() {
    const { transactions } = useTransactions();
    const [timeRange, setTimeRange] = useState('6'); // 6 months

    const generateReportData = () => {
        const data = [];
        const today = new Date();

        for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
            const date = subMonths(today, i);
            const monthKey = format(date, 'yyyy-MM');
            const label = format(date, 'MMM yyyy');

            const monthlyTransactions = transactions.filter(t =>
                t.date.startsWith(monthKey)
            );

            const income = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            data.push({
                name: label,
                Income: income,
                Expenses: expense,
                Savings: income - expense
            });
        }
        return data;
    };

    const reportData = generateReportData();

    const handleExport = () => {
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes', 'Is Fixed'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                t.date,
                t.type,
                t.category,
                t.amount,
                `"${t.notes || ''}"`,
                t.isFixed ? 'Yes' : 'No'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_data_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Financial Reports
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Analyze your financial health over time.
                        </p>
                    </div>
                    <Button onClick={handleExport} className="gap-2 w-full md:w-auto">
                        <Download className="h-4 w-4" />
                        Export Data (CSV)
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(reportData.reduce((sum, d) => sum + d.Income, 0))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                For selected period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(reportData.reduce((sum, d) => sum + d.Expenses, 0))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                For selected period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(reportData.reduce((sum, d) => sum + d.Savings, 0))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(() => {
                                    const totalIncome = reportData.reduce((sum, d) => sum + d.Income, 0);
                                    const totalSavings = reportData.reduce((sum, d) => sum + d.Savings, 0);
                                    const rate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;
                                    return `Savings Rate: ${rate}%`;
                                })()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {/* Main Trend Chart */}
                    <Card className="col-span-full lg:col-span-2 hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Income vs Expenses</CardTitle>
                                    <CardDescription className="mt-1">
                                        Comparative view of your monthly cash flow.
                                    </CardDescription>
                                </div>
                                <Select value={timeRange} onValueChange={setTimeRange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">Last 3 Months</SelectItem>
                                        <SelectItem value="6">Last 6 Months</SelectItem>
                                        <SelectItem value="12">Last 12 Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={reportData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    <Line type="monotone" dataKey="Savings" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category Pie Chart */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>Spending by Category</CardTitle>
                            <CardDescription>Where your money went this period.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            {(() => {
                                // Calculate category data based on current timeRange
                                const today = new Date();
                                const rangeMonths = parseInt(timeRange);
                                const cutoffDate = subMonths(today, rangeMonths - 1); // rough cutoff

                                const filteredTransactions = transactions.filter(t => {
                                    const tDate = new Date(t.date);
                                    // Simple check if within range (ignoring day precision strictly for summary)
                                    return t.type === 'expense' && tDate >= startOfMonth(cutoffDate);
                                });

                                const categoryMap = filteredTransactions.reduce((acc, t) => {
                                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                                    return acc;
                                }, {} as Record<string, number>);

                                const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
                                // Sort by value
                                pieData.sort((a, b) => b.value - a.value);

                                const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];

                                if (pieData.length === 0) return <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>;

                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} stroke="hsl(var(--card))" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ borderRadius: '8px' }}
                                            />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Net Savings Rate (Avg)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {(() => {
                                        const totalIncome = reportData.reduce((sum, d) => sum + d.Income, 0);
                                        const totalSavings = reportData.reduce((sum, d) => sum + d.Savings, 0);
                                        return totalIncome > 0 ? `${Math.round((totalSavings / totalIncome) * 100)}%` : '0%';
                                    })()}
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Average rate over the selected period</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Highest Expense Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {(() => {
                                        const maxExpense = Math.max(...reportData.map(d => d.Expenses));
                                        const month = reportData.find(d => d.Expenses === maxExpense)?.name || '-';
                                        return month;
                                    })()}
                                </div>
                                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                                    <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(() => {
                                    const maxExpense = Math.max(...reportData.map(d => d.Expenses));
                                    return `${formatCurrency(maxExpense)}`;
                                })()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Highest Income Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">
                                    {(() => {
                                        const maxIncome = Math.max(...reportData.map(d => d.Income));
                                        const month = reportData.find(d => d.Income === maxIncome)?.name || '-';
                                        return month;
                                    })()}
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                    <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(() => {
                                    const maxIncome = Math.max(...reportData.map(d => d.Income));
                                    return `${formatCurrency(maxIncome)}`;
                                })()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </MainLayout>
    );
}
