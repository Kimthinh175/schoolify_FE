'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useSonner } from 'sonner';
import {
  useNotificationsStore,
  type AppNotificationItem,
  type AppNotificationType,
} from '@/store/notifications.store';
import { cn } from '@/lib/utils';

function extractSonnerText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'function') {
    try {
      const res = (value as () => unknown)();
      return typeof res === 'string' || typeof res === 'number' ? String(res) : '';
    } catch {
      return '';
    }
  }
  return '';
}

function mapSonnerType(raw?: string): AppNotificationType {
  if (raw === 'success') return 'success';
  if (raw === 'warning') return 'warning';
  if (raw === 'error') return 'error';
  return 'info';
}

function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return 'Vừa xong';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} giờ trước`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} ngày trước`;
}

/**
 * Cầu nối tự động ghi mọi thông báo Sonner mới phát sinh vào trung tâm thông báo Header.
 */
export function SonnerNotificationSync() {
  const { toasts } = useSonner();
  const hydrate = useNotificationsStore((s) => s.hydrate);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const seenIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    for (const t of toasts) {
      if (!t || t.type === 'loading') continue;
      const title = extractSonnerText(t.title);
      if (!title) continue;
      const description = extractSonnerText(t.description) || undefined;
      const key = `${String(t.id)}:${title}`;
      if (seenIdsRef.current.has(key)) continue;
      seenIdsRef.current.add(key);

      addNotification({
        id: key,
        type: mapSonnerType(t.type),
        title,
        description,
      });
    }
  }, [toasts, addNotification]);

  return null;
}

function NotificationTypeBadge({ item }: { item: AppNotificationItem }) {
  if (
    item.category === 'FORUM_REWARD' ||
    item.title.includes('Ngọc') ||
    item.title.includes('thưởng')
  ) {
    return (
      <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
        <Award className="w-4 h-4" />
      </span>
    );
  }

  if (
    item.category === 'FORUM_COMMENT' ||
    item.title.toLowerCase().includes('lời giải') ||
    item.title.toLowerCase().includes('bình luận') ||
    item.title.toLowerCase().includes('phản hồi')
  ) {
    return (
      <span className="w-8 h-8 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0 shadow-xs">
        <MessageSquare className="w-4 h-4" />
      </span>
    );
  }

  if (item.type === 'success') {
    return (
      <span className="w-8 h-8 rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </span>
    );
  }
  if (item.type === 'warning') {
    return (
      <span className="w-8 h-8 rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </span>
    );
  }
  if (item.type === 'error') {
    return (
      <span className="w-8 h-8 rounded-xl bg-rose-500/12 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4" />
      </span>
    );
  }
  return (
    <span className="w-8 h-8 rounded-xl bg-[#00B8DD]/12 text-[#009BBD] dark:text-[#5CE1FF] flex items-center justify-center shrink-0">
      <Info className="w-4 h-4" />
    </span>
  );
}

export function NotificationBellMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const items = useNotificationsStore((s) => s.items);
  const hydrate = useNotificationsStore((s) => s.hydrate);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  const handleItemClick = (item: AppNotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      setIsOpen(false);

      if (typeof window !== 'undefined') {
        try {
          const url = new URL(item.link, window.location.origin);
          const postSlug =
            url.searchParams.get('post') ||
            (url.pathname.startsWith('/forum/') ? url.pathname.replace('/forum/', '') : null);

          if (postSlug && window.location.pathname === '/forum') {
            window.dispatchEvent(
              new CustomEvent('schoolify:open-forum-post', {
                detail: { postSlug },
              })
            );
          }
        } catch {}
      }

      router.push(item.link);
    }
  };

  React.useEffect(() => {
    setIsMounted(true);
    hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const unreadCount = isMounted ? items.filter((it) => !it.read).length : 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid="navbar-notification-bell"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        aria-expanded={isOpen}
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]',
          isOpen
            ? 'bg-[#00B8DD]/10 border-[#00B8DD]/45 text-[#009BBD] dark:text-[#5CE1FF]'
            : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs',
        )}
        title="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            data-testid="navbar-notification-badge"
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold leading-none inline-flex items-center justify-center ring-2 ring-white dark:ring-slate-950 tabular-nums"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Danh sách thông báo"
          data-testid="navbar-notification-dropdown"
          className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 z-50 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/80">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00B8DD]/15 text-[#009BBD] dark:text-[#5CE1FF] tabular-nums">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#009BBD] dark:text-[#5CE1FF] hover:bg-[#00B8DD]/10 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đọc tất cả</span>
                </button>
              )}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  aria-label="Xóa tất cả thông báo"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Chưa có thông báo mới
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Các thông báo về kết quả làm bài và lộ trình sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'group w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60',
                    !item.read && 'bg-[#00B8DD]/[0.04] dark:bg-[#00B8DD]/[0.07]',
                  )}
                >
                  <NotificationTypeBadge item={item} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-xs leading-snug break-words',
                          !item.read
                            ? 'font-bold text-slate-900 dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300',
                        )}
                      >
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#00B8DD] shrink-0 mt-1" />
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                      {item.link && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#007D99] dark:text-[#00B8DD] group-hover:underline">
                          <span>Xem bài viết</span>
                          <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
