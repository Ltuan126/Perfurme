import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError('Không thể tải sản phẩm nổi bật!'); setLoading(false); });
  }, []);

  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Khám phá hương thơm cao cấp</h1>
            <p className="mt-4 text-white/90 text-lg">Bộ sưu tập nước hoa tinh tế, hiện đại, phù hợp mọi cá tính.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/products" className="btn-primary">Mua ngay</Link>
              <Link to="/about" className="btn-outline text-blue-700 hover:bg-blue-50">Về chúng tôi</Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-[4/3] rounded-3xl shadow-2xl border border-white/20 bg-white/20 backdrop-blur" />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <h2 className="title text-blue-700">Nổi bật</h2>
        {loading && <div className="text-center text-slate-500 py-8">Đang tải...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/products" className="btn-outline">Xem tất cả sản phẩm</Link>
        </div>
      </section>
    </div>
  );
}
