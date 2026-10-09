import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Shield,
  Layers,
  ArrowRight,
  Search,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_sales: 0,
    status_counts: {},
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'users'
  const [orderSearch, setOrderSearch] = useState('');

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await adminAPI.getStats();
      if (res.data && res.data.success) {
        setStats(res.data.stats || {});
        setRecentOrders(res.data.recent_orders || []);
        setLowStockProducts(res.data.low_stock_products || []);
        setRecentUsers(res.data.recent_users || []);
      } else {
        setError(res.data?.message || 'Failed to load dashboard metrics');
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setError(err.response?.data?.message || 'Could not connect to admin metrics service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
      const res = await adminAPI.updateOrderStatus(orderId, newStatus);
      if (res.data && res.data.success) {
        setRecentOrders((prev) =>
          prev.map((o) => (o.order_id === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = recentOrders.filter((o) => {
    if (!orderSearch) return true;
    const term = orderSearch.toLowerCase();
    return (
      o.order_id?.toLowerCase().includes(term) ||
      o.shipping_address?.name?.toLowerCase().includes(term) ||
      o.payment_method?.toLowerCase().includes(term)
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'status-badge-delivered';
      case 'shipped':
        return 'status-badge-shipped';
      case 'confirmed':
        return 'status-badge-confirmed';
      case 'cancelled':
        return 'status-badge-cancelled';
      default:
        return 'status-badge-pending';
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="admin-header-left">
          <div className="admin-badge">
            <Shield size={14} />
            <span>Store Administration</span>
          </div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Live overview of users, products, sales, and fulfillment</p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="btn-refresh-stats"
            title="Refresh metrics"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <Link to="/products" className="btn-view-store">
            <span>View Storefront</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
       { /* Total Users */}
        <div className="admin-kpi-card card-users">
          <div className="kpi-icon-wrap bg-blue-subtle text-blue">
            <Users size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Users</span>
            <h2 className="kpi-value">{loading ? '...' : stats.total_users?.toLocaleString()}</h2>
            <span className="kpi-subtext">Registered customer accounts</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="admin-kpi-card card-products">
          <div className="kpi-icon-wrap bg-purple-subtle text-purple">
            <Package size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Products</span>
            <h2 className="kpi-value">{loading ? '...' : stats.total_products?.toLocaleString()}</h2>
            <span className="kpi-subtext">Catalog items & variations</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-kpi-card card-orders">
          <div className="kpi-icon-wrap bg-amber-subtle text-amber">
            <ShoppingBag size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Orders</span>
            <h2 className="kpi-value">{loading ? '...' : stats.total_orders?.toLocaleString()}</h2>
            <span className="kpi-subtext">Orders placed across store</span>
          </div>
        </div>

       { /* Total Sales */}
        <div className="admin-kpi-card card-sales">
          <div className="kpi-icon-wrap bg-emerald-subtle text-emerald">
            <IndianRupee size={28} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Sales</span>
            <h2 className="kpi-value">
              {loading ? '...' : `₹${Number(stats.total_sales || 0).toLocaleString('en-IN')}`}
            </h2>
            <span className="kpi-subtext">Total gross transaction volume</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav">
        <button
          onClick={() => setActiveTab('orders')}
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <ShoppingBag size={17} />
          <span>Recent Orders ({recentOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          <AlertTriangle size={17} />
          <span>Low Stock Alert ({lowStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={17} />
          <span>Recent Users ({recentUsers.length})</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="admin-panel-card">
        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            <div className="panel-toolbar">
              <div className="toolbar-search">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by Order ID, customer, payment method..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="toolbar-input"
                />
              </div>
              <span className="text-xs text-gray-500">Showing {filteredOrders.length} orders</span>
            </div>

            {loading ? (
              <div className="admin-loading-state">
                <div className="spinner"></div>
                <p>Loading orders data...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-panel-msg">
                <ShoppingBag size={44} className="text-gray-300 mx-auto mb-2" />
                <p>No matching orders found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.order_id || order.id}>
                        <td>
                          <span className="font-semibold text-indigo-700">
                            #{order.order_id || order.id?.slice(-6)}
                          </span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <strong>{order.shipping_address?.name || 'Customer'}</strong>
                            <span className="customer-sub">{order.shipping_address?.phone}</span>
                            <span className="customer-loc">
                              {order.shipping_address?.city}, {order.shipping_address?.state}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="order-items-snippet">
                            {order.items?.map((it, idx) => (
                              <span key={idx} className="item-pill">
                                {it.quantity}x {it.name?.slice(0, 20)}...
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong className="text-gray-900">
                            ₹{Number(order.total).toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <div className="payment-cell">
                            <span className="payment-method-text">
                              {order.payment_method || 'Cash on Delivery'}
                            </span>
                            <span
                              className={`payment-status-badge ${
                                order.payment_status === 'Paid' ? 'paid' : 'pending'
                              }`}
                            >
                              {order.payment_status || 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${getStatusBadgeClass(order.status)}`}>
                            {order.status || 'Confirmed'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status || 'Confirmed'}
                            disabled={statusUpdating[order.order_id || order.id]}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.order_id || order.id, e.target.value)
                            }
                            className="order-status-select"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Low Stock Products */}
        {activeTab === 'inventory' && (
          <div>
            <div className="panel-info-banner">
              <AlertTriangle size={18} />
              <span>Items below 5 units in warehouse requiring immediate restocking</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="empty-panel-msg">
                <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-2" />
                <p>All products have healthy stock levels!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Current Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((prod) => (
                      <tr key={prod.id || prod._id}>
                        <td>
                          <div className="prod-cell">
                            <img src={prod.image} alt={prod.name} className="prod-cell-thumb" />
                            <strong>{prod.name}</strong>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td>₹{Number(prod.price).toLocaleString('en-IN')}</td>
                        <td>
                          <span className="stock-critical-badge">{prod.stock} units left</span>
                        </td>
                        <td>
                          <span className="status-badge-pending">Reorder Needed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recent Users */}
        {activeTab === 'users' && (
          <div>
            {recentUsers.length === 0 ? (
              <div className="empty-panel-msg">
                <Users size={44} className="text-gray-300 mx-auto mb-2" />
                <p>No users registered yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u.id || u._id}>
                        <td>
                          <strong>{u.name || 'Anonymous User'}</strong>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
