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

const resolveUserRole = (
  user: User,
  preferredRole?: SchoolRole | SystemRole
): SchoolRole | SystemRole => {
  if (preferredRole) return preferredRole;
  if (user.role === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  return (user as any).teacher_profile ? 'TEACHER' : 'STUDENT';
};

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
        const resolvedRole = resolveUserRole(user, role);

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
              currentSchoolId: null,
              currentSchool: null,
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
              merged.role === 'SUPER_ADMIN'
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
