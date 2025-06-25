// ---------- src/components/ProductDetail.js ----------
import React from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/products';


export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === +id);
  if (!product) return <p className="cart-empty">Product not found.</p>;

  return (
    <div className="product-detail">
      <img src={product.image} alt={product.name} className="detail-img" />
      <div className="detail-content">
        <h2 className="detail-title">{product.name}</h2>
        <p className="detail-desc">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="detail-price">${product.price.toFixed(2)}</span>
          <button className="detail-add">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}