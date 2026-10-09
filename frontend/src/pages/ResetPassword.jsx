import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If no code is present in URL
    if (!oobCode) {
      setVerifying(false);
      setError('No reset code found in the link. Please request a new password reset link.');
      return;
    }

    // Verify the action code with Firebase
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setCodeValid(true);
        setVerifying(false);
      })
      .catch((err) => {
        setVerifying(false);
        setCodeValid(false);
        if (err.code === 'auth/expired-action-code') {
          setError('This password reset link has expired. Password reset links are valid for a limited time.');
        } else if (err.code === 'auth/invalid-action-code') {
          setError('This password reset link is invalid or has already been used. If you requested multiple links, please click the one in the most recent email.');
        } else {
          setError(err.message || 'The reset link is invalid or expired.');
        }
      });
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // 1. Confirm password reset in Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);

      // 2. Synchronize password in backend MongoDB if user email is known
      if (email) {
        try {
          await authAPI.forgotPassword({
            email,
            new_password: newPassword,
            confirm_password: confirmPassword,
          });
        } catch (backendErr) {
          console.warn('Backend password sync note:', backendErr);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful! You can now log in with your new password.' },
        });
      }, 3000);
    } catch (err) {
      if (err.code === 'auth/expired-action-code') {
        setError('This reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This reset link has already been used. Please request a new reset email.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <div className="auth-icon-badge">
            <KeyRound size={26} />
          </div>
          <h2 className="auth-title">Create New Password</h2>
          <p className="auth-subtitle">
            {email ? `Resetting password for ${email}` : 'Set a new secure password for your account'}
          </p>
        </div>

        {verifying ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div className="btn-spinner" style={{ margin: '0 auto 1rem', width: '28px', height: '28px', borderTopColor: '#ea580c' }}></div>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Verifying your reset link...</p>
          </div>
        ) : error && !codeValid ? (
          <div style={{ padding: '0.5rem 0' }}>
            <div className="auth-error-banner" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
              <strong>Why did this happen?</strong>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>A newer reset email was requested (only the newest link works).</li>
                <li>The link was already clicked or previewed by an email scanner.</li>
                <li>The link expired after 1 hour.</li>
              </ul>
            </div>
            <Link to="/login" className="btn-auth-submit" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center' }}>
              <ArrowLeft size={18} />
              <span>Return to Login to Try Again</span>
            </Link>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ color: '#16a34a', marginBottom: '1rem' }}>
              <CheckCircle2 size={54} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              Password Reset Complete!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your password has been successfully updated. Redirecting to login...
            </p>
            <Link to="/login" className="btn-auth-submit" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              <span>Go to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password (minimum 6 characters)
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="form-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-toggle-btn"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="form-input"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-auth-submit">
              {submitting ? <span className="btn-spinner"></span> : <KeyRound size={18} />}
              <span>{submitting ? 'Updating Password...' : 'Save New Password'}</span>
            </button>

            <div className="auth-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem' }}>
              <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
