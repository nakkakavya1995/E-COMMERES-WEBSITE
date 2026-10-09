import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Tv,
  Smartphone,
  Laptop,
  Gamepad2,
  Shirt,
  Footprints,
  Watch,
  Flame,
  Tag,
  Clock,
  CheckCircle2,
  Star,
  Send,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Special Deals', icon: Sparkles, color: '#f43f5e', desc: '₹1 Flash Deals & Offers', badge: 'HOT' },
  { name: 'Electronics', icon: Tv, color: '#3b82f6', desc: 'Audio, Cameras & 4K Tech', badge: 'POPULAR' },
  { name: 'Mobiles', icon: Smartphone, color: '#10b981', desc: 'Flagships & Smart Tech', badge: 'TOP' },
  { name: 'Laptops', icon: Laptop, color: '#6366f1', desc: 'Ultrabooks & Gaming', badge: 'PRO' },
  { name: 'Gaming', icon: Gamepad2, color: '#8b5cf6', desc: 'Consoles & Gear', badge: 'NEW' },
  { name: 'Fashion', icon: Shirt, color: '#ec4899', desc: 'Designer Apparel & Trends', badge: 'SALE' },
  { name: 'Shoes', icon: Footprints, color: '#f59e0b', desc: 'Sneakers & Casuals', badge: 'TRENDING' },
  { name: 'Accessories', icon: Watch, color: '#06b6d4', desc: 'Watches, Shades & Tech', badge: 'LUXURY' },
];

