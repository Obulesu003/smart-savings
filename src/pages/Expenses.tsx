import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/calculations';
import { Plus, Trash2, PieChart as PieIcon, CreditCard, ShoppingBag, Coffee, Home, Car, Zap, Smartphone, Utensils, Plane, Gift, GraduationCap, HeartPulse, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('shop') || lower.includes('clothes')) return <ShoppingBag className="h-4 w-4" />;
    if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant')) return <Utensils className="h-4 w-4" />;
    if (lower.includes('coffee')) return <Coffee className="h-4 w-4" />;
    if (lower.includes('home') || lower.includes('rent') || lower.includes('bill')) return <Home className="h-4 w-4" />;
    if (lower.includes('transport') || lower.includes('car') || lower.includes('fuel')) return <Car className="h-4 w-4" />;
    if (lower.includes('utility') || lower.includes('electric') || lower.includes('water')) return <Zap className="h-4 w-4" />;
    if (lower.includes('phone') || lower.includes('internet')) return <Smartphone className="h-4 w-4" />;
    if (lower.includes('travel') || lower.includes('trip')) return <Plane className="h-4 w-4" />;
    if (lower.includes('gift') || lower.includes('donation')) return <Gift className="h-4 w-4" />;
    if (lower.includes('education') || lower.includes('course')) return <GraduationCap className="h-4 w-4" />;
    if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor')) return <HeartPulse className="h-4 w-4" />;
    return <HelpCircle className="h-4 w-4" />;
};

export default function Expenses() {
    const { transactions, addTransaction, deleteTransaction, getExpenses } = useTransactions();
    const { expenseCategories, addCategory } = useCategories();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [notes, setNotes] = useState('');
    const [isFixed, setIsFixed] = useState(false);

    // New Category State
    const [newCategoryName, setNewCategoryName] = useState('');

    const expenses = getExpenses();

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        addTransaction({
            type: 'expense',
            amount: parseFloat(amount),
            category,
            date,
            notes,
            isFixed,
        });
        setIsDialogOpen(false);
        resetForm();
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        addCategory('expense', newCategoryName);
        setCategory(newCategoryName);
        setIsCategoryDialogOpen(false);
        setNewCategoryName('');
    };

    const resetForm = () => {
        setAmount('');
        setCategory('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setNotes('');
        setIsFixed(false);
    };

    // Calculations for charts
    const fixedExpenses = expenses.filter(t => t.isFixed).reduce((sum, t) => sum + t.amount, 0);
    const variableExpenses = expenses.filter(t => !t.isFixed).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = fixedExpenses + variableExpenses;

    const typeData = [
        { name: 'Fixed', value: fixedExpenses },
        { name: 'Variable', value: variableExpenses },
    ].filter(d => d.value > 0);

    const categoryData = expenseCategories.map(cat => ({
        name: cat,
        value: expenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
    })).filter(d => d.value > 0);

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Expense Tracker
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage your spending and categorize expenses.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Expense</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            className="text-lg font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <div className="flex gap-2">
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {expenseCategories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" type="button" title="Add new category">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>New Category</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <Input
                                                        placeholder="Category Name"
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                    />
                                                    <Button onClick={handleAddCategory} type="button" className="w-full">
                                                        Create Category
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                                    <Switch
                                        id="isFixed"
                                        checked={isFixed}
                                        onCheckedChange={setIsFixed}
                                    />
                                    <div className="flex-1 cursor-pointer" onClick={() => setIsFixed(!isFixed)}>
                                        <Label htmlFor="isFixed" className="cursor-pointer font-medium">Fixed Expense</Label>
                                        <p className="text-xs text-muted-foreground">Recurring bills like rent, subscriptions, etc.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Description (optional)"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                                    <Input
                                        id="attachment"
                                        type="file"
                                        className="cursor-pointer text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                </div>

                                <Button type="submit" className="w-full text-lg h-12">
                                    Save Expense
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {expenses.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {expenses.length} transactions recorded
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 lg:col-span-2 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Expense Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px] flex flex-col md:flex-row items-center justify-around gap-4">
                                <div className="h-full w-full md:w-1/2 flex flex-col items-center">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">By Type</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={typeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {typeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-full w-full md:w-1/2 flex flex-col items-center">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">By Category</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cat-${index}`} fill={COLORS[(index + 2) % COLORS.length]} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Expenses</CardTitle>
                    </CardHeader>
                    <div className="rounded-md border mx-6 mb-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No expenses recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    expenses.map((t) => (
                                        <TableRow key={t.id} className="group hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium text-muted-foreground">{format(new Date(t.date), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-full bg-secondary text-secondary-foreground">
                                                        {getCategoryIcon(t.category)}
                                                    </div>
                                                    <span>{t.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${t.isFixed ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
                                                    {t.isFixed ? 'Fixed' : 'Variable'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{t.notes}</TableCell>
                                            <TableCell className="text-right font-medium text-destructive">
                                                -{formatCurrency(t.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteTransaction(t.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
