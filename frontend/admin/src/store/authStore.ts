/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🔐 AUTH STORE - Authentication State Management                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@types';
import { api } from '@services/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await api.login(email, password);
          const user = response.data.user;
          set({
            user,
            token: response.data.access_token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ isAuthenticated: false, loading: false });
          return;
        }

        set({ loading: true });
        try {
          const response = await api.getCurrentUser();
          set({
            user: response.data,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
