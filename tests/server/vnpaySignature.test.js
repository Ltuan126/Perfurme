const test = require('node:test');
const assert = require('node:assert/strict');
const paymentService = require('../../src/services/paymentService');

// Mô phỏng return URL của VNPay: lấy query từ paymentUrl do initiate sinh ra,
// decode như Express req.query, thêm response fields rồi verify lại chữ ký.
// Vì initiate và verifyCallback dùng CÙNG một hàm ký, chữ ký trên các tham số
// gốc phải khớp khi đi trọn vòng encode → decode → re-encode.

function urlToDecodedParams(url) {
  const params = {};
  for (const [k, v] of new URL(url).searchParams.entries()) {
    params[k] = v; // URLSearchParams đã decode sẵn — giống Express req.query
  }
  return params;
}

test('chữ ký initiate khớp khi verify lại chính các tham số đã ký (roundtrip)', async () => {
  const session = await paymentService.initiate('vnpay', {
    amount: 2850000,
    orderId: '66f1a2b3c4d5e6f7a8b9c0d1',
    orderInfo: 'Thanh toan don hang C0D1', // có space để kiểm tra encode +
  });

  assert.equal(session.success, true);
  assert.ok(session.paymentUrl.includes('vnp_SecureHash='));

  const params = urlToDecodedParams(session.paymentUrl);
  // verifyCallback ký lại mọi field trừ vnp_SecureHash — với đúng các tham số
  // ban đầu, chữ ký phải trùng và không throw "Invalid signature"
  const result = paymentService.verifyCallback('vnpay', {
    ...params,
    // thiếu vnp_ResponseCode nghĩa là "không thành công" nhưng chữ ký vẫn phải hợp lệ
  });
  assert.equal(result.orderId, '66f1a2b3c4d5e6f7a8b9c0d1');
  assert.equal(result.amount, 2850000);
});

test('sửa số tiền trong callback làm chữ ký không hợp lệ', async () => {
  const session = await paymentService.initiate('vnpay', {
    amount: 2850000,
    orderId: '66f1a2b3c4d5e6f7a8b9c0d1',
  });
  const params = urlToDecodedParams(session.paymentUrl);
  params.vnp_Amount = String(Number(params.vnp_Amount) * 10); // gian lận số tiền

  assert.throws(
    () => paymentService.verifyCallback('vnpay', params),
    /Invalid VNPay callback signature/
  );
});

test('vnp_ResponseCode=00 mới được coi là thanh toán thành công', async () => {
  const session = await paymentService.initiate('vnpay', {
    amount: 1000000,
    orderId: 'abc123',
  });
  const params = urlToDecodedParams(session.paymentUrl);

  // Không có ResponseCode → success=false (chữ ký vẫn hợp lệ)
  const pending = paymentService.verifyCallback('vnpay', params);
  assert.equal(pending.success, false);
});
