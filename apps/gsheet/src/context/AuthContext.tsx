import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, mapSupabaseUser } from '@money-manager/core';
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

// Helper to inspect if Supabase saved a session in localStorage
const getSupabaseStoredSession = (): { access_token?: string; refresh_token?: string; user?: any; expires_at?: number } | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.access_token) {
            if (!parsed.expires_at || parsed.expires_at * 1000 > Date.now()) {
              return parsed;
            }
          }
        }
      }
    }
  } catch {
    // Ignore JSON errors
  }
  return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check if we are currently handling an active OAuth callback redirect in URL
  const isOAuthRedirect = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token=') ||
    window.location.search.includes('code=') ||
    window.location.hash.includes('code=')
  );

  // Synchronous initialization from localStorage for instantaneous first paint
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const stored = getStoredAccessToken();
    if (stored && !isTokenExpired(stored)) {
      return stored;
    }
    const sb = getSupabaseStoredSession();
    if (sb?.access_token) {
      setStoredAccessToken(sb.access_token);
      if (sb.refresh_token) setStoredRefreshToken(sb.refresh_token);
      return sb.access_token;
    }
    return null;
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return getStoredRefreshToken() || getSupabaseStoredSession()?.refresh_token || null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const storedUser = getStoredUser();
    if (storedUser) return storedUser;
    const sb = getSupabaseStoredSession();
    if (sb?.user) {
      const mapped = mapSupabaseUser(sb.user);
      if (mapped) setStoredUser(mapped);
      return mapped;
    }
    const stored = getStoredAccessToken();
    if (stored && !isTokenExpired(stored)) {
      return parseJwt(stored);
    }
    return null;
  });

  // Only block the UI with a loading screen if we are waiting for an OAuth PKCE redirect exchange
  const [isLoading, setIsLoading] = useState<boolean>(() => isOAuthRedirect);

  // Authenticate using Google OAuth through Supabase Auth
  const login = async (_googleCredential?: string) => {
    setIsLoading(true);
    try {
      const defaultRedirectUrl = `${window.location.origin}${window.location.pathname}`;
      const authRedirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL || defaultRedirectUrl;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authRedirectUrl,
          scopes: 'openid email profile',
        },
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke session and logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAllAuthTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial session fetch & automatic URL PKCE exchange
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error || !session) {
        // Only clear if no existing valid token was found in local storage
        const currentStored = getStoredAccessToken();
        if (!currentStored || isTokenExpired(currentStored)) {
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
          clearAllAuthTokens();
        }
        setIsLoading(false);
        return;
      }

      setStoredAccessToken(session.access_token);
      if (session.refresh_token) {
        setStoredRefreshToken(session.refresh_token);
      }
      const mappedUser = mapSupabaseUser(session.user);
      if (mappedUser) {
        setStoredUser(mappedUser);
      }

      setAccessToken(session.access_token);
      setRefreshToken(session.refresh_token || null);
      setUser(mappedUser);
      setIsLoading(false);
    }).catch(() => {
      if (mounted) {
        const currentStored = getStoredAccessToken();
        if (!currentStored || isTokenExpired(currentStored)) {
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setStoredAccessToken(session.access_token);
        if (session.refresh_token) {
          setStoredRefreshToken(session.refresh_token);
        }
        const mappedUser = mapSupabaseUser(session.user);
        if (mappedUser) {
          setStoredUser(mappedUser);
        }

        setAccessToken(session.access_token);
        setRefreshToken(session.refresh_token || null);
        setUser(mappedUser);
      } else {
        clearAllAuthTokens();
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
