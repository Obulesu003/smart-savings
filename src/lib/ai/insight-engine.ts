import { Transaction } from "@/lib/db";
import { KNOWLEDGE_BASE, Lesson } from "./knowledge-base";
import { subMonths, parseISO, isAfter } from "date-fns";

export interface Insight {
    type: 'warning' | 'kudos' | 'tip';
    title: string;
    message: string;
    relatedLessonId?: string;
}

export class InsightEngine {

    /**
     * Analyzes user transactions to generate personalized insights and lesson recommendations.
     */
    static analyze(transactions: Transaction[]): Insight[] {
        const insights: Insight[] = [];
        const now = new Date();
        const lastMonth = subMonths(now, 1);

        // 1. Calculate basic metrics
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

        // 2. Savings Rate Analysis
        if (savingsRate < 0.1 && totalIncome > 0) {
            insights.push({
                type: 'warning',
                title: 'Low Savings Rate',
                message: `You're saving only ${(savingsRate * 100).toFixed(1)}% of your income. Try to aim for at least 20%.`,
                relatedLessonId: 'budget-50-30-20'
            });
        } else if (savingsRate > 0.4) {
             insights.push({
                type: 'kudos',
                title: 'Super Saver!',
                message: `Excellent work! You're saving ${(savingsRate * 100).toFixed(1)}% of your income.`,
                relatedLessonId: 'investing-compound'
            });
        }

        // 3. Emergency Fund Check (Heuristic: Do they have "Savings" category expenses/transfers?)
        const savingsTransfers = transactions
            .filter(t => t.category === 'Savings' && t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        if (savingsTransfers === 0 && totalIncome > 1000) {
             insights.push({
                type: 'tip',
                title: 'Start an Emergency Fund',
                message: "We haven't seen any transfers to 'Savings' recently. Building a safety net is crucial.",
                relatedLessonId: 'emergency-fund-101'
            });
        }

        // 4. Overspending Detection (Recent vs Learning)
        // Simple logic: If recent expenses > income
        if (totalExpenses > totalIncome && totalIncome > 0) {
             insights.push({
                type: 'warning',
                title: 'Living Beyond Means',
                message: "Your expenses exceed your income. Consider reviewing your 'Wants' vs 'Needs'.",
                relatedLessonId: 'budget-50-30-20'
            });
        }

        // 5. Default "Tip of the Day" if no specific insights found
        if (insights.length === 0) {
             insights.push({
                type: 'tip',
                title: 'Financial Wisdom',
                message: 'Consistency is key. Small habits compounded over time create wealth.',
                relatedLessonId: 'investing-compound'
            });
        }

        return insights;
    }

    static getLessonById(id: string): Lesson | undefined {
        return KNOWLEDGE_BASE.find(l => l.id === id);
    }

    static getRecommendedLesson(insights: Insight[]): Lesson {
        // Prioritize lessons linked to warnings
        const warningInsight = insights.find(i => i.type === 'warning' && i.relatedLessonId);
        if (warningInsight?.relatedLessonId) {
            return this.getLessonById(warningInsight.relatedLessonId) || KNOWLEDGE_BASE[0];
        }

        // Fallback to random or first
        return KNOWLEDGE_BASE[0];
    }
    
    static getAllLessons(): Lesson[] {
        return KNOWLEDGE_BASE;
    }
}
