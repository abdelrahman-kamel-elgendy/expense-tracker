const fs = require("fs");
const { program } = require("commander");
const path = require("path");
const chalk = require("chalk");
const Table = require("cli-table3");

const FILE_PATH = path.join(__dirname, "expenses.json");

// ========= Configuration ========= 
const CONFIG = {
    dateFormat: "YYYY-MM-DD",
    currencySymbol: "$",
    supportedMonths: Array.from({ length: 12 }, (_, i) => i + 1)
};

// ========= Utility Functions ========= 
const readExpenses = () => {
    try {
        if (!fs.existsSync(FILE_PATH))
            return [];

        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(chalk.red(`Error reading expenses: ${error.message}`));
        process.exit(1);
    }
};

const generateId = (expenses) => expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

const formatDate = (date = new Date()) => date.toISOString().split("T")[0];

const saveExpenses = (expenses) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(expenses, null, 2));
    } catch (error) {
        console.error(chalk.red(`Error saving expenses: ${error.message}`));
        process.exit(1);
    }
};

const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0)
        return { valid: false, message: "Amount must be a positive number" };

    if (!Number.isFinite(numAmount))
        return { valid: false, message: "Amount must be a finite number" };

    if (numAmount > 1_000_000_000)
        return { valid: false, message: "Amount is too large (max 1 billion)" };

    return { valid: true, value: parseFloat(numAmount.toFixed(2)) };
};

const validateId = (id) => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0)
        return { valid: false, message: "ID must be a positive integer" };

    return { valid: true, value: numId };
};

const validateMonth = (month) => {
    const numMonth = parseInt(month);
    if (isNaN(numMonth) || numMonth < 1 || numMonth > 12)
        return { valid: false, message: "Month must be between 1 and 12" };

    return { valid: true, value: numMonth };
};

const calculateStats = (expenses) => {
    if (expenses.length === 0) return null;

    const amounts = expenses.map(e => e.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / expenses.length;
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);

    return { total, average, max, min, count: expenses.length };
};

const groupByMonth = (expenses) => {
    return expenses.reduce((acc, expense) => {
        const month = new Date(expense.date).getMonth() + 1;
        if (!acc[month])
            acc[month] = { total: 0, count: 0 };

        acc[month].total += expense.amount;
        acc[month].count += 1;
        return acc;
    }, {});
};

// ========= Display Functions ========= 
const displayExpenseTable = (expenses, title = "Expenses") => {
    if (expenses.length === 0) {
        console.log(chalk.yellow("No expenses to display"));
        return;
    }

    const table = new Table({
        head: [
            chalk.cyan('ID'),
            chalk.cyan('Date'),
            chalk.cyan('Description'),
            chalk.cyan('Amount')
        ],
        colWidths: [10, 12, 30, 15]
    });

    expenses.forEach(e => {
        table.push([
            e.id,
            e.date,
            e.description.length > 27 ? e.description.substring(0, 27) + '...' : e.description,
            `${CONFIG.currencySymbol}${e.amount.toFixed(2)}`
        ]);
    });

    console.log(chalk.bold(`\n${title}:`));
    console.log(table.toString());
};

const displaySummary = (expenses, month = null) => {
    const stats = calculateStats(expenses);
    if (!stats) {
        console.log(chalk.yellow("No expenses found"));
        return;
    }

    const period = month ? `for month ${month}` : "overall";

    console.log(chalk.bold(`\n📊 Expense Summary ${period}:`));
    console.log(chalk.white(`Total: ${CONFIG.currencySymbol}${stats.total.toFixed(2)}`));
    console.log(chalk.white(`Average: ${CONFIG.currencySymbol}${stats.average.toFixed(2)}`));
    console.log(chalk.white(`Highest: ${CONFIG.currencySymbol}${stats.max.toFixed(2)}`));
    console.log(chalk.white(`Lowest: ${CONFIG.currencySymbol}${stats.min.toFixed(2)}`));
    console.log(chalk.white(`Number of expenses: ${stats.count}`));
};

// ========= Commands ========= 

