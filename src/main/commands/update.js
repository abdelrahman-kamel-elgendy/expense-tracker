const chalk = require("chalk");
const { readExpenses, saveExpenses } = require("../utils/storage");
const { validateId, validateAmount, validateDate } = require("../utils/validation");
const { CONFIG } = require("../config");

module.exports = program => {
    program
        .command("update")
        .description("Update an existing expense")
        .requiredOption("-i, --id <id>", "Expense ID to update")
        .option("-d, --description <desc>", "New description")
        .option("-a, --amount <amount>", "New amount")
        .option("-c, --category <category>", "New category")
        .option("--date <date>", "New date (YYYY-MM-DD)")
        .action(opts => {
            const idResult = validateId(opts.id);
            if (!idResult.valid) {
                console.error(chalk.red(`  ✖  ${idResult.message}`));
                process.exit(1);
            }

            const expenses = readExpenses();
            const expense = expenses.find((e) => e.id === idResult.value);
            if (!expense) {
                console.error(chalk.red(`  ✖  Expense with ID ${opts.id} not found.`));
                process.exit(1);
            }

            let updated = false;

            if (opts.description) {
                expense.description = opts.description.trim();
                updated = true;
            }

            if (opts.amount) {
                const amtResult = validateAmount(opts.amount);
                if (!amtResult.valid) {
                    console.error(chalk.red(`  ✖  ${amtResult.message}`));
                    process.exit(1);
                }
                expense.amount = amtResult.value;
                updated = true;
            }

            if (opts.category) {
                expense.category = opts.category.toLowerCase().trim();
                updated = true;
            }

            if (opts.date) {
                const dateResult = validateDate(opts.date);
                if (!dateResult.valid) {
                    console.error(chalk.red(`  ✖  ${dateResult.message}`));
                    process.exit(1);
                }
                expense.date = opts.date;
                updated = true;
            }

            if (!updated) {
                console.log(chalk.yellow("  No updates provided. Use --description, --amount, --category, or --date."));
                return;
            }

            expense.updatedAt = new Date().toISOString();
            saveExpenses(expenses);

            console.log(chalk.green("\n  ✅ Expense updated successfully!"));
            console.log(chalk.gray(`  ${"─".repeat(36)}`));
            console.log(`  ${chalk.gray("ID:")}          ${chalk.white(expense.id)}`);
            console.log(`  ${chalk.gray("Description:")} ${chalk.white(expense.description)}`);
            console.log(`  ${chalk.gray("Amount:")}      ${chalk.green(`${CONFIG.currencySymbol}${expense.amount.toFixed(2)}`)}`);
            console.log(`  ${chalk.gray("Category:")}    ${chalk.white(expense.category)}`);
            console.log(`  ${chalk.gray("Date:")}        ${chalk.white(expense.date)}`);
        });
};


