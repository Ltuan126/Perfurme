import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  gender: ''
};

const ORDER_STATUS_VN = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  completed: 'Hoàn tất',
  canceled: 'Đã huỷ'
};

const PAYMENT_STATUS_VN = {
  pending: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
  cancelled: 'Đã huỷ thanh toán'
};

export default function Profile() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('None');
  const [form, setForm] = useState(initialForm);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/orders/mine`)
      .then(res => res.ok ? res.json() : { data: [] })
      .then(payload => setOrders(Array.isArray(payload?.data) ? payload.data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [authFetch]);

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/me`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.message || 'Không tải được thông tin tài khoản');
        }
        return payload;
      })
      .then((payload) => {
        const data = payload?.data || {};
        setUsername(data.username || '');
        setRole(data.role || 'user');
        setPoints(Number(data.points) || 0);
        setTier(data.tier || 'None');
        setForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : '',
          gender: data.gender || ''
        });
      })
      .catch((err) => setError(err.message || 'Không thể tải profile'))
      .finally(() => setLoading(false));
  }, [authFetch]);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const payload = await res.json();
      if (!res.ok) {
        const detail = Array.isArray(payload.errors) && payload.errors.length > 0
          ? `: ${payload.errors.join(', ')}`
          : '';
        throw new Error((payload.message || 'Cập nhật profile thất bại') + detail);
      }

      const data = payload?.data || {};
      setForm({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : '',
        gender: data.gender || ''
      });
      setSuccess(payload.message || 'Đã cập nhật profile');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section">
      <div className="max-w-4xl mx-auto">
        <h1 className="title">Hồ sơ tài khoản</h1>

        <div className="glass p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/70 rounded-2xl p-4 border border-white/70">
              <div className="text-slate-500">Username</div>
              <div className="font-semibold text-slate-900 break-all">{username || '-'}</div>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 border border-white/70">
              <div className="text-slate-500">Vai trò</div>
              <div className="font-semibold text-slate-900 uppercase">{role}</div>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 border border-white/70">
              <div className="text-slate-500">Điểm loyalty</div>
              <div className="font-semibold text-slate-900">{points}</div>
            </div>
            <div className="bg-white/70 rounded-2xl p-4 border border-white/70">
              <div className="text-slate-500">Hạng</div>
              <div className="font-semibold text-slate-900">{tier}</div>
            </div>
          </div>
        </div>

        <div className="glass p-6 md:p-8">
          {loading ? (
            <div className="text-slate-600">Đang tải thông tin profile...</div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Họ tên</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => onChange('fullName', e.target.value)}
                  placeholder="Nhập họ tên"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Số điện thoại</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  placeholder="090xxxxxxx"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Ngày sinh</span>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => onChange('dateOfBirth', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-slate-600">Giới tính</span>
                <select
                  value={form.gender}
                  onChange={(e) => onChange('gender', e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Không chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-slate-600">Địa chỉ</span>
                <textarea
                  value={form.address}
                  onChange={(e) => onChange('address', e.target.value)}
                  placeholder="Địa chỉ giao hàng mặc định"
                  rows={3}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 resize-y"
                />
              </label>

              {error && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
              {success && <div className="md:col-span-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{success}</div>}

              <div className="md:col-span-2 flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order history */}
        <div className="glass p-6 md:p-8 mt-6">
          <div className="eyebrow mb-2">Lịch sử mua hàng</div>
          <h2 className="font-serif font-light text-2xl mb-6">Đơn hàng của tôi</h2>

          {ordersLoading ? (
            <div className="text-muted font-light">Đang tải đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className="text-muted font-light">
              Bạn chưa có đơn hàng nào. <Link to="/products" className="text-ink underline underline-offset-4">Khám phá bộ sưu tập →</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#DFDBD0' }}>
              {orders.map((o) => (
                <div key={o._id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 border-hairline">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-label">
                      #{String(o._id).slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-sm text-ink font-light mt-1 truncate">
                      {(o.cart || []).map(i => `${i.name}${i.sizeLabel ? ` (${i.sizeLabel})` : ''} ×${i.quantity}`).join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider px-2 py-1 border border-hairline text-muted">
                      {ORDER_STATUS_VN[o.status] || o.status}
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-wider" style={{ color: o.paymentStatus === 'paid' ? 'var(--accent)' : '#8A8779' }}>
                      {PAYMENT_STATUS_VN[o.paymentStatus] || o.paymentStatus}
                    </span>
                    <span className="font-mono text-sm text-ink">{Number(o.total).toLocaleString('vi-VN')}₫</span>
                    <Link to={`/track?order=${o._id}`} className="font-mono text-[10.5px] uppercase tracking-wider text-ink underline underline-offset-4 hover:opacity-70">
                      Theo dõi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
