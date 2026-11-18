'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flag,
  HelpCircle,
  Lock,
  MessageSquare,
  MessagesSquare,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ALL_FORUM_SEED_POSTS } from '@/data/forum-seed-posts';

interface AdminForumPost {
  id: string;
  title: string;
  slug?: string;
  subject: string;
  grade: number;
  content?: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
  isSolved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  timeAgo: string;
}

interface AdminForumReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  targetTitleOrSnippet: string;
  reason: string;
  reasonLabel: string;
  description?: string;
  evidenceUrls?: string[];
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  moderationAction?: string;
  adminNote?: string;
  createdAt: string;
}

const DEFAULT_REPORTS: AdminForumReport[] = [
  {
    id: 'rep-seed-01',
    reporterId: 'std-002',
    reporterName: 'Trần Thị Mai',
    reporterRole: 'Học sinh',
    targetType: 'POST',
    targetId: 'toan-11-tim-so-nghiem-phuong-trinh-luong-giac-tren-doan',
    targetTitleOrSnippet: 'Tìm số nghiệm phương trình lượng giác trên đoạn [0; 2pi]',
    reason: 'SPAM',
    reasonLabel: 'Spam / Quảng cáo',
    description: 'Chủ đề có chèn liên kết nhóm kéo cờ bạc, không phục vụ mục đích học bài.',
    status: 'PENDING',
    createdAt: '15 phút trước',
  },
  {
    id: 'rep-seed-02',
    reporterId: 'tch-001',
    reporterName: 'Thầy Lê Hoàng Nam',
    reporterRole: 'Giáo viên',
    targetType: 'COMMENT',
    targetId: 'cmt-spam-09',
    targetTitleOrSnippet: 'Cách giải này hoàn toàn sai bản chất, bạn giải vớ vẩn quá...',
    reason: 'OFFENSIVE_LANGUAGE',
    reasonLabel: 'Ngôn từ thiếu chuẩn mực',
    description: 'Bình luận mang tính thóa mạ bạn học, công kích cá nhân.',
    status: 'PENDING',
    createdAt: '45 phút trước',
  },
  {
    id: 'rep-seed-03',
    reporterId: 'std-005',
    reporterName: 'Nguyễn Đăng Khoa',
    reporterRole: 'Học sinh',
    targetType: 'COMMENT',
    targetId: 'cmt-misinfo-01',
    targetTitleOrSnippet: 'Áp dụng công thức tính nhanh: S = a * b * c / 2 (sai công thức)',
    reason: 'MISINFORMATION',
    reasonLabel: 'Sai kiến thức nghiêm trọng',
    description: 'Hướng dẫn công thức hình học bịa đặt, khiến nhiều bạn làm sai đề thi.',
    status: 'RESOLVED',
    moderationAction: 'HIDE_CONTENT',
    adminNote: 'Đã ẩn bình luận sai kiến thức tránh gây hiểu lầm',
    createdAt: '2 giờ trước',
  },
];

