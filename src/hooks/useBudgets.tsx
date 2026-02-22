import { useLiveQuery } from 'dexie-react-hooks';
import { db, Budget } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useBudgets() {
    const { toast } = useToast();
    const { user } = useAuth();
    const userId = user?.id ?? '';

    const budgets = useLiveQuery(
        () => userId ? db.budgets.where('userId').equals(userId).toArray() : Promise.resolve([]),
        [userId]
    ) || [];

    const addBudget = async (category: string, limit: number, period: 'monthly' | 'yearly' = 'monthly') => {
        if (!userId) return;
        const exists = await db.budgets.where({ category, period, userId }).first();
        if (exists) {
            toast({ title: 'Budget exists', description: `A ${period} budget for ${category} already exists.`, variant: 'destructive' });
            return;
        }
        try {
            await db.budgets.add({ userId, category, limit, period });
            toast({ title: 'Budget set', description: `Budget for ${category} has been created.` });
        } catch (error) {
            console.error('Failed to add budget:', error);
            toast({ title: 'Error', description: 'Failed to create budget.', variant: 'destructive' });
        }
    };

    const updateBudget = async (id: number, limit: number) => {
        try {
            await db.budgets.update(id, { limit });
            toast({ title: 'Budget updated', description: 'Limit updated successfully.' });
        } catch (error) {
            console.error('Failed to update budget:', error);
            toast({ title: 'Error', description: 'Failed to update budget.', variant: 'destructive' });
        }
    };

    const deleteBudget = async (id: number) => {
        try {
            await db.budgets.delete(id);
            toast({ title: 'Budget deleted', description: 'Budget removed successfully.' });
        } catch (error) {
            console.error('Failed to delete budget:', error);
            toast({ title: 'Error', description: 'Failed to delete budget.', variant: 'destructive' });
        }
    };

    return { budgets, addBudget, updateBudget, deleteBudget };
}
