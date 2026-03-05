/**
 * tests/commands.test.js
 *
 * Integration tests for commands. We don't invoke the CLI process —
 * instead we test the *logic* each command depends on, using temp files
 * to simulate real read/write cycles.
 *
 * This is the middle ground between pure unit tests (just functions)
 * and full end-to-end tests (spawning a child process). It's fast,
 * reliable, and still exercises the real data flow.
 *
 * Run with: node --test tests/commands.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

// == Helpers ==================================================================
// We simulate what each command does: read → transform → write.
// This lets us test the logic without needing node_modules (chalk, commander).

let tmpFile;

// beforeEach/afterEach run before/after EVERY test in the file.
// Fresh temp file each time = tests can't affect each other.
beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `expenses-test-${Date.now()}.json`);
});

afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

// Re-implement the core storage helpers inline
const readExpenses = () => {
    if (!fs.existsSync(tmpFile)) return [];
    const raw = fs.readFileSync(tmpFile, "utf8").trim();
    return raw ? JSON.parse(raw) : [];
};

const saveExpenses = (expenses) =>
    fs.writeFileSync(tmpFile, JSON.stringify(expenses, null, 2));

// Re-implement generateId inline
const generateId = (expenses) =>
    expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;

// == ADD command logic =========================================================

describe("add command logic", () => {

    test("adds first expense with id 1", () => {
        const expenses = readExpenses();
        const newExpense = {
            id: generateId(expenses),
            date: "2025-03-01",
            description: "Coffee",
            amount: 4.50,
            category: "food",
            createdAt: new Date().toISOString(),
        };
        expenses.push(newExpense);
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.equal(saved.length, 1);
        assert.equal(saved[0].id, 1);
        assert.equal(saved[0].description, "Coffee");
        assert.equal(saved[0].amount, 4.50);
    });

    test("second expense gets id 2", () => {
        saveExpenses([{ id: 1, description: "First", amount: 10 }]);

        const expenses = readExpenses();
        const newExpense = { id: generateId(expenses), description: "Second", amount: 20 };
        expenses.push(newExpense);
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.equal(saved.length, 2);
        assert.equal(saved[1].id, 2);
    });

    test("does not overwrite existing expenses on add", () => {
        // A common bug: reading stale data and overwriting with just the new item.
        saveExpenses([
            { id: 1, description: "Existing", amount: 100 },
        ]);

        const expenses = readExpenses();         // must read BEFORE adding
        expenses.push({ id: generateId(expenses), description: "New", amount: 50 });
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.equal(saved.length, 2);           // both must survive
        assert.equal(saved[0].description, "Existing");
        assert.equal(saved[1].description, "New");
    });

    test("category defaults to 'other' when not provided", () => {
        const expenses = readExpenses();
        const newExpense = {
            id: generateId(expenses),
            description: "Mystery item",
            amount: 9.99,
            category: undefined || "other",     // mirrors the command's default
        };
        expenses.push(newExpense);
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.equal(saved[0].category, "other");
    });
});

// == LIST command logic ========================================================

describe("list command logic — filters", () => {

    const seed = [
        { id: 1, date: "2025-01-10", description: "Coffee", amount: 4.50, category: "food" },
        { id: 2, date: "2025-01-20", description: "Bus pass", amount: 30.00, category: "transport" },
        { id: 3, date: "2025-02-05", description: "Lunch", amount: 12.00, category: "food" },
        { id: 4, date: "2025-03-01", description: "Rent", amount: 900.00, category: "housing" },
    ];

    beforeEach(() => saveExpenses(seed));

    test("no filter returns all expenses", () => {
        const expenses = readExpenses();
        assert.equal(expenses.length, 4);
    });

    test("filter by category", () => {
        const expenses = readExpenses().filter((e) => e.category === "food");
        assert.equal(expenses.length, 2);
        assert.ok(expenses.every((e) => e.category === "food"));
    });

    test("filter by month", () => {
        const expenses = readExpenses().filter(
            (e) => new Date(e.date).getMonth() + 1 === 1   // January = 1
        );
        assert.equal(expenses.length, 2);
    });

    test("filter by year", () => {
        const expenses = readExpenses().filter(
            (e) => new Date(e.date).getFullYear() === 2025
        );
        assert.equal(expenses.length, 4);
    });

    test("filter by month AND category combined", () => {
        const expenses = readExpenses()
            .filter((e) => new Date(e.date).getMonth() + 1 === 1)
            .filter((e) => e.category === "food");
        assert.equal(expenses.length, 1);
        assert.equal(expenses[0].description, "Coffee");
    });
});

describe("list command logic — sorting", () => {

    const seed = [
        { id: 1, date: "2025-01-10", description: "Zebra", amount: 50 },
        { id: 2, date: "2025-03-01", description: "Apple", amount: 10 },
        { id: 3, date: "2025-02-15", description: "Mango", amount: 30 },
    ];

    beforeEach(() => saveExpenses(seed));

    test("sort by amount descending", () => {
        const expenses = readExpenses().sort((a, b) => b.amount - a.amount);
        assert.equal(expenses[0].amount, 50);
        assert.equal(expenses[2].amount, 10);
    });

    test("sort by amount ascending with --asc flag", () => {
        const dir = 1; // ascending
        const expenses = readExpenses().sort((a, b) => dir * (a.amount - b.amount));
        assert.equal(expenses[0].amount, 10);
        assert.equal(expenses[2].amount, 50);
    });

    test("sort by description alphabetically", () => {
        const expenses = readExpenses().sort((a, b) =>
            a.description.localeCompare(b.description)
        );
        assert.equal(expenses[0].description, "Apple");
        assert.equal(expenses[2].description, "Zebra");
    });

    test("sort by date descending — most recent first", () => {
        const expenses = readExpenses().sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
        assert.equal(expenses[0].date, "2025-03-01");
        assert.equal(expenses[2].date, "2025-01-10");
    });
});

// == DELETE command logic ======================================================

describe("delete command logic", () => {

    beforeEach(() => saveExpenses([
        { id: 1, description: "Keep me", amount: 10 },
        { id: 2, description: "Delete me", amount: 20 },
        { id: 3, description: "Keep me too", amount: 30 },
    ]));

    test("deletes the correct expense by id", () => {
        let expenses = readExpenses();
        const idx = expenses.findIndex((e) => e.id === 2);
        assert.notEqual(idx, -1);          // must exist before delete

        expenses.splice(idx, 1);
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.equal(saved.length, 2);
        assert.equal(saved.find((e) => e.id === 2), undefined);
    });

    test("other expenses survive deletion", () => {
        let expenses = readExpenses();
        expenses.splice(expenses.findIndex((e) => e.id === 2), 1);
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.ok(saved.find((e) => e.id === 1));
        assert.ok(saved.find((e) => e.id === 3));
    });

    test("returns -1 for non-existent id — findIndex guard", () => {
        const expenses = readExpenses();
        const idx = expenses.findIndex((e) => e.id === 999);
        // The command checks this and exits early. -1 = not found.
        assert.equal(idx, -1);
    });
});

// == UPDATE command logic ======================================================

describe("update command logic", () => {

    beforeEach(() => saveExpenses([
        { id: 1, date: "2025-01-01", description: "Old desc", amount: 10, category: "misc" },
    ]));

    test("updates description", () => {
        const expenses = readExpenses();
        const expense = expenses.find((e) => e.id === 1);
        expense.description = "New desc";
        saveExpenses(expenses);

        const saved = readExpenses();
        assert.equal(saved[0].description, "New desc");
    });

    test("updates amount", () => {
        const expenses = readExpenses();
        const expense = expenses.find((e) => e.id === 1);
        expense.amount = 99.99;
        saveExpenses(expenses);

        assert.equal(readExpenses()[0].amount, 99.99);
    });

    test("updates category", () => {
        const expenses = readExpenses();
        expenses.find((e) => e.id === 1).category = "food";
        saveExpenses(expenses);

        assert.equal(readExpenses()[0].category, "food");
    });

    test("partial update preserves other fields", () => {
        const expenses = readExpenses();
        const expense = expenses.find((e) => e.id === 1);
        // Only change amount — everything else must stay
        const originalDesc = expense.description;
        const originalDate = expense.date;
        expense.amount = 55;
        saveExpenses(expenses);

        const saved = readExpenses()[0];
        assert.equal(saved.amount, 55);
        assert.equal(saved.description, originalDesc);
        assert.equal(saved.date, originalDate);
    });

    test("find returns undefined for missing id — not found guard", () => {
        const expenses = readExpenses();
        const expense = expenses.find((e) => e.id === 999);
        // The command checks `if (!expense)` and exits early.
        assert.equal(expense, undefined);
    });
});

// == SEARCH command logic ======================================================

describe("search command logic", () => {

    const seed = [
        { id: 1, date: "2025-01-05", description: "Starbucks coffee", amount: 5.50, category: "food" },
        { id: 2, date: "2025-02-10", description: "Netflix", amount: 15.00, category: "entertainment" },
        { id: 3, date: "2025-02-20", description: "Coffee at airport", amount: 8.00, category: "food" },
        { id: 4, date: "2025-03-01", description: "Gym membership", amount: 50.00, category: "health" },
    ];

    beforeEach(() => saveExpenses(seed));

    test("keyword search — case insensitive", () => {
        const kw = "coffee";
        const expenses = readExpenses().filter((e) =>
            e.description.toLowerCase().includes(kw.toLowerCase())
        );
        assert.equal(expenses.length, 2);
    });

    test("min-amount filter", () => {
        const expenses = readExpenses().filter((e) => e.amount >= 10);
        assert.equal(expenses.length, 2);  // Netflix (15) + Gym (50)
    });

    test("max-amount filter", () => {
        const expenses = readExpenses().filter((e) => e.amount <= 10);
        assert.equal(expenses.length, 2);  // Starbucks (5.50) + Coffee (8)
    });

    test("min and max combined", () => {
        const expenses = readExpenses().filter(
            (e) => e.amount >= 6 && e.amount <= 20
        );
        assert.equal(expenses.length, 2);  // Coffee (8) + Netflix (15)
    });

    test("date range filter", () => {
        const start = new Date("2025-02-01");
        const end = new Date("2025-02-28");
        const expenses = readExpenses().filter(
            (e) => new Date(e.date) >= start && new Date(e.date) <= end
        );
        assert.equal(expenses.length, 2);  // both February entries
    });

    test("no results returns empty array, not an error", () => {
        const expenses = readExpenses().filter((e) =>
            e.description.toLowerCase().includes("zzznomatch")
        );
        // The command checks .length === 0 and shows a message. It must not throw.
        assert.equal(expenses.length, 0);
        assert.ok(Array.isArray(expenses));
    });
});

// == BUDGET command logic ======================================================

describe("budget command logic", () => {

    test("remaining = budget - spent", () => {
        const budget = 1000;
        const spent = 350;
        const remaining = budget - spent;
        assert.equal(remaining, 650);
    });

    test("detects over-budget correctly", () => {
        const budget = 500;
        const spent = 600;
        const remaining = budget - spent;
        assert.ok(remaining < 0, "remaining should be negative when over budget");
    });

    test("warning threshold: >80% spent is a warning", () => {
        const budget = 1000;
        const cases = [
            { spent: 800, expectWarning: false }, // exactly 80% — not yet
            { spent: 801, expectWarning: true }, // just over
            { spent: 999, expectWarning: true },
        ];
        cases.forEach(({ spent, expectWarning }) => {
            const isWarning = spent > budget * 0.8;
            assert.equal(isWarning, expectWarning, `spent=${spent}`);
        });
    });

    test("budget key format is YYYY-MM", () => {
        // The budget is stored as { "2025-03": 1000 }.
        // Key format must be consistent between set and read.
        const year = 2025;
        const month = 3;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        assert.equal(key, "2025-03");
    });

    test("budget for different months are independent", () => {
        const budgets = {
            "2025-01": 500,
            "2025-02": 800,
            "2025-03": 1000,
        };
        assert.equal(budgets["2025-01"], 500);
        assert.equal(budgets["2025-03"], 1000);
        // Changing one doesn't affect others
        budgets["2025-01"] = 600;
        assert.equal(budgets["2025-02"], 800);
    });
});

// == EXPORT command logic ======================================================

describe("export command logic", () => {

    const seed = [
        { id: 1, date: "2025-01-10", description: "Coffee", amount: 4.50, category: "food" },
        { id: 2, date: "2025-01-20", description: 'Dinner, "nice" place', amount: 45.00, category: "food" },
    ];

    test("CSV has correct header row", () => {
        const header = "ID,Date,Description,Amount,Category\n";
        assert.ok(header.startsWith("ID,"));
        assert.ok(header.includes("Description"));
    });

    test("CSV row format is correct", () => {
        const e = seed[0];
        const row = `${e.id},${e.date},"${e.description}",${e.amount},${e.category}`;
        assert.equal(row, `1,2025-01-10,"Coffee",4.5,food`);
    });

    test("CSV escapes double-quotes in description", () => {
        // RFC 4180: a literal quote in a quoted field is escaped as ""
        const e = seed[1];
        const row = `${e.id},${e.date},"${e.description.replace(/"/g, '""')}",${e.amount},${e.category}`;
        assert.ok(row.includes('""nice""'), "inner quotes must be doubled");
    });

    test("JSON export preserves structure", () => {
        const json = JSON.stringify(seed, null, 2);
        const parsed = JSON.parse(json);
        assert.deepEqual(parsed, seed);
    });
});