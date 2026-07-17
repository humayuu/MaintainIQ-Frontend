import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // `loading` is true while we do the initial auth check on app load.
  const [loading, setLoading] = useState(true);

  // Clear the session everywhere.
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Persist a fresh session (called after a successful login/register).
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser ?? null);
  }, []);

  // Replace the cached user after a profile edit (no token change). Keeps the
  // Topbar/avatar in sync without a full re-login.
  const updateUser = useCallback((nextUser) => {
    if (!nextUser) return;
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  // On mount: if we have a token, validate it by fetching the current user.
  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Optimistically hydrate from cached user for a snappier first paint.
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }

      try {
        const { data } = await authApi.me();
        if (!active) return;
        // Backend envelope: { success, data: { user } }.
        const currentUser = data?.data?.user ?? data?.user ?? data;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        // Token invalid/expired — the axios 401 interceptor will also fire,
        // but clear locally in case this was a non-401 failure.
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [logout]);

  // Keep React state in sync when the axios interceptor force-logs-out.
  useEffect(() => {
    const handleForcedLogout = () => logout();
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
