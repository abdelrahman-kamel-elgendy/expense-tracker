# 💰 Expense Tracker CLI — v3.0 Guide

## Installation

```bash
npm install
npm link        # optional: makes `expense-tracker` available globally
```

---

## Project Structure

```
expense-tracker/
├── index.js                  ← Entry point — registers all commands
├── expenses.json             ← Auto-created on first use
├── package.json
├── GUIDE.md
└── src/
    ├── config.js             ← Categories, month names, global settings
    ├── commands/
    │   ├── add.js
    │   ├── list.js
    │   ├── delete.js
    │   ├── update.js
    │   ├── summary.js        ← Charts + stats
    │   ├── stats.js          ← Yearly deep-dive with charts
    │   ├── budget.js         ← Progress bar budget tracker
    │   ├── search.js         ← Full-featured search (fixed in v3)
    │   ├── export.js
    │   └── import.js         ← NEW: CSV/JSON importer
    └── utils/
        ├── storage.js        ← Read/write, stats helpers
        ├── validation.js     ← Amount, ID, date, month validators
        ├── display.js        ← Tables and summaries
        └── charts.js         ← NEW: ASCII bar charts & sparklines
```

---

## Commands

### `add` — Add an expense
```bash
node index.js add -d "Lunch" -a 15.50 -c food
node index.js add -d "Netflix" -a 9.99 -c entertainment --date 2025-03-01
```

### `list` — List expenses
```bash
node index.js list
node index.js list -c food -s amount
node index.js list -m 3 --asc
```

### `update` — Update an expense
```bash
node index.js update -i 5 -a 20.00 -c transport
```

### `delete` — Delete an expense
```bash
node index.js delete -i 5 --force
```

### `summary` — Summary with ASCII charts ✨
```bash
node index.js summary                     # current year
node index.js summary --year 2025
node index.js summary -m 3               # single month
node index.js summary --detailed         # show month table too
node index.js summary --no-chart         # text only
```

### `stats` — Deep yearly statistics ✨
```bash
node index.js stats
node index.js stats --year 2024
node index.js stats --no-chart
```

### `budget` — Budget progress bar ✨
```bash
node index.js budget -a 1000
node index.js budget -a 1000 -m 3 -y 2025
```

### `search` — Search with full filters (fixed in v3) ✨
```bash
node index.js search -k "coffee"
node index.js search --min-amount 10 --max-amount 50
node index.js search --start-date 2025-01-01 --end-date 2025-03-31
node index.js search -c food --min-amount 20
```

### `export` — Export to CSV or JSON
```bash
node index.js export                          # → expenses_YYYY-MM-DD.csv
node index.js export -f json -o backup.json
```

### `import` — Import from CSV or JSON ✨ NEW
```bash
node index.js import -f bank_export.csv --dry-run          # preview first
node index.js import -f bank_export.csv --auto-category    # smart categories
node index.js import -f bank_export.csv --skip-errors      # ignore bad rows
node index.js import -f data.json                          # JSON import
```

**CSV column auto-mapping** — the importer recognises common bank export headers:
| Field | Recognised column names |
|---|---|
| Description | description, desc, merchant, payee, memo, narration |
| Amount | amount, price, cost, debit, credit, value |
| Date | date, datetime, transaction date, posted |
| Category | category, type, tag, label |

Override with: `--desc-col`, `--amount-col`, `--date-col`, `--cat-col`

---

## Bug Fixes (v2 → v3)

| # | Bug | Fix |
|---|-----|-----|
| 1 | `stats` referenced `groupByYearMonth` before definition (TDZ crash) | Moved to `storage.js`, called as `groupByMonth` |
| 2 | `search` registered `--min-amount`/`--max-amount` in help but not in `.option()` | Both options now properly registered |
| 3 | `budget` month default evaluated at parse-time, not runtime | Default set as `String(new Date().getMonth() + 1)` evaluated at action time |
| 4 | `add` skipped date validation for today's date | Always validates when `--date` flag is provided |
| 5 | No `updatedAt` timestamp on updates | Added in `update` command |
| 6 | No `--asc` sort flag for `list` | Added |