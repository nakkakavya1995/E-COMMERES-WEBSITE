import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Check,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Zap,
  Lock,
  ChevronRight,
  Package,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'delivery'
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await productsAPI.getProductById(id);
        if (res.data && res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setQuantity(1);

          // Fetch related products in the same category
          if (prod.category) {
            try {
              const relRes = await productsAPI.getProducts({ category: prod.category });
              if (relRes.data && relRes.data.success) {
                setRelatedProducts(
                  relRes.data.products.filter((p) => (p.id || p._id) !== (prod.id || prod._id)).slice(0, 4)
                );
              }
            } catch (relErr) {
              console.warn('Failed to fetch related products:', relErr);
            }
          }
        } else {
          setError(res.data?.message || 'Product not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (product && val > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(val);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { message: 'Please login to add products to your cart', from: { pathname: `/products/${id}` } },
      });
      return false;
    }

    if (!product || product.stock <= 0) return false;

    if (quantity > product.stock) {
      setFeedback({ type: 'error', message: `Only ${product.stock} units available in stock.` });
      return false;
    }

    try {
      setAdding(true);
      setFeedback({ type: '', message: '' });
      const result = await addToCart(product.id, quantity);
      if (result.success) {
        setFeedback({ type: 'success', message: `${quantity} × ${product.name} added to your cart!` });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
        return true;
      } else {
        setFeedback({ type: 'error', message: result.message });
        return false;
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to add item to cart' });
      return false;
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { message: 'Please login to purchase items', from: { pathname: `/products/${id}` } },
      });
      return;
    }

    setBuyingNow(true);
    const added = await handleAddToCart();
    setBuyingNow(false);
    if (added) {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex-center flex-column gap-3">
        <div className="spinner"></div>
        <p className="text-muted">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-20 text-center">
        <div className="empty-icon-wrap mb-4">
          <AlertCircle size={48} className="text-rose-500" />
        </div>
        <h2>{error || 'Product Not Found'}</h2>
        <p className="text-muted mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn-primary-sm">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isSpecial = product.category === 'Special Deals' || product.price <= 10;
  const originalPrice = isSpecial
    ? 999
    : Math.round(product.price * (product.price > 10000 ? 1.2 : 1.35));
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="container product-details-page">
      /* Breadcrumb Navigation */
      <nav className="details-breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products">Products</Link>
        <ChevronRight size={14} />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <ChevronRight size={14} />
        <span className="current-crumb">{product.name}</span>
      </nav>

      <div className="product-details-grid">
        /* Product Image Column */
        <div className="details-image-column">
          <div className="details-image-card">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'}
              alt={product.name}
              className="details-main-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
              }}
            />
            <div className="details-img-badges">
              <span className="details-category-badge">{product.category}</span>
              {discountPercent > 0 && (
                <span className="details-discount-badge">
                  {isSpecial ? '⚡ SPECIAL FLASH DEAL' : `${discountPercent}% OFF`}
                </span>
              )}
            </div>
          </div>
        </div>

        /* Product Details Info Column */
        <div className="details-info-column">
          <div className="details-brand-strip flex-between">
            <span className="details-brand-pill">VERIFIED BRAND DIRECT</span>
            <div className="product-rating-row">
              <div className="rating-pill">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>4.8</span>
              </div>
              <span className="rating-count">(248 Customer Reviews)</span>
            </div>
          </div>

          <h1 className="details-title">{product.name}</h1>

          /* Pricing Box */
          <div className="details-price-box">
            <div className="price-primary-row flex-align gap-3">
              <span className="details-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {originalPrice > product.price && (
                <span className="details-mrp">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
              )}
              {discountPercent > 0 && (
                <span className="details-save-badge">
                  Save ₹{Number(originalPrice - product.price).toLocaleString('en-IN')} ({discountPercent}% OFF)
                </span>
              )}
            </div>
            <span className="tax-inclusive-tag">Inclusive of all taxes • Free express shipping</span>
          </div>

          {/* Stock Status Indicator */}
          <div className="details-stock-status-row">
            {isOutOfStock ? (
              <span className="stock-pill out-of-stock">
                <span className="stock-dot"></span> Currently Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="stock-pill low-stock">
                <span className="stock-dot pulse"></span> Hurry, only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="stock-pill in-stock">
                <span className="stock-dot"></span> In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          /* Feedback alerts */
          {feedback.message && (
            <div className={`details-alert-banner ${feedback.type === 'success' ? 'success' : 'error'}`}>
              {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          /* Purchase Controls */
          <div className="details-purchase-controls">
            <div className="quantity-control-group">
              <label className="quantity-label">Quantity</label>
              <div className="quantity-stepper">
                <button
                  type="button"
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="stepper-btn"
                  title="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityInputChange}
                  disabled={isOutOfStock}
                  className="stepper-input"
                />
                <button
                  type="button"
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="stepper-btn"
                  title="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="details-action-buttons">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`btn-add-to-cart-large ${isOutOfStock ? 'disabled' : ''}`}
              >
                {adding ? (
                  <>
                    <span className="btn-spinner"></span> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>{isOutOfStock ? 'Sold Out' : `Add to Cart`}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || buyingNow}
                className="btn-buy-now-large"
              >
                {buyingNow ? (
                  <>
                    <span className="btn-spinner"></span> Processing...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Buy Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          /* Perks & Guarantees */
          <div className="details-perks-box">
            <div className="perk-item">
              <Truck size={22} className="perk-icon" />
              <div>
                <strong>Express Delivery</strong>
                <p>Dispatched within 24 hours with tracking</p>
              </div>
            </div>
            <div className="perk-item">
              <ShieldCheck size={22} className="perk-icon" />
              <div>
                <strong>1 Year Manufacturer Warranty</strong>
                <p>Authorized service center support</p>
              </div>
            </div>
            <div className="perk-item">
              <RotateCcw size={22} className="perk-icon" />
              <div>
                <strong>7-Day Replacement Guarantee</strong>
                <p>Hassle-free instant resolution</p>
              </div>
            </div>
            <div className="perk-item">
              <Lock size={22} className="perk-icon" />
              <div>
                <strong>Razorpay Secure Checkout</strong>
                <p>256-bit SSL encrypted bank transaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      /* Tabs Section: Overview, Specifications, Delivery */
      <div className="details-tabs-container">
        <div className="details-tab-nav">
          <button
            className={`details-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Product Overview
          </button>
          <button
            className={`details-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Specifications & Features
          </button>
          <button
            className={`details-tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            Shipping & Return Policy
          </button>
        </div>

        <div className="details-tab-content">
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h3>About this item</h3>
              <p className="tab-lead-desc">{product.description}</p>
              <div className="tab-bullet-list">
                <div className="bullet-point">
                  <Check size={16} /> <span>100% Genuine, brand-sourced original inventory.</span>
                </div>
                <div className="bullet-point">
                  <Check size={16} /> <span>Tested and verified for maximum performance and durability.</span>
                </div>
                <div className="bullet-point">
                  <Check size={16} /> <span>Carefully packed with multi-layer bubble wrap protection.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="tab-pane">
              <h3>Technical Specifications</h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td>Product Name</td>
                    <td>{product.name}</td>
                  </tr>
                  <tr>
                    <td>Category</td>
                    <td>{product.category}</td>
                  </tr>
                  <tr>
                    <td>Stock Status</td>
                    <td>{product.stock > 0 ? `${product.stock} units ready to ship` : 'Out of Stock'}</td>
                  </tr>
                  <tr>
                    <td>Warranty</td>
                    <td>1 Year Domestic Brand Warranty</td>
                  </tr>
                  <tr>
                    <td>Payment Methods</td>
                    <td>UPI, Debit/Credit Card, Net Banking, Razorpay, COD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="tab-pane">
              <h3>Shipping, Return & Replacement</h3>
              <div className="delivery-info-grid">
                <div className="delivery-card">
                  <h4>Standard Express Shipping</h4>
                  <p>Estimated dispatch: Within 24-48 business hours. Delivery timelines range from 2 to 4 days across all major pin codes.</p>
                </div>
                <div className="delivery-card">
                  <h4>7-Day Return Guarantee</h4>
                  <p>If you receive a defective or damaged product, you can initiate a return or replacement directly from your Orders page.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      /* Related Products Recommendation */
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="section-header">
            <div>
              <span className="section-tag">Similar Items</span>
              <h2 className="section-title">You Might Also Like</h2>
            </div>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="view-all-link">
              View All {product.category} <ChevronRight size={16} />
            </Link>
          </div>

          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
