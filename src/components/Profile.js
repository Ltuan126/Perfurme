import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  gender: ''
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState('None');
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      setError('Bạn chưa đăng nhập');
      return;
    }

    fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
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
  }, []);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Bạn chưa đăng nhập');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
      </div>
    </section>
  );
}
