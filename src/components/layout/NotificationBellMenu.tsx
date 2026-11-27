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
  BookOpen,
  Sparkles,
  MessageSquare,
  X,
  RefreshCw,
  Search,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { useSonner } from 'sonner';
import {
  useNotificationsStore,
  type AppNotificationItem,
  type AppNotificationType,
  type NotificationCategory,
} from '@/store/notifications.store';
import { useAuthStore } from '@/store/auth.store';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
 * Kiểm tra xem toast của Sonner có phải là lỗi nhập liệu form tạm thời hoặc thao tác phản hồi UI nội bộ hay không
 * để tránh làm rác hoặc trùng lặp trong Trung tâm Thông báo hệ thống.
 */
function isTransientValidationToast(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.startsWith('vui lòng nhập') ||
    lower.startsWith('mật khẩu xác nhận không khớp') ||
    lower.startsWith('không tìm thấy tài khoản') ||
    lower.startsWith('đã chọn ảnh') ||
    lower.startsWith('đã gửi thông báo') ||
    lower.startsWith('đã phát thông báo') ||
    lower.startsWith('đã cập nhật điểm thành công') ||
    lower.startsWith('đã mở khóa tài khoản') ||
    lower.startsWith('đã khóa tài khoản') ||
    lower.startsWith('không thể ')
  );
}