// ADD
program
    .command("add")
    .description("Add a new expense")
    .requiredOption("-d, --description <desc>", "Expense description")
    .requiredOption("-a, --amount <amount>", "Expense amount")
    .option("-c, --category <category>", "Expense category", "other")
    .option("--date <date>", "Expense date (YYYY-MM-DD)", formatDate())
    .action(options => {
        const expenses = readExpenses();
        const amountValidation = validateAmount(options.amount);

        if (!amountValidation.valid) {
            console.error(chalk.red(amountValidation.message));
            process.exit(1);
        }

        // Validate date if provided
        let expenseDate = options.date;
        if (options.date !== formatDate()) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(options.date)) {
                console.error(chalk.red("Invalid date format. Use YYYY-MM-DD"));
                process.exit(1);
            }
        }

        const newExpense = {
            id: generateId(expenses),
            date: expenseDate,
            description: options.description,
            amount: amountValidation.value,
            category: options.category.toLowerCase(),
            createdAt: new Date().toISOString()
        };

        expenses.push(newExpense);
        saveExpenses(expenses);

        console.log(chalk.green("✅ Expense added successfully:"));
        console.log(chalk.white(`ID: ${newExpense.id}`));
        console.log(chalk.white(`Description: ${newExpense.description}`));
        console.log(chalk.white(`Amount: ${CONFIG.currencySymbol}${newExpense.amount.toFixed(2)}`));
        console.log(chalk.white(`Category: ${newExpense.category}`));
        console.log(chalk.white(`Date: ${newExpense.date}`));
    });

// LIST
program
    .command("list")
    .description("List all expenses")
    .option("-c, --category <category>", "Filter by category")
    .option("-m, --month <month>", "Filter by month (1-12)")
    .option("-s, --sort <field>", "Sort by field (date, amount, description)")
    .action(options => {
        let expenses = readExpenses();

        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found!"));
            return;
        }

        // Apply filters
        if (options.category) {
            const category = options.category.toLowerCase();
            expenses = expenses.filter(e => e.category === category);
            if (expenses.length === 0) {
                console.log(chalk.yellow(`No expenses found for category: ${options.category}`));
                return;
            }
        }

        if (options.month) {
            const monthValidation = validateMonth(options.month);
            if (!monthValidation.valid) {
                console.error(chalk.red(monthValidation.message));
                process.exit(1);
            }
            expenses = expenses.filter(e => {
                const expenseMonth = new Date(e.date).getMonth() + 1;
                return expenseMonth === monthValidation.value;
            });
            if (expenses.length === 0) {
                console.log(chalk.yellow(`No expenses found for month ${options.month}`));
                return;
            }
        }

        // Apply sorting
        if (options.sort) {
            const sortField = options.sort.toLowerCase();
            if (['date', 'amount', 'description'].includes(sortField)) {
                expenses.sort((a, b) => {
                    if (sortField === 'date') return new Date(b.date) - new Date(a.date);
                    if (sortField === 'amount') return b.amount - a.amount;
                    return a.description.localeCompare(b.description);
                });
            }
        }

        displayExpenseTable(expenses, "All Expenses");

        // Show summary
        const stats = calculateStats(expenses);
        console.log(chalk.gray(`\nTotal: ${CONFIG.currencySymbol}${stats.total.toFixed(2)} | Average: ${CONFIG.currencySymbol}${stats.average.toFixed(2)}`));
    });

// DELETE
program
    .command("delete")
    .description("Delete an expense")
    .requiredOption("-i, --id <id>", "Expense ID")
    .option("-f, --force", "Skip confirmation")
    .action(options => {
        const idValidation = validateId(options.id);
        if (!idValidation.valid) {
            console.error(chalk.red(idValidation.message));
            process.exit(1);
        }

        const expenses = readExpenses();
        if (expenses.length === 0) {
            console.error(chalk.red("No expenses found."));
            process.exit(1);
        }

        const expenseIndex = expenses.findIndex(e => e.id === idValidation.value);

        if (expenseIndex === -1) {
            console.error(chalk.red(`Expense with ID ${idValidation.value} not found.`));
            process.exit(1);
        }

        const deletedExpense = expenses[expenseIndex];

        // Confirmation unless force flag is used
        if (!options.force) {
            console.log(chalk.yellow("\nExpense to delete:"));
            console.log(chalk.white(`ID: ${deletedExpense.id}`));
            console.log(chalk.white(`Description: ${deletedExpense.description}`));
            console.log(chalk.white(`Amount: ${CONFIG.currencySymbol}${deletedExpense.amount.toFixed(2)}`));

            // Simple confirmation - in a real app you might want to use readline
            console.log(chalk.yellow("\nUse --force flag to delete without confirmation"));
            return;
        }

        expenses.splice(expenseIndex, 1);
        saveExpenses(expenses);

        console.log(chalk.green("✅ Expense deleted successfully:"));
        console.log(chalk.white(`ID: ${deletedExpense.id}`));
        console.log(chalk.white(`Description: ${deletedExpense.description}`));
        console.log(chalk.white(`Amount: ${CONFIG.currencySymbol}${deletedExpense.amount.toFixed(2)}`));
    });

