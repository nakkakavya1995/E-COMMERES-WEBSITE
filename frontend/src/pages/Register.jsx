import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import AuthVisualShowcase from '../components/AuthVisualShowcase';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authAPI.register(formData);

      if (res.data && res.data.success) {
        setSuccess('Registration successful! Redirecting...');
        // Auto-login user with generated token
        login(res.data.token, res.data.user);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      try {
        const res = await authAPI.googleLogin({
          email: user.email,
          name: user.displayName || 'Google User',
          firebase_uid: user.uid,
        });

        if (res.data && res.data.success) {
          login(res.data.token, res.data.user);
          navigate('/', { replace: true });
          return;
        }
      } catch (backendErr) {
        console.warn('Backend googleLogin warning, using Firebase fallback:', backendErr);
        const idToken = await user.getIdToken();
        const fallbackUser = {
          id: user.uid,
          _id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
          email: user.email,
          photoURL: user.photoURL,
        };
        login(idToken, fallbackUser);
        navigate('/', { replace: true });
        return;
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Google authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-card">
        {/* Form Side */}
        <div className="auth-form-side">
          {/* Brand header */}
          <Link to="/" className="auth-brand-badge">
            <div className="auth-brand-logo-wrap">
              <ShoppingBag size={20} />
            </div>
            <span className="auth-brand-title">EKART</span>
            <span className="auth-brand-tag">PREMIUM</span>
          </Link>

          {/* Welcome chip */}
          <div className="auth-welcome-chip">
            <span>✨ Start your journey</span>
          </div>

          <h2 className="auth-heading">Create Account</h2>
          <p className="auth-subheading">
            Sign up to unlock exclusive offers, fast checkout & rewards
          </p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-success-banner">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <span>Full Name *</span>
              </label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. Nakka Kavya"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <span>Email Address *</span>
              </label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  <span>Password *</span>
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-toggle-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm_password">
                  <span>Confirm Password *</span>
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    placeholder="Re-enter password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="input-toggle-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                <span>Phone Number (Optional)</span>
              </label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="tel"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={18} className="btn-arrow-icon" />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-text">OR CONTINUE WITH</span>
            <div className="auth-divider-line"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-google-auth"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20c11 0 19.8-8.775 20-19.814v-4.103h-1.389V20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Visual Showcase Side */}
        <AuthVisualShowcase mode="register" />
      </div>
    </div>
  );
};

export default Register;
