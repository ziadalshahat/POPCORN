import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { registerUser, loginUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'popcorn_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorTimerRef = useRef(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setError(null), 5000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error]);

  const clearError = () => setError(null);

  // On mount, check if we have a saved token and fetch user data
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data);
      } catch {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  /**
   * Login — calls POST /api/auth/login
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) throw new Error('Email and password required');
      const res = await loginUser({ email, password });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup — calls POST /api/auth/register
   */
  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (!name || !email || !password) throw new Error('All fields required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      const res = await registerUser({ name, email, password });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
