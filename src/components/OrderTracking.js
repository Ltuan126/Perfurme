import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (e) => {
    e?.preventDefault();
    const id = code.trim();
    if (!id) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/track/${encodeURIComponent(id)}`);
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        setError(payload.message || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.');
        return;
      }
      setOrder(payload.data);
    } catch {
      setError('Không kết nối được máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = searchParams.get('order');
    if (!initial) return;
    setCode(initial);
    fetch(`${API_BASE_URL}/api/orders/track/${encodeURIComponent(initial)}`)
      .then(res => res.json().then(payload => ({ ok: res.ok, payload })))
      .then(({ ok, payload }) => {
        if (!ok || !payload.success) {
          setError(payload.message || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.');
          return;
        }
        setOrder(payload.data);
      })
      .catch(() => setError('Không kết nối được máy chủ.'));
  }, [searchParams]);

  const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="section max-w-2xl">
      <div className="eyebrow text-center mb-3">Theo dõi đơn hàng</div>
      <h1 className="title">Tra cứu đơn hàng</h1>

      <form onSubmit={lookup} className="flex gap-3 mb-14">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Nhập mã đơn hàng của bạn"
          className="field-underline flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
      </form>

      {error && (
        <div className="border border-hairline px-5 py-4 text-center text-muted font-light">{error}</div>
      )}

      {order && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-10 pb-6 hairline-b">
            <div>
              <div className="field-label mb-1">Mã đơn hàng</div>
              <div className="font-mono text-ink">{String(order.orderId).slice(-8).toUpperCase()}</div>
            </div>
            <div>
              <div className="field-label mb-1">Ngày dự kiến giao</div>
              <div className="font-serif text-xl text-ink">{fmtDate(order.estimatedDelivery)}</div>
            </div>
            <div>
              <div className="field-label mb-1">Tổng tiền</div>
              <div className="font-mono text-ink">{Number(order.total).toLocaleString('vi-VN')}₫</div>
            </div>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: '#DFDBD0' }} />
            {order.steps.map((step, i) => (
              <div key={step.key} className={`relative ${i !== order.steps.length - 1 ? 'pb-10' : ''}`}>
                <span
                  className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full border"
                  style={step.done
                    ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
                    : { background: '#F5F2EB', borderColor: '#CBC7BB' }}
                />
                <div className={`font-mono uppercase text-[12px] tracking-[0.1em] ${step.done ? 'text-ink' : 'text-label'}`}>{step.label}</div>
                {step.at && (
                  <div className="text-xs text-label font-light mt-1">{fmtDate(step.at)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
