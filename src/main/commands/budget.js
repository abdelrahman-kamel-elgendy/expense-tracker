const chalk = require("chalk");
const { readExpenses } = require("../utils/storage");
const { validateAmount, validateMonth } = require("../utils/validation");
const { renderBudgetBar } = require("../utils/charts");
const { CONFIG } = require("../config");

module.exports = program => {
    program
        .command("budget")
        .description("Check spending against a monthly budget")
        .requiredOption("-a, --amount <amount>", "Monthly budget amount")
        .option("-m, --month <month>", "Month (1–12)", String(new Date().getMonth() + 1))
        .option("-y, --year <year>", "Year (YYYY)", String(new Date().getFullYear()))
        .action(opts => {
            const amtResult = validateAmount(opts.amount);
            if (!amtResult.valid) {
                console.error(chalk.red(`  ✖  ${amtResult.message}`));
                process.exit(1);
            }

            const mResult = validateMonth(opts.month);
            if (!mResult.valid) {
                console.error(chalk.red(`  ✖  ${mResult.message}`));
                process.exit(1);
            }

            const year = parseInt(opts.year);
            const month = mResult.value;
            const budget = amtResult.value;

            const expenses = readExpenses();
            const filtered = expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() + 1 === month && d.getFullYear() === year;
            });

            const { MONTH_NAMES } = require("../config");
            const label = `${MONTH_NAMES[month - 1]} ${year}`;
            const spent = filtered.reduce((s, e) => s + e.amount, 0);
            const remain = budget - spent;

            console.log(chalk.bold(`\n  💰 Budget Analysis — ${label}`));
            console.log(chalk.gray(`  ${"─".repeat(44)}`));
            console.log(`  ${chalk.gray("Budget:      ")} ${chalk.white(`${CONFIG.currencySymbol}${budget.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Spent:       ")} ${chalk.white(`${CONFIG.currencySymbol}${spent.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Remaining:   ")} ${remain >= 0
                ? chalk.green(`${CONFIG.currencySymbol}${remain.toFixed(2)}`)
                : chalk.red(`-${CONFIG.currencySymbol}${Math.abs(remain).toFixed(2)}`)
                }`);
            console.log(`  ${chalk.gray("Expenses:    ")} ${chalk.white(filtered.length)}`);

            renderBudgetBar(spent, budget);

            // Status message
            if (remain < 0) {
                console.log(chalk.red(`\n  ⚠️  Over budget by ${CONFIG.currencySymbol}${Math.abs(remain).toFixed(2)}!`));
            } else if (remain < budget * 0.1) {
                console.log(chalk.yellow(`\n  ⚠️  Approaching limit — only ${CONFIG.currencySymbol}${remain.toFixed(2)} remaining.`));
            } else {
                console.log(chalk.green(`\n  ✅ Within budget.`));
            }
        });
};