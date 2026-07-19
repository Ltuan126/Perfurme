/**
 * Loyalty — pure functions shared by order/payment controllers and tests.
 * Rule: 1 điểm mỗi 10.000₫ (sau giảm giá). Hạng: Silver ≥ 500, Gold ≥ 1000, VIP ≥ 2000.
 */

const VND_PER_POINT = 10000;

function calcEarnedPoints(amount) {
    return Math.floor((Number(amount) || 0) / VND_PER_POINT);
}

function nextTier(points) {
    if (points >= 2000) return 'VIP';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'None';
}

module.exports = { VND_PER_POINT, calcEarnedPoints, nextTier };
