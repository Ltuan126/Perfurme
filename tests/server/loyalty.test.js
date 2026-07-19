const test = require('node:test');
const assert = require('node:assert/strict');
const { calcEarnedPoints, nextTier, VND_PER_POINT } = require('../../src/services/loyalty');

test('1 điểm mỗi 10.000₫, làm tròn xuống', () => {
  assert.equal(VND_PER_POINT, 10000);
  assert.equal(calcEarnedPoints(0), 0);
  assert.equal(calcEarnedPoints(9999), 0);
  assert.equal(calcEarnedPoints(10000), 1);
  assert.equal(calcEarnedPoints(2850000), 285);
  assert.equal(calcEarnedPoints(29999), 2);
});

test('input không hợp lệ trả về 0 điểm', () => {
  assert.equal(calcEarnedPoints(undefined), 0);
  assert.equal(calcEarnedPoints(null), 0);
  assert.equal(calcEarnedPoints('abc'), 0);
});

test('mốc hạng: Silver ≥ 500, Gold ≥ 1000, VIP ≥ 2000', () => {
  assert.equal(nextTier(0), 'None');
  assert.equal(nextTier(499), 'None');
  assert.equal(nextTier(500), 'Silver');
  assert.equal(nextTier(999), 'Silver');
  assert.equal(nextTier(1000), 'Gold');
  assert.equal(nextTier(1999), 'Gold');
  assert.equal(nextTier(2000), 'VIP');
});
