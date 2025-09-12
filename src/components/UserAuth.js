
import { FaUserCircle, FaLock } from 'react-icons/fa';
import React, { useState, useMemo } from 'react';

export default function UserAuth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);

  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-5
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  if (!username || !password) return setError('Vui lòng nhập đầy đủ thông tin!');
  if (isRegister && password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.message || 'Đăng ký thất bại');
        // Auto login sau đăng ký
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_login', data.user.username);
        localStorage.setItem('user_role', data.user.role);
        onLogin(data.user.username);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.message || 'Đăng nhập thất bại');
        // Lưu token & thông tin user
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_login', data.user.username);
        localStorage.setItem('user_role', data.user.role);
        onLogin(data.user.username);
      }
    } catch (err) {
      setError('Không kết nối được máy chủ');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-[#0a0f1c] text-white">
      <div className="absolute inset-0 opacity-[0.25]">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-60" />
      </div>
      <div className="relative max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center animate-fade-in">
        {/* Intro */}
        <div className="space-y-7">
          <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs tracking-widest uppercase backdrop-blur">Luxury Fragrance Platform</div>
          <h1 className="text-5xl font-black leading-tight bg-gradient-to-br from-white via-cyan-200 to-blue-300 text-transparent bg-clip-text drop-shadow-xl">Perfume <span className="font-light">Experience</span></h1>
          <p className="text-white/80 leading-relaxed max-w-lg text-sm md:text-base">
            Khám phá bộ sưu tập hương thơm tinh tế được tuyển chọn kỹ lưỡng. Tạo tài khoản để đồng bộ giỏ hàng, quản lý đơn hàng và truy cập các ưu đãi giới hạn.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md text-sm">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition">
              <div className="font-semibold mb-1 text-cyan-200">Danh mục độc quyền</div>
              <div className="text-white/60 text-xs">Các mẫu niche và limited edition.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition">
              <div className="font-semibold mb-1 text-cyan-200">Đặt hàng nhanh</div>
              <div className="text-white/60 text-xs">Giỏ hàng & COD đơn giản.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition">
              <div className="font-semibold mb-1 text-cyan-200">Giao diện mượt</div>
              <div className="text-white/60 text-xs">Tối ưu trải nghiệm người dùng.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition">
              <div className="font-semibold mb-1 text-cyan-200">Bảo mật JWT</div>
              <div className="text-white/60 text-xs">Phiên đăng nhập ngắn hạn an toàn.</div>
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-white/50">* Đừng dùng mật khẩu thật cho bản demo.</p>
        </div>
        {/* Auth Card */}
        <div className="relative group w-full max-w-sm mx-auto rounded-3xl p-[1px] bg-gradient-to-br from-cyan-400/50 via-blue-500/30 to-indigo-600/40 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-cyan-400/30 via-transparent to-indigo-600/30 blur-xl opacity-60 group-hover:opacity-90 transition"></div>
          <div className="relative rounded-3xl backdrop-blur-xl bg-[#0d1628]/80 p-8 border border-white/10 space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <FaUserCircle className="text-6xl text-cyan-200 drop-shadow" />
                <div className="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">{isRegister ? 'NEW' : 'JWT'}</div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                {isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
              </h2>
              <p className="text-white/50 text-xs mt-1">{isRegister ? 'Đăng ký để bắt đầu hành trình hương thơm' : 'Đăng nhập để tiếp tục trải nghiệm'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <FaUserCircle className="absolute left-3 top-3 text-cyan-300/60" />
                  <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="pl-10 pr-3 py-2.5 w-full rounded-xl focus:ring-2 focus:ring-cyan-400/60 outline-none transition bg-white/95 text-slate-800 placeholder-slate-400 shadow-inner"
                  />
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-cyan-300/60" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-20 py-2.5 w-full rounded-xl focus:ring-2 focus:ring-cyan-400/60 outline-none transition bg-white/95 text-slate-800 placeholder-slate-400 shadow-inner"
                  />
                  <button type="button" onClick={() => setShowPass(s=>!s)} className="absolute right-3 top-2.5 text-[10px] px-2 py-1 rounded-full bg-slate-900/70 text-cyan-200 hover:bg-slate-800 transition">
                    {showPass ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {isRegister && (
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-cyan-300/60" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Xác nhận mật khẩu"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="pl-10 pr-3 py-2.5 w-full rounded-xl focus:ring-2 focus:ring-cyan-400/60 outline-none transition bg-white/95 text-slate-800 placeholder-slate-400 shadow-inner"
                    />
                  </div>
                )}
              </div>
              {isRegister && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] tracking-wide">
                    <span className="text-white/50 uppercase">Độ mạnh</span>
                    <span className="text-cyan-300/80 font-semibold">{strength}/5</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800/70 rounded-full overflow-hidden flex">
                    {Array.from({ length: 5 }).map((_,i)=>(
                      <div key={i} className={`flex-1 mx-[1px] rounded ${i < strength ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-slate-600/50'}`}></div>
                    ))}
                  </div>
                  <div className="text-[10px] text-white/40 italic">Thêm ký tự hoa, số & ký tự đặc biệt để mạnh hơn.</div>
                </div>
              )}
              {error && <div className="text-red-300 text-xs text-center font-medium px-3 py-2 rounded bg-red-500/10 border border-red-400/30">{error}</div>}
              <button type="submit" className="w-full relative group/btn rounded-xl font-semibold overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 group-hover:from-cyan-300 group-hover:via-blue-400 group-hover:to-indigo-500 transition" />
                <div className="relative py-2.5 tracking-wide drop-shadow text-sm uppercase">{isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}</div>
              </button>
            </form>
            <div className="pt-2">
              <button
                className="w-full text-[11px] tracking-wide text-cyan-200/70 hover:text-cyan-100 underline-offset-4 hover:underline transition"
                onClick={() => { setIsRegister(!isRegister); setError(''); setPassword(''); setConfirm(''); }}
              >
                {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Tạo ngay'}
              </button>
            </div>
            <div className="pt-1 text-[10px] text-white/30 text-center">Phiên JWT ~15 phút • Demo environment</div>
          </div>
        </div>
      </div>
    </div>
  );
}
