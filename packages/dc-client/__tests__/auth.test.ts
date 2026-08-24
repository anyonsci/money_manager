import {
  dcAuthStorage,
  getStoredAccessToken,
  setStoredAccessToken,
  removeStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  removeStoredRefreshToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  getStoredActiveWorkspaceId,
  setStoredActiveWorkspaceId,
  clearAllAuthTokens,
} from '../src/auth/index';

describe('DC Client - Auth Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes dcAuthStorage with dc_ prefix', () => {
    expect(dcAuthStorage).toBeDefined();
    dcAuthStorage.setStoredAccessToken('sample');
    expect(localStorage.getItem('dc_access_token')).toBe('sample');
  });

  it('manages access token', () => {
    expect(getStoredAccessToken()).toBeNull();
    setStoredAccessToken('dc-jwt-token');
    expect(getStoredAccessToken()).toBe('dc-jwt-token');
    removeStoredAccessToken();
    expect(getStoredAccessToken()).toBeNull();
  });

  it('manages refresh token', () => {
    expect(getStoredRefreshToken()).toBeNull();
    setStoredRefreshToken('dc-refresh-token');
    expect(getStoredRefreshToken()).toBe('dc-refresh-token');
    removeStoredRefreshToken();
    expect(getStoredRefreshToken()).toBeNull();
  });

  it('manages user profile', () => {
    expect(getStoredUser()).toBeNull();
    const user = { email: 'ledger@dc.org', name: 'Ledger Master' };
    setStoredUser(user);
    expect(getStoredUser()).toEqual(user);
    removeStoredUser();
    expect(getStoredUser()).toBeNull();
  });

  it('manages active workspace ID', () => {
    expect(getStoredActiveWorkspaceId()).toBeNull();
    setStoredActiveWorkspaceId('ws_12345');
    expect(getStoredActiveWorkspaceId()).toBe('ws_12345');
    expect(localStorage.getItem('dc_active_workspace_id')).toBe('ws_12345');
  });

  it('clears all auth tokens including active workspace ID', () => {
    setStoredAccessToken('token');
    setStoredRefreshToken('refresh');
    setStoredUser({ email: 'user@test.com' });
    setStoredActiveWorkspaceId('ws-999');

    clearAllAuthTokens();

    expect(getStoredAccessToken()).toBeNull();
    expect(getStoredRefreshToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(getStoredActiveWorkspaceId()).toBeNull();
  });
});
