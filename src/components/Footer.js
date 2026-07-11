import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-oncream2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif" style={{ fontSize: 22, letterSpacing: '0.4em', color: '#F2EFE9' }}>SILLAGE</div>
          <p className="mt-4 text-sm font-light max-w-xs" style={{ color: '#B9B7AC', lineHeight: 1.8 }}>
            Nước hoa niche điều chế theo mẻ nhỏ — mùi hương của riêng bạn.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-4" style={{ color: '#9A9789' }}>Cửa hàng</div>
          <ul className="space-y-3 text-sm font-light" style={{ color: '#B9B7AC' }}>
            <li><Link to="/products" className="hover:text-oncream2 transition">Toàn bộ nước hoa</Link></li>
            <li><Link to="/quiz" className="hover:text-oncream2 transition">Quiz gợi ý</Link></li>
            <li><Link to="/cart" className="hover:text-oncream2 transition">Giỏ hàng</Link></li>
            <li><Link to="/track" className="hover:text-oncream2 transition">Theo dõi đơn hàng</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4" style={{ color: '#9A9789' }}>Maison</div>
          <ul className="space-y-3 text-sm font-light" style={{ color: '#B9B7AC' }}>
            <li><Link to="/about" className="hover:text-oncream2 transition">Câu chuyện</Link></li>
            <li><Link to="/contact" className="hover:text-oncream2 transition">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4" style={{ color: '#9A9789' }}>Kết nối</div>
          <ul className="space-y-3 text-sm font-light" style={{ color: '#B9B7AC' }}>
            <li><a href="mailto:tuanlenguyen612@gmail.com" className="hover:text-oncream2 transition">Email</a></li>
            <li><a href="tel:0708573967" className="hover:text-oncream2 transition">Điện thoại</a></li>
          </ul>
        </div>
      </div>

      <div className="hairline-dark-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: '#8A8779' }}>
            © {new Date().getFullYear()} SILLAGE. All rights reserved.
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: '#8A8779' }}>
            Hồ Chí Minh ◦ Hà Nội ◦ Đà Nẵng
          </div>
        </div>
      </div>
    </footer>
  );
}
