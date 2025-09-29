

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setError('Không thể tải sản phẩm!'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    fetch(`/api/reviews/${id}?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews);
        setTotalReviews(data.total);
      });
  }, [id, page, limit]);

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
      {/* Review section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Đánh giá sản phẩm</h3>
        {reviews.length === 0 ? (
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
      <QASection productId={id} />
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