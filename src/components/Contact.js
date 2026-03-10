import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    // In production, send to backend API
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Liên hệ với chúng tôi</h1>
          <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
            Bạn có câu hỏi, góp ý hoặc cần hỗ trợ? Hãy liên hệ ngay, chúng tôi luôn sẵn sàng phục vụ bạn.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Thông tin liên hệ</h2>

            <div className="glass p-6 flex items-start gap-4 group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <FiMail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Email</h3>
                <a href="mailto:tuanlenguyen612@gmail.com" className="text-blue-600 hover:underline text-sm">
                  tuanlenguyen612@gmail.com
                </a>
              </div>
            </div>

            <div className="glass p-6 flex items-start gap-4 group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <FiPhone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Điện thoại</h3>
                <a href="tel:0708573967" className="text-blue-600 hover:underline text-sm">
                  0708 573 967
                </a>
              </div>
            </div>

            <div className="glass p-6 flex items-start gap-4 group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <FiMapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Địa chỉ</h3>
                <p className="text-slate-600 text-sm">TP. Hồ Chí Minh, Việt Nam</p>
              </div>
            </div>

            <div className="glass p-6 flex items-start gap-4 group hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                <FiClock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Giờ làm việc</h3>
                <p className="text-slate-600 text-sm">Thứ 2 – Thứ 7: 9:00 – 21:00</p>
                <p className="text-slate-600 text-sm">Chủ nhật: 10:00 – 18:00</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass p-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Gửi tin nhắn</h2>

            {sent ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Đã gửi thành công!</h3>
                <p className="text-slate-600 mb-4">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                <button
                  onClick={() => setSent(false)}
                  className="px-4 py-2 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 transition"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập họ tên của bạn"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition bg-white/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition bg-white/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung tin nhắn..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition bg-white/80 resize-none"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <FiSend className="w-4 h-4" />
                  Gửi tin nhắn
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
