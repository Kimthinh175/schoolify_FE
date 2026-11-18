'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Pin,
  Bookmark,
  Sparkles,
  Award,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { MathRenderer } from '@/components/ui/math-renderer';
import { ForumCommentSection } from '@/components/features/forum/ForumCommentSection';
import { cn } from '@/lib/utils';
import { ForumPost, forumService, applyModerationOverrides } from '@/services/forum.service';
import { ALL_FORUM_SEED_POSTS } from '@/data/forum-seed-posts';

export default function ForumDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || '';
  const decodedSlug = decodeURIComponent(rawSlug);

  const seedFallback = React.useMemo(() => {
    const cleanSlug = decodedSlug.trim().toLowerCase();
    const raw = (ALL_FORUM_SEED_POSTS as any[]).find(
      (p: any) =>
        p.slug?.toLowerCase() === cleanSlug ||
        p.id.toLowerCase() === cleanSlug ||
        (p.slug && p.slug.toLowerCase().includes(cleanSlug)) ||
        (p.slug && cleanSlug.includes(p.slug.toLowerCase()))
    );
    return raw ? applyModerationOverrides(raw) : null;
  }, [decodedSlug]);

  const [post, setPost] = React.useState<ForumPost | null>(seedFallback);
  const [isLoading, setIsLoading] = React.useState(!seedFallback);
  const [postLikes, setPostLikes] = React.useState(seedFallback?.likesCount || 0);
  const [hasLikedPost, setHasLikedPost] = React.useState(Boolean(seedFallback?.isLiked));
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      try {
        const data = await forumService.getPostBySlugOrId(decodedSlug);
        if (!isMounted) return;
        if (data) {
          setPost(data);
          setPostLikes(data.likesCount || 0);
          setHasLikedPost(Boolean(data.isLiked));
          setIsBookmarked(Boolean(data.isBookmarked));
        }
      } catch {
        // use seedFallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    if (decodedSlug) {
      void loadDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [decodedSlug]);

  // Lắng nghe cập nhật trạng thái kiểm duyệt (Ghim / Khóa / Ẩn) từ Admin thời gian thực
  React.useEffect(() => {
    const handleModerationUpdated = (e: any) => {
      const { postId, patch } = e?.detail || {};
      if (postId && patch && post) {
        if (post.id === postId || post.slug === postId) {
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  ...(patch.isPinned !== undefined ? { isPinned: patch.isPinned } : {}),
                  ...(patch.isLocked !== undefined ? { isLocked: patch.isLocked } : {}),
                  ...(patch.isHidden !== undefined ? { isHidden: patch.isHidden } : {}),
                }
              : null
          );
        }
      }
    };
    window.addEventListener('schoolify:forum-moderation-updated', handleModerationUpdated);
    return () => {
      window.removeEventListener('schoolify:forum-moderation-updated', handleModerationUpdated);
    };
  }, [post]);

  // Tự động cuộn mượt xuống phần bình luận khi mở trang chi tiết
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const cmtSection = document.getElementById('forum-comments-section');
      if (cmtSection) {
        cmtSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [post]);

  const togglePostLike = async () => {
    if (!post) return;
    const next = !hasLikedPost;
    setHasLikedPost(next);
    setPostLikes((cnt: number) => (next ? cnt + 1 : Math.max(0, cnt - 1)));
    try {
      await forumService.toggleLikePost(post.id);
    } catch {}
  };

  const toggleBookmark = async () => {
    if (!post) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
    await forumService.toggleBookmarkPost(post.id);
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <Card className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 animate-pulse">
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/70 rounded" />
          <div className="h-4 w-4/5 bg-slate-100 dark:bg-slate-800/70 rounded" />
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-16 max-w-3xl mx-auto px-4 text-center space-y-4">
        <Card className="p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy bài thảo luận
          </h2>
          <p className="text-xs text-slate-500">
            Bài thảo luận này không tồn tại hoặc máy chủ API chưa phản hồi dữ liệu.
          </p>
          <div className="pt-2">
            <Link href="/forum">
              <Button className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs">
                Quay lại Diễn Đàn
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/forum"
          className="hover:text-[#007D99] dark:hover:text-[#00B8DD] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Diễn Đàn Hỏi Đáp
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{post.subject}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">
          {post.title}
        </span>
      </nav>

      {/* ── NỘI DUNG CHÍNH (8 COLS) + SIDEBAR (4 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card Đề Bài / Câu Hỏi */}
          <Card className="p-6 sm:p-7 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-sm">
            {/* Header: Author info & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Avatar src={post.author.avatar} alt={post.author.name} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {post.author.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {post.author.grade}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Đăng {post.timeAgo}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30">
                    <Pin className="w-3 h-3 rotate-45" /> Đã ghim
                  </span>
                )}
                {post.isSolved ? (
                  <Badge
                    variant="success"
                    className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-bold px-2.5 py-0.5 text-[11px]"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Đã giải
                  </Badge>
                ) : (
                  <Badge
                    variant="warning"
                    className="font-bold px-2.5 py-0.5 text-[11px]"
                  >
                    Đang chờ giải đáp
                  </Badge>
                )}
              </div>
            </div>

            {/* Tiêu đề câu hỏi (render KaTeX) */}
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
              <MathRenderer text={post.title} inline />
            </h1>

            {/* Nội dung đề bài chi tiết (render KaTeX) */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans space-y-3">
              <MathRenderer text={post.content} />
            </div>

            {/* Hiển thị ảnh chụp đề bài đính kèm (nếu có) */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {post.attachments.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Ảnh chụp đề bài ${idx + 1}`}
                      className="w-full max-h-80 object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags & Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                  {post.subject} • Khối {post.grade}
                </span>
                {post.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={togglePostLike}
                  leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
                  className={cn(
                    'rounded-xl text-xs font-bold transition-all',
                    hasLikedPost &&
                      'bg-[#00B8DD] text-white border-[#00B8DD] hover:bg-[#009bbd]'
                  )}
                >
                  Thích ({postLikes})
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={toggleBookmark}
                  leftIcon={<Bookmark className="w-3.5 h-3.5" />}
                  className={cn(
                    'rounded-xl text-xs font-bold transition-all',
                    isBookmarked &&
                      'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                  )}
                >
                  {isBookmarked ? 'Đã lưu bài' : 'Lưu bài'}
                </Button>
              </div>
            </div>
          </Card>

          {/* ── COMPONENT FORUM COMMENT SECTION ── */}
          <div id="forum-comments-section">
            <ForumCommentSection
              postId={post.id}
              postSlug={post.slug}
              postTitle={post.title}
              postAuthorId={(post as any).author?.id || (post as any).author_id || 'seed-student-01'}
              initialComments={(post as any).initialComments}
              isLocked={Boolean((post as any).isLocked || (post as any).is_locked)}
            />
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Thông tin hỗ trợ */}
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-[#007D99] dark:text-[#00B8DD] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Gợi Ý Viết Lời Giải Hay</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                Trình bày rõ từng bước biến đổi và nêu phương pháp (cô lập $m$, đạo hàm, bảo toàn).
              </li>
              <li>
                Gõ công thức Toán đẹp bằng KaTeX: dùng <code className="text-[#007D99] font-bold">$...$</code> hoặc bấm phím tắt chèn nhanh.
              </li>
              <li>
                Chụp ảnh rõ nét vở giải bài (dung lượng &lt;= 5MB) nếu bạn đã trình bày sẵn ra giấy.
              </li>
            </ul>
          </Card>

          {/* Top Người Giải */}
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Thưởng Điểm Cho Lời Giải Chuẩn</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lời giải được chủ câu hỏi hoặc thầy cô xác nhận là <strong>&quot;Lời giải được công nhận&quot;</strong> sẽ được cộng ngay <strong>+10 Ngọc Tri Thức (💎)</strong> và ghim nổi bật trên đầu!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
