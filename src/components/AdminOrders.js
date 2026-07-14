import React, { useEffect, useState, useMemo } from 'react';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE_CLASS = {
  pending: 'status-badge',
  confirmed: 'status-badge status-badge--active',
  shipped: 'status-badge status-badge--active',
  completed: 'status-badge status-badge--done',
  canceled: 'status-badge status-badge--danger',
};

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'completed'];

const pill = (active) => `font-mono uppercase text-[10.5px] tracking-[0.14em] px-4 py-2 border transition-colors duration-300 ${active ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink border-hairline hover:border-ink'}`;

export default function AdminOrders() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editStatus, setEditStatus] = useState({});

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/orders`)
      .then(res => res.json())
      .then(data => { setOrders(Array.isArray(data?.data) ? data.data : []); setLoading(false); })
      .catch(() => { setError('Không thể tải đơn hàng!'); setLoading(false); });
  }, [authFetch]);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const handleStatusChange = (id, value) => {
    setEditStatus(prev => ({ ...prev, [id]: value }));
  };

  const applyUpdate = async (order) => {
    const newStatus = editStatus[order._id];
    if (!newStatus || newStatus === order.status) return;
    setUpdatingId(order._id);
    setError('');
    try {
      const res = await authFetch(`${API_BASE_URL}/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Cập nhật thất bại!');
      setOrders(list => list.map(o => o._id === payload.data._id ? payload.data : o));
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại!');
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatuses = (current) => {
    // allow moving forward plus canceled option
    const idx = STATUS_FLOW.indexOf(current);
    const forward = idx === -1 ? [] : STATUS_FLOW.slice(idx + 1);
    return [current, ...forward, 'canceled'].filter((v, i, self) => self.indexOf(v) === i);
  };

  return (
    <div className="section">
      <div className="eyebrow mb-2">Quản trị</div>
      <h1 className="title text-left">Quản lý đơn hàng</h1>

      <div className="mb-6 pb-6 border-b border-hairline flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'shipped', 'completed', 'canceled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={pill(filter === s)}>
              {s === 'all' ? 'Tất cả' : s}
            </button>
          ))}
        </div>
        <div className="field-label mb-0">Tổng: <span className="text-ink">{filtered.length}</span> đơn</div>
      </div>

      {loading && <div className="text-center py-10 text-muted font-light">Đang tải...</div>}
      {error && <div className="text-center font-mono text-[11px] uppercase tracking-wider text-red-600 mb-4">{error}</div>}
      {!loading && filtered.length === 0 && (
        <div className="border border-hairline p-10 text-center text-muted font-light">Không có đơn nào.</div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Khách</th>
                <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">SĐT</th>
                <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Địa chỉ</th>
                <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Sản phẩm</th>
                <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Trạng thái</th>
                <th className="text-left py-3 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(order => {
                const itemsTotal = order.cart?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0) || 0;
                return (
                  <tr key={order._id} className="hover:bg-surface transition-colors duration-300">
                    <td className="py-4 pr-4 align-top min-w-[140px]">
                      <div className="font-serif text-lg text-ink">{order.name}</div>
                      <div className="font-mono text-xs text-muted">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                      <div className="font-mono text-xs text-ink mt-1">{itemsTotal.toLocaleString('vi-VN')}₫</div>
                    </td>
                    <td className="py-4 pr-4 align-top font-mono text-xs text-muted">{order.phone}</td>
                    <td className="py-4 pr-4 align-top max-w-[200px] break-words font-mono text-xs text-muted">{order.address}</td>
                    <td className="py-4 pr-4 align-top">
                      <ul className="space-y-1">
                        {order.cart?.map((c, idx) => (
                          <li key={idx} className="flex justify-between gap-3">
                            <span className="text-ink font-light truncate max-w-[140px]" title={c.name}>{c.name}</span>
                            <span className="text-label font-mono text-xs">×{c.quantity || 1}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <span className={STATUS_BADGE_CLASS[order.status] || 'status-badge'}>{order.status}</span>
                      <div className="mt-2">
                        <select
                          value={editStatus[order._id] || order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="font-mono uppercase text-[10.5px] tracking-[0.1em] bg-transparent border-b border-hairline pb-1 outline-none text-ink"
                        >
                          {nextStatuses(order.status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 align-top">
                      <button
                        disabled={updatingId === order._id || (editStatus[order._id] || order.status) === order.status}
                        onClick={() => applyUpdate(order)}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontSize: '10px', letterSpacing: '0.12em', padding: '7px 14px' }}
                      >
                        {updatingId === order._id ? 'Đang lưu...' : 'Cập nhật'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
