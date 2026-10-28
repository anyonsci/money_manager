import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { AUTH_BACKEND_URL } from '@money-manager/core';
import {
  clearAllAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  isTokenExpired,
  parseJwt,
  setStoredAccessToken,
  setStoredUser,
  UserProfile,
} from '../utils/auth';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null; // Alias for accessToken for backward compatibility
  user: UserProfile | null;
  login: (googleCredential?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronous initialization from localStorage for instantaneous first paint
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const stored = getStoredAccessToken();
    if (stored && !isTokenExpired(stored)) {
      return stored;
    }
    return null;
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return getStoredRefreshToken() || null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const storedUser = getStoredUser();
    if (storedUser) return storedUser;
    const stored = getStoredAccessToken();
    if (stored && !isTokenExpired(stored)) {
      return parseJwt(stored);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Authenticate using Google OAuth through centralized auth-backend
  const login = async (googleCredential?: string) => {
    if (!googleCredential) {
      throw new Error('Google credential token is required.');
    }

    setIsLoading(true);
    try {
      const endpoint = `${AUTH_BACKEND_URL.replace(/\/+$/, '')}/api/auth/google`;
      const response = await axios.post(
        endpoint,
        { idToken: googleCredential },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = response.data?.token;
      const userProfile = response.data?.user;

      if (!token) {
        throw new Error('Authentication backend did not return a session token.');
      }

      setStoredAccessToken(token);
      setAccessToken(token);

      if (userProfile) {
        setStoredUser(userProfile);
        setUser(userProfile);
      } else {
        const parsed = parseJwt(token);
        if (parsed) {
          setStoredUser(parsed);
          setUser(parsed);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke session and logout
  const logout = async () => {
    clearAllAuthTokens();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        idToken: accessToken, // Alias for backward compatibility
        user,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
