import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES as DEFAULT_EXPENSES, INCOME_CATEGORIES as DEFAULT_INCOME } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';

export const CATEGORIES_STORAGE_KEY = 'ssp_categories';

interface CustomCategories {
    income: string[];
    expense: string[];
}

const DEFAULT_CATEGORIES: CustomCategories = {
    income: [],
    expense: [],
};

export function useCategories() {
    const [customCategories, setCustomCategories] = useState<CustomCategories>(DEFAULT_CATEGORIES);
    const { toast } = useToast();

    useEffect(() => {
        const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (stored) {
            try {
                setCustomCategories(JSON.parse(stored));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const saveCategories = (newCategories: CustomCategories) => {
        setCustomCategories(newCategories);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
    };

    const addCategory = (type: 'income' | 'expense', name: string) => {
        if (!name.trim()) return;

        // Check duplicates including defaults
        const defaults = type === 'income' ? DEFAULT_INCOME : DEFAULT_EXPENSES;
        const existing = customCategories[type];

        if (defaults.includes(name) || existing.includes(name)) {
            toast({
                title: 'Category exists',
                description: 'This category already exists.',
                variant: 'destructive',
            });
            return;
        }

        const updated = {
            ...customCategories,
            [type]: [...existing, name],
        };

        saveCategories(updated);
        toast({
            title: 'Category added',
            description: `New ${type} category created.`,
        });
    };

    const deleteCategory = (type: 'income' | 'expense', name: string) => {
        const updated = {
            ...customCategories,
            [type]: customCategories[type].filter(c => c !== name),
        };
        saveCategories(updated);
    };

    return {
        incomeCategories: [...DEFAULT_INCOME, ...customCategories.income],
        expenseCategories: [...DEFAULT_EXPENSES, ...customCategories.expense],
        addCategory,
        deleteCategory,
    };
}
