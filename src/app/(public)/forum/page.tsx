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
  Filter,
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { MathRenderer } from '@/components/ui/math-renderer';
import { cn } from '@/lib/utils';
import { ALL_FORUM_SEED_POSTS } from '@/data/forum-seed-posts';
import { ForumCommentSection } from '@/components/features/forum/ForumCommentSection';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export interface ForumPost {
  id: string;
  slug?: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    grade: string;
  };
  subject: string;
  grade: number;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
  isSolved?: boolean;
  isPinned?: boolean;
  timeAgo: string;
  tags: string[];
}

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

export default function ForumPage() {
  const [selectedSubject, setSelectedSubject] = React.useState('Tất cả');
  const [activeTab, setActiveTab] = React.useState<'ALL' | 'HOT' | 'UNSOLVED' | 'SOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newSubject, setNewSubject] = React.useState('Toán Học');
  const [newContent, setNewContent] = React.useState('');
  const [posts, setPosts] = React.useState<ForumPost[]>(ALL_FORUM_SEED_POSTS);
  const [expandedPostId, setExpandedPostId] = React.useState<string | null>(null);
  const [likedPosts, setLikedPosts] = React.useState<Record<string, boolean>>({});

  const toggleComments = (postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const togglePostCardLike = (postId: string, e: React.MouseEvent) => {
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
  };

  // Cố gắng đồng bộ thêm từ Backend API nếu server có endpoint GET /api/v1/forum/posts
  React.useEffect(() => {
    let isMounted = true;
    async function fetchPosts() {
      try {
        const res = await fetch('http://localhost:3005/api/v1/forum/posts');
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          if (!isMounted) return;
          const mapped: ForumPost[] = json.data.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            content: item.content,
            author: {
              name: item.author?.fullname || 'Thành viên Schoolify',
              avatar:
                item.author?.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
              role: item.author?.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh',
              grade: item.author?.role === 'TEACHER' ? 'Tổ Chuyên Môn' : 'Lớp 12',
            },
            subject: item.subject?.name || item.subject || 'Chung',
            grade: item.grade_level || item.grade || 12,
            repliesCount: item.comments_count || item.repliesCount || 0,
            likesCount: item.likes_count || item.likesCount || 0,
            viewsCount: item.views_count || item.viewsCount || 0,
            isSolved: Boolean(item.is_solved),
            isPinned: Boolean(item.is_pinned),
            timeAgo: item.is_pinned ? 'Đã ghim' : 'Gần đây',
            tags: Array.isArray(item.tags) ? item.tags : [],
          }));
          setPosts(mapped);
        }
      } catch {
        // Fallback tự động giữ nguyên ALL_FORUM_SEED_POSTS
      }
    }
    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: {
        name: 'Bạn (Học Sinh)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        role: 'Học sinh',
        grade: 'Lớp 12',
      },
      subject: newSubject,
      grade: 12,
      repliesCount: 0,
      likesCount: 1,
      viewsCount: 5,
      isSolved: false,
      timeAgo: 'Vừa xong',
      tags: [newSubject, 'Hỏi bài'],
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setIsNewPostModalOpen(false);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSubject =
      selectedSubject === 'Tất cả' || post.subject === selectedSubject;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'HOT') return matchesSubject && matchesSearch && post.likesCount > 20;
    if (activeTab === 'UNSOLVED') return matchesSubject && matchesSearch && !post.isSolved;
    if (activeTab === 'SOLVED') return matchesSubject && matchesSearch && post.isSolved;
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="primary" className="bg-[#00B8DD] text-white font-bold mb-1">
            CỘNG ĐỒNG HỌC TẬP K-12
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Diễn Đàn Hỏi Đáp &amp; Chia Sẻ Bài Tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Nơi hàng ngàn học sinh và thầy cô cùng trao đổi kiến thức, giải đáp bài tập khó và chia sẻ kinh nghiệm ôn thi 24/7.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setIsNewPostModalOpen(true)}
          className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl shadow-lg shadow-[#00B8DD]/20 shrink-0 self-start md:self-auto"
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Đặt Câu Hỏi Mới
        </Button>
      </div>

      {/* ── UNIFIED FILTER TOOLBAR (NGAY NGẮN, ĐẸP MẮT) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Hàng 1: Danh sách các môn học (Pills nằm phẳng phiu trên 1 hàng, hỗ trợ cuộn ngang) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#00B8DD]" /> Môn học:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {SUBJECT_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                  selectedSubject === s
                    ? 'bg-[#00B8DD] text-white shadow-sm shadow-[#00B8DD]/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80" />

        {/* Hàng 2: Trạng thái bài đăng (Trái) & Ô tìm kiếm (Phải) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer',
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setActiveTab('HOT')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                activeTab === 'HOT'
                  ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Sôi Nổi
            </button>
            <button
              onClick={() => setActiveTab('UNSOLVED')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer',
                activeTab === 'UNSOLVED'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Chờ Giải Đáp
            </button>
            <button
              onClick={() => setActiveTab('SOLVED')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer',
                activeTab === 'SOLVED'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã Có Lời Giải
            </button>
          </div>

          {/* Ô tìm kiếm dạng bài */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, công thức, môn học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── FORUM POSTS & SIDEBAR GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Chưa có câu hỏi nào trong danh mục này
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Hãy là người đầu tiên đặt câu hỏi để nhận sự trợ giúp từ thầy cô và bạn bè!
              </p>
            </Card>
          ) : (
            filteredPosts.map((post, idx) => {
              const isExpanded = expandedPostId === post.id;
              const hasLiked = Boolean(likedPosts[post.id]);

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
                            <div className="flex items-center gap-2">
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

                        <div className="flex items-center gap-1.5">
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
                              Đang chờ giải đáp
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Body with KaTeX (Click to expand comments right below) */}
                      <div
                        onClick={() => toggleComments(post.id)}
                        className="space-y-1.5 cursor-pointer group"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors leading-snug">
                          <MathRenderer text={post.title} inline />
                        </h3>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          <MathRenderer text={post.content} />
                        </div>
                      </div>

                      {/* Tags & Engagement metrics */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                            {post.subject} • Lớp {post.grade}
                          </span>
                          {(post as any).isLocked && (
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

                        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
                          {/* Nút Like trên Card (không chuyển trang) */}
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

                          {/* BẤM COI LỜI GIẢI / BÌNH LUẬN: HIỆN NGAY BÊN DƯỚI KHÔNG CHUYỂN TRANG */}
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
                            <span>{post.repliesCount} bình luận</span>
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

                      {/* ── KHU VỰC BÌNH LUẬN & LỜI GIẢI HIỆN XUỐNG DƯỚI (KHÔNG CHUYỂN TRANG) ── */}
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

                            {/* Component ForumCommentSection (Stack #11, #12 & #16) */}
                            <ForumCommentSection
                              postId={post.id}
                              postSlug={post.slug}
                              postTitle={post.title}
                              initialComments={(post as any).initialComments}
                              isLocked={Boolean((post as any).isLocked || (post as any).is_locked)}
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
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80 last:border-none">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block">{m.name}</strong>
                    <span className="text-[10px] text-slate-400">{m.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">{m.solves}</span>
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
              <li>Đặt tiêu đề rõ ràng, nêu rõ dạng bài hoặc công thức trọng tâm.</li>
              <li>Tôn trọng người giải, tích lũy lời cảm ơn và đánh dấu bài đã giải đúng.</li>
              <li>Nghiêm cấm chia sẻ tài liệu vi phạm bản quyền hoặc spam quảng cáo.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ── MODAL: ĐẶT CÂU HỎI MỚI ── */}
      <Dialog
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        maxWidth="lg"
        title="Tạo Câu Hỏi Thảo Luận Mới"
        description="Đặt câu hỏi rõ ràng, chi tiết để nhận được câu trả lời chính xác từ cộng đồng."
      >
        <form onSubmit={handleCreatePost} className="space-y-4 py-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tiêu Đề Câu Hỏi:
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Tìm m để hàm số y = x^3 - 3mx^2 + 1 có 2 điểm cực trị thỏa mãn..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Môn Học:
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              >
                {SUBJECT_FILTERS.filter((s) => s !== 'Tất cả').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Khối Lớp:
              </label>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]">
                <option value="12">Lớp 12 (Thi THPT)</option>
                <option value="11">Lớp 11</option>
                <option value="10">Lớp 10</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Chi Tiết Bài Tập / Thắc Mắc:
            </label>
            <textarea
              required
              rows={5}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Mô tả cụ thể bước em đang bị vướng hoặc chèn công thức Toán LaTeX..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewPostModalOpen(false)}
              className="rounded-xl border-slate-300 dark:border-slate-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl"
            >
              Đăng Câu Hỏi
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
