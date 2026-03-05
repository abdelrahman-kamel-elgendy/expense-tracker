# 🧪 Testing Guide

## Unit + Integration Tests (automated)

```bash
# Run everything
node --test tests/*.test.js

# Run individual suites
node --test tests/validators.test.js     # 29 tests — input validation
node --test tests/formatters.test.js     # 22 tests — data formatting & stats
node --test tests/storage.test.js        # 10 tests — file read/write
node --test tests/charts.test.js         # 15 tests — chart math
node --test tests/commands.test.js       # 41 tests — command logic
```

Expected output:
```
# tests 117
# pass  117
# fail  0
```

---

## Manual Testing Script

Run these in order. Each section resets state so they're independent.

### 1. Start fresh

```bash
rm -f expenses.json budgets.json
node index.js list
# Expected: "No expenses found"
```

---

### 2. Add command

```bash
# Basic add
node index.js add -d "Coffee" -a 4.50 -c food
# Expected: ✅ Expense added — ID: 1, Amount: $4.50

# Add with a custom past date
node index.js add -d "Rent" -a 900 -c housing --date 2025-01-01
# Expected: ✅ Expense added — Date: 2025-01-01

# Add more for testing later
node index.js add -d "Bus pass"  -a 30   -c travel
node index.js add -d "Lunch"     -a 12   -c food
node index.js add -d "Gym"       -a 50   -c health
node index.js add -d "Dinner"    -a 45   -c food  --date 2025-03-01

# ── Error cases ──
node index.js add -d "Bad" -a -5
# Expected: ❌ Amount must be a positive number

node index.js add -d "Bad" -a 10 --date 15/01/2025
# Expected: ❌ Invalid date format

node index.js add -d "Bad" -a 10 --date 2025-13-01
# Expected: ❌ Invalid date value  (passes regex, caught by Date())

node index.js add -a 10
# Expected: error — missing required option --description
```

---

### 3. List command

```bash
node index.js list
# Expected: table showing all 6 expenses

node index.js list -c food
# Expected: Coffee, Lunch, Dinner only

node index.js list -m 1
# Expected: only January expenses (Rent + Coffee + Bus pass + Lunch + Gym)

node index.js list -s amount
# Expected: sorted by amount descending (Rent $900 first)

node index.js list -s amount --asc
# Expected: sorted by amount ascending (Coffee $4.50 first)

node index.js list -c nonexistent
# Expected: "No expenses found for category: nonexistent"
```

---

### 4. Update command

```bash
node index.js update -i 1 -d "Espresso"
# Expected: ✅ description changed to "Espresso"

node index.js update -i 1 -a 5.00
# Expected: ✅ amount changed to $5.00

node index.js update -i 1
# Expected: "No updates provided" warning

node index.js update -i 999 -d "Ghost"
# Expected: ❌ not found error
```

---

### 5. Delete command

```bash
node index.js delete -i 6
# Expected: shows preview, says "Use --force to confirm" — nothing deleted

node index.js list | grep Dinner
# Expected: Dinner still there

node index.js delete -i 6 --force
# Expected: ✅ deleted

node index.js delete -i 6 --force
# Expected: ❌ not found (already deleted)
```

---

### 6. Search command  *(bug-fixed: min/max amount now works)*

```bash
node index.js search --keyword coffee
# Expected: Coffee/Espresso row only

node index.js search --min-amount 40
# Expected: Gym ($50) and Rent ($900) — NOT Coffee or Lunch

node index.js search --max-amount 50
# Expected: Coffee, Bus pass, Lunch, Gym — NOT Rent

node index.js search --min-amount 10 --max-amount 60
# Expected: Bus pass, Lunch, Gym

node index.js search --start-date 2025-03-01 --end-date 2025-03-31
# Expected: only March expenses
```

---

### 7. Summary command

```bash
node index.js summary
# Expected: total, average, highest, lowest, count

node index.js summary --chart
# Expected: category bar chart with smooth Unicode bars (▏▎▍▌▋▊▉█)

node index.js summary --detailed
# Expected: monthly breakdown table

node index.js summary --month 1
# Expected: January only stats
```

---

### 8. Stats command  *(enhanced with charts)*

