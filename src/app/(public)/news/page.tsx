'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Eye,
  Pin,
  Flame,
  Tag,
  X,
  Newspaper,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NewsArticle, NewsCategory } from '@/types';
import {
  newsService,
  formatVietnameseDate,
  removeVietnameseTones,
} from '@/services/news.service';
import {
  MOCK_NEWS_ARTICLES,
  MOCK_NEWS_CATEGORIES,
} from '@/services/mock/news-data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' as const },
});

export default function NewsPage() {
  const [categories, setCategories] = React.useState<NewsCategory[]>(MOCK_NEWS_CATEGORIES);
  const [articles, setArticles] = React.useState<NewsArticle[]>(() => {
    const catMap = new Map(MOCK_NEWS_CATEGORIES.map((c) => [c.id, c]));
    return MOCK_NEWS_ARTICLES.map((a) => ({
      ...a,
      category: catMap.get(a.category_id),
    }));
  });
  const [activeCategoryId, setActiveCategoryId] = React.useState<string>('ALL');
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      newsService.getCategories(true),
      newsService.getArticles({ onlyPublic: true }),
    ]).then(([cats, arts]) => {
      if (!mounted) return;
      if (cats.length > 0) setCategories(cats);
      if (arts.length > 0) setArticles(arts);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Tổng hợp danh sách các tag nổi bật từ các bài viết đã xuất bản
  const popularTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach((art) => {
      (art.tags || []).forEach((t) => {
        counts.set(t, (counts.get(t) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [articles]);

  const filteredNews = React.useMemo(() => {
    const normalizedQuery = removeVietnameseTones(searchQuery);
    return articles.filter((article) => {
      const matchesCat =
        activeCategoryId === 'ALL' || article.category_id === activeCategoryId;
      const matchesTag =
        !selectedTag || (article.tags || []).includes(selectedTag);
      const matchesSearch =
        !normalizedQuery ||
        removeVietnameseTones(
          `${article.title} ${article.excerpt} ${(article.tags || []).join(' ')} ${article.author_name}`
        ).includes(normalizedQuery);
      return matchesCat && matchesTag && matchesSearch;
    });
  }, [articles, activeCategoryId, selectedTag, searchQuery]);

  const featuredArticle = React.useMemo(
    () => articles.find((a) => a.is_featured) || articles[0],
    [articles]
  );

  const activeCategoryObj = React.useMemo(
    () => categories.find((c) => c.id === activeCategoryId),
    [categories, activeCategoryId]
  );

  const isDefaultView =
    activeCategoryId === 'ALL' && !selectedTag && !searchQuery.trim();

  return (
    <div className="py-10 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
      {/* ── HEADER ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.div {...fadeUp(0)}>
          <Badge variant="primary" className="bg-[#00B8DD] text-white font-bold mb-3">
            TIN TỨC &amp; HOẠT ĐỘNG GIÁO DỤC
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeCategoryObj
              ? activeCategoryObj.name
              : 'Cập Nhật Tri Thức, Đồng Hành Cùng Mùa Thi'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {activeCategoryObj?.description ||
              'Tin tức mới nhất về kỳ thi tốt nghiệp THPT, thông tư Bộ GD&ĐT, phương pháp học tập thông minh và các sự kiện sôi động tại Schoolify.'}
          </p>
        </motion.div>
      </div>

      {/* ── SEARCH & CATEGORY FILTER TABS ── */}
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategoryId('ALL')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5',
                activeCategoryId === 'ALL'
                  ? 'bg-[#00B8DD] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Tất cả</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  activeCategoryId === 'ALL'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                )}
              >
                {articles.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              const count = articles.filter((a) => a.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5',
                    isSelected
                      ? 'bg-[#00B8DD] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px]',
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tiêu đề, từ khóa, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
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

        {/* Popular Tags Bar */}
        {popularTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-1">
              <Tag className="w-3 h-3 text-[#00B8DD]" />
              Từ khóa phổ biến:
            </span>
            {popularTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border',
                    active
                      ? 'bg-[#007D99] text-white border-[#007D99]'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FEATURED HERO ARTICLE ── */}
      {isDefaultView && featuredArticle && (
        <motion.div {...fadeUp(0.08)}>
          <Link href={`/news/${featuredArticle.slug}`} className="block group">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#00B8DD]/60 transition-all grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[300px] overflow-hidden">
                <img
                  src={featuredArticle.cover_image_url || featuredArticle.thumbnail_url}
                  alt={featuredArticle.image_alt || featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00B8DD] text-white shadow-md">
                    Tiêu Điểm Nổi Bật ⭐
                  </span>
                  {featuredArticle.is_breaking && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md inline-flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Tin Nóng Mùa Thi
                    </span>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                    <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">
                      {featuredArticle.category?.name || 'Tin Giáo Dục'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatVietnameseDate(
                        featuredArticle.published_at || featuredArticle.created_at
                      )}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {(featuredArticle.view_count || 0).toLocaleString('vi-VN')} lượt xem
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  {featuredArticle.tags && featuredArticle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featuredArticle.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {featuredArticle.author_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.reading_time_minutes} phút đọc
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] group-hover:translate-x-1 transition-transform">
                    Đọc bài viết <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* ── ARTICLES GRID OR EMPTY STATE ── */}
      {filteredNews.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center mx-auto">
            <Newspaper className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Không tìm thấy bài viết phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc chọn chuyên mục khác để khám phá thêm các bài viết giáo dục.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveCategoryId('ALL');
              setSelectedTag(null);
              setSearchQuery('');
            }}
            className="rounded-xl font-bold"
          >
            Xoá bộ lọc tìm kiếm
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredNews.map((article, idx) => (
            <motion.div key={article.id} {...fadeUp(idx * 0.05)}>
              <Link href={`/news/${article.slug}`} className="block h-full group">
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between h-full hover:shadow-xl hover:border-[#00B8DD]/60 transition-all">
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={article.thumbnail_url}
                        alt={article.image_alt || article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 backdrop-blur-sm text-white border border-white/20">
                          {article.category?.name || 'Tin Giáo Dục'}
                        </span>
                        {article.is_pinned && (
                          <span
                            title="Bài viết được ghim"
                            className="p-1 rounded-md bg-[#00B8DD] text-white shadow-xs"
                          >
                            <Pin className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
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
                          {(article.view_count || 0).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {article.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] font-medium text-slate-500 dark:text-slate-400"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[170px] font-medium">
                      {article.author_name}
                    </span>
                    <span className="font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
