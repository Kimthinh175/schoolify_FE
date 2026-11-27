'use client';

import { create } from 'zustand';

export type AppNotificationType = 'success' | 'info' | 'warning' | 'error';

export type NotificationCategory = 'LEARNING' | 'REWARD' | 'COMMUNITY' | 'SYSTEM';

/**
 * Chuẩn hóa đối tượng Thông báo (Module 03 - bảng `notifications`):
 * PK: id
 * FK: user_id
 * Columns: type, title, message, link, is_read, created_at
 * Tương thích ngược 100% với cả snake_case (ERD) và camelCase (FE Store).
 */
export interface AppNotificationItem {
  id: string;
  userId?: string;
  type: AppNotificationType;
  rawType?: string;
  category?: NotificationCategory;
  title: string;
  /** Nội dung thông báo (đồng bộ với cột `message` trong ERD và `description` trên UI) */
  message?: string;
  description?: string;
  link?: string;
  remote?: boolean;
  createdAt: string;
  created_at?: string;
  read: boolean;
  is_read?: boolean;
}

const STORAGE_KEY = 'schoolify_notifications_v1';
const MAX_ITEMS = 50;

function normalizeNotificationType(rawType?: string): AppNotificationType {
  const norm = String(rawType || 'info').trim().toLowerCase();
  if (
    norm === 'success' ||
    norm.includes('reward') ||
    norm.includes('achievement') ||
    norm.includes('paid') ||
    norm.includes('grade') ||
    norm.includes('unlock')
  ) {
    return 'success';
  }
  if (norm === 'warning' || norm.includes('expire') || norm.includes('trap') || norm.includes('remind')) {
    return 'warning';
  }
  if (norm === 'error' || norm.includes('penalty') || norm.includes('reject') || norm.includes('lock')) {
    return 'error';
  }
  return 'info';
}

export function inferNotificationCategory(item: {
  rawType?: string;
  title?: string;
  message?: string;
  link?: string;
}): NotificationCategory {
  const combined = `${item.rawType || ''} ${item.title || ''} ${item.message || ''} ${item.link || ''}`.toLowerCase();
  if (
    combined.includes('forum') ||
    combined.includes('diễn đàn') ||
    combined.includes('bình luận') ||
    combined.includes('chuyên mục')
  ) {
    return 'COMMUNITY';
  }
  if (
    combined.includes('tia sáng') ||
    combined.includes('ngọc') ||
    combined.includes('điểm danh') ||
    combined.includes('thành tựu') ||
    combined.includes('danh hiệu') ||
    combined.includes('đổi quà') ||
    combined.includes('mùa giải') ||
    combined.includes('xếp hạng') ||
    combined.includes('rewards') ||
    combined.includes('achievements')
  ) {
    return 'REWARD';
  }
  if (
    combined.includes('đề thi') ||
    combined.includes('lộ trình') ||
    combined.includes('luyện') ||
    combined.includes('chấm bài') ||
    combined.includes('lỗ hổng') ||
    combined.includes('chuyên đề') ||
    combined.includes('practice') ||
    combined.includes('exam')
  ) {
    return 'LEARNING';
  }
  return 'SYSTEM';
}

export function mapRawNotificationToItem(n: any, isRemote = true): AppNotificationItem {
  const title = String(n?.title || 'Thông báo hệ thống').trim();
  const textBody = String(n?.message ?? n?.description ?? '').trim() || undefined;
  const isRead = Boolean(n?.is_read ?? n?.read ?? false);
  const createdIso = String(n?.created_at || n?.createdAt || new Date().toISOString());
  const rawType = String(n?.type || 'info');
  const link = n?.link ? String(n.link) : undefined;

  return {
    id: String(n?.id || `notif-${Date.now()}`),
    userId: n?.user_id || n?.userId || undefined,
    type: normalizeNotificationType(rawType),
    rawType,
    category: n?.category || inferNotificationCategory({ rawType, title, message: textBody, link }),
    title,
    message: textBody,
    description: textBody,
    link,
    remote: isRemote,
    createdAt: createdIso,
    created_at: createdIso,
    read: isRead,
    is_read: isRead,
  };
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('schoolify-auth-storage');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const state = parsed?.state || {};
    const token = state.token || '';
    const userId = state.user?.id || '';
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': String(userId) } : {}),
    };
  } catch {
    return {};
  }
}

