const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOrderConfirmationEmail, sendOrderConfirmationEmail } = require('../../src/services/emailService');

function fakeOrder(overrides = {}) {
  return {
    _id: '66f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Nguyễn Văn A',
    address: '123 Lê Lợi, Q1, TP.HCM',
    createdAt: new Date('2026-07-01T10:00:00Z'),
    cart: [
      { name: 'Rose 31', sizeLabel: '50ml', price: 3990000, quantity: 1 },
      { name: 'Bergamote 22', sizeLabel: '15ml', price: 1890000, quantity: 2 },
    ],
    subtotal: 3990000 + 1890000 * 2,
    discount: 0,
    total: 3990000 + 1890000 * 2,
    paymentMethod: 'cod',
    ...overrides,
  };
}

test('mã đơn hàng là 8 ký tự cuối của _id, viết hoa', () => {
  const { subject, html, code } = buildOrderConfirmationEmail(fakeOrder());
  assert.equal(code, 'A8B9C0D1');
  assert.match(subject, /A8B9C0D1/);
  assert.match(html, /A8B9C0D1/);
});

test('liệt kê đúng tên, size, số lượng từng sản phẩm trong giỏ', () => {
  const { html } = buildOrderConfirmationEmail(fakeOrder());
  assert.match(html, /Rose 31 \(50ml\) × 1/);
  assert.match(html, /Bergamote 22 \(15ml\) × 2/);
});

test('tổng tiền định dạng đúng kiểu VND (dấu chấm phân cách)', () => {
  const { html } = buildOrderConfirmationEmail(fakeOrder());
  assert.match(html, /7\.770\.000₫/);
});

test('chỉ hiện dòng giảm giá khi discount > 0', () => {
  const withDiscount = buildOrderConfirmationEmail(fakeOrder({ discount: 189000 }));
  assert.match(withDiscount.html, /Giảm giá/);

  const noDiscount = buildOrderConfirmationEmail(fakeOrder({ discount: 0 }));
  assert.doesNotMatch(noDiscount.html, /Giảm giá/);
});

test('link theo dõi đơn hàng trỏ đúng /track?order=<id>', () => {
  const { trackUrl } = buildOrderConfirmationEmail(fakeOrder());
  assert.match(trackUrl, /\/track\?order=66f1a2b3c4d5e6f7a8b9c0d1$/);
});

test('nhãn phương thức thanh toán hiển thị đúng tiếng Việt', () => {
  const cod = buildOrderConfirmationEmail(fakeOrder({ paymentMethod: 'cod' }));
  assert.match(cod.html, /Thanh toán khi nhận hàng \(COD\)/);

  const vnpay = buildOrderConfirmationEmail(fakeOrder({ paymentMethod: 'vnpay' }));
  assert.match(vnpay.html, /thanh toán: VNPAY/);
});

test('không có RESEND_API_KEY thì bỏ qua gửi (không throw, không gọi mạng)', async () => {
  const prevKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const result = await sendOrderConfirmationEmail(fakeOrder(), 'khach@example.com');
    assert.deepEqual(result, { skipped: true });
  } finally {
    if (prevKey !== undefined) process.env.RESEND_API_KEY = prevKey;
  }
});

test('không có email người nhận thì bỏ qua gửi', async () => {
  process.env.RESEND_API_KEY = 'test_key_for_this_case_only';
  try {
    const result = await sendOrderConfirmationEmail(fakeOrder(), undefined);
    assert.deepEqual(result, { skipped: true });
  } finally {
    delete process.env.RESEND_API_KEY;
  }
});
