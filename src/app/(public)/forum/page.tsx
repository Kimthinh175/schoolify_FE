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
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  Calculator,
  Cpu,
  Atom,
  FlaskConical,
  Dna,
  Languages,
  Image as ImageIcon,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { MathRenderer } from '@/components/ui/math-renderer';
import { cn } from '@/lib/utils';
import { ForumCommentSection } from '@/components/features/forum/ForumCommentSection';
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

const SUBJECT_FILTERS: Array<{
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}> = [
  { value: 'Tất cả', label: 'Tất cả các môn học', icon: BookOpen, colorClass: 'text-[#00B8DD]' },
  { value: 'Toán Học', label: 'Toán Học', icon: Calculator, colorClass: 'text-sky-600 dark:text-sky-400' },
  { value: 'Tin Học', label: 'Tin Học', icon: Cpu, colorClass: 'text-cyan-600 dark:text-cyan-400' },
  { value: 'Vật Lý', label: 'Vật Lý', icon: Atom, colorClass: 'text-indigo-500 dark:text-indigo-400' },
  { value: 'Hóa Học', label: 'Hóa Học', icon: FlaskConical, colorClass: 'text-emerald-500 dark:text-emerald-400' },
  { value: 'Sinh Học', label: 'Sinh Học', icon: Dna, colorClass: 'text-teal-500 dark:text-teal-400' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh', icon: Languages, colorClass: 'text-amber-500 dark:text-amber-400' },
  { value: 'Ngữ Văn', label: 'Ngữ Văn', icon: BookOpen, colorClass: 'text-rose-500 dark:text-rose-400' },
];

type ForumGradeFilter = 'ALL' | 12 | 11 | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1;

const GRADE_FILTERS: Array<{ value: ForumGradeFilter; label: string; short: string }> = [
  { value: 'ALL', label: 'Tất cả khối', short: 'Tất cả khối' },
  { value: 12, label: 'Lớp 12', short: 'Khối 12' },
  { value: 11, label: 'Lớp 11', short: 'Khối 11' },
  { value: 10, label: 'Lớp 10', short: 'Khối 10' },
  { value: 9, label: 'Lớp 9', short: 'Khối 9' },
  { value: 8, label: 'Lớp 8', short: 'Khối 8' },
  { value: 7, label: 'Lớp 7', short: 'Khối 7' },
  { value: 6, label: 'Lớp 6', short: 'Khối 6' },
  { value: 5, label: 'Lớp 5', short: 'Khối 5' },
  { value: 4, label: 'Lớp 4', short: 'Khối 4' },
  { value: 3, label: 'Lớp 3', short: 'Khối 3' },
  { value: 2, label: 'Lớp 2', short: 'Khối 2' },
  { value: 1, label: 'Lớp 1', short: 'Khối 1' },
];

function stripVietnameseDiacritics(input: string): string {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function normalizeForumSubject(raw?: string | null): string {
  const norm = stripVietnameseDiacritics(raw || '').replace(/[\s-]+/g, '_');
  if (!norm || norm === 'all' || norm === 'tat_ca') return 'Tất cả';
  if (norm.includes('toan') || norm.includes('math')) return 'Toán Học';
  if (norm.includes('tin') || norm.includes('info') || norm === 'cs') return 'Tin Học';
  if (norm.includes('ly') || norm.includes('phys')) return 'Vật Lý';
  if (norm.includes('hoa') || norm.includes('chem')) return 'Hóa Học';
  if (norm.includes('sinh') || norm.includes('bio')) return 'Sinh Học';
  if (norm.includes('anh') || norm.includes('eng')) return 'Tiếng Anh';
  if (norm.includes('van') || norm.includes('lit')) return 'Ngữ Văn';
  return String(raw || '').trim();
}

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
  const [selectedGrade, setSelectedGrade] = React.useState<ForumGradeFilter>('ALL');
  const [activeTab, setActiveTab] = React.useState<ForumTabStatus>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  // ── DỮ LIỆU TỪ FORUM.SERVICE.TS (Task #14) ──
  const [posts, setPosts] = React.useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = React.useState(false);

  // ── TƯƠNG TÁC TRÊN THẺ BÀI VIẾT ──
  const [expandedPostId, setExpandedPostId] = React.useState<string | null>(null);
  const [likedPosts, setLikedPosts] = React.useState<Record<string, boolean>>({});
  const [savedPostIds, setSavedPostIds] = React.useState<Record<string, boolean>>(
    readInitialSavedPosts
  );

  React.useEffect(() => {
    let isMounted = true;
    async function fetchInitialPosts() {
      try {
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
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void fetchInitialPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshForum = async () => {
    handleResetFilters();
    setIsRefreshing(true);
    try {
      const res = await forumService.getPosts({
        page: 1,
        limit: 100,
      });
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
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset về trang 1 khi người dùng đổi bộ lọc
  const handleSelectSubject = (subj: string) => {
    setSelectedSubject(subj);
    setCurrentPage(1);
  };

  const handleSelectGrade = (gradeVal: ForumGradeFilter) => {
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

  // Đếm nhanh số lượng câu hỏi theo từng trạng thái (sau khi đã áp dụng lọc Môn + Khối + Từ khóa không dấu)
  const baseMatchedPosts = React.useMemo(() => {
    const qRaw = searchQuery.trim().toLowerCase();
    const qFold = stripVietnameseDiacritics(searchQuery);
    return posts.filter((post) => {
      const matchesSubject =
        selectedSubject === 'Tất cả' || normalizeForumSubject(post.subject) === selectedSubject;
      const matchesGrade =
        selectedGrade === 'ALL' || Number(post.grade) === Number(selectedGrade);
      if (!qRaw) return matchesSubject && matchesGrade;
      const haystackRaw = `${post.title} ${post.content} ${post.subject} ${post.tags.join(' ')}`.toLowerCase();
      const haystackFold = stripVietnameseDiacritics(haystackRaw);
      const matchesSearch = haystackRaw.includes(qRaw) || haystackFold.includes(qFold);
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

      {/* ── BỘ LỌC DIỄN ĐÀN ĐỒNG BỘ MẪU CỔNG LUYỆN THI K-12 & BẢNG XẾP HẠNG ── */}
      {(() => {
        const currentSubjectMeta =
          SUBJECT_FILTERS.find((s) => s.value === selectedSubject) || SUBJECT_FILTERS[0];
        const currentGradeMeta =
          GRADE_FILTERS.find((g) => g.value === selectedGrade) || GRADE_FILTERS[0];
        const CurrentSubjectIcon = currentSubjectMeta.icon;

        const statusTabs: Array<{
          id: ForumTabStatus;
          label: string;
          count: number;
          icon: React.ComponentType<{ className?: string }>;
        }> = [
          { id: 'ALL', label: 'Tất cả', count: tabCounts.ALL, icon: SlidersHorizontal },
          { id: 'HOT', label: 'Sôi nổi', count: tabCounts.HOT, icon: Flame },
          { id: 'UNSOLVED', label: 'Chưa giải', count: tabCounts.UNSOLVED, icon: Clock },
          { id: 'SOLVED', label: 'Đã giải', count: tabCounts.SOLVED, icon: CheckCircle2 },
          { id: 'SAVED', label: 'Đã lưu', count: tabCounts.SAVED, icon: Bookmark },
        ];

        return (
          <section className="relative z-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs space-y-3">
            {/* Hàng trên: Tabs trạng thái câu hỏi gọn gàng theo màu chủ đạo #00B8DD */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full no-scrollbar">
                {statusTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectTab(tab.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer',
                        isActive
                          ? 'bg-[#00B8DD] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Hỏi đáp chuyên đề &amp; bài tập K-12
              </span>
            </div>

            {/* Hàng bộ lọc chính: Ô tìm kiếm (kính lúp xanh #00B8DD) + Dropdown Môn + Dropdown Khối */}
            <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3 space-y-2.5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
                {/* 1. Ô tìm kiếm với icon kính lúp màu xanh thương hiệu #00B8DD + hiệu ứng focus/hover */}
                <div className="flex-1 relative min-w-[220px] group">
                  <Input
                    placeholder="Tìm nhanh theo tiêu đề bài toán, công thức LaTeX ($...$), chuyên đề..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    leftIcon={
                      <Search className="w-4 h-4 text-[#00B8DD] transition-transform duration-200 group-focus-within:scale-110" />
                    }
                    className="w-full text-xs h-10 pr-8 bg-white dark:bg-slate-900 rounded-xl border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/60 focus:border-[#00B8DD] focus:ring-2 focus:ring-[#00B8DD]/20 transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 transition-colors cursor-pointer"
                      title="Xóa từ khóa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. Cụm 2 Dropdown: Môn + Khối */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Dropdown Môn học (đầy đủ màu icon + hiệu ứng mượt) */}
                  <DropdownMenu
                    align="left"
                    className="min-w-[235px] max-h-80 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[70]"
                    trigger={
                      <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/70 hover:bg-[#00B8DD]/[0.03] hover:shadow-xs active:scale-[0.98] text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <CurrentSubjectIcon
                            className={cn('w-4 h-4 shrink-0', currentSubjectMeta.colorClass)}
                          />
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            Môn:
                          </span>
                          <span className="truncate">{currentSubjectMeta.label}</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    }
                  >
                    {SUBJECT_FILTERS.map((subj) => {
                      const Icon = subj.icon;
                      const isSelected = subj.value === selectedSubject;
                      const subjectCount =
                        subj.value === 'Tất cả'
                          ? posts.length
                          : posts.filter((p) => normalizeForumSubject(p.subject) === subj.value).length;
                      return (
                        <DropdownMenuItem
                          key={subj.value}
                          onClick={() => handleSelectSubject(subj.value)}
                          className={cn(
                            'group py-2 px-2.5 rounded-xl text-xs transition-all',
                            isSelected
                              ? 'bg-[#00B8DD]/12 text-[#007D99] dark:text-[#00B8DD] font-bold'
                              : 'hover:bg-[#00B8DD]/[0.07] hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                          )}
                          icon={
                            <Icon
                              className={cn(
                                'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                                subj.colorClass
                              )}
                            />
                          }
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span>{subj.label}</span>
                            <span
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums transition-colors',
                                isSelected
                                  ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-[#00B8DD]/10 group-hover:text-[#007D99]'
                              )}
                            >
                              {subjectCount}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenu>

                  {/* Dropdown Khối lớp (Tất cả khối + Lớp 12 → Lớp 1) */}
                  <DropdownMenu
                    align="right"
                    className="min-w-[175px] max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[70]"
                    trigger={
                      <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/70 hover:bg-[#00B8DD]/[0.03] hover:shadow-xs active:scale-[0.98] text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            Khối:
                          </span>
                          <span className="truncate">{currentGradeMeta.label}</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    }
                  >
                    {GRADE_FILTERS.map((g) => {
                      const isSelected = g.value === selectedGrade;
                      return (
                        <DropdownMenuItem
                          key={String(g.value)}
                          onClick={() => handleSelectGrade(g.value)}
                          className={cn(
                            'py-2 px-2.5 rounded-xl text-xs transition-all',
                            isSelected
                              ? 'bg-[#00B8DD]/12 text-[#007D99] dark:text-[#00B8DD] font-bold'
                              : 'hover:bg-[#00B8DD]/[0.07] hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                          )}
                          icon={
                            isSelected ? (
                              <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
                            ) : (
                              <span className="w-3.5 h-3.5 block" />
                            )
                          }
                        >
                          {g.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenu>
                </div>
              </div>

              {/* Thanh tóm tắt & nút Làm mới */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
                <span>
                  Đang hiển thị:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {currentSubjectMeta.label}
                  </strong>{' '}
                  •{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {currentGradeMeta.short}
                  </strong>
                  {searchQuery.trim() ? (
                    <>
                      {' '}
                      • Từ khóa{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        &ldquo;{searchQuery.trim()}&rdquo;
                      </strong>
                    </>
                  ) : null}
                </span>

                <div className="flex items-center gap-3">
                  <span>
                    Hiển thị{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {paginatedPosts.length}
                    </strong>{' '}
                    / {totalFilteredCount} câu hỏi
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshForum}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#007D99] dark:text-[#00B8DD] hover:underline cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

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
                    className={cn(
                      'p-5 sm:p-6 rounded-2xl border transition-all bg-white dark:bg-slate-900',
                      post.isPinned
                        ? 'border-[#00B8DD]/50 bg-gradient-to-r from-[#E6F8FC]/30 to-white dark:from-slate-850 dark:to-slate-900'
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/40',
                      isExpanded && 'ring-2 ring-[#00B8DD]/30 shadow-md'
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

                            <ForumCommentSection
                              postId={post.id}
                              postSlug={post.slug}
                              postTitle={post.title}
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
    </div>
  );
}
