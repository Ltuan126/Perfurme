import React, { useState } from 'react';

export default function CheckoutForm({ cart, onOrderSuccess }) {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cart }),
      });
      if (!res.ok) throw new Error('Lỗi đặt hàng!');
      setSuccess(true);
      setForm({ name: '', address: '', phone: '' });
      if (onOrderSuccess) onOrderSuccess();
    } catch {
      setError('Có lỗi khi đặt hàng!');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div className="text-green-600 text-center font-semibold py-6">Đặt hàng thành công! Shop sẽ liên hệ xác nhận đơn hàng.</div>;

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto mt-4 p-6 max-w-sm">
      <h2 className="text-lg font-semibold text-blue-700 mb-3 text-center">Thông tin nhận hàng (COD)</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên người nhận" className="px-4 py-2 border rounded-full w-full mb-2 focus:ring-2 focus:ring-blue-300 outline-none" />
      <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ nhận hàng" className="px-4 py-2 border rounded-full w-full mb-2 focus:ring-2 focus:ring-blue-300 outline-none" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="px-4 py-2 border rounded-full w-full mb-2 focus:ring-2 focus:ring-blue-300 outline-none" />
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
        {loading ? 'Đang gửi...' : 'Đặt hàng COD'}
      </button>
    </form>
  );
}
