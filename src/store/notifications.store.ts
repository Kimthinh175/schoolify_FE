'use client';

import { create } from 'zustand';

export type AppNotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotificationItem {
  id: string;
  type: AppNotificationType;
  title: string;
  description?: string;
  link?: string;
  category?: 'FORUM_COMMENT' | 'FORUM_REWARD' | 'EXAM' | 'SYSTEM';
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'schoolify_notifications_v1';
const MAX_ITEMS = 30;

const DEFAULT_FORUM_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'seed-forum-reward-01',
    type: 'success',
    title: '🎉 Nhận thưởng +10 Ngọc Tri Thức!',
    description: 'Lời giải của bạn trong bài "Toán 12: Tìm m để hàm số bậc ba đồng biến" đã được công nhận là Lời giải chuẩn nhất!',
    link: '/forum?post=hoi-bai-toan-12-tim-m-de-ham-so-bac-ba-dong-bien#comment-comment-forum-seed-post-02-root',
    category: 'FORUM_REWARD',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'seed-forum-comment-02',
    type: 'info',
    title: '💬 Bài viết có lời giải mới',
    description: 'ThS. Nguyễn Văn Hùng vừa bình luận: "Em lưu ý xét dấu hệ số a khi khảo sát hàm số bậc ba nhé."',
    link: '/forum?post=hoi-bai-toan-12-tim-m-de-ham-so-bac-ba-dong-bien#comment-comment-forum-seed-post-02-root',
    category: 'FORUM_COMMENT',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
  },
];

function readInitialNotifications(): AppNotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items = DEFAULT_FORUM_NOTIFICATIONS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed.map((it: AppNotificationItem) => {
          if (
            it.link &&
            (it.link.includes('/forum/toan-12-tim-m-de-ham-so-bac-ba-dong-bien') ||
              it.link.includes('/forum/hoi-bai-toan-12-tim-m-de-ham-so-bac-ba-dong-bien') ||
              it.link.includes('post=hoi-bai-toan-12-tim-m-de-ham-so-bac-ba-dong-bien'))
          ) {
            return {
              ...it,
              link: '/forum?post=hoi-bai-toan-12-tim-m-de-ham-so-bac-ba-dong-bien#comment-comment-forum-seed-post-02-root',
            };
          }
          if (it.link && it.link.startsWith('/forum/') && !it.link.includes('?')) {
            const slug = it.link.replace('/forum/', '');
            return {
              ...it,
              link: `/forum?post=${slug}`,
            };
          }
          return it;
        });
      }
    }
    const hasForum = items.some((it) => it.link?.includes('/forum'));
    if (!hasForum) {
      items = [...DEFAULT_FORUM_NOTIFICATIONS, ...items];
    }
    return items.slice(0, MAX_ITEMS);
  } catch {
    return DEFAULT_FORUM_NOTIFICATIONS;
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
    link?: string;
    category?: 'FORUM_COMMENT' | 'FORUM_REWARD' | 'EXAM' | 'SYSTEM';
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

  addNotification: ({ id, type, title, description, link, category }) => {
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
          link: link?.trim() || undefined,
          category: category || undefined,
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
