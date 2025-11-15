import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types/common';
import { authService } from './authService';
import { useAuthStore } from '@/store';
import { AppRoutePath } from '@/routes/paths';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Track if we're currently refreshing the token
let isRefreshing = false;
// Queue of failed requests waiting for token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Process all queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor with token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const forceLogout = (): void => {
          const authStore = useAuthStore.getState();
          authStore.clearAuth();
          window.location.href = AppRoutePath.Login;
        };
        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          // Prevent infinite loops for auth endpoints
          if (
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register')
          ) {
            // If refresh or login failed, logout
            forceLogout();

            return Promise.reject(error);
          }

          // If already refreshing, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = localStorage.getItem('refresh_token');

          if (!refreshToken) {
            // No refresh token, logout
            forceLogout();
            return Promise.reject(error);
          }

          try {
            // Call refresh endpoint
            const response = await authService.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = response;

            // Update tokens in localStorage
            const authStore = useAuthStore.getState();
            authStore.setTokens(accessToken, newRefreshToken);

            // Update auth header for original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Process queued requests
            processQueue(null, accessToken);

            // Retry original request
            isRefreshing = false;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout
            processQueue(refreshError as Error, null);
            isRefreshing = false;

            forceLogout();

            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiService = new ApiService();
export const apiClient = apiService.getClient();
