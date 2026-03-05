const chalk = require("chalk");
const { currencySymbol, MONTH_NAMES, CHART_HEIGHT, MAX_BAR_WIDTH } = require("../config");

// === Colour palette cycling through categories/months =======================
const PALETTE = [
    chalk.cyan,
    chalk.yellow,
    chalk.green,
    chalk.magenta,
    chalk.blue,
    chalk.red,
    chalk.white,
];

// Fractional block chars for smooth bar ends
const FRAC_BLOCKS = [
    " ",
    "▏",
    "▎",
    "▍",
    "▌",
    "▋",
    "▊",
    "▉",
    "█"
];


const makeBar = (value, maxValue, width = MAX_BAR_WIDTH, color = chalk.cyan) => {
    if (maxValue === 0)
        return chalk.gray("=".repeat(width));

    const ratio = Math.min(value / maxValue, 1);
    const total8 = Math.round(ratio * width * 8);
    const full = Math.floor(total8 / 8);
    const frac = total8 % 8;
    const empty = width - full - (frac > 0 ? 1 : 0);

    return (
        color("█".repeat(full)) +
        (frac > 0 ? color(FRAC_BLOCKS[frac]) : "") +
        chalk.gray("░".repeat(Math.max(0, empty)))
    );
};

// === Horizontal bar chart (categories / comparison) =========================
/**
 * @param {Object} data  { label: { total, count }, … }
 * @param {string} title
 * @param {Object} opts  { width, showPercent, showCount }
 */
const renderBarChart = (data, title, opts = {}) => {
    const { width = MAX_BAR_WIDTH, showPercent = true, showCount = true } = opts;

    const entries = Object.entries(data).sort(([, a], [, b]) => b.total - a.total);
    if (!entries.length) {
        console.log(chalk.yellow("  No data"));
        return;
    }

    const maxTotal = Math.max(...entries.map(([, v]) => v.total));
    const grandTotal = entries.reduce((s, [, v]) => s + v.total, 0);
    const labelW = Math.max(...entries.map(([k]) => k.length), 4);

    console.log(chalk.bold(`\n${title}`));
    console.log(chalk.gray("=".repeat(labelW + width + 28)));

    entries.forEach(([label, val], i) => {
        const color = PALETTE[i % PALETTE.length];
        const bar = makeBar(val.total, maxTotal, width, color);
        const amt = chalk.white(`${currencySymbol}${val.total.toFixed(2)}`);
        const pct = showPercent ? chalk.gray(` ${((val.total / grandTotal) * 100).toFixed(1)}%`) : "";
        const cnt = showCount ? chalk.gray(` (${val.count})`) : "";
        console.log(`  ${color(label.padEnd(labelW))}  ${bar}  ${amt}${pct}${cnt}`);
    });

    console.log(chalk.gray("=".repeat(labelW + width + 28)));
    console.log(`  ${"TOTAL".padEnd(labelW)}  ${" ".repeat(width)}  ${chalk.green(`${currencySymbol}${grandTotal.toFixed(2)}`)}`);
};

// === Monthly vertical bar chart (trend over 12 months) ======================
/**
 * @param {Object} monthlyData  { 1: { total, count }, … }   (keys 1-12)
 * @param {string} title
 * @param {number} year
 */
const renderMonthlyChart = (monthlyData, title, year) => {
    const COL = 5;            // characters per month column
    const H = CHART_HEIGHT; // rows tall
    const values = Array.from({ length: 12 }, (_, i) => monthlyData[i + 1]?.total || 0);
    const maxVal = Math.max(...values, 0.01);

    console.log(chalk.bold(`\n${title} (${year})`));
    console.log(chalk.gray("=".repeat(10 + 12 * COL)));

    for (let row = H; row >= 1; row--) {
        const hi = (row / H) * maxVal;
        const lo = ((row - 1) / H) * maxVal;

        // Y-axis label on top and middle rows only
        let yLabel = "         ";
        if (row === H)
            yLabel = chalk.gray(`${currencySymbol}${maxVal.toFixed(0).padStart(7)} `);
        else if (row === Math.ceil(H / 2))
            yLabel = chalk.gray(`${currencySymbol}${(maxVal / 2).toFixed(0).padStart(7)} `);

        process.stdout.write(yLabel + chalk.gray("│"));

        values.forEach((v) => {
            let cell;
            if (v >= hi) cell = chalk.cyan("█".repeat(COL));
            else if (v >= lo) cell = chalk.blue("▄".repeat(COL));
            else cell = " ".repeat(COL);
            process.stdout.write(cell);
        });
        console.log();
    }

    // X-axis line
    console.log(chalk.gray("         └" + "=".repeat(12 * COL)));

    // Month name labels
    process.stdout.write("          ");
    MONTH_NAMES.forEach((m) => process.stdout.write(chalk.gray(m.padEnd(COL))));
    console.log();

    // Value labels
    process.stdout.write("          ");
    values.forEach((v) => {
        const lbl = v > 0 ? `${v.toFixed(0)}` : "=";
        process.stdout.write(chalk.white(lbl.slice(0, COL).padEnd(COL)));
    });
    console.log("\n");
};

// === Mini sparkline (inline, single-row) ====================================
const SPARK_CHARS = [
    "▁",
    "▂",
    "▃",
    "▄",
    "▅",
    "▆",
    "▇",
    "█"
];

const renderSparkline = (values, label = "") => {
    const max = Math.max(...values, 0.01);
    const spark = values
        .map((v) => chalk.cyan(SPARK_CHARS[Math.min(Math.floor((v / max) * 7), 7)]))
        .join("");
    console.log(`  ${chalk.gray(label.padEnd(12))} ${spark}`);
};

module.exports = {
    renderBarChart,
    renderMonthlyChart,
    renderSparkline,
    makeBar
};