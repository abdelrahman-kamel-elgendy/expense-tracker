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

> ⚠️ Most commands currently throw a “not implemented yet” error; they serve as a skeleton for future work.

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

## CLI commands

| Command     | Description                                             | Notes           |
|-------------|---------------------------------------------------------|-----------------|
| `add`       | Add a new expense (`--description`, `--amount`)         | not implemented |
| `list`      | List all expenses                                       | not implemented |
| `delete`    | Remove expense by `--id`                                | not implemented |
| `update`    | Update an expense (`--id`, `--description`, `--amount`) | not implemented |
| `summary`   | Show totals; optional `--month <1‑12>` filter           | not implemented |
| `export`    | Export expenses to CSV                                  | not implemented |

Run `expense-tracker <command> --help` for command‑specific options.

---

## Scripts

- `npm test` — placeholder; currently prints an error and exits with code 1.

---

## Data storage

Expenses are kept in a JSON file (`expenses.json`) at the project root. The format is intentionally simple so it can be replaced with a database or other back end later.

---

## Contribution & support

- **Repository:** https://github.com/abdelrahman-kamel-elgendy/expense-tracker
- **Issue tracker:** https://github.com/abdelrahman-kamel-elgendy/expense-tracker/issues

Feel free to open a pull request or issue with ideas, bug reports, or contributions.

---

## License

ISC (see `package.json`).


## Roadmap & future work

Check the project URL above for roadmap items and feature ideas. Planned enhancements include:

1. Implement command logic (CRUD operations, summaries).
2. Add tests and CI.
3. Improve storage layer (switch to SQLite/Cloud).
4. Add configuration and localization options.

---

Happy tracking! 🎯
