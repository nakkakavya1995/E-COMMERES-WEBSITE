import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, total_items: 0 });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0, total_items: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      if (res.data && res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, token]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setActionLoading(true);
      const res = await cartAPI.addToCart(productId, quantity);
      if (res.data && res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message || 'Product added to cart' };
      }
      return { success: false, message: 'Could not add to cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error adding product to cart';
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setActionLoading(true);
      const res = await cartAPI.updateCartItem(productId, quantity);
      if (res.data && res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Could not update item' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating item quantity';
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setActionLoading(true);
      const res = await cartAPI.removeFromCart(productId);
      if (res.data && res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Could not remove item' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error removing item from cart';
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setActionLoading(true);
      const res = await cartAPI.clearCart();
      if (res.data && res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Could not clear cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error clearing cart';
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.total_items || 0,
        loading,
        actionLoading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
