import axios, { AxiosInstance } from 'axios';
import { supabase } from '@money-manager/core';
import {
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearAllAuthTokens,
} from '../auth/index';

const DEFAULT_FALLBACK_URL = 'https://money-manager-backend-tau.vercel.app';

export const getDcApiBaseUrl = (): string => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    DEFAULT_FALLBACK_URL;
  const rawApiUrl = (String(envUrl) || DEFAULT_FALLBACK_URL).trim().replace(/\/$/, '');
  return /^https?:\/\//i.test(rawApiUrl)
    ? rawApiUrl
    : rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1')
      ? `http://${rawApiUrl}`
      : `https://${rawApiUrl}`;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getDcApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Supabase Bearer JWT
apiClient.interceptors.request.use(async (config) => {
  let token: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  } catch {
    // In mock/test environment
  }

  if (!token) {
    token = getStoredAccessToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 & Silent Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // 1. Primary: Attempt Supabase session refresh
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        const newAccessToken = refreshData?.session?.access_token;
        if (!refreshError && newAccessToken) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Continue to fallback below
      }

      // 2. Fallback: Legacy refresh token flow for tests and backward compatibility
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearAllAuthTokens();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${getDcApiBaseUrl()}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken = refreshResponse.data?.data?.token;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (newAccessToken) {
          setStoredAccessToken(newAccessToken);
          if (newRefreshToken) setStoredRefreshToken(newRefreshToken);

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        clearAllAuthTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
