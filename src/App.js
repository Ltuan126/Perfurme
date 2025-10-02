import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminProductManager from './components/AdminProductManager';
import AdminOrders from './components/AdminOrders';
import UserAuth from './components/UserAuth';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import About from './components/About';
import Contact from './components/Contact';
import Quiz from './components/Quiz';


export default function App() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('user_role') === 'admin');
  const [user, setUser] = useState(localStorage.getItem('user_login'));

  const handleLogin = (username) => {
    setUser(username);
    setIsAdmin(localStorage.getItem('user_role') === 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_login');
    localStorage.removeItem('user_role');
    setUser(null);
    setIsAdmin(false);
  };

  // Keep a no-op search handler for Navbar compatibility; navigation is handled there
  const handleSearch = () => {};

  // Helper to build a unique cart key including size label
  const keyOf = (p) => {
    if (!p) return undefined;
    const base = p._id || p.id;
    const size = p.sizeLabel || p.size;
    return size ? `${base}::${size}` : base;
  };

  // Persist cart to localStorage
  useEffect(() => {
    try { localStorage.setItem('cart_items', JSON.stringify(cartItems)); } catch {}
  }, [cartItems]);

  // Derived total quantity for Navbar badge
  const cartCount = useMemo(() => cartItems.reduce((n, item) => n + (Number(item.quantity) || 1), 0), [cartItems]);

  // Add to cart: increment if exists
  const addToCart = (product, qty = 1, opts = {}) => {
    const sizeLabel = opts.sizeLabel || product.sizeLabel;
    const price = Number(opts.price ?? product.price);
    const draft = { ...product, sizeLabel, price };
    const key = keyOf(draft);
    if (!key) return;
    setCartItems(prev => {
      const idx = prev.findIndex(i => keyOf(i) === key);
      if (idx >= 0) {
        const next = [...prev];
        const currentQty = Number(next[idx].quantity) || 1;
        next[idx] = { ...next[idx], quantity: currentQty + (Number(qty) || 1) };
        return next;
      }
      return [...prev, { ...draft, quantity: Number(qty) || 1, cartKey: key }];
    });
  };

  const updateCartQty = (key, qty) => {
    setCartItems(prev => {
      const nextQty = Math.max(0, Number(qty) || 0);
      const next = prev.map(it => (keyOf(it) === key ? { ...it, quantity: nextQty || 1 } : it));
      // Remove if 0 explicitly requested
      if (nextQty === 0) {
        return prev.filter(it => keyOf(it) !== key);
      }
      return next;
    });
  };

  const removeFromCart = (key) => {
    setCartItems(prev => prev.filter(it => keyOf(it) !== key));
  };

  // Nếu chưa đăng nhập user thì chỉ cho vào trang đăng nhập/đăng ký
  if (!user) {
    return <UserAuth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
  <Navbar cartCount={cartCount} onSearch={handleSearch} isAdmin={isAdmin} onLogout={handleLogout} currentUser={user} />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart items={cartItems} onQtyChange={updateCartQty} onRemove={removeFromCart} />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={isAdmin ? <AdminProductManager /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} />
          <Route path="/admin/orders" element={isAdmin ? <AdminOrders /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
