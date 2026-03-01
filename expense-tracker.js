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
            console.log("Amount must be a positive number.");
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
            console.error("No expenses found.");
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
    .action(options => {
        throw new Error("update command not implemented yet.");
    });

// SUMMARY
program
    .command("summary")
    .option("--month <month>", "Month number (1-12)")
    .action(options => {
        throw new Error("summary command not implemented yet.");
    });

// EXPORT CSV 
program
    .command("export")
    .action(() => {
        throw new Error("export command not implemented yet.");
    });

program.parse(process.argv);