import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const EMPTY_ARRAY: Transaction[] = [];

export function useTransactions() {
    const { toast } = useToast();
    const { user } = useAuth();
    const userId = user?.id ?? '';

    const transactions = useLiveQuery(
        () => userId ? db.transactions.where('userId').equals(userId).reverse().sortBy('date') : Promise.resolve([]),
        [userId]
    ) ?? EMPTY_ARRAY;

    const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
        if (!userId) return;
        try {
            const id = await db.transactions.add({
                ...data,
                userId,
                date: data.date || new Date().toISOString()
            });
            toast({
                title: 'Transaction added',
                description: `${data.type === 'income' ? 'Income' : 'Expense'} recorded successfully.`,
            });
            return id;
        } catch (error) {
            console.error('Failed to add transaction:', error);
            toast({ title: 'Error', description: 'Failed to save transaction.', variant: 'destructive' });
        }
    };

    const updateTransaction = async (id: number, data: Partial<Transaction>) => {
        try {
            await db.transactions.update(id, data);
            toast({ title: 'Transaction updated', description: 'Changes saved successfully.' });
        } catch (error) {
            console.error('Failed to update transaction:', error);
            toast({ title: 'Error', description: 'Failed to update transaction.', variant: 'destructive' });
        }
    };

    const deleteTransaction = async (id: number) => {
        try {
            await db.transactions.delete(id);
            toast({ title: 'Transaction deleted', description: 'Record removed successfully.' });
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            toast({ title: 'Error', description: 'Failed to delete transaction.', variant: 'destructive' });
        }
    };

    const getIncomes = useCallback(() => transactions.filter(t => t.type === 'income'), [transactions]);
    const getExpenses = useCallback(() => transactions.filter(t => t.type === 'expense'), [transactions]);
    const getTotalIncome = useCallback(() => getIncomes().reduce((sum, t) => sum + Number(t.amount), 0), [getIncomes]);
    const getTotalExpenses = useCallback(() => getExpenses().reduce((sum, t) => sum + Number(t.amount), 0), [getExpenses]);

    return {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getIncomes,
        getExpenses,
        getTotalIncome,
        getTotalExpenses,
        getIncome: getIncomes,
    };
}
