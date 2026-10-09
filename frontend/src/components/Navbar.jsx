import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Package,
  Search,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  LayoutDashboard,
  Sparkles,
  Tv,
  Smartphone,
  Laptop,
  Gamepad2,
  Shirt,
  Footprints,
  Watch,
  ChevronDown,
  Percent,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_CATEGORIES = [
  { name: 'Special Deals', label: '₹1 Flash Deals', icon: Sparkles, highlight: true },
  { name: 'Electronics', label: 'Electronics', icon: Tv },
  { name: 'Mobiles', label: 'Mobiles', icon: Smartphone },
  { name: 'Laptops', label: 'Laptops', icon: Laptop },
  { name: 'Gaming', label: 'Gaming', icon: Gamepad2 },
  { name: 'Fashion', label: 'Fashion', icon: Shirt },
  { name: 'Shoes', label: 'Shoes', icon: Footprints },
  { name: 'Accessories', label: 'Accessories', icon: Watch },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar-header">
      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="container flex-between top-announcement-content">
          <div className="flex-align gap-2">
            <span className="announcement-pill">
              <Sparkles size={12} /> FLASH SALE
            </span>
            <span className="announcement-text">
              Mega Deals Live Now • Up to 70% Off + Free Delivery on Orders above ₹999
            </span>
          </div>
          <div className="top-bar-links flex-align gap-4">
            <Link to="/products?category=Special%20Deals" className="top-bar-link highlight">
              ⚡ ₹1 Special Deals
            </Link>
            <span className="separator">|</span>
            <span className="top-bar-badge">24/7 Verified Support</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon-wrap">
            <ShoppingBag className="logo-icon" size={22} />
          </div>
          <div className="logo-text">
            <span className="brand-title">EKART</span>
            <span className="brand-badge">PREMIUM STORE</span>
          </div>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <input
            type="text"
            placeholder="Search laptops, smartphones, headphones, shoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="nav-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button type="submit" className="nav-search-btn" title="Search catalog">
            <Search size={18} />
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Explore All
          </NavLink>

          {/* Cart with badge */}
          <NavLink to="/cart" className={({ isActive }) => `nav-link cart-link ${isActive ? 'active' : ''}`}>
            <div className="cart-icon-wrapper">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </NavLink>

          {isAuthenticated ? (
            <div className="user-dropdown-container">
              <button
                type="button"
                className="user-profile-trigger"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
              >
                <div className="user-avatar-circle">{getUserInitials()}</div>
                <div className="user-info-text">
                  <span className="user-name-small">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <span className="user-role-label">{user?.role === 'admin' ? 'Admin' : 'Member'}</span>
                </div>
                <ChevronDown size={14} className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <strong>{user?.name || 'User'}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>

                  <Link to="/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  <Link to="/orders" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>

                  <Link to="/admin" className="dropdown-item admin-link" onClick={() => setUserDropdownOpen(false)}>
                    <LayoutDashboard size={16} />
                    <span>Admin Dashboard</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-nav-buttons">
              <Link to="/login" className="btn-secondary-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary-sm">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Category Pills Sub-Bar (Desktop & Tablet) */}
      <div className="navbar-categories-bar">
        <div className="container navbar-categories-container">
          <span className="categories-label">Categories:</span>
          <div className="category-pills-scroll">
            <Link to="/products" className="category-pill-item">
              <span>All Products</span>
            </Link>
            {NAV_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`category-pill-item ${cat.highlight ? 'highlight-pill' : ''}`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
            <button type="submit" className="nav-search-btn">
              <Search size={18} />
            </button>
          </form>

          <div className="mobile-nav-items">
            <div className="mobile-section-title">Navigation</div>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Home
            </NavLink>
            <NavLink to="/products" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              All Products
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/cart" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link flex-between">
                  <span className="flex-align gap-2">
                    <ShoppingCart size={18} /> Shopping Cart
                  </span>
                  {cartCount > 0 && <span className="cart-badge-inline">{cartCount} items</span>}
                </NavLink>
                <NavLink to="/orders" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link flex-align gap-2">
                  <Package size={18} /> Order History
                </NavLink>
                <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link flex-align gap-2">
                  <User size={18} /> My Profile ({user?.name?.split(' ')[0]})
                </NavLink>
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link flex-align gap-2">
                  <LayoutDashboard size={18} /> Admin Dashboard
                </NavLink>
                <button onClick={handleLogout} className="mobile-logout-btn flex-align gap-2">
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary-full">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary-full">
                  Create Account
                </Link>
              </div>
            )}

            <div className="mobile-section-title mt-4">Shop by Category</div>
            <div className="mobile-categories-grid">
              {NAV_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-category-chip"
                  >
                    <Icon size={16} />
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