// UPDATE
program
    .command("update")
    .description("Update an expense")
    .requiredOption("-i, --id <id>", "Expense ID")
    .option("-d, --description <desc>", "New description")
    .option("-a, --amount <amount>", "New amount")
    .option("-c, --category <category>", "New category")
    .option("--date <date>", "New date (YYYY-MM-DD)")
    .action((options) => {
        const expenses = readExpenses();
        const idValidation = validateId(options.id);

        if (!idValidation.valid) {
            console.error(chalk.red(idValidation.message));
            process.exit(1);
        }

        const expense = expenses.find(e => e.id === idValidation.value);
        if (!expense) {
            console.error(chalk.red(`Expense with ID ${options.id} not found.`));
            return;
        }

        let updated = false;

        if (options.description) {
            expense.description = options.description;
            updated = true;
        }

        if (options.amount) {
            const amountValidation = validateAmount(options.amount);
            if (!amountValidation.valid) {
                console.error(chalk.red(amountValidation.message));
                return;
            }
            expense.amount = amountValidation.value;
            updated = true;
        }

        if (options.category) {
            expense.category = options.category.toLowerCase();
            updated = true;
        }

        if (options.date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(options.date)) {
                console.error(chalk.red("Invalid date format. Use YYYY-MM-DD"));
                return;
            }
            expense.date = options.date;
            updated = true;
        }

        if (updated) {
            saveExpenses(expenses);
            console.log(chalk.green("✅ Expense updated successfully:"));
            console.log(chalk.white(`ID: ${expense.id}`));
            console.log(chalk.white(`Description: ${expense.description}`));
            console.log(chalk.white(`Amount: ${CONFIG.currencySymbol}${expense.amount.toFixed(2)}`));
            console.log(chalk.white(`Category: ${expense.category}`));
            console.log(chalk.white(`Date: ${expense.date}`));
        } else {
            console.log(chalk.yellow("No updates provided. Use --description, --amount, --category, or --date"));
        }
    });

// SUMMARY
program
    .command("summary")
    .description("Show expense summary")
    .option("-m, --month <month>", "Month number (1-12)")
    .option("-c, --category <category>", "Filter by category")
    .option("-y, --year <year>", "Year (YYYY)")
    .option("--detailed", "Show detailed breakdown")
    .action((options) => {
        let expenses = readExpenses();

        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found!"));
            return;
        }

        // Apply filters
        if (options.month) {
            const monthValidation = validateMonth(options.month);
            if (!monthValidation.valid) {
                console.error(chalk.red(monthValidation.message));
                process.exit(1);
            }
            expenses = expenses.filter(e => {
                const expenseMonth = new Date(e.date).getMonth() + 1;
                return expenseMonth === monthValidation.value;
            });
        }

        if (options.category) {
            const category = options.category.toLowerCase();
            expenses = expenses.filter(e => e.category === category);
        }

        if (options.year) {
            const year = parseInt(options.year);
            expenses = expenses.filter(e => new Date(e.date).getFullYear() === year);
        }

        if (options.detailed) {
            // Show detailed breakdown by month
            const monthlyBreakdown = groupByMonth(expenses);

            console.log(chalk.bold("\n📊 Detailed Monthly Breakdown:"));
            const table = new Table({
                head: [chalk.cyan('Month'), chalk.cyan('Expenses'), chalk.cyan('Total'), chalk.cyan('Average')]
            });

            Object.entries(monthlyBreakdown)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .forEach(([month, data]) => {
                    const monthName = new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
                    const avg = data.total / data.count;
                    table.push([
                        monthName,
                        data.count,
                        `${CONFIG.currencySymbol}${data.total.toFixed(2)}`,
                        `${CONFIG.currencySymbol}${avg.toFixed(2)}`
                    ]);
                });

            console.log(table.toString());
        }

        displaySummary(expenses, options.month);
    });

