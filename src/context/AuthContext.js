import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback((session) => {
    if (!session?.accessToken || !session?.user) {
      clearSession();
      return null;
    }

    setAccessToken(session.accessToken);
    setUser(session.user);
    return session;
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.accessToken) {
        clearSession();
        return null;
      }

      return applySession({ accessToken: payload.accessToken, user: payload.user });
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await refreshSession();
      if (!cancelled) {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  const login = useCallback((session) => applySession(session), [applySession]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const authFetch = useCallback(async (input, init = {}) => {
    const doFetch = (token) => {
      const headers = new Headers(init.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return fetch(input, {
        ...init,
        headers,
        credentials: 'include'
      });
    };

    let response = await doFetch(accessToken);
    if (response.status !== 401) {
      return response;
    }

    const refreshed = await refreshSession();
    if (!refreshed?.accessToken) {
      clearSession();
      return response;
    }

    response = await doFetch(refreshed.accessToken);
    if (response.status === 401) {
      clearSession();
    }
    return response;
  }, [accessToken, refreshSession]);

  const value = useMemo(() => ({
    accessToken,
    user,
    username: user?.username || '',
    role: user?.role || 'user',
    isAdmin: user?.role === 'admin',
    isAuthenticated: Boolean(accessToken && user),
    loading,
    login,
    logout,
    refreshSession,
    authFetch
  }), [accessToken, authFetch, loading, login, logout, refreshSession, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}