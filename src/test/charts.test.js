/**
 * tests/charts.test.js
 *
 * Charts are hard to assert visually, so we test the *math* behind them —
 * the ratio calculations, index lookups, and edge cases.
 * The rendering (chalk colours, process.stdout) we verify manually.
 *
 * Run with: node --test tests/charts.test.js
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

// === Inline the pure math from charts/index.js ============================
// (same approach as formatters — avoids chalk dependency)

const FRAC_BLOCKS = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];
const SPARK_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

// The bar math extracted as a pure function (no chalk, no output)
const computeBar = (value, maxValue, width) => {
    if (maxValue === 0) return { full: 0, frac: 0, empty: width };
    const ratio = Math.min(value / maxValue, 1);
    const total8 = Math.round(ratio * width * 8);
    const full = Math.floor(total8 / 8);
    const frac = total8 % 8;
    const empty = width - full - (frac > 0 ? 1 : 0);
    return { full, frac, empty, fracChar: FRAC_BLOCKS[frac] };
};

const computeSparkIndex = (value, max) =>
    Math.min(Math.floor((value / max) * 7), 7);

// === computeBar tests =========================================================

describe("bar chart math", () => {

    test("100% full bar: all full blocks, no empty", () => {
        const result = computeBar(10, 10, 10);
        assert.equal(result.full, 10);
        assert.equal(result.frac, 0);
        assert.equal(result.empty, 0);
    });

    test("0% bar: no full blocks, all empty", () => {
        const result = computeBar(0, 10, 10);
        assert.equal(result.full, 0);
        assert.equal(result.frac, 0);
        assert.equal(result.empty, 10);
    });

    test("50% bar splits width in half", () => {
        const result = computeBar(5, 10, 10);
        // 50% of 10 wide = 5 full, 0 frac, 5 empty
        assert.equal(result.full, 5);
        assert.equal(result.empty, 5);
    });

    test("75% bar — 3 quarters of width 8", () => {
        // value=3, max=4, width=8 → ratio=0.75 → total8=48 → full=6, frac=0, empty=2
        const result = computeBar(3, 4, 8);
        assert.equal(result.full, 6);
        assert.equal(result.empty, 2);
    });

    test("fractional block appears at partial fill", () => {
        // value=1, max=8, width=8 → ratio=0.125 → total8=8 → full=1, frac=0, empty=7
        // value=1, max=16, width=8 → ratio=0.0625 → total8=4 → full=0, frac=4, empty=7
        const result = computeBar(1, 16, 8);
        assert.equal(result.full, 0);
        assert.equal(result.frac, 4);  // index 4 = ▌
        assert.equal(result.fracChar, "▌");
    });

    test("frac index maps to correct FRAC_BLOCKS character", () => {
        // Each remainder 0-8 maps to the right Unicode character
        const expected = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];
        expected.forEach((char, i) => {
            assert.equal(FRAC_BLOCKS[i], char, `FRAC_BLOCKS[${i}] should be ${char}`);
        });
    });

    test("clamps to 100% when value exceeds max", () => {
        // Over-budget scenario: spent more than budget
        const result = computeBar(150, 100, 10);
        assert.equal(result.full, 10);  // capped at full width
        assert.equal(result.empty, 0);
    });

    test("returns all empty when maxValue is 0", () => {
        // Avoids division by zero
        const result = computeBar(0, 0, 10);
        assert.equal(result.full, 0);
        assert.equal(result.empty, 10);
    });

    test("full + frac-cell + empty always equals width", () => {
        // Layout invariant: total character width must always equal the requested width
        const cases = [
            [0, 10, 20],
            [5, 10, 20],
            [10, 10, 20],
            [3, 7, 15],
            [1, 3, 40],
        ];
        cases.forEach(([value, max, width]) => {
            const { full, frac, empty } = computeBar(value, max, width);
            const fracCells = frac > 0 ? 1 : 0;
            assert.equal(
                full + fracCells + empty,
                width,
                `value=${value} max=${max} width=${width} → ${full}+${fracCells}+${empty} ≠ ${width}`
            );
        });
    });
});

// === Sparkline math ===========================================================

describe("sparkline math", () => {

    test("max value maps to highest char (index 7 = █)", () => {
        assert.equal(computeSparkIndex(10, 10), 7);
        assert.equal(SPARK_CHARS[7], "█");
    });

    test("zero value maps to lowest char (index 0 = ▁)", () => {
        assert.equal(computeSparkIndex(0, 10), 0);
        assert.equal(SPARK_CHARS[0], "▁");
    });

    test("50% value maps to middle of range (index ~3)", () => {
        // Math.floor(0.5 * 7) = Math.floor(3.5) = 3
        assert.equal(computeSparkIndex(5, 10), 3);
    });

    test("index is always in 0-7 range", () => {
        const values = [0, 1, 5, 9, 10, 10.5]; // 10.5 > max=10 tests clamping
        values.forEach((v) => {
            const idx = computeSparkIndex(v, 10);
            assert.ok(idx >= 0 && idx <= 7, `index ${idx} for value ${v} out of range`);
        });
    });

    test("SPARK_CHARS has exactly 8 entries", () => {
        assert.equal(SPARK_CHARS.length, 8);
    });
});

// === Monthly chart row logic ==================================================

describe("monthly chart row thresholds", () => {

    // The vertical chart works by dividing the max value into H equal bands.
    // For each row, compute hi and lo. A bar in that row means value is in [lo, hi).

    const computeRowThresholds = (row, H, maxVal) => ({
        hi: (row / H) * maxVal,
        lo: ((row - 1) / H) * maxVal,
    });

    test("top row threshold spans the top band", () => {
        // H=8, maxVal=800. Row 8 (top) should span 700-800.
        const { hi, lo } = computeRowThresholds(8, 8, 800);
        assert.equal(hi, 800);
        assert.equal(lo, 700);
    });

    test("bottom row spans 0 to first band", () => {
        const { hi, lo } = computeRowThresholds(1, 8, 800);
        assert.equal(lo, 0);
        assert.equal(hi, 100);
    });

    test("a value at maxVal fills all rows — bar reaches the top", () => {
        // When value = maxVal, every row's hi threshold is <= value,
        // so the bar is "filled" in all rows. This is correct:
        // a bar at 100% height should show blocks in every row.
        // The "only top row" assumption was wrong — that's not how vertical bars work.
        const H = 8, maxVal = 800, value = 800;
        let filledRows = 0;
        for (let row = H; row >= 1; row--) {
            const { hi } = computeRowThresholds(row, H, maxVal);
            if (value >= hi) filledRows++;
        }
        assert.equal(filledRows, H);  // all rows filled when value = maxVal
    });

    test("a value of 0 fills no rows", () => {
        const H = 8, maxVal = 800, value = 0;
        let filledRows = 0;
        for (let row = H; row >= 1; row--) {
            const { hi } = computeRowThresholds(row, H, maxVal);
            if (value >= hi) filledRows++;
        }
        assert.equal(filledRows, 0);
    });
});