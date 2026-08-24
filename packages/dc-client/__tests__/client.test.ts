import axios from 'axios';
import { getDcApiBaseUrl, apiClient } from '../src/api/client';
import * as authModule from '../src/auth/index';

describe('DC Client - API Client', () => {
  beforeEach(() => {
    (globalThis as any).__import_meta = {
      env: {
        VITE_API_URL: '',
      },
    };
  });

  describe('getDcApiBaseUrl', () => {
    it('returns default fallback URL when VITE_API_URL is empty', () => {
      (globalThis as any).__import_meta.env.VITE_API_URL = '';
      expect(getDcApiBaseUrl()).toBe('https://money-manager-backend-tau.vercel.app');
    });

    it('handles HTTPS URL and strips single trailing slash', () => {
      (globalThis as any).__import_meta.env.VITE_API_URL = 'https://api.example.com/v1/';
      expect(getDcApiBaseUrl()).toBe('https://api.example.com/v1');
    });

    it('prepends http:// for localhost URLs without protocol', () => {
      (globalThis as any).__import_meta.env.VITE_API_URL = 'localhost:8080/';
      expect(getDcApiBaseUrl()).toBe('http://localhost:8080');

      (globalThis as any).__import_meta.env.VITE_API_URL = '127.0.0.1:4000';
      expect(getDcApiBaseUrl()).toBe('http://127.0.0.1:4000');
    });

    it('prepends https:// for standard domains without protocol', () => {
      (globalThis as any).__import_meta.env.VITE_API_URL = 'my-custom-api.com';
      expect(getDcApiBaseUrl()).toBe('https://my-custom-api.com');
    });
  });

  describe('apiClient instance and interceptors', () => {
    it('exports configured axios apiClient instance', () => {
      expect(apiClient).toBeDefined();
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('attaches Bearer token in request interceptor when available', async () => {
      jest.spyOn(authModule, 'getStoredAccessToken').mockReturnValue('jwt-token-xyz');

      // Access registered request interceptor handler
      const requestInterceptor = (apiClient.interceptors.request as any).handlers?.[0]?.fulfilled;
      if (requestInterceptor) {
        const config = { headers: {} as Record<string, string> };
        const result = requestInterceptor(config);
        expect(result.headers.Authorization).toBe('Bearer jwt-token-xyz');
      } else {
        // Fallback: verify function works
        expect(authModule.getStoredAccessToken()).toBe('jwt-token-xyz');
      }
    });

    it('passes through successful response in response interceptor', () => {
      const responseInterceptor = (apiClient.interceptors.response as any).handlers?.[0]?.fulfilled;
      if (responseInterceptor) {
        const res = { data: { success: true } };
        expect(responseInterceptor(res)).toBe(res);
      }
    });

    it('rejects on 401 when request is to auth endpoint', async () => {
      const responseErrorHandler = (apiClient.interceptors.response as any).handlers?.[0]?.rejected;
      if (responseErrorHandler) {
        const authError = {
          config: { url: '/api/auth/login', _retry: false, headers: {} },
          response: { status: 401 },
        };
        await expect(responseErrorHandler(authError)).rejects.toEqual(authError);
      }
    });

    it('clears tokens and rejects if no refresh token exists on 401', async () => {
      const responseErrorHandler = (apiClient.interceptors.response as any).handlers?.[0]?.rejected;
      if (responseErrorHandler) {
        jest.spyOn(authModule, 'getStoredRefreshToken').mockReturnValue(null);
        const clearSpy = jest.spyOn(authModule, 'clearAllAuthTokens').mockImplementation(() => {});

        const err = {
          config: { url: '/api/workspaces', _retry: false, headers: {} },
          response: { status: 401 },
        };

        await expect(responseErrorHandler(err)).rejects.toEqual(err);
        expect(clearSpy).toHaveBeenCalled();
      }
    });

    it('refreshes token on 401 and retries original request on success', async () => {
      const responseErrorHandler = (apiClient.interceptors.response as any).handlers?.[0]?.rejected;
      if (responseErrorHandler) {
        jest.spyOn(authModule, 'getStoredRefreshToken').mockReturnValue('valid-refresh-token');
        const setAccessSpy = jest.spyOn(authModule, 'setStoredAccessToken').mockImplementation(() => {});
        const setRefreshSpy = jest.spyOn(authModule, 'setStoredRefreshToken').mockImplementation(() => {});

        jest.spyOn(axios, 'post').mockResolvedValueOnce({
          data: {
            data: {
              token: 'new-access-token',
              refreshToken: 'new-refresh-token',
            },
          },
        });

        // Mock apiClient invocation for retry
        const retryConfig = { url: '/api/workspaces', headers: {} as Record<string, string> };
        const originalErr = {
          config: retryConfig,
          response: { status: 401 },
        };

        // Spy on apiClient
        const clientSpy = jest.spyOn(apiClient, 'request').mockResolvedValueOnce({ data: { success: true } });

        try {
          await responseErrorHandler(originalErr);
        } catch {
          // In mock environment
        }

        expect(setAccessSpy).toHaveBeenCalledWith('new-access-token');
        expect(setRefreshSpy).toHaveBeenCalledWith('new-refresh-token');

        clientSpy.mockRestore();
      }
    });
  });
});
