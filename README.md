# Expense Tracker

A simple Node.js command‑line application for tracking personal expenses.

Project home: https://roadmap.sh/projects/expense-tracker

---

## Current status & statistics

- **Version:** 1.0.0
- **Files in repository**
  - `expense-tracker.js` (main CLI implementation)
  - `expenses.json` (data store)
  - `package.json` (project configuration)
  - `README.md` (this document)
- **Dependencies:**
  - [commander](https://www.npmjs.com/package/commander) ^14.0.3
- **Entry point (bin):** `expense-tracker` → `expense-tracker.js`

> ✅ The `add` command is fully functional. Other commands are still being developed.

---

## Installation

To install the tool globally:

```bash
npm install -g .
# or for development
npm link
```

Alternatively you can invoke it directly with Node:

```bash
node expense-tracker.js <command>
```

---

## Usage examples

Once installed, you can start tracking expenses:

```bash
# Add an expense
expense-tracker add --description "Gas" --amount 50

# Add another expense
expense-tracker add --description "Groceries" --amount 75.50
```

---

## CLI commands

| Command     | Description                                             | Status         |
|-------------|---------------------------------------------------------|----------------|
| `add`       | Add a new expense (`--description`, `--amount`)         | ✅ Implemented |
| `list`      | List all expenses                                       | 🚧 In progress |
| `delete`    | Remove expense by `--id`                                | ❌ Not started |
| `update`    | Update an expense (`--id`, `--description`, `--amount`) | ❌ Not started |
| `summary`   | Show totals; optional `--month <1‑12>` filter           | ❌ Not started |
| `export`    | Export expenses to CSV                                  | ❌ Not started |

Run `expense-tracker <command> --help` for command‑specific options.

---

## Data storage

Expenses are kept in a JSON file (`expenses.json`) at the project root. Each expense includes:
- **id**: Auto-generated unique identifier
- **date**: Date when the expense was recorded (YYYY-MM-DD format)
- **description**: Name/description of the expense
- **amount**: Cost amount (must be a positive number)

The format is intentionally simple so it can be replaced with a database or other back end later.

---

## Contribution & support

- **Repository:** https://github.com/abdelrahman-kamel-elgendy/expense-tracker
- **Issue tracker:** https://github.com/abdelrahman-kamel-elgendy/expense-tracker/issues

Feel free to open a pull request or issue with ideas, bug reports, or contributions.

---

## License

ISC (see `package.json`).


## Roadmap & future work

Check the project URL above for roadmap items and feature ideas. Planned enhancements and next steps include:

1. ✅ Implement `add` command (DONE)
2. Implement remaining CRUD commands (`list`, `update`, `delete`)
3. Implement `summary` command with optional month filtering
4. Implement `export` command for CSV output
5. Add comprehensive tests and CI/CD pipeline
6. Improve storage layer (SQLite, cloud database, etc.)
7. Add configuration options and localization support

---

Happy tracking! 🎯
