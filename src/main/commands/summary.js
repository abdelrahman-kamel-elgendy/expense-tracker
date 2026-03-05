const chalk = require("chalk");
const { readExpenses, groupByMonth, groupByCategory } = require("../utils/storage");
const { validateMonth } = require("../utils/validation");
const { displaySummary, displayMonthlyTable } = require("../utils/display");
const { renderMonthlyChart, renderCategoryChart, renderSparkline } = require("../utils/charts");

module.exports = (program) => {
    program
        .command("summary")
        .description("Show expense summary with charts")
        .option("-m, --month <month>", "Filter by month (1–12)")
        .option("-c, --category <cat>", "Filter by category")
        .option("-y, --year <year>", "Filter by year (YYYY)", String(new Date().getFullYear()))
        .option("--detailed", "Show month-by-month table")
        .option("--no-chart", "Skip visual charts")
        .action((opts) => {
            let expenses = readExpenses();

            if (!expenses.length) {
                console.log(chalk.yellow("  No expenses found!"));
                return;
            }

            // == Year filter (always applied) =====================================
            const year = parseInt(opts.year);
            expenses = expenses.filter(e => new Date(e.date).getFullYear() === year);

            if (!expenses.length) {
                console.log(chalk.yellow(`  No expenses found for ${year}.`));
                return;
            }

            // == Optional month filter ============================================
            if (opts.month) {
                const mResult = validateMonth(opts.month);
                if (!mResult.valid) {
                    console.error(chalk.red(`  ✖  ${mResult.message}`));
                    process.exit(1);
                }
                expenses = expenses.filter(
                    e => new Date(e.date).getMonth() + 1 === mResult.value
                );
            }

            // == Optional category filter =========================================
            if (opts.category) {
                const cat = opts.category.toLowerCase();
                expenses = expenses.filter(e => e.category === cat);
            }

            // == Summary stats ====================================================
            const label = opts.month
                ? `${require("../config").MONTH_NAMES[parseInt(opts.month) - 1]} ${year}`
                : String(year);
            displaySummary(expenses, label);

            // == Charts (unless --no-chart) =======================================
            if (opts.chart !== false) {
                const monthly = groupByMonth(expenses);
                const cats = groupByCategory(expenses);
                const total = expenses.reduce((s, e) => s + e.amount, 0);

                if (!opts.month) {
                    renderMonthlyChart(monthly, year);
                    console.log(renderSparkline(monthly));
                }

                renderCategoryChart(cats, total);
            }

            // == Detailed monthly table ===========================================
            if (opts.detailed && !opts.month) {
                const monthly = groupByMonth(expenses);
                displayMonthlyTable(monthly);
            }
        });
};