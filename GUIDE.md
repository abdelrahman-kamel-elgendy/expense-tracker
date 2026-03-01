# 📖 Expense Tracker - Complete User Guide
---

## 🚀 Getting Started

### Installation Options

#### Option 1: Global Installation (Recommended)
```bash
npm install -g expense-tracker
# Now you can use 'expense-tracker' from anywhere
```

#### Option 2: Local Development
```bash
git clone https://github.com/abdelrahman-kamel-elgendy/expense-tracker.git
cd expense-tracker
npm link
```

#### Option 3: Direct Node Execution
```bash
node expense-tracker.js <command>
```

### First Steps
1. Add your first expense:
```bash
expense-tracker add --description "Coffee" --amount 4.50 --category drinks
```

2. View all expenses:
```bash
expense-tracker list
```

3. Check your total spending:
```bash
expense-tracker summary
```

## 📚 Command Reference
### add - Add New Expense
Syntax:
```bash
expense-tracker add --description <text> --amount <number> [options]
```
Options:
|Option	Required	     |Description	                            |Example              |
|------------------------|------------------------------------------|---------------------|
|--description, -d	✅   |Expense description	                   |--description "Lunch"|
|--amount, -a	✅	    |Expense amount (positive number)	       |--amount 25.50       |
|--category, -c	❌	    |Expense category (default: "other")       |--category food      |
|--date	❌	            |Custom date (YYYY-MM-DD, default: today)  |--date 2024-03-15    |

Examples:
```bash
# Basic expense
expense-tracker add -d "Groceries" -a 75.30

# With category and custom date
expense-tracker add --description "Monthly rent" --amount 1200 --category housing --date 2024-03-01

# Multiple expenses in one go
expense-tracker add -d "Movie tickets" -a 30 -c entertainment
expense-tracker add -d "Popcorn" -a 12.50 -c food
```

### list - View Expenses
Syntax:
```bash
expense-tracker list [options]
```
Options:
|Option	        |Description	                            |Example         |
|---------------|-------------------------------------------|----------------|
|--category, -c	|Filter by category	                        |--category food |
|--month, -m	|Filter by month (1-12)	                    |--month 3       |
|--sort, -s	    |Sort by field (date, amount, description)	|--sort amount   |

Examples:
```bash
# List all expenses
expense-tracker list

# Filter by category and month
expense-tracker list --category food --month 3

# Sort by amount (highest first)
expense-tracker list --sort amount

# Combined filters
expense-tracker list --category entertainment --month 12 --sort date
```
Output Example:
All Expenses:
| ID | Date         | Description          | Amount   |
|----|--------------|----------------------|----------|
| 1  | 2024-03-01   | Monthly rent         | $1200.00 |
| 2  | 2024-03-05   | Grocery shopping     | $75.30   |
| 3  | 2024-03-10   | Coffee with friends  | $18.50   |
|Total: $1293.80    | Average: $431.27                |

### update - Modify Expenses
Syntax:
```bash
expense-tracker update --id <number> [options]
```
Options:
|Option	            |Description	                 |Example                             |
|------------------ |--------------------------------|------------------------------------|
|--id, -i	        |Expense ID to update (required) |--id 3                              |
|--description, -d  |New description	             |--description "Updated description" |
|--amount, -a	    |New amount	                     |--amount 45.00                      |
|--category, -c	    |New category	                 |--category groceries                |
|--date	            |New date	                     |--date 2024-03-12                   |

Examples:
```bash
# Update multiple fields
expense-tracker update --id 2 --amount 85.00 --category groceries --description "Weekly groceries"

# Update single field
expense-tracker update --id 5 --category utilities
```
### delete - Remove Expenses
Syntax:
```bash
expense-tracker delete --id <number> [--force]
```
Options:
|Option	     |Description                     |
|------------|--------------------------------|
|--id, -i	 |Expense ID to delete (required) |
|--force, -f |Skip confirmation prompt

Examples:
```bash
# With confirmation (recommended)
expense-tracker delete --id 3

# Force delete without confirmation
expense-tracker delete --id 7 --force
```
### summary - View Spending Summary
Syntax:
```bash
expense-tracker summary [options]
```
Options:
|Option	        |Description	|Example|
|---------------|---------------|-----------------------|
|--month, -m	|Filter by month	|--month 6|
|--category, -c	|Filter by category	|--category food|
|--year, -y	    |Filter by year	|--year 2024|
|--detailed	    |Show detailed breakdown	|--detailed|

