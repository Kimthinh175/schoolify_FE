'use client';

import { create } from 'zustand';

export type AppNotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotificationItem {
  id: string;
  type: AppNotificationType;
  title: string;
  description?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'schoolify_notifications_v1';
const MAX_ITEMS = 30;

function readInitialNotifications(): AppNotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function persistNotifications(items: AppNotificationItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {}
}

interface NotificationsState {
  items: AppNotificationItem[];
  hydrated: boolean;
  hydrate: () => void;
  addNotification: (payload: {
    id: string;
    type: AppNotificationType;
    title: string;
    description?: string;
  }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const initial = readInitialNotifications();
    set({ items: initial, hydrated: true });
  },

  addNotification: ({ id, type, title, description }) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    set((state) => {
      if (state.items.some((it) => it.id === id)) {
        return state;
      }
      const next: AppNotificationItem[] = [
        {
          id,
          type,
          title: cleanTitle,
          description: description?.trim() || undefined,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.items,
      ].slice(0, MAX_ITEMS);
      persistNotifications(next);
      return { items: next, hydrated: true };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const next = state.items.map((it) => (it.id === id ? { ...it, read: true } : it));
      persistNotifications(next);
      return { items: next };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const next = state.items.map((it) => ({ ...it, read: true }));
      persistNotifications(next);
      return { items: next };
    });
  },

  clearAll: () => {
    persistNotifications([]);
    set({ items: [], hydrated: true });
  },
}));
