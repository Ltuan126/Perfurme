import React, { useEffect, useState, useMemo } from 'react';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  completed: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-600',
};

const STATUS_FLOW = ['pending','confirmed','shipped','completed'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editStatus, setEditStatus] = useState({});

  useEffect(() => {
    fetch('/api/orders', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') } })
      .then(res => res.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => { setError('Không thể tải đơn hàng!'); setLoading(false); });
  }, []);

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
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setOrders(list => list.map(o => o._id === updated._id ? updated : o));
    } catch {
      setError('Cập nhật thất bại!');
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatuses = (current) => {
    // allow moving forward plus canceled option
    const idx = STATUS_FLOW.indexOf(current);
    const forward = idx === -1 ? [] : STATUS_FLOW.slice(idx + 1);
    return [current, ...forward, 'canceled'].filter((v,i,self) => self.indexOf(v)===i);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Quản lý đơn hàng</h1>
      <div className="glass p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {['all','pending','confirmed','shipped','completed','canceled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter===s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/60 hover:bg-white border-slate-300 text-slate-700'}`}>
              {s === 'all' ? 'Tất cả' : s}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-600">Tổng: <span className="font-semibold">{filtered.length}</span> đơn</div>
      </div>
      {loading && <div className="text-center py-10 text-slate-500">Đang tải...</div>}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      {!loading && filtered.length === 0 && (
        <div className="glass p-10 text-center text-slate-500">Không có đơn nào.</div>
      )}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="w-full text-sm bg-white/90 backdrop-blur">
            <thead>
              <tr className="bg-blue-100 text-blue-700">
                <th className="p-3 text-left">Khách</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const itemsTotal = order.cart?.reduce((sum,i)=> sum + (i.price||0) * (i.quantity||1), 0) || 0;
                return (
                  <tr key={order._id} className="border-t hover:bg-blue-50/60 transition">
                    <td className="p-3 align-top min-w-[140px]">
                      <div className="font-semibold text-slate-800">{order.name}</div>
                      <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
                      <div className="text-xs text-slate-600 font-medium mt-1">{itemsTotal.toLocaleString()} đ</div>
                    </td>
                    <td className="p-3 align-top">{order.phone}</td>
                    <td className="p-3 align-top max-w-[200px] break-words">{order.address}</td>
                    <td className="p-3 align-top">
                      <ul className="space-y-1">
                        {order.cart?.map((c,idx) => (
                          <li key={idx} className="flex justify-between gap-3">
                            <span className="text-slate-700 truncate max-w-[140px]" title={c.name}>{c.name}</span>
                            <span className="text-slate-500 text-xs">x{c.quantity||1}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 align-top">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${STATUS_COLORS[order.status] || 'bg-slate-200 text-slate-700'}`}>{order.status}</span>
                      <div className="mt-2">
                        <select
                          value={editStatus[order._id] || order.status}
                          onChange={(e)=>handleStatusChange(order._id, e.target.value)}
                          className="text-xs border rounded-full px-2 py-1 bg-white focus:ring-2 focus:ring-blue-300"
                        >
                          {nextStatuses(order.status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <button
                        disabled={updatingId===order._id || (editStatus[order._id]||order.status)===order.status}
                        onClick={()=>applyUpdate(order)}
                        className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-600 transition"
                      >
                        {updatingId===order._id? 'Đang lưu...' : 'Cập nhật'}
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
