

import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const isMini = /mini/i.test(product?.name || '');
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center border border-gray-100 mb-2 min-h-[320px] relative">
      {isMini && (
        <span className="absolute top-2 left-2 text-xs px-2 py-[2px] rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Mini</span>
      )}
      <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-xl mb-3 border border-gray-100" />
      <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{product.name}</h3>
      <p className="text-blue-600 font-bold text-xl mb-2">${Number(product.price).toFixed(2)}</p>
      <Link to={`/product/${product._id || product.id}`} className="mt-auto inline-block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium shadow-sm text-center">Xem chi tiết</Link>
    </div>
  );
}
