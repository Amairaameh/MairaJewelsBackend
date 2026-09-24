/**
 * Converts a Map or plain object into a standard JS object
 * @param {Map|Object} stock 
 * @returns {Object}
 */
function toPlainObject(stock) {
    if (!stock) return {};
    if (stock instanceof Map || (typeof stock.get === 'function' && typeof stock.entries === 'function')) {
        const obj = {};
        for (const [k, v] of stock.entries()) {
            obj[k] = Number(v) || 0;
        }
        return obj;
    }
    if (typeof stock === 'object') {
        const obj = {};
        for (const [k, v] of Object.entries(stock)) {
            obj[k] = Number(v) || 0;
        }
        return obj;
    }
    return {};
}

/**
 * Parses a sizes string (e.g., "18 (0), 19 (5)" or "6: 2, 7: 0") into a sizeStock object
 * @param {string} sizesStr 
 * @param {Map|Object} currentSizeStock 
 * @returns {{ sizeStock: Object, hasExplicitQty: boolean, totalStock: number }}
 */
function parseSizesStringToStock(sizesStr, currentSizeStock = {}) {
    const baseStock = toPlainObject(currentSizeStock);

    if (!sizesStr || typeof sizesStr !== 'string') {
        const total = Object.values(baseStock).reduce((sum, q) => sum + (Number(q) || 0), 0);
        return {
            sizeStock: baseStock,
            hasExplicitQty: Object.keys(baseStock).length > 0,
            totalStock: total
        };
    }

    const parts = sizesStr.split(',').map(s => s.trim()).filter(Boolean);
    const parsedStock = {};
    let hasExplicitQty = false;

    for (const part of parts) {
        // Match formats like "18 (0)", "18(5)", "18 ( 5 )"
        const parenMatch = part.match(/^(.+?)\s*\(\s*(\d+)\s*\)$/);
        // Match formats like "6: 2", "6:2", "6 = 2"
        const colonMatch = part.match(/^(.+?)\s*[:=]\s*(\d+)$/);

        if (parenMatch) {
            hasExplicitQty = true;
            const sizeKey = parenMatch[1].trim();
            const qty = parseInt(parenMatch[2], 10);
            parsedStock[sizeKey] = isNaN(qty) ? 0 : qty;
        } else if (colonMatch) {
            hasExplicitQty = true;
            const sizeKey = colonMatch[1].trim();
            const qty = parseInt(colonMatch[2], 10);
            parsedStock[sizeKey] = isNaN(qty) ? 0 : qty;
        } else {
            const sizeKey = part.trim();
            if (sizeKey && baseStock[sizeKey] !== undefined) {
                parsedStock[sizeKey] = Number(baseStock[sizeKey]) || 0;
            }
        }
    }

    const mergedStock = hasExplicitQty ? parsedStock : (Object.keys(parsedStock).length > 0 ? { ...baseStock, ...parsedStock } : baseStock);
    const totalStock = Object.values(mergedStock).reduce((sum, q) => sum + (Number(q) || 0), 0);

    return {
        sizeStock: mergedStock,
        hasExplicitQty,
        totalStock
    };
}

/**
 * Formats a sizeStock object or Map into a readable sizes string (e.g. "18 (0), 19 (3)")
 * @param {Map|Object} sizeStock 
 * @returns {string}
 */
function formatSizesString(sizeStock) {
    const plainStock = toPlainObject(sizeStock);
    const entries = Object.entries(plainStock);
    if (entries.length === 0) return '';
    return entries.map(([size, qty]) => `${size} (${Number(qty) || 0})`).join(', ');
}

/**
 * Finds the matching key in sizeStock for a requested size string
 * Supports exact match, case-insensitive match, and "Size X" variations
 * @param {Map|Object} sizeStock 
 * @param {string} requestedSize 
 * @returns {string|null}
 */
function findSizeStockKey(sizeStock, requestedSize) {
    if (requestedSize === undefined || requestedSize === null) {
        return null;
    }

    const plainStock = toPlainObject(sizeStock);
    const raw = String(requestedSize).trim();
    if (!raw) return null;

    // 1. Direct exact key match
    if (plainStock[raw] !== undefined) {
        return raw;
    }

    const keys = Object.keys(plainStock);
    const lowerRaw = raw.toLowerCase();

    // 2. Case-insensitive key match
    const ciMatch = keys.find(k => k.trim().toLowerCase() === lowerRaw);
    if (ciMatch) return ciMatch;

    // 3. Strip "Size " prefix if present (e.g. "Size 18" -> "18")
    const strippedRaw = lowerRaw.replace(/^size\s*/i, '').trim();
    const strippedMatch = keys.find(k => k.trim().toLowerCase().replace(/^size\s*/i, '') === strippedRaw);
    if (strippedMatch) return strippedMatch;

    // 4. Handle if requested size was formatted like "18 (5)" -> "18"
    const parenMatch = raw.match(/^(.+?)\s*\(\s*\d+\s*\)$/);
    if (parenMatch) {
        const baseKey = parenMatch[1].trim();
        if (plainStock[baseKey] !== undefined) return baseKey;
        const ciBase = keys.find(k => k.trim().toLowerCase() === baseKey.toLowerCase());
        if (ciBase) return ciBase;
    }

    return null;
}

module.exports = {
    toPlainObject,
    parseSizesStringToStock,
    formatSizesString,
    findSizeStockKey
};
