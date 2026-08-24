import type { UserProfile } from '../types/index.js';

const ACCESS_TOKEN_KEY = 'dc_access_token';
const REFRESH_TOKEN_KEY = 'dc_refresh_token';
const USER_KEY = 'dc_user_profile';
const ACTIVE_WORKSPACE_KEY = 'dc_active_workspace_id';

export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('access_token');
};

export const setStoredAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeStoredAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('refresh_token');
};

export const setStoredRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeStoredRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): UserProfile | null => {
  const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('user_profile');
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

export const getStoredActiveWorkspaceId = (): string | null => {
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
};

export const setStoredActiveWorkspaceId = (workspaceId: string): void => {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
};

export const clearAllAuthTokens = (): void => {
  removeStoredAccessToken();
  removeStoredRefreshToken();
  removeStoredUser();
};
