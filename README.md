# 💰 Expense Tracker CLI

A powerful, feature-rich command-line application for tracking personal expenses with beautiful formatting, advanced filtering, and comprehensive reporting.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/abdelrahman-kamel-elgendy/expense-tracker)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/abdelrahman-kamel-elgendy/expense-tracker/pulls)

> 🎯 Project based on [roadmap.sh Expense Tracker Challenge](https://roadmap.sh/projects/expense-tracker)

---


## ✨ Features

- **Complete CRUD Operations** - Add, list, update, and delete expenses
- **Smart Filtering** - Filter by category, month, year, amount range, and date ranges
- **Advanced Search** - Search expenses by keywords, categories, and custom criteria
- **Budget Management** - Set monthly budgets and track spending against limits
- **Comprehensive Statistics** - Detailed analytics with monthly and category breakdowns
- **Multiple Export Formats** - Export data to CSV or JSON
- **Beautiful Console Output** - Colored formatting and organized tables
- **Data Persistence** - All data stored in JSON format for easy backup and portability


## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/abdelrahman-kamel-elgendy/expense-tracker.git

# Navigate to project directory
cd expense-tracker

# Install dependencies
npm install

# Install globally (optional)
npm install -g .
# or for development
npm link
```

---


## CLI commands

| Command     | Description                 |Options                                                                    |
|-------------|-----------------------------|---------------------------------------------------------------------------|
|add          |	Add a new expense           |--description, --amount, --category, --date                                |
|list         |	List all expenses           |--category, --month, --sort                                                |
|update       |	Update an expense           |--id, --description, --amount, --category, --date                          |
|delete       |	Delete an expense           |--id, --force                                                              |
|summary      |	Show expense summary        |--month, --category, --year, --detailed                                    |
|search       |	Search expenses             |--keyword, --category, --min-amount, --max-amount, --start-date, --end-date|
|budget       |	Set and track monthly budget|--amount, --month                                                          |
|stats        |	Show detailed statistics    |--year                                                                     |
|export       |	Export expenses             |--format, --output                                                         |

Run `expense-tracker <command> --help` for command‑specific options.



## 💡 Usage Examples
### Basic Operations
```bash
# Add a new expense
expense-tracker add --description "Grocery shopping" --amount 75.50 --category food

# List all expenses
expense-tracker list

# Update an expense
expense-tracker update --id 1 --amount 85.00 --category groceries

# Delete an expense
expense-tracker delete --id 3 --force
```

### Advanced Features
```bash 
# Filter expenses by category and month
expense-tracker list --category food --month 3 --sort amount

# Search for expenses
expense-tracker search --keyword "coffee" --min-amount 5 --max-amount 20

# Set monthly budget
expense-tracker budget --amount 1000 --month 3

# View detailed statistics
expense-tracker stats --year 2024

# Export data
expense-tracker export --format csv --output my-expenses.csv
```

### Summary & Reporting
```bash
# Overall summary
expense-tracker summary

# Monthly summary with details
expense-tracker summary --month 3 --detailed

# Category-wise summary
expense-tracker summary --category food
```



## 📊 Data Structure
```json
{
  "id": 1,
  "date": "2024-03-15",
  "description": "Grocery shopping",
  "amount": 75.50,
  "category": "food",
  "createdAt": "2024-03-15T10:30:00.000Z"
}
```



## 🛠️ Development
### Project Structure
```txt
expense-tracker/
├── expense-tracker.js    # Main CLI implementation
├── expenses.json         # Data storage
├── package.json          # Project configuration
├── README.md             # This file
├── GUIDE.md              # Detailed user guide
└── .gitignore            # Git ignore rules
```

### Contributing
- Fork the repository
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a Pull Request



## 📈 Roadmap
### ✅ Completed
- Basic CRUD operations (add, list, update, delete)
- Summary command with monthly filtering
- Export to CSV functionality
- Data persistence with JSON
- Input validation and error handling

### 🚧 In Progress
- Add unit tests
- Implement data backup/restore
- Add configuration file support

### 🔮 Planned Features
- SQLite database integration
- Recurring expense tracking
- Budget alerts and notifications
- Web dashboard integration
- Multi-currency support
- Export to PDF
- Data visualization with charts



## 🤝 Support
**Documentation**: See [GUIDE.md](GUIDE.md) for detailed usage instructions
**Issues**: GitHub Issues
**Discussions**: GitHub Discussions


<div align="center"> <sub>Built with ❤️ by Abdelrahman Kamel</sub> <br> <sub>⭐ Star us on GitHub — it motivates us a lot!</sub> </div>
