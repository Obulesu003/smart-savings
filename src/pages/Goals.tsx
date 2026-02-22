import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/calculations';
import { Plus, Trash2, Target, TrendingUp, Calendar, PiggyBank, CheckCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function Goals() {
    const { goals, addGoal, addContribution, deleteGoal } = useGoals();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isContributeOpen, setIsContributeOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

    // Forms
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount || !targetDate) return;

        addGoal({
            name,
            targetAmount: parseFloat(targetAmount),
            deadline: targetDate,
        });
        setIsDialogOpen(false);
        setName('');
        setTargetAmount('');
        setTargetDate('');
    };

    const handleContribute = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGoalId === null || !contributionAmount) return;
        addContribution(selectedGoalId, parseFloat(contributionAmount));
        setIsContributeOpen(false);
        setContributionAmount('');
        setSelectedGoalId(null);
    };

    const openContribute = (id: number) => {
        setSelectedGoalId(id);
        setIsContributeOpen(true);
    };

    return (
        <MainLayout>
            <div className="container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Savings Goals
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Track your progress towards financial milestones.
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Savings Goal</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Goal Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. New Car, Vacation"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetAmount">Target Amount</Label>
                                    <Input
                                        id="targetAmount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={targetAmount}
                                        onChange={(e) => setTargetAmount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="targetDate">Target Date</Label>
                                    <Input
                                        id="targetDate"
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full">
                                    Create Goal
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Contribution</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleContribute} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contribution">Amount Saved</Label>
                                <Input
                                    id="contribution"
                                    type="number"
                                    step="0.01"
                                    value={contributionAmount}
                                    onChange={(e) => setContributionAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Save</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {goals.length === 0 ? (
                        <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                            <p className="text-muted-foreground">No savings goals yet. Start planning today!</p>
                        </div>
                    ) : (
                        goals.map(goal => {
                            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
                            const isCompleted = progress >= 100;

                            return (
                                <Card key={goal.id} className={`hover:shadow-md transition-shadow relative overflow-hidden ${isCompleted ? 'border-emerald-500/50' : ''}`}>
                                    {isCompleted && (
                                        <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-primary-foreground rounded-bl-lg">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                                    <Target className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                                                    {goal.deadline && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteGoal(goal.id!)}                                   
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-2xl font-bold">{formatCurrency(goal.currentAmount)}</p>
                                                    <p className="text-xs text-muted-foreground">of {formatCurrency(goal.targetAmount)} goal</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-primary">{Math.round(progress)}%</p>
                                                    {daysLeft !== null ? (
                                                    daysLeft > 0 ? (
                                                        <p className="text-xs text-muted-foreground">{daysLeft} days left</p>
                                                    ) : (
                                                        <p className="text-xs text-destructive font-medium">Overdue</p>
                                                    )
                                                ) : null}
                                                </div>
                                            </div>

                                            <Progress value={progress} className="h-3 rounded-full" />

                                             <Button className="w-full gap-2 shadow-sm" onClick={() => openContribute(goal.id!)} disabled={isCompleted}>
                                                <PiggyBank className="h-4 w-4" />
                                                {isCompleted ? 'Goal Reached!' : 'Add Savings'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
