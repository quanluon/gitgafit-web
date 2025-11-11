import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token: string, refreshToken: string, user: User): void => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ token, refreshToken, user, isAuthenticated: true });
      },
      setTokens: (token: string, refreshToken: string): void => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ token, refreshToken });
      },
      clearAuth: (): void => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      updateUser: (user: User): void => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);

// Listen for token refresh events from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('token-refreshed', ((event: CustomEvent) => {
    const { accessToken, refreshToken } = event.detail;
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  }) as EventListener);
}

