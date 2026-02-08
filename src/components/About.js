// src/components/About.js
import React from 'react';
import ltuanImg from '../assets/img/Ltuan.jpg';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Perfume Shop — Personal Project</h1>
            <p className="mt-4 text-white/90 text-lg">Thực hiện bởi <span className="font-semibold">Lê Tuấn</span>. Dự án cá nhân tập trung vào trải nghiệm mua sắm nước hoa hiện đại.</p>
          </div>
          <div className="hidden md:block">
            <div className="relative group">
              <img
                src={ltuanImg}
                alt="Lê Tuấn"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl border border-white/20 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-blue-900/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Project summary */}
      <section className="section">
        <div className="glass p-8">
          <h2 className="title mb-4">Giới thiệu dự án</h2>
          <p className="text-slate-700 leading-7">
            Perfume Shop là ứng dụng web thương mại đơn giản cho phép xem danh sách sản phẩm, xem chi tiết, thêm vào giỏ hàng,
            đặt hàng COD, và quản trị sản phẩm cho admin. Dự án được xây dựng nhằm thực hành full‑stack (React + Node + MongoDB)
            với giao diện hiện đại, gọn gàng, dễ mở rộng.
          </p>
        </div>
      </section>

      {/* Features & Stack */}
      <section className="section grid md:grid-cols-2 gap-6">
        <div className="glass p-8">
          <h3 className="text-2xl font-bold text-blue-700 mb-4">Tính năng chính</h3>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Danh sách, chi tiết sản phẩm; tìm kiếm cơ bản.</li>
            <li>Giỏ hàng, đặt hàng COD (đơn hàng lưu DB).</li>
            <li>Trang quản trị: thêm/sửa/xóa sản phẩm.</li>
            <li>Đăng nhập/đăng ký người dùng (localStorage).</li>
            <li>UI hiện đại với Tailwind, responsive.</li>
          </ul>
        </div>
        <div className="glass p-8">
          <h3 className="text-2xl font-bold text-blue-700 mb-4">Tech stack</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {['React', 'React Router', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Mongoose'].map((t) => (
              <div key={t} className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-center border border-slate-200">{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal note */}
      <section className="section">
        <div className="glass p-8 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-blue-700 mb-4">Về tác giả</h3>
          <p className="text-slate-700 leading-7">
            Xin chào, mình là <span className="font-semibold">Lê Tuấn</span>. Mình yêu thích việc xây dựng sản phẩm web gọn nhẹ,
            dễ dùng và tối ưu trải nghiệm. Dự án này là không gian để mình thực hành kiến trúc full‑stack và tinh chỉnh giao diện.
          </p>
        </div>
      </section>
    </div>
  );
}
