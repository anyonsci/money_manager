import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/index.js';
import { api } from '../services/api.js';
import {
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredRefreshToken,
  getStoredUser,
  setStoredUser,
  clearAllAuthTokens,
} from '../utils/auth.js';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (token === 'demo-token') {
      const stored = getStoredUser() || {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
      };
      setUser(stored);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setStoredUser(res.data.user);
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      clearAllAuthTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.googleLogin(idToken);
      if (res.success && res.data) {
        const { token, refreshToken, user: profile } = res.data;
        setStoredAccessToken(token);
        if (refreshToken) setStoredRefreshToken(refreshToken);
        setStoredUser(profile);
        setUser(profile);
      } else {
        throw new Error(res.error?.message || 'Google login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = () => {
    const demoUser: UserProfile = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: '',
    };
    setStoredAccessToken('demo-token');
    setStoredUser(demoUser);
    setUser(demoUser);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAllAuthTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        loginWithGoogle,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
