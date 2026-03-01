# Expense Tracker

This project tracks personal expenses.

Project URL: https://roadmap.sh/projects/expense-tracker

## What’s changed (recent updates)

- Version: 1.0.0
- Added a CLI entrypoint: `expense-tracker` (see `bin` in `package.json`)
- Uses `commander` for command-line parsing

## Installation

Install globally to use the `expense-tracker` command:

```bash
npm install -g .
# or for development
npm link
```

Or run directly with Node:

```bash
node expense-tracker.js <command>
```

## Usage

After global install you can run the CLI anywhere:

```bash
expense-tracker summary
```

This project exposes the `expense-tracker` executable (see `bin` in `package.json`). Commands and options are implemented with `commander`.

## Scripts

- `npm test` — placeholder test script (see `package.json`)

## Repository & Support

- Repository: https://github.com/abdelrahman-kamel-elgendy/expense-tracker
- Issues: https://github.com/abdelrahman-kamel-elgendy/expense-tracker/issues


## Summary

For full roadmap and feature ideas see the project URL above.
