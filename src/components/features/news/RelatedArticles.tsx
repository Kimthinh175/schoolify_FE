'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NewsArticle } from '@/types';
import { formatVietnameseDate } from '@/services/news.service';

interface RelatedArticlesProps {
  articles: NewsArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="pt-10 sm:pt-14 border-t border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#007D99] dark:text-[#00B8DD]">
            <Sparkles className="w-3.5 h-3.5" />
            Gợi ý đọc tiếp
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Bài Viết Liên Quan Cùng Chủ Đề
          </h2>
        </div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#007D99] dark:text-[#00B8DD] hover:underline"
        >
          Xem tất cả tin tức <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/news/${article.slug}`} className="block h-full group">
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between h-full hover:shadow-xl hover:border-[#00B8DD]/60 transition-all">
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={article.thumbnail_url}
                    alt={article.image_alt || article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {article.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 backdrop-blur-sm text-white border border-white/20">
                        {article.category.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatVietnameseDate(article.published_at || article.created_at)}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.reading_time_minutes} phút đọc</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[160px]">{article.author_name}</span>
                <span className="font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Đọc ngay <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

