

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { products as localProducts } from '../data/products';
import { loadQuizAnswers } from '../utils/quiz';
import { productMeta, allFamilies } from '../data/productMeta';
import API_BASE_URL from '../config/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyQuiz, setApplyQuiz] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('search') || '').trim().toLowerCase();
  }, [location.search]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
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
    // optional quiz filter
    if (applyQuiz) {
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
          .sort((a, b) => b.s - a.s)
          .map(x => x.p);
      }
    } else {
      // price filter
      if (priceFilter !== 'all') {
        base = base.filter(p => {
          const price = parseFloat(p.price) || 0;
          if (priceFilter === 'under100') return price < 100;
          if (priceFilter === '100to200') return price >= 100 && price <= 200;
          if (priceFilter === 'over200') return price > 200;
          return true;
        });
      }

      // family filter
      if (familyFilter !== 'all') {
        base = base.filter(p => {
          const pId = p.id || p._id;
          let meta = productMeta[pId];
          if (!meta) {
            const foundMeta = Object.values(productMeta).find(m => m.name.toLowerCase() === (p.name || '').toLowerCase());
            meta = foundMeta;
          }
          return meta && meta.families?.includes(familyFilter);
        });
      }

      // sort order
      if (sortOrder === 'price-asc') {
        base = [...base].sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
      } else if (sortOrder === 'price-desc') {
        base = [...base].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
      }
    }
    return base;
  }, [products, searchQuery, applyQuiz, priceFilter, familyFilter, sortOrder]);

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="section">
      <h1 className="title text-blue-700">Danh sách sản phẩm</h1>
      {loadQuizAnswers() && (
        <div className="mb-4 flex items-center justify-between glass p-4">
          <div className="text-sm text-slate-700">Bạn đã có câu trả lời Quiz. Áp dụng bộ gợi ý để sắp xếp danh sách?</div>
          <button onClick={() => setApplyQuiz(true)} className="px-3 py-1 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50">Áp dụng gợi ý</button>
        </div>
      )}
      {searchQuery && (
        <p className="text-sm text-slate-600 mb-4">Kết quả tìm kiếm cho: <span className="font-semibold text-slate-800">{searchQuery}</span></p>
      )}

      {/* Filter and Sort Bar */}
      <div className="mb-6 p-4 glass rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <span className="font-semibold text-slate-700">Lọc theo:</span>
          <select 
            value={priceFilter} 
            onChange={e => setPriceFilter(e.target.value)}
            className="px-3 py-2 border border-blue-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition-all"
          >
            <option value="all">Mọi mức giá</option>
            <option value="under100">Dưới $100</option>
            <option value="100to200">$100 - $200</option>
            <option value="over200">Trên $200</option>
          </select>

          <select 
            value={familyFilter} 
            onChange={e => setFamilyFilter(e.target.value)}
            className="px-3 py-2 border border-blue-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white capitalize shadow-sm transition-all"
          >
            <option value="all">Tất cả nhóm hương</option>
            {allFamilies.map(f => (
              <option key={f} value={f}>{f.replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 items-center w-full md:w-auto md:justify-end">
          <span className="font-semibold text-slate-700">Sắp xếp:</span>
          <select 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-blue-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition-all"
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

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
