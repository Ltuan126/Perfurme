import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import { products as initialProducts } from './data/products';
import About from './components/About';
export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [searchResults, setSearchResults] = useState(initialProducts);

  const handleSearch = (query) => {
    const filtered = initialProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => [...prev, item]);
  };

  return (
    <BrowserRouter>
      <Navbar cartCount={cartItems.length} onSearch={handleSearch} />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<ProductList products={searchResults} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={handleAddToCart} />} />
          <Route path="/cart" element={<Cart items={cartItems} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
