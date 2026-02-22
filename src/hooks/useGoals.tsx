import { useLiveQuery } from 'dexie-react-hooks';
import { db, Goal } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useGoals() {
    const { toast } = useToast();
    const { user } = useAuth();
    const userId = user?.id ?? '';

    const goals = useLiveQuery(
        () => userId ? db.goals.where('userId').equals(userId).toArray() : Promise.resolve([]),
        [userId]
    ) || [];

    const addGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'currentAmount'>) => {
        if (!userId) return;
        try {
            await db.goals.add({ ...goalData, userId, currentAmount: 0 });
            toast({ title: 'Goal created', description: `Savings goal "${goalData.name}" added.` });
        } catch (error) {
            console.error('Failed to add goal:', error);
            toast({ title: 'Error', description: 'Failed to save goal.', variant: 'destructive' });
        }
    };

    const updateGoal = async (id: number, updates: Partial<Goal>) => {
        try {
            await db.goals.update(id, updates);
            toast({ title: 'Goal updated', description: 'Goal details updated successfully.' });
        } catch (error) {
            console.error('Failed to update goal:', error);
            toast({ title: 'Error', description: 'Failed to update goal.', variant: 'destructive' });
        }
    };

    const addContribution = async (id: number, amount: number) => {
        try {
            const goal = await db.goals.get(id);
            if (goal) {
                await db.goals.update(id, { currentAmount: goal.currentAmount + amount });
                toast({ title: 'Contribution added', description: 'Added contribution to goal.' });
            }
        } catch (error) {
            console.error('Failed to add contribution:', error);
            toast({ title: 'Error', description: 'Failed to update goal.', variant: 'destructive' });
        }
    };

    const deleteGoal = async (id: number) => {
        try {
            await db.goals.delete(id);
            toast({ title: 'Goal deleted', description: 'Goal removed successfully.' });
        } catch (error) {
            console.error('Failed to delete goal:', error);
            toast({ title: 'Error', description: 'Failed to delete goal.', variant: 'destructive' });
        }
    };

    return { goals, addGoal, updateGoal, addContribution, deleteGoal };
}
