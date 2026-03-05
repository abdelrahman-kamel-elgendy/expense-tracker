# 💰 Expense Tracker CLI

A personal expense tracker that runs entirely in your terminal. Add expenses, set budgets, visualize spending with charts, and import directly from bank statement CSV exports — no GUI, no internet, no accounts needed.

Built with Node.js. All data is stored locally in `expenses.json`.

---

## Table of Contents

- [Installation](#installation)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Commands](#commands)
  - [add](#add)
  - [list](#list)
  - [delete](#delete)
  - [update](#update)
  - [summary](#summary)
  - [stats](#stats)
  - [budget](#budget)
  - [search](#search)
  - [export](#export)
  - [import](#import)
- [npm Scripts](#npm-scripts)
- [CSV Import Formats](#csv-import-formats)
- [Testing](#testing)
- [Data Storage](#data-storage)

---

## Installation

**Requirements:** Node.js 14 or higher.

```bash
# Clone the repo
git clone https://github.com/abdelrahman-kamel/expense-tracker
cd expense-tracker

# Install dependencies
npm install

# (Optional) Make the command available globally
npm link
```

After `npm link`, use `expense-tracker <command>` from anywhere. Without it, use `node index.js <command>` or the `npm run` shortcuts listed [below](#npm-scripts).

---

## Project Structure

```
expense-tracker/
│
├── index.js                  # Entry point — registers all commands with Commander
├── expenses.json             # Auto-created on first `add`
├── budgets.json              # Auto-created on first `budget --amount`
│
├── main/
│   ├── config.js             # Shared constants: file paths, currency symbol, chart settings
│   │
│   ├── commands/             # One file per CLI command — each exports a fn(program)
│   │   ├── add.js
│   │   ├── list.js
│   │   ├── delete.js
│   │   ├── update.js
│   │   ├── summary.js
│   │   ├── stats.js
│   │   ├── budget.js
│   │   ├── search.js
│   │   ├── export.js
│   │   └── import.js
│   │
│   └── utils/
│       ├── storage.js        # All file I/O — read/write expenses and budgets
│       ├── validation.js     # Input validation — amount, date, id, month, year
│       ├── display.js        # Stats calculation, CLI tables, formatted summaries
│       └── charts.js         # Terminal bar charts, monthly chart, sparklines
│
└── test/
    ├── validators.test.js    # Unit tests for validation.js
    ├── formatters.test.js    # Unit tests for display.js
    ├── storage.test.js       # Unit tests for storage.js
    ├── charts.test.js        # Unit tests for charts.js
    ├── commands.test.js      # Integration tests for all CLI commands
    ├── import.test.js        # Integration tests for CSV import
    └── testing.guide.md      # Guide for writing and running tests
```

---

## Architecture

The project is split into layers. Each layer has **one job** and never crosses into another layer's responsibility.

```
index.js
   └── registers commands from main/commands/
          └── commands call utils/ for all logic
                 ├── storage.js    — file I/O only
                 ├── validation.js — input checking only
                 ├── display.js    — formatting and output only
                 └── charts.js     — terminal rendering only
```

**Why this matters:** if you want to change how amounts are validated, you edit `validation.js` — no other file needs to change. If you want to switch from JSON files to a database, you change only `storage.js` — every command automatically works with the new backend.

### How commands are registered

Each command file exports a single function that accepts the Commander `program` object:

```js
// main/commands/add.js
module.exports = (program) => {
  program.command("add")
    .option(...)
    .action(...);
};
```

`index.js` loads and calls each one:

```js
["./main/commands/add", "./main/commands/list", ...]
  .forEach((cmd) => require(cmd)(program));
```

Adding a new command means creating one file and adding one line to the array.

---

## Commands

### `add`

Add a new expense.

```bash
node index.js add --description "Lunch" --amount 15.50
node index.js add -d "Monthly rent" -a 1200 --category housing --date 2025-03-01
node index.js add -d "Coffee" -a 4.50 -c food
```

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| `--description` | `-d` | ✅ | What the expense was for |
| `--amount` | `-a` | ✅ | Amount — must be a positive number, max 1 billion |
| `--category` | `-c` | — | Category label (default: `other`) |
| `--date` | — | — | Date in `YYYY-MM-DD` (default: today) |

**Example output:**
```
✅ Expense added successfully!
   ID:          1
   Description: Lunch
   Amount:      $15.50
   Category:    food
   Date:        2025-03-05
```

---

### `list`

List all expenses with optional filters and sorting.

```bash
node index.js list
node index.js list --category food
node index.js list --month 3 --year 2025
node index.js list --sort amount
node index.js list --sort date --asc
```

| Flag | Short | Description |
|------|-------|-------------|
| `--category` | `-c` | Filter by category |
| `--month` | `-m` | Filter by month (1–12) |
| `--year` | `-y` | Filter by year |
| `--sort` | `-s` | Sort by `date`, `amount`, or `description` |
| `--asc` | — | Sort ascending (default is descending) |

---

### `delete`

Delete an expense by ID. Without `--force`, shows a preview only — nothing is deleted until you confirm.

```bash
# Preview — safe, nothing is deleted
node index.js delete --id 5

# Actually delete
node index.js delete --id 5 --force
```

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| `--id` | `-i` | ✅ | ID of the expense to delete |
| `--force` | `-f` | — | Skip confirmation and delete immediately |

---

### `update`

Update one or more fields of an existing expense by ID.

```bash
node index.js update --id 3 --amount 20
node index.js update --id 3 --description "Dinner" --category dining
node index.js update --id 3 --date 2025-03-10
```

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| `--id` | `-i` | ✅ | ID of the expense to update |
| `--description` | `-d` | — | New description |
| `--amount` | `-a` | — | New amount |
| `--category` | `-c` | — | New category |
| `--date` | — | — | New date (YYYY-MM-DD) |

At least one of the optional flags must be provided.

---

### `summary`

Show a financial summary with optional charts and breakdowns.

```bash
node index.js summary
node index.js summary --month 3 --year 2025
node index.js summary --chart
node index.js summary --chart --detailed
```

| Flag | Short | Description |
|------|-------|-------------|
| `--month` | `-m` | Filter to a specific month (1–12) |
| `--year` | `-y` | Filter to a specific year |
| `--category` | `-c` | Filter by category |
| `--chart` | — | Show a horizontal bar chart of spending by category |
| `--detailed` | — | Add a month-by-month breakdown table |

**Example output with `--chart`:**
```
📊 Summary — March 2025
────────────────────────────────────────
  Total:    $892.00
  Average:  $42.48
  Highest:  $400.00
  Lowest:   $4.50
  Count:    21 expenses

📂 Spending by Category
food        ████████████████░░░░░░░░  $320.00  35.8%  (12)
housing     ████████████████████████  $400.00  44.8%   (1)
transport   ██████░░░░░░░░░░░░░░░░░░  $172.00  19.3%   (8)
```

---

### `stats`

Full annual statistics with terminal charts, monthly breakdown, category breakdown, and top expenses.

```bash
node index.js stats
node index.js stats --year 2024
node index.js stats --no-chart     # text only, no charts
```

| Flag | Description |
|------|-------------|
| `--year` | Year to analyse (default: current year) |
| `--no-chart` | Skip the vertical bar chart and category chart |

**Includes:**
- Overall totals, averages, highest/lowest expense
- Vertical bar chart across all 12 months
- Sparkline trend row (`▁▂▃▄▅▆▇█`)
- Month-by-month text breakdown with inline bars
- Category breakdown with percentages
- Top 5 most expensive items 🥇🥈🥉

---

### `budget`

Set monthly budgets and track spending against them.

```bash
# Set a budget for the current month
node index.js budget --amount 1000

# Set a budget for a specific month
node index.js budget --amount 800 --month 3 --year 2025

# View status for a specific month
node index.js budget --month 3

# View all months at a glance
node index.js budget --view-all
```

| Flag | Short | Description |
|------|-------|-------------|
| `--amount` | `-a` | Budget amount to set |
| `--month` | `-m` | Month (1–12), default: current month |
| `--year` | `-y` | Year, default: current year |
| `--view-all` | — | Overview of all months for the year |

**Status indicators:**
- ✅ Under 75% of budget used
- ⚡ Between 75–90% used (approaching limit)
- ⚠️ Over budget

---

### `search`

Search and filter expenses by keyword, category, amount range, or date range.

```bash
node index.js search --keyword "coffee"
node index.js search --category food
node index.js search --min-amount 50 --max-amount 200
node index.js search --start-date 2025-01-01 --end-date 2025-03-31
node index.js search --keyword "uber" --sort amount
```

| Flag | Short | Description |
|------|-------|-------------|
| `--keyword` | `-k` | Search for a word or phrase in the description |
| `--category` | `-c` | Filter by category |
| `--min-amount` | — | Only show expenses at or above this amount |
| `--max-amount` | — | Only show expenses at or below this amount |
| `--start-date` | — | Only show expenses on or after this date (YYYY-MM-DD) |
| `--end-date` | — | Only show expenses on or before this date (YYYY-MM-DD) |
| `--sort` | `-s` | Sort by `date`, `amount`, or `description` |

Multiple flags can be combined freely.

---

### `export`

Export your expenses to a CSV or JSON file.

```bash
node index.js export
node index.js export --format json
node index.js export --format csv --output march.csv --month 3 --year 2025
```

| Flag | Short | Description |
|------|-------|-------------|
| `--format` | `-f` | `csv` or `json` (default: `csv`) |
| `--output` | `-o` | Output filename (default: `expenses_YYYY-MM-DD.csv`) |
| `--month` | `-m` | Export only a specific month |
| `--year` | `-y` | Export only a specific year |

---

### `import`

Import expenses from a CSV file — including bank statement exports. Auto-detects the file format.

```bash
# Basic import
node index.js import --file statement.csv

# Preview without saving anything
node index.js import --file statement.csv --dry-run

# Skip rows that already exist
node index.js import --file statement.csv --skip-duplicates

# Override all imported rows with a category
node index.js import --file bank.csv --category groceries --skip-duplicates
```

| Flag | Short | Required | Description |
|------|-------|----------|-------------|
| `--file` | `-f` | ✅ | Path to the CSV file |
| `--category` | `-c` | — | Override category for all imported rows |
| `--skip-duplicates` | — | — | Skip rows with matching date + description + amount |
| `--dry-run` | — | — | Preview results without saving |

See [CSV Import Formats](#csv-import-formats) for supported file shapes.

---

## npm Scripts

Quick access to common commands. Pass extra arguments after `--`.

```bash
npm start                      # node index.js (shows help)
npm run list                   # List all expenses
npm run summary                # Summary with chart and detailed breakdown
npm run stats                  # Full annual stats
npm run budget:view            # Budget overview for all months

# Pass arguments after --
npm run add -- -d "Coffee" -a 4.50 -c food
npm run search -- --keyword coffee --max-amount 10
npm run import -- --file bank.csv --dry-run
npm run export -- --format json --year 2025
```

Full script reference:

| Script | Runs |
|--------|------|
| `npm start` | `node index.js` |
| `npm run add` | `node index.js add` |
| `npm run list` | `node index.js list` |
| `npm run delete` | `node index.js delete` |
| `npm run update` | `node index.js update` |
| `npm run summary` | `node index.js summary` |
| `npm run stats` | `node index.js stats` |
| `npm run budget` | `node index.js budget` |
| `npm run budget:view` | `node index.js budget --view-all` |
| `npm run search` | `node index.js search` |
| `npm run export` | `node index.js export` |
| `npm run import` | `node index.js import` |
| `npm run help` | `node index.js --help` |

---

## CSV Import Formats

The importer auto-detects which format your file uses based on the header row.

### Format 1 — Standard (this app's own export format)

```csv
ID,Date,Description,Amount,Category
1,2025-01-15,Coffee,4.50,food
2,2025-01-16,Monthly rent,1200.00,housing
```

### Format 2 — Bank statement

```csv
Date,Payee,Debit,Credit,Balance
01/15/2025,STARBUCKS,4.50,,1200.00
01/16/2025,RENT PAYMENT,1200.00,,0.00
```

Debit amounts are used as the expense amount. Credit entries are imported if no debit is present.

### Format 3 — Simple 3-column

```csv
Date,Description,Amount
2025-01-15,Coffee,4.50
2025-01-16,Rent,1200.00
```

### Date format support

All formats accept dates in multiple shapes, normalised to `YYYY-MM-DD` automatically:

| Input | Interpreted as |
|-------|---------------|
| `2025-01-15` | 15 Jan 2025 |
| `01/15/2025` | 15 Jan 2025 |
| `15/01/2025` | 15 Jan 2025 (when day > 12) |
| `15-01-2025` | 15 Jan 2025 |

---

## Testing

Tests use Node's built-in `node:test` runner — no extra framework needed.

```bash
# Run all tests
npm test

# Run only unit tests (validation, display, storage, charts)
npm run test:unit

# Run only integration tests (full command execution)
npm run test:integration

# Watch mode — reruns on every file save
npm run test:watch

# Run a single test file
npm run test:validators
npm run test:formatters
npm run test:storage
npm run test:charts
npm run test:commands
npm run test:import
```

See `test/testing.guide.md` for how tests are structured and how to write new ones.

### What each test file covers

| File | Type | What it tests |
|------|------|---------------|
| `validators.test.js` | Unit | Every validation rule — valid inputs, edge cases, error messages |
| `formatters.test.js` | Unit | `calculateStats`, `groupByMonth`, `groupByCategory`, `formatCurrency` |
| `storage.test.js` | Unit | Read/write with a temp file, handles missing files, malformed JSON |
| `charts.test.js` | Unit | Bar rendering math, correct Unicode characters at various fill levels |
| `commands.test.js` | Integration | Spawns the full CLI, checks stdout/stderr and exit codes |
| `import.test.js` | Integration | Creates real temp CSVs, runs import, verifies saved data |

---

## Data Storage

All data is stored as plain JSON files at the project root.

### `expenses.json`

```json
[
  {
    "id": 1,
    "date": "2025-03-05",
    "description": "Lunch",
    "amount": 15.50,
    "category": "food",
    "createdAt": "2025-03-05T11:47:00.000Z"
  }
]
```

### `budgets.json`

```json
{
  "2025-03": 1000,
  "2025-04": 1200
}
```

Keys are `YYYY-MM` strings. Values are the budget amounts for that month.

Both files are created automatically on first use. You can safely delete them to start fresh, back them up by copying them, or edit them manually — they are plain text.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^11.0.0 | CLI argument parsing and command structure |
| `chalk` | ^4.1.2 | Terminal colours |
| `cli-table3` | ^0.6.3 | Formatted tables in the terminal |

No external chart library is used. All terminal charts are rendered with plain Unicode block characters (`█ ▉ ▊ ▋ ▌ ▍ ▎ ▏ ░ ▄ ▁▂▃▄▅▆▇█`) — zero extra dependencies.

---

## License

MIT