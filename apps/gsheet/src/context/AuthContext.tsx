import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, mapSupabaseUser } from '@money-manager/core';
import { clearAllAuthTokens, UserProfile } from '../utils/auth';

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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setAccessToken(session.access_token);
      setRefreshToken(session.refresh_token || null);
      setUser(mapSupabaseUser(session.user));
      setIsLoading(false);
    }).catch(() => {
      if (mounted) {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setAccessToken(session.access_token);
        setRefreshToken(session.refresh_token || null);
        setUser(mapSupabaseUser(session.user));
      } else {
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