export default function AdminForumPage() {
  const [activeTab, setActiveTab] = React.useState<'POSTS' | 'REPORTS'>('POSTS');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [subjectFilter, setSubjectFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [reportStatusFilter, setReportStatusFilter] = React.useState<string>('ALL');

  // Dữ liệu quản trị bài viết
  const [posts, setPosts] = React.useState<AdminForumPost[]>(() =>
    ALL_FORUM_SEED_POSTS.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      subject: p.subject,
      grade: p.grade,
      content: p.content || '',
      author: p.author,
      repliesCount: p.repliesCount,
      likesCount: p.likesCount,
      viewsCount: p.viewsCount,
      isSolved: Boolean(p.isSolved),
      isPinned: Boolean(p.isPinned),
      isLocked: Boolean((p as any).isLocked || (p as any).is_locked),
      isHidden: false,
      timeAgo: p.timeAgo,
    }))
  );

  // Dữ liệu quản trị báo cáo
  const [reports, setReports] = React.useState<AdminForumReport[]>(DEFAULT_REPORTS);
  const [selectedReport, setSelectedReport] = React.useState<AdminForumReport | null>(null);
  const [adminNoteInput, setAdminNoteInput] = React.useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Thống kê 4 thẻ KPI
  const totalPosts = posts.length;
  const totalSolved = posts.filter((p) => p.isSolved).length;
  const totalLocked = posts.filter((p) => p.isLocked).length;
  const totalPendingReports = reports.filter((r) => r.status === 'PENDING').length;

  // Lọc bài viết
  const filteredPosts = React.useMemo(() => {
    return posts.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAuthor = p.author.name.toLowerCase().includes(q);
        const matchSubject = p.subject.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchSubject) return false;
      }
      if (subjectFilter !== 'ALL' && p.subject !== subjectFilter) {
        return false;
      }
      if (statusFilter === 'PINNED' && !p.isPinned) return false;
      if (statusFilter === 'LOCKED' && !p.isLocked) return false;
      if (statusFilter === 'HIDDEN' && !p.isHidden) return false;
      if (statusFilter === 'SOLVED' && !p.isSolved) return false;
      return true;
    });
  }, [posts, searchQuery, subjectFilter, statusFilter]);

  // Lọc báo cáo vi phạm
  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      if (reportStatusFilter !== 'ALL' && r.status !== reportStatusFilter) {
        return false;
      }
      return true;
    });
  }, [reports, reportStatusFilter]);

  // Thao tác Ghim bài viết
  const handleTogglePin = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const nextState = !post.isPinned;

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPinned: nextState } : p))
    );

    try {
      await fetch(`http://localhost:3005/api/v1/forum/moderation/posts/${postId}/pin`, {
        method: 'PATCH',
      });
    } catch {
      // offline fallback
    }

    showToast(nextState ? '📌 Đã ghim bài viết lên đầu diễn đàn!' : 'Đã bỏ ghim bài viết.');
  };

  // Thao tác Khóa bài viết
  const handleToggleLock = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const nextState = !post.isLocked;

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isLocked: nextState } : p))
    );

    try {
      await fetch(`http://localhost:3005/api/v1/forum/moderation/posts/${postId}/lock`, {
        method: 'PATCH',
      });
    } catch {
      // offline fallback
    }

    showToast(
      nextState
        ? '🔒 Đã khóa bình luận bài viết (ngăn chặn spam phản hồi).'
        : '🔓 Đã mở khóa bình luận cho bài viết.'
    );
  };

  // Thao tác Ẩn bài viết
  const handleToggleHide = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const nextState = !post.isHidden;

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isHidden: nextState } : p))
    );

    try {
      await fetch(`http://localhost:3005/api/v1/forum/moderation/posts/${postId}/hide`, {
        method: 'PATCH',
      });
    } catch {
      // offline fallback
    }

    showToast(
      nextState
        ? '👁️‍🗨️ Đã ẩn bài viết vi phạm khỏi diễn đàn công cộng.'
        : 'Đã khôi phục hiển thị bài viết công khai.'
    );
  };

  // ── THÊM CHỦ ĐỀ / BÀI VIẾT MỚI (CREATE POST) ──
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [createTitle, setCreateTitle] = React.useState('');
  const [createSubject, setCreateSubject] = React.useState('Toán Học');
  const [createGrade, setCreateGrade] = React.useState(12);
  const [createContent, setCreateContent] = React.useState('');
  const [createIsPinned, setCreateIsPinned] = React.useState(false);

  const handleOpenCreateModal = () => {
    setCreateTitle('');
    setCreateSubject('Toán Học');
    setCreateGrade(12);
    setCreateContent('');
    setCreateIsPinned(false);
    setIsCreateModalOpen(true);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    const newPost: AdminForumPost = {
      id: `post-admin-${Date.now()}`,
      title: createTitle.trim(),
      slug: `thong-bao-admin-${Date.now()}`,
      subject: createSubject,
      grade: Number(createGrade),
      content: createContent.trim(),
      author: {
        name: 'Kim Thịnh (Super Admin)',
        avatar: '',
        role: 'SUPER_ADMIN',
      },
      repliesCount: 0,
      likesCount: 0,
      viewsCount: 1,
      isSolved: false,
      isPinned: createIsPinned,
      isLocked: false,
      isHidden: false,
      timeAgo: 'Vừa xong',
    };

    setPosts((prev) => [newPost, ...prev]);
    setIsCreateModalOpen(false);

    try {
      await fetch('http://localhost:3005/api/v1/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          subject: newPost.subject,
          grade: newPost.grade,
          isPinned: newPost.isPinned,
        }),
      });
    } catch {
      // offline fallback
    }

    showToast('🎉 Đã thêm chủ đề mới từ Quản trị viên thành công!');
  };

  // ── SỬA BÀI VIẾT (EDIT POST) ──
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<AdminForumPost | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editSubject, setEditSubject] = React.useState('Toán Học');
  const [editGrade, setEditGrade] = React.useState(12);
  const [editContent, setEditContent] = React.useState('');

  const handleOpenEditModal = (post: AdminForumPost) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditSubject(post.subject);
    setEditGrade(post.grade || 12);
    setEditContent(post.content || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim()) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              title: editTitle.trim(),
              subject: editSubject,
              grade: Number(editGrade),
              content: editContent.trim(),
            }
          : p
      )
    );

    const targetId = editingPost.id;
    setIsEditModalOpen(false);
    setEditingPost(null);

    try {
      await fetch(`http://localhost:3005/api/v1/forum/posts/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          subject: editSubject,
          grade: Number(editGrade),
        }),
      });
    } catch {
      // offline fallback
    }

    showToast('✏️ Đã cập nhật nội dung bài viết thành công!');
  };

  // ── XÓA BÀI VIẾT (DELETE POST) ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deletingPost, setDeletingPost] = React.useState<AdminForumPost | null>(null);

  const handleOpenDeleteModal = (post: AdminForumPost) => {
    setDeletingPost(post);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeletePost = async () => {
    if (!deletingPost) return;
    const targetId = deletingPost.id;

    setPosts((prev) => prev.filter((p) => p.id !== targetId));
    setIsDeleteModalOpen(false);
    setDeletingPost(null);

    try {
      await fetch(`http://localhost:3005/api/v1/forum/posts/${targetId}`, {
        method: 'DELETE',
      });
    } catch {
      // offline fallback
    }

    showToast('🗑️ Đã xóa bài viết khỏi diễn đàn thành công!');
  };

  // Thao tác Duyệt 1 chạm Báo cáo vi phạm
  const handleResolveReport = async (
    reportId: string,
    status: 'RESOLVED' | 'REJECTED',
    action: string = 'NONE',
    note?: string
  ) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status,
              moderationAction: action,
              adminNote: note || r.adminNote,
            }
          : r
      )
    );

    // Nếu hành động là ẩn nội dung thì cập nhật bảng bài viết
    if (action === 'HIDE_CONTENT') {
      const targetRep = reports.find((r) => r.id === reportId);
      if (targetRep && targetRep.targetType === 'POST') {
        setPosts((prev) =>
          prev.map((p) => (p.id === targetRep.targetId ? { ...p, isHidden: true } : p))
        );
      }
    }

    try {
      await fetch(
        `http://localhost:3005/api/v1/forum/moderation/reports/${reportId}/resolve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            moderationAction: action,
            adminNote: note,
          }),
        }
      );
    } catch {
      // offline fallback
    }

    setSelectedReport(null);
    showToast(
      status === 'RESOLVED'
        ? `✅ Đã duyệt báo cáo & áp dụng chế tài: ${action === 'HIDE_CONTENT' ? 'Ẩn nội dung vi phạm' : action === 'DELETE_CONTENT' ? 'Xóa vĩnh viễn' : 'Cảnh báo'}`
        : '❌ Đã bác bỏ báo cáo vi phạm không có cơ sở.'
    );
  };

  return (
    <div className="w-full max-w-full space-y-5 px-3 sm:px-6 py-4 overflow-hidden">
      {/* 1. Header & Nút liên kết */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#00B8DD]">
            <MessagesSquare className="w-6 h-6 text-[#00B8DD]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Quản Trị Diễn Đàn &amp; Kiểm Duyệt
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Điều phối nội dung hỏi đáp, ghim chủ đề nổi bật, khóa bình luận và xử lý báo cáo vi phạm cộng đồng.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#00B8DD] hover:bg-[#009ec0] text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Chủ Đề Mới</span>
          </Button>

          <Link
            href="/forum"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#00B8DD] hover:text-[#00B8DD] transition-all shadow-xs"
          >
            <span>Xem Diễn đàn công khai</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Thông báo Toast nhanh */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. Thống kê 4 thẻ KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tổng Chủ Đề Hỏi Đáp
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#00B8DD] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalPosts}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Chủ đề thảo luận cộng đồng</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đã Giải Quyết (Chuẩn)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalSolved}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Đạt {totalPosts > 0 ? Math.round((totalSolved / totalPosts) * 100) : 0}% lời giải chuẩn
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đang Khóa Bình Luận
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {totalLocked}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tạm dừng nhận lời giải mới</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Báo Cáo Chờ Xử Lý
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div
            className={cn(
              'text-2xl font-black mt-2',
              totalPendingReports > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            )}
          >
            {totalPendingReports}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Yêu cầu từ học sinh &amp; giáo viên</p>
        </Card>
      </div>

      {/* 3. Thanh Tab Điều Hướng */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('POSTS')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2',
            activeTab === 'POSTS'
              ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tab 1: Quản lý Chủ đề ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REPORTS')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2',
            activeTab === 'REPORTS'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Flag className="w-4 h-4" />
          <span>Tab 2: Xử lý Báo cáo vi phạm</span>
          {totalPendingReports > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
              {totalPendingReports}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: QUẢN LÝ CHỦ ĐỀ HỎI BÀI ── */}
      {activeTab === 'POSTS' && (
        <div className="space-y-4">
          {/* Bộ lọc tìm kiếm */}
          <Card className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm chủ đề, tác giả hoặc môn học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Lọc môn học */}
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Môn học: Tất cả</option>
                  <option value="Toán Học">Toán Học</option>
                  <option value="Vật Lý">Vật Lý</option>
                  <option value="Hóa Học">Hóa Học</option>
                  <option value="Tin Học">Tin Học</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Sinh Học">Sinh Học</option>
                  <option value="Ngữ Văn">Ngữ Văn</option>
                </select>

                {/* Lọc trạng thái */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Trạng thái: Tất cả</option>
                  <option value="PINNED">Đã ghim (Pin)</option>
                  <option value="LOCKED">Bị khóa bình luận (Lock)</option>
                  <option value="HIDDEN">Đã ẩn (Hidden)</option>
                  <option value="SOLVED">Đã có lời giải chuẩn (Solved)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Bảng danh sách bài viết */}
          <Card className="p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {/* ── MOBILE CARD STACK (< 1024px) TỐI ƯU 375px: 0px CUỘN NGANG ── */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800/80 w-full max-w-full overflow-hidden">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Không tìm thấy chủ đề nào phù hợp với bộ lọc.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="p-3.5 sm:p-4 space-y-3 w-full max-w-full">
                    {/* Header Thẻ Mobile */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                            {post.subject} • Lớp {post.grade}
                          </span>
                          {post.isPinned && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" /> Ghim
                            </span>
                          )}
                          {post.isLocked && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Đã khóa
                            </span>
                          )}
                          {post.isHidden && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/20 text-slate-600 dark:text-slate-400">
                              Đã ẩn
                            </span>
                          )}
                          {post.isSolved && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Chuẩn nhất
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white break-words line-clamp-2">
                          {post.title}
                        </h4>
                      </div>
                    </div>

                    {/* Metadata Mobile */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Người đăng: <b>{post.author.name}</b></span>
                      <div className="flex items-center gap-2.5">
                        <span>💬 {post.repliesCount}</span>
                        <span>👍 {post.likesCount}</span>
                        <span>👁️ {post.viewsCount}</span>
                      </div>
                    </div>

                    {/* Nút hành động Mobile to bản, tiện chạm */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePin(post.id)}
                        className={cn(
                          'text-[11px] font-bold py-1.5 h-auto rounded-xl flex items-center justify-center gap-1',
                          post.isPinned
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                            : 'text-slate-600 dark:text-slate-400'
                        )}
                      >
                        <Pin className="w-3 h-3" />
                        <span>{post.isPinned ? 'Bỏ ghim' : 'Ghim'}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleLock(post.id)}
                        className={cn(
                          'text-[11px] font-bold py-1.5 h-auto rounded-xl flex items-center justify-center gap-1',
                          post.isLocked
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700'
                            : 'text-slate-600 dark:text-slate-400'
                        )}
                      >
                        {post.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{post.isLocked ? 'Mở khóa' : 'Khóa'}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleHide(post.id)}
                        className={cn(
                          'text-[11px] font-bold py-1.5 h-auto rounded-xl flex items-center justify-center gap-1',
                          post.isHidden
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            : 'text-slate-600 dark:text-slate-400'
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{post.isHidden ? 'Bỏ ẩn' : 'Ẩn bài'}</span>
                      </Button>
                    </div>

                    {/* Hàng 2 Mobile: Sửa & Xóa bài */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(post)}
                        className="text-[11px] font-bold py-1.5 h-auto rounded-xl flex items-center justify-center gap-1 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/30 hover:bg-[#00B8DD]/10"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Sửa bài</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(post)}
                        className="text-[11px] font-bold py-1.5 h-auto rounded-xl flex items-center justify-center gap-1 text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa bài</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── DESKTOP TABLE VIEW (>= 1024px) ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Chủ đề câu hỏi</th>
                    <th className="py-3 px-3">Môn học</th>
                    <th className="py-3 px-3">Tác giả</th>
                    <th className="py-3 px-3">Tương tác</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác kiểm duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Không tìm thấy chủ đề nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs break-words">
                          <Link
                            href={`/forum/${post.slug || post.id}`}
                            target="_blank"
                            className="hover:text-[#00B8DD] transition-colors"
                          >
                            {post.title}
                          </Link>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                            {post.subject} (Lớp {post.grade})
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {post.author.name}
                          </div>
                          <span className="text-[10px] text-slate-400">{post.author.role}</span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          <div>💬 {post.repliesCount} câu trả lời</div>
                          <div>👍 {post.likesCount} hữu ích</div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 flex-wrap">
                            {post.isPinned && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5" /> Ghim
                              </span>
                            )}
                            {post.isLocked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Khóa
                              </span>
                            )}
                            {post.isHidden && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-600 dark:text-slate-300">
                                Ẩn
                              </span>
                            )}
                            {post.isSolved && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> Đã xong
                              </span>
                            )}
                            {!post.isPinned && !post.isLocked && !post.isHidden && !post.isSolved && (
                              <span className="text-slate-400 text-[11px]">Bình thường</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePin(post.id)}
                              title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài lên đầu'}
                              className={cn(
                                'p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                                post.isPinned
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                              )}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleLock(post.id)}
                              title={post.isLocked ? 'Mở khóa bình luận' : 'Khóa bình luận'}
                              className={cn(
                                'p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                                post.isLocked
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700'
                                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                              )}
                            >
                              {post.isLocked ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleHide(post.id)}
                              title={post.isHidden ? 'Bỏ ẩn bài' : 'Ẩn bài viết'}
                              className={cn(
                                'p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                                post.isHidden
                                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-400'
                                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                              )}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(post)}
                              title="Sửa nội dung bài viết"
                              className="p-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(post)}
                              title="Xóa bài viết khỏi diễn đàn"
                              className="p-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-300 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: XỬ LÝ BÁO CÁO VI PHẠM (DUYỆT 1 CHẠM) ── */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          {/* Bộ lọc báo cáo */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs w-fit">
            {[
              { id: 'ALL', label: `Tất cả (${reports.length})` },
              { id: 'PENDING', label: `Chờ duyệt (${totalPendingReports})` },
              { id: 'RESOLVED', label: 'Đã giải quyết' },
              { id: 'REJECTED', label: 'Đã bác bỏ' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportStatusFilter(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  reportStatusFilter === tab.id
                    ? 'bg-[#00B8DD] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Danh sách báo cáo vi phạm */}
          <Card className="p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {/* ── MOBILE CARD STACK (< 1024px) TỐI ƯU 375px: 0px CUỘN NGANG ── */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800/80 w-full max-w-full overflow-hidden">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Không có báo cáo vi phạm nào trong danh mục này.
                </div>
              ) : (
                filteredReports.map((rep) => (
                  <div key={rep.id} className="p-3.5 sm:p-4 space-y-3 w-full max-w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
                              rep.targetType === 'POST'
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            )}
                          >
                            {rep.targetType === 'POST' ? 'Bài hỏi' : 'Bình luận'}
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400">
                            {rep.reasonLabel}
                          </span>

                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold',
                              rep.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                : rep.status === 'RESOLVED'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            )}
                          >
                            {rep.status === 'PENDING'
                              ? 'Chờ duyệt'
                              : rep.status === 'RESOLVED'
                                ? 'Đã giải quyết'
                                : 'Đã bác bỏ'}
                          </span>
                        </div>

                        {/* Nội dung trích dẫn vi phạm */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 italic break-words">
                          &ldquo;{rep.targetTitleOrSnippet}&rdquo;
                        </div>
                      </div>
                    </div>

                    {rep.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                        <b>Mô tả:</b> {rep.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Báo cáo bởi: <b>{rep.reporterName}</b> ({rep.reporterRole})</span>
                      <span>{rep.createdAt}</span>
                    </div>

                    {/* NÚT DUYỆT 1 CHẠM MOBILE */}
                    {rep.status === 'PENDING' ? (
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleResolveReport(rep.id, 'RESOLVED', 'HIDE_CONTENT')}
                          className="text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white h-auto py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ẩn &amp; Duyệt</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveReport(rep.id, 'RESOLVED', 'DELETE_CONTENT')}
                          className="text-[10px] font-bold text-rose-600 border-rose-300 dark:border-rose-700 h-auto py-2 rounded-xl flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa bỏ</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveReport(rep.id, 'REJECTED', 'NONE')}
                          className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 h-auto py-2 rounded-xl flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Bác bỏ</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-slate-400 italic">
                        Đã xử lý: {rep.adminNote || 'Không có ghi chú'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* ── DESKTOP TABLE VIEW (>= 1024px) ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Đối tượng vi phạm</th>
                    <th className="py-3 px-3">Lý do báo cáo</th>
                    <th className="py-3 px-3">Người báo cáo</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Duyệt 1 chạm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Không có báo cáo nào.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => (
                      <tr
                        key={rep.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={cn(
                                'px-2 py-0.2 rounded text-[10px] font-bold uppercase',
                                rep.targetType === 'POST'
                                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              )}
                            >
                              {rep.targetType === 'POST' ? 'Bài hỏi' : 'Bình luận'}
                            </span>
                            <span className="text-[10px] text-slate-400">{rep.createdAt}</span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white break-words line-clamp-2 italic">
                            &ldquo;{rep.targetTitleOrSnippet}&rdquo;
                          </p>
                          {rep.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              Mô tả: {rep.description}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            {rep.reasonLabel}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {rep.reporterName}
                          </div>
                          <span className="text-[10px] text-slate-400">{rep.reporterRole}</span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[11px] font-bold',
                              rep.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                : rep.status === 'RESOLVED'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            )}
                          >
                            {rep.status === 'PENDING'
                              ? 'Chờ duyệt'
                              : rep.status === 'RESOLVED'
                                ? 'Đã giải quyết'
                                : 'Đã bác bỏ'}
                          </span>
                        </td>

                        {/* CÁC NÚT DUYỆT 1 CHẠM DESKTOP */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {rep.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  handleResolveReport(rep.id, 'RESOLVED', 'HIDE_CONTENT')
                                }
                                className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold h-8 px-2.5 rounded-xl gap-1 shadow-xs"
                                title="Ẩn nội dung vi phạm và chấp thuận báo cáo"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ẩn &amp; Duyệt</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleResolveReport(rep.id, 'RESOLVED', 'DELETE_CONTENT')
                                }
                                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-[11px] font-bold h-8 px-2 rounded-xl"
                                title="Xóa bỏ hoàn toàn"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(rep.id, 'REJECTED', 'NONE')}
                                className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold h-8 px-2 rounded-xl"
                                title="Bác bỏ báo cáo sai"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              {rep.adminNote || 'Đã xử lý xong'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── MODAL 1: THÊM CHỦ ĐỀ / THÔNG BÁO MỚI (ADMIN) ── */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Plus className="w-5 h-5 text-[#00B8DD]" />
            <span className="font-bold text-base">Thêm Chủ Đề / Thông Báo Mới (Admin)</span>
          </div>
        }
      >
        <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề chủ đề / thông báo: <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="VD: [Thông Báo] Lịch thi thử trực tuyến THPT Quốc gia 2026..."
              className="rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Môn học:
              </label>
              <select
                value={createSubject}
                onChange={(e) => setCreateSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              >
                {[
                  'Toán Học',
                  'Vật Lý',
                  'Hóa Học',
                  'Sinh Học',
                  'Tin Học',
                  'Tiếng Anh',
                  'Ngữ Văn',
                  'Lịch Sử',
                  'Địa Lý',
                  'GDCD',
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Khối lớp:
              </label>
              <select
                value={createGrade}
                onChange={(e) => setCreateGrade(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              >
                <option value={12}>Lớp 12 (Thi THPT)</option>
                <option value={11}>Lớp 11</option>
                <option value={10}>Lớp 10</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nội dung chi tiết:
            </label>
            <textarea
              rows={5}
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              placeholder="Nhập nội dung thông báo, hướng dẫn hoặc đề bài thảo luận..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createIsPinned}
              onChange={(e) => setCreateIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-[#00B8DD] focus:ring-[#00B8DD]"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              📌 Ghim chủ đề này lên đầu diễn đàn ngay khi tạo
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#00B8DD] hover:bg-[#009ec0] text-white font-bold rounded-xl text-xs px-4"
            >
              Đăng Chủ Đề
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── MODAL 2: SỬA BÀI VIẾT (ADMIN EDIT) ── */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Pencil className="w-5 h-5 text-[#00B8DD]" />
            <span className="font-bold text-base">Chỉnh Sửa Bài Viết (Admin)</span>
          </div>
        }
      >
        <form onSubmit={handleSaveEditPost} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề bài viết: <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="rounded-xl text-xs sm:text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Môn học:
              </label>
              <select
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              >
                {[
                  'Toán Học',
                  'Vật Lý',
                  'Hóa Học',
                  'Sinh Học',
                  'Tin Học',
                  'Tiếng Anh',
                  'Ngữ Văn',
                  'Lịch Sử',
                  'Địa Lý',
                  'GDCD',
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Khối lớp:
              </label>
              <select
                value={editGrade}
                onChange={(e) => setEditGrade(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              >
                <option value={12}>Lớp 12</option>
                <option value={11}>Lớp 11</option>
                <option value={10}>Lớp 10</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nội dung câu hỏi / thảo luận:
            </label>
            <textarea
              rows={5}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Nội dung bài viết..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPost(null);
              }}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#00B8DD] hover:bg-[#009ec0] text-white font-bold rounded-xl text-xs px-4"
            >
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── MODAL 3: XÁC NHẬN XÓA BÀI VIẾT (ADMIN DELETE) ── */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPost(null);
        }}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <span className="font-bold text-base">Xác Nhận Xóa Bài Viết</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Bạn có chắc chắn muốn xóa bài viết này khỏi Diễn đàn?
          </p>

          {deletingPost && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                {deletingPost.title}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {deletingPost.subject} • Tác giả: {deletingPost.author.name}
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-400">
            ⚠️ Lưu ý: Khi xóa, toàn bộ bình luận và lượt vote liên quan cũng sẽ không còn hiển thị trên diễn đàn.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingPost(null);
              }}
              className="rounded-xl text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeletePost}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs px-4"
            >
              Xác Nhận Xóa
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
