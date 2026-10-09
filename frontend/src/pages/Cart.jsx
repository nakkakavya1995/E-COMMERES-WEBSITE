import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  Check,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, actionLoading } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleDecrease = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      if (window.confirm('Remove this item from your shopping cart?')) {
        await removeFromCart(productId);
      }
    } else {
      await updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleIncrease = async (productId, currentQuantity) => {
    await updateQuantity(productId, currentQuantity + 1);
  };

  const handleRemove = async (productId, itemName) => {
    if (window.confirm(`Are you sure you want to remove "${itemName}" from your cart?`)) {
      await removeFromCart(productId);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      await clearCart();
      setCouponApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'EKART10' || cleanCode === 'FESTIVE') {
      const discount = Math.round((cart?.total || 0) * 0.1);
      setDiscountAmount(discount);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try EKART10 or FESTIVE for 10% off!');
      setCouponApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError('');
  };

  const items = cart?.items || [];
  const totalItems = cart?.total_items || 0;
  const rawTotalPrice = cart?.total || 0;
  const finalPrice = Math.max(0, rawTotalPrice - discountAmount);

  // Free shipping logic
  const freeShippingThreshold = 499;
  const progressPercent = Math.min(100, (rawTotalPrice / freeShippingThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="empty-cart-card">
          <div className="empty-icon-wrap mb-4">
            <ShoppingBag size={56} className="text-gray-400" />
          </div>
          <h2 className="empty-cart-title">Your Shopping Cart is Empty</h2>
          <p className="empty-cart-desc">
            Looks like you haven't added anything to your cart yet. Explore our top categories and grab ₹1 flash deals before they're gone!
          </p>
          <div className="empty-cart-actions flex-center gap-3">
            <Link to="/products" className="btn-primary-lg inline-flex">
              <ShoppingBag size={18} /> Start Shopping Now
            </Link>
            <Link to="/products?category=Special%20Deals" className="btn-festive-secondary inline-flex">
              <Sparkles size={18} /> View ₹1 Deals
            </Link>
          </div>

          <div className="empty-cart-categories">
            <span className="empty-cat-label">Popular Categories:</span>
            <div className="empty-cat-pills">
              <Link to="/products?category=Electronics">Electronics</Link>
              <Link to="/products?category=Mobiles">Mobiles</Link>
              <Link to="/products?category=Laptops">Laptops</Link>
              <Link to="/products?category=Shoes">Shoes</Link>
              <Link to="/products?category=Fashion">Fashion</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      {/* Cart Page Header */}
      <div className="cart-page-header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">
            You have <strong className="text-primary">{totalItems}</strong> {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="free-shipping-progress-box">
          <div className="shipping-progress-text flex-align gap-2">
            <Truck size={16} className="text-primary" />
            {rawTotalPrice >= freeShippingThreshold ? (
              <span className="text-emerald-600 font-semibold">
                🎉 Congratulations! You have unlocked FREE Express Delivery!
              </span>
            ) : (
              <span>
                Add ₹{freeShippingThreshold - rawTotalPrice} more to unlock <strong>FREE Express Delivery</strong>!
              </span>
            )}
          </div>
          <div className="shipping-progress-bar">
            <div className="shipping-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="cart-layout">
        /* Cart Items List */
        <div className="cart-items-container">
          <div className="cart-items-header-actions">
            <span>Selected Items ({totalItems})</span>
            <button
              onClick={handleClear}
              disabled={actionLoading}
              className="btn-clear-cart"
              title="Remove all products from cart"
            >
              <Trash2 size={15} /> Clear All
            </button>
          </div>

          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.product_id} className="cart-item-card">
                <Link to={`/products/${item.product_id}`} className="cart-item-img-link">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                    }}
                  />
                </Link>

                <div className="cart-item-info">
                  <h3 className="cart-item-name">
                    <Link to={`/products/${item.product_id}`}>{item.name}</Link>
                  </h3>

                  <div className="cart-item-unit-price">
                    Unit Price: <span className="unit-price-val">₹{Number(item.price).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="cart-item-controls-row">
                    {/* Stepper */}
                    <div className="cart-stepper">
                      <button
                        type="button"
                        onClick={() => handleDecrease(item.product_id, item.quantity)}
                        disabled={actionLoading}
                        className="cart-stepper-btn"
                        title="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-stepper-qty">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrease(item.product_id, item.quantity)}
                        disabled={actionLoading}
                        className="cart-stepper-btn"
                        title="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.product_id, item.name)}
                      disabled={actionLoading}
                      className="btn-remove-item"
                      title="Remove product from cart"
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal-column">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-amount">
                    ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer-nav">
            <Link to="/products" className="btn-continue-shopping">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        /* Order Summary Sidebar */
        <aside className="cart-summary-sidebar">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>

            /* Promo Code Input Box */
            <div className="coupon-box-wrapper">
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <div className="coupon-input-wrap">
                  <Tag size={16} className="coupon-icon" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. EKART10)"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    className="coupon-input"
                    disabled={couponApplied}
                  />
                </div>
                {couponApplied ? (
                  <button type="button" onClick={handleRemoveCoupon} className="btn-coupon-remove">
                    Remove
                  </button>
                ) : (
                  <button type="submit" className="btn-coupon-apply">
                    Apply
                  </button>
                )}
              </form>

              {couponError && <p className="coupon-error-text">{couponError}</p>}
              {couponApplied && (
                <div className="coupon-success-pill flex-align gap-1">
                  <Check size={14} />
                  <span>Coupon {couponCode.toUpperCase()} applied! You saved 10%</span>
                </div>
              )}
            </div>

            <div className="summary-row">
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="summary-row">
              <span>Item Subtotal</span>
              <span>₹{Number(rawTotalPrice).toLocaleString('en-IN')}</span>
            </div>

            {couponApplied && (
              <div className="summary-row discount-row">
                <span className="flex-align gap-1 text-emerald-600">
                  <Tag size={14} /> Coupon Discount (10%)
                </span>
                <span className="text-emerald-600 font-semibold">
                  -₹{Number(discountAmount).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="summary-row">
              <span>Shipping & Handling</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-row">
              <span>Estimated Total:</span>
              <span className="summary-total-val">
                ₹{Number(finalPrice).toLocaleString('en-IN')}
              </span>
            </div>

            <p className="summary-taxes-note">Inclusive of GST & all applicable charges</p>

            <button
              onClick={() => navigate('/checkout')}
              disabled={actionLoading || items.length === 0}
              className="btn-proceed-checkout"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Trust Assurances */}
            <div className="summary-trust-assurances">
              <div className="trust-assurance-item">
                <Lock size={15} />
                <span>256-Bit SSL Encrypted Razorpay Checkout</span>
              </div>
              <div className="trust-assurance-item">
                <ShieldCheck size={15} />
                <span>7-Day Replacement & Easy Cancellations</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
