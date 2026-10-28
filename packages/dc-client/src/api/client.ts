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
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    DEFAULT_FALLBACK_URL;
  let rawApiUrl = (String(envUrl) || DEFAULT_FALLBACK_URL).trim().replace(/\/$/, '');
  // Strip trailing /api to avoid duplicate /api in endpoint calls
  rawApiUrl = rawApiUrl.replace(/\/api\/?$/i, '');
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

// Request Interceptor: Attach Centralized IdP Bearer JWT
apiClient.interceptors.request.use(async (config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAllAuthTokens();
    }
    return Promise.reject(error);
  }
);
