'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Pin,
  Bookmark,
  Share2,
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
import { ALL_FORUM_SEED_POSTS } from '@/data/forum-seed-posts';

export default function ForumDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || '';
  const decodedSlug = decodeURIComponent(rawSlug);

  // Tìm topic trong 20 câu hỏi seed chuẩn từ Backend
  const post = React.useMemo(() => {
    const found = ALL_FORUM_SEED_POSTS.find(
      (p) => p.slug === decodedSlug || p.id === decodedSlug
    );
    if (found) {
      return found;
    }
    // Fallback cho bất kỳ slug hoặc id nào
    return {
      id: decodedSlug || 'forum-seed-post-01',
      slug: decodedSlug,
      title: decodedSlug
        ? `Thảo Luận Chủ Đề: ${decodedSlug.replace(/-/g, ' ')}`
        : 'Toán 12: Tìm tham số m để hàm số bậc ba đồng biến trên khoảng (0; +∞)',
      content:
        'Cho hàm số $y = x^3 - 3mx^2 + 3(2m - 1)x + 1$. Hãy tìm tất cả các giá trị của tham số thực $m$ để hàm số đồng biến trên khoảng $(0; +\\infty)$. Áp dụng điều kiện $y\' \\ge 0, \\forall x \\in (0; +\\infty)$.',
      subject: 'Toán Học',
      grade: 12,
      tags: ['Toán 12', 'Khảo sát hàm số', 'KaTeX', 'GDPT 2018'],
      author: {
        name: 'Nguyễn Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        role: 'Học sinh',
        grade: 'Lớp 12A1 KHTN',
      },
      viewsCount: 156,
      likesCount: 28,
      isSolved: true,
      isPinned: false,
      timeAgo: '30 phút trước',
      initialComments: [],
    };
  }, [decodedSlug]);

  const [postLikes, setPostLikes] = React.useState(post.likesCount || 35);
  const [hasLikedPost, setHasLikedPost] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    setPostLikes(post.likesCount || 35);
  }, [post.likesCount]);

  const togglePostLike = () => {
    const next = !hasLikedPost;
    setHasLikedPost(next);
    setPostLikes((cnt) => (next ? cnt + 1 : Math.max(0, cnt - 1)));
  };

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
                  onClick={() => setIsBookmarked(!isBookmarked)}
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

          {/* ── STACK #11, #12 & #16: COMPONENT FORUM COMMENT SECTION ── */}
          <ForumCommentSection
            postId={post.id}
            postSlug={post.slug}
            postTitle={post.title}
            initialComments={(post as any).initialComments}
            isLocked={Boolean((post as any).isLocked || (post as any).is_locked)}
          />
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
                Chụp ảnh rõ nét vở giải bài nếu bạn đã trình bày sẵn ra giấy.
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
