import { create } from 'zustand';
import type { Role } from '@4basearch/domain-types';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBlocked: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setBlocked: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isBlocked: false,
  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false, isBlocked: false }),
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isBlocked: false,
    }),
  setBlocked: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isBlocked: true,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
