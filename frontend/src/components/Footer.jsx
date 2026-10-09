import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Heart,
  Lock,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-section">
      {/* Value Proposition Highlights Strip */}
      <div className="footer-features-strip">
        <div className="container footer-features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <Truck className="feature-icon" size={24} />
            </div>
            <div>
              <h4>Free Express Delivery</h4>
              <p>On orders above ₹499 across all Indian pin codes</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <ShieldCheck className="feature-icon" size={24} />
            </div>
            <div>
              <h4>100% Genuine Products</h4>
              <p>Direct from verified brand partners with warranty</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <RotateCcw className="feature-icon" size={24} />
            </div>
            <div>
              <h4>Easy 7-Day Returns</h4>
              <p>Instant replacement & cancellation guarantee</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <Headphones className="feature-icon" size={24} />
            </div>
            <div>
              <h4>24/7 Priority Support</h4>
              <p>Round-the-clock dedicated customer assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container main-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <ShoppingBag size={20} />
              </div>
              <span>EKART STORE</span>
            </div>
            <p className="footer-description">
              Next-generation e-commerce platform offering certified premium electronics, smartphones, laptops, gaming gear, footwear, and trending fashion at transparent festival pricing.
            </p>
            <div className="footer-contact-info">
              <div className="contact-item">
                <MapPin size={15} /> <span>Hitech City, Hyderabad, Telangana - 500081</span>
              </div>
              <div className="contact-item">
                <Mail size={15} /> <span>support@ekartstore.in</span>
              </div>
              <div className="contact-item">
                <Phone size={15} /> <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Top Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Special%20Deals">⚡ ₹1 Flash Deals</Link></li>
              <li><Link to="/products?category=Electronics">Electronics & Audio</Link></li>
              <li><Link to="/products?category=Mobiles">Smartphones & 5G</Link></li>
              <li><Link to="/products?category=Laptops">Laptops & Workstations</Link></li>
              <li><Link to="/products?category=Gaming">Gaming Consoles</Link></li>
              <li><Link to="/products?category=Fashion">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Shoes">Footwear & Sneakers</Link></li>
              <li><Link to="/products?category=Accessories">Accessories & Watches</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">Track My Orders</Link></li>
              <li><Link to="/profile">Account Settings</Link></li>
              <li><Link to="/admin">Store Administration</Link></li>
              <li><Link to="/login">Sign In / Register</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Payment & Security</h4>
            <p className="secure-text">
              We process payments via 256-bit SSL encrypted gateways protected by Razorpay.
            </p>
            <div className="payment-badges-grid">
              <span className="pay-badge-pill">UPI / QR</span>
              <span className="pay-badge-pill">Google Pay</span>
              <span className="pay-badge-pill">PhonePe</span>
              <span className="pay-badge-pill">Paytm</span>
              <span className="pay-badge-pill">Visa</span>
              <span className="pay-badge-pill">Mastercard</span>
              <span className="pay-badge-pill">RuPay</span>
              <span className="pay-badge-pill">Cash on Delivery</span>
            </div>
            <div className="security-verified-tag flex-align gap-2 mt-4">
              <Lock size={15} className="text-emerald-400" />
              <span>Razorpay Certified 100% Safe Checkout</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EKART Store. Built with <Heart size={14} className="text-rose-500 fill-rose-500 inline" /> for modern shoppers.</p>
          <div className="footer-bottom-links">
            <Link to="/products">Privacy Policy</Link>
            <span>•</span>
            <Link to="/products">Terms of Service</Link>
            <span>•</span>
            <Link to="/products">Refund Policy</Link>
            <span>•</span>
            <Link to="/products">Security Disclosures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
