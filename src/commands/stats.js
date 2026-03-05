const chalk = require("chalk");
const { readExpenses, calculateStats, groupByMonth, groupByCategory } = require("../utils/storage");
const { renderMonthlyChart, renderCategoryChart, renderSparkline } = require("../utils/charts");
const { CONFIG, MONTH_SHORT } = require("../config");

module.exports = program => {
    program
        .command("stats")
        .description("Show detailed yearly statistics with charts")
        .option("-y, --year <year>", "Year (YYYY)", String(new Date().getFullYear()))
        .option("--no-chart", "Show only numbers, skip charts")
        .action(opts => {
            const expenses = readExpenses();

            if (!expenses.length) {
                console.log(chalk.yellow("  No expenses found!"));
                return;
            }

            const year = parseInt(opts.year);
            const yearExpenses = expenses.filter(
                e => new Date(e.date).getFullYear() === year
            );

            if (!yearExpenses.length) {
                console.log(chalk.yellow(`  No expenses found for year ${year}.`));
                return;
            }

            const stats = calculateStats(yearExpenses);
            const monthly = groupByMonth(yearExpenses);
            const cats = groupByCategory(yearExpenses);

            // == Header ===========================================================
            console.log(chalk.bold(`\n  📈 Statistics for ${year}`));
            console.log(chalk.gray(`  ${"=".repeat(44)}`));
            console.log(`  ${chalk.gray("Total expenses:  ")} ${chalk.white(stats.count)}`);
            console.log(`  ${chalk.gray("Total spent:     ")} ${chalk.green(`${CONFIG.currencySymbol}${stats.total.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Average/expense: ")} ${chalk.white(`${CONFIG.currencySymbol}${stats.average.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Avg/month:       ")} ${chalk.white(`${CONFIG.currencySymbol}${(stats.total / 12).toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Highest:         ")} ${chalk.red(`${CONFIG.currencySymbol}${stats.max.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Lowest:          ")} ${chalk.cyan(`${CONFIG.currencySymbol}${stats.min.toFixed(2)}`)}`);

            // == Charts ===========================================================
            if (opts.chart !== false) {
                renderMonthlyChart(monthly, year);
                console.log(renderSparkline(monthly));
                renderCategoryChart(cats, stats.total);
            } else {
                // Text monthly breakdown
                console.log(chalk.bold("\n  Monthly Breakdown:"));
                MONTH_SHORT.forEach((m, i) => {
                    const data = monthly[i + 1];
                    if (data) {
                        console.log(
                            `  ${chalk.white(m.padEnd(4))} ${chalk.green(`${CONFIG.currencySymbol}${data.total.toFixed(2)}`)}` +
                            chalk.gray(` (${data.count})`)
                        );
                    } else {
                        console.log(`  ${chalk.gray(m.padEnd(4))} ${chalk.gray("—")}`);
                    }
                });

                // Text category breakdown
                console.log(chalk.bold("\n  Category Breakdown:"));
                Object.entries(cats)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .forEach(([cat, data]) => {
                        const pct = ((data.total / stats.total) * 100).toFixed(1);
                        console.log(
                            `  ${chalk.white(cat.padEnd(15))} ` +
                            `${chalk.green(`${CONFIG.currencySymbol}${data.total.toFixed(2)}`)} ` +
                            chalk.gray(`(${pct}%, ${data.count})`)
                        );
                    });
            }
        });
};