const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'training_data');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const file = path.join(dir, 'synthetic_transactions_large.csv');
const jsonFile = path.join(dir, 'synthetic_transactions_large.json');

// We will use streams for the CSV to avoid running out of memory with massive datasets
const csvStream = fs.createWriteStream(file);
csvStream.write("UserID,Date,Type,Category,Amount,Description\n");

const transactions = [];
const NUM_USERS = 50;
const MONTHS = 60; // 5 years of data

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

console.log(`Generating synthetic financial telemetry for ${NUM_USERS} users over ${MONTHS} months...`);

let totalGenerated = 0;

for (let u = 1; u <= NUM_USERS; u++) {
    const userId = `USR_${String(u).padStart(4, '0')}`;
    
    // Each user has different base financial stats
    const incomeVariance = 0.5 + Math.random() * 1.5; // From 50% to 200% of base
    const baseIncome = Math.round(50000 * incomeVariance);
    const baseRent = Math.round(baseIncome * (0.2 + Math.random() * 0.15)); // 20-35% of income on rent
    const baseGroceries = Math.round(baseIncome * (0.1 + Math.random() * 0.1)); // 10-20% on food
    const baseUtilities = Math.round(4000 + Math.random() * 3000);
    const baseDiscretionary = Math.round(baseIncome * (0.1 + Math.random() * 0.2));

    for (let i = 0; i < MONTHS; i++) {
        const targetMonth = subMonths(currentDate, i);
        const monthPrefix = format(targetMonth);
        const inflationFactor = Math.pow(1.03, - (i / 12)); // 3% historical inflation

        // Salary
        const inc = Math.round(baseIncome * inflationFactor);
        const incRow = `${userId},${monthPrefix}-01,income,Salary,${inc},"Monthly Salary (Synthetic)"\n`;
        csvStream.write(incRow);
        
        // Rent
        const rent = Math.round(baseRent * inflationFactor);
        csvStream.write(`${userId},${monthPrefix}-05,expense,Housing,${rent},"Rent Payment"\n`);
        
        // Utilities
        const util = Math.round(baseUtilities * inflationFactor);
        csvStream.write(`${userId},${monthPrefix}-10,expense,Bills,${util},"Electricity & Internet"\n`);

        totalGenerated += 3;

        // Groceries (4-6 trips)
        const groceryTrips = 4 + Math.floor(Math.random() * 3);
        for (let w = 1; w <= groceryTrips; w++) {
            const groceryAmount = Math.round((baseGroceries / groceryTrips) * inflationFactor * (0.8 + Math.random() * 0.4));
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            csvStream.write(`${userId},${monthPrefix}-${day},expense,Food,${groceryAmount},"Grocery Run"\n`);
            totalGenerated++;
        }

        // Discretionary (5-15 random transactions)
        const randomTxCount = 5 + Math.floor(Math.random() * 11);
        for (let r = 0; r < randomTxCount; r++) {
            const discAmount = Math.round((baseDiscretionary / randomTxCount) * inflationFactor * (0.2 + Math.random() * 1.8));
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const categories = ['Entertainment', 'Transport', 'Shopping', 'Healthcare', 'Personal', 'Miscellaneous'];
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            csvStream.write(`${userId},${monthPrefix}-${day},expense,${randomCategory},${discAmount},"Synthetic ${randomCategory} Expense"\n`);
            totalGenerated++;
        }

        // High variance anomalies for ML anomaly detection training
        if (Math.random() > 0.98) {
            csvStream.write(`${userId},${monthPrefix}-15,expense,Healthcare,${Math.round(25000 * inflationFactor)},"Unexpected Medical Expense"\n`);
            totalGenerated++;
        }
        if (Math.random() > 0.99) {
            csvStream.write(`${userId},${monthPrefix}-20,income,Bonus,${Math.round(50000 * inflationFactor)},"Performance/Year-end Bonus"\n`);
            totalGenerated++;
        }
    }
}

csvStream.end();

console.log(`\n✅ Successfully generated a massive dataset containing [ ${totalGenerated.toLocaleString()} rows ].`);
console.log(`Saved CSV to: ${file}`);
console.log(`\n(Note: Did not save JSON array to avoid memory limits. CSV is best for Large datasets and Python Pandas).`);
