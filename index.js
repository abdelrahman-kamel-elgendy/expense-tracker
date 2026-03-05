#!/usr/bin/env node

"use strict";

const { program } = require("commander");

// ── Register all commands ──────────────────────────────────────────────────────
require("./src/commands/add")(program);
require("./src/commands/list")(program);
require("./src/commands/delete")(program);
require("./src/commands/update")(program);
require("./src/commands/summary")(program);
require("./src/commands/stats")(program);
require("./src/commands/budget")(program);
require("./src/commands/search")(program);
require("./src/commands/export")(program);
require("./src/commands/import")(program);

// ── CLI metadata ───────────────────────────────────────────────────────────────
program
    .name("expense-tracker")
    .description("💰 Personal Expense Tracker CLI")
    .version("3.0.0")
    .addHelpText(
        "after",
        `
Examples:
  $ expense-tracker add -d "Lunch" -a 15.50 -c food
  $ expense-tracker list -c food -s amount
  $ expense-tracker summary --year 2025 --detailed
  $ expense-tracker stats --year 2025
  $ expense-tracker budget -a 1000 -m 3
  $ expense-tracker search -k "coffee" --min-amount 5 --max-amount 20
  $ expense-tracker import -f bank_export.csv --auto-category --dry-run
  $ expense-tracker export -f csv -o my_expenses.csv

Docs: https://github.com/abdelrahman-kamel/expense-tracker
`
    );

program.parse(process.argv);