/**
 * Email Service — order confirmation emails via the Resend REST API.
 * Fails soft everywhere: missing config or network/API errors are logged,
 * never thrown, so a broken email provider can never block checkout.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

function vnd(amount) {
  return `${Number(amount || 0).toLocaleString('vi-VN')}₫`;
}

function formatDate(date) {
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const PAYMENT_LABELS = {
  vnpay: 'VNPAY',
  cod: 'Thanh toán khi nhận hàng (COD)',
};

// Pure builder — no I/O, safe to unit test without a Resend API key.
function buildOrderConfirmationEmail(order) {
  const code = String(order._id).slice(-8).toUpperCase();
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const trackUrl = `${frontendUrl}/track?order=${order._id}`;

  const rows = (order.cart || []).map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #DFDBD0;">${item.name}${item.sizeLabel ? ` (${item.sizeLabel})` : ''} × ${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #DFDBD0;text-align:right;white-space:nowrap;">${vnd(item.price * item.quantity)}</td>
    </tr>`).join('');

  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;color:#1A1A17;padding:32px 16px;">
  <div style="text-align:center;letter-spacing:0.35em;font-size:20px;margin-bottom:28px;">SILLAGE</div>
  <p>Chào ${order.name || 'bạn'},</p>
  <p>Cảm ơn bạn đã đặt hàng tại SILLAGE. Đơn hàng <strong>#${code}</strong> đặt lúc ${formatDate(order.createdAt)} đã được ghi nhận.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    ${rows}
  </table>
  <table style="width:100%;font-size:14px;">
    <tr><td>Tạm tính</td><td style="text-align:right;">${vnd(order.subtotal)}</td></tr>
    ${order.discount > 0 ? `<tr><td>Giảm giá</td><td style="text-align:right;">-${vnd(order.discount)}</td></tr>` : ''}
    <tr><td style="font-weight:bold;padding-top:8px;">Tổng cộng</td><td style="text-align:right;font-weight:bold;padding-top:8px;">${vnd(order.total)}</td></tr>
  </table>
  <p style="font-size:14px;">Phương thức thanh toán: ${paymentLabel}<br/>Giao đến: ${order.address || ''}</p>
  <p style="margin-top:28px;">
    <a href="${trackUrl}" style="display:inline-block;padding:12px 26px;background:#1A1A17;color:#F5F2EB;text-decoration:none;letter-spacing:0.08em;font-size:13px;">THEO DÕI ĐƠN HÀNG</a>
  </p>
  <p style="margin-top:32px;font-size:12px;color:#8A8779;">Mã đơn hàng: ${code}</p>
</div>`.trim();

  return {
    subject: `SILLAGE — Xác nhận đơn hàng #${code}`,
    html,
    trackUrl,
    code,
  };
}

// Fire against Resend. Never throws — callers should not (and need not) await
// this before responding to the checkout request.
async function sendOrderConfirmationEmail(order, toEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY chưa cấu hình — bỏ qua gửi email xác nhận đơn hàng');
    return { skipped: true };
  }
  if (!toEmail) {
    return { skipped: true };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'SILLAGE <onboarding@resend.dev>';
  const { subject, html } = buildOrderConfirmationEmail(order);

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromEmail, to: [toEmail], subject, html }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend API error ${res.status}: ${errText}`);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.error('Gửi email xác nhận đơn hàng thất bại:', err.message);
    return { success: false };
  }
}

module.exports = { buildOrderConfirmationEmail, sendOrderConfirmationEmail };