function readInitialNotifications(): AppNotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ITEMS).map((item) => mapRawNotificationToItem(item, Boolean(item?.remote)));
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
    message?: string;
    link?: string;
    category?: NotificationCategory;
    userId?: string;
  }) => void;
  sendSystemNotification: (payload: {
    userId?: string | 'ALL';
    type: AppNotificationType;
    title: string;
    message: string;
    link?: string;
    category?: NotificationCategory;
  }) => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
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
      const res = await fetch('/api/v1/notifications?limit=40', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = await res.json();
      const rawList = Array.isArray(json?.data?.items)
        ? json.data.items
        : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
            ? json.data
            : [];

      const remoteItems: AppNotificationItem[] = rawList.map((n: any) =>
        mapRawNotificationToItem(n, true)
      );

      // Giữ trạng thái đã đọc (read) nếu người dùng vừa đánh dấu đọc ở local
      const existingReadMap = new Map<string, boolean>();
      for (const cur of get().items) {
        if (cur.read) existingReadMap.set(cur.id, true);
      }

      const syncedRemote = remoteItems.map((it) =>
        existingReadMap.get(it.id) ? { ...it, read: true, is_read: true } : it
      );

      const remoteIds = new Set(syncedRemote.map((it) => it.id));
      const localOnly = get().items.filter((it) => !it.remote && !remoteIds.has(it.id));
      const merged = [...syncedRemote, ...localOnly]
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

  addNotification: ({ id, type, title, description, message, link, category, userId }) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const bodyText = (message ?? description)?.trim() || undefined;
    const nowIso = new Date().toISOString();

    set((state) => {
      if (state.items.some((it) => it.id === id)) {
        return state;
      }
      const newItem: AppNotificationItem = {
        id,
        userId,
        type,
        category:
          category ||
          inferNotificationCategory({ rawType: type, title: cleanTitle, message: bodyText, link }),
        title: cleanTitle,
        message: bodyText,
        description: bodyText,
        link,
        remote: false,
        createdAt: nowIso,
        created_at: nowIso,
        read: false,
        is_read: false,
      };
      const next: AppNotificationItem[] = [newItem, ...state.items].slice(0, MAX_ITEMS);
      persistNotifications(next);
      return { items: next, hydrated: true };
    });
  },

  sendSystemNotification: async ({ userId, type, title, message, link, category }) => {
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    if (!cleanTitle || !cleanMessage) return false;

    const notifId = `sys-notif-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const authHeaders = getAuthHeaders();
    const currentUserId = authHeaders['x-user-id'];

    // Chỉ thêm vào quả chuông hiện tại nếu là Broadcast toàn hệ thống hoặc gửi cho chính user đang đăng nhập
    if (userId === 'ALL' || !userId || (currentUserId && userId === currentUserId)) {
      get().addNotification({
        id: notifId,
        userId: userId === 'ALL' ? undefined : userId,
        type,
        title: cleanTitle,
        message: cleanMessage,
        description: cleanMessage,
        link: link?.trim() || undefined,
        category,
      });
    }

    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({
          id: notifId,
          user_id: userId === 'ALL' ? null : userId,
          target: userId === 'ALL' ? 'BROADCAST_ALL' : 'SINGLE_USER',
          type,
          title: cleanTitle,
          message: cleanMessage,
          link: link?.trim() || null,
          is_read: false,
          created_at: nowIso,
        }),
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  markAsRead: (id) => {
    const target = get().items.find((it) => it.id === id);
    set((state) => {
      const next = state.items.map((it) =>
        it.id === id ? { ...it, read: true, is_read: true } : it
      );
      persistNotifications(next);
      return { items: next };
    });
    if (target?.remote) {
      fetch(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
      }).catch(() => {});
    }
  },

  markAllAsRead: () => {
    set((state) => {
      const next = state.items.map((it) => ({ ...it, read: true, is_read: true }));
      persistNotifications(next);
      return { items: next };
    });
    fetch('/api/v1/notifications/read-all', {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    }).catch(() => {});
  },

  removeNotification: (id) => {
    const target = get().items.find((it) => it.id === id);
    set((state) => {
      const next = state.items.filter((it) => it.id !== id);
      persistNotifications(next);
      return { items: next };
    });
    if (target?.remote) {
      fetch(`/api/v1/notifications/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      }).catch(() => {});
    }
  },

  clearAll: () => {
    persistNotifications([]);
    set({ items: [], hydrated: true });
    fetch('/api/v1/notifications/clear-all', {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    }).catch(() => {});
  },
}));