/**
 * Cầu nối tự động ghi các thông báo sự kiện quan trọng phát sinh vào trung tâm thông báo Header.
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
      if (!title || isTransientValidationToast(title)) continue;
      const description = extractSonnerText(t.description) || undefined;
      const key = `${String(t.id)}:${title}`;
      if (seenIdsRef.current.has(key)) continue;
      seenIdsRef.current.add(key);

      addNotification({
        id: key,
        type: mapSonnerType(t.type),
        title,
        description,
        message: description,
      });
    }
  }, [toasts, addNotification]);

  return null;
}

function NotificationTypeBadge({
  type,
  category,
}: {
  type: AppNotificationItem['type'];
  category?: NotificationCategory;
}) {
  if (category === 'LEARNING') {
    return (
      <span className="w-8 h-8 rounded-xl bg-[#00B8DD]/12 text-[#009BBD] dark:text-[#5CE1FF] flex items-center justify-center shrink-0">
        <BookOpen className="w-4 h-4" />
      </span>
    );
  }
  if (category === 'REWARD') {
    return (
      <span className="w-8 h-8 rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4" />
      </span>
    );
  }
  if (category === 'COMMUNITY') {
    return (
      <span className="w-8 h-8 rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
        <MessageSquare className="w-4 h-4" />
      </span>
    );
  }

  if (type === 'success') {
    return (
      <span className="w-8 h-8 rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </span>
    );
  }
  if (type === 'warning') {
    return (
      <span className="w-8 h-8 rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </span>
    );
  }
  if (type === 'error') {
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

const CATEGORY_LABEL_MAP: Record<NotificationCategory, { label: string; badgeClass: string }> = {
  LEARNING: {
    label: 'Học tập & Lộ trình',
    badgeClass: 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#5CE1FF]',
  },
  REWARD: {
    label: 'Điểm & Đổi thưởng',
    badgeClass: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  },
  COMMUNITY: {
    label: 'Diễn đàn & Hỏi đáp',
    badgeClass: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300',
  },
  SYSTEM: {
    label: 'Hệ thống',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
};

type FilterTabId = 'ALL' | 'UNREAD' | 'LEARNING' | 'REWARD' | 'COMMUNITY';

export function NotificationBellMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCenterModalOpen, setIsCenterModalOpen] = React.useState(false);
  const [centerSearchQuery, setCenterSearchQuery] = React.useState('');
  const [centerCategoryFilter, setCenterCategoryFilter] = React.useState<FilterTabId>('ALL');
  const [isMounted, setIsMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<FilterTabId>('ALL');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const items = useNotificationsStore((s) => s.items);
  const isSyncing = useNotificationsStore((s) => s.isSyncing);
  const hydrate = useNotificationsStore((s) => s.hydrate);
  const syncFromBackend = useNotificationsStore((s) => s.syncFromBackend);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const removeNotification = useNotificationsStore((s) => s.removeNotification);
  const clearAll = useNotificationsStore((s) => s.clearAll);

  React.useEffect(() => {
    setIsMounted(true);
    hydrate();
  }, [hydrate]);

  // Đồng bộ từ Backend khi đăng nhập và tự động poll mỗi 60s khi tab trình duyệt đang mở
  React.useEffect(() => {
    if (!isMounted) return;
    if (!isAuthenticated) {
      useNotificationsStore.setState({ items: [] });
      return;
    }
    syncFromBackend();

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncFromBackend();
      }
    }, 60000);

    return () => window.clearInterval(interval);
  }, [isMounted, isAuthenticated, syncFromBackend]);

  React.useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    syncFromBackend();
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
  }, [isOpen, syncFromBackend]);

  const unreadCount = isMounted ? items.filter((it) => !it.read).length : 0;

  const filteredItems = React.useMemo(() => {
    switch (activeTab) {
      case 'UNREAD':
        return items.filter((it) => !it.read);
      case 'LEARNING':
        return items.filter((it) => it.category === 'LEARNING');
      case 'REWARD':
        return items.filter((it) => it.category === 'REWARD');
      default:
        return items;
    }
  }, [items, activeTab]);

  const filterTabs: Array<{ id: FilterTabId; label: string; count?: number }> = [
    { id: 'ALL', label: 'Tất cả', count: items.length },
    { id: 'UNREAD', label: 'Chưa đọc', count: unreadCount },
    { id: 'LEARNING', label: 'Học tập' },
    { id: 'REWARD', label: 'Điểm & Quà' },
  ];

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
            : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs'
        )}
        title="Thông báo hệ thống"
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
          className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[400px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 z-50 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
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
              <button
                type="button"
                onClick={() => syncFromBackend()}
                disabled={isSyncing}
                title="Đồng bộ thông báo mới"
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 transition-colors cursor-pointer"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin text-[#00B8DD]')} />
              </button>
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
                  <span>Xóa hết</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs (Tất cả / Chưa đọc / Học tập / Điểm & Quà) */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shrink-0',
                    active
                      ? 'bg-[#00B8DD] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums',
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredItems.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {activeTab === 'UNREAD'
                    ? 'Bạn đã đọc hết mọi thông báo'
                    : 'Chưa có thông báo nào trong mục này'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Các thông báo về kết quả làm bài, Tia Sáng và lộ trình sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const bodyText = item.message || item.description;
                const catMeta =
                  CATEGORY_LABEL_MAP[item.category || 'SYSTEM'] || CATEGORY_LABEL_MAP.SYSTEM;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'group relative w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60',
                      !item.read && 'bg-[#00B8DD]/[0.04] dark:bg-[#00B8DD]/[0.07]'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        markAsRead(item.id);
                        if (item.link) {
                          setIsOpen(false);
                          router.push(item.link);
                        }
                      }}
                      className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <NotificationTypeBadge type={item.type} category={item.category} />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-xs leading-snug break-words pr-4',
                              !item.read
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'font-medium text-slate-700 dark:text-slate-300'
                            )}
                          >
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-[#00B8DD] shrink-0 mt-1" />
                          )}
                        </div>

                        {bodyText && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                            {bodyText}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
                              catMeta.badgeClass
                            )}
                          >
                            {catMeta.label}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            {formatRelativeTime(item.createdAt || item.created_at || '')}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Nút xóa riêng từng thông báo */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(item.id);
                      }}
                      title="Xóa thông báo này"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Mở Trung Tâm Thông Báo (Xem tất cả & Tìm kiếm) */}
          <div className="px-3.5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Tổng cộng {items.length} thông báo
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCenterModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B8DD] hover:text-[#009BBD] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Mở Trung Tâm Thông Báo</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL TRUNG TÂM THÔNG BÁO (XEM TOÀN BỘ & TÌM KIẾM) ── */}
      <Dialog
        isOpen={isCenterModalOpen}
        onClose={() => setIsCenterModalOpen(false)}
        maxWidth="2xl"
        title="Trung Tâm Thông Báo Hệ Thống"
        description="Tra cứu, lọc theo chuyên mục và quản lý toàn bộ thông báo tài khoản của bạn."
      >
        <div className="space-y-4 pt-1">
          {/* Thanh tìm kiếm & nút thao tác nhanh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Input
                placeholder="Tìm kiếm thông báo theo tiêu đề hoặc nội dung..."
                value={centerSearchQuery}
                onChange={(e) => setCenterSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-9 text-xs font-semibold gap-1.5 text-[#007D99] dark:text-[#00B8DD]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Đánh dấu đã đọc ({unreadCount})
                </Button>
              )}
              {items.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-9 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa tất cả
                </Button>
              )}
            </div>
          </div>

          {/* Bộ lọc Category trong Modal */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            {(
              [
                { id: 'ALL', label: `Tất cả (${items.length})` },
                { id: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
                { id: 'LEARNING', label: 'Học tập & Lộ trình' },
                { id: 'REWARD', label: 'Điểm & Đổi thưởng' },
                { id: 'COMMUNITY', label: 'Diễn đàn & Cộng đồng' },
              ] as Array<{ id: FilterTabId; label: string }>
            ).map((tab) => {
              const active = centerCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCenterCategoryFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    active
                      ? 'bg-[#00B8DD] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Danh sách thông báo đầy đủ */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {(() => {
              const q = centerSearchQuery.trim().toLowerCase();
              const list = items.filter((it) => {
                if (centerCategoryFilter === 'UNREAD' && it.read) return false;
                if (
                  centerCategoryFilter !== 'ALL' &&
                  centerCategoryFilter !== 'UNREAD' &&
                  it.category !== centerCategoryFilter
                ) {
                  return false;
                }
                if (q) {
                  const matchTitle = it.title.toLowerCase().includes(q);
                  const matchBody = (it.message || it.description || '')
                    .toLowerCase()
                    .includes(q);
                  if (!matchTitle && !matchBody) return false;
                }
                return true;
              });

              if (list.length === 0) {
                return (
                  <div className="py-12 px-4 text-center space-y-2">
                    <Bell className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Không tìm thấy thông báo nào phù hợp
                    </p>
                  </div>
                );
              }

              return list.map((item) => {
                const bodyText = item.message || item.description;
                const catMeta =
                  CATEGORY_LABEL_MAP[item.category || 'SYSTEM'] || CATEGORY_LABEL_MAP.SYSTEM;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 flex items-start justify-between gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      !item.read && 'bg-[#00B8DD]/[0.04] dark:bg-[#00B8DD]/[0.07]'
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <NotificationTypeBadge type={item.type} category={item.category} />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold',
                              catMeta.badgeClass
                            )}
                          >
                            {catMeta.label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatRelativeTime(item.createdAt || item.created_at || '')}
                          </span>
                          {!item.read && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#00B8DD] text-white text-[9px] font-bold">
                              MỚI
                            </span>
                          )}
                        </div>
                        <h4
                          className={cn(
                            'text-xs sm:text-sm break-words',
                            !item.read
                              ? 'font-bold text-slate-900 dark:text-white'
                              : 'font-semibold text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {item.title}
                        </h4>
                        {bodyText && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                            {bodyText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.link && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markAsRead(item.id);
                            setIsCenterModalOpen(false);
                            router.push(item.link!);
                          }}
                          className="h-8 px-2.5 text-[11px] font-semibold gap-1"
                        >
                          <span>Xem</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      {!item.read && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(item.id)}
                          className="h-8 px-2 text-[11px] font-semibold text-[#00B8DD]"
                          title="Đánh dấu đã đọc"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeNotification(item.id)}
                        className="h-8 px-2 text-slate-400 hover:text-rose-500"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
