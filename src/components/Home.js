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
      <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white relative overflow-hidden">
        {/* Decorative floating elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
              Premium Collection 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.22] md:leading-[1.18] tracking-[0.02em]">
              Fragrance is the essence of memory
            </h1>
            <p className="mt-4 text-white/90 text-lg">Hương thơm chính là ký ức trong hình thái cao quý và mãnh liệt nhất</p>
            <div className="mt-6 flex gap-3">
              <Link to="/products" className="btn-primary">Mua ngay</Link>
              <Link to="/about" className="btn-outline text-blue-700 hover:bg-blue-50">Về chúng tôi</Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-xl shadow-[0_12px_30px_-18px_rgba(15,23,42,0.7)]">
                <div className="text-3xl font-extrabold tracking-wide text-white">100+</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/75 mt-1">Sản phẩm</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-xl shadow-[0_12px_30px_-18px_rgba(15,23,42,0.7)]">
                <div className="text-3xl font-extrabold tracking-wide text-white">50K+</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/75 mt-1">Khách hàng</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-xl shadow-[0_12px_30px_-18px_rgba(15,23,42,0.7)]">
                <div className="text-3xl font-extrabold tracking-wide text-white">4.9⭐</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/75 mt-1">Đánh giá</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative group">
              <img
                src="https://lelabo.ips.photos/lelabo-java/images/categories/107_LARGE_IMAGE_02_5595.jpg"
                alt="Luxury perfume collection"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl border border-white/20 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-blue-900/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section py-16 bg-white/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 text-center group hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chính hãng 100%</h3>
            <p className="text-slate-600 text-sm">Cam kết sản phẩm nhập khẩu chính hãng từ các thương hiệu uy tín</p>
          </div>

          <div className="glass p-6 text-center group hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Giao hàng nhanh</h3>
            <p className="text-slate-600 text-sm">Giao hàng toàn quốc trong 2-3 ngày, hỗ trợ COD</p>
          </div>

          <div className="glass p-6 text-center group hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Thanh toán an toàn</h3>
            <p className="text-slate-600 text-sm">Hỗ trợ nhiều hình thức thanh toán, bảo mật tuyệt đối</p>
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
