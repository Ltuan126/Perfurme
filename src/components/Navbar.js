import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import API_BASE_URL from '../config/api';
import { loadUserLoyalty } from '../utils/loyalty';
import { useAuth } from '../context/AuthContext';


export default function Navbar({ cartCount }) {
  const { user, username: currentUser, isAdmin, logout, authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [loyalty, setLoyalty] = useState({ points: 0, tier: null });

  const initials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase() || name.slice(0, 2).toUpperCase();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  // Close user menu on outside click or Escape key
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDocClick = (e) => {
      const target = e.target;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (!currentUser) return;
    authFetch(`${API_BASE_URL}/api/me`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          setLoyalty({ points: data.data.points || 0, tier: data.data.tier || 'None' });
        }
      })
      .catch(() => {
        const l = loadUserLoyalty(currentUser);
        setLoyalty(l);
      });
    if (!user) {
      const l = loadUserLoyalty(currentUser);
      setLoyalty(l);
    }
  }, [currentUser, authFetch, user]);

  const navLink = "font-mono uppercase text-[11.5px] tracking-[0.14em] text-ink/80 hover:text-ink transition-colors";

  return (
    <nav className="w-full sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative" style={{ minHeight: 76 }}>
        <Link to="/" className="font-serif text-ink" style={{ fontSize: 24, letterSpacing: '0.4em' }}>
          SILLAGE
        </Link>

        <button
          className="md:hidden text-ink text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        <ul className="hidden md:flex space-x-7 items-center">
          <li>
            <Link to="/" className={navLink}>Trang chủ</Link>
          </li>
          <li>
            <Link to="/products" className={navLink}>Nước hoa</Link>
          </li>
          <li>
            <Link to="/quiz" className={navLink}>Quiz</Link>
          </li>
          <li>
            <Link to="/about" className={navLink}>Câu chuyện</Link>
          </li>
          <li>
            <Link to="/contact" className={navLink}>Liên hệ</Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link to="/admin" className={navLink}>Sản phẩm</Link>
              </li>
              <li>
                <Link to="/admin/orders" className={navLink}>Đơn hàng</Link>
              </li>
            </>
          )}
          <li className="relative">
            <Link to="/cart" className={`${navLink} flex items-center gap-1.5`}>
              <FiShoppingCart size={15} />
              Giỏ
              {cartCount > 0 && (
                <span className="ml-0.5 font-mono text-[10.5px]" style={{ color: 'var(--accent)' }}>
                  ({cartCount})
                </span>
              )}
            </Link>
          </li>
        </ul>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center border-b border-hairline px-1 py-1 ml-4"
        >
          <input
            type="text"
            placeholder="Tìm nước hoa..."
            className="outline-none w-40 lg:w-56 text-sm text-ink placeholder-label bg-transparent font-light"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="text-label hover:text-ink transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>
        </form>

        {/* User section (desktop) */}
        <div className="hidden md:flex items-center ml-5 relative">
          {currentUser ? (
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1 hover:opacity-70 transition"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono border border-hairline text-ink">
                  {initials(currentUser)}
                </div>
                <span className="max-w-[100px] truncate font-mono text-[11px] uppercase tracking-[0.1em] text-ink">{currentUser}</span>
                {isAdmin && (
                  <span className="px-2 py-[2px] font-mono text-[9px] uppercase tracking-wider border border-hairline text-label">Admin</span>
                )}
                <FiChevronDown className={`transition text-label ${userMenuOpen ? 'rotate-180' : ''}`} size={13} />
              </button>
              {userMenuOpen && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-60 z-50 bg-cream border border-hairline shadow-lg">
                  <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-label space-y-1 border-b border-hairline">
                    <div>Đăng nhập với</div>
                    <div className="text-ink text-[12px] font-normal normal-case tracking-normal truncate flex items-center gap-2">{currentUser} {isAdmin && <span className="px-2 py-[1px] text-[9px] uppercase tracking-wider border border-hairline text-label">Admin</span>}</div>
                    {loyalty?.tier && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-[1px] border border-hairline" style={{ color: 'var(--accent)' }}>{loyalty.tier}</span>
                        <span className="text-label normal-case tracking-normal">Điểm: <span className="text-ink">{loyalty.points}</span></span>
                      </div>
                    )}
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link to="/profile" className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-surface font-mono text-[11px] uppercase tracking-wider text-ink" onClick={() => setUserMenuOpen(false)}>
                        <FiUser className="text-label" size={13} /> Hồ sơ
                      </Link>
                    </li>
                    {isAdmin && (
                      <>
                        <li>
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface font-mono text-[11px] uppercase tracking-wider text-ink">
                            Quản lý sản phẩm
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface font-mono text-[11px] uppercase tracking-wider text-ink">
                            Quản lý đơn hàng
                          </Link>
                        </li>
                      </>
                    )}
                    <li>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-surface font-mono text-[11px] uppercase tracking-wider text-red-700">
                        <FiLogOut size={13} /> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:opacity-70 transition">Đăng nhập</Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <ul className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-hairline py-6 flex flex-col items-center space-y-4 z-20">
          <li>
            <Link to="/" className={navLink} onClick={() => setIsOpen(false)}>Trang chủ</Link>
          </li>
          <li>
            <Link to="/products" className={navLink} onClick={() => setIsOpen(false)}>Nước hoa</Link>
          </li>
          <li>
            <Link to="/quiz" className={navLink} onClick={() => setIsOpen(false)}>Quiz</Link>
          </li>
          <li>
            <Link to="/about" className={navLink} onClick={() => setIsOpen(false)}>Câu chuyện</Link>
          </li>
          <li>
            <Link to="/contact" className={navLink} onClick={() => setIsOpen(false)}>Liên hệ</Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link to="/admin" className={navLink} onClick={() => setIsOpen(false)}>Quản lý sản phẩm</Link>
              </li>
              <li>
                <Link to="/admin/orders" className={navLink} onClick={() => setIsOpen(false)}>Đơn hàng</Link>
              </li>
            </>
          )}
          <li>
            <Link to="/cart" className={navLink} onClick={() => setIsOpen(false)}>
              Giỏ hàng ({cartCount})
            </Link>
          </li>
          {currentUser && (
            <li className="pt-2 flex flex-col items-center gap-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink flex items-center gap-2">{currentUser} {isAdmin && <span className="px-2 py-[1px] text-[9px] border border-hairline text-label">Admin</span>}</div>
              <Link to="/profile" className="btn-outline" onClick={() => setIsOpen(false)}>
                Hồ sơ
              </Link>
              <button onClick={() => { setIsOpen(false); logout(); }} className="btn-outline">
                Đăng xuất
              </button>
            </li>
          )}
          {!currentUser && (
            <li className="pt-2">
              <Link to="/login" className="btn-outline" onClick={() => setIsOpen(false)}>
                Đăng nhập
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
