

import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const isMini = /mini/i.test(product?.name || '');
  return (
    <div className="product-card relative">
      {isMini && (
        <span className="absolute top-2 left-2 text-xs px-2 py-[2px] rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Mini</span>
      )}
      <img src={product.image} alt={product.name} className="product-img" />
      <h3 className="product-name text-center">{product.name}</h3>
      <p className="product-price">${Number(product.price).toFixed(2)}</p>
      <Link to={`/product/${product._id || product.id}`} className="product-btn w-full text-center">Xem chi tiết</Link>
    </div>
  );
}
