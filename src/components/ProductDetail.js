

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products as localProducts } from '../data/products';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { productMeta, familyLabelsVN, intensityLabelsVN } from '../data/productMeta';

const NOTE_WORDS = {
  citrus: ['Chanh vàng', 'Cam Ý', 'Bưởi'],
  floral: ['Hoa hồng', 'Hoa violet', 'Hoa diên vĩ'],
  woody: ['Gỗ tuyết tùng', 'Gỗ đàn hương', 'Vetiver'],
  green: ['Lá xanh', 'Cỏ vetiver', 'Lá sung'],
  spicy: ['Hạt tiêu hồng', 'Nhục đậu khấu', 'Quế'],
  musky: ['Xạ hương trắng', 'Xạ hương động vật'],
  tea: ['Trà đen', 'Trà xanh', 'Bergamot'],
  'white-floral': ['Hoa cam', 'Hoa huệ', 'Hoa nhài trắng'],
  amber: ['Hổ phách', 'Vani', 'Đậu Tonka'],
};

const TOP_FAMILIES = ['citrus', 'green', 'spicy'];
const HEART_FAMILIES = ['floral', 'white-floral', 'tea'];
const BASE_FAMILIES = ['woody', 'musky', 'amber'];

function buildPyramid(meta) {
  if (!meta?.families?.length) return null;
  const pick = (pool) => {
    const fams = meta.families.filter(f => pool.includes(f));
    const words = fams.flatMap(f => NOTE_WORDS[f] || []);
    return words.length ? words.slice(0, 3) : null;
  };
  const top = pick(TOP_FAMILIES) || (NOTE_WORDS[meta.families[0]] || []).slice(0, 2);
  const heart = pick(HEART_FAMILIES) || (NOTE_WORDS[meta.families[0]] || []).slice(0, 2);
  const base = pick(BASE_FAMILIES) || (NOTE_WORDS[meta.families[meta.families.length - 1]] || []).slice(0, 2);
  return { top, heart, base };
}

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [selectedSize, setSelectedSize] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Try API first
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const product = data?.data && data.data._id ? data.data : null;
        if (product) {
          setProduct(product);
        } else {
          // Fallback to local item by numeric id
          const local = localProducts.find(p => String(p.id) === String(id));
          if (local) setProduct(local); else setError('Không tìm thấy sản phẩm!');
        }
        setLoading(false);
      })
      .catch(() => {
        const local = localProducts.find(p => String(p.id) === String(id));
        if (local) setProduct(local); else setError('Không tìm thấy sản phẩm!');
        setLoading(false);
      });
  }, [id]);

  const sizes = useMemo(() => Array.isArray(product?.sizes) ? product.sizes : [{ label: '100ml', price: product?.price }].filter(Boolean), [product]);
  const currentPrice = useMemo(() => {
    if (!sizes || sizes.length === 0) return Number(product?.price) || 0;
    const found = sizes.find(s => s.label === selectedSize) || sizes[0];
    return Number(found.price) || 0;
  }, [sizes, selectedSize, product]);

  const currentSizeLabel = useMemo(() => (selectedSize || sizes?.[0]?.label), [selectedSize, sizes]);

  const meta = useMemo(() => {
    if (!product) return null;
    const pId = product.id || product._id;
    return productMeta[pId] || Object.values(productMeta).find(m => m.name.toLowerCase() === (product.name || '').toLowerCase());
  }, [product]);

  const noteTag = meta
    ? [familyLabelsVN[meta.families?.[0]], intensityLabelsVN[meta.intensity]].filter(Boolean).join(' · ')
    : null;

  const pyramid = useMemo(() => buildPyramid(meta), [meta]);

  useEffect(() => {
    // Only attempt reviews when viewing a backend product (has string _id)
    if (product && product._id) {
      fetch(`${API_BASE_URL}/api/reviews/${product._id}?page=${page}&limit=${limit}`)
        .then(res => res.ok ? res.json() : { reviews: [], total: 0 })
        .then(data => {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setTotalReviews(Number(data.total) || 0);
        })
        .catch(() => {
          setReviews([]);
          setTotalReviews(0);
        });
    } else {
      setReviews([]);
      setTotalReviews(0);
    }
  }, [product, page, limit]);

  if (loading) return <div className="text-center py-20 font-mono text-xs uppercase tracking-widest text-label">Đang tải sản phẩm...</div>;
  if (error || !product) return <p className="cart-empty text-center py-20">Product not found.</p>;

  return (
    <div className="section">
      <Link to="/products" className="font-mono uppercase text-[11px] tracking-[0.14em] text-label hover:text-ink transition-colors inline-block mb-8">← Bộ sưu tập</Link>

      <div className="product-detail">
        <img src={product.image} alt={product.name} className="detail-img" />
        <div className="detail-content">
          {noteTag && <div className="eyebrow mb-4">{noteTag}</div>}
          <h1 className="detail-title">{product.name}</h1>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="detail-price">{currentPrice.toLocaleString('vi-VN')}₫</span>
            {currentSizeLabel && <span className="font-mono text-label text-[13px]">· {currentSizeLabel}</span>}
          </div>
          <p className="detail-desc">{product.description}</p>

          {sizes?.length > 0 && (
            <div className="mb-8">
              <div className="field-label mb-2">Chọn dung tích</div>
              <div className="flex gap-2">
                {sizes.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={`font-mono uppercase text-[11px] tracking-[0.1em] px-4 py-2 border transition-colors ${selectedSize === s.label || (!selectedSize && s.label === sizes[0].label) ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink border-hairline hover:border-ink'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pyramid && (
            <div className="mb-8 hairline-t hairline-b py-5 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="field-label mb-0">Hương đầu</span>
                <span className="text-sm text-muted font-light text-right">{pyramid.top.join(', ')}</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="field-label mb-0">Hương giữa</span>
                <span className="text-sm text-muted font-light text-right">{pyramid.heart.join(', ')}</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="field-label mb-0">Hương cuối</span>
                <span className="text-sm text-muted font-light text-right">{pyramid.base.join(', ')}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button className="detail-add" onClick={() => {
              const s = sizes && sizes.length > 0 ? (sizes.find(x => x.label === selectedSize) || sizes[0]) : { label: undefined, price: product.price };
              addToCart({ ...product, sizeLabel: s.label, price: s.price }, 1, { sizeLabel: s.label, price: s.price });
              setJustAdded(true);
            }}>
              Thêm vào giỏ hàng
            </button>
            <button className="btn-outline" onClick={() => navigate('/cart')}>
              Xem giỏ
            </button>
          </div>
          {justAdded && (
            <div className="mt-5 flex items-center gap-3 border border-hairline px-4 py-3">
              <span className="text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--accent)' }}>✓ Đã thêm vào giỏ hàng</span>
              <Link to="/checkout" className="ml-auto font-mono uppercase text-[11px] tracking-wider text-ink underline underline-offset-4">
                Tiến hành thanh toán →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Review section */}
      <div className="mt-16 pt-10 hairline-t">
        <h3 className="font-serif font-light text-2xl mb-4">Đánh giá sản phẩm</h3>
        {!product._id ? (
          <div className="text-muted font-light">Tính năng đánh giá áp dụng cho sản phẩm trên máy chủ.</div>
        ) : reviews.length === 0 ? (
          <div className="text-muted font-light">Chưa có đánh giá nào.</div>
        ) : (
          <div>
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-hairline py-4">
                <div className="flex gap-3 items-center font-mono text-[11px] uppercase tracking-wider text-ink">
                  <span>{r.rating}★</span>
                  <span className="text-label">Độ lưu hương: {r.longevity || '-'} / 5</span>
                  <span className="text-label">Độ tỏa hương: {r.sillage || '-'} / 5</span>
                </div>
                <div className="italic text-sm text-muted mt-1">Trải nghiệm: {r.experience || '-'}</div>
                <div className="text-sm text-ink mt-1 font-light">{r.comment}</div>
                <div className="text-xs text-label mt-1">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex items-center gap-4 mt-6 font-mono text-[11px] uppercase tracking-wider">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-ink disabled:text-label">← Trước</button>
              <span className="text-label">Trang {page} / {Math.ceil(totalReviews / limit)}</span>
              <button disabled={page >= Math.ceil(totalReviews / limit)} onClick={() => setPage(page + 1)} className="text-ink disabled:text-label">Sau →</button>
            </div>
          </div>
        )}
      </div>
      {/* Q&A section */}
      {product._id ? <QASection productId={product._id} /> : (
        <div className="mt-8 text-muted font-light">Hỏi đáp áp dụng cho sản phẩm trên máy chủ.</div>
      )}
    </div>
  );
}

// Q&A Section Component
function QASection({ productId }) {
  const { authFetch } = useAuth();
  const [qas, setQAs] = useState([]);
  const [totalQAs, setTotalQAs] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/qas/${productId}?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setQAs(data.qas);
        setTotalQAs(data.total);
        setLoading(false);
      });
  }, [productId, page, limit]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    // Gửi câu hỏi, cần đăng nhập
    const res = await authFetch(`${API_BASE_URL}/api/qas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, question })
    });
    if (!res.ok) {
      return;
    }
    setQuestion("");
    setPage(1);
    // Reload Q&A
    fetch(`${API_BASE_URL}/api/qas/${productId}?page=1&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setQAs(data.qas);
        setTotalQAs(data.total);
      });
  };

  return (
    <div className="mt-16 pt-10 hairline-t">
      <h3 className="font-serif font-light text-2xl mb-4">Hỏi đáp sản phẩm</h3>
      <form onSubmit={handleAsk} className="flex gap-3 mb-6">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Đặt câu hỏi về sản phẩm..."
          className="field-underline flex-1"
        />
        <button type="submit" className="btn-outline shrink-0">Gửi</button>
      </form>
      {loading ? (
        <div className="text-muted font-light">Đang tải câu hỏi...</div>
      ) : qas.length === 0 ? (
        <div className="text-muted font-light">Chưa có câu hỏi nào.</div>
      ) : (
        <div>
          {qas.map((qa) => (
            <div key={qa._id} className="border-b border-hairline py-4">
              <div className="text-ink font-normal">Q: {qa.question}</div>
              {qa.answer ? (
                <div className="mt-1 text-sm font-light" style={{ color: 'var(--accent)' }}>A: {qa.answer}</div>
              ) : (
                <div className="text-label italic text-sm mt-1">Chưa có trả lời từ admin.</div>
              )}
              <div className="text-xs text-label mt-1">{new Date(qa.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {/* Pagination */}
          <div className="flex items-center gap-4 mt-6 font-mono text-[11px] uppercase tracking-wider">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-ink disabled:text-label">← Trước</button>
            <span className="text-label">Trang {page} / {Math.ceil(totalQAs / limit)}</span>
            <button disabled={page >= Math.ceil(totalQAs / limit)} onClick={() => setPage(page + 1)} className="text-ink disabled:text-label">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}
