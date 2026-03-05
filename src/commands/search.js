const chalk = require("chalk");
const { readExpenses, calculateStats } = require("../utils/storage");
const { validateDate } = require("../utils/validation");
const { displayExpenseTable } = require("../utils/display");
const { CONFIG } = require("../config");

module.exports = program => {
    program
        .command("search")
        .description("Search and filter expenses")
        .option("-k, --keyword <keyword>", "Search keyword in description")
        .option("-c, --category <category>", "Filter by category")
        .option("--min-amount <amount>", "Minimum amount filter")
        .option("--max-amount <amount>", "Maximum amount filter")
        .option("--start-date <date>", "Start date (YYYY-MM-DD)")
        .option("--end-date <date>", "End date (YYYY-MM-DD)")
        .action(opts => {
            let expenses = readExpenses();

            if (!expenses.length) {
                console.log(chalk.yellow("  No expenses found!"));
                return;
            }

            // ── Filters ──────────────────────────────────────────────────────────
            if (opts.keyword) {
                const kw = opts.keyword.toLowerCase();
                expenses = expenses.filter(e =>
                    e.description.toLowerCase().includes(kw)
                );
            }

            if (opts.category) {
                const cat = opts.category.toLowerCase();
                expenses = expenses.filter(e => e.category === cat);
            }

            if (opts.minAmount) {
                const min = parseFloat(opts.minAmount);
                if (!isNaN(min)) expenses = expenses.filter(e => e.amount >= min);
            }

            if (opts.maxAmount) {
                const max = parseFloat(opts.maxAmount);
                if (!isNaN(max)) expenses = expenses.filter(e => e.amount <= max);
            }

            if (opts.startDate) {
                const result = validateDate(opts.startDate);
                if (!result.valid) {
                    console.error(chalk.red(`  ✖  Start date: ${result.message}`));
                    process.exit(1);
                }
                const start = new Date(opts.startDate);
                expenses = expenses.filter(e => new Date(e.date) >= start);
            }

            if (opts.endDate) {
                const result = validateDate(opts.endDate);
                if (!result.valid) {
                    console.error(chalk.red(`  ✖  End date: ${result.message}`));
                    process.exit(1);
                }
                const end = new Date(opts.endDate);
                expenses = expenses.filter(e => new Date(e.date) <= end);
            }

            if (!expenses.length) {
                console.log(chalk.yellow("  No expenses match your search criteria."));
                return;
            }

            displayExpenseTable(expenses, "Search Results");

            const stats = calculateStats(expenses);
            console.log(
                chalk.gray(
                    `  Found ${expenses.length} expense(s)  |  ` +
                    `Total: ${CONFIG.currencySymbol}${stats.total.toFixed(2)}  |  ` +
                    `Avg: ${CONFIG.currencySymbol}${stats.average.toFixed(2)}`
                )
            );
        });
};