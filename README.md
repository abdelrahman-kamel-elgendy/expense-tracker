# Expense Tracker

A simple Node.js command‑line application for tracking personal expenses.

Project home: https://roadmap.sh/projects/expense-tracker

---

## Current status & statistics

- **Version:** 1.0.0
- **Implementation progress:** 2/6 commands complete (add, list)
- **Files in repository**
  - `expense-tracker.js` (main CLI implementation)
  - `expenses.json` (data store)
  - `package.json` (project configuration)
  - `README.md` (this document)
- **Dependencies:**
  - [commander](https://www.npmjs.com/package/commander) ^14.0.3
  - [fs](https://nodejs.org/api/fs.html) (built-in)
  - [path](https://nodejs.org/api/path.html) (built-in)
- **Entry point (bin):** `expense-tracker` → `expense-tracker.js`

> ℹ️ **Add** and **list** commands are fully functional. Delete, update, summary, and export commands are pending implementation.

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

| Command     | Description                                             | Status           |
|-------------|---------------------------------------------------------|------------------|
| `add`       | Add a new expense (`--description`, `--amount`)         | implemented      |
| `list`      | List all expenses                                       | implemented      |
| `delete`    | Remove expense by `--id`                                | implemented      |
| `update`    | Update an expense (`--id`, `--description`, `--amount`) | implemented      |
| `summary`   | Show totals; optional `--month <1‑12>` filter           | implemented      |
| `export`    | Export expenses to CSV                                  | implemented      |

Run `expense-tracker <command> --help` for command‑specific options.

### Implemented features

- **add**: Creates a new expense with description and amount; validates positive amounts; auto-increments ID; saves to JSON file.
- **list**: Displays all expenses in a formatted table with ID, date, description, and amount.

---

## Data storage

Expenses are persisted in a JSON file (`expenses.json`) at the project root. Each expense record includes:
- `id`: auto-incremented unique identifier
- `date`: ISO 8601 date string (YYYY-MM-DD)
- `description`: expense description
- `amount`: numeric cost value

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

Check the project URL above for roadmap items and feature ideas. Planned enhancements include:

1. Implement command logic (CRUD operations, summaries).
2. Add tests and CI.
3. Improve storage layer (switch to SQLite/Cloud).
4. Add configuration and localization options.

---

Happy tracking! 🎯
