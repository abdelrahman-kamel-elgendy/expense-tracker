/**
 * tests/validators.test.js
 *
 * Uses Node's built-in test runner (no install needed).
 * Run with: node --test tests/validators.test.js
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const {
    validateAmount,
    validateId,
    validateMonth,
    validateDate,
    validateYear,
} = require("../main/utils/validation");

// === validateAmount ===========================================================
// describe() groups related tests together — purely organisational, no effect
// on how tests run. Think of it as a folder label for your test output.

describe("validateAmount", () => {

    // test() registers one test case. First arg is the label shown in output.
    // Second arg is the function that runs the actual assertions.
    test("accepts a valid positive number", () => {
        const result = validateAmount("15.50");

        // assert.equal(actual, expected) — throws if they don't match,
        // which marks the test as failed.
        assert.equal(result.valid, true);
        assert.equal(result.value, 15.5);
    });

    test("rounds to 2 decimal places", () => {
        const result = validateAmount("15.999");
        assert.equal(result.valid, true);
        // 15.999 rounded to 2dp = 16.00
        assert.equal(result.value, 16.00);
    });

    test("rejects zero", () => {
        const result = validateAmount("0");
        assert.equal(result.valid, false);
        // assert.ok() checks that the value is truthy — useful for checking
        // a message exists without caring about the exact wording.
        assert.ok(result.message);
    });

    test("rejects negative numbers", () => {
        const result = validateAmount("-10");
        assert.equal(result.valid, false);
    });

    test("rejects non-numeric strings", () => {
        const result = validateAmount("hello");
        assert.equal(result.valid, false);
    });

    test("rejects Infinity", () => {
        // This is the edge case the original code missed.
        // parseFloat("Infinity") = Infinity, which passes isNaN but fails isFinite.
        const result = validateAmount("Infinity");
        assert.equal(result.valid, false);
    });

    test("rejects amounts over 1 billion", () => {
        const result = validateAmount("1000000001");
        assert.equal(result.valid, false);
    });

    test("accepts integer strings", () => {
        const result = validateAmount("100");
        assert.equal(result.valid, true);
        assert.equal(result.value, 100);
    });
});

// === validateId ==============================================================

describe("validateId", () => {

    test("accepts a valid positive integer string", () => {
        const result = validateId("5");
        assert.equal(result.valid, true);
        assert.equal(result.value, 5);
    });

    test("rejects a float string — key bug parseInt would miss", () => {
        // parseInt("3.7") returns 3 — silently wrong.
        // Number("3.7") returns 3.7 — then isInteger(3.7) = false. Correct.
        const result = validateId("3.7");
        assert.equal(result.valid, false);
    });

    test("rejects alphanumeric — key bug parseInt would miss", () => {
        // parseInt("3abc") returns 3 — silently wrong.
        // Number("3abc") returns NaN — caught correctly.
        const result = validateId("3abc");
        assert.equal(result.valid, false);
    });

    test("rejects zero", () => {
        assert.equal(validateId("0").valid, false);
    });

    test("rejects negative", () => {
        assert.equal(validateId("-1").valid, false);
    });
});

// === validateMonth ============================================================

describe("validateMonth", () => {

    test("accepts 1 through 12", () => {
        for (let m = 1; m <= 12; m++) {
            const result = validateMonth(String(m));
            assert.equal(result.valid, true, `month ${m} should be valid`);
            assert.equal(result.value, m);
        }
    });

    test("rejects 0", () => {
        assert.equal(validateMonth("0").valid, false);
    });

    test("rejects 13", () => {
        assert.equal(validateMonth("13").valid, false);
    });

    test("rejects non-numeric", () => {
        assert.equal(validateMonth("march").valid, false);
    });
});

// === validateDate =============================================================

describe("validateDate", () => {

    test("accepts a valid ISO date", () => {
        const result = validateDate("2025-03-15");
        assert.equal(result.valid, true);
        assert.equal(result.value, "2025-03-15");
    });

    test("rejects wrong format — DD/MM/YYYY", () => {
        assert.equal(validateDate("15/03/2025").valid, false);
    });

    test("rejects wrong format — text month", () => {
        assert.equal(validateDate("March 15 2025").valid, false);
    });

    test("rejects impossible date that passes regex — bug the original had", () => {
        // "2025-13-99" matches the pattern \d{4}-\d{2}-\d{2} but is not a real date.
        // The original only had the regex check, so this would pass.
        // Our fix adds: new Date(dateStr) and checks isNaN(d.getTime()).
        const result = validateDate("2025-13-99");
        assert.equal(result.valid, false);
    });

    test("rejects empty string", () => {
        assert.equal(validateDate("").valid, false);
    });
});