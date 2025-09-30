

import React, { useMemo, useState } from 'react';
import CheckoutForm from './CheckoutForm';

export default function Cart({ items = [], onQtyChange, onRemove }) {
  const [showCheckout, setShowCheckout] = useState(false);

  const total = useMemo(() => items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0), [items]);

  const handleQtyInput = (itemId, val) => {
    const n = Math.max(0, Math.floor(Number(val) || 0));
    onQtyChange && onQtyChange(itemId, n);
  };

  return (
    <div className="section max-w-3xl">
      <div className="cart-wrapper">
        <h2 className="cart-title text-blue-700 text-center">Giỏ hàng của bạn</h2>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center">Giỏ hàng trống.</p>
        ) : (
          <>
            <table className="w-full border rounded-2xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-700">
                  <th className="p-3 border text-left">Sản phẩm</th>
                  <th className="p-3 border">Giá</th>
                  <th className="p-3 border">Số lượng</th>
                  <th className="p-3 border">Thành tiền</th>
                  <th className="p-3 border">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const key = item.cartKey || `${item._id || item.id}${item.sizeLabel ? '::' + item.sizeLabel : ''}`;
                  const qty = Number(item.quantity) || 1;
                  const line = (Number(item.price) || 0) * qty;
                  return (
                    <tr key={key} className="hover:bg-blue-50 transition">
                      <td className="p-3 border font-semibold">
                        {item.name}
                        {item.sizeLabel && <span className="ml-2 text-xs px-2 py-[1px] rounded-full bg-slate-100 text-slate-700 border border-slate-200">{item.sizeLabel}</span>}
                      </td>
                      <td className="p-3 border">${Number(item.price).toFixed(2)}</td>
                      <td className="p-3 border">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
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
                            className="w-20 border rounded px-2 py-1 text-center"
                          />
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => handleQtyInput(key, qty + 1)}
                            aria-label="Tăng 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 border font-semibold">${line.toFixed(2)}</td>
                      <td className="p-3 border text-center">
                        <button onClick={() => onRemove && onRemove(key)} className="text-red-600 hover:text-red-700 font-medium">Xóa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <div className="text-slate-600">Tổng cộng:</div>
              <div className="text-blue-700 font-bold text-lg">${total.toFixed(2)}</div>
            </div>
            {!showCheckout && (
              <button onClick={() => setShowCheckout(true)} className="btn-primary w-full mt-4">
                Đặt hàng COD
              </button>
            )}
            {showCheckout && <CheckoutForm cart={items} onOrderSuccess={() => setShowCheckout(false)} />}
          </>
        )}
      </div>
    </div>
  );
}