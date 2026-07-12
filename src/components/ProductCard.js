

import React from 'react';
import { Link } from 'react-router-dom';
import { productMeta, familyLabelsVN, intensityLabelsVN } from '../data/productMeta';

export default function ProductCard({ product }) {
  const isMini = /mini/i.test(product?.name || '');
  const meta = productMeta[product?.id];
  const noteTag = meta
    ? [familyLabelsVN[meta.families?.[0]], intensityLabelsVN[meta.intensity]].filter(Boolean).join(' · ')
    : null;

  return (
    <div className="product-card relative">
      {isMini && (
        <span className="absolute top-2 left-2 z-10 font-mono text-[9.5px] uppercase tracking-wider px-2 py-1 bg-cream border border-hairline text-label">Mini</span>
      )}
      <img src={product.image} alt={product.name} className="product-img" />
      {noteTag && (
        <div className="font-mono uppercase text-[10.5px] tracking-[0.14em] mt-3" style={{ color: 'var(--accent)' }}>{noteTag}</div>
      )}
      <h3 className="product-name">{product.name}</h3>
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-hairline">
        <p className="product-price">{Number(product.price).toLocaleString('vi-VN')}₫</p>
        <Link to={`/product/${product._id || product.id}`} className="product-btn">Xem chi tiết</Link>
      </div>
    </div>
  );
}
