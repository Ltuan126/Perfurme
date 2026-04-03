import React, { useMemo, useState } from 'react';
import { calcEstimatedPointsFromTotal, addPoints } from '../utils/loyalty';
import API_BASE_URL from '../config/api';

export default function CheckoutForm({ cart, onOrderSuccess }) {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [redirecting, setRedirecting] = useState(false);

  const summary = useMemo(() => {
    const items = Array.isArray(cart) ? cart : [];
    const qty = (x) => Number(x?.quantity) || 1;
    const price = (x) => Number(x?.price) || 0;
    const subtotal = items.reduce((s, i) => s + price(i) * qty(i), 0);
    // Combo 3 chai 15ml -10%
    const miniCount = items.reduce((n, i) => n + (i?.sizeLabel === '15ml' ? qty(i) : 0), 0);
    const minisTotal = items.filter(i => i?.sizeLabel === '15ml').reduce((s, i) => s + price(i) * qty(i), 0);
    const discount = miniCount >= 3 ? Math.round(minisTotal * 0.10 * 100) / 100 : 0;
    const total = Math.max(0, subtotal - discount);
    // Convert to points with default USD->VND exchange for estimate
    const estPoints = calcEstimatedPointsFromTotal(total, { currency: 'USD' });
    return { subtotal, discount, total, estPoints, miniCount };
  }, [cart]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.address || !form.phone) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cart, paymentMethod }),
      });
      if (!res.ok) throw new Error('Lỗi đặt hàng!');
      const payload = await res.json();
      const orderId = payload.data._id;

      // COD: Success immediately and award points
      if (paymentMethod === 'cod') {
        setSuccess(true);
        setForm({ name: '', address: '', phone: '' });
        const username = localStorage.getItem('user_login');
        if (username && summary.estPoints > 0) {
          addPoints(username, summary.estPoints);
        }
        if (onOrderSuccess) onOrderSuccess();
      } else {
        // Momo/VNPay: Initiate payment session
        setRedirecting(true);
        const payRes = await fetch(`${API_BASE_URL}/api/payment/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, method: paymentMethod })
        });
        if (!payRes.ok) throw new Error('Khởi tạo thanh toán thất bại');
        const payData = await payRes.json();
        
        // Redirect to payment gateway
        if (paymentMethod === 'momo' && payData.data.paymentLink) {
          window.location.href = payData.data.paymentLink;
        } else if (paymentMethod === 'vnpay' && payData.data.paymentUrl) {
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

  if (success) return <div className="text-green-600 text-center font-semibold py-6">Đặt hàng thành công! Shop sẽ liên hệ xác nhận đơn hàng.</div>;

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto mt-4 p-6 max-w-sm">
      <h2 className="text-lg font-semibold text-blue-700 mb-3 text-center">Thông tin nhận hàng (COD)</h2>
      <div className="mb-3 text-sm">
        <label className="block text-slate-600 font-semibold mb-2">Phương thức thanh toán</label>
        <select
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
          disabled={loading || redirecting}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="cod">Thanh toán khi nhận hàng (COD)</option>
          <option value="momo">Momo QR</option>
          <option value="vnpay">VNPay</option>
        </select>
      </div>
      <div className="mb-3 text-sm text-slate-700 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
        <div className="flex justify-between"><span>Tạm tính</span><span className="font-semibold">${summary.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Giảm combo 15ml{summary.miniCount >= 3 ? '' : ' (chọn đủ 3 chai 15ml để nhận -10%)'}</span><span className="font-semibold text-green-600">-${summary.discount.toFixed(2)}</span></div>
        <div className="flex justify-between text-blue-700 font-bold mt-1"><span>Thành tiền</span><span>${summary.total.toFixed(2)}</span></div>
        <div className="text-xs text-slate-500 mt-1">Ước tính nhận <span className="font-semibold text-slate-700">{summary.estPoints}</span> điểm (1 điểm mỗi 10.000₫, quy đổi từ USD).</div>
      </div>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên người nhận" className="px-4 py-2 border rounded-full w-full mb-2 focus:ring-2 focus:ring-blue-300 outline-none" />
      <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ nhận hàng" className="px-4 py-2 border rounded-full w-full mb-2 focus:ring-2 focus:ring-blue-300 outline-none" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="px-4 py-2 border rounded-full w-full mb-2 focus:ring-2 focus:ring-blue-300 outline-none" />
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      <button type="submit" disabled={loading || redirecting} className="btn-primary w-full mt-2">
        {redirecting ? 'Chuyển hướng đến cổng thanh toán...' : loading ? 'Đang gửi...' : `Đặt hàng • +${summary.estPoints} điểm`}
      </button>
    </form>
  );
}
