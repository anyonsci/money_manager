import axios, { AxiosInstance } from 'axios';
import {
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearAllAuthTokens,
} from '../auth/index';

const DEFAULT_FALLBACK_URL = 'https://money-manager-backend-tau.vercel.app';

export const getDcApiBaseUrl = (): string => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ? String(import.meta.env.VITE_API_URL) : DEFAULT_FALLBACK_URL;
  const rawApiUrl = (envUrl || DEFAULT_FALLBACK_URL).trim().replace(/\/$/, '');
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

// Request Interceptor: Attach Bearer JWT
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
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
