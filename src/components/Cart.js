// ---------- src/components/Cart.js ----------
import React, { useState } from 'react';


export default function Cart() {
  const [items] = useState([]);
  return (
    <div className="cart-wrapper">
      <h2 className="cart-title">Your Cart</h2>
      {items.length === 0 ? (
        <p className="cart-empty">Cart is empty.</p>
      ) : (
        <ul className="cart-list">
          {items.map((item, idx) => (
            <li key={idx} className="cart-item">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}