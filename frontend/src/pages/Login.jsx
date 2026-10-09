import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  X,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import AuthVisualShowcase from '../components/AuthVisualShowcase';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotTab, setForgotTab] = useState('direct'); // 'direct' or 'email'
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password;

    try {
      setLoading(true);
      setError('');

      // 1. Attempt standard backend login
      try {
        const res = await authAPI.login({ email: cleanEmail, password: cleanPassword });
        if (res.data && res.data.success) {
          login(res.data.token, res.data.user);
          navigate(redirectPath, { replace: true });
          return;
        }
      } catch (backendErr) {
        // 2. If backend login failed, check if password was recently updated in Firebase!
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          if (userCredential && userCredential.user) {
            // Password verified by Firebase! Sync it to MongoDB backend immediately
            await authAPI.forgotPassword({
              email: cleanEmail,
              new_password: cleanPassword,
              confirm_password: cleanPassword,
              name: userCredential.user.displayName || cleanEmail.split('@')[0],
            });

            // Now log in with backend with the freshly synced password
            const retryRes = await authAPI.login({ email: cleanEmail, password: cleanPassword });
            if (retryRes.data && retryRes.data.success) {
              login(retryRes.data.token, retryRes.data.user);
              navigate(redirectPath, { replace: true });
              return;
            }
          }
        } catch (firebaseErr) {
          console.warn('Firebase login verification:', firebaseErr.message);
        }

        // If Firebase check didn't succeed either, display backend error
        throw backendErr;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
          navigate(redirectPath, { replace: true });
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
        navigate(redirectPath, { replace: true });
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

  // Handle Password Reset Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError('');
      setForgotSuccess('');

      const res = await authAPI.forgotPassword({
        email: forgotEmail,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });

      if (res.data && res.data.success) {
        setForgotSuccess(res.data.message || 'Password reset successfully!');
        setFormData((prev) => ({ ...prev, email: forgotEmail, password: '' }));
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotSuccess('');
        }, 2500);
      } else {
        setForgotError(res.data?.message || 'Password reset failed');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Send Firebase password reset email
  const handleSendFirebaseReset = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter your email address first');
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError('');
      setForgotSuccess('');

      // Send reset link configured to return to our application's reset page
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };

      try {
        await sendPasswordResetEmail(auth, forgotEmail, actionCodeSettings);
      } catch (configErr) {
        console.warn('ActionCodeSettings fallback:', configErr);
        await sendPasswordResetEmail(auth, forgotEmail);
      }

      setForgotSuccess('A password reset link has been sent to your email! Please open the LATEST email received and click the link.');
    } catch (err) {
      console.warn('Firebase reset email note:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setForgotError('Email/Password provider is disabled in Firebase Console. Please use the Instant Direct Reset tab.');
      } else if (err.code === 'auth/user-not-found') {
        setForgotError('No user found with this email in Firebase. Please use the Instant Direct Reset tab.');
      } else {
        setForgotError(err.message || 'Could not send reset email. Please use the Instant Direct Reset tab.');
      }
    } finally {
      setForgotLoading(false);
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

          {/* Greeting badge */}
          <div className="auth-welcome-chip">
            <span>Welcome back !!!</span>
          </div>

          <h2 className="auth-heading">Sign in</h2>
          <p className="auth-subheading">Enter your email and password to access your account</p>

          {location.state?.message && (
            <div className="auth-info-banner">{location.state.message}</div>
          )}

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <span>Email Address</span>
              </label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="test@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(formData.email || '');
                    setForgotError('');
                    setForgotSuccess('');
                    setShowForgotModal(true);
                  }}
                  className="forgot-password-btn"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-toggle-btn"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <span>SIGN IN</span>
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
            <span>Continue with Google</span>
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account ?{' '}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Visual Right Side */}
        <AuthVisualShowcase mode="login" />
      </div>

     { /* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: '#f1f5f9',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
              title="Close"
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#fff7ed',
                  color: '#ea580c',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
              >
                <KeyRound size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                Reset Your Password
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                Choose how you'd like to reset your account password.
              </p>
            </div>

            {/* Reset Mode Tabs */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setForgotTab('direct');
                  setForgotError('');
                  setForgotSuccess('');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: forgotTab === 'direct' ? '#fff' : 'transparent',
                  color: forgotTab === 'direct' ? '#0f172a' : '#64748b',
                  fontWeight: forgotTab === 'direct' ? '600' : '500',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: forgotTab === 'direct' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                ⚡ Instant Direct Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotTab('email');
                  setForgotError('');
                  setForgotSuccess('');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: forgotTab === 'email' ? '#fff' : 'transparent',
                  color: forgotTab === 'email' ? '#0f172a' : '#64748b',
                  fontWeight: forgotTab === 'email' ? '600' : '500',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: forgotTab === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                ✉️ Email Reset Link
              </button>
            </div>

            {forgotError && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  borderRadius: '8px',
                  color: '#16a34a',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotTab === 'direct' ? (
              <form onSubmit={handleResetPassword}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>
                    Registered Email Address *
                  </label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>
                    New Password * (min 6 chars)
                  </label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="input-toggle-btn"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>
                    Confirm New Password *
                  </label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      minLength={6}
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-auth-submit"
                  style={{ width: '100%' }}
                >
                  {forgotLoading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                  <span>{forgotLoading ? 'Updating Password...' : 'Reset Password Instantly'}</span>
                </button>
              </form>
            ) : (
              <div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>
                    Email Address to Receive Reset Link *
                  </label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendFirebaseReset}
                  disabled={forgotLoading}
                  className="btn-auth-submit"
                  style={{ width: '100%', marginBottom: '1rem' }}
                >
                  {forgotLoading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    <Mail size={18} />
                  )}
                  <span>{forgotLoading ? 'Sending Email Link...' : 'Send Reset Link to Email'}</span>
                </button>

                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#92400e',
                    lineHeight: '1.45',
                  }}
                >
                  <strong>⚠️ Why email links show "Expired or Already Used":</strong>
                  <ul style={{ paddingLeft: '1.15rem', marginTop: '0.35rem', marginBottom: 0 }}>
                    <li><strong>Firebase Setup:</strong> In Firebase Console, the "Email/Password" provider must be enabled (otherwise all reset links fail).</li>
                    <li><strong>One-time only:</strong> Every time you request a link, all previous email links become invalid.</li>
                    <li><strong>Best Solution:</strong> Switch to the <strong>⚡ Instant Direct Reset</strong> tab above to reset your password directly without email delays!</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
