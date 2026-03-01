const fs = require("fs");
const { program } = require("commander");
const path = require("path");

const FILE_PATH = path.join(__dirname, "expenses.json");

// ========= Utility Functions ========= 
const readExpenses = () => (fs.existsSync(FILE_PATH)) ? JSON.parse(fs.readFileSync(FILE_PATH)) : [];

const generateId = (expenses) => expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

const formatDate = (date = new Date()) => date.toISOString().split("T")[0];

const saveExpenses = (expenses) => fs.writeFileSync(FILE_PATH, JSON.stringify(expenses, null, 2));



// ========= Commands ========= 
// ADD
program
    .command("add")
    .requiredOption("--description <desc>", "Expense description")
    .requiredOption("--amount <amount>", "Expense amount")
    .action(options => {
        const expenses = readExpenses();
        const amount = parseFloat(options.amount);

        if (amount <= 0 || isNaN(amount)) {
            console.error("Amount must be a positive number.");
            process.exit(1);
        }

        const newExpense = {
            id: generateId(expenses),
            date: formatDate(),
            description: options.description,
            amount: amount
        }

        expenses.push(newExpense);
        saveExpenses(expenses);

        console.log("Expense added successfully:");
        console.log(`ID: ${newExpense.id}`);
        console.log(`Description: ${newExpense.description}`);
        console.log(`Amount: $${newExpense.amount}`);
    });

// LIST
program
    .command("list")
    .action(() => {
        const expenses = readExpenses();

        if (expenses.length === 0) {
            console.log("No expenses found!");
            process.exit(1);
        }

        console.table(
            expenses.map(e => ({
                ID: e.id,
                Date: e.date,
                Description: e.description,
                Amount: `$${e.amount}`
            }))
        );
    });

// DELETE
program
    .command("delete")
    .requiredOption("--id <id>", "Expense ID")
    .action(options => {
        const id = Number(options.id);

        if (!Number.isInteger(id) || id <= 0) {
            console.error("Invalid ID. ID must be a positive integer.");
            process.exit(1);
        }

        const expenses = readExpenses();
        if (expenses.length === 0) {
            console.error("No expenses found.");
            process.exit(1);
        }

        const expenseIndex = expenses.findIndex(e => e.id === id);

        if (expenseIndex === -1) {
            console.error(`Expense with ID ${id} not found.`);
            process.exit(1);
        }
        const deletedExpense = expenses.splice(expenseIndex, 1)[0];

        saveExpenses(expenses);

        console.log("Expense deleted successfully:");
        console.log(`ID: ${deletedExpense.id}`);
        console.log(`Description: ${deletedExpense.description}`);
        console.log(`Amount: $${deletedExpense.amount}`);
    });

// UPDATE
program
    .command("update")
    .requiredOption("--id <id>", "Expense ID")
    .option("--description <desc>", "New description")
    .option("--amount <amount>", "New amount")
    .action((options) => {
        const expenses = readExpenses();
        const id = parseInt(options.id);

        const expense = expenses.find(e => e.id === id);
        if (!expense) {
            console.log("Expense not found.");
            return;
        }

        if (options.description) {
            expense.description = options.description;
        }

        if (options.amount) {
            const amount = parseFloat(options.amount);
            if (amount <= 0 || isNaN(amount)) {
                console.log("Amount must be positive.");
                return;
            }
            expense.amount = amount;
        }

        saveExpenses(expenses);
        console.log("Expense updated successfully.");
    });

// SUMMARY
program
    .command("summary")
    .option("--month <month>", "Month number (1-12)")
    .action((options) => {
        const expenses = readExpenses();
        let filtered = expenses;

        if (options.month) {
            const month = parseInt(options.month);
            filtered = expenses.filter(e => {
                const expenseMonth = new Date(e.date).getMonth() + 1;
                return expenseMonth === month;
            });

            const total = filtered.reduce((sum, e) => sum + e.amount, 0);
            console.log(`Total expenses for month ${month}: $${total}`);
            return;
        }

        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        console.log(`Total expenses: $${total}`);
    });

// EXPORT CSV (Optional Feature)
program
    .command("export")
    .action(() => {
        const expenses = readExpenses();

        if (expenses.length === 0) {
            console.log("No expenses to export!");
            return;
        }

        const csvHeader = "ID,Date,Description,Amount\n";
        const csvRows = expenses
            .map(e => `${e.id},${e.date},${e.description},${e.amount}`)
            .join("\n");

        fs.writeFileSync("expenses.csv", csvHeader + csvRows);

        console.log("Expenses exported to expenses.csv");
    });

program.parse(process.argv);