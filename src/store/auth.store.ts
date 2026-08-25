'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SchoolRole, SystemRole, SchoolMember } from '@/types';

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

      login: (user, token, role, schoolId) =>
        set({
          user,
          token,
          currentRole: role || (user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STUDENT'),
          currentSchoolId: schoolId || (user.school_memberships?.[0]?.school_id ?? null),
          currentSchool: user.school_memberships?.[0]
            ? { id: user.school_memberships[0].school_id, name: user.school_memberships[0].school_name || 'Trường học' }
            : null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          currentRole: 'STUDENT',
          currentSchoolId: null,
          currentSchool: null,
          isAuthenticated: false,
        }),

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
