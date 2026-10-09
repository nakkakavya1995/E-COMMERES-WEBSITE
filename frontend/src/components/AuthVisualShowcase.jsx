import React from 'react';
import { Truck, ShieldCheck, Sparkles, Award } from 'lucide-react';

const AuthVisualShowcase = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';

  return (
    <div className="auth-visual-side">
      {/* Decorative dashed background rings */}
      <div className="auth-visual-bg-circle circle-1"></div>
      <div className="auth-visual-bg-circle circle-2"></div>

      {/* Top Chip */}
      <div className="auth-visual-top-chip">
        <Sparkles size={14} />
        <span>{isLogin ? 'Welcome to EKART Premium' : 'Join 50,000+ Happy Shoppers'}</span>
      </div>

      {/* Main Illustration Area */}
      <div className="auth-illustration-container">
        {/* SVG Illustration - Matching User Figma/Freepik Reference */}
        {isLogin ? (
          <svg viewBox="0 0 460 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="boxGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
              <linearGradient id="boxGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="boxGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>

            {/* Soft Ambient Floor Shadow */}
            <ellipse cx="230" cy="335" rx="190" ry="16" fill="#fed7aa" fillOpacity="0.45" />

            {/* Decorative Sparkles & Circles */}
            <circle cx="85" cy="80" r="14" fill="#ffedd5" />
            <circle cx="390" cy="120" r="22" fill="#fff7ed" />
            <path d="M75 140 L79 148 L87 152 L79 156 L75 164 L71 156 L63 152 L71 148 Z" fill="#ea580c" fillOpacity="0.6" />
            <path d="M370 70 L373 76 L379 79 L373 82 L370 88 L367 82 L361 79 L367 76 Z" fill="#f97316" fillOpacity="0.7" />

            {/* Shopping Cart Body */}
            {/* Basket Outline */}
            <path d="M125 155 L255 155 L235 245 L145 245 Z" fill="#ffffff" fillOpacity="0.9" stroke="#ea580c" strokeWidth="4" strokeLinejoin="round" />
            {/* Basket Grid Lines */}
            <line x1="150" y1="155" x2="162" y2="245" stroke="#fed7aa" strokeWidth="2.5" />
            <line x1="180" y1="155" x2="187" y2="245" stroke="#fed7aa" strokeWidth="2.5" />
            <line x1="210" y1="155" x2="212" y2="245" stroke="#fed7aa" strokeWidth="2.5" />
            <line x1="235" y1="155" x2="230" y2="245" stroke="#fed7aa" strokeWidth="2.5" />
            <line x1="130" y1="185" x2="250" y2="185" stroke="#fed7aa" strokeWidth="2.5" />
            <line x1="138" y1="215" x2="242" y2="215" stroke="#fed7aa" strokeWidth="2.5" />

            {/* Cart Frame & Handle */}
            <path d="M100 135 L125 155 L145 245 L150 280 L230 280" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Cart Handle grip */}
            <rect x="92" y="127" width="16" height="10" rx="3" fill="#ea580c" />

            {/* Cart Wheels */}
            <circle cx="155" cy="305" r="16" fill="#0f172a" />
            <circle cx="155" cy="305" r="7" fill="#f8fafc" />
            <circle cx="225" cy="305" r="16" fill="#0f172a" />
            <circle cx="225" cy="305" r="7" fill="#f8fafc" />

            {/* Items inside Cart */}
            {/* Item 1: Cyan Box */}
            <rect x="140" y="115" width="45" height="42" rx="6" fill="url(#boxGrad1)" />
            <rect x="157" y="115" width="10" height="42" fill="#ffffff" fillOpacity="0.4" />
            <circle cx="162" cy="113" r="5" fill="#f8fafc" />

            {/* Item 2: Purple Box */}
            <rect x="180" y="95" width="55" height="62" rx="6" fill="url(#boxGrad2)" />
            <line x1="180" y1="126" x2="235" y2="126" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.3" />
            <line x1="207" y1="95" x2="207" y2="157" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.3" />

            {/* Item 3: Warm Orange Sphere / Package */}
            <circle cx="225" cy="140" r="20" fill="url(#boxGrad3)" />

            {/* Item 4: Vibrant Shopping Bag */}
            <path d="M228 120 L248 120 L255 160 L220 160 Z" fill="url(#bagGrad)" rx="3" />
            <path d="M234 120 C234 112 242 112 242 120" stroke="#ffffff" strokeWidth="2.5" fill="none" />

            {/* Shopper Character (Inspired by Reference 1 & 2) */}
            {/* Legs */}
            <path d="M312 215 L308 315 L328 315 L330 215" fill="#0f172a" />
            <path d="M336 215 L338 315 L358 315 L352 215" fill="#1e293b" />
            {/* Shoes */}
            <rect x="300" y="312" width="30" height="12" rx="6" fill="#ea580c" />
            <rect x="338" y="312" width="30" height="12" rx="6" fill="#ea580c" />

            {/* Torso / Jacket */}
            <rect x="305" y="130" width="52" height="90" rx="14" fill="#f97316" />
            {/* Inner T-shirt */}
            <path d="M322 130 L331 160 L340 130 Z" fill="#ffffff" />

            {/* Head & Hair */}
            <circle cx="331" cy="95" r="18" fill="#fed7aa" />
            {/* Hair */}
            <path d="M316 92 C316 75 346 75 346 92 C346 92 342 85 331 85 C320 85 316 92 316 92 Z" fill="#0f172a" />

            {/* Shopper Arms & Clipboard/Shopping List */}
            {/* Left Arm holding clipboard */}
            <path d="M310 145 L292 180 L315 185" stroke="#f97316" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            {/* Shopping List Clipboard */}
            <rect x="290" y="165" width="28" height="38" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="298" y="161" width="12" height="6" rx="2" fill="#94a3b8" />
            <line x1="296" y1="175" x2="312" y2="175" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="296" y1="183" x2="310" y2="183" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="296" y1="191" x2="306" y2="191" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            {/* Right Arm */}
            <path d="M352 145 L365 185 L355 200" stroke="#f97316" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 460 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="giftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="bagGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Soft Ambient Floor Shadow */}
            <ellipse cx="230" cy="335" rx="190" ry="16" fill="#fed7aa" fillOpacity="0.45" />

            {/* Confetti & Celebration Sparks */}
            <circle cx="95" cy="85" r="6" fill="#ea580c" />
            <circle cx="365" cy="95" r="8" fill="#10b981" />
            <rect x="130" y="60" width="8" height="8" rx="2" fill="#8b5cf6" transform="rotate(25 130 60)" />
            <rect x="330" y="65" width="10" height="10" rx="3" fill="#f59e0b" transform="rotate(45 330 65)" />
            <rect x="385" y="145" width="7" height="7" rx="2" fill="#ec4899" transform="rotate(15 385 145)" />

            {/* Giant Gift Box with Ribbon */}
            <rect x="165" y="170" width="130" height="130" rx="16" fill="url(#giftGrad)" stroke="#ffffff" strokeWidth="4" />
            {/* Box Lid */}
            <rect x="155" y="150" width="150" height="28" rx="8" fill="#fb923c" stroke="#ffffff" strokeWidth="3" />
            {/* Golden Ribbon */}
            <rect x="220" y="150" width="20" height="150" fill="#fef08a" />
            <rect x="155" y="220" width="150" height="20" fill="#fef08a" />
            {/* Ribbon Bow */}
            <circle cx="215" cy="142" r="14" fill="#fde047" stroke="#ffffff" strokeWidth="2" />
            <circle cx="245" cy="142" r="14" fill="#fde047" stroke="#ffffff" strokeWidth="2" />
            <circle cx="230" cy="142" r="8" fill="#eab308" />

            {/* Shopping Bags next to gift */}
            {/* Left Indigo Bag */}
            <rect x="95" y="210" width="60" height="80" rx="10" fill="url(#bagGrad2)" />
            <path d="M110 210 C110 190 140 190 140 210" stroke="#ffffff" strokeWidth="3.5" fill="none" />
            <circle cx="125" cy="250" r="12" fill="#ffffff" fillOpacity="0.2" />

            {/* Right Emerald Bag */}
            <rect x="305" y="225" width="55" height="70" rx="10" fill="url(#badgeGrad)" />
            <path d="M318 225 C318 208 346 208 346 225" stroke="#ffffff" strokeWidth="3.5" fill="none" />
            <line x1="315" y1="260" x2="350" y2="260" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />

            {/* Sparkle Icons */}
            <path d="M230 75 L234 87 L246 91 L234 95 L230 107 L226 95 L214 91 L226 87 Z" fill="#ea580c" />
            <path d="M110 130 L112 136 L118 138 L112 140 L110 146 L108 140 L102 138 L108 136 Z" fill="#f59e0b" />
          </svg>
        )}
      </div>

      {/* Visual Bottom Description */}
      <div className="auth-visual-footer">
        <h3 className="auth-visual-headline">
          {isLogin ? 'Shop the Best Deals Every Day' : 'Your One-Stop Premium Superstore'}
        </h3>
        <p className="auth-visual-subtext">
          {isLogin
            ? 'Access your orders, track deliveries in real time, and enjoy members-only discounts.'
            : 'Create your account in seconds and unlock welcome vouchers, speedy checkout, and VIP perks.'}
        </p>

        <div className="auth-feature-pills">
          <span className="auth-pill">
            <ShieldCheck size={12} /> 100% Secure SSL
          </span>
          <span className="auth-pill">
            <Truck size={12} /> Fast Free Shipping
          </span>
          <span className="auth-pill">
            <Award size={12} /> Certified Quality
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthVisualShowcase;
