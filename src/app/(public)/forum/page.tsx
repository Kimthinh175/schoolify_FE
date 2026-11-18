'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Flame,
  Award,
  BookOpen,
  Pin,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Flag,
  Bookmark,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Image as ImageIcon,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { MathRenderer } from '@/components/ui/math-renderer';
import { cn } from '@/lib/utils';
import { ForumCommentSection } from '@/components/features/forum/ForumCommentSection';
import { ReportModal } from '@/components/features/forum/ReportModal';
import { ForumAskQuestionModal } from '@/components/features/forum/ForumAskQuestionModal';
import {
  ForumPost,
  ForumTabStatus,
  forumService,
} from '@/services/forum.service';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.35, delay, ease: 'easeOut' as const },
});

const SUBJECT_FILTERS = [
  'Tất cả',
  'Toán Học',
  'Vật Lý',
  'Hóa Học',
  'Tin Học',
  'Tiếng Anh',
  'Sinh Học',
  'Ngữ Văn',
];

const GRADE_FILTERS: Array<{ value: 'ALL' | 10 | 11 | 12; label: string; short: string }> = [
  { value: 'ALL', label: 'Tất cả khối', short: 'Tất cả' },
  { value: 12, label: 'Khối 12', short: 'Khối 12' },
  { value: 11, label: 'Khối 11', short: 'Khối 11' },
  { value: 10, label: 'Khối 10', short: 'Khối 10' },
];

const POSTS_PER_PAGE = 6;
const SAVED_POSTS_STORAGE_KEY = 'schoolify-forum-saved-post-ids';

export type { ForumPost };

function readInitialSavedPosts(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SAVED_POSTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, boolean>;
    }
  } catch {
    // ignore storage read error
  }
  return {};
}

