import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  AlertCircle,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Sparkles,
  Tv,
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  Watch,
  Gamepad2,
  Tag,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES_INFO = [
  { name: 'All', icon: Tag, desc: 'Browse our entire collection of verified products' },
  { name: 'Special Deals', icon: Sparkles, desc: '₹1 Flash Deals, festival tokens & exclusive limited offers' },
  { name: 'Electronics', icon: Tv, desc: 'Premium headphones, studio speakers & 4K mirrorless cameras' },
  { name: 'Mobiles', icon: Smartphone, desc: 'Flagship titanium smartphones, 5G devices & smart displays' },
  { name: 'Laptops', icon: Laptop, desc: 'High-speed ultrabooks, creator laptops & gaming workstations' },
  { name: 'Gaming', icon: Gamepad2, desc: 'Next-gen consoles, wireless controllers & gamer accessories' },
  { name: 'Fashion', icon: Shirt, desc: 'Curated menswear, streetwear, hoodies & seasonal trends' },
  { name: 'Shoes', icon: Footprints, desc: 'Sport running shoes, comfortable sneakers & casual footwear' },
  { name: 'Accessories', icon: Watch, desc: 'Luxury chronograph watches, polarized shades & leather gear' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹500', min: '', max: '500' },
  { label: '₹500 - ₹5,000', min: '500', max: '5000' },
  { label: '₹5,000 - ₹30,000', min: '5000', max: '30000' },
  { label: '₹30,000+', min: '30000', max: '' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL query or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price_low' | 'price_high' | 'name'

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL searchParams change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    const urlMinPrice = searchParams.get('min_price') || '';
    const urlMaxPrice = searchParams.get('max_price') || '';

    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const res = await productsAPI.getProducts(params);
      if (res.data && res.data.success) {
        setProducts(res.data.products);
      } else {
        setError(res.data?.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading products from server');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    const newParams = {};
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    if (selectedCategory && selectedCategory !== 'All') newParams.category = selectedCategory;
    if (minPrice) newParams.min_price = minPrice;
    if (maxPrice) newParams.max_price = maxPrice;

    setSearchParams(newParams);
    setMobileFilterOpen(false);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    const newParams = {};
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    if (categoryName !== 'All') newParams.category = categoryName;
    if (minPrice) newParams.min_price = minPrice;
    if (maxPrice) newParams.max_price = maxPrice;
    setSearchParams(newParams);
  };

  const handlePresetSelect = (preset) => {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
    const newParams = {};
    if (searchTerm.trim()) newParams.search = searchTerm.trim();
    if (selectedCategory !== 'All') newParams.category = selectedCategory;
    if (preset.min) newParams.min_price = preset.min;
    if (preset.max) newParams.max_price = preset.max;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    setSearchParams({});
  };

  // Client-side sorting for snappy UX
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price_low') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy]);

  const currentCategoryInfo = CATEGORIES_INFO.find((c) => c.name === selectedCategory) || CATEGORIES_INFO[0];
  const CategoryIcon = currentCategoryInfo.icon;

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'All' ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <div className="container products-page">
      {/* Category Banner Header */}
      <div className="category-hero-header">
        <div className="category-hero-content">
          <div className="category-hero-badge flex-align gap-2">
            <CategoryIcon size={18} />
            <span>{selectedCategory === 'All' ? 'Complete Collection' : 'Department'}</span>
          </div>
          <h1 className="category-hero-title">
            {selectedCategory === 'All' ? 'All Products & Deals' : selectedCategory}
          </h1>
          <p className="category-hero-desc">{currentCategoryInfo.desc}</p>
        </div>
        <div className="category-hero-stat">
          <span className="stat-count">{products.length}</span>
          <span className="stat-sub">Products Available</span>
        </div>
      </div>

      {/* Horizontal Category Nav Pills */}
      <div className="products-category-pills-bar">
        {CATEGORIES_INFO.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategorySelect(cat.name)}
              className={`cat-pill-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Filter Toggle, Active Tags, Sort By */}
      <div className="products-controls-bar">
        <div className="controls-left">
          <button
            className="mobile-filter-btn"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal size={17} /> Filters
          </button>

          {/* Active filter chips */}
          <div className="active-filters-chips">
            {selectedCategory !== 'All' && (
              <span className="filter-chip">
                Category: <strong>{selectedCategory}</strong>
                <button onClick={() => handleCategorySelect('All')}><X size={12} /></button>
              </span>
            )}
            {searchTerm && (
              <span className="filter-chip">
                Search: "<strong>{searchTerm}</strong>"
                <button onClick={() => { setSearchTerm(''); const p = { ...Object.fromEntries(searchParams) }; delete p.search; setSearchParams(p); }}><X size={12} /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="filter-chip">
                Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); const p = { ...Object.fromEntries(searchParams) }; delete p.min_price; delete p.max_price; setSearchParams(p); }}><X size={12} /></button>
              </span>
            )}
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="clear-all-chips">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Sort selector */}
        <div className="controls-right flex-align gap-2">
          <ArrowUpDown size={15} className="text-gray-400" />
          <span className="sort-label">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="featured">Featured Deals</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="products-layout">
        {/* Filter Sidebar */}
        <aside className={`products-filter-sidebar ${mobileFilterOpen ? 'open' : ''}`}>
          <div className="filter-card">
            <div className="filter-header">
              <span className="flex-align gap-2">
                <Filter size={18} /> Filter Results
              </span>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="btn-reset-filters">
                  <RotateCcw size={14} /> Reset
                </button>
              )}
            </div>

            <form onSubmit={handleApplyFilter} className="filter-form">
              {/* Search input in filter */}
              <div className="filter-section">
                <label className="filter-label">Keyword Search</label>
                <div className="filter-input-wrap">
                  <Search size={16} className="filter-input-icon" />
                  <input
                    type="text"
                    placeholder="Search name, specifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-text-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="filter-clear-input"
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="filter-section">
                <label className="filter-label">Price Range (₹)</label>
                <div className="price-inputs-row">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                    min="0"
                  />
                  <span className="price-divider">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                    min="0"
                  />
                </div>

                {/* Price Presets */}
                <div className="price-presets-wrap">
                  {PRICE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className={`preset-btn ${minPrice === p.min && maxPrice === p.max ? 'active' : ''}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-actions-row">
                <button type="submit" className="btn-apply-filter">
                  Apply Filters
                </button>
                {hasActiveFilters && (
                  <button type="button" onClick={handleResetFilters} className="btn-secondary-sm">
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="products-grid-container">
          {error && (
            <div className="products-error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="products-loading-state">
              <div className="spinner"></div>
              <p>Curating top matching products...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="empty-products-state">
              <div className="empty-icon-wrap">
                <Search size={40} />
              </div>
              <h3>No matching products found</h3>
              <p>We couldn't find items matching your filters. Try clearing your filters or selecting another category.</p>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="btn-primary-sm mt-4">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
