import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { products as localProducts } from '../data/products';
import API_BASE_URL from '../config/api';

const SCENT_NOTES = [
  'Bergamot', 'Hổ phách', 'Gỗ đàn hương', 'Da thuộc', 'Hoa nhài',
  'Xạ hương', 'Trầm hương', 'Cam Ý', 'Vetiver', 'Hoa cam',
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : null);
        if (list && list.length > 0) {
          setProducts(list);
        } else {
          setProducts(localProducts);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts(localProducts);
        setLoading(false);
      });
  }, []);

  const featured = (products && Array.isArray(products)) ? products.slice(0, 3) : [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <img
              src="https://lelabo.ips.photos/lelabo-java/images/categories/107_LARGE_IMAGE_02_5595.jpg"
              alt="SILLAGE — chân dung và flacon"
              className="w-full object-cover border border-hairline"
              style={{ aspectRatio: '1 / 1.05' }}
            />
          </div>
          <div className="order-1 md:order-2">
            <div className="eyebrow mb-5">Extrait — Édition Nº7</div>
            <h1 className="font-serif font-light text-ink" style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)', lineHeight: 1.05 }}>
              Mùi hương của <em>riêng bạn</em>.
            </h1>
            <p className="mt-6 text-muted max-w-md" style={{ lineHeight: 1.8, fontWeight: 300 }}>
              Hương thơm chính là ký ức trong hình thái cao quý và mãnh liệt nhất — được điều chế theo mẻ nhỏ, dành cho những ai muốn được ghi nhớ theo cách của riêng mình.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary">Mua ngay</Link>
              <Link to="/quiz" className="btn-outline">Làm quiz →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient marquee */}
      <section className="border-y border-hairline bg-surface overflow-hidden py-5">
        <div className="marquee-track">
          {[0, 1].map(rep => (
            <div key={rep} className="flex items-center shrink-0">
              {SCENT_NOTES.map((note, i) => (
                <span key={`${rep}-${i}`} className="flex items-center font-mono uppercase text-ink/70 text-[12px] tracking-[0.18em] whitespace-nowrap">
                  {note}
                  <span className="mx-6" style={{ color: 'var(--accent)' }}>◦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="eyebrow text-center mb-3">Bộ sưu tập</div>
        <h2 className="title">Tuyển chọn</h2>
        {loading && <div className="text-center text-muted py-8 font-mono text-xs uppercase tracking-widest">Đang tải...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {featured.map(p => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link to="/products" className="btn-outline">Xem tất cả sản phẩm</Link>
        </div>
      </section>

      {/* Custom blend CTA */}
      <section className="bg-charcoal text-oncream2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <img
            src="https://lelaboeu-java.s3.amazonaws.com/images/cms/7_ONE_SIZE_IMAGE_01_7809_344429774.jpg"
            alt="SILLAGE — pha chế thủ công"
            className="w-full object-cover border border-hairlineDark"
            style={{ aspectRatio: '1 / 1.05' }}
          />
          <div>
            <div className="eyebrow mb-5" style={{ color: '#9A9789' }}>Dịch vụ riêng</div>
            <h2 className="font-serif font-light" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, color: '#F2EFE9' }}>
              Pha riêng <em>hương thơm</em> của bạn.
            </h2>
            <p className="mt-6 max-w-md" style={{ lineHeight: 1.8, fontWeight: 300, color: '#B9B7AC' }}>
              Đặt lịch tư vấn cùng chuyên gia điều hương của SILLAGE để tạo nên một mùi hương độc bản, mang đậm dấu ấn cá nhân.
            </p>
            <div className="mt-9">
              <Link to="/contact" className="btn-outline btn-outline--light">Đặt lịch tư vấn →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