Examples:
```bash
# Overall summary
expense-tracker summary

# Monthly summary
expense-tracker summary --month 3

# Detailed monthly breakdown
expense-tracker summary --month 3 --detailed

# Category summary
expense-tracker summary --category food

# Yearly summary with details
expense-tracker summary --year 2024 --detailed
```

### search - Advanced Search
Syntax:
```bash
expense-tracker search [options]
```
Options:
|Option	        |Description	|Example|
|---------------|----------------------|------------------------------|
|--keyword, -k	|Search in descriptions	-|-keyword "coffee"|
|--category, -c	|Filter by category	|--category food|
|--min-amount	|Minimum amount	|--min-amount 10|
|--max-amount	|Maximum amount	-|-max-amount 100|
|--start-date	|Start date (YYYY-MM-DD)	|--start-date 2024-03-01|
|--end-date	End date (YYYY-MM-DD)	|--end-date 2024-03-31|

Examples:
```bash
# Search by keyword
expense-tracker search --keyword "coffee"

# Search by amount range
expense-tracker search --min-amount 50 --max-amount 200

# Search by date range and category
expense-tracker search --category food --start-date 2024-03-01 --end-date 2024-03-15

# Complex search
expense-tracker search --keyword "lunch" --min-amount 15 --max-amount 30 --category food
```

### budget - Monthly Budget Tracking
Syntax:
```bash
expense-tracker budget --amount <number> [--month <number>]
```
Options:
|Option	        |Required	|Description	|Example|
|---------------|-----------|--------------------------------|
|--amount, -a	|✅         |budget amount	|--amount 1000|
|--month, -m	|❌         |(1-12, default: current)	|--month 3|

Examples:
```bash
# Set budget for current month
expense-tracker budget --amount 2000

# Check budget for specific month
expense-tracker budget --amount 1500 --month 6
```
Output Example:
```text
💰 Budget Analysis for Month 3:
Budget: $1500.00
Spent: $1293.80
Remaining: $206.20
✅ Within budget
```
### stats - Detailed Statistics
Syntax:
```bash
expense-tracker stats [--year <year>]
```
Options:
|Option	    |Description	                    |Example|
|-----------|-----------------------------------|--------|
|--year, -y	|Year to analyze (default: current)	|--year 2024|

Example:
```bash
expense-tracker stats --year 2024
```
Output Example:
```text
📈 Statistics for 2024:

Overall:
  Total: $15243.50
  Average per expense: $45.23
  Number of expenses: 337
  Highest expense: $1200.00
  Lowest expense: $2.50

Monthly Breakdown:
  Jan: $1250.30 (28 expenses)
  Feb: $1342.80 (31 expenses)
  Mar: $1293.80 (27 expenses)
  ...

Category Breakdown:
  housing: $7200.00 (47.2%, 12 expenses)
  food: $4320.50 (28.3%, 156 expenses)
  entertainment: $1850.75 (12.1%, 89 expenses)
  ...
```

### export - Export Data
Syntax:
```bash
expense-tracker export [--format <format>] [--output <file>]
```
Options:
|Option	        |Description	|Default	            |Example|
|---------------|--------------------------|-------|-------------------|
|--format, -f	|Export format (csv, json)	|csv	|--format json|
|--output, -o	|Output filename	|expenses_YYYY-MM-DD.format	|--output my-data.csv|

Examples:
```bash
# Export to CSV with default name
expense-tracker export

# Export to JSON with custom name
expense-tracker export --format json --output my-expenses.json
```

## 🎯 Advanced Usage
### Batch Operations with Shell Scripts
Create a shell script to add multiple expenses:

add-weekly-expenses.sh:
```bash
#!/bin/bash

# Add weekly expenses
expense-tracker add -d "Monday lunch" -a 15.50 -c food
expense-tracker add -d "Tuesday coffee" -a 4.50 -c drinks
expense-tracker add -d "Wednesday dinner" -a 32.00 -c food
expense-tracker add -d "Thursday transport" -a 25.00 -c transport
expense-tracker add -d "Friday movie" -a 30.00 -c entertainment
```

