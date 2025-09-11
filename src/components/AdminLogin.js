
import React, { useState } from 'react';
import { FaUserShield, FaLock } from 'react-icons/fa';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="admin-login max-w-sm mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <FaUserShield className="text-5xl text-blue-400 mb-2" />
        <h2 className="text-2xl font-bold text-gray-800 mb-1 tracking-tight">Admin Login</h2>
        <p className="text-gray-500 text-sm">Chỉ dành cho quản trị viên</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FaUserShield className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow transition">Đăng nhập</button>
      </form>
    </div>
  );
}