export default function ForumPage() {
  // ── BỘ LỌC & PHÂN TRANG (Task #13) ──
  const [selectedSubject, setSelectedSubject] = React.useState('Tất cả');
  const [selectedGrade, setSelectedGrade] = React.useState<'ALL' | 10 | 11 | 12>('ALL');
  const [activeTab, setActiveTab] = React.useState<ForumTabStatus>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  // ── DỮ LIỆU TỪ FORUM.SERVICE.TS (Task #14) ──
  const [posts, setPosts] = React.useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = React.useState(false);

  // ── TƯƠNG TÁC TRÊN THẺ BÀI VIẾT ──
  const [expandedPostId, setExpandedPostId] = React.useState<string | null>(null);
  const [highlightedPostId, setHighlightedPostId] = React.useState<string | null>(null);
  const [likedPosts, setLikedPosts] = React.useState<Record<string, boolean>>({});
  const [savedPostIds, setSavedPostIds] = React.useState<Record<string, boolean>>(
    readInitialSavedPosts
  );

  // Tải danh sách câu hỏi qua forumService.getPosts (tuân thủ chuẩn React 19 không gọi setState đồng bộ đầu effect)
  React.useEffect(() => {
    let isMounted = true;

    async function fetchForumList() {
      const res = await forumService.getPosts({
        page: 1,
        limit: 100,
      });
      if (!isMounted) return;
      setPosts(res.items);
      setSavedPostIds((prev) => {
        const next = { ...prev };
        for (const item of res.items) {
          if (item.isBookmarked) {
            next[item.id] = true;
          }
        }
        return next;
      });
      setIsLoading(false);
    }

    void fetchForumList();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset về trang 1 khi người dùng đổi bộ lọc
  const handleSelectSubject = (subj: string) => {
    setSelectedSubject(subj);
    setCurrentPage(1);
  };

  const handleSelectGrade = (gradeVal: 'ALL' | 10 | 11 | 12) => {
    setSelectedGrade(gradeVal);
    setCurrentPage(1);
  };

  const handleSelectTab = (tab: ForumTabStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedSubject('Tất cả');
    setSelectedGrade('ALL');
    setActiveTab('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Tự động mở rộng & cuộn mượt tới bài viết khi truy cập từ Chuông thông báo
  const focusAndExpandPost = React.useCallback(
    (targetSlugOrId: string) => {
      const cleanTarget = targetSlugOrId.trim().toLowerCase();
      const matched = posts.find(
        (p) =>
          p.id.toLowerCase() === cleanTarget ||
          (p.slug && p.slug.toLowerCase() === cleanTarget) ||
          (p.slug && p.slug.toLowerCase().includes(cleanTarget)) ||
          (p.slug && cleanTarget.includes(p.slug.toLowerCase()))
      );

      if (matched) {
        setExpandedPostId(matched.id);
        setHighlightedPostId(matched.id);

        setTimeout(() => {
          const hash = window.location.hash;
          if (hash && hash.length > 1) {
            const rawTarget = hash.replace(/^#/, '');
            const targetCommentId = rawTarget.replace(/^comment-/, '');
            const candidates = [
              rawTarget,
              `comment-${rawTarget}`,
              targetCommentId,
              `comment-${targetCommentId}`,
            ];
            for (const cid of candidates) {
              const commentEl = document.getElementById(cid);
              if (commentEl) {
                commentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
              }
            }
          }
          const el = document.getElementById(`forum-post-${matched.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 350);

        setTimeout(() => {
          setHighlightedPostId(null);
        }, 5000);
      }
    },
    [posts]
  );

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const postParam = searchParams.get('post');
      if (postParam) {
        focusAndExpandPost(postParam);
      }
    }

    const handleOpenPostEvent = (e: any) => {
      const slug = e?.detail?.postSlug;
      if (slug) {
        focusAndExpandPost(slug);
      }
    };

    const handleCommentAdded = (e: any) => {
      const pId = e?.detail?.postId;
      const pSlug = e?.detail?.postSlug;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === pId || (pSlug && p.slug === pSlug)) {
            return {
              ...p,
              repliesCount: (p.repliesCount || 0) + 1,
            };
          }
          return p;
        })
      );
    };

    window.addEventListener('schoolify:open-forum-post', handleOpenPostEvent);
    window.addEventListener('schoolify:forum-comment-added', handleCommentAdded);
    return () => {
      window.removeEventListener('schoolify:open-forum-post', handleOpenPostEvent);
      window.removeEventListener('schoolify:forum-comment-added', handleCommentAdded);
    };
  }, [focusAndExpandPost]);

  // Modal Báo cáo & Yêu cầu đăng nhập
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [reportTarget, setReportTarget] = React.useState<{
    type: 'POST' | 'COMMENT';
    id: string;
    title?: string;
  }>({ type: 'POST', id: '' });
  const [reportSuccessMessage, setReportSuccessMessage] = React.useState<string | null>(null);

  const handleOpenReport = (type: 'POST' | 'COMMENT', id: string, title?: string) => {
    setReportTarget({ type, id, title });
    setIsReportModalOpen(true);
  };

  const toggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const togglePostCardLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = Boolean(likedPosts[postId]);
    const nextState = !isCurrentlyLiked;

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: nextState,
    }));

    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              likesCount: nextState
                ? p.likesCount + 1
                : Math.max(0, p.likesCount - 1),
            }
          : p
      )
    );

    await forumService.toggleLikePost(postId);
  };

  const toggleSavePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !savedPostIds[postId];
    setSavedPostIds((prev) => {
      const updated = { ...prev, [postId]: nextSaved };
      if (!nextSaved) {
        delete updated[postId];
      }
      try {
        window.localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    await forumService.toggleBookmarkPost(postId);
  };

  const handlePostCreated = (createdPost: ForumPost) => {
    setPosts((prev) => [createdPost, ...prev]);
    setCurrentPage(1);
  };

  // Đếm nhanh số lượng câu hỏi theo từng trạng thái (sau khi đã áp dụng lọc Môn + Khối + Từ khóa)
  const baseMatchedPosts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSubject =
        selectedSubject === 'Tất cả' || post.subject === selectedSubject;
      const matchesGrade =
        selectedGrade === 'ALL' || Number(post.grade) === Number(selectedGrade);
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      return matchesSubject && matchesGrade && matchesSearch;
    });
  }, [posts, selectedSubject, selectedGrade, searchQuery]);

  const tabCounts = React.useMemo(() => {
    return {
      ALL: baseMatchedPosts.length,
      UNSOLVED: baseMatchedPosts.filter((p) => !p.isSolved).length,
      SOLVED: baseMatchedPosts.filter((p) => Boolean(p.isSolved)).length,
      SAVED: baseMatchedPosts.filter((p) => Boolean(savedPostIds[p.id] || p.isBookmarked)).length,
      HOT: baseMatchedPosts.filter((p) => p.likesCount >= 15 || p.repliesCount >= 3).length,
    };
  }, [baseMatchedPosts, savedPostIds]);

  // Lọc theo Tab trạng thái đang chọn
  const filteredPosts = React.useMemo(() => {
    return baseMatchedPosts.filter((post) => {
      if (activeTab === 'UNSOLVED') return !post.isSolved;
      if (activeTab === 'SOLVED') return Boolean(post.isSolved);
      if (activeTab === 'SAVED') return Boolean(savedPostIds[post.id] || post.isBookmarked);
      if (activeTab === 'HOT') return post.likesCount >= 15 || post.repliesCount >= 3;
      return true;
    });
  }, [baseMatchedPosts, activeTab, savedPostIds]);

  // Tính toán phân trang (Task #13)
  const totalFilteredCount = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = React.useMemo(() => {
    const startIdx = (safePage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);
  }, [filteredPosts, safePage]);

  const hasActiveFilter =
    selectedSubject !== 'Tất cả' ||
    selectedGrade !== 'ALL' ||
    activeTab !== 'ALL' ||
    searchQuery.trim() !== '';

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-7">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="primary" className="bg-[#00B8DD] text-white font-bold mb-1">
            CỘNG ĐỒNG HỌC TẬP K-12
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Diễn Đàn Hỏi Đáp &amp; Chia Sẻ Bài Tập
          </h1>
        </div>

        {/* Action Button mở Modal Đăng câu hỏi mới (Task #12 & #11) */}
        <Button
          onClick={() => setIsNewPostModalOpen(true)}
          className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl shadow-lg shadow-[#00B8DD]/20 shrink-0 self-start md:self-auto"
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Đặt Câu Hỏi Mới
        </Button>
      </div>

      {/* ── TASK #13: COMMAND FILTER BAR CHUYÊN NGHIỆP, ĐỒNG NHẤT NỀN & MÀU SẮC ── */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Tầng 1: Khối Lớp 10-11-12 (Trái) + Thanh Tìm Kiếm Rộng (Phải) — Nền trắng đồng nhất */}
        <div className="px-4 py-3.5 sm:px-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Cụm chọn Khối Lớp 10 - 11 - 12 đồng bộ kiểu dáng với Môn học */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Khối lớp:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {GRADE_FILTERS.map((g) => {
                const isActive = selectedGrade === g.value;
                return (
                  <button
                    key={String(g.value)}
                    type="button"
                    onClick={() => handleSelectGrade(g.value)}
                    className={cn(
                      'inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap',
                      isActive
                        ? 'bg-[#00B8DD]/12 border-[#00B8DD] text-[#007D99] dark:text-[#00B8DD] shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ô tìm kiếm mở rộng tối đa phần không gian còn lại (flex-1) */}
          <div className="relative flex-1 min-w-[260px] lg:max-w-xl xl:max-w-2xl">
            <Search className="w-4 h-4 text-[#00B8DD] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm nhanh theo tiêu đề bài toán, công thức LaTeX ($...$), chuyên đề..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                title="Xóa từ khóa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tầng 2: Danh mục Môn Học (Pills tự động bẻ dòng flex-wrap trên màn hình nhỏ) */}
        <div className="px-4 py-3.5 sm:px-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <BookOpen className="w-3.5 h-3.5 text-[#00B8DD]" />
            <span>Môn học:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {SUBJECT_FILTERS.map((s) => {
              const isSelected = selectedSubject === s;
              const subjectCount =
                s === 'Tất cả'
                  ? posts.length
                  : posts.filter((p) => p.subject === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelectSubject(s)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-[#00B8DD]/12 border-[#00B8DD] text-[#007D99] dark:text-[#00B8DD] shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <span>{s}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                      isSelected
                        ? 'bg-[#00B8DD] text-white'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {subjectCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tầng 3: Navigation Tabs Trạng thái (Tất cả / Sôi nổi / Chưa giải / Đã giải / Đã lưu) + Bộ đếm kết quả */}
        <div className="px-4 sm:px-5 pt-2.5 pb-0 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Underline Tabs theo đúng thứ tự: Tất cả -> Sôi nổi -> Chưa giải -> Đã giải -> Đã lưu */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 -mb-px">
            <button
              type="button"
              onClick={() => handleSelectTab('ALL')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'ALL'
                  ? 'border-[#00B8DD] text-[#007D99] dark:text-[#00B8DD]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tất cả</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  activeTab === 'ALL'
                    ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {tabCounts.ALL}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('HOT')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'HOT'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Sôi nổi</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  activeTab === 'HOT'
                    ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {tabCounts.HOT}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('UNSOLVED')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'UNSOLVED'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Chưa giải</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  activeTab === 'UNSOLVED'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {tabCounts.UNSOLVED}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('SOLVED')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'SOLVED'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đã giải</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  activeTab === 'SOLVED'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {tabCounts.SOLVED}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('SAVED')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                activeTab === 'SAVED'
                  ? 'border-[#00B8DD] text-[#007D99] dark:text-[#00B8DD]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Đã lưu</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  activeTab === 'SAVED'
                    ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {tabCounts.SAVED}
              </span>
            </button>
          </div>

          {/* Bộ đếm hiển thị & nút đặt lại lọc */}
          <div className="flex items-center gap-3 pb-2 text-xs text-slate-500">
            <span>
              Hiển thị{' '}
              <strong className="text-slate-900 dark:text-white">
                {paginatedPosts.length}
              </strong>{' '}
              /{' '}
              <strong className="text-slate-900 dark:text-white">
                {totalFilteredCount}
              </strong>{' '}
              câu hỏi
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] hover:bg-[#00B8DD]/15 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── FORUM POSTS & SIDEBAR GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((skeletonIdx) => (
                <Card
                  key={skeletonIdx}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800/70 rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded" />
                  <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800/80 rounded" />
                </Card>
              ))}
            </div>
          ) : paginatedPosts.length === 0 ? (
            <Card className="p-10 text-center rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {activeTab === 'SAVED'
                    ? 'Bạn chưa lưu câu hỏi nào'
                    : 'Chưa có câu hỏi nào khớp với bộ lọc hiện tại'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {activeTab === 'SAVED'
                    ? 'Hãy bấm vào nút "Lưu" trên các bài toán hay để xem lại nhanh khi ôn thi nhé!'
                    : 'Hãy thử đặt lại bộ lọc hoặc là người đầu tiên đặt câu hỏi mới để nhận sự trợ giúp từ thầy cô và bạn bè!'}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="rounded-xl text-xs font-bold"
                >
                  Xem Tất Cả Câu Hỏi
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsNewPostModalOpen(true)}
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs"
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  Đặt Câu Hỏi Ngay
                </Button>
              </div>
            </Card>
          ) : (
            paginatedPosts.map((post, idx) => {
              const isExpanded = expandedPostId === post.id;
              const hasLiked = Boolean(likedPosts[post.id] ?? post.isLiked);
              const isSaved = Boolean(savedPostIds[post.id] ?? post.isBookmarked);

              return (
                <motion.div key={post.id} {...fadeUp(idx * 0.03)}>
                  <Card
                    id={`forum-post-${post.id}`}
                    data-slug={post.slug}
                    className={cn(
                      'p-5 sm:p-6 rounded-2xl border transition-all bg-white dark:bg-slate-900',
                      post.isPinned
                        ? 'border-[#00B8DD]/50 bg-gradient-to-r from-[#E6F8FC]/30 to-white dark:from-slate-850 dark:to-slate-900'
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/40',
                      isExpanded && 'ring-2 ring-[#00B8DD]/30 shadow-md',
                      highlightedPostId === post.id &&
                        'ring-4 ring-[#00B8DD] border-[#00B8DD] shadow-xl animate-pulse'
                    )}
                  >
                    <div className="space-y-3">
                      {/* Header info */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={post.author.avatar} alt={post.author.name} size="sm" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {post.author.name}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                {post.author.grade}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.timeAgo}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {post.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30">
                              <Pin className="w-3 h-3 rotate-45" /> Đã ghim
                            </span>
                          )}
                          {post.isSolved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Đã giải
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              Chưa giải
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Body with KaTeX Preview ngay ngoài thẻ danh sách (Task #13) */}
                      <div
                        onClick={() => toggleComments(post.id)}
                        className="space-y-2 cursor-pointer group"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors leading-snug">
                          <MathRenderer text={post.title} inline />
                        </h3>
                        <div className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed rounded-xl bg-slate-50/70 dark:bg-slate-800/40 px-3.5 py-2.5 border border-slate-100 dark:border-slate-800/80">
                          <MathRenderer text={post.content} />
                        </div>

                        {/* Hiển thị thumbnail ảnh đính kèm nếu câu hỏi có ảnh chụp đề bài */}
                        {post.attachments && post.attachments.length > 0 && (
                          <div className="flex items-center gap-2 pt-1">
                            {post.attachments.slice(0, 3).map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="relative h-16 w-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imgUrl}
                                  alt={`Đề bài đính kèm ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            <span className="text-[11px] font-semibold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {post.attachments.length} ảnh đính kèm
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags & Engagement metrics */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                            {post.subject} • Khối {post.grade}
                          </span>
                          {post.isLocked && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60">
                              <Lock className="w-3 h-3" /> Đã khóa
                            </span>
                          )}
                          {post.tags.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {/* Nút Like trên Card */}
                          <button
                            type="button"
                            onClick={(e) => togglePostCardLike(post.id, e)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                              hasLiked
                                ? 'bg-[#00B8DD] text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#00B8DD]/15 hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                            )}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{post.likesCount}</span>
                          </button>

                          {/* Nút Lưu câu hỏi (phục vụ Tab Đã lưu ở Task #13) */}
                          <button
                            type="button"
                            onClick={(e) => toggleSavePost(post.id, e)}
                            title={isSaved ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi này'}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                              isSaved
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400'
                            )}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
                          </button>

                          {/* BẤM COI LỜI GIẢI / BÌNH LUẬN */}
                          <button
                            type="button"
                            onClick={() => toggleComments(post.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                              isExpanded
                                ? 'bg-[#00B8DD] text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#00B8DD]/15 hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                            )}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{post.repliesCount} thảo luận</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Lượt xem */}
                          <span className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px]">
                            <Eye className="w-3.5 h-3.5" />
                            {post.viewsCount}
                          </span>

                          {/* Nút Báo cáo bài viết */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReport('POST', post.id, post.title);
                            }}
                            title="Báo cáo vi phạm bài viết này"
                            className="flex items-center gap-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2 py-1 rounded-xl transition-all cursor-pointer text-[11px]"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Báo cáo</span>
                          </button>
                        </div>
                      </div>

                      {/* ── KHU VỰC BÌNH LUẬN & LỜI GIẢI HIỆN XUỐNG DƯỚI ── */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 overflow-hidden"
                          >
                            <div className="flex items-center justify-between pb-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-[#00B8DD]" />
                                Khung lời giải &amp; thảo luận chi tiết
                              </span>
                              <div className="flex items-center gap-3">
                                <Link
                                  href={`/forum/${post.slug || post.id}`}
                                  className="text-xs text-slate-400 hover:text-[#00B8DD] flex items-center gap-1 font-semibold transition-colors"
                                >
                                  <span>Mở trang riêng</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => toggleComments(post.id)}
                                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Thu gọn</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Component ForumCommentSection */}
                            <ForumCommentSection
                              postId={post.id}
                              postSlug={post.slug}
                              postTitle={post.title}
                              postAuthorId={(post as any).author?.id || (post as any).author_id}
                              initialComments={post.initialComments}
                              isLocked={Boolean(post.isLocked)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}

          {/* ── TASK #13: THANH PHÂN TRANG (PAGINATION BAR) TRÊN /FORUM ── */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs">
              <span className="text-xs text-slate-500">
                Trang <strong className="text-slate-900 dark:text-white">{safePage}</strong> /{' '}
                <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalFilteredCount} câu hỏi)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  className="rounded-xl text-xs font-bold"
                >
                  Trước
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      pageNum === safePage
                        ? 'bg-[#00B8DD] text-white shadow-sm shadow-[#00B8DD]/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  className="rounded-xl text-xs font-bold"
                >
                  Tiếp
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Helpers Box */}
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Thành Viên Tích Cực Tuần Này</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Thầy Hoàng Nam', role: 'Giáo viên Toán Chuyên', solves: '45 bài giải', diamonds: '+450 💎' },
                { name: 'Nguyễn Minh Anh', role: 'Lớp 12A1 KHTN', solves: '32 bài giải', diamonds: '+320 💎' },
                { name: 'Trần Gia Bảo', role: 'Lớp 12 Lý', solves: '24 bài giải', diamonds: '+240 💎' },
              ].map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80 last:border-none"
                >
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block">{m.name}</strong>
                    <span className="text-[10px] text-slate-400">{m.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      {m.solves}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold">{m.diamonds}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Guidelines Box */}
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#E6F8FC]/50 to-white dark:from-slate-850 dark:to-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-[#007D99] dark:text-[#00B8DD] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Quy Tắc Diễn Đàn Văn Minh</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Đặt tiêu đề rõ ràng, chọn đúng Môn học và Khối lớp (10, 11, 12).</li>
              <li>Sử dụng thanh công cụ LaTeX để chèn nhanh Phân số, Căn bậc hai, Tích phân, Giới hạn.</li>
              <li>Đính kèm ảnh chụp đề bài rõ nét (dung lượng &lt;= 5MB).</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ── MODAL ĐẶT CÂU HỎI MỚI (TASK #12 & TASK #11) ── */}
      <ForumAskQuestionModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        onPostCreated={handlePostCreated}
        defaultSubject={selectedSubject !== 'Tất cả' ? selectedSubject : 'Toán Học'}
        defaultGrade={selectedGrade !== 'ALL' ? selectedGrade : 12}
      />

      {/* Modal Báo cáo vi phạm bài viết */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
        targetTitle={reportTarget.title}
        onSuccess={(msg) => {
          setReportSuccessMessage(msg);
          setTimeout(() => setReportSuccessMessage(null), 4000);
        }}
      />
    </div>
  );
}
