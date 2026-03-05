const chalk = require("chalk");
const Table = require("cli-table3");
const storage = require("./storage.js");
const { currencySymbol, MONTH_NAMES_FULL } = require("../config");

const formatCurrency = (amount) => `${currencySymbol}${amount.toFixed(2)}`;

const getMonthLabel = (monthNum) => MONTH_NAMES_FULL[monthNum - 1] || `Month ${monthNum}`;

const displayExpenseTable = (expenses, title = "Expenses") => {
    if (!expenses.length) {
        console.log(chalk.yellow("No expenses to display"));
        return;
    }

    const table = new Table({
        head: [
            chalk.cyan("ID"),
            chalk.cyan("Date"),
            chalk.cyan("Description"),
            chalk.cyan("Category"),
            chalk.cyan("Amount")
        ],

        colWidths: [6, 12, 30, 14, 12],
    });

    expenses.forEach((e) => {
        table.push([
            e.id, e.date,
            e.description.length > 27 ? e.description.slice(0, 27) + "…" : e.description,
            e.category || "other",
            chalk.green(formatCurrency(e.amount)),
        ]);
    });

    console.log(chalk.bold(`\n${title}:`));
    console.log(table.toString());
};

const displaySummaryStats = (expenses, label = "Overall") => {
    const stats = storage.calculateStats(expenses);
    if (!stats) {
        console.log(chalk.yellow("No expenses found"));
        return;
    }

    console.log(chalk.bold(`\n📊 Summary — ${label}`));
    console.log(chalk.gray("─".repeat(40)));
    console.log(`  ${chalk.white("Total:")}    ${chalk.green(formatCurrency(stats.total))}`);
    console.log(`  ${chalk.white("Average:")}  ${chalk.yellow(formatCurrency(stats.average))}`);
    console.log(`  ${chalk.white("Highest:")}  ${chalk.red(formatCurrency(stats.max))}`);
    console.log(`  ${chalk.white("Lowest:")}   ${chalk.cyan(formatCurrency(stats.min))}`);
    console.log(`  ${chalk.white("Count:")}    ${chalk.white(stats.count + " expenses")}`);
};


module.exports = {
    formatCurrency,
    displayExpenseTable,
    displaySummaryStats,
    getMonthLabel
};