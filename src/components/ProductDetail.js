

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products as localProducts } from '../data/products';

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
    fetch(`/api/products/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data._id) {
          setProduct(data);
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

  useEffect(() => {
    // Only attempt reviews when viewing a backend product (has string _id)
    if (product && product._id) {
      fetch(`/api/reviews/${product._id}?page=${page}&limit=${limit}`)
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

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Đang tải sản phẩm...</div>;
  if (error || !product) return <p className="cart-empty text-center py-10">Product not found.</p>;

  return (
    <div className="section">
      <div className="product-detail gap-6 p-6">
        <img src={product.image} alt={product.name} className="detail-img rounded-xl" />
        <div className="detail-content">
          <h2 className="detail-title text-blue-700 flex items-center gap-2">{product.name}</h2>
          <p className="detail-desc">{product.description}</p>
          {sizes?.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-slate-600 mb-1">Chọn dung tích:</div>
              <div className="flex gap-2">
                {sizes.map(s => (
                  <button key={s.label} onClick={() => setSelectedSize(s.label)} className={`px-3 py-1 rounded-full border ${selectedSize === s.label || (!selectedSize && s.label === sizes[0].label) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'} transition`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="detail-price text-blue-600">${currentPrice.toFixed(2)}</span>
            <button className="detail-add" onClick={() => {
              const s = sizes && sizes.length > 0 ? (sizes.find(x => x.label === selectedSize) || sizes[0]) : { label: undefined, price: product.price };
              addToCart({ ...product, sizeLabel: s.label, price: s.price }, 1, { sizeLabel: s.label, price: s.price });
              setJustAdded(true);
            }}>
              Thêm vào giỏ hàng
            </button>
            <button className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => navigate('/products')}>
              ← Quay về sản phẩm
            </button>
          </div>
          {justAdded && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl px-3 py-2">
              Đã thêm vào giỏ hàng. <Link to="/products" className="underline font-semibold">Tiếp tục xem sản phẩm</Link> hoặc <Link to="/cart" className="underline font-semibold">xem giỏ hàng</Link>.
            </div>
          )}
        </div>
      </div>
      {/* Review section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Đánh giá sản phẩm</h3>
        {!product._id ? (
          <div className="text-gray-500">Tính năng đánh giá áp dụng cho sản phẩm trên máy chủ.</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">Chưa có đánh giá nào.</div>
        ) : (
          <div>
            {reviews.map((r) => (
              <div key={r._id} className="border-b py-2">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{r.rating}★</span>
                  <span>Độ lưu hương: {r.longevity || '-'} / 5</span>
                  <span>Độ tỏa hương: {r.sillage || '-'} / 5</span>
                </div>
                <div className="italic text-sm text-gray-600">Trải nghiệm: {r.experience || '-'}</div>
                <div>{r.comment}</div>
                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {/* Pagination */}
            <div className="flex gap-2 mt-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded">Trước</button>
              <span>Trang {page} / {Math.ceil(totalReviews / limit)}</span>
              <button disabled={page >= Math.ceil(totalReviews / limit)} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded">Sau</button>
            </div>
          </div>
        )}
      </div>
      {/* Q&A section */}
      {product._id ? <QASection productId={product._id} /> : (
        <div className="mt-6 text-gray-500">Hỏi đáp áp dụng cho sản phẩm trên máy chủ.</div>
      )}
    </div>
  );
}

// Q&A Section Component
function QASection({ productId }) {
  const [qas, setQAs] = useState([]);
  const [totalQAs, setTotalQAs] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/qas/${productId}?page=${page}&limit=${limit}`)
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
    await fetch('/api/qas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, question })
    });
    setQuestion("");
    setPage(1);
    // Reload Q&A
    fetch(`/api/qas/${productId}?page=1&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setQAs(data.qas);
        setTotalQAs(data.total);
      });
  };

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold mb-2">Hỏi đáp sản phẩm</h3>
      <form onSubmit={handleAsk} className="flex gap-2 mb-4">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Đặt câu hỏi về sản phẩm..."
          className="border px-2 py-1 rounded w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Gửi</button>
      </form>
      {loading ? (
        <div className="text-gray-500">Đang tải câu hỏi...</div>
      ) : qas.length === 0 ? (
        <div className="text-gray-500">Chưa có câu hỏi nào.</div>
      ) : (
        <div>
          {qas.map((qa) => (
            <div key={qa._id} className="border-b py-2">
              <div className="font-semibold">Q: {qa.question}</div>
              {qa.answer ? (
                <div className="text-green-700">A: {qa.answer}</div>
              ) : (
                <div className="text-gray-400 italic">Chưa có trả lời từ admin.</div>
              )}
              <div className="text-xs text-gray-400">{new Date(qa.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {/* Pagination */}
          <div className="flex gap-2 mt-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded">Trước</button>
            <span>Trang {page} / {Math.ceil(totalQAs / limit)}</span>
            <button disabled={page >= Math.ceil(totalQAs / limit)} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded">Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}