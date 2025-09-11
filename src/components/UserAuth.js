
import { FaUserCircle, FaLock } from 'react-icons/fa';
import React, { useState } from 'react';

export default function UserAuth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (isRegister) {
      if (localStorage.getItem('user_' + username)) {
        setError('Tài khoản đã tồn tại!');
        return;
      }
      localStorage.setItem('user_' + username, password);
      setIsRegister(false);
      setError('Đăng ký thành công! Đăng nhập để tiếp tục.');
    } else {
      const saved = localStorage.getItem('user_' + username);
      if (saved && saved === password) {
        onLogin(username);
      } else {
        setError('Sai tài khoản hoặc mật khẩu!');
      }
    }
  };

  return (
    <div className="user-auth max-w-sm mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
      <div className="flex flex-col items-center mb-6">
  <FaUserCircle className="text-5xl text-blue-400 mb-2" />
        <h2 className="text-2xl font-bold text-gray-800 mb-1 tracking-tight">
          {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
        </h2>
        <p className="text-gray-500 text-sm">Chào mừng bạn đến với Perfume Shop</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FaUserCircle className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-full focus:ring-2 focus:ring-blue-300 outline-none transition"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-full focus:ring-2 focus:ring-blue-300 outline-none transition"
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
  <button type="submit" className="w-full bg-blue-500 hover:bg-cyan-500 text-white font-semibold py-2 rounded-full shadow transition">
          {isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </form>
      <button
  className="w-full mt-4 text-sm text-blue-600 hover:underline focus:outline-none"
        onClick={() => { setIsRegister(!isRegister); setError(''); }}
      >
        {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
      </button>
    </div>
  );
}
