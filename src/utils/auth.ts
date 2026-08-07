export interface UserProfile {
  email: string;
  name?: string;
  picture?: string;
  exp?: number;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_profile';

// Access Token Helpers
export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setStoredAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeStoredAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// Refresh Token Helpers
export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeStoredRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// User Profile Helpers
export const getStoredUser = (): UserProfile | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: UserProfile): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Clear All Auth Storage
export const clearAllAuthTokens = (): void => {
  removeStoredAccessToken();
  removeStoredRefreshToken();
  removeStoredUser();
  localStorage.removeItem('google_id_token'); // Clear legacy key if present
};

// Deprecated / Compatibility fallback helpers for existing components
export const getStoredIdToken = getStoredAccessToken;
export const setStoredIdToken = setStoredAccessToken;
export const removeStoredIdToken = clearAllAuthTokens;

// JWT Parsing and Expiry check
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
      email: parsed.email || parsed.sub || '',
      name: parsed.name,
      picture: parsed.picture,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const user = parseJwt(token);
  if (!user || !user.exp) return true;
  // Consider token expired 60 seconds before official expiration time to prevent API edge-cases
  return Date.now() >= user.exp * 1000 - 60000;
};
