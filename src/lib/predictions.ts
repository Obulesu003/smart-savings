import { Transaction } from "@/lib/db";
import { format, addMonths, startOfMonth, parseISO, getMonth, getYear } from "date-fns";
import * as ss from 'simple-statistics';

export interface PredictionPoint {
    month: string; // "MMM yyyy"
    date: string; // ISO date for sorting/charting
    actual?: number;
    predicted: number;
    type: 'historical' | 'prediction';
}

export interface PredictionResult {
    income: PredictionPoint[];
    expenses: PredictionPoint[];
    savings: PredictionPoint[];
    hasData: boolean;
}

export function calculatePredictions(transactions: Transaction[], monthsToPredict: number = 6): PredictionResult {
    // 1. Group transactions by month
    const monthlyData = new Map<string, { income: number; expenses: number; date: Date }>();

    transactions.forEach(t => {
        if (!t.date) return;
        const date = new Date(t.date);
        const key = format(date, 'yyyy-MM');

        if (!monthlyData.has(key)) {
            monthlyData.set(key, { income: 0, expenses: 0, date: startOfMonth(date) });
        }

        const entry = monthlyData.get(key)!;
        const amount = Number(t.amount);
        if (t.type === 'income') {
            entry.income += amount;
        } else {
            entry.expenses += amount;
        }
    });

    // 2. Sort data chronologically
    const sortedMonths = Array.from(monthlyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

    const incomeResult: PredictionPoint[] = [];
    const expensesResult: PredictionPoint[] = [];
    const savingsResult: PredictionPoint[] = [];

    // Add historical data
    sortedMonths.forEach((m) => {
        const monthStr = format(m.date, 'MMM yyyy');
        const isoDate = format(m.date, 'yyyy-MM-dd');

        incomeResult.push({ month: monthStr, date: isoDate, actual: m.income, predicted: m.income, type: 'historical' });
        expensesResult.push({ month: monthStr, date: isoDate, actual: m.expenses, predicted: m.expenses, type: 'historical' });
        savingsResult.push({ month: monthStr, date: isoDate, actual: m.income - m.expenses, predicted: m.income - m.expenses, type: 'historical' });
    });

    if (sortedMonths.length === 0) {
        // No data at all — return empty result, UI will handle empty state
        return { income: incomeResult, expenses: expensesResult, savings: savingsResult, hasData: false };
    }

    if (sortedMonths.length === 1) {
        // Only 1 month of data — use flat projection from that month's values
        const base = sortedMonths[0];
        const lastDate = base.date;
        for (let i = 0; i < monthsToPredict; i++) {
            const futureDate = addMonths(lastDate, i + 1);
            const monthStr = format(futureDate, 'MMM yyyy');
            const isoDate = format(futureDate, 'yyyy-MM-dd');
            incomeResult.push({ month: monthStr, date: isoDate, predicted: base.income, type: 'prediction' });
            expensesResult.push({ month: monthStr, date: isoDate, predicted: base.expenses, type: 'prediction' });
            savingsResult.push({ month: monthStr, date: isoDate, predicted: base.income - base.expenses, type: 'prediction' });
        }
        return { income: incomeResult, expenses: expensesResult, savings: savingsResult, hasData: true };
    }

    // 3. Prepare data for regression
    const incomePoints = sortedMonths.map((m, i) => [i, m.income]);
    const expensePoints = sortedMonths.map((m, i) => [i, m.expenses]);

    const incomeLine = ss.linearRegressionLine(ss.linearRegression(incomePoints));
    const expenseLine = ss.linearRegressionLine(ss.linearRegression(expensePoints));

    // 4. Generate Future Predictions
    const lastDate = sortedMonths[sortedMonths.length - 1].date;
    const nextIndex = sortedMonths.length;

    for (let i = 0; i < monthsToPredict; i++) {
        const futureIndex = nextIndex + i;
        const futureDate = addMonths(lastDate, i + 1);
        const monthStr = format(futureDate, 'MMM yyyy');
        const isoDate = format(futureDate, 'yyyy-MM-dd');

        const predIncome = Math.max(0, incomeLine(futureIndex));
        const predExpense = Math.max(0, expenseLine(futureIndex));
        const predSavings = predIncome - predExpense;

        incomeResult.push({ month: monthStr, date: isoDate, predicted: predIncome, type: 'prediction' });
        expensesResult.push({ month: monthStr, date: isoDate, predicted: predExpense, type: 'prediction' });
        savingsResult.push({ month: monthStr, date: isoDate, predicted: predSavings, type: 'prediction' });
    }

    return {
        income: incomeResult,
        expenses: expensesResult,
        savings: savingsResult,
        hasData: true,
    };
}
