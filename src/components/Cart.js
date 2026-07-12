

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cart({ items = [], onQtyChange, onRemove }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = useMemo(() => items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0), [items]);

  const handleQtyInput = (itemId, val) => {
    const n = Math.max(0, Math.floor(Number(val) || 0));
    onQtyChange && onQtyChange(itemId, n);
  };

  const goCheckout = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: '/checkout',
          message: 'Vui lòng đăng ký hoặc đăng nhập để theo dõi trạng thái đơn hàng.'
        }
      });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="section max-w-3xl">
      <div className="eyebrow text-center mb-3">Giỏ hàng</div>
      <h1 className="cart-title text-center mb-10">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="border border-hairline py-16 px-8 text-center">
          <p className="cart-empty mb-6 font-light">Giỏ hàng của bạn hiện đang trống.</p>
          <Link to="/products" className="btn-primary">Khám phá bộ sưu tập</Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => {
              const key = item.cartKey || `${item._id || item.id}${item.sizeLabel ? '::' + item.sizeLabel : ''}`;
              const qty = Number(item.quantity) || 1;
              const line = (Number(item.price) || 0) * qty;
              return (
                <div key={key} className="cart-item flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover border border-hairline shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg text-ink">{item.name}</div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-label mt-1">
                      {item.sizeLabel && <span>{item.sizeLabel} · </span>}
                      {Number(item.price).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="w-8 h-8 border border-hairline text-ink hover:border-ink transition"
                      onClick={() => handleQtyInput(key, Math.max(0, qty - 1))}
                      aria-label="Giảm 1"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => handleQtyInput(key, e.target.value)}
                      className="w-12 text-center bg-transparent outline-none font-mono text-sm border-b border-hairline"
                    />
                    <button
                      type="button"
                      className="w-8 h-8 border border-hairline text-ink hover:border-ink transition"
                      onClick={() => handleQtyInput(key, qty + 1)}
                      aria-label="Tăng 1"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-mono text-sm text-ink w-28 text-right shrink-0">{line.toLocaleString('vi-VN')}₫</div>
                  <button onClick={() => onRemove && onRemove(key)} className="font-mono text-[10.5px] uppercase tracking-wider text-label hover:text-red-700 transition shrink-0">Xoá</button>
                </div>
              );
            })}
          </div>

          <div className="mt-10 ml-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm font-light text-muted">
              <span>Tạm tính</span>
              <span className="font-mono text-ink">{total.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-sm font-light text-muted">
              <span>Vận chuyển</span>
              <span className="font-mono" style={{ color: 'var(--accent)' }}>Miễn phí</span>
            </div>
            <div className="flex justify-between items-baseline pt-3 hairline-t">
              <span className="font-mono text-[11px] uppercase tracking-wider text-label">Tổng</span>
              <span className="font-serif text-2xl text-ink">{total.toLocaleString('vi-VN')}₫</span>
            </div>
            <button onClick={goCheckout} className="btn-primary w-full mt-4">Thanh toán</button>
          </div>
        </>
      )}
    </div>
  );
}