// EXPORT
program
    .command("export")
    .description("Export expenses to CSV")
    .option("-f, --format <format>", "Export format (csv, json)", "csv")
    .option("-o, --output <file>", "Output file name")
    .action((options) => {
        const expenses = readExpenses();

        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses to export!"));
            return;
        }

        const format = options.format.toLowerCase();
        const outputFile = options.output || `expenses_${formatDate()}.${format}`;

        try {
            if (format === 'csv') {
                const csvHeader = "ID,Date,Description,Amount,Category\n";
                const csvRows = expenses
                    .map(e => `${e.id},${e.date},"${e.description}",${e.amount},${e.category || 'other'}`)
                    .join("\n");

                fs.writeFileSync(outputFile, csvHeader + csvRows);
            } else if (format === 'json') {
                fs.writeFileSync(outputFile, JSON.stringify(expenses, null, 2));
            } else {
                console.error(chalk.red(`Unsupported format: ${format}. Use 'csv' or 'json'`));
                return;
            }

            console.log(chalk.green(`✅ Expenses exported to ${outputFile}`));
        } catch (error) {
            console.error(chalk.red(`Error exporting expenses: ${error.message}`));
        }
    });

// BUDGET (New Feature)
program
    .command("budget")
    .description("Set monthly budget")
    .requiredOption("-a, --amount <amount>", "Monthly budget amount")
    .option("-m, --month <month>", "Month number (1-12)", new Date().getMonth() + 1)
    .action((options) => {
        const amountValidation = validateAmount(options.amount);
        if (!amountValidation.valid) {
            console.error(chalk.red(amountValidation.message));
            process.exit(1);
        }

        const monthValidation = validateMonth(options.month);
        if (!monthValidation.valid) {
            console.error(chalk.red(monthValidation.message));
            process.exit(1);
        }

        const expenses = readExpenses();
        const currentMonthExpenses = expenses.filter(e => {
            const expenseMonth = new Date(e.date).getMonth() + 1;
            return expenseMonth === monthValidation.value;
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const budget = amountValidation.value;
        const remaining = budget - totalSpent;

        console.log(chalk.bold(`\n💰 Budget Analysis for Month ${monthValidation.value}:`));
        console.log(chalk.white(`Budget: ${CONFIG.currencySymbol}${budget.toFixed(2)}`));
        console.log(chalk.white(`Spent: ${CONFIG.currencySymbol}${totalSpent.toFixed(2)}`));
        console.log(chalk.white(`Remaining: ${CONFIG.currencySymbol}${remaining.toFixed(2)}`));

        if (remaining < 0) {
            console.log(chalk.red(`⚠️  Over budget by ${CONFIG.currencySymbol}${Math.abs(remaining).toFixed(2)}`));
        } else if (remaining < budget * 0.1) {
            console.log(chalk.yellow(`⚠️  Close to budget limit`));
        } else {
            console.log(chalk.green(`✅ Within budget`));
        }
    });

// SEARCH (New Feature)
program
    .command("search")
    .description("Search expenses")
    .option("-k, --keyword <keyword>", "Search by keyword in description")
    .option("-c, --category <category>", "Filter by category")
    .option("--start-date <date>", "Start date (YYYY-MM-DD)")
    .option("--end-date <date>", "End date (YYYY-MM-DD)")
    .action((options) => {
        let expenses = readExpenses();

        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found!"));
            return;
        }

        // Apply search filters
        if (options.keyword) {
            const keyword = options.keyword.toLowerCase();
            expenses = expenses.filter(e =>
                e.description.toLowerCase().includes(keyword)
            );
        }

        if (options.category) {
            const category = options.category.toLowerCase();
            expenses = expenses.filter(e => e.category === category);
        }

        if (options.minAmount) {
            const minAmount = parseFloat(options.minAmount);
            if (!isNaN(minAmount)) {
                expenses = expenses.filter(e => e.amount >= minAmount);
            }
        }

        if (options.maxAmount) {
            const maxAmount = parseFloat(options.maxAmount);
            if (!isNaN(maxAmount)) {
                expenses = expenses.filter(e => e.amount <= maxAmount);
            }
        }

        if (options.startDate) {
            const startDate = new Date(options.startDate);
            expenses = expenses.filter(e => new Date(e.date) >= startDate);
        }

        if (options.endDate) {
            const endDate = new Date(options.endDate);
            expenses = expenses.filter(e => new Date(e.date) <= endDate);
        }

        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses match your search criteria"));
            return;
        }

        displayExpenseTable(expenses, "Search Results");
        console.log(chalk.gray(`Found ${expenses.length} expense(s)`));
    });

