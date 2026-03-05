const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { readExpenses, saveExpenses, generateId } = require("../utils/storage");
const { validateAmount, validateDate } = require("../utils/validation");
const { displayExpenseTable } = require("../utils/display");

// == Smart category detection from description =================================
const CATEGORY_KEYWORDS = {
    food: ["restaurant", "cafe", "coffee", "lunch", "dinner", "breakfast", "pizza", "burger", "grocery", "supermarket", "food", "eat", "meal", "snack", "starbucks", "mcdonalds", "kfc", "uber eats", "delivery"],
    transport: ["uber", "lyft", "taxi", "bus", "metro", "subway", "train", "gas", "fuel", "parking", "toll", "flight", "airline", "ticket", "transit", "car"],
    housing: ["rent", "mortgage", "utility", "electric", "water", "internet", "wifi", "maintenance", "repair", "insurance", "lease"],
    health: ["pharmacy", "hospital", "doctor", "clinic", "medicine", "drug", "gym", "fitness", "dental", "vision", "health"],
    entertainment: ["netflix", "spotify", "cinema", "movie", "concert", "game", "steam", "playstation", "xbox", "disney", "hulu", "amazon prime", "ticket"],
    shopping: ["amazon", "ebay", "clothing", "shoes", "fashion", "mall", "store", "shop", "purchase"],
    education: ["course", "book", "school", "university", "tuition", "udemy", "coursera", "tutorial", "class"],
};

const detectCategory = (description) => {
    const lower = description.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) return cat;
    }
    return "other";
};

// == CSV parser (no external dependency) =======================================
const parseCSV = (content) => {
    const lines = content.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted fields (e.g. "hello, world")
        const values = [];
        let current = "";
        let inQuotes = false;

        for (const char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                values.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const row = {};
        headers.forEach((h, idx) => (row[h] = values[idx] ?? ""));
        rows.push(row);
    }

    return { headers, rows };
};

// == Column auto-mapping =======================================================
const findColumn = (headers, aliases) =>
    headers.find((h) => aliases.some((a) => h.includes(a)));

const COLUMN_ALIASES = {
    description: ["description", "desc", "name", "merchant", "payee", "memo", "details", "note", "narration"],
    amount: ["amount", "price", "cost", "value", "debit", "credit", "sum"],
    date: ["date", "time", "datetime", "transaction date", "posted"],
    category: ["category", "type", "tag", "label", "group"],
};

module.exports = program => {
    program
        .command("import")
        .description("Import expenses from a CSV or JSON file")
        .requiredOption("-f, --file <path>", "Path to CSV or JSON file")
        .option("--format <format>", "Force format: csv or json (auto-detected if omitted)")
        .option("--desc-col <col>", "CSV column name for description")
        .option("--amount-col <col>", "CSV column name for amount")
        .option("--date-col <col>", "CSV column name for date")
        .option("--cat-col <col>", "CSV column name for category")
        .option("--default-category <cat>", "Default category if none detected", "other")
        .option("--auto-category", "Auto-detect category from description")
        .option("--dry-run", "Preview import without saving")
        .option("--skip-errors", "Skip invalid rows instead of aborting")
        .action(opts => {
            // == Resolve file =====================================================
            const filePath = path.resolve(opts.file);
            if (!fs.existsSync(filePath)) {
                console.error(chalk.red(`  ✖  File not found: ${filePath}`));
                process.exit(1);
            }

            const ext = path.extname(filePath).toLowerCase().slice(1);
            const format = opts.format?.toLowerCase() || (["csv", "json"].includes(ext) ? ext : null);

            if (!format) {
                console.error(chalk.red("  ✖  Could not detect format. Use --format csv or --format json."));
                process.exit(1);
            }

            const content = fs.readFileSync(filePath, "utf8");

            // == Parse ============================================================
            let rawRows = [];
            let headers = [];

            if (format === "json") {
                try {
                    const parsed = JSON.parse(content);
                    rawRows = Array.isArray(parsed) ? parsed : [parsed];
                    if (rawRows.length) headers = Object.keys(rawRows[0]).map((k) => k.toLowerCase());
                } catch {
                    console.error(chalk.red("  ✖  Invalid JSON file."));
                    process.exit(1);
                }
            } else {
                const { headers: h, rows } = parseCSV(content);
                headers = h;
                rawRows = rows;
            }

            if (!rawRows.length) {
                console.log(chalk.yellow("  File contains no data rows."));
                return;
            }

            // == Column mapping ===================================================
            const colMap = {
                description: opts.descCol || findColumn(headers, COLUMN_ALIASES.description) || "description",
                amount: opts.amountCol || findColumn(headers, COLUMN_ALIASES.amount) || "amount",
                date: opts.dateCol || findColumn(headers, COLUMN_ALIASES.date) || "date",
                category: opts.catCol || findColumn(headers, COLUMN_ALIASES.category) || "category",
            };

            console.log(chalk.bold(`\n  📂 Importing from ${chalk.white(path.basename(filePath))}`));
            console.log(chalk.gray(`  ${"=".repeat(44)}`));
            console.log(chalk.gray(`  Format:   ${format.toUpperCase()}`));
            console.log(chalk.gray(`  Rows:     ${rawRows.length}`));
            console.log(chalk.gray(`  Columns → desc: "${colMap.description}", amount: "${colMap.amount}", date: "${colMap.date}"`));

            // == Process rows =====================================================
            const today = new Date().toISOString().split("T")[0];
            const existing = readExpenses();
            let nextId = existing.length > 0 ? Math.max(...existing.map(e => e.id)) + 1 : 1;

            const imported = [];
            const errors = [];

            rawRows.forEach((row, i) => {
                const lineNum = i + 2; // 1-indexed + header row

                // Normalise row keys to lowercase
                const normRow = Object.fromEntries(
                    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
                );

                const rawDesc = normRow[colMap.description] || "";
                const rawAmount = normRow[colMap.amount] || "";
                const rawDate = normRow[colMap.date] || today;
                const rawCat = normRow[colMap.category] || "";

                // Validate description
                const desc = rawDesc.trim();
                if (!desc) {
                    errors.push({ line: lineNum, reason: "Missing description" });
                    if (!opts.skipErrors) return;
                }

                // Validate amount (handle parentheses like accounting export "(50.00)")
                const cleanAmount = rawAmount.replace(/[$,()]/g, "").trim();
                const amtResult = validateAmount(cleanAmount || "0");
                if (!amtResult.valid) {
                    errors.push({ line: lineNum, reason: `Invalid amount "${rawAmount}"` });
                    if (!opts.skipErrors) return;
                    return;
                }

                // Validate / format date
                let dateStr = rawDate.trim().split(" ")[0]; // strip time if present
                // Handle MM/DD/YYYY → YYYY-MM-DD
                if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                    const parts = dateStr.split("/");
                    dateStr = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
                }
                const dateResult = validateDate(dateStr);
                if (!dateResult.valid) {
                    dateStr = today; // fall back to today
                }

                // Determine category
                let category = rawCat.trim().toLowerCase() || opts.defaultCategory;
                if (opts.autoCategory) {
                    category = detectCategory(desc);
                }

                imported.push({
                    id: nextId++,
                    date: dateStr,
                    description: desc,
                    amount: amtResult.value,
                    category,
                    createdAt: new Date().toISOString(),
                    importedFrom: path.basename(filePath),
                });
            });

            // == Report errors ====================================================
            if (errors.length) {
                console.log(chalk.yellow(`\n  ⚠️  ${errors.length} row(s) had issues:`));
                errors.slice(0, 10).forEach(({ line, reason }) =>
                    console.log(chalk.gray(`    Line ${line}: ${reason}`))
                );
                if (errors.length > 10) console.log(chalk.gray(`    … and ${errors.length - 10} more`));
            }

            if (!imported.length) {
                console.log(chalk.yellow("\n  Nothing to import."));
                return;
            }

            // == Preview / Save ===================================================
            displayExpenseTable(imported.slice(0, 10), `Preview (first ${Math.min(imported.length, 10)} of ${imported.length})`);

            if (imported.length > 10) {
                console.log(chalk.gray(`  … and ${imported.length - 10} more rows`));
            }

            if (opts.dryRun) {
                console.log(chalk.yellow("\n  🔍 Dry run — no data saved. Remove --dry-run to import."));
                return;
            }

            existing.push(...imported);
            saveExpenses(existing);

            console.log(chalk.green(`\n  ✅ Successfully imported ${imported.length} expense(s)!`));
            if (errors.length && opts.skipErrors) {
                console.log(chalk.yellow(`  ⚠️  ${errors.length} row(s) skipped due to errors.`));
            }
        });
};