import React, { useState } from 'react';
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


export default function App() {
  const [cartItems, setCartItems] = useState([]);
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

  // Nếu chưa đăng nhập user thì chỉ cho vào trang đăng nhập/đăng ký
  if (!user) {
    return <UserAuth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
  <Navbar cartCount={cartItems.length} onSearch={handleSearch} isAdmin={isAdmin} onLogout={handleLogout} currentUser={user} />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={item => setCartItems(prev => [...prev, item])} />} />
          <Route path="/cart" element={<Cart items={cartItems} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={isAdmin ? <AdminProductManager /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} />
          <Route path="/admin/orders" element={isAdmin ? <AdminOrders /> : <AdminLogin onLogin={() => setIsAdmin(true)} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
