import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { calcEstimatedPointsFromTotal } from '../utils/loyalty';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function CheckoutForm({ cart, onOrderSuccess }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [redirecting, setRedirecting] = useState(false);

  const items = Array.isArray(cart) ? cart : [];

  const summary = useMemo(() => {
    const qty = (x) => Number(x?.quantity) || 1;
    const price = (x) => Number(x?.price) || 0;
    const subtotal = items.reduce((s, i) => s + price(i) * qty(i), 0);
    // Combo 3 chai 15ml -10%
    const miniCount = items.reduce((n, i) => n + (i?.sizeLabel === '15ml' ? qty(i) : 0), 0);
    const minisTotal = items.filter(i => i?.sizeLabel === '15ml').reduce((s, i) => s + price(i) * qty(i), 0);
    const discount = miniCount >= 3 ? Math.round(minisTotal * 0.10) : 0;
    const total = Math.max(0, subtotal - discount);
    // Tích điểm: 1 điểm / 10.000₫
    const estPoints = calcEstimatedPointsFromTotal(total);
    return { subtotal, discount, total, estPoints, miniCount };
  }, [items]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.address || !form.phone) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (items.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }
    setError('');
    setLoading(true);
    // gateway method sent to backend: card + qr both settle via vnpay
    const gatewayMethod = paymentMethod === 'cod' ? 'cod' : 'vnpay';
    try {
      const fullAddress = form.city ? `${form.address}, ${form.city}` : form.address;
      const res = await authFetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: fullAddress, note: form.note, cart: items, paymentMethod: gatewayMethod }),
      });
      if (!res.ok) throw new Error('Lỗi đặt hàng!');
      const payload = await res.json();
      const orderId = payload.data._id;

      if (gatewayMethod === 'cod') {
        setSuccess(true);
        if (onOrderSuccess) onOrderSuccess();
      } else {
        // VNPAY: Initiate payment session
        setRedirecting(true);
        const payRes = await authFetch(`${API_BASE_URL}/api/payment/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, method: 'vnpay' })
        });
        if (!payRes.ok) throw new Error('Khởi tạo thanh toán thất bại');
        const payData = await payRes.json();
        if (payData.data.paymentUrl) {
          window.location.href = payData.data.paymentUrl;
        }
      }
    } catch {
      setError('Có lỗi khi đặt hàng!');
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="section max-w-lg text-center py-20">
        <div className="eyebrow mb-4">Đặt hàng thành công</div>
        <h1 className="font-serif font-light text-3xl mb-4">Cảm ơn bạn.</h1>
        <p className="text-muted font-light mb-8">Shop sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>
        <Link to="/products" className="btn-outline">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  const paymentRow = (active, onClick, title, desc) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 border transition-colors flex items-start gap-3 ${active ? 'border-ink' : 'border-hairline hover:border-ink/50'}`}
    >
      <span className={`mt-1 w-3.5 h-3.5 rounded-full border shrink-0 ${active ? 'border-ink' : 'border-hairline'}`} style={active ? { boxShadow: `inset 0 0 0 3px ${'var(--accent)'}`, borderColor: 'var(--accent)' } : {}} />
      <span>
        <span className="block font-mono uppercase text-[12px] tracking-[0.1em] text-ink">{title}</span>
        <span className="block text-sm text-muted font-light mt-1">{desc}</span>
      </span>
    </button>
  );

  return (
    <div className="section">
      <Link to="/cart" className="font-mono uppercase text-[11px] tracking-[0.14em] text-label hover:text-ink transition-colors inline-block mb-8">← Giỏ hàng</Link>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-14">
        {/* LEFT */}
        <div className="space-y-12">
          <div>
            <div className="eyebrow mb-4">01 — Thông tin giao hàng</div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="field-label">Họ tên</label>
                <input name="name" value={form.name} onChange={handleChange} className="field-underline" />
              </div>
              <div>
                <label className="field-label">Số điện thoại</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="field-underline" />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Địa chỉ</label>
                <input name="address" value={form.address} onChange={handleChange} className="field-underline" />
              </div>
              <div>
                <label className="field-label">Tỉnh/Thành phố</label>
                <input name="city" value={form.city} onChange={handleChange} className="field-underline" />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Ghi chú khắc tên (không bắt buộc)</label>
                <input name="note" value={form.note} onChange={handleChange} placeholder="VD: khắc chữ &quot;An&quot; lên vỏ hộp" className="field-underline" />
              </div>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-4">02 — Phương thức thanh toán</div>
            <div className="space-y-3">
              {paymentRow(paymentMethod === 'card', () => setPaymentMethod('card'), 'Thẻ tín dụng/ghi nợ', 'Visa · Mastercard · JCB — thanh toán an toàn qua cổng VNPAY')}
              {paymentMethod === 'card' && (
                <div className="pl-7 text-sm text-muted font-light">Bạn sẽ được chuyển đến cổng VNPAY để nhập thông tin thẻ một cách an toàn.</div>
              )}
              {paymentRow(paymentMethod === 'vnpay', () => setPaymentMethod('vnpay'), 'VNPAY', 'Quét mã QR qua ứng dụng ngân hàng')}
              {paymentRow(paymentMethod === 'cod', () => setPaymentMethod('cod'), 'Thanh toán khi nhận hàng', 'Chỉ áp dụng nội địa (COD)')}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm font-light">{error}</div>}
        </div>

        {/* RIGHT — sticky summary */}
        <div className="lg:sticky lg:top-24 h-fit border border-hairline p-6">
          <div className="eyebrow mb-5">Đơn hàng của bạn</div>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => {
              const key = item.cartKey || `${item._id || item.id}${item.sizeLabel ? '::' + item.sizeLabel : ''}`;
              const qty = Number(item.quantity) || 1;
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-ink font-light">{item.name} {item.sizeLabel && <span className="text-label">({item.sizeLabel})</span>} <span className="text-label">×{qty}</span></span>
                  <span className="font-mono text-ink shrink-0 ml-3">{(Number(item.price) * qty).toLocaleString('vi-VN')}₫</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 pt-4 hairline-t text-sm">
            <div className="flex justify-between text-muted font-light">
              <span>Tạm tính</span>
              <span className="font-mono text-ink">{summary.subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-muted font-light">
                <span>Giảm combo 15ml</span>
                <span className="font-mono" style={{ color: 'var(--accent)' }}>-{summary.discount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <div className="flex justify-between text-muted font-light">
              <span>Vận chuyển</span>
              <span className="font-mono" style={{ color: 'var(--accent)' }}>Miễn phí</span>
            </div>
            <div className="flex justify-between items-baseline pt-3 hairline-t">
              <span className="font-mono text-[11px] uppercase tracking-wider text-label">Tổng</span>
              <span className="font-serif text-2xl text-ink">{summary.total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
          <button type="submit" disabled={loading || redirecting} className="btn-primary w-full mt-6">
            {redirecting ? 'Đang chuyển hướng...' : loading ? 'Đang gửi...' : `Đặt hàng · ${summary.total.toLocaleString('vi-VN')}₫`}
          </button>
          <p className="text-center text-[11px] text-label font-light mt-3">Thanh toán an toàn · Đổi trả trong 14 ngày</p>
        </div>
      </form>
    </div>
  );
}
