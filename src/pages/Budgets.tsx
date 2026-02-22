import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardTitle,
} from '@/components/ui/card';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/calculations';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { getCategoryIcon } from '@/components/ui/category-icon';

export default function Budgets() {
    const { budgets, addBudget, deleteBudget } = useBudgets();
    const { getExpenses } = useTransactions();
    const { expenseCategories } = useCategories();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

    // Delete confirmation state
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const expenses = getExpenses();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !limit) return;
        addBudget(category, parseFloat(limit), period);
        setIsDialogOpen(false);
        resetForm();
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteBudget(deleteId);
            setDeleteId(null);
        }
    }

    const resetForm = () => {
        setCategory('');
        setLimit('');
        setPeriod('monthly');
    };

    const getSpentAmount = (cat: string, p: 'monthly' | 'yearly') => {
        return expenses.filter(t => {
            const d = new Date(t.date);
            const isCategory = t.category === cat;
            const isTime = p === 'monthly'
                ? d.getMonth() === currentMonth && d.getFullYear() === currentYear
                : d.getFullYear() === currentYear;
            return isCategory && isTime;
        }).reduce((sum, t) => sum + t.amount, 0);
    };

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Budgets
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Set limits and track your spending goals.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Set Budget
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Budget</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="limit">Limit Amount</Label>
                                            <Input
                                                id="limit"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={limit}
                                                onChange={(e) => setLimit(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Period</Label>
                                            <Select value={period} onValueChange={(v: 'monthly' | 'yearly') => setPeriod(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Set Budget
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {budgets.length === 0 ? (
                        <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                            <p className="text-muted-foreground">No budgets set. Create one to start tracking.</p>
                        </div>
                    ) : (
                        budgets.map(budget => {
                            const spent = getSpentAmount(budget.category, budget.period);
                            const percentage = Math.min(100, (spent / budget.limit) * 100);
                            const isOver = spent > budget.limit;
                            const isWarning = percentage >= (budget.alertThreshold || 80);

                            return (
                                <Card key={budget.id} className={`hover:shadow-md transition-shadow group relative ${isOver ? 'border-destructive/50' : ''}`}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-secondary rounded-full">
                                                    {getCategoryIcon(budget.category)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-lg">{budget.category}</span>
                                                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full capitalize">{budget.period}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(budget.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className={isOver ? 'text-destructive font-bold' : ''}>{formatCurrency(spent)} spent</span>
                                                <span className="text-muted-foreground">of {formatCurrency(budget.limit)}</span>
                                            </div>

                                            <Progress
                                                value={percentage}
                                                className={`h-3 rounded-full ${isOver ? 'bg-destructive/10' : ''}`}
                                            />

                                            <div className="flex justify-end pt-1">
                                                {isOver ? (
                                                    <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                                                        <AlertTriangle className="h-3 w-3" /> Over Budget
                                                    </span>
                                                ) : isWarning ? (
                                                    <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                                                        <AlertTriangle className="h-3 w-3" /> Near Limit
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                                        <CheckCircle className="h-3 w-3" /> On Track
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your budget settings for this category.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
