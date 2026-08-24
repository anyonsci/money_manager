import { UserProfile } from '../types/index';

export interface AuthStorage {
  getStoredAccessToken: () => string | null;
  setStoredAccessToken: (token: string) => void;
  removeStoredAccessToken: () => void;
  getStoredRefreshToken: () => string | null;
  setStoredRefreshToken: (token: string) => void;
  removeStoredRefreshToken: () => void;
  getStoredUser: () => UserProfile | null;
  setStoredUser: (user: UserProfile) => void;
  removeStoredUser: () => void;
  clearAllAuthTokens: () => void;
  getStoredItem: (key: string) => string | null;
  setStoredItem: (key: string, value: string) => void;
  removeStoredItem: (key: string) => void;
}

/**
 * Creates an isolated localStorage manager scoped to an application prefix.
 * Prevents multiple frontends hosted under the same origin (e.g. GitHub Pages)
 * from overriding each other's sessions, tokens, or user profiles.
 */
export function createAuthStorage(appPrefix: string): AuthStorage {
  const prefix = appPrefix.endsWith('_') ? appPrefix : `${appPrefix}_`;
  const accessKey = `${prefix}access_token`;
  const refreshKey = `${prefix}refresh_token`;
  const userKey = `${prefix}user_profile`;

  return {
    getStoredAccessToken: (): string | null => {
      return localStorage.getItem(accessKey);
    },
    setStoredAccessToken: (token: string): void => {
      localStorage.setItem(accessKey, token);
    },
    removeStoredAccessToken: (): void => {
      localStorage.removeItem(accessKey);
    },
    getStoredRefreshToken: (): string | null => {
      return localStorage.getItem(refreshKey);
    },
    setStoredRefreshToken: (token: string): void => {
      localStorage.setItem(refreshKey, token);
    },
    removeStoredRefreshToken: (): void => {
      localStorage.removeItem(refreshKey);
    },
    getStoredUser: (): UserProfile | null => {
      const raw = localStorage.getItem(userKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    setStoredUser: (user: UserProfile): void => {
      localStorage.setItem(userKey, JSON.stringify(user));
    },
    removeStoredUser: (): void => {
      localStorage.removeItem(userKey);
    },
    clearAllAuthTokens: (): void => {
      localStorage.removeItem(accessKey);
      localStorage.removeItem(refreshKey);
      localStorage.removeItem(userKey);
    },
    getStoredItem: (key: string): string | null => {
      return localStorage.getItem(`${prefix}${key}`);
    },
    setStoredItem: (key: string, value: string): void => {
      localStorage.setItem(`${prefix}${key}`, value);
    },
    removeStoredItem: (key: string): void => {
      localStorage.removeItem(`${prefix}${key}`);
    }
  };
}

export const parseJwt = (token: string): UserProfile | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      id: parsed.sub || parsed.id,
      email: parsed.email || parsed.sub || '',
      name: parsed.name,
      picture: parsed.picture || parsed.avatar,
      avatar: parsed.avatar || parsed.picture,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const user = parseJwt(token);
  if (!user || !user.exp) return true;
  return Date.now() >= user.exp * 1000 - 60000;
};
