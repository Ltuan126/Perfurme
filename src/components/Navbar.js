import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";


export default function Navbar({ cartCount, onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
  if (onSearch) onSearch(query);
  const q = query.trim();
  navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-700/95 shadow-md border-b border-white/20">
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
          <Link to="/about" className="text-white hover:text-cyan-200 font-medium transition">About</Link>
        </li>
        <li>
          <Link to="/contact" className="text-white hover:text-cyan-200 font-medium transition">Contact</Link>
        </li>
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
          <li>
            <Link to="/cart" className="text-white hover:text-cyan-200 font-medium text-lg" onClick={() => setIsOpen(false)}>
              Cart ({cartCount})
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