```bash
node index.js stats
# Expected:
#   - Overview stats (total, average, highest, lowest)
#   - Vertical monthly bar chart (▄ █ characters)
#   - Month-by-month text with sparkline (▁▂▃▄▅▆▇█)
#   - Category breakdown bar chart
#   - Top 5 expenses with medals 🥇🥈🥉

node index.js stats --no-chart
# Expected: same stats but text-only, no visual charts
```

---

### 9. Budget command

```bash
node index.js budget --amount 200 --month 1
# Expected: ✅ Budget for January set to $200.00

node index.js budget --month 1
# Expected: shows spent vs budget, remaining amount

# Add an expense that puts you over budget
node index.js add -d "Expensive item" -a 250 --date 2025-01-15
node index.js budget --month 1
# Expected: ⚠️ Over budget by $X

node index.js budget --amount 1000 --month 3
node index.js budget --view-all
# Expected: table showing all months with budget set
```

---

### 10. Export command

```bash
node index.js export
# Expected: creates expenses_YYYY-MM-DD.csv

cat expenses_*.csv
# Expected: CSV with header + one row per expense
# Check: quoted descriptions, correct amounts

node index.js export --format json --output backup.json
cat backup.json
# Expected: pretty-printed JSON array

rm expenses_*.csv backup.json
```

---

### 11. Import command  *(new feature)*

```bash
# Create a test CSV
cat > /tmp/test_import.csv << 'CSV'
Date,Description,Amount,Category
2025-06-01,Groceries,85.50,food
2025-06-02,Taxi,22.00,travel
2025-06-03,Gym membership,45.00,health
CSV

# Dry run first — no data saved
node index.js import --file /tmp/test_import.csv --dry-run
# Expected: preview table, "Dry run — no changes saved"
node index.js list | grep Groceries
# Expected: nothing — dry run means nothing was saved

# Real import
node index.js import --file /tmp/test_import.csv
node index.js list | grep Groceries
# Expected: Groceries row visible

# Test skip-duplicates
node index.js import --file /tmp/test_import.csv --skip-duplicates
# Expected: "Duplicates skipped: 3" — none added again

# Test bank statement format
cat > /tmp/bank.csv << 'CSV'
Date,Payee,Debit,Credit,Balance
01/15/2025,STARBUCKS,4.50,,1200.00
02/20/2025,AMAZON,35.99,,1164.01
CSV

node index.js import --file /tmp/bank.csv --dry-run
# Expected: dates normalised to 2025-01-15 and 2025-02-20
```

---

### 12. Chart visual verification

These can't be automated — look at them with your own eyes:

```bash
# Add enough data for interesting charts
node index.js add -d "Books"       -a 60  -c education --date 2025-02-10
node index.js add -d "Netflix"     -a 15  -c entertainment
node index.js add -d "Phone bill"  -a 80  -c utilities

node index.js stats
# Check:
#   ✓ Monthly chart shows bars in the correct months
#   ✓ Taller bars for higher-spend months
#   ✓ Sparkline shows correct relative heights
#   ✓ Category bars are proportional to spend

node index.js summary --chart
# Check:
#   ✓ Longest bar = highest-spend category
#   ✓ Percentages add up to ~100%
#   ✓ Counts next to each bar are correct
```

---

## What each test file covers

| File | What it tests | Count |
|------|--------------|-------|
| `validators.test.js` | All 5 validator functions, edge cases | 29 |
| `formatters.test.js` | Date/currency formatting, stats, grouping | 22 |
| `storage.test.js` | File I/O, empty files, round-trips | 10 |
| `charts.test.js` | Bar math, sparkline index, row logic | 15 |
| `commands.test.js` | add/list/delete/update/search/import/stats | 41 |
| **Total** | | **117** |

## Key things the tests specifically verify

- `validateDate` rejects `"2025-13-01"` — catches the bug where regex passed but date was invalid
- `validateId` uses `Number()` not `parseInt()` — catches `"3abc"` and `"3.7"`  
- `validateAmount` catches `"Infinity"` — edge case `parseFloat('Infinity')` passes `isNaN`
- `generateId` uses `max + 1` not `length + 1` — correct after deletions
- `search --min-amount` and `--max-amount` actually filter — the bug-fix is verified
- `makeBar` total length always equals requested width — layout never breaks
- Chart row logic boundary: `v=0` at row 1 produces `"half"` not `"empty"` — documented behaviour