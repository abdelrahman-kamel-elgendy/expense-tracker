const fs = require("fs");
const chalk = require("chalk");
const { readExpenses } = require("../utils/storage");
const { formatDate } = require("../utils/storage");

const FORMATS = ["csv", "json"];

module.exports = program => {
    program
        .command("export")
        .description("Export expenses to CSV or JSON")
        .option("-f, --format <format>", `Export format: ${FORMATS.join(", ")}`, "csv")
        .option("-o, --output <file>", "Output filename")
        .action(opts => {
            const expenses = readExpenses();

            if (!expenses.length) {
                console.log(chalk.yellow("  No expenses to export!"));
                return;
            }

            const format = opts.format.toLowerCase();
            if (!FORMATS.includes(format)) {
                console.error(chalk.red(`  ✖  Unsupported format "${format}". Use: ${FORMATS.join(", ")}`));
                process.exit(1);
            }

            const outFile = opts.output || `expenses_${formatDate()}.${format}`;

            try {
                if (format === "csv") {
                    const header = "ID,Date,Description,Amount,Category\n";
                    const rows = expenses
                        .map((e) => `${e.id},${e.date},"${e.description}",${e.amount},${e.category || "other"}`)
                        .join("\n");
                    fs.writeFileSync(outFile, header + rows);
                } else {
                    fs.writeFileSync(outFile, JSON.stringify(expenses, null, 2));
                }

                console.log(chalk.green(`\n  ✅ Exported ${expenses.length} expense(s) to ${chalk.white(outFile)}`));
            } catch (err) {
                console.error(chalk.red(`  ✖  Error exporting: ${err.message}`));
                process.exit(1);
            }
        });
};