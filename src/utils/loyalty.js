// Loyalty utilities
// Rule: 1 điểm mỗi 10.000₫ chi tiêu (sau giảm giá)
// Hạng: Silver ≥ 500, Gold ≥ 1000, VIP ≥ 2000

export const VND_PER_POINT = 10000;

export function computeTier(points = 0) {
  if (points >= 2000) return 'VIP';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'None';
}

// Tổng tiền đầu vào luôn là VND
export function calcEstimatedPointsFromTotal(totalVND) {
  const points = Math.floor(totalVND / VND_PER_POINT);
  return points;
}

// Local persistence keyed by username
const loyaltyMemory = new Map();

export function loadUserLoyalty(username) {
  if (!username) return { points: 0, tier: 'None' };
  const points = loyaltyMemory.get(username)?.points || 0;
  const tier = computeTier(points);
  return { points, tier };
}

export function addPoints(username, deltaPoints) {
  if (!username || !Number.isFinite(deltaPoints) || deltaPoints <= 0) return loadUserLoyalty(username);
  const current = loadUserLoyalty(username).points;
  const next = current + Math.floor(deltaPoints);
  const tier = computeTier(next);
  loyaltyMemory.set(username, { points: next, tier });
  return { points: next, tier };
}

export function setPoints(username, points) {
  if (!username) return { points: 0, tier: 'None' };
  const p = Math.max(0, Math.floor(points || 0));
  const tier = computeTier(p);
  loyaltyMemory.set(username, { points: p, tier });
  return { points: p, tier };
}
