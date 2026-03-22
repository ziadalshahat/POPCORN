import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage() {
  const [tab, setTab]             = useState('login'); // 'login' | 'signup'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [name, setName]           = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [success, setSuccess]     = useState(false);
  const { login, signup, loading, error, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (tab === 'login') {
      result = await login(email, password);
    } else {
      result = await signup(name, email, password);
    }
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    }
  };

  return (
    <div className="auth-page">
      {/* Background gradient */}
      <div className="auth-page__bg" />

      <motion.div
        className="auth-page__card glass-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="auth-page__logo">
          POP<span>CORN</span>
        </div>
        <p className="auth-page__subtitle">Your premium streaming experience</p>

        {/* Tabs */}
        <div className="auth-page__tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              className="auth-page__success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="auth-success-icon">✓</div>
              <h3>Welcome{name ? `, ${name}` : ''}!</h3>
              <p>Redirecting to home...</p>
            </motion.div>
          ) : (
            <motion.form
              key={tab}
              className="auth-page__form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'signup' && (
                <div className="auth-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <div className="auth-field__password">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pass"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label="Toggle password"
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="auth-submit btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <p className="auth-switch">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
                >
                  {tab === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AuthPage;
