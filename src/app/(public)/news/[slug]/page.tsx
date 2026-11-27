'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  ThumbsUp,
  Bookmark,
  ArrowLeft,
  ChevronRight,
  FileText,
  Download,
  Sparkles,
  UserCheck,
  Tag,
  ExternalLink,
  Flame,
  GraduationCap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NewsArticle } from '@/types';
import {
  newsService,
  extractTableOfContents,
  formatVietnameseDate,
} from '@/services/news.service';
import {
  MOCK_NEWS_ARTICLES,
  MOCK_NEWS_CATEGORIES,
} from '@/services/mock/news-data';
import { ArticleToc } from '@/components/features/news/ArticleToc';
import { ArticleContentRenderer } from '@/components/features/news/ArticleContentRenderer';
import { RelatedArticles } from '@/components/features/news/RelatedArticles';

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';

  const [article, setArticle] = React.useState<NewsArticle | null>(() => {
    const found = MOCK_NEWS_ARTICLES.find((a) => a.slug === slug || a.id === slug);
    if (!found) return null;
    const category = MOCK_NEWS_CATEGORIES.find((c) => c.id === found.category_id);
    return {
      ...found,
      category,
      table_of_contents: extractTableOfContents(found.content),
    };
  });
  const [relatedArticles, setRelatedArticles] = React.useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(!article);
  const [liked, setLiked] = React.useState<boolean>(false);
  const [bookmarked, setBookmarked] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    newsService
      .getArticleBySlug(slug, true)
      .then(async (found) => {
        if (!mounted) return;
        if (found) {
          setArticle(found);
          document.title = `${found.meta_title || found.title} | Schoolify Tin Tức`;
          const related = await newsService.getRelatedArticles(found, 3);
          if (mounted) setRelatedArticles(related);
        } else {
          setArticle(null);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const tocItems = React.useMemo(() => {
    if (!article) return [];
    return article.table_of_contents && article.table_of_contents.length > 0
      ? article.table_of_contents
      : extractTableOfContents(article.content);
  }, [article]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép đường dẫn bài viết vào bộ nhớ tạm!');
  };

  const handleLike = async () => {
    if (!article || liked) return;
    setLiked(true);
    setArticle((prev) =>
      prev ? { ...prev, like_count: (prev.like_count || 0) + 1 } : prev
    );
    await newsService.toggleLikeArticle(article.id);
    toast.success('Cảm ơn bạn đã đánh giá bài viết hữu ích!');
  };

  const handleBookmark = () => {
    setBookmarked((prev) => {
      const next = !prev;
      toast.success(
        next ? 'Đã lưu bài viết vào danh sách đọc!' : 'Đã bỏ lưu bài viết.'
      );
      return next;
    });
  };

  if (isLoading && !article) {
    return (
      <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <Badge variant="primary" className="bg-[#00B8DD] text-white">
          404 - KHÔNG TÌM THẤY BÀI VIẾT
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Bài viết không tồn tại hoặc đã bị gỡ
        </h1>
        <p className="text-sm text-slate-500">
          Đường dẫn bạn truy cập có thể đã thay đổi hoặc bài viết đang được biên tập viên cập nhật.
        </p>
        <Link href="/news">
          <Button className="bg-[#00B8DD] hover:bg-[#007D99] text-white font-bold rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang Tin Tức
          </Button>
        </Link>
      </div>
    );
  }

  // Chuẩn SEO JSON-LD Schema.org (NewsArticle)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    image: [article.og_image_url || article.cover_image_url || article.thumbnail_url],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: [
      {
        '@type': 'Person',
        name: article.author_name,
        jobTitle: article.author_role || 'Ban Biên Tập Schoolify',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Schoolify Education',
    },
    keywords: (article.tags || []).join(', '),
  };

  return (
    <article className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
      {/* Nhúng JSON-LD chuẩn SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── BREADCRUMB NAVIGATION ── */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-[#00B8DD] transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/news" className="hover:text-[#00B8DD] transition-colors font-medium">
          Tin tức giáo dục
        </Link>
        {article.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href="/news"
              className="text-[#007D99] dark:text-[#00B8DD] font-semibold hover:underline"
            >
              {article.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[260px] sm:max-w-md hidden sm:inline">
          {article.title}
        </span>
      </nav>

      {/* ── ARTICLE HERO HEADER ── */}
      <header className="space-y-5 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[#00B8DD] text-white font-bold">
            {article.category?.name || 'Tin Tức Giáo Dục'}
          </Badge>
          {article.is_featured && (
            <Badge
              variant="outline"
              className="border-amber-400/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold"
            >
              ⭐ Tiêu Điểm
            </Badge>
          )}
          {article.is_breaking && (
            <Badge className="bg-rose-600 text-white font-bold inline-flex items-center gap-1">
              <Flame className="w-3 h-3" /> Tin Nóng
            </Badge>
          )}
          {article.grade_levels && article.grade_levels.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Khối {article.grade_levels.join(', ')}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Sapo / Excerpt */}
        <p className="text-sm sm:text-base lg:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-[#00B8DD] pl-4 py-1 bg-slate-50/70 dark:bg-slate-900/50 rounded-r-xl">
          {article.excerpt}
        </p>

        {/* Author & Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B8DD] to-[#007D99] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {article.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{article.author_name}</span>
                <UserCheck className="w-3.5 h-3.5 text-[#00B8DD]" />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatVietnameseDate(article.published_at || article.created_at)}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.reading_time_minutes} phút đọc
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {(article.view_count || 0).toLocaleString('vi-VN')} lượt xem
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={cn(
                'rounded-xl text-xs font-bold gap-1.5 cursor-pointer',
                liked && 'border-[#00B8DD] bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]'
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Hữu ích ({article.like_count || 0})</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              className={cn(
                'rounded-xl text-xs font-bold gap-1.5 cursor-pointer',
                bookmarked && 'border-[#00B8DD] bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]'
              )}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{bookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN 2-COLUMN CONTENT & STICKY TOC SIDEBAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT / MAIN COLUMN (8 cols on Desktop) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Cover Image */}
          <figure className="space-y-2">
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900">
              <img
                src={article.cover_image_url || article.thumbnail_url}
                alt={article.image_alt || article.title}
                className="w-full max-h-[460px] object-cover"
              />
            </div>
            {article.image_caption && (
              <figcaption className="text-center text-xs text-slate-500 italic px-4">
                {article.image_caption}
              </figcaption>
            )}
          </figure>

          {/* Mục lục tự động cho Mobile / Tablet */}
          <ArticleToc items={tocItems} variant="mobile" />

          {/* Nội dung chi tiết bài viết (hỗ trợ Heading Anchor + Toán học LaTeX) */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 shadow-xs">
            <ArticleContentRenderer content={article.content} toc={tocItems} />

            {/* Tài liệu đính kèm (nếu có) */}
            {article.attachments && article.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00B8DD]" />
                  Tài liệu đính kèm trong bài viết
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {article.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        toast.info(`Đang chuẩn bị tải tài liệu: ${att.title}`)
                      }
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 hover:border-[#00B8DD] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-black text-xs flex items-center justify-center shrink-0">
                          {att.file_type}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD]">
                            {att.title}
                          </p>
                          {att.file_size_bytes && (
                            <p className="text-[11px] text-slate-500">
                              {(att.file_size_bytes / 1024).toFixed(0)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Nguồn trích dẫn */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#00B8DD] mr-1" />
                {(article.tags || []).map((tag) => (
                  <Link
                    key={tag}
                    href="/news"
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#00B8DD] hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {article.source_name && (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>Nguồn tham khảo:</span>
                  {article.source_url ? (
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#007D99] dark:text-[#00B8DD] inline-flex items-center gap-1 hover:underline"
                    >
                      {article.source_name} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <strong className="text-slate-700 dark:text-slate-300">
                      {article.source_name}
                    </strong>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Thẻ thông tin Tác giả / Ban chuyên môn (Chuẩn E-E-A-T SEO) */}
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/70 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B8DD] to-[#007D99] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              {article.author_name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {article.author_name}
                </h3>
                {article.author_role && (
                  <span className="text-xs font-semibold text-[#007D99] dark:text-[#00B8DD]">
                    • {article.author_role}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {article.author_bio ||
                  'Chuyên trang thông tin khảo thí, phương pháp ôn luyện và ứng dụng công nghệ AI giáo dục dành cho học sinh và giáo viên THPT trên toàn quốc.'}
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT / STICKY SIDEBAR (4 cols on Desktop) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Mục lục tự động Desktop */}
          <div className="hidden lg:block">
            <ArticleToc items={tocItems} variant="desktop" />
          </div>

          {/* Box CTA Luyện thi thông minh */}
          <Card className="rounded-3xl border-[#00B8DD]/30 bg-gradient-to-br from-[#00B8DD]/10 via-white to-sky-50/70 dark:from-[#00B8DD]/15 dark:via-slate-900 dark:to-slate-900 p-6 space-y-4 shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-[#00B8DD] text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Luyện Thi Thích Ứng AI
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                Áp dụng ngay kiến thức vừa đọc vào Phòng Thi Ảo!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Trải nghiệm đề thi chuẩn cấu trúc Bộ GD&amp;ĐT gồm cả 3 phần: Trắc nghiệm 4 lựa chọn, Đúng/Sai và Trả lời ngắn kèm lời giải chi tiết.
              </p>
            </div>
            <div className="pt-1 flex flex-col gap-2">
              <Link href="/luyen-thi">
                <Button className="w-full bg-[#00B8DD] hover:bg-[#007D99] text-white font-bold rounded-xl text-xs cursor-pointer">
                  Vào Phòng Luyện Thi Ngay
                </Button>
              </Link>
            </div>
          </Card>
        </aside>
      </div>

      {/* ── BÀI VIẾT LIÊN QUAN ── */}
      <RelatedArticles articles={relatedArticles} />
    </article>
  );
}

