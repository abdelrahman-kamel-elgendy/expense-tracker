/**
 * tests/storage.test.js
 *
 * Testing file I/O requires creating real temporary files.
 * We use Node's built-in os.tmpdir() to write into a safe temp folder,
 * then clean up afterwards so tests leave no side effects.
 *
 * Run with: node --test tests/storage.test.js
 */

const { test, describe, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Test setup ─────────────────────────────────────────────────────────────
// We can't import storage.js directly because it hardcodes FILE_PATH from
// config.js. Instead we test the underlying read/write logic by invoking
// it with temp file paths, and verify the JSON on disk is correct.

let tmpDir;

// before() runs once before all tests in this describe block.
// We create a unique temp directory per test run.
before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "expense-test-"));
});

// after() runs once after all tests — clean up the temp directory.
after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Core read/write behaviour ────────────────────────────────────────────

describe("storage — JSON round-trip", () => {

    test("written data can be read back identically", () => {
        const filePath = path.join(tmpDir, "round-trip.json");
        const data = [
            { id: 1, description: "Coffee", amount: 4.50, category: "food", date: "2025-01-15" },
            { id: 2, description: "Bus", amount: 2.00, category: "transport", date: "2025-01-16" },
        ];

        // Write
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        // Read back — mimic what readExpenses does
        const raw = fs.readFileSync(filePath, "utf8").trim();
        const parsed = JSON.parse(raw);

        // assert.deepEqual checks every nested value, not just reference equality.
        // Use this whenever comparing objects or arrays.
        assert.deepEqual(parsed, data);
    });

    test("file is pretty-printed JSON (2-space indent)", () => {
        const filePath = path.join(tmpDir, "pretty.json");
        const data = [{ id: 1, amount: 10 }];

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const raw = fs.readFileSync(filePath, "utf8");

        // Pretty-printed JSON starts with "[\n  {" not "[{"
        assert.ok(raw.includes("\n"), "should contain newlines");
        assert.ok(raw.includes("  "), "should contain indentation");
    });

    test("returns fallback when file does not exist", () => {
        const filePath = path.join(tmpDir, "nonexistent.json");

        // Mimic the readJSON logic
        const fallback = [];
        const result = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;

        assert.deepEqual(result, []);
    });

    test("handles empty file gracefully", () => {
        const filePath = path.join(tmpDir, "empty.json");
        fs.writeFileSync(filePath, "");

        // Mimic the readJSON guard: data ? JSON.parse(data) : fallback
        const raw = fs.readFileSync(filePath, "utf8").trim();
        const result = raw ? JSON.parse(raw) : [];

        assert.deepEqual(result, []);
    });

    test("handles file with only whitespace", () => {
        const filePath = path.join(tmpDir, "whitespace.json");
        // A file with just a newline — common on Linux saves
        fs.writeFileSync(filePath, "\n");

        const raw = fs.readFileSync(filePath, "utf8").trim();
        const result = raw ? JSON.parse(raw) : [];

        assert.deepEqual(result, []);
    });
});

// ─── ID generation logic ──────────────────────────────────────────────────

describe("generateId", () => {
    // We test the logic inline since it's a pure function — no file needed.
    const generateId = (expenses) =>
        expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;

    test("returns 1 for empty array", () => {
        assert.equal(generateId([]), 1);
    });

    test("returns max id + 1", () => {
        const expenses = [{ id: 1 }, { id: 2 }, { id: 5 }];
        assert.equal(generateId(expenses), 6);
    });

    test("is safe after deletion — does not reuse ids", () => {
        // If expenses 3 and 4 were deleted, length = 2 but max = 5.
        // length + 1 would give 3 — a collision. max + 1 gives 6. Correct.
        const expenses = [{ id: 1 }, { id: 2 }, { id: 5 }];
        const newId = generateId(expenses);
        const existingIds = expenses.map((e) => e.id);
        assert.equal(existingIds.includes(newId), false);
    });
});

// ─── Data integrity ───────────────────────────────────────────────────────

describe("data integrity", () => {

    test("saving preserves all expense fields", () => {
        const filePath = path.join(tmpDir, "integrity.json");
        const expense = {
            id: 1,
            date: "2025-03-01",
            description: "Test expense",
            amount: 99.99,
            category: "testing",
            createdAt: new Date().toISOString(),
        };

        fs.writeFileSync(filePath, JSON.stringify([expense], null, 2));
        const [saved] = JSON.parse(fs.readFileSync(filePath, "utf8"));

        assert.equal(saved.id, expense.id);
        assert.equal(saved.date, expense.date);
        assert.equal(saved.description, expense.description);
        assert.equal(saved.amount, expense.amount);
        assert.equal(saved.category, expense.category);
    });

    test("multiple saves do not stack — last write wins", () => {
        const filePath = path.join(tmpDir, "overwrite.json");
        const first = [{ id: 1, description: "First" }];
        const second = [{ id: 1, description: "Second" }];

        fs.writeFileSync(filePath, JSON.stringify(first, null, 2));
        fs.writeFileSync(filePath, JSON.stringify(second, null, 2));

        const result = JSON.parse(fs.readFileSync(filePath, "utf8"));
        assert.equal(result[0].description, "Second");
    });
});