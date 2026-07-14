// Loyalty utilities
// Rule: 1 điểm mỗi 10.000₫ chi tiêu (sau giảm giá)
// Hạng: Silver ≥ 500, Gold ≥ 1000, VIP ≥ 2000
// Điểm thật được backend cộng và lưu trong MongoDB (User.points/tier) — các hàm
// dưới đây chỉ tính toán thuần để hiển thị ước tính phía client, không lưu state.

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
