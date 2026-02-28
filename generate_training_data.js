const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'training_data');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const file = path.join(dir, 'synthetic_transactions.csv');
const jsonFile = path.join(dir, 'synthetic_transactions.json');

let csv = "Date,Type,Category,Amount,Description\n";

let baseIncome = 65000;
let baseRent = 20000;
let baseGroceries = 12000;
let baseUtilities = 5000;
let baseDiscretionary = 10000;

const currentDate = new Date();

function subMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
}

function format(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

const transactions = [];

for (let i = 0; i < 24; i++) {
    const targetMonth = subMonths(currentDate, i);
    const monthPrefix = format(targetMonth);
    const inflationFactor = Math.pow(1.03, - (i / 12));

    transactions.push({ date: `${monthPrefix}-01`, type: 'income', category: 'Salary', amount: Math.round(baseIncome * inflationFactor), description: 'Monthly Salary (Synthetic)' });
    transactions.push({ date: `${monthPrefix}-05`, type: 'expense', category: 'Housing', amount: Math.round(baseRent * inflationFactor), description: 'Rent Payment' });
    transactions.push({ date: `${monthPrefix}-10`, type: 'expense', category: 'Bills', amount: Math.round(baseUtilities * inflationFactor), description: 'Electricity & Internet' });

    for (let w = 1; w <= 4; w++) {
        const groceryAmount = (baseGroceries / 4) * inflationFactor * (0.85 + Math.random() * 0.3);
        transactions.push({ date: `${monthPrefix}-${String(w * 7).padStart(2, '0')}`, type: 'expense', category: 'Food', amount: Math.round(groceryAmount), description: `Grocery Run Week ${w}` });
    }

    const randomTxCount = Math.floor(Math.random() * 3) + 3;
    for (let r = 0; r < randomTxCount; r++) {
        const discAmount = (baseDiscretionary / randomTxCount) * inflationFactor * (0.5 + Math.random() * 1.0);
        const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const categories = ['Entertainment', 'Transport', 'Shopping', 'Healthcare'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        transactions.push({ date: `${monthPrefix}-${randomDay}`, type: 'expense', category: randomCategory, amount: Math.round(discAmount), description: `Synthetic ${randomCategory} Expense` });
    }

    if (Math.random() > 0.95) {
        transactions.push({ date: `${monthPrefix}-15`, type: 'expense', category: 'Healthcare', amount: Math.round(15000 * inflationFactor), description: 'Unexpected Medical Expense' });
    }
    if (Math.random() > 0.98) {
        transactions.push({ date: `${monthPrefix}-20`, type: 'income', category: 'Bonus', amount: Math.round(30000 * inflationFactor), description: 'Performance Bonus' });
    }
}

transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

transactions.forEach(t => {
    csv += `${t.date},${t.type},${t.category},${t.amount},"${t.description}"\n`;
});

fs.writeFileSync(file, csv);
fs.writeFileSync(jsonFile, JSON.stringify(transactions, null, 2));

console.log(`Generated ${transactions.length} synthetic transactions.`);
console.log(`Saved CSV to: ${file}`);
console.log(`Saved JSON to: ${jsonFile}`);
