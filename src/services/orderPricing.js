/**
 * Order pricing — pure functions shared by controllers and tests.
 * Rule: combo 3+ chai mini (15ml) → giảm 10% trên tổng tiền các chai mini.
 */

function isMini(item) {
    return !!item && (item.sizeLabel === '15ml' || /mini/i.test(item.name || ''));
}

// cart: [{ name, price, quantity, sizeLabel }] — giá đã được resolve từ DB
function computeCartPricing(cart) {
    const items = Array.isArray(cart) ? cart : [];
    const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);

    const miniCount = items.reduce((n, i) => n + (isMini(i) ? (Number(i.quantity) || 1) : 0), 0);
    let discount = 0;
    if (miniCount >= 3) {
        const minisTotal = items
            .filter(isMini)
            .reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
        discount = Math.round(minisTotal * 0.10);
    }

    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total, miniCount };
}

module.exports = { isMini, computeCartPricing };
