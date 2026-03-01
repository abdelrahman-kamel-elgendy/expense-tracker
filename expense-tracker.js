const { program } = require("commander");

// ADD
program
    .command("add")
    .requiredOption("--description <desc>", "Expense description")
    .requiredOption("--amount <amount>", "Expense amount")
    .action(options => {
        throw new Error("add command not implemented yet.");
    });

// LIST
program
    .command("list")
    .action(() => {
        throw new Error("list command not implemented yet.");
    });

// DELETE
program
    .command("delete")
    .requiredOption("--id <id>", "Expense ID")
    .action(options => {
        throw new Error("update command not implemented yet.");
    });

// UPDATE
program
    .command("update")
    .requiredOption("--id <id>", "Expense ID")
    .option("--description <desc>", "New description")
    .option("--amount <amount>", "New amount")
    .action(options => {
        throw new Error("update command not implemented yet.");
    });

// SUMMARY
program
    .command("summary")
    .option("--month <month>", "Month number (1-12)")
    .action(options => {
        throw new Error("summary command not implemented yet.");
    });

// EXPORT CSV 
program
    .command("export")
    .action(() => {
        throw new Error("export command not implemented yet.");
    });

program.parse(process.argv);