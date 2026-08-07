import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearAllAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredUser
} from '../utils/auth';

const FALLBACK_URL = 'https://script.google.com/macros/s/AKfycbzYalJCPf4aEQ35VR_fya0zPSoPO0laOaCk0SGbIbB9PFeerzSIgv6x95MD_UlC8Y9B/exec';

export const getApiUrl = () => (import.meta.env.VITE_APPS_SCRIPT_URL || FALLBACK_URL).trim();

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'text/plain;charset=utf-8'
  }
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject accessToken payload into body without attaching custom Authorization headers.
// Custom headers (like Authorization) cause browsers to send an OPTIONS preflight request, which Google Apps Script rejects with a CORS error.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token) {
      // Inject accessToken into JSON payload body for Google Apps Script Web App
      if (config.data) {
        try {
          const dataObj = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          if (typeof dataObj === 'object' && dataObj !== null) {
            dataObj.accessToken = token;
            config.data = JSON.stringify(dataObj);
          }
        } catch {
          // Keep existing body if not JSON string
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for handling 401 or unauthorized responses
async function handleUnauthorizedResponse(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
  if (originalRequest._retry) {
    clearAllAuthTokens();
    window.location.href = '/';
    return Promise.reject(new Error('Unauthorized'));
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        if (originalRequest.data) {
          try {
            const dataObj = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
            if (typeof dataObj === 'object' && dataObj !== null) {
              dataObj.accessToken = token;
              originalRequest.data = JSON.stringify(dataObj);
            }
          } catch {}
        }
        return apiClient(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const refreshToken = getStoredRefreshToken();
  const user = getStoredUser();

  if (!refreshToken || !user?.email) {
    isRefreshing = false;
    clearAllAuthTokens();
    window.location.href = '/';
    return Promise.reject(new Error('No refresh token or user email available'));
  }

  try {
    const apiUrl = getApiUrl();
    const refreshResponse = await axios.post(
      apiUrl,
      JSON.stringify({
        action: 'refresh',
        refreshToken,
        email: user.email
      }),
      {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      }
    );

    const data = refreshResponse.data;
    const newAccessToken = data.accessToken || data.data?.accessToken;

    if (data.success && newAccessToken) {
      setStoredAccessToken(newAccessToken);
      if (data.user || data.data?.user) {
        setStoredUser(data.user || data.data.user);
      }

      if (originalRequest.data) {
        try {
          const dataObj = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
          if (typeof dataObj === 'object' && dataObj !== null) {
            dataObj.accessToken = newAccessToken;
            originalRequest.data = JSON.stringify(dataObj);
          }
        } catch {}
      }

      processQueue(null, newAccessToken);
      isRefreshing = false;
      return apiClient(originalRequest);
    } else {
      throw new Error(data.error || 'Refresh failed');
    }
  } catch (refreshErr) {
    processQueue(refreshErr as Error, null);
    isRefreshing = false;
    clearAllAuthTokens();
    window.location.href = '/';
    return Promise.reject(refreshErr);
  }
}

// Response Interceptor: Catch 401 Unauthorized status & silent refresh
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      (response.data.statusCode === 401 ||
        (response.data.success === false &&
          typeof response.data.error === 'string' &&
          response.data.error.toLowerCase().includes('unauthorized')))
    ) {
      return handleUnauthorizedResponse(response.config);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && originalRequest) {
      return handleUnauthorizedResponse(originalRequest);
    }
    return Promise.reject(error);
  }
);