### Data Backup
Create automatic backups:
```bash
#!/bin/bash
# backup-expenses.sh

DATE=$(date +%Y%m%d_%H%M%S)
cp expenses.json "backups/expenses_$DATE.json"
echo "✅ Backup created: backups/expenses_$DATE.json"
```

### Monthly Reports
Generate monthly reports automatically:
```bash
#!/bin/bash
# monthly-report.sh

MONTH=$(date +%m)
YEAR=$(date +%Y)

echo "📊 Monthly Report - $(date +%B,%Y)"
echo "=================================="

expense-tracker summary --month $MONTH --detailed
expense-tracker export --format csv --output "reports/${YEAR}_${MONTH}_expenses.csv"
```

## 💡 Tips and Tricks
1. Use Categories Wisely
Create a consistent category system:
- **housing**: Rent, utilities, maintenance
- **food**: Groceries, restaurants, coffee
- **transport**: Gas, public transit, parking
- **entertainment**: Movies, games, subscriptions
- **health**: Medical, pharmacy, fitness
- **education**: Books, courses, supplies
- **shopping**: Clothes, electronics, gifts
- **other**: Miscellaneous expenses

2. Regular Updates
- Add expenses immediately after purchase
- Do a weekly review to catch missed entries
- Set a monthly reminder to check your budget

3. Smart Searching
```bash
# Find all expensive transactions
expense-tracker search --min-amount 100

# Find transactions in a date range
expense-tracker search --start-date 2024-01-01 --end-date 2024-03-31

# Find specific patterns
expense-tracker search --keyword "amazon" --category shopping
```

4. Budget Planning
```bash
# Check if you're on track mid-month
expense-tracker budget --amount 2000

# Compare month-over-month
expense-tracker stats --year 2024
```

5. Quick Aliases
Add to your ~/.bashrc or ~/.zshrc:

```bash
alias ex='expense-tracker'
alias ex-add='expense-tracker add'
alias ex-list='expense-tracker list'
alias ex-sum='expense-tracker summary'
alias ex-budget='expense-tracker budget'
alias ex-stats='expense-tracker stats --year $(date +%Y)'
```

## 🔧 Troubleshooting
Common Issues and Solutions
1. Command not found
```bash
# Solution: Install globally or use npm link
npm install -g .
# or
npm link
```

2. Invalid amount error
```bash
# Make sure amount is a positive number
expense-tracker add -d "Test" -a 10.50  # ✅ Correct
expense-tracker add -d "Test" -a -5     # ❌ Error
expense-tracker add -d "Test" -a "ten"  # ❌ Error
```

3. JSON file corrupted
If expenses.json gets corrupted:
```bash
# Backup current file
cp expenses.json expenses.json.bak

# The app will create a new file on next use
rm expenses.json
```

4. Permission issues
```bash
# Fix permissions
chmod 644 expenses.json
chmod 755 expense-tracker.js
```

## ❓ FAQ

Q: Where is my data stored?
A: All data is stored in expenses.json in the same directory as the application.

Q: Can I use a different file location?
A: Currently, the file location is fixed. Future versions may support custom paths.

Q: How do I backup my data?
A: Simply copy the expenses.json file to a safe location.

Q: Can I import data from other sources?
A: Future versions will include import functionality. For now, you can manually edit the JSON file.

Q: Is there a limit to how many expenses I can track?
A: No, the application can handle thousands of expenses efficiently.

Q: Can I use this on Windows?
A: Yes, it works on Windows, macOS, and Linux.

Q: How do I update to the latest version?
A: Pull the latest changes and reinstall:
```bash
git pull
npm install
npm link
```

Q: What happens if I delete expenses.json?
A: The application will create a new empty file automatically.

## 📞 Getting Help
If you encounter any issues:
1. Check this guide for solutions
2. Search existing issues
3. Create a new issue with:
    - Command you ran
    - Error message
    - Your operating system
    - Node.js version

<div align="center"> <h3>🎉 Happy Expense Tracking!</h3> <p>Remember: What gets measured, gets managed.</p> </div>
