import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_BACKEND_URL } from '@money-manager/core';
import {
  api,
  clearAllAuthTokens,
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredUser,
  setStoredUser,
  UserProfile,
} from '@money-manager/dc-client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (idToken?: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const token = getStoredAccessToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Validate and refresh profile against backend
    api.auth.getMe()
      .then((res) => {
        if (mounted && res.success && res.data?.user) {
          setUser(res.data.user);
          setStoredUser(res.data.user);
        }
      })
      .catch(() => {
        if (mounted && !getStoredUser()) {
          setUser(null);
          clearAllAuthTokens();
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loginWithGoogle = async (idToken?: string) => {
    if (!idToken) {
      throw new Error('Google identity token is required.');
    }

    setIsLoading(true);
    try {
      const endpoint = `${AUTH_BACKEND_URL.replace(/\/+$/, '')}/api/auth/google`;
      const response = await axios.post(
        endpoint,
        { idToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data?.token;
      const userProfile = response.data?.user;

      if (!token) {
        throw new Error('Authentication backend did not return a session token.');
      }

      setStoredAccessToken(token);
      if (userProfile) {
        setStoredUser(userProfile);
        setUser(userProfile);
      }

      // Sync with derivecount backend
      try {
        const meRes = await api.auth.getMe();
        if (meRes.success && meRes.data?.user) {
          setUser(meRes.data.user);
          setStoredUser(meRes.data.user);
        }
      } catch {
        // Non-fatal if derivecount backend is cold
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
    setUser(demoUser);
  };

  const logout = async () => {
    clearAllAuthTokens();
    setUser(null);
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
