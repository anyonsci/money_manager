import { createAuthStorage, parseJwt, isTokenExpired } from '../src/utils/auth';
import { UserProfile } from '../src/types/index';

describe('Core Utils - Auth & Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('createAuthStorage', () => {
    it('normalizes app prefix with underscore', () => {
      const storageWithoutUnderscore = createAuthStorage('myapp');
      storageWithoutUnderscore.setStoredAccessToken('token123');
      expect(localStorage.getItem('myapp_access_token')).toBe('token123');

      const storageWithUnderscore = createAuthStorage('myapp_');
      storageWithUnderscore.setStoredAccessToken('token456');
      expect(localStorage.getItem('myapp_access_token')).toBe('token456');
    });

    it('manages access token correctly', () => {
      const storage = createAuthStorage('test');
      expect(storage.getStoredAccessToken()).toBeNull();

      storage.setStoredAccessToken('sample-access-token');
      expect(storage.getStoredAccessToken()).toBe('sample-access-token');

      storage.removeStoredAccessToken();
      expect(storage.getStoredAccessToken()).toBeNull();
    });

    it('manages refresh token correctly', () => {
      const storage = createAuthStorage('test');
      expect(storage.getStoredRefreshToken()).toBeNull();

      storage.setStoredRefreshToken('sample-refresh-token');
      expect(storage.getStoredRefreshToken()).toBe('sample-refresh-token');

      storage.removeStoredRefreshToken();
      expect(storage.getStoredRefreshToken()).toBeNull();
    });

    it('manages user profile object correctly', () => {
      const storage = createAuthStorage('test');
      expect(storage.getStoredUser()).toBeNull();

      const user: UserProfile = {
        id: 'u123',
        email: 'user@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.png',
      };

      storage.setStoredUser(user);
      expect(storage.getStoredUser()).toEqual(user);

      storage.removeStoredUser();
      expect(storage.getStoredUser()).toBeNull();
    });

    it('handles corrupt JSON in user profile gracefully', () => {
      const storage = createAuthStorage('test');
      localStorage.setItem('test_user_profile', 'invalid-json-string{');
      expect(storage.getStoredUser()).toBeNull();
    });

    it('manages custom items with prefix', () => {
      const storage = createAuthStorage('test');
      storage.setStoredItem('custom_key', 'custom_value');
      expect(localStorage.getItem('test_custom_key')).toBe('custom_value');
      expect(storage.getStoredItem('custom_key')).toBe('custom_value');

      storage.removeStoredItem('custom_key');
      expect(storage.getStoredItem('custom_key')).toBeNull();
    });

    it('clears all auth tokens (access, refresh, user)', () => {
      const storage = createAuthStorage('test');
      storage.setStoredAccessToken('access');
      storage.setStoredRefreshToken('refresh');
      storage.setStoredUser({ email: 'test@example.com' });
      storage.setStoredItem('keep_item', 'value');

      storage.clearAllAuthTokens();

      expect(storage.getStoredAccessToken()).toBeNull();
      expect(storage.getStoredRefreshToken()).toBeNull();
      expect(storage.getStoredUser()).toBeNull();
      // custom item remains unless removed individually
      expect(storage.getStoredItem('keep_item')).toBe('value');
    });
  });

  describe('parseJwt', () => {
    const createFakeJwt = (payload: Record<string, unknown>): string => {
      const header = window.btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const body = window.btoa(JSON.stringify(payload));
      return `${header}.${body}.signature`;
    };

    it('parses valid JWT payload correctly', () => {
      const payload = {
        sub: 'user_12345',
        email: 'alex@example.com',
        name: 'Alex Smith',
        picture: 'https://example.com/pic.jpg',
        exp: 1700000000,
      };

      const token = createFakeJwt(payload);
      const parsed = parseJwt(token);

      expect(parsed).toEqual({
        id: 'user_12345',
        email: 'alex@example.com',
        name: 'Alex Smith',
        picture: 'https://example.com/pic.jpg',
        avatar: 'https://example.com/pic.jpg',
        exp: 1700000000,
      });
    });

    it('falls back to sub as email when email is missing', () => {
      const token = createFakeJwt({ sub: 'user_fallback', exp: 1700000000 });
      const parsed = parseJwt(token);

      expect(parsed?.id).toBe('user_fallback');
      expect(parsed?.email).toBe('user_fallback');
    });

    it('handles base64 url-safe characters (- and _)', () => {
      const jsonStr = JSON.stringify({ sub: 'test_sub', email: 'test@example.com' });
      const base64Url = window.btoa(jsonStr).replace(/\+/g, '-').replace(/\//g, '_');
      const token = `header.${base64Url}.sig`;

      const parsed = parseJwt(token);
      expect(parsed?.id).toBe('test_sub');
      expect(parsed?.email).toBe('test@example.com');
    });

    it('returns null for invalid token structure', () => {
      expect(parseJwt('')).toBeNull();
      expect(parseJwt('singleparttoken')).toBeNull();
      expect(parseJwt('part1.invalid base64!!!.part3')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    const createTokenWithExp = (expInSeconds: number): string => {
      const header = window.btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const body = window.btoa(JSON.stringify({ sub: 'user', exp: expInSeconds }));
      return `${header}.${body}.sig`;
    };

    it('returns true for invalid or unparseable tokens', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
      expect(isTokenExpired('')).toBe(true);
    });

    it('returns true for expired token', () => {
      const pastTimeSeconds = Math.floor((Date.now() - 100000) / 1000);
      const token = createTokenWithExp(pastTimeSeconds);
      expect(isTokenExpired(token)).toBe(true);
    });

    it('returns true if token expires within 60 second safety buffer', () => {
      const soonTimeSeconds = Math.floor((Date.now() + 30000) / 1000); // 30 seconds left
      const token = createTokenWithExp(soonTimeSeconds);
      expect(isTokenExpired(token)).toBe(true);
    });

    it('returns false for token with ample time remaining', () => {
      const futureTimeSeconds = Math.floor((Date.now() + 3600000) / 1000); // 1 hour left
      const token = createTokenWithExp(futureTimeSeconds);
      expect(isTokenExpired(token)).toBe(false);
    });
  });
});
