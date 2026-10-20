'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SchoolRole, SystemRole } from '@/types';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  currentRole: SchoolRole | SystemRole;
  currentSchoolId: string | null;
  currentSchool: { id: string; name: string } | null;
  isAuthenticated: boolean;

  // Actions
  login: (user: User, token: string, role?: SchoolRole | SystemRole, schoolId?: string) => void;
  logout: () => void;
  fetchMe: () => Promise<User | null>;
  setRole: (role: SchoolRole | SystemRole) => void;
  setSchool: (schoolId: string, schoolName: string) => void;
  updateUser: (userPartial: Partial<User>) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      currentRole: 'STUDENT',
      currentSchoolId: null,
      currentSchool: null,
      isAuthenticated: false,

      login: (user, token, role, schoolId) => {
        const resolvedRole: SchoolRole | SystemRole =
          role ||
          (user.role === 'SUPER_ADMIN'
            ? 'SUPER_ADMIN'
            : (user as any).teacher_profile
              ? 'TEACHER'
              : 'STUDENT');

        set({
          user,
          token,
          currentRole: resolvedRole,
          currentSchoolId: schoolId || (user.school_memberships?.[0]?.school_id ?? null),
          currentSchool: user.school_memberships?.[0]
            ? {
                id: user.school_memberships[0].school_id,
                name: user.school_memberships[0].school_name || 'Trường học',
              }
            : null,
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
          currentSchoolId: null,
          currentSchool: null,
          isAuthenticated: false,
        });
      },

      fetchMe: async () => {
        const { token, isAuthenticated } = get();
        if (!isAuthenticated && !token) return null;
        try {
          const res = await fetch('/api/v1/auth/me', {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) return null;
          const data = await res.json();
          if (data?.user) {
            const current = get().user;
            const merged = { ...current, ...data.user };
            set({ user: merged });
            return merged;
          }
          return null;
        } catch {
          return null;
        }
      },

      setRole: (role) => set({ currentRole: role }),

      setSchool: (schoolId, schoolName) =>
        set({
          currentSchoolId: schoolId,
          currentSchool: { id: schoolId, name: schoolName },
        }),

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
