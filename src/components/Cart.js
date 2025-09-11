

import React, { useState } from 'react';
import CheckoutForm from './CheckoutForm';

export default function Cart({ items = [] }) {
  const [showCheckout, setShowCheckout] = useState(false);

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
                <th className="p-3 border">Tên sản phẩm</th>
                <th className="p-3 border">Giá</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition">
                  <td className="p-3 border font-semibold">{item.name}</td>
                  <td className="p-3 border">${Number(item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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