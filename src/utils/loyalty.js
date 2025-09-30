// Loyalty utilities
// Rule: 1 point per 10,000 VND spent (after discounts)
// Tiers: Silver ≥ 500, Gold ≥ 1000, VIP ≥ 2000

export const VND_PER_POINT = 10000;
export const DEFAULT_EXCHANGE_RATE = 25000; // 1 USD ≈ 25,000 VND (configurable)

export function computeTier(points = 0) {
  if (points >= 2000) return 'VIP';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'None';
}

export function calcEstimatedPointsFromTotal(totalAmount, opts = {}) {
  const { currency = 'USD', exchangeRate = DEFAULT_EXCHANGE_RATE } = opts;
  // Convert total to VND if needed
  const totalVND = currency === 'VND' ? totalAmount : totalAmount * exchangeRate;
  const points = Math.floor(totalVND / VND_PER_POINT);
  return points;
}

// Local persistence keyed by username
function keyPoints(username) { return `loyalty_points_${username}`; }
function keyTier(username) { return `loyalty_tier_${username}`; }

export function loadUserLoyalty(username) {
  if (!username) return { points: 0, tier: 'None' };
  const raw = localStorage.getItem(keyPoints(username));
  const points = raw ? parseInt(raw, 10) || 0 : 0;
  const tier = computeTier(points);
  return { points, tier };
}

export function addPoints(username, deltaPoints) {
  if (!username || !Number.isFinite(deltaPoints) || deltaPoints <= 0) return loadUserLoyalty(username);
  const current = loadUserLoyalty(username).points;
  const next = current + Math.floor(deltaPoints);
  localStorage.setItem(keyPoints(username), String(next));
  const tier = computeTier(next);
  localStorage.setItem(keyTier(username), tier);
  return { points: next, tier };
}

export function setPoints(username, points) {
  if (!username) return { points: 0, tier: 'None' };
  const p = Math.max(0, Math.floor(points || 0));
  localStorage.setItem(keyPoints(username), String(p));
  const tier = computeTier(p);
  localStorage.setItem(keyTier(username), tier);
  return { points: p, tier };
}
