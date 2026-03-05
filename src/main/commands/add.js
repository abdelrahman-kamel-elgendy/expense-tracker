const chalk = require("chalk");
const { readExpenses, generateId, saveExpenses } = require("../utils/storage");
const { validateAmount, validateDate } = require("../utils/validation");
const { CONFIG } = require("../config");

module.exports = program => {
    program
        .command("add")
        .description("Add a new expense")
        .requiredOption("-d, -description <desc>", "Expense description")
        .requiredOption("-a, --amount <amount>", "Expense amount")
        .option("-c, --category <category>", "Expense category", "other")
        .option("--date <date>", "Expense date (YYYY-MM-DD)")
        .action(opts => {
            // Validate amount
            const amtResult = validateAmount(opts.amount);
            if (!amtResult.valid) {
                console.error(chalk.red(`  ✖  ${amtResult.message}`));
                process.exit(1);
            }

            // Validate / default date
            const dateStr = opts.date || formatDate();
            if (opts.date) {
                const dateResult = validateDate(opts.date);
                if (!dateResult.valid) {
                    console.error(chalk.red(`  ✖  ${dateResult.message}`));
                    process.exit(1);
                }
            }

            const expenses = readExpenses();
            const newExpense = {
                id: generateId(expenses),
                date: dateStr,
                description: opts.description.trim(),
                amount: amtResult.value,
                category: opts.category.toLowerCase().trim(),
                createdAt: new Date().toISOString(),
            };

            expenses.push(newExpense);
            saveExpenses(expenses);

            console.log(chalk.green("\n  ✅ Expense added successfully!"));
            console.log(chalk.gray(`  ${"─".repeat(36)}`));
            console.log(`  ${chalk.gray("ID:")}          ${chalk.white(newExpense.id)}`);
            console.log(`  ${chalk.gray("Description:")} ${chalk.white(newExpense.description)}`);
            console.log(`  ${chalk.gray("Amount:")}      ${chalk.green(`${CONFIG.currencySymbol}${newExpense.amount.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Category:")}    ${chalk.white(newExpense.category)}`);
            console.log(`  ${chalk.gray("Date:")}        ${chalk.white(newExpense.date)}`);
        });
};