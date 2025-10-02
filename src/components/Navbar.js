import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";


export default function Navbar({ cartCount, onSearch, isAdmin, onLogout, currentUser }) {
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
    return (first + last).toUpperCase() || name.slice(0,2).toUpperCase();
  };

  const handleSearch = (e) => {
    e.preventDefault();
  if (onSearch) onSearch(query);
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
    const token = localStorage.getItem('auth_token');
    if (!currentUser) return;
    if (token) {
      fetch('/api/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setLoyalty({ points: data.points || 0, tier: data.tier || 'None' }); })
        .catch(() => {
          try {
            const { loadUserLoyalty } = require('../utils/loyalty');
            const l = loadUserLoyalty(currentUser);
            setLoyalty(l);
          } catch {}
        });
    } else {
      try {
        const { loadUserLoyalty } = require('../utils/loyalty');
        const l = loadUserLoyalty(currentUser);
        setLoyalty(l);
      } catch {}
    }
  }, [currentUser]);

  return (
    <nav className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-700/95 shadow-md border-b border-white/20 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between relative" style={{ minHeight: 64 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Perfume Shop
        </h1>

        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        <ul className="hidden md:flex space-x-6 items-center">
        <li>
          <Link to="/" className="text-white hover:text-cyan-200 font-medium transition">Home</Link>
        </li>
        <li>
          <Link to="/products" className="text-white hover:text-cyan-200 font-medium transition">Products</Link>
        </li>
        <li>
          <Link to="/quiz" className="text-white hover:text-cyan-200 font-medium transition">Quiz</Link>
        </li>
        <li>
          <Link to="/about" className="text-white hover:text-cyan-200 font-medium transition">About</Link>
        </li>
        <li>
          <Link to="/contact" className="text-white hover:text-cyan-200 font-medium transition">Contact</Link>
        </li>
          {isAdmin && (
            <li>
              <Link to="/admin/orders" className="text-white hover:text-cyan-200 font-medium transition">Orders</Link>
            </li>
          )}
        <li className="relative">
          <Link to="/cart" className="flex items-center gap-1 text-white hover:text-cyan-200 font-medium transition">
            <FiShoppingCart />
            Cart
            {cartCount > 0 && (
              <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </li>
        </ul>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-white/85 border border-cyan-200 rounded-full px-4 py-1 shadow focus-within:ring-2 focus-within:ring-cyan-400 ml-4"
        >
          <input
            type="text"
            placeholder="Search perfumes..."
            className="outline-none w-48 md:w-64 text-sm text-blue-700 placeholder-blue-400 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 text-cyan-600 hover:text-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </button>
        </form>

        {/* User section (desktop) */}
        <div className="hidden md:flex items-center ml-4 relative">
          {currentUser ? (
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white transition border border-white/20"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-900/80 flex items-center justify-center text-[11px] font-bold text-cyan-200">
                      {initials(currentUser)}
                    </div>
                  </div>
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium">{currentUser}</span>
                {isAdmin && (
                  <span className="ml-1 px-2 py-[2px] rounded-full text-[10px] font-semibold bg-white/15 border border-white/25 text-cyan-100">Admin</span>
                )}
                <FiChevronDown className={`transition ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-56 z-50 rounded-2xl overflow-hidden bg-white/95 text-slate-800 shadow-xl border border-slate-200 backdrop-blur">
                  <div className="px-4 py-3 text-xs text-slate-500 space-y-1">
                    <div>Signed in as</div>
                    <div className="text-slate-900 text-sm font-semibold truncate flex items-center gap-2">{currentUser} {isAdmin && <span className="px-2 py-[1px] rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Admin</span>}</div>
                    {loyalty?.tier && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="px-2 py-[1px] rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">{loyalty.tier}</span>
                        <span className="text-slate-500">Points: <span className="font-semibold text-slate-700">{loyalty.points}</span></span>
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-slate-200" />
                  <ul className="py-1">
                    <li>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-100 text-sm">
                        <FiUser className="text-slate-500" /> Profile (soon)
                      </button>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-sm">
                          Orders admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-red-50 text-sm text-red-600">
                        <FiLogOut /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link to="/" className="text-white/90 hover:text-white text-sm">Sign in</Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <ul className="absolute top-full left-0 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-700 shadow-lg py-4 flex flex-col items-center space-y-3 z-20 animate-fade-in">
          <li>
            <Link to="/" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
              Products
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin/orders" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
                Orders
              </Link>
            </li>
          )}
          <li>
            <Link to="/cart" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
              Cart ({cartCount})
            </Link>
          </li>
          {currentUser && (
            <li className="pt-2">
              <div className="text-white/80 text-sm mb-1 flex items-center gap-2">{currentUser} {isAdmin && <span className="px-2 py-[1px] rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/25">Admin</span>}</div>
              <button onClick={() => { setIsOpen(false); onLogout && onLogout(); }} className="px-4 py-2 rounded-full bg-white/15 text-white hover:bg-white/25 border border-white/25 text-sm">
                Logout
              </button>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
