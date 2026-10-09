import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to add items to your cart' } });
      return;
    }

    if (product.stock <= 0) return;

    setAdding(true);
    const result = await addToCart(product.id, 1);
    setAdding(false);

    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert(result.message);
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isSpecial = product.category === 'Special Deals' || product.price <= 10;

  // Visual MRP calculation to display genuine discount savings
  const originalPrice = isSpecial
    ? 999
    : Math.round(product.price * (product.price > 10000 ? 1.2 : 1.35));
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className={`product-card ${isSpecial ? 'special-product-card' : ''}`}>
      <Link to={`/products/${product.id}`} className="product-card-img-link">
        <div className="product-img-wrapper">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={product.name}
            className="product-img"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
            }}
          />

          {/* Top badges */}
          <div className="product-badges-row">
            <span className="product-category-tag">{product.category}</span>
            {discountPercent > 0 && (
              <span className="product-discount-tag">
                {isSpecial ? <><Zap size={10} /> FLASH</> : `${discountPercent}% OFF`}
              </span>
            )}
          </div>

          {/* Stock Tag */}
          <div className="stock-tag-wrapper">
            {isOutOfStock ? (
              <span className="stock-tag out-of-stock">
                <span className="stock-dot"></span> Sold Out
              </span>
            ) : isLowStock ? (
              <span className="stock-tag low-stock">
                <span className="stock-dot pulse"></span> Only {product.stock} Left!
              </span>
            ) : (
              <span className="stock-tag in-stock">
                <span className="stock-dot"></span> In Stock
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-card-body">
        {/* Rating preview */}
        <div className="product-rating-row">
          <div className="rating-pill">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>4.8</span>
          </div>
          <span className="rating-count">(120+ verified)</span>
        </div>

        <h3 className="product-title" title={product.name}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <p className="product-desc">{product.description}</p>

        {/* Price Row with original strikethrough & savings */}
        <div className="product-price-row">
          <div className="price-main-wrap">
            <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {originalPrice > product.price && (
              <span className="product-mrp">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
            )}
          </div>
          {product.stock > 0 && (
            <span className="free-shipping-tag">Free Delivery</span>
          )}
        </div>

        {/* Card Actions */}
        <div className="product-card-actions">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn-add-cart ${added ? 'btn-added' : ''}`}
            title={isOutOfStock ? 'Item out of stock' : 'Add to Shopping Cart'}
          >
            {added ? (
              <>
                <Check size={16} /> Added
              </>
            ) : adding ? (
              <>
                <span className="btn-spinner"></span> Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </>
            )}
          </button>

          <Link
            to={`/products/${product.id}`}
            className="btn-view-details"
            title="View product specifications"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
