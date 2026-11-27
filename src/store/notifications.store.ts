'use client';

import { create } from 'zustand';

export type AppNotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotificationItem {
  id: string;
  type: AppNotificationType;
  title: string;
  description?: string;
  link?: string;
  remote?: boolean;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'schoolify_notifications_v1';
const MAX_ITEMS = 40;

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
  isSyncing: boolean;
  hydrate: () => void;
  syncFromBackend: () => Promise<void>;
  addNotification: (payload: {
    id: string;
    type: AppNotificationType;
    title: string;
    description?: string;
    link?: string;
  }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  hydrated: false,
  isSyncing: false,

  hydrate: () => {
    if (!get().hydrated) {
      const initial = readInitialNotifications();
      set({ items: initial, hydrated: true });
    }
  },

  syncFromBackend: async () => {
    if (typeof window === 'undefined' || get().isSyncing) return;
    set({ isSyncing: true });
    try {
      const res = await fetch('/api/v1/notifications?limit=30', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = await res.json();
      const remoteItems: AppNotificationItem[] = Array.isArray(json?.data?.items)
        ? json.data.items.map((n: any) => ({
            id: String(n.id),
            type: (n.type || 'info') as AppNotificationType,
            title: String(n.title || ''),
            description: n.description || undefined,
            link: n.link || undefined,
            remote: true,
            createdAt: n.createdAt || new Date().toISOString(),
            read: Boolean(n.read),
          }))
        : [];

      const remoteIds = new Set(remoteItems.map((it) => it.id));
      const localOnly = get().items.filter((it) => !it.remote && !remoteIds.has(it.id));
      const merged = [...remoteItems, ...localOnly]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, MAX_ITEMS);

      persistNotifications(merged);
      set({ items: merged, hydrated: true });
    } catch {
      // ignore offline
    } finally {
      set({ isSyncing: false });
    }
  },

  addNotification: ({ id, type, title, description, link }) => {
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
          link,
          remote: false,
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
    const target = get().items.find((it) => it.id === id);
    set((state) => {
      const next = state.items.map((it) => (it.id === id ? { ...it, read: true } : it));
      persistNotifications(next);
      return { items: next };
    });
    if (target?.remote) {
      fetch(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        credentials: 'include',
      }).catch(() => {});
    }
  },

  markAllAsRead: () => {
    set((state) => {
      const next = state.items.map((it) => ({ ...it, read: true }));
      persistNotifications(next);
      return { items: next };
    });
    fetch('/api/v1/notifications/read-all', {
      method: 'PATCH',
      credentials: 'include',
    }).catch(() => {});
  },

  clearAll: () => {
    persistNotifications([]);
    set({ items: [], hydrated: true });
    fetch('/api/v1/notifications/clear-all', {
      method: 'DELETE',
      credentials: 'include',
    }).catch(() => {});
  },
}));
