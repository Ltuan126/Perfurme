

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('search') || '').trim().toLowerCase();
  }, [location.search]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError('Không thể tải sản phẩm!'); setLoading(false); });
  }, []);

  // IMPORTANT: define all hooks before any early return to keep hook order stable
  const filtered = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(searchQuery) || desc.includes(searchQuery);
    });
  }, [products, searchQuery]);

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="section">
      <h1 className="title text-blue-700">Danh sách sản phẩm</h1>
      {searchQuery && (
        <p className="text-sm text-slate-600 mb-4">Kết quả tìm kiếm cho: <span className="font-semibold text-slate-800">{searchQuery}</span></p>
      )}
      {filtered.length === 0 ? (
        <div className="glass p-8 text-center text-slate-600">Không tìm thấy sản phẩm phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
