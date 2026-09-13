import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, mapSupabaseUser } from '@money-manager/core';
import {
  api,
  clearAllAuthTokens,
  UserProfile
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    // 1. Check existing session on load (handles PKCE code exchange in URL automatically)
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      if (error || !session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const initialUser = mapSupabaseUser(session.user);
      setUser(initialUser);

      try {
        const res = await api.auth.getMe();
        if (res.success && res.data?.user && mounted) {
          setUser(res.data.user);
        }
      } catch {
        // Backend request will succeed once available
      } finally {
        if (mounted) setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        setIsLoading(false);

        if (event === 'SIGNED_IN') {
          try {
            const res = await api.auth.getMe();
            if (res.success && res.data?.user && mounted) {
              setUser(res.data.user);
            }
          } catch {
            // Ignore
          }
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (_idToken?: string) => {
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
    try {
      await supabase.auth.signOut();
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
