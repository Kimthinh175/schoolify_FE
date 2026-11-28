'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Plus,
  Search,
  FolderKanban,
  RefreshCw,
  ExternalLink,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  Star,
  Pin,
  Flame,
  CheckCircle2,
  FileEdit,
  CalendarClock,
  EyeOff,
  Trash2,
  Edit3,
  Send,
  X,
  ListOrdered,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog } from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { NewsArticle, NewsCategory, NewsStatus } from '@/types';
import {
  newsService,
  formatVietnameseDate,
  removeVietnameseTones,
} from '@/services/news.service';
import { AdminCategoryManagerModal } from '@/components/features/news/AdminCategoryManagerModal';
import { AdminNewsEditorModal } from '@/components/features/news/AdminNewsEditorModal';

const STATUS_META: Record<
  NewsStatus,
  { label: string; className: string; dotColor: string }
> = {
  PUBLISHED: {
    label: 'Đã xuất bản',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  DRAFT: {
    label: 'Bản nháp',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotColor: 'bg-slate-400',
  },
  SCHEDULED: {
    label: 'Hẹn giờ đăng',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  PENDING: {
    label: 'Chờ duyệt',
    className:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
    dotColor: 'bg-sky-500',
  },
  HIDDEN: {
    label: 'Đang tạm ẩn',
    className:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    dotColor: 'bg-rose-500',
  },
  REJECTED: {
    label: 'Từ chối',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  ARCHIVED: {
    label: 'Lưu trữ',
    className:
      'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
    dotColor: 'bg-slate-400',
  },
};

export default function AdminNewsPage() {
  const [articles, setArticles] = React.useState<NewsArticle[]>([]);
  const [categories, setCategories] = React.useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<NewsStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [onlyFeatured, setOnlyFeatured] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState<boolean>(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = React.useState<boolean>(false);
  const [editingArticle, setEditingArticle] = React.useState<NewsArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = React.useState<NewsArticle | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [cats, arts] = await Promise.all([
        newsService.getCategories(false),
        newsService.getArticles({ onlyPublic: false }),
      ]);
      setCategories(cats);
      setArticles(arts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ── THỐNG KÊ KPI ──
  const kpiStats = React.useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === 'PUBLISHED').length;
    const drafts = articles.filter(
      (a) => a.status === 'DRAFT' || a.status === 'PENDING'
    ).length;
    const scheduled = articles.filter((a) => a.status === 'SCHEDULED').length;
    const featured = articles.filter((a) => a.is_featured).length;
    const pinned = articles.filter((a) => a.is_pinned).length;
    const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
    const activeCategories = categories.filter((c) => c.is_active).length;

    return {
      total,
      published,
      drafts,
      scheduled,
      featured,
      pinned,
      totalViews,
      activeCategories,
    };
  }, [articles, categories]);

  // ── LỌC DANH SÁCH BÀI VIẾT ──
  const filteredArticles = React.useMemo(() => {
    const q = removeVietnameseTones(searchQuery);
    return articles.filter((art) => {
      if (statusFilter !== 'ALL' && art.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && art.category_id !== categoryFilter) return false;
      if (onlyFeatured && !art.is_featured) return false;
      if (q) {
        const haystack = removeVietnameseTones(
          `${art.title} ${art.slug} ${art.excerpt} ${art.author_name} ${(art.tags || []).join(' ')} ${art.category?.name || ''}`
        );
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [articles, statusFilter, categoryFilter, onlyFeatured, searchQuery]);

  // ── THAO TÁC NHANH TRÊN DÒNG ──
  const handleToggleFeatured = async (article: NewsArticle, nextVal: boolean) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, is_featured: nextVal } : a))
    );
    try {
      await newsService.updateArticleFlags(article.id, { is_featured: nextVal });
      toast.success(
        nextVal
          ? `⭐ Đã đặt "${article.title}" làm Tin Tiêu Điểm Nổi Bật!`
          : `Đã gỡ trạng thái Tiêu Điểm của bài viết.`
      );
    } catch (err: any) {
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, is_featured: !nextVal } : a))
      );
      toast.error(err?.message || 'Không thể cập nhật trạng thái Tiêu Điểm.');
    }
  };

  const handleTogglePinned = async (article: NewsArticle) => {
    const nextPinned = !article.is_pinned;
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, is_pinned: nextPinned } : a))
    );
    try {
      await newsService.updateArticleFlags(article.id, { is_pinned: nextPinned });
      toast.success(
        nextPinned
          ? `📌 Đã ghim bài viết lên đầu trang Tin Tức!`
          : `Đã bỏ ghim bài viết.`
      );
    } catch (err: any) {
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, is_pinned: !nextPinned } : a))
      );
      toast.error(err?.message || 'Không thể cập nhật trạng thái Ghim.');
    }
  };

  const handleToggleBreaking = async (article: NewsArticle) => {
    const nextBreaking = !article.is_breaking;
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, is_breaking: nextBreaking } : a))
    );
    try {
      await newsService.updateArticleFlags(article.id, { is_breaking: nextBreaking });
      toast.success(
        nextBreaking
          ? `🔥 Đã gắn nhãn Tin Nóng Mùa Thi!`
          : `Đã gỡ nhãn Tin Nóng.`
      );
    } catch (err: any) {
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, is_breaking: !nextBreaking } : a))
      );
      toast.error(err?.message || 'Không thể cập nhật nhãn Tin Nóng.');
    }
  };

  const handleQuickChangeStatus = async (
    article: NewsArticle,
    nextStatus: NewsStatus
  ) => {
    const prevStatus = article.status;
    const prevPublishedAt = article.published_at;
    const nowIso = new Date().toISOString();
    setArticles((prev) =>
      prev.map((a) =>
        a.id === article.id
          ? {
              ...a,
              status: nextStatus,
              published_at:
                nextStatus === 'PUBLISHED' ? a.published_at || nowIso : a.published_at,
            }
          : a
      )
    );
    try {
      await newsService.updateArticleFlags(article.id, {
        status: nextStatus,
        published_at: nextStatus === 'PUBLISHED' ? article.published_at || nowIso : article.published_at,
      });

      const statusLabel = STATUS_META[nextStatus]?.label || nextStatus;
      toast.success(`Đã chuyển trạng thái bài viết sang "${statusLabel}"!`);
    } catch (err: any) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id
            ? { ...a, status: prevStatus, published_at: prevPublishedAt }
            : a
        )
      );
      toast.error(err?.message || 'Không thể đổi trạng thái bài viết.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingArticle) return;
    const target = deletingArticle;
    setDeletingArticle(null);
    try {
      await newsService.deleteArticle(target.id);
      setArticles((prev) => prev.filter((a) => a.id !== target.id));
      toast.success(`Đã xoá bài viết "${target.title}".`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xoá bài viết.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#00B8DD] text-white font-bold text-[11px]">
              CMS QUẢN TRỊ NỘI DUNG
            </Badge>
            <span className="text-xs text-slate-500">
              • Đồng bộ thời gian thực với /news &amp; /news/[slug]
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Quản Trị Tin Tức &amp; Xuất Bản Giáo Dục
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Quản lý danh mục chuyên mục, điều phối tin tiêu điểm (Featured), kiểm duyệt bản nháp và lịch hẹn giờ xuất bản.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            <span>Làm mới</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 border-[#00B8DD]/50 text-[#007D99] dark:text-[#00B8DD] hover:bg-[#00B8DD]/10 cursor-pointer"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Quản Lý Chuyên Mục ({categories.length})</span>
          </Button>

          <Link href="/news" target="_blank">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Trang Public</span>
            </Button>
          </Link>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingArticle(null);
              setIsEditorModalOpen(true);
            }}
            className="rounded-xl text-xs font-bold gap-1.5 bg-[#00B8DD] hover:bg-[#007D99] text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn Bài Viết Mới</span>
          </Button>
        </div>
      </div>

      {/* ── 4 THẺ KPI THỐNG KÊ ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng Bài Viết
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {kpiStats.total}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
              <Eye className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>
                {kpiStats.totalViews.toLocaleString('vi-VN')} lượt đọc •{' '}
                {kpiStats.activeCategories} chuyên mục
              </span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Đang Xuất Bản
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {kpiStats.published}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" /> {kpiStats.featured} Tiêu điểm
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Pin className="w-3 h-3 text-[#00B8DD]" /> {kpiStats.pinned} Ghim
              </span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bản Nháp &amp; Chờ Duyệt
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
              {kpiStats.drafts}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Bài đang biên tập nội dung hoặc tối ưu SEO
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <FileEdit className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hẹn Giờ Xuất Bản
            </p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {kpiStats.scheduled}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Tự động lên sóng khi tới thời điểm hẹn
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* ── THANH BỘ LỌC TRẠNG THÁI, CHUYÊN MỤC & TÌM KIẾM ── */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: 'Tất cả', count: articles.length },
                {
                  id: 'PUBLISHED',
                  label: 'Đã xuất bản',
                  count: articles.filter((a) => a.status === 'PUBLISHED').length,
                },
                {
                  id: 'DRAFT',
                  label: 'Bản nháp',
                  count: articles.filter((a) => a.status === 'DRAFT').length,
                },
                {
                  id: 'SCHEDULED',
                  label: 'Hẹn giờ đăng',
                  count: articles.filter((a) => a.status === 'SCHEDULED').length,
                },
                {
                  id: 'HIDDEN',
                  label: 'Đang tạm ẩn',
                  count: articles.filter((a) => a.status === 'HIDDEN').length,
                },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5',
                    active
                      ? 'bg-[#00B8DD] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px]',
                      active
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Featured Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOnlyFeatured((prev) => !prev)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold border transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0',
                onlyFeatured
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-amber-300'
              )}
            >
              <Star
                className={cn(
                  'w-3.5 h-3.5',
                  onlyFeatured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                )}
              />
              <span>Chỉ bài Tiêu điểm ({kpiStats.featured})</span>
            </button>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tiêu đề, slug, tác giả, tag..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 mr-1">
            Chuyên mục:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border',
              categoryFilter === 'ALL'
                ? 'border-[#00B8DD] bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            Tất cả chuyên mục
          </button>

          {categories.map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(active ? 'ALL' : cat.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border inline-flex items-center gap-1.5',
                  active
                    ? 'border-[#00B8DD] bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300',
                  !cat.is_active && 'opacity-60'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color || '#00B8DD' }}
                />
                <span>{cat.name}</span>
                {!cat.is_active && (
                  <span className="text-[10px] text-rose-500">(Ẩn)</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── BẢNG DANH SÁCH BÀI VIẾT ── */}
      {filteredArticles.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3 bg-white dark:bg-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center mx-auto">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {articles.length === 0
              ? 'Chưa có bài viết tin tức nào trong hệ thống'
              : 'Không có bài viết nào khớp với bộ lọc hiện tại'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {articles.length === 0
              ? 'Bắt đầu tạo bài viết đầu tiên để xuất bản lên chuyên trang Tin Tức Schoolify.'
              : 'Bạn có thể xoá bộ lọc tìm kiếm hoặc tạo bài viết mới để xuất bản lên chuyên trang Tin Tức.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {articles.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setOnlyFeatured(false);
                  setSearchQuery('');
                }}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Đặt lại bộ lọc
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditingArticle(null);
                setIsEditorModalOpen(true);
              }}
              className="rounded-xl text-xs font-bold gap-1.5 bg-[#00B8DD] hover:bg-[#007D99] text-white shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn Bài Viết Mới</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[240px]">Bài viết &amp; Chuẩn SEO</TableHead>
              <TableHead className="min-w-[130px]">Chuyên mục &amp; Tác giả</TableHead>
              <TableHead className="min-w-[135px]">Trạng thái &amp; Lịch đăng</TableHead>
              <TableHead className="min-w-[115px]">Tiêu điểm &amp; Ghim</TableHead>
              <TableHead className="min-w-[90px]">Chỉ số đọc</TableHead>
              <TableHead className="text-right min-w-[95px] whitespace-nowrap">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map((article) => {
              const statusInfo = STATUS_META[article.status] || STATUS_META.DRAFT;
              const tocCount = article.table_of_contents?.length || 0;

              return (
                <TableRow key={article.id}>
                  {/* CỘT 1: BÀI VIẾT & SLUG */}
                  <TableCell>
                    <div className="flex items-start gap-2.5">
                      <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="w-16 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <Link
                          href={`/news/${article.slug}`}
                          target="_blank"
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-[#007D99] dark:hover:text-[#00B8DD] transition-colors line-clamp-2 leading-snug"
                        >
                          {article.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="truncate max-w-[220px]">
                            /news/{article.slug}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-sans text-slate-500">
                            <ListOrdered className="w-3 h-3 text-[#00B8DD]" />
                            {tocCount} mục lục
                          </span>
                        </div>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* CỘT 2: CHUYÊN MỤC & TÁC GIẢ */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
                        style={{
                          backgroundColor: article.category?.color || '#00B8DD',
                        }}
                      >
                        {article.category?.name || 'Chưa phân loại'}
                      </span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                        {article.author_name}
                      </p>
                      {article.grade_levels && article.grade_levels.length > 0 && (
                        <p className="text-[11px] text-slate-500">
                          Khối: {article.grade_levels.join(', ')}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* CỘT 3: TRẠNG THÁI & LỊCH ĐĂNG */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                          statusInfo.className
                        )}
                      >
                        <span
                          className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dotColor)}
                        />
                        {statusInfo.label}
                      </span>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {article.status === 'SCHEDULED' && article.scheduled_at ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            Hẹn: {formatVietnameseDate(article.scheduled_at)}
                          </span>
                        ) : (
                          <span>
                            {formatVietnameseDate(
                              article.published_at || article.created_at
                            )}
                          </span>
                        )}
                      </div>

                      {/* Nút chuyển nhanh trạng thái */}
                      <div className="pt-0.5">
                        {article.status !== 'PUBLISHED' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickChangeStatus(article, 'PUBLISHED')}
                            className="text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> Đăng bài ngay
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuickChangeStatus(article, 'HIDDEN')}
                            className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <EyeOff className="w-3 h-3" /> Tạm ẩn bài
                          </button>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* CỘT 4: TIÊU ĐIỂM (FEATURED) & GHIM / TIN NÓNG */}
                  <TableCell>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          checked={article.is_featured}
                          onCheckedChange={(val) => handleToggleFeatured(article, val)}
                          aria-label="Bật/tắt tin tiêu điểm"
                        />
                        <span
                          className={cn(
                            'text-xs font-bold',
                            article.is_featured
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          )}
                        >
                          {article.is_featured ? '⭐ Tiêu điểm' : 'Thường'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePinned(article)}
                          title="Ghim bài viết lên đầu danh sách"
                          className={cn(
                            'px-2 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 transition-colors cursor-pointer',
                            article.is_pinned
                              ? 'border-[#00B8DD] bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                          )}
                        >
                          <Pin className="w-3 h-3" />
                          <span>Ghim</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBreaking(article)}
                          title="Đánh dấu Tin Nóng Mùa Thi"
                          className={cn(
                            'px-2 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 transition-colors cursor-pointer',
                            article.is_breaking
                              ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                          )}
                        >
                          <Flame className="w-3 h-3" />
                          <span>Nóng</span>
                        </button>
                      </div>
                    </div>
                  </TableCell>

                  {/* CỘT 5: CHỈ SỐ ĐỌC */}
                  <TableCell>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Eye className="w-3.5 h-3.5 text-[#00B8DD]" />
                        <span>{(article.view_count || 0).toLocaleString('vi-VN')} xem</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                        <span>{article.like_count || 0} hữu ích</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{article.reading_time_minutes} phút đọc</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* CỘT 6: THAO TÁC */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <Link href={`/news/${article.slug}`} target="_blank">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title="Xem trang đọc bài"
                          className="h-8 px-2.5 rounded-lg text-xs cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        title="Chỉnh sửa bài viết"
                        onClick={() => {
                          setEditingArticle(article);
                          setIsEditorModalOpen(true);
                        }}
                        className="h-8 px-2.5 rounded-lg text-xs text-[#007D99] dark:text-[#00B8DD] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        title="Xoá bài viết"
                        onClick={() => setDeletingArticle(article)}
                        className="h-8 px-2.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* ── MODAL SOẠN THẢO / CHỈNH SỬA BÀI VIẾT ── */}
      <AdminNewsEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setEditingArticle(null);
        }}
        categories={categories}
        editingArticle={editingArticle}
        onSaved={() => {
          loadData();
        }}
      />

      {/* ── MODAL QUẢN LÝ CHUYÊN MỤC ── */}
      <AdminCategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onUpdated={loadData}
      />

      {/* ── DIALOG XÁC NHẬN XOÁ BÀI VIẾT ── */}
      <Dialog
        isOpen={Boolean(deletingArticle)}
        onClose={() => setDeletingArticle(null)}
        maxWidth="md"
        title="Xác nhận xoá bài viết"
        description="Hành động này sẽ gỡ bài viết khỏi hệ thống tin tức. Bạn có chắc chắn muốn tiếp tục?"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingArticle(null)}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              Huỷ bỏ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              Xoá bài viết
            </Button>
          </>
        }
      >
        {deletingArticle && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {deletingArticle.title}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              /news/{deletingArticle.slug}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
