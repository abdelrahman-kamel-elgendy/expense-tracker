/**
 * tests/formatters.test.js
 *
 * Pure functions are the easiest to test — no files, no side effects,
 * just input → output. Every function here is deterministic.
 *
 * Run with: node --test tests/formatters.test.js
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

// We test the logic directly rather than importing from formatters.js,
// because formatters.js depends on chalk which needs node_modules.
// This way you learn the logic AND the tests run without npm install.
// Once you have node_modules, swap these out for the real imports.

// === calculateStats ===========================================================

const calculateStats = (expenses) => {
    if (!expenses.length) return null;
    const amounts = expenses.map((e) => e.amount);
    const total = amounts.reduce((sum, a) => sum + a, 0);
    return {
        total,
        average: total / expenses.length,
        max: Math.max(...amounts),
        min: Math.min(...amounts),
        count: expenses.length,
    };
};

describe("calculateStats", () => {

    test("returns null for empty array", () => {
        // assert.equal(null, null) — strict equality
        assert.equal(calculateStats([]), null);
    });

    test("correct total for single expense", () => {
        const result = calculateStats([{ amount: 42.50 }]);
        assert.equal(result.total, 42.50);
        assert.equal(result.count, 1);
        assert.equal(result.average, 42.50);
    });

    test("correct stats for multiple expenses", () => {
        const expenses = [
            { amount: 10 },
            { amount: 20 },
            { amount: 30 },
        ];
        const result = calculateStats(expenses);

        assert.equal(result.total, 60);
        assert.equal(result.average, 20);
        assert.equal(result.max, 30);
        assert.equal(result.min, 10);
        assert.equal(result.count, 3);
    });

    test("max and min work with identical amounts", () => {
        const expenses = [{ amount: 5 }, { amount: 5 }, { amount: 5 }];
        const result = calculateStats(expenses);
        assert.equal(result.max, 5);
        assert.equal(result.min, 5);
    });

    test("handles floating point amounts", () => {
        const expenses = [{ amount: 0.1 }, { amount: 0.2 }];
        const result = calculateStats(expenses);
        // 0.1 + 0.2 in JS is 0.30000000000000004 — we verify the raw result.
        // In the real app, validateAmount rounds to 2dp before storing,
        // so this edge case won't appear in practice — but good to know it exists.
        assert.ok(result.total > 0.29 && result.total < 0.31);
    });
});

// === groupByMonth =============================================================

const groupByMonth = (expenses) =>
    expenses.reduce((acc, e) => {
        const m = new Date(e.date).getMonth() + 1;
        if (!acc[m]) acc[m] = { total: 0, count: 0 };
        acc[m].total += e.amount;
        acc[m].count++;
        return acc;
    }, {});

describe("groupByMonth", () => {

    test("groups expenses by month correctly", () => {
        const expenses = [
            { date: "2025-01-10", amount: 10 },
            { date: "2025-01-20", amount: 20 },
            { date: "2025-03-05", amount: 50 },
        ];
        const result = groupByMonth(expenses);

        assert.equal(result[1].total, 30);  // Jan: 10 + 20
        assert.equal(result[1].count, 2);
        assert.equal(result[3].total, 50);  // Mar
        assert.equal(result[3].count, 1);
    });

    test("months with no expenses are absent from result", () => {
        const expenses = [{ date: "2025-06-01", amount: 100 }];
        const result = groupByMonth(expenses);

        // Only June should exist
        assert.equal(Object.keys(result).length, 1);
        assert.ok(result[6]);
        assert.equal(result[1], undefined);
    });

    test("returns empty object for empty input", () => {
        assert.deepEqual(groupByMonth([]), {});
    });
});

// === groupByCategory ==========================================================

const groupByCategory = (expenses) =>
    expenses.reduce((acc, e) => {
        const cat = (e.category || "other").toLowerCase();
        if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
        acc[cat].total += e.amount;
        acc[cat].count++;
        return acc;
    }, {});

describe("groupByCategory", () => {

    test("groups by category correctly", () => {
        const expenses = [
            { category: "food", amount: 15 },
            { category: "food", amount: 25 },
            { category: "transport", amount: 10 },
        ];
        const result = groupByCategory(expenses);

        assert.equal(result.food.total, 40);
        assert.equal(result.food.count, 2);
        assert.equal(result.transport.total, 10);
    });

    test("normalises category to lowercase", () => {
        const expenses = [
            { category: "Food", amount: 10 },
            { category: "FOOD", amount: 20 },
            { category: "food", amount: 30 },
        ];
        const result = groupByCategory(expenses);

        // All three should merge under "food"
        assert.equal(Object.keys(result).length, 1);
        assert.equal(result.food.total, 60);
    });

    test("falls back to 'other' for missing category", () => {
        // Old expense records may not have a category field at all.
        // The || "other" fallback handles backward compatibility.
        const expenses = [{ amount: 50 }];  // no category key
        const result = groupByCategory(expenses);

        assert.ok(result.other);
        assert.equal(result.other.total, 50);
    });
});

// === generateId ===============================================================

const generateId = (expenses) =>
    expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;

describe("generateId", () => {

    test("starts at 1 for empty list", () => {
        assert.equal(generateId([]), 1);
    });

    test("uses max id not length — safe after deletions", () => {
        // Simulates: added 1,2,3,4,5 then deleted 3 and 4.
        // length = 3, but ids are [1,2,5]. Next should be 6, not 4.
        const expenses = [{ id: 1 }, { id: 2 }, { id: 5 }];
        assert.equal(generateId(expenses), 6);
    });

    test("never produces a duplicate id", () => {
        const expenses = [{ id: 1 }, { id: 3 }, { id: 7 }];
        const newId = generateId(expenses);
        const existing = new Set(expenses.map((e) => e.id));
        assert.equal(existing.has(newId), false);
    });
});

// === formatCurrency ===========================================================

const formatCurrency = (amount, symbol = "$") =>
    `${symbol}${amount.toFixed(2)}`;

describe("formatCurrency", () => {

    test("formats whole number with 2 decimal places", () => {
        assert.equal(formatCurrency(10), "$10.00");
    });

    test("formats decimal correctly", () => {
        assert.equal(formatCurrency(4.5), "$4.50");
    });

    test("formats large amount", () => {
        assert.equal(formatCurrency(1234.99), "$1234.99");
    });

    test("rounds when toFixed rounds", () => {
        // toFixed(2) on 1.005 — floating point means result may vary by platform,
        // but the format shape ($X.XX) should always hold.
        const result = formatCurrency(1.005);
        assert.match(result, /^\$\d+\.\d{2}$/);
    });
});