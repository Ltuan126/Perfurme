const test = require('node:test');
const assert = require('node:assert/strict');
const { computeCartPricing, isMini } = require('../../src/services/orderPricing');

test('subtotal cộng đúng theo giá × số lượng', () => {
  const { subtotal, discount, total } = computeCartPricing([
    { name: 'Rose 31', price: 5990000, quantity: 2 },
    { name: 'Baie 19', price: 3990000, quantity: 1, sizeLabel: '50ml' },
  ]);
  assert.equal(subtotal, 5990000 * 2 + 3990000);
  assert.equal(discount, 0);
  assert.equal(total, subtotal);
});

test('dưới 3 chai mini thì không có giảm giá', () => {
  const { discount } = computeCartPricing([
    { name: 'Another 13', price: 1890000, quantity: 2, sizeLabel: '15ml' },
  ]);
  assert.equal(discount, 0);
});

test('đủ 3 chai 15ml được giảm 10% trên tổng tiền mini', () => {
  const { subtotal, discount, total } = computeCartPricing([
    { name: 'Another 13', price: 1890000, quantity: 3, sizeLabel: '15ml' },
    { name: 'Rose 31', price: 5990000, quantity: 1, sizeLabel: '100ml' },
  ]);
  const minisTotal = 1890000 * 3;
  assert.equal(discount, Math.round(minisTotal * 0.10));
  assert.equal(total, subtotal - discount);
});

test('3 chai mini gộp từ nhiều sản phẩm khác nhau vẫn được giảm', () => {
  const { discount } = computeCartPricing([
    { name: 'Another 13', price: 1890000, quantity: 1, sizeLabel: '15ml' },
    { name: 'Baie 19', price: 1690000, quantity: 2, sizeLabel: '15ml' },
  ]);
  assert.equal(discount, Math.round((1890000 + 1690000 * 2) * 0.10));
});

test('sản phẩm tên chứa "mini" cũng tính là mini', () => {
  assert.equal(isMini({ name: 'Discovery Mini Set' }), true);
  assert.equal(isMini({ name: 'Rose 31', sizeLabel: '15ml' }), true);
  assert.equal(isMini({ name: 'Rose 31', sizeLabel: '100ml' }), false);
});

test('total không bao giờ âm và giỏ rỗng trả về 0', () => {
  assert.deepEqual(computeCartPricing([]), { subtotal: 0, discount: 0, total: 0, miniCount: 0 });
  assert.equal(computeCartPricing(null).total, 0);
});
