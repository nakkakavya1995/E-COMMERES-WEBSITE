import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Copy,
  Check,
  MapPin,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { ordersAPI } from '../services/api';

const getStatusBadge = (status) => {
  const s = (status || 'Confirmed').toLowerCase();
  switch (s) {
    case 'delivered':
      return {
        label: 'Delivered',
        className: 'status-delivered',
        icon: CheckCircle,
      };
    case 'shipped':
      return {
        label: 'Shipped',
        className: 'status-shipped',
        icon: Truck,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'status-cancelled',
        icon: XCircle,
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'status-pending',
        icon: Clock,
      };
    case 'confirmed':
    default:
      return {
        label: 'Confirmed',
        className: 'status-confirmed',
        icon: CheckCircle,
      };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const location = useLocation();

  const successMessage = location.state?.successMessage;

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order #${orderId}?`
    );
    if (!confirmCancel) return;

    try {
      setCancellingId(orderId);
      const res = await ordersAPI.cancelOrder(orderId);
      if (res.data && res.data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === orderId || o.id === orderId
              ? { ...o, status: 'Cancelled' }
              : o
          )
        );
      } else {
        alert(res.data?.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while cancelling order');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCopyId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await ordersAPI.getOrders();
        if (res.data && res.data.success) {
          setOrders(res.data.orders);
        } else {
          setError(res.data?.message || 'Failed to fetch orders');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading orders from server');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeStatusFilter === 'All') return true;
    return order.status?.toLowerCase() === activeStatusFilter.toLowerCase();
  });

  return (
    <div className="container orders-page">
      <div className="orders-page-header flex-between">
        <div>
          <h1 className="page-title">My Orders & Purchases</h1>
          <p className="page-subtitle">Track, review, or cancel your past order shipments</p>
        </div>

        <Link to="/products" className="btn-secondary-sm">
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>

      {successMessage && (
        <div className="orders-success-banner">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="orders-error-banner">
          <span>{error}</span>
        </div>
      )}

      {/* Orders Filter Tabs */}
      <div className="orders-filter-tabs">
        {['All', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatusFilter(status)}
            className={`orders-filter-tab ${activeStatusFilter === status ? 'active' : ''}`}
          >
            <span>{status}</span>
            <span className="count-pill">
              {status === 'All'
                ? orders.length
                : orders.filter((o) => o.status?.toLowerCase() === status.toLowerCase()).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="orders-loading-state">
          <div className="spinner"></div>
          <p>Retrieving your order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders-card">
          <div className="empty-icon-wrap mb-4">
            <Package size={56} className="text-gray-400" />
          </div>
          <h2>
            {activeStatusFilter === 'All'
              ? 'No orders placed yet'
              : `No orders in "${activeStatusFilter}" status`}
          </h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            {activeStatusFilter === 'All'
              ? "You haven't placed any orders yet. Check out our flash deals and explore top categories today!"
              : `There are currently no orders under the ${activeStatusFilter} tab.`}
          </p>
          <Link to="/products" className="btn-primary-lg inline-flex">
            Browse Products <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const currentOrderId = order.order_id || order.id;
            const badge = getStatusBadge(order.status);
            const StatusIcon = badge.icon;

            return (
              <div key={currentOrderId} className="order-card">
                <div className="order-card-header flex-between">
                  <div className="order-meta-info">
                    <div className="order-id-group flex-align gap-2">
                      <span className="order-id-label">Order</span>
                      <strong className="order-id-code">#{currentOrderId}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyId(currentOrderId)}
                        className="btn-copy-id"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === currentOrderId ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <span className="order-date-text">
                      Placed on <strong>{formatDate(order.created_at)}</strong>
                    </span>
                  </div>

                  <div className={`order-status-pill ${badge.className}`}>
                    <StatusIcon size={16} />
                    <span>{badge.label}</span>
                  </div>
                </div>

                <div className="order-card-body">
                  {/* Order items */}
                  <div className="order-items-list">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-thumb"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="order-item-thumb-placeholder">
                            <Package size={20} />
                          </div>
                        )}
                        <div className="order-item-details">
                          <span className="order-item-title">{item.name}</span>
                          <span className="order-item-math">
                            Quantity: <strong>{item.quantity}</strong> × ₹{Number(item.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="order-item-total">
                          ₹{Number(item.subtotal || item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary-row">
                    <div className="order-shipping-summary">
                      <div className="flex-align gap-1 shipping-heading">
                        <MapPin size={15} className="text-primary" />
                        <span className="shipping-to-label">Delivery Address:</span>
                      </div>
                      <p className="shipping-address-text">
                        <strong>{order.shipping_address?.name}</strong>,{' '}
                        {order.shipping_address?.address}, {order.shipping_address?.city},{' '}
                        {order.shipping_address?.state} - {order.shipping_address?.pincode}
                      </p>
                      <p className="text-xs text-muted">Phone: {order.shipping_address?.phone}</p>

                      {order.payment_method && (
                        <div className="order-payment-meta flex-align gap-2 mt-2">
                          <CreditCard size={14} className="text-gray-400" />
                          <span className="text-xs text-muted">
                            Method: <strong>{order.payment_method}</strong>
                          </span>
                          {order.payment_status && (
                            <span
                              className={`payment-status-pill ${
                                order.payment_status === 'Paid' ? 'paid' : 'pending'
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          )}
                          {order.payment_id && (
                            <span className="text-xs text-muted">
                              (Ref: {order.payment_id.slice(-8)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="order-total-action-group">
                      <div className="order-total-amount-box">
                        <span className="total-label">Grand Total</span>
                        <span className="total-val">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="order-actions-buttons flex-align gap-2">
                        <Link to="/products" className="btn-reorder">
                          <RotateCcw size={14} /> Buy More
                        </Link>

                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(currentOrderId)}
                            disabled={cancellingId === currentOrderId}
                            className="btn-cancel-order"
                          >
                            <XCircle size={15} />
                            <span>
                              {cancellingId === currentOrderId ? 'Cancelling...' : 'Cancel Order'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