const FESTIVAL_DEALS = [
  {
    tag: '⚡ LIVE NOW • ₹1 ONLY',
    badgeColor: '#dc2626',
    title: '₹1 Flash Deal',
    subtitle: 'Exclusive Digital Deal & Instant Delivery',
    priceText: 'Flat ₹1.00',
    originalText: '₹999',
    link: '/products?category=Special%20Deals',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
  },
  {
    tag: '🔥 FROM ₹14,499',
    badgeColor: '#ea580c',
    title: 'Top Flagship Mobiles',
    subtitle: 'Galaxy S24, iPhone 16 & 5G Tech',
    priceText: 'Up to 35% OFF',
    originalText: 'Save ₹35,000',
    link: '/products?category=Mobiles',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
  },
  {
    tag: '🏷️ UNDER ₹499',
    badgeColor: '#059669',
    title: 'Sneakers & Casuals',
    subtitle: 'Trending Streetwear & Cushioned Soles',
    priceText: 'Min 50% OFF',
    originalText: 'Limited Stock',
    link: '/products?category=Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    tag: '🎧 BESTSELLER',
    badgeColor: '#7c3aed',
    title: 'Headphones & Audio',
    subtitle: 'Noise Cancelling & 3D Spatial Sound',
    priceText: 'Up to 40% OFF',
    originalText: 'Sony & Bose',
    link: '/products?category=Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch featured
        const featuredRes = await productsAPI.getProducts({ featured: 'true' });
        if (featuredRes.data && featuredRes.data.success) {
          setFeaturedProducts(featuredRes.data.products.slice(0, 4));
        }

        // Fetch latest
        const allRes = await productsAPI.getProducts();
        if (allRes.data && allRes.data.success) {
          setLatestProducts(allRes.data.products.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 4000);
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero Banner */}
      <section className="festive-hero-banner">
        <div className="container festive-hero-container">
          <div className="festive-hero-content">
            <div className="festive-badge">
              <Sparkles size={16} />
              <span>GREAT FESTIVAL SALE • LIVE NOW</span>
            </div>

            <h1 className="festive-hero-title">
              Next-Gen Tech & Premium Style <br />
              <span className="festive-highlight">At Unbeatable Festival Prices</span>
            </h1>

            <p className="festive-hero-desc">
              Grab exclusive <strong className="text-amber-300">₹1 Flash Deals</strong>, save up to 70% on flagship smartphones, high-performance laptops, noise-canceling audio, and designer fashion.
            </p>

            <div className="festive-cta-group">
              <Link to="/products?category=Special%20Deals" className="btn-festive-primary">
                <Zap size={18} />
                <span>Shop ₹1 Flash Deal</span>
              </Link>
              <Link to="/products" className="btn-festive-secondary">
                <span>Browse All Products</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <span className="stat-number">50,000+</span>
                <span className="stat-label">Happy Shoppers</span>
              </div>
              <div className="hero-stat-sep"></div>
              <div className="hero-stat-item">
                <span className="stat-number">100% Genuine</span>
                <span className="stat-label">Brand Direct</span>
              </div>
              <div className="hero-stat-sep"></div>
              <div className="hero-stat-item">
                <span className="stat-number">4.9 ★</span>
                <span className="stat-label">Verified Ratings</span>
              </div>
            </div>

            {/* Special Offer Highlight Strip */}
            <div className="festive-offer-strip">
              <span className="offer-tag">💳 Instant Bank Offer</span>
              <span className="offer-text">10% Instant Discount on Razorpay UPI & Cards • Free Express Delivery</span>
            </div>
          </div>

          <div className="festive-hero-visual">
            <div className="festive-visual-card">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"
                alt="Festive Mega Sale"
                className="festive-card-image"
              />
              <div className="festive-floating-tag">
                <Flame size={20} className="text-amber-400" />
                <div>
                  <strong>₹1 Festive Flash Deals</strong>
                  <span>Instant checkout & fast dispatch</span>
                </div>
              </div>

              <div className="festive-floating-badge-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

     { /* 2. Trust Benefits Bar */}
      <section className="trust-benefits-bar">
        <div className="container trust-benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon bg-emerald-subtle text-emerald">
              <Truck size={22} />
            </div>
            <div>
              <strong>Free Express Shipping</strong>
              <span>Fast 2-4 day dispatch nationwide</span>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon bg-blue-subtle text-blue">
              <RotateCcw size={22} />
            </div>
            <div>
              <strong>7-Day Easy Returns</strong>
              <span>No questions asked replacements</span>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon bg-purple-subtle text-purple">
              <CreditCard size={22} />
            </div>
            <div>
              <strong>Secure Razorpay & COD</strong>
              <span>256-bit encrypted bank checkout</span>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon bg-amber-subtle text-amber">
              <Tag size={22} />
            </div>
            <div>
              <strong>Special ₹1 Deals</strong>
              <span>Exclusive limited inventory deals</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container deals-spotlight-section">
        <div className="spotlight-section-header">
          <div>
            <div className="spotlight-eyebrow">
              <Flame size={16} /> TOP FESTIVAL PICKS
            </div>
            <h2 className="spotlight-title">Handpicked Spotlight Deals</h2>
          </div>
          <Link to="/products" className="view-all-link">
            See all offers <ArrowRight size={16} />
          </Link>
        </div>

        <div className="spotlight-deals-grid">
          {FESTIVAL_DEALS.map((deal, idx) => (
            <Link key={idx} to={deal.link} className="spotlight-card">
              <div className="spotlight-card-header">
                <span className="spotlight-badge" style={{ backgroundColor: deal.badgeColor }}>
                  {deal.tag}
                </span>
                <span className="spotlight-price-pill">{deal.priceText}</span>
              </div>

              <div className="spotlight-img-wrap">
                <img src={deal.image} alt={deal.title} className="spotlight-img" />
              </div>

              <div className="spotlight-card-body">
                <div className="spotlight-card-meta">
                  <span className="deal-original-text">{deal.originalText}</span>
                </div>
                <h3 className="spotlight-card-title">{deal.title}</h3>
                <p className="spotlight-card-sub">{deal.subtitle}</p>
                <span className="spotlight-cta">
                  Explore Deals <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <span className="section-tag">Explore Departments</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Discover high-rated products curated across our top categories</p>
          </div>
          <Link to="/products" className="view-all-link">
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <div className="category-card-top">
                  <div className="category-icon-wrap" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    <Icon size={26} />
                  </div>
                  <span className="category-badge-pill" style={{ color: cat.color }}>
                    {cat.badge}
                  </span>
                </div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.desc}</p>
                <div className="category-hover-cta">
                  <span>Browse Products</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Products Section */}
      <section className="featured-section container">
        <div className="section-header">
          <div>
            <span className="section-tag">Handpicked for You</span>
            <h2 className="section-title">Trending & Featured Products</h2>
            <p className="section-subtitle">Top-rated items loved by thousands of verified customers</p>
          </div>
          <Link to="/products" className="view-all-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-loading">
            <div className="spinner"></div>
            <p>Loading curated products...</p>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Mid-Page Festive Promo Banner */}
      <section className="container">
        <div className="festive-mid-banner">
          <div className="mid-banner-text">
            <div className="flex-align gap-2 mb-2">
              <span className="mid-tag">Special Limited Deal</span>
              <span className="timer-pill flex-align gap-1">
                <Clock size={13} /> Limited Stock Available
              </span>
            </div>
            <h2>Grab The Exclusive ₹1 Digital Token Deal</h2>
            <p>
              Experience our lightning-fast checkout with Razorpay and instant order confirmation. Claim this limited-time promotional deal before stocks run out.
            </p>
            <div className="mid-features-row">
              <span className="mid-feat-item"><CheckCircle2 size={16} /> Instant Order Confirmation</span>
              <span className="mid-feat-item"><CheckCircle2 size={16} /> Free Priority Dispatch</span>
              <span className="mid-feat-item"><CheckCircle2 size={16} /> Razorpay Protected</span>
            </div>
            <div className="mid-btn-wrap">
              <Link to="/products?category=Special%20Deals" className="btn-mid-deal">
                Grab ₹1 Deal Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Latest Arrivals Section */}
      <section className="latest-section container">
        <div className="section-header">
          <div>
            <span className="section-tag">New & Trending</span>
            <h2 className="section-title">Latest Arrivals</h2>
            <p className="section-subtitle">Freshly added inventory across electronics, fashion, and tech</p>
          </div>
          <Link to="/products" className="view-all-link">
            Explore Full Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-loading">
            <div className="spinner"></div>
            <p>Loading latest products...</p>
          </div>
        ) : (
          <div className="product-grid">
            {latestProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 8. Newsletter & App Strip */}
      <section className="container newsletter-section">
        <div className="newsletter-card">
          <div className="newsletter-content">
            <span className="newsletter-badge">STAY UPDATED</span>
            <h3 className="newsletter-title">Subscribe for Exclusive Flash Offers & Secret Deals</h3>
            <p className="newsletter-desc">
              Be the first to know when ₹1 deals drop and get secret discount coupons sent directly to your inbox.
            </p>

            {newsletterSubscribed ? (
              <div className="newsletter-success flex-align gap-2">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <span>Thank you! You have been subscribed for exclusive flash sales.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  <span>Subscribe</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
