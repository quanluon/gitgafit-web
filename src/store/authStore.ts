import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { useLocaleStore } from './localeStore';
import { Language } from '@/types/enums';
import { fcmService } from '@/services/fcmService';

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
        // Zustand persist middleware will handle storage automatically
        set({ token, refreshToken, user, isAuthenticated: true });

        // Also manually save to localStorage as backup for Android WebView compatibility
        try {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', refreshToken);
        } catch (error) {
          console.warn('Failed to backup tokens to localStorage:', error);
        }
        // Set language from user profile
        if (user.language) {
          useLocaleStore.getState().setLanguage(user.language as Language);
        }

        // Initialize FCM only when authenticated
        if (token) {
          void fcmService.initMessaging(true).catch((error) => {
            console.warn('[AuthStore] FCM initialization failed:', error);
          });
        }
      },
      setTokens: (token: string, refreshToken: string): void => {
        // Zustand persist middleware will handle storage automatically
        set({ token, refreshToken });

        // Also manually save to localStorage as backup for Android WebView compatibility
        try {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', refreshToken);
        } catch (error) {
          console.warn('Failed to backup tokens to localStorage:', error);
        }

        // Initialize FCM only when authenticated
        if (token) {
          void fcmService.initMessaging(true).catch((error) => {
            console.warn('[AuthStore] FCM initialization failed:', error);
          });
        }
      },
      clearAuth: (): void => {
        // Zustand persist middleware will handle storage cleanup automatically
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });

        // Also manually clear localStorage as backup
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        } catch (error) {
          console.warn('Failed to clear tokens from localStorage:', error);
        }
        // Reset language to default (en)
        useLocaleStore.getState().setLanguage(Language.EN);

        void fcmService.cleanupToken();
      },
      updateUser: (user: User): void => {
        set({ user });

        // Update language when user profile is updated
        if (user.language) {
          useLocaleStore.getState().setLanguage(user.language as Language);
        }
      },
    }),
    {
      name: 'auth-storage',
      // Zustand persist uses localStorage by default
      // Add partialize to only persist auth-related fields
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.token ? true : false, // Sync isAuthenticated with token presence
      }),
      // On rehydrate, ensure isAuthenticated matches token presence (Android WebView fix)
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Sync isAuthenticated with token presence after hydration
            const hasToken = !!state.token;
            if (hasToken !== state.isAuthenticated) {
              state.isAuthenticated = hasToken;
            }
            // Restore tokens from localStorage backup if Zustand state is empty (Android fix)
            if (!state.token) {
              try {
                const backupToken = localStorage.getItem('auth_token');
                const backupRefreshToken = localStorage.getItem('refresh_token');
                if (backupToken) {
                  state.token = backupToken;
                  state.refreshToken = backupRefreshToken;
                  state.isAuthenticated = true;
                }
              } catch (error) {
                console.warn('Failed to restore tokens from localStorage backup:', error);
              }
            }

            // Only initialize FCM if authenticated (has token and user)
            if (state.token && state.isAuthenticated) {
              void fcmService.initMessaging(true).catch((error) => {
                console.warn('[AuthStore] FCM initialization failed on rehydrate:', error);
              });
            }
          }
        };
      },
    },
  ),
);
