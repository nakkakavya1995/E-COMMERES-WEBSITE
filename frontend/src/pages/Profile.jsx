import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  ShieldCheck,
  KeyRound,
  LayoutDashboard,
} from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { cartCount } = useCart();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        setInitialLoading(true);
        const res = await authAPI.getProfile();
        if (res.data && res.data.success && res.data.user) {
          setFormData({
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            phone: res.data.user.phone || '',
            address: res.data.user.address || '',
          });
          updateUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchLatestProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (success) setSuccess('');
    if (error) setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await authAPI.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      if (res.data && res.data.success) {
        setSuccess('Profile details saved successfully!');
        updateUser(res.data.user);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving changes');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!formData.name) return 'U';
    const parts = formData.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return formData.name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container profile-page">
      <div className="profile-page-header">
        <h1 className="page-title">Account Profile</h1>
        <p className="page-subtitle">Manage your personal information, delivery addresses, and account security</p>
      </div>

      <div className="profile-dashboard-layout">
        {/* Left Column: Account Overview Card */}
        <div className="profile-summary-card">
          <div className="profile-avatar-banner">
            <div className="profile-avatar-circle-lg">{getUserInitials()}</div>
          </div>

          <div className="profile-summary-info text-center">
            <h2 className="profile-user-name">{formData.name || 'Account User'}</h2>
            <p className="profile-user-email">{formData.email}</p>
            <div className="profile-badges-row flex-center gap-2 mt-2">
              <span className="profile-role-badge">
                {user?.role === 'admin' ? 'Store Administrator' : 'Verified Member'}
              </span>
              <span className="profile-status-badge">Active</span>
            </div>
          </div>

          <div className="profile-stats-grid">
            <Link to="/orders" className="profile-stat-box">
              <Package size={20} className="text-primary" />
              <div className="stat-text">
                <span className="stat-title">My Orders</span>
                <span className="stat-desc">View history</span>
              </div>
            </Link>

            <Link to="/cart" className="profile-stat-box">
              <ShoppingCart size={20} className="text-emerald-500" />
              <div className="stat-text">
                <span className="stat-title">Cart Items</span>
                <span className="stat-desc">{cartCount} in cart</span>
              </div>
            </Link>
          </div>

          <div className="profile-shortcuts-menu">
            <div className="menu-header">Quick Links</div>
            <Link to="/orders" className="shortcut-link">
              <Package size={16} /> Track Shipments
            </Link>
            <Link to="/reset-password" className="shortcut-link">
              <KeyRound size={16} /> Reset Password
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="shortcut-link admin-highlight">
                <LayoutDashboard size={16} /> Admin Control Panel
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Edit Details Form */}
        <div className="profile-form-container">
          <div className="profile-form-card">
            <div className="form-card-header flex-between">
              <div className="flex-align gap-2">
                <User size={20} className="text-primary" />
                <h2>Personal Details</h2>
              </div>
              <span className="security-tag flex-align gap-1">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure Data
              </span>
            </div>

            {success && (
              <div className="profile-alert success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="profile-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="input-with-icon">
                  <User className="input-icon" size={17} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Your legal full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Registered Email Address
                </label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={17} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="form-input disabled-input"
                  />
                </div>
                <span className="input-helper-text">
                  Email is locked to your authenticated credentials
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={17} />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Default Delivery Address
                </label>
                <div className="input-with-icon textarea-wrap">
                  <MapPin className="input-icon textarea-icon" size={17} />
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full default street address, flat/building, locality and city"
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button type="submit" disabled={loading} className="btn-save-profile">
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span> Saving Updates...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
