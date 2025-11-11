import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token: string, user: User): void => {
        localStorage.setItem('auth_token', token);
        set({ token, user, isAuthenticated: true });
      },
      clearAuth: (): void => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
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