// STATS (New Feature)
program
    .command("stats")
    .description("Show expense statistics")
    .option("-y, --year <year>", "Year (YYYY)", new Date().getFullYear())
    .action((options) => {
        const expenses = readExpenses();

        if (expenses.length === 0) {
            console.log(chalk.yellow("No expenses found!"));
            return;
        }

        const year = parseInt(options.year);
        const yearExpenses = expenses.filter(e =>
            new Date(e.date).getFullYear() === year
        );

        if (yearExpenses.length === 0) {
            console.log(chalk.yellow(`No expenses found for year ${year}`));
            return;
        }

        const stats = calculateStats(yearExpenses);
        const monthlyBreakdown = groupByYearMonth(yearExpenses);

        console.log(chalk.bold(`\n📈 Statistics for ${year}:`));

        // Overall stats
        console.log(chalk.white(`\nOverall:`));
        console.log(chalk.white(`  Total: ${CONFIG.currencySymbol}${stats.total.toFixed(2)}`));
        console.log(chalk.white(`  Average per expense: ${CONFIG.currencySymbol}${stats.average.toFixed(2)}`));
        console.log(chalk.white(`  Number of expenses: ${stats.count}`));
        console.log(chalk.white(`  Highest expense: ${CONFIG.currencySymbol}${stats.max.toFixed(2)}`));
        console.log(chalk.white(`  Lowest expense: ${CONFIG.currencySymbol}${stats.min.toFixed(2)}`));

        // Monthly breakdown
        console.log(chalk.white(`\nMonthly Breakdown:`));
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        monthNames.forEach((month, index) => {
            const monthData = monthlyBreakdown[index + 1];
            if (monthData) {
                console.log(chalk.white(`  ${month}: ${CONFIG.currencySymbol}${monthData.total.toFixed(2)} (${monthData.count} expenses)`));
            } else {
                console.log(chalk.gray(`  ${month}: No expenses`));
            }
        });

        // Category breakdown
        const categoryBreakdown = expenses.reduce((acc, e) => {
            const cat = e.category || 'other';
            if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
            acc[cat].total += e.amount;
            acc[cat].count += 1;
            return acc;
        }, {});

        console.log(chalk.white(`\nCategory Breakdown:`));
        Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b.total - a.total)
            .forEach(([category, data]) => {
                const percentage = (data.total / stats.total * 100).toFixed(1);
                console.log(chalk.white(`  ${category}: ${CONFIG.currencySymbol}${data.total.toFixed(2)} (${percentage}%, ${data.count} expenses)`));
            });
    });

// Helper function for stats command
const groupByYearMonth = (expenses) => {
    return expenses.reduce((acc, expense) => {
        const month = new Date(expense.date).getMonth() + 1;
        if (!acc[month]) {
            acc[month] = { total: 0, count: 0 };
        }
        acc[month].total += expense.amount;
        acc[month].count += 1;
        return acc;
    }, {});
};

// Add help menu customization
program
    .name("expense-tracker")
    .description("💰 Personal Expense Tracker CLI")
    .version("2.0.0")
    .addHelpText('after', `
Examples:
  $ expense-tracker add --description "Lunch" --amount 15.50 --category food
  $ expense-tracker list --category food --sort amount
  $ expense-tracker summary --month 3 --detailed
  $ expense-tracker budget --amount 1000
  $ expense-tracker search --keyword "coffee" --min-amount 5
  $ expense-tracker stats --year 2024

For more information, visit: https://github.com/yourusername/expense-tracker
`);

program.parse(process.argv);