import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getStoredIdToken, isTokenExpired, parseJwt, removeStoredIdToken, setStoredIdToken, UserProfile } from '../utils/auth';

interface AuthContextType {
  idToken: string | null;
  user: UserProfile | null;
  login: (credential: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idToken, setIdToken] = useState<string | null>(() => {
    const token = getStoredIdToken();
    return token && !isTokenExpired(token) ? token : null;
  });
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    const token = getStoredIdToken();
    return token && !isTokenExpired(token) ? parseJwt(token) : null;
  });

  const login = (credential: string) => {
    setStoredIdToken(credential);
    setIdToken(credential);
    setUser(parseJwt(credential));
  };

  const logout = () => {
    removeStoredIdToken();
    setIdToken(null);
    setUser(null);
  };

  useEffect(() => {
    const checkToken = () => {
      const token = getStoredIdToken();
      if (token) {
        if (isTokenExpired(token)) {
          logout();
        } else {
          const parsed = parseJwt(token);
          if (parsed) setUser(parsed);
        }
      }
    };

    checkToken();
    // Check token expiration status every 60 seconds
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ idToken, user, login, logout }}>
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

