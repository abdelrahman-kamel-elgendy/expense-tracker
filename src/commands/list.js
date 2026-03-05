const chalk = require("chalk");
const { readExpenses, calculateStats } = require("../utils/storage");
const { validateMonth } = require("../utils/validation");
const { displayExpenseTable } = require("../utils/display");
const { CONFIG } = require("../config");

const SORT_FIELDS = [
    "date",
    "amount",
    "description",
    "category"
];


module.exports = program => {
    program
        .command("list")
        .description("List expenses with optional filters and sorting")
        .option("-c, --category <category>", "Filter by category")
        .option("-m, --month <month>", "Filter by month (1–12)")
        .option("-s, --sort <field>", `Sort by: ${SORT_FIELDS.join(", ")}`, "date")
        .option("--asc", "Sort ascending (default is descending)")
        .action(opts => {
            let expenses = readExpenses();

            if (!expenses.length) {
                console.log(chalk.yellow("  No expenses found!"));
                return;
            }

            // == Filters =========================================================
            if (opts.category) {
                const cat = opts.category.toLowerCase();
                expenses = expenses.filter(e => e.category === cat);
                if (!expenses.length) {
                    console.log(chalk.yellow(`  No expenses in category "${opts.category}".`));
                    return;
                }
            }

            if (opts.month) {
                const mResult = validateMonth(opts.month);
                if (!mResult.valid) {
                    console.error(chalk.red(`  ✖  ${mResult.message}`));
                    process.exit(1);
                }

                expenses = expenses.filter(e => new Date(e.date).getMonth() + 1 === mResult.value);
                if (!expenses.length) {
                    console.log(chalk.yellow(`  No expenses for month ${opts.month}.`));
                    return;
                }
            }

            // == Sorting ==========================================================
            const field = (opts.sort || "date").toLowerCase();
            if (SORT_FIELDS.includes(field)) {
                expenses.sort((a, b) => {
                    let cmp = 0;
                    if (field === "date")
                        cmp = new Date(b.date) - new Date(a.date);
                    else if (field === "amount")
                        cmp = b.amount - a.amount;
                    else
                        cmp = a[field].localeCompare(b[field]);

                    return opts.asc ? -cmp : cmp;
                });
            }

            displayExpenseTable(expenses, "All Expenses");

            const stats = calculateStats(expenses);
            console.log(
                chalk.gray(
                    `  Total: ${CONFIG.currencySymbol}${stats.total.toFixed(2)}` +
                    `  |  Avg: ${CONFIG.currencySymbol}${stats.average.toFixed(2)}` +
                    `  |  Count: ${stats.count}`
                )
            );
        });
};