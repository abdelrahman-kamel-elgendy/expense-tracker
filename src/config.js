// ========= Global Configuration =========
const CATEGORIES = ["food", "transport", "housing", "health", "entertainment", "shopping", "education", "other"];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CONFIG = {
    currencySymbol: "$",
    dateFormat: "YYYY-MM-DD",
    maxAmount: 1_000_000_000,
    chartWidth: 40,
    categories: CATEGORIES,
    monthNames: MONTH_NAMES,
    monthShort: MONTH_SHORT,
};

module.exports = {
    CONFIG,
    CATEGORIES,
    MONTH_NAMES,
    MONTH_SHORT
};