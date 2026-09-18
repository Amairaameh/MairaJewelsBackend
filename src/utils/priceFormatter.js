/**
 * Maira Jewels - Currency & Price Parsing / Formatting Utility
 * Handles multiple international and local decimal/thousands separators:
 * - "120.00" -> 120.00
 * - "120,00" -> 120.00 (comma as decimal separator)
 * - "1,200.00" -> 1200.00
 * - "1.200,00" -> 1200.00
 * - "12,000.00" -> 12000.00
 * - "R 120.00" -> 120.00
 * - "R 120,00" -> 120.00
 */

const parsePrice = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;

    let str = String(val).trim();
    // Strip leading non-numeric chars except digits, comma, period, minus
    str = str.replace(/^[^\d,.-]+/, '').trim();

    // Check for combinations of comma and dot
    if (str.includes(',') && str.includes('.')) {
        // e.g. "1,200.50" (comma thousands, dot decimal)
        if (str.indexOf(',') < str.indexOf('.')) {
            str = str.replace(/,/g, '');
        } else {
            // e.g. "1.200,50" (dot thousands, comma decimal)
            str = str.replace(/\./g, '').replace(/,/g, '.');
        }
    } else if (str.includes(',')) {
        // E.g. "120,00" or "120,5" -> comma is decimal separator (1 or 2 digits after comma at the end)
        if (/,\d{1,2}$/.test(str)) {
            str = str.replace(/,/g, '.');
        } else {
            // E.g. "1,000" or "12,000" -> comma is thousands separator
            str = str.replace(/,/g, '');
        }
    }

    // Strip any remaining unwanted chars
    str = str.replace(/[^0-9.-]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

const formatPrice = (val) => {
    const num = parsePrice(val);
    return `R ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

module.exports = {
    parsePrice,
    formatPrice
};
