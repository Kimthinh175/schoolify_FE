'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SystemRole } from '@/types';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  currentRole: SystemRole | 'STUDENT';
  isAuthenticated: boolean;

  // Actions
  login: (user: User, token: string, role?: SystemRole | 'STUDENT', _unusedSchoolId?: string) => void;
  logout: () => void;
  fetchMe: () => Promise<User | null>;
  setRole: (role: SystemRole | 'STUDENT') => void;
  updateUser: (userPartial: Partial<User>) => void;
}

const resolveUserRole = (
  user: User,
  preferredRole?: SystemRole | 'STUDENT'
): SystemRole | 'STUDENT' => {
  if (preferredRole) return preferredRole;
  if (user.role === 'SUPER_ADMIN' || (user.role as string) === 'ADMIN') return 'SUPER_ADMIN';
  return 'STUDENT';
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      currentRole: 'STUDENT',
      isAuthenticated: false,

      login: (user, token, role) => {
        const resolvedRole = resolveUserRole(user, role);

        set({
          user,
          token,
          currentRole: resolvedRole,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
        }
        set({
          user: null,
          token: null,
          currentRole: 'STUDENT',
          isAuthenticated: false,
        });
      },

      fetchMe: async () => {
        const { token, isAuthenticated, currentRole } = get();
        try {
          const res = await fetch('/api/v1/auth/me', {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: 'include',
          });
          if (res.status === 401) {
            set({
              user: null,
              token: null,
              currentRole: 'STUDENT',
              isAuthenticated: false,
            });
            return null;
          }
          if (!res.ok) return null;
          const data = await res.json();
          if (data?.user) {
            const current = get().user;
            const merged = { ...current, ...data.user } as User;
            const resolvedRole =
              merged.role === 'SUPER_ADMIN' || (merged.role as string) === 'ADMIN'
                ? 'SUPER_ADMIN'
                : isAuthenticated
                  ? currentRole
                  : resolveUserRole(merged);
            set({
              user: merged,
              isAuthenticated: true,
              currentRole: resolvedRole,
            });
            return merged;
          }
          return null;
        } catch {
          return null;
        }
      },

      setRole: (role) => set({ currentRole: role }),

      updateUser: (userPartial) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...userPartial } });
      },
    }),
    {
      name: 'schoolify-auth-storage',
    }
  )
);
