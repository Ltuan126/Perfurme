

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setError('Không thể tải sản phẩm!'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải sản phẩm...</div>;
  if (error || !product) return <p className="cart-empty text-center py-10">Product not found.</p>;

  return (
    <div className="section">
      <div className="product-detail gap-6 p-6">
        <img src={product.image} alt={product.name} className="detail-img rounded-xl" />
        <div className="detail-content">
          <h2 className="detail-title text-blue-700">{product.name}</h2>
          <p className="detail-desc">{product.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="detail-price text-blue-600">${Number(product.price).toFixed(2)}</span>
            <button className="detail-add" onClick={() => addToCart(product)}>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}