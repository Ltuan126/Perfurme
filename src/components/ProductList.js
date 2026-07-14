

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { products as localProducts } from '../data/products';
import { loadQuizAnswers } from '../utils/quiz';
import { allFamilies, familyLabelsVN, getProductMeta } from '../data/productMeta';
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
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : null);
        if (list && (list.length > 0 || searchQuery)) {
          // search rỗng kết quả là hợp lệ (không fallback); chỉ merge Mini tĩnh khi khớp searchQuery
          const minis = localProducts.filter(p => {
            if (!/mini/i.test(p.name || '')) return false;
            if (!searchQuery) return true;
            const name = (p.name || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            return name.includes(searchQuery) || desc.includes(searchQuery);
          });
          const fetchedNames = new Set(list.map(p => (p?.name || '').toLowerCase()));
          const minisToAdd = minis.filter(p => !fetchedNames.has((p.name || '').toLowerCase()));
          setProducts([...list, ...minisToAdd]);
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
  }, [searchQuery]);

  // IMPORTANT: define all hooks before any early return to keep hook order stable
  const filtered = useMemo(() => {
    let base = products;
    // optional quiz filter
    if (applyQuiz) {
      const answers = loadQuizAnswers();
      if (answers) {
        base = base
          .map(p => {
            const m = getProductMeta(p);
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
          if (priceFilter === 'under2m') return price < 2000000;
          if (priceFilter === '2mto5m') return price >= 2000000 && price <= 5000000;
          if (priceFilter === 'over5m') return price > 5000000;
          return true;
        });
      }

      // family filter
      if (familyFilter !== 'all') {
        base = base.filter(p => {
          const meta = getProductMeta(p);
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

  if (loading) return <div className="text-center py-20 font-mono text-xs uppercase tracking-widest text-label">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

  const pill = (active) => `font-mono uppercase text-[10.5px] tracking-[0.14em] px-4 py-2 border transition-colors duration-300 ${active ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink border-hairline hover:border-ink'}`;

  return (
    <div className="section">
      <div className="eyebrow text-center mb-3">Bộ sưu tập</div>
      <h1 className="title">Toàn bộ nước hoa</h1>

      {loadQuizAnswers() && (
        <div className="mb-6 flex items-center justify-between border border-hairline px-5 py-4">
          <div className="text-sm text-muted font-light">Bạn đã có câu trả lời Quiz. Áp dụng bộ gợi ý để sắp xếp danh sách?</div>
          <button onClick={() => setApplyQuiz(true)} className="btn-outline shrink-0 ml-4">Áp dụng gợi ý</button>
        </div>
      )}
      {searchQuery && (
        <p className="text-sm text-muted mb-6 font-light">Kết quả tìm kiếm cho: <span className="text-ink">{searchQuery}</span></p>
      )}

      {/* Family filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFamilyFilter('all')} className={pill(familyFilter === 'all')}>Tất cả</button>
        {allFamilies.map(f => (
          <button key={f} onClick={() => setFamilyFilter(f)} className={pill(familyFilter === f)}>
            {familyLabelsVN[f] || f}
          </button>
        ))}
      </div>

      {/* Price + Sort */}
      <div className="mb-10 pb-6 border-b border-hairline flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-6 items-center">
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="font-mono uppercase text-[10.5px] tracking-[0.1em] bg-transparent border-b border-hairline pb-1 outline-none text-ink"
          >
            <option value="all">Mọi mức giá</option>
            <option value="under2m">Dưới 2.000.000₫</option>
            <option value="2mto5m">2.000.000₫ - 5.000.000₫</option>
            <option value="over5m">Trên 5.000.000₫</option>
          </select>
        </div>

        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="font-mono uppercase text-[10.5px] tracking-[0.1em] bg-transparent border-b border-hairline pb-1 outline-none text-ink"
        >
          <option value="default">Mặc định</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-hairline p-10 text-center text-muted font-light">Không tìm thấy sản phẩm phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {filtered.map(product => (
            <ProductCard key={product._id || `local-${product.id}`} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
