import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export default function Navbar({ cartCount, onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <nav className="navbar relative">
      <h1 className="navbar-title">Perfume Shop</h1>

      <button
        className="navbar-toggle md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      <ul className="navbar-list hidden md:flex">
        <li>
          <Link to="/" className="navbar-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/products" className="navbar-link">
            Products
          </Link>
        </li>
        <li>
          <Link to="/about" className="navbar-link">
            About
          </Link>
        </li>
        <li>
          <Link to="/contact" className="navbar-link">
            Contact
          </Link>
        </li>
        <li className="relative">
          <Link to="/cart" className="navbar-link flex items-center gap-1">
            <FiShoppingCart />
            Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </li>
      </ul>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center bg-white border border-gray-300 rounded-full px-4 py-1 shadow-sm focus-within:ring-2 focus-within:ring-pink-500 transition-all duration-200 ml-4"
      >
        <input
          type="text"
          placeholder="Search perfumes..."
          className="outline-none w-48 md:w-64 text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 text-pink-500 hover:text-pink-600"
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

      {/* Mobile menu */}
      {isOpen && (
        <ul className="navbar-mobile">
          <li>
            <Link to="/" className="navbar-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="navbar-link">
              Products
            </Link>
          </li>
          <li>
            <Link to="/about" className="navbar-link">
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="navbar-link">
              Contact
            </Link>
          </li>
          <li>
            <Link to="/cart" className="navbar-link">
              Cart ({cartCount})
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
