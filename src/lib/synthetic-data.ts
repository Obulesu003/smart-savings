import { db, Transaction } from './db';
import { subMonths, addDays, format } from 'date-fns';

/**
 * Generates statistically realistic synthetic transaction data (training data)
 * for academic validation of the ML and Forecasting models.
 */
export async function generateSyntheticTrainingData(userId: string, months = 24): Promise<number> {
  // Clear existing user transactions to ensure clean training data
  await db.transactions.where('userId').equals(userId).delete();

  const syntheticTransactions: Transaction[] = [];
  const currentDate = new Date();
  
  // Baseline demographics for the synthetic profile
  let baseIncome = 65000;
  let baseRent = 20000;
  let baseGroceries = 12000;
  let baseUtilities = 5000;
  let baseDiscretionary = 10000;

  // Generate data chronologically going backwards
  for (let i = 0; i < months; i++) {
    const targetMonth = subMonths(currentDate, i);
    const monthPrefix = format(targetMonth, 'yyyy-MM');
    
    // Add realistic 3% annual inflation/growth to income and expenses (going backward means we shrink them)
    const inflationFactor = Math.pow(1.03, - (i / 12));
    
    // 1. Income (Salary on 1st of month)
    const monthlyIncome = Math.round(baseIncome * inflationFactor);
    syntheticTransactions.push({
      userId,
      amount: monthlyIncome,
      type: 'income',
      category: 'Salary',
      date: `${monthPrefix}-01`,
      description: 'Monthly Salary (Synthetic)',
    });

    // 2. Fixed Expenses
    syntheticTransactions.push({
      userId,
      amount: Math.round(baseRent * inflationFactor),
      type: 'expense',
      category: 'Housing',
      date: `${monthPrefix}-05`,
      description: 'Rent Payment',
    });

    syntheticTransactions.push({
      userId,
      amount: Math.round(baseUtilities * inflationFactor),
      type: 'expense',
      category: 'Bills',
      date: `${monthPrefix}-10`,
      description: 'Electricity & Internet',
    });

    // 3. Variable Expenses (Groceries) - 4 trips a month
    for (let w = 1; w <= 4; w++) {
      // Add +/- 15% randomness to grocery runs
      const groceryAmount = (baseGroceries / 4) * inflationFactor * (0.85 + Math.random() * 0.3);
      syntheticTransactions.push({
        userId,
        amount: Math.round(groceryAmount),
        type: 'expense',
        category: 'Food',
        date: `${monthPrefix}-${String(w * 7).padStart(2, '0')}`,
        description: `Grocery Run Week ${w}`,
      });
    }

    // 4. Discretionary Spending (Random events)
    // 3-5 random transactions per month
    const randomTxCount = Math.floor(Math.random() * 3) + 3;
    for (let r = 0; r < randomTxCount; r++) {
      const discAmount = (baseDiscretionary / randomTxCount) * inflationFactor * (0.5 + Math.random() * 1.0);
      const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      
      const categories = ['Entertainment', 'Transport', 'Shopping', 'Healthcare'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      syntheticTransactions.push({
        userId,
        amount: Math.round(discAmount),
        type: 'expense',
        category: randomCategory,
        date: `${monthPrefix}-${randomDay}`,
        description: `Synthetic ${randomCategory} Expense`,
      });
    }

    // Occasional spikes (e.g., medical emergency, vacation, bonus)
    // 5% chance of a high expense
    if (Math.random() > 0.95) {
        syntheticTransactions.push({
            userId,
            amount: Math.round(15000 * inflationFactor),
            type: 'expense',
            category: 'Healthcare',
            date: `${monthPrefix}-15`,
            description: 'Unexpected Medical Expense',
        });
    }
    // 2% chance of a bonus
    if (Math.random() > 0.98) {
        syntheticTransactions.push({
            userId,
            amount: Math.round(30000 * inflationFactor),
            type: 'income',
            category: 'Bonus',
            date: `${monthPrefix}-20`,
            description: 'Performance Bonus',
        });
    }
  }

  // Sort chronologically
  syntheticTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Bulk Insert into Dexie
  await db.transactions.bulkAdd(syntheticTransactions);

  return syntheticTransactions.length;
}

/**
 * Utility to extract the raw synthetic dataset as a CSV string
 * explicitly for academic presentation of "Training Data".
 */
export async function exportTrainingDataCSV(userId: string): Promise<string> {
   const data = await db.transactions.where('userId').equals(userId).sortBy('date');
   
   if (data.length === 0) return "No Training Data found.";

   const headers = "Date,Type,Category,Amount,Description\n";
   const rows = data.map(t => `${t.date},${t.type},${t.category},${t.amount},"${t.description}"`).join("\n");
   
   return headers + rows;
}
