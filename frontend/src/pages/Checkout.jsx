import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Banknote,
  Lock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI } from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If cart is empty, redirect to cart page
    if (!cart?.items || cart.items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateShippingAddress = () => {
    const required = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress[field] || !shippingAddress[field].trim()) {
        setError(`Please fill in the ${field.replace('_', ' ')} field`);
        return false;
      }
    }

    const cleanPhone = shippingAddress.phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit phone number');
      return false;
    }

    if (shippingAddress.pincode.trim().length < 4) {
      setError('Please provide a valid postal/pincode');
      return false;
    }

    return true;
  };

  // 1. Process Razorpay Payment Flow
  const handleRazorpayPayment = async () => {
    try {
      setSubmitting(true);
      setError('');

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError('Unable to load Razorpay payment gateway. Please check your internet connection.');
        setSubmitting(false);
        return;
      }
      const res = await paymentAPI.createOrder(total);

      if (!res.data || !res.data.success) {
        setError(res.data?.error || 'Unable to initiate payment with Razorpay. Please try again.');
        setSubmitting(false);
        return;
      }

      const { order_id, amount, currency, key_id } = res.data;

      
      const options = {
        key: key_id,
        amount: amount,
        currency: currency || 'INR',
        name: 'EKART Store',
        description: `Payment for ${items.length} item${items.length > 1 ? 's' : ''}`,
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081986.png',
        order_id: order_id,
        prefill: {
          name: shippingAddress.name || user?.name || '',
          email: user?.email || '',
          contact: shippingAddress.phone || user?.phone || '',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (paymentResponse) => {
          try {
            setSubmitting(true);
          
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.data && verifyRes.data.success) {
              
              const orderPayload = {
                shipping_address: shippingAddress,
                payment_method: 'Razorpay',
                payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
              };

              const createOrderRes = await ordersAPI.createOrder(orderPayload);

              if (createOrderRes.data && createOrderRes.data.success) {
                await fetchCart();
                const confirmedId = createOrderRes.data.order?.order_id || 'Confirmed';
                navigate('/orders', {
                  state: {
                    successMessage: `🎉 Payment successful! Your order #${confirmedId} has been confirmed.`,
                  },
                  replace: true,
                });
              } else {
                setError(createOrderRes.data?.message || 'Payment verified, but failed to save order record.');
                setSubmitting(false);
              }
            } else {
              setError(verifyRes.data?.message || 'Payment signature verification failed.');
              setSubmitting(false);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(
              err.response?.data?.message ||
              err.response?.data?.error ||
              'Payment verification failed. Please contact support.'
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', function (failure) {
        console.error('Razorpay payment failed:', failure.error);
        setError(failure.error?.description || 'Payment was unsuccessful or cancelled. Please try again.');
        setSubmitting(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Payment checkout initiation failed:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to start payment process. Please try again.'
      );
      setSubmitting(false);
    }
  };

  // 2. Process Cash on Delivery Flow
  const handleCODOrder = async () => {
    try {
      setSubmitting(true);
      setError('');

      const orderPayload = {
        shipping_address: shippingAddress,
        payment_method: 'Cash on Delivery',
      };

      const res = await ordersAPI.createOrder(orderPayload);

      if (res.data && res.data.success) {
        await fetchCart();
        const confirmedId = res.data.order?.order_id || 'Confirmed';
        navigate('/orders', {
          state: {
            successMessage: `Order placed successfully! Order ID: #${confirmedId}`,
          },
          replace: true,
        });
      } else {
        setError(res.data?.message || 'Failed to place order');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('COD order creation failed:', err);
      setError(err.response?.data?.message || 'Error occurred while placing your order');
      setSubmitting(false);
    }
  };

  // Form Submission Handler
  const handleCheckoutSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateShippingAddress()) {
      return;
    }

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await handleCODOrder();
    }
  };

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <div className="container checkout-page">
      {/* Checkout Step Progress Bar */}
      <div className="checkout-steps-bar">
        <div className="checkout-step completed">
          <div className="step-circle"><Check size={14} /></div>
          <span>1. Cart</span>
        </div>
        <div className="step-line active"></div>
        <div className="checkout-step active">
          <div className="step-circle">2</div>
          <span>2. Shipping Address</span>
        </div>
        <div className="step-line active"></div>
        <div className="checkout-step active">
          <div className="step-circle">3</div>
          <span>3. Payment</span>
        </div>
      </div>

      <div className="checkout-page-header">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <h1 className="page-title">Secure Checkout</h1>
        <p className="page-subtitle">Confirm your delivery details and choose your preferred payment option</p>
      </div>

      {error && (
        <div className="checkout-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Shipping Information Form */}
        <div className="checkout-form-container">
          <form onSubmit={handleCheckoutSubmit} id="checkout-form" className="checkout-form-card">
            <div className="form-card-header flex-between">
              <div className="flex-align gap-2">
                <Truck size={22} className="text-primary" />
                <h2>Shipping & Delivery Address</h2>
              </div>
              <span className="badge-pill">Step 1 of 2</span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleChange}
                    placeholder="Enter recipient full name"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Street / Flat / House Address <span className="text-rose-500">*</span>
              </label>
              <div className="input-with-icon textarea-wrap">
                <MapPin size={16} className="input-icon textarea-icon" />
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={shippingAddress.address}
                  onChange={handleChange}
                  placeholder="House/Flat number, building name, street and locality"
                  required
                  className="form-input form-textarea"
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pincode">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  value={shippingAddress.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-method-section">
              <div className="form-card-header mb-3 flex-between">
                <div className="flex-align gap-2">
                  <CreditCard size={22} className="text-primary" />
                  <h2>Select Payment Option</h2>
                </div>
                <span className="badge-pill">Step 2 of 2</span>
              </div>

              <div className="payment-options-grid">
                <label className={`payment-option-card ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <div className="payment-card-content">
                    <div className="payment-title-row">
                      <div className="flex-align gap-2">
                        <CreditCard size={20} className="text-primary" />
                        <strong>Razorpay Gateway (Cards / UPI / NetBanking)</strong>
                      </div>
                      <span className="badge-recommended">Instant & Recommended</span>
                    </div>
                    <p className="payment-sub">
                      Google Pay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay & NetBanking
                    </p>
                    <div className="payment-supported-badges">
                      <span className="pay-pill">UPI</span>
                      <span className="pay-pill">Credit/Debit Cards</span>
                      <span className="pay-pill">Net Banking</span>
                      <span className="pay-pill">Wallets</span>
                    </div>
                  </div>
                </label>

                <label className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-card-content">
                    <div className="payment-title-row">
                      <div className="flex-align gap-2">
                        <Banknote size={20} className="text-emerald-600" />
                        <strong>Cash on Delivery (COD)</strong>
                      </div>
                      <span className="badge-cod">Pay upon Arrival</span>
                    </div>
                    <p className="payment-sub">
                      Pay with cash or UPI directly to delivery agent at your doorstep
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        /* Order Summary & Place Order */
        <aside className="checkout-summary-sidebar">
          <div className="summary-card">
            <h2 className="summary-title">Order Review ({items.length} items)</h2>

            <div className="checkout-items-list">
              {items.map((item) => (
                <div key={item.product_id} className="checkout-item-row">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                    alt={item.name}
                    className="checkout-item-img"
                  />
                  <div className="checkout-item-details">
                    <span className="checkout-item-title">{item.name}</span>
                    <span className="checkout-item-sub">
                      Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="checkout-item-price">
                    ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Items Total:</span>
              <span>₹{Number(total).toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>Express Delivery Fee:</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>

            <div className="summary-total-row">
              <span>Total Payable:</span>
              <span className="summary-total-val">₹{Number(total).toLocaleString('en-IN')}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || items.length === 0}
              className="btn-place-order"
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Verifying & Processing...</span>
                </>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Lock size={18} />
                  <span>Pay ₹{Number(total).toLocaleString('en-IN')} via Razorpay</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={19} />
                  <span>Confirm Order (Cash on Delivery)</span>
                </>
              )}
            </button>

            <div className="summary-security-note">
              <ShieldCheck size={16} />
              <span>Razorpay Secured • 256-Bit Bank Encryption</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
