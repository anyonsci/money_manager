import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import {
  clearAllAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  isTokenExpired,
  parseJwt,
  setStoredAccessToken,
  setStoredRefreshToken,
  setStoredUser,
  UserProfile
} from '../utils/auth';
import { getApiUrl } from '../services/apiClient';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null; // Alias for accessToken for backward compatibility
  user: UserProfile | null;
  login: (googleCredential: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getStoredRefreshToken());
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authenticate with Google credential and request custom JWT pair from backend
  const login = async (googleCredential: string) => {
    setIsLoading(true);
    try {
      const apiUrl = getApiUrl();
      if (!apiUrl) {
        // Fallback for offline/demo mode
        const parsed = parseJwt(googleCredential);
        const demoUser: UserProfile = parsed || { email: 'demo@example.com', name: 'Demo User' };
        setStoredAccessToken(googleCredential);
        setAccessToken(googleCredential);
        setStoredUser(demoUser);
        setUser(demoUser);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        apiUrl,
        JSON.stringify({
          action: 'login',
          idToken: googleCredential
        }),
        {
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        }
      );

      const data = response.data;
      if (data.success) {
        const newAccessToken = data.accessToken || data.data?.accessToken;
        const newRefreshToken = data.refreshToken || data.data?.refreshToken;
        const googleUser = parseJwt(googleCredential);
        const authenticatedUser: UserProfile = {
          email: data.user?.email || data.data?.user?.email || googleUser?.email || '',
          name: googleUser?.name || data.user?.name,
          picture: googleUser?.picture || data.user?.picture
        };

        setStoredAccessToken(newAccessToken);
        setStoredRefreshToken(newRefreshToken);
        setStoredUser(authenticatedUser);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(authenticatedUser);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      clearAllAuthTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke session and logout
  const logout = async () => {
    try {
      const apiUrl = getApiUrl();
      const currentRefreshToken = getStoredRefreshToken();
      const currentUser = getStoredUser();

      if (apiUrl && (currentRefreshToken || currentUser?.email)) {
        await axios.post(
          apiUrl,
          JSON.stringify({
            action: 'logout',
            refreshToken: currentRefreshToken,
            email: currentUser?.email
          }),
          {
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          }
        ).catch(() => {});
      }
    } finally {
      clearAllAuthTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccess = getStoredAccessToken();
      const storedRefresh = getStoredRefreshToken();
      const storedProfile = getStoredUser();

      if (!storedAccess && !storedRefresh) {
        setIsLoading(false);
        return;
      }

      // Check if Access Token is still valid
      if (storedAccess && !isTokenExpired(storedAccess)) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        setUser(storedProfile || parseJwt(storedAccess));
        setIsLoading(false);
        return;
      }

      // Access Token expired or missing, attempt silent refresh with Refresh Token
      if (storedRefresh && storedProfile?.email) {
        try {
          const apiUrl = getApiUrl();
          if (apiUrl) {
            const response = await axios.post(
              apiUrl,
              JSON.stringify({
                action: 'refresh',
                refreshToken: storedRefresh,
                email: storedProfile.email
              }),
              {
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
              }
            );

            const data = response.data;
            const newAccessToken = data.accessToken || data.data?.accessToken;

            if (data.success && newAccessToken) {
              setStoredAccessToken(newAccessToken);
              setAccessToken(newAccessToken);
              setRefreshToken(storedRefresh);
              setUser(storedProfile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Initial token refresh failed:', err);
        }
      }

      // If refresh fails or no valid tokens remain
      clearAllAuthTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

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
