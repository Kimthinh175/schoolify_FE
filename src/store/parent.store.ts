'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChildInfo {
  id: string;
  name: string;
  avatar?: string;
  grade: string;
  schoolName: string;
  classId: string;
  className: string;
}

interface ParentStoreState {
  children: ChildInfo[];
  activeChildId: string;
  setActiveChild: (childId: string) => void;
  setChildren: (children: ChildInfo[]) => void;
}

export const useParentStore = create<ParentStoreState>()(
  persist(
    (set) => ({
      children: [
        {
          id: 'child-01',
          name: 'Nguyễn Hoàng Minh',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          grade: 'Lớp 11A1',
          schoolName: 'THPT Chuyên Công Nghệ Schoolify',
          classId: 'cls-11a1',
          className: '11A1 - Chuyên Toán Tin',
        },
        {
          id: 'child-02',
          name: 'Nguyễn Ngọc Linh',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          grade: 'Lớp 8B',
          schoolName: 'THCS Archimedes Schoolify',
          classId: 'cls-8b',
          className: '8B - Song Ngữ Quốc Tế',
        },
      ],
      activeChildId: 'child-01',
      setActiveChild: (childId) => set({ activeChildId: childId }),
      setChildren: (children) => set({ children, activeChildId: children[0]?.id || '' }),
    }),
    {
      name: 'schoolify-parent-storage',
    }
  )
);
