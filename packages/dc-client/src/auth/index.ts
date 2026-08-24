import { createAuthStorage, parseJwt, isTokenExpired, UserProfile } from '@money-manager/core';

export type { UserProfile };
export { parseJwt, isTokenExpired };

// Shared DeriveCount storage namespace used across all dc_* applications
export const dcAuthStorage = createAuthStorage('dc');

export const getStoredAccessToken = (): string | null => {
  return dcAuthStorage.getStoredAccessToken();
};

export const setStoredAccessToken = (token: string): void => {
  dcAuthStorage.setStoredAccessToken(token);
};

export const removeStoredAccessToken = (): void => {
  dcAuthStorage.removeStoredAccessToken();
};

export const getStoredRefreshToken = (): string | null => {
  return dcAuthStorage.getStoredRefreshToken();
};

export const setStoredRefreshToken = (token: string): void => {
  dcAuthStorage.setStoredRefreshToken(token);
};

export const removeStoredRefreshToken = (): void => {
  dcAuthStorage.removeStoredRefreshToken();
};

export const getStoredUser = (): UserProfile | null => {
  return dcAuthStorage.getStoredUser();
};

export const setStoredUser = (user: UserProfile): void => {
  dcAuthStorage.setStoredUser(user);
};

export const removeStoredUser = (): void => {
  dcAuthStorage.removeStoredUser();
};

export const getStoredActiveWorkspaceId = (): string | null => {
  return dcAuthStorage.getStoredItem('active_workspace_id');
};

export const setStoredActiveWorkspaceId = (workspaceId: string): void => {
  dcAuthStorage.setStoredItem('active_workspace_id', workspaceId);
};

export const clearAllAuthTokens = (): void => {
  dcAuthStorage.clearAllAuthTokens();
  dcAuthStorage.removeStoredItem('active_workspace_id');
};
