import { createAuthStorage, parseJwt, isTokenExpired, UserProfile } from '@money-manager/core';

export type { UserProfile };
export { parseJwt, isTokenExpired };

// Isolated storage scoped specifically for Google Sheets Frontend
export const gsheetAuthStorage = createAuthStorage('gsheet');

export const getStoredAccessToken = (): string | null => {
  // Support migration fallback from un-namespaced legacy key
  return gsheetAuthStorage.getStoredAccessToken() || localStorage.getItem('access_token');
};

export const setStoredAccessToken = (token: string): void => {
  gsheetAuthStorage.setStoredAccessToken(token);
  // Clean up legacy key to prevent leakage into other sub-apps
  localStorage.removeItem('access_token');
};

export const removeStoredAccessToken = (): void => {
  gsheetAuthStorage.removeStoredAccessToken();
  localStorage.removeItem('access_token');
};

export const getStoredRefreshToken = (): string | null => {
  return gsheetAuthStorage.getStoredRefreshToken() || localStorage.getItem('refresh_token');
};

export const setStoredRefreshToken = (token: string): void => {
  gsheetAuthStorage.setStoredRefreshToken(token);
  localStorage.removeItem('refresh_token');
};

export const removeStoredRefreshToken = (): void => {
  gsheetAuthStorage.removeStoredRefreshToken();
  localStorage.removeItem('refresh_token');
};

export const getStoredUser = (): UserProfile | null => {
  return gsheetAuthStorage.getStoredUser() || (() => {
    const legacy = localStorage.getItem('user_profile');
    if (!legacy) return null;
    try { return JSON.parse(legacy); } catch { return null; }
  })();
};

export const setStoredUser = (user: UserProfile): void => {
  gsheetAuthStorage.setStoredUser(user);
  localStorage.removeItem('user_profile');
};

export const removeStoredUser = (): void => {
  gsheetAuthStorage.removeStoredUser();
  localStorage.removeItem('user_profile');
};

export const clearAllAuthTokens = (): void => {
  gsheetAuthStorage.clearAllAuthTokens();
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('google_id_token');
};

// Deprecated compatibility fallback helpers
export const getStoredIdToken = getStoredAccessToken;
export const setStoredIdToken = setStoredAccessToken;
export const removeStoredIdToken = clearAllAuthTokens;
