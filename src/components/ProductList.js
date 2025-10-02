

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import { products as localProducts } from '../data/products';
import { loadQuizAnswers } from '../utils/quiz';
import { productMeta } from '../data/productMeta';

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
    let base = products;
    // optional search text filter
    if (searchQuery) {
      base = base.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(searchQuery) || desc.includes(searchQuery);
      });
    }
    // optional quiz filter preview (activated via CTA)
    if (typeof window !== 'undefined' && window.__APPLY_QUIZ_FILTER__) {
      const answers = loadQuizAnswers();
      if (answers) {
        base = base
          .map(p => {
            const m = productMeta[p.id];
            let s = 0;
            if (answers.families?.length) s += (answers.families.filter(f => m?.families?.includes(f)).length || 0) * 3;
            if (answers.season) s += (answers.season === 'any' || m?.seasons?.includes(answers.season)) ? 1 : 0;
            if (answers.occasion) s += (m?.occasions?.includes(answers.occasion) ? 1 : 0);
            if (answers.moods?.length) s += (answers.moods.filter(x => m?.moods?.includes(x)).length || 0) * 2;
            return { p, s };
          })
          .sort((a,b)=> b.s - a.s)
          .map(x => x.p);
      }
      // reset flag after applying once
      window.__APPLY_QUIZ_FILTER__ = false;
    }
    return base;
  }, [products, searchQuery]);

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="section">
      <h1 className="title text-blue-700">Danh sách sản phẩm</h1>
      {loadQuizAnswers() && (
        <div className="mb-4 flex items-center justify-between glass p-4">
          <div className="text-sm text-slate-700">Bạn đã có câu trả lời Quiz. Áp dụng bộ gợi ý để sắp xếp danh sách?</div>
          <button onClick={() => { window.__APPLY_QUIZ_FILTER__ = true; window.dispatchEvent(new Event('popstate')); }} className="px-3 py-1 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50">Áp dụng gợi ý</button>
        </div>
      )}
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
