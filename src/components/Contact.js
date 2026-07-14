import React, { useState } from 'react';

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

  const infoItem = (label, value, href) => (
    <div className="py-5 hairline-b">
      <div className="field-label mb-1">{label}</div>
      {href ? (
        <a href={href} className="font-serif text-xl text-ink hover:opacity-70 transition">{value}</a>
      ) : (
        <div className="font-serif text-xl text-ink">{value}</div>
      )}
    </div>
  );

  return (
    <section className="section">
      <div className="grid md:grid-cols-2 gap-16">
        {/* Left: heading + info */}
        <div>
          <div className="eyebrow mb-4">Liên hệ</div>
          <h1 className="font-serif font-light text-ink mb-6" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', lineHeight: 1.08 }}>
            Chúng tôi luôn <em>sẵn sàng</em> lắng nghe.
          </h1>
          <p className="text-muted font-light mb-4" style={{ lineHeight: 1.8 }}>
            Bạn có câu hỏi, góp ý hoặc cần hỗ trợ? Hãy liên hệ ngay, chúng tôi sẽ phản hồi sớm nhất có thể.
          </p>

          <div className="mt-10 hairline-t">
            {infoItem('Địa chỉ', 'TP. Hồ Chí Minh, Việt Nam')}
            {infoItem('Email', 'tuanlenguyen612@gmail.com', 'mailto:tuanlenguyen612@gmail.com')}
            {infoItem('Điện thoại', '0708 573 967', 'tel:0708573967')}
            <div className="py-5">
              <div className="field-label mb-1">Giờ làm việc</div>
              <div className="font-serif text-xl text-ink">Thứ 2 – Thứ 7: 9:00 – 21:00</div>
              <div className="font-serif text-xl text-ink">Chủ nhật: 10:00 – 18:00</div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="border border-hairline p-8 md:p-10">
          <div className="eyebrow mb-2">Gửi lời nhắn</div>
          <h2 className="font-serif font-light text-2xl mb-8">Liên hệ trực tiếp</h2>

          {sent ? (
            <div className="text-center py-14">
              <div className="font-mono text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>✓ Đã gửi thành công</div>
              <p className="text-muted font-light mb-6">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
              <button onClick={() => setSent(false)} className="btn-outline">Gửi lời nhắn khác</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="field-label">Họ tên</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập họ tên của bạn"
                    className="field-underline"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="field-underline"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Nội dung</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Nhập nội dung tin nhắn..."
                  rows={4}
                  className="field-underline resize-none"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Gửi lời nhắn
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
