const { CONFIG } = require("../config");

const validateAmount = (amount) => {
    const num = parseFloat(amount);

    if (isNaN(num) || num <= 0)
        return { valid: false, message: "Amount must be a positive number" };

    if (!Number.isFinite(num))
        return { valid: false, message: "Amount must be a finite number" };

    if (num > maxAmount)
        return { valid: false, message: `Amount too large (max: ${CONFIG.maxAmount})` };

    return { valid: true, value: parseFloat(num.toFixed(2)) };
};

const validateId = (id) => {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0)
        return { valid: false, message: "ID must be a positive integer" };

    return { valid: true, value: num };
};

const validateMonth = (month) => {
    const num = parseInt(month);
    if (isNaN(num) || num < 1 || num > 12)
        return { valid: false, message: "Month must be between 1 and 12" };

    return { valid: true, value: num };
};

const validateDate = (strDate) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
        return { valid: false, message: "Invalid date format. Use YYYY-MM-DD" };

    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return { valid: false, message: "Invalid date value" };

    return { valid: true, value: dateStr };
};

const validateYear = (year) => {
    const nowYear = new Date().getFullYear();

    const num = parseInt(year);
    if (isNaN(num) || num < 1900 || num > nowYear)
        return { valid: false, message: `Year must be between 1900 and ${nowYear} ` };

    return { valid: true, value: num };
};


module.exports = {
    validateAmount,
    validateId,
    validateMonth,
    validateDate,
    validateYear
};