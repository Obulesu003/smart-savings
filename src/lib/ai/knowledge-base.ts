export interface Lesson {
    id: string;
    title: string;
    category: 'budgeting' | 'saving' | 'investing' | 'debt' | 'emergency';
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    content: string; // Markdown supported
    tags: string[];
}

export const KNOWLEDGE_BASE: Lesson[] = [
    {
        id: 'budget-50-30-20',
        title: 'The 50/30/20 Rule',
        category: 'budgeting',
        level: 'Beginner',
        tags: ['budget', 'basics', 'rules'],
        content: `
### The 50/30/20 Rule
One of the simplest ways to budget is asking yourself inputs:
- **50% Needs**: Rent, groceries, utilities.
- **30% Wants**: Dining out, hobbies, streaming services.
- **20% Savings**: Emergency fund, investments, debt repayment.

**Why it works**: It’s flexible. You don’t have to track every penny, just the big buckets.
        `
    },
    {
        id: 'emergency-fund-101',
        title: 'Building an Emergency Fund',
        category: 'emergency',
        level: 'Beginner',
        tags: ['safety', 'savings'],
        content: `
### Why you need a Safety Net
Life happens. Cars break down, medical bills pop up.
**Goal**: Save 3-6 months of *necessary expenses*.
**Where to keep it**: A High-Yield Savings Account (HYSA) so it grows but is accessible.
**Do NOT**: Invest this money in stocks (too risky) or keep it in checking (too easy to spend).
        `
    },
    {
        id: 'investing-compound',
        title: 'The Magic of Compound Interest',
        category: 'investing',
        level: 'Beginner',
        tags: ['growth', 'long-term'],
        content: `
### Money Making Money
Compound interest is when you earn interest on your interest.
Example: $1,000 invested at 10% return:
- Year 1: $1,100
- Year 2: $1,210 (You earned $10 extra for doing nothing!)
- Year 30: **$17,449**

**Key**: Start early. Time is your best friend in investing.
        `
    },
    {
        id: 'debt-avalanche',
        title: 'Avalanche vs. Snowball',
        category: 'debt',
        level: 'Intermediate',
        tags: ['strategy', 'payoff'],
        content: `
### Two ways to kill debt
1. **Avalanche**: Pay highest interest rate first. (Mathematically best, saves most money).
2. **Snowball**: Pay smallest balance first. (Psychologically best, gives quick wins).

**Advice**: If you need motivation, choose Snowball. If you want efficiency, choose Avalanche.
        `
    },
    {
        id: 'inflation-protection',
        title: 'Beating Inflation',
        category: 'investing',
        level: 'Advanced',
        tags: ['economics', 'protection'],
        content: `
### Don't let cash rot
Inflation (avg 2-3%) eats the value of cash sitting under your mattress.
To beat it, you need assets that appreciate:
- **Stocks/Equities**: Historically 7-10% return.
- **Real Estate**: Hedges against specialized inflation.
- **Gold/Commodities**: Traditional hedge (but volatile).

**Rule**: Keep only what you need short-term in cash. Invest the rest.
        `
    }
];
