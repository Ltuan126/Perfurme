

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import { products as localProducts } from '../data/products';

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
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge local "Mini" items into API list if not already present
          const minis = localProducts.filter(p => /mini/i.test(p.name || ''));
          const fetchedNames = new Set(data.map(p => (p?.name || '').toLowerCase()));
          const minisToAdd = minis.filter(p => !fetchedNames.has((p.name || '').toLowerCase()));
          setProducts([...data, ...minisToAdd]);
        } else {
          setProducts(localProducts);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local products when API fails
        setProducts(localProducts);
        setError('Hiển thị danh sách cục bộ (API không khả dụng).');
        setLoading(false);
      });
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
            <ProductCard key={product._id || `local-${product.id}`} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
