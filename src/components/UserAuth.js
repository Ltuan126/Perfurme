import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import './UserAuth.css';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

/* ───────── strength helpers ───────── */
const STRENGTH_LABELS = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'];
const STRENGTH_COLORS = ['#334155', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4'];

export default function UserAuth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.message;

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) return setError('Vui lòng nhập đầy đủ thông tin!');
    if (isRegister && password !== confirm) return setError('Mật khẩu xác nhận không khớp');

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || (isRegister ? 'Đăng ký thất bại' : 'Đăng nhập thất bại'));

      login({ accessToken: data.accessToken || data.token, user: data.user });
      const from = location.state?.from || '/';
      const state = location.state?.showCheckout ? { showCheckout: true } : {};
      navigate(from, { state, replace: true });
    } catch {
      setError('Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(prev => !prev);
    setError('');
    setPassword('');
    setConfirm('');
  };

  return (
    <div className={`auth-page ${mounted ? 'auth-page--visible' : ''}`}>
      {/* ── LEFT: IMAGE ── */}
      <div className="auth-hero">
        <img
          src={`${process.env.PUBLIC_URL}/auth-hero.png`}
          alt="Perfume"
          className="auth-hero__img"
        />
        <div className="auth-hero__overlay" />
        <div className="auth-hero__brand">
          <div className="auth-hero__brand-name">PERFUME</div>
          <div className="auth-hero__brand-sub">EXPERIENCE — VIETNAM</div>
          <p className="auth-hero__brand-tagline">
            Crafted with passion.<br />
            Premium fragrances.<br />
            Made for those who feel deeper.
          </p>
        </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div className="auth-form-wrapper">
        <div className="auth-card">
          {/* Brand header */}
          <div className="auth-brand-header">
            <div className="auth-brand-header__name">PERFUME</div>
            <div className="auth-brand-header__sub">EXPERIENCE — VIETNAM</div>
          </div>

          <h2 className="auth-card__title">
            {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </h2>
          <p className="auth-card__subtitle">
            {isRegister
              ? 'Đăng ký để trải nghiệm đầy đủ dịch vụ.'
              : 'Chào mừng trở lại! Vui lòng đăng nhập.'}
          </p>

          {redirectMessage && (
            <div className="auth-redirect-msg">{redirectMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            {/* Username */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-user">Tên đăng nhập</label>
              <div className="auth-input-wrap">
                <FaUser className="auth-input-icon" />
                <input
                  id="auth-user"
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="auth-input"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-pass">Mật khẩu</label>
              <div className="auth-input-wrap">
                <FaLock className="auth-input-icon" />
                <input
                  id="auth-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-toggle-pass"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {isRegister && (
              <div className="auth-field auth-field--animated">
                <label className="auth-label" htmlFor="auth-confirm">Xác nhận mật khẩu</label>
                <div className="auth-input-wrap">
                  <FaLock className="auth-input-icon" />
                  <input
                    id="auth-confirm"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>
            )}

            {/* Strength meter */}
            {isRegister && password.length > 0 && (
              <div className="auth-strength">
                <div className="auth-strength__bar-track">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="auth-strength__bar-segment"
                      style={{
                        background: i < strength ? STRENGTH_COLORS[strength] : '#1e293b',
                        transform: i < strength ? 'scaleX(1)' : 'scaleX(0.4)',
                      }}
                    />
                  ))}
                </div>
                <span className="auth-strength__label" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  {isRegister ? 'Đăng ký' : 'Đăng nhập'}
                  <FaArrowRight className="auth-submit__arrow" />
                </>
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span>{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>
            <button className="auth-toggle__btn" onClick={toggleMode}>
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
