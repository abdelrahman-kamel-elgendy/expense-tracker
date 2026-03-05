const chalk = require("chalk");
const { readExpenses, saveExpenses } = require("../utils/storage");
const { validateId } = require("../utils/validation");
const { CONFIG } = require("../config");

module.exports = program => {
    program
        .command("delete")
        .description("Delete an expense by ID")
        .requiredOption("-i, --id <id>", "Expense ID to delete")
        .option("-f, --force", "Skip confirmation prompt")
        .action(opts => {
            const idResult = validateId(opts.id);
            if (!idResult.valid) {
                console.error(chalk.red(`  ✖  ${idResult.message}`));
                process.exit(1);
            }

            const expenses = readExpenses();
            if (!expenses.length) {
                console.error(chalk.red("  ✖  No expenses found."));
                process.exit(1);
            }

            const idx = expenses.findIndex(e => e.id === idResult.value);
            if (idx === -1) {
                console.error(chalk.red(`  ✖  Expense with ID ${idResult.value} not found.`));
                process.exit(1);
            }

            const target = expenses[idx];
            if (!opts.force) {
                console.log(chalk.yellow("\n  Expense to delete:"));
                console.log(`  ${chalk.gray("ID:")}          ${target.id}`);
                console.log(`  ${chalk.gray("Description:")} ${target.description}`);
                console.log(`  ${chalk.gray("Amount:")}      ${CONFIG.currencySymbol}${target.amount.toFixed(2)}`);
                console.log(chalk.yellow("\n  Run again with --force to confirm deletion."));
                return;
            }

            expenses.splice(idx, 1);
            saveExpenses(expenses);

            console.log(chalk.green("\n  ✅ Expense deleted successfully."));
            console.log(`  ${chalk.gray("ID:")}          ${target.id}`);
            console.log(`  ${chalk.gray("Description:")} ${target.description}`);
            console.log(`  ${chalk.gray("Amount:")}      ${chalk.red(`${CONFIG.currencySymbol}${target.amount.toFixed(2)}`)}`);

        });
};