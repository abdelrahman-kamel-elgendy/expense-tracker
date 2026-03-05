const fs = require("fs");
const path = require("path");
const chalk = require("chalk");


const FILE_PATH = path.join(process.cwd(), "expenses.json");

const readExpenses = () => {
    try {
        if (!fs.existsSync(FILE_PATH))
            return [];

        const data = fs.readFileSync(FILE_PATH, "utf8")
        return JSON.parse(data);
    } catch (error) {
        console.error(chalk.red(`Error reading expenses: ${err.message}`));
        process.exit(1);
    }
};


const saveExpenses = (expenses) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(expenses, null, 2))
    } catch (error) {
        console.error(chalk.red(`Error saving expenses: ${err.message}`));
        process.exit(1);
    }
};


const generateId = (expenses) => expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

const formatDate = (date = new Date()) => date.toISOString().split("T")[0];


// == Derived helpers ============================================================  
const calculateStats = (expenses) => {
    if (!expenses.length)
        return null;

    const amounts = expenses.map((e) => e.amount);
    const total = amounts.reduce((s, a) => s + a, 0);
    return {
        total,
        average: total / expenses.length,
        max: Math.max(...amounts),
        min: Math.min(...amounts),
        count: expenses.length,
    };
};

const groupByMonth = (expenses) => expenses.reduce((a, c) => {
    const m = new Date(e.date).getMonth() + 1;
    if (!acc[m])
        acc[m] = { total: 0, count: 0 };

    acc[m].total += e.amount;
    acc[m].count++;

    return acc[m];
}, {});

const groupByCategory = (expenses) => expenses.reduce((acc, c) => {
    const cat = e.category || "other";
    if (!acc[cat])
        acc[cat] = { total: 0, count: 0 };

    acc[cat].total = e.amount;
    acc[cat].count++;

    return acc[cat];
});


module.exports = {
    readExpenses,
    saveExpenses,
    generateId,
    formatDate,
    calculateStats,
    groupByMonth,
    groupByCategory
}
