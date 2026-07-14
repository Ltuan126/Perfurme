// src/components/About.js
import React from 'react';
import ltuanImg from '../assets/img/Ltuan.jpg';

const STACK = ['React', 'React Router', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Mongoose'];

export default function About() {
  return (
    <div>
      {/* Centered intro */}
      <section className="section text-center max-w-2xl">
        <div className="eyebrow mb-4">Câu chuyện</div>
        <h1 className="font-serif font-light text-ink mb-6" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.1 }}>
          Một dự án cá nhân, <em>thực hiện bằng đam mê</em>.
        </h1>
        <p className="text-muted font-light" style={{ lineHeight: 1.85 }}>
          SILLAGE là ứng dụng web thương mại được xây dựng bởi <span className="text-ink">Lê Tuấn</span> — nơi thực hành
          kiến trúc full-stack (React + Node + MongoDB) và tinh chỉnh trải nghiệm mua sắm nước hoa theo tinh thần
          tối giản, sang trọng.
        </p>
      </section>

      {/* Dark 2-col */}
      <section className="bg-charcoal text-oncream2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <img
            src={ltuanImg}
            alt="Lê Tuấn"
            className="w-full object-cover border border-hairlineDark"
            style={{ aspectRatio: '1 / 1.05' }}
          />
          <div>
            <div className="eyebrow mb-5" style={{ color: '#9A9789' }}>Theo mẻ nhỏ</div>
            <h2 className="font-serif font-light mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, color: '#F2EFE9' }}>
              Xây dựng từng chi tiết, <em>bằng tay</em>.
            </h2>
            <p style={{ lineHeight: 1.8, fontWeight: 300, color: '#B9B7AC' }}>
              Xin chào, mình là Lê Tuấn. Mình yêu thích việc xây dựng sản phẩm web gọn nhẹ, dễ dùng và tối ưu trải
              nghiệm. Dự án này là không gian để mình thực hành kiến trúc full-stack và tinh chỉnh giao diện — từ
              danh sách và chi tiết sản phẩm, giỏ hàng, đặt hàng, cho đến trang quản trị dành cho admin.
            </p>
          </div>
        </div>
      </section>

      {/* 3-col numbered feature list */}
      <section className="section">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="font-serif font-light text-ink mb-4" style={{ fontSize: '3.5rem', lineHeight: 1 }}>01</div>
            <div className="eyebrow mb-3">Chất liệu</div>
            <p className="text-muted font-light" style={{ lineHeight: 1.8 }}>
              {STACK.join(' · ')}. Toàn bộ giao diện dựng trên Tailwind CSS, dữ liệu lưu trữ trong MongoDB thông qua Mongoose.
            </p>
          </div>
          <div>
            <div className="font-serif font-light text-ink mb-4" style={{ fontSize: '3.5rem', lineHeight: 1 }}>02</div>
            <div className="eyebrow mb-3">Con người</div>
            <p className="text-muted font-light" style={{ lineHeight: 1.8 }}>
              Một người, một dự án — từ thiết kế, lập trình front-end/back-end đến vận hành nội dung, đều do Lê Tuấn thực hiện.
            </p>
          </div>
          <div>
            <div className="font-serif font-light text-ink mb-4" style={{ fontSize: '3.5rem', lineHeight: 1 }}>03</div>
            <div className="eyebrow mb-3">Trải nghiệm</div>
            <p className="text-muted font-light" style={{ lineHeight: 1.8 }}>
              Đăng nhập/đăng ký bảo mật, giỏ hàng, thanh toán COD &amp; VNPAY, quiz gợi ý mùi hương và trang quản trị sản phẩm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
