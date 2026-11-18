'use client';

import * as React from 'react';
import { ListOrdered, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NewsTocItem } from '@/types';

interface ArticleTocProps {
  items: NewsTocItem[];
  variant?: 'desktop' | 'mobile';
}

export function ArticleToc({ items, variant = 'desktop' }: ArticleTocProps) {
  const [activeId, setActiveId] = React.useState<string>(items[0]?.id || '');
  const [isOpenMobile, setIsOpenMobile] = React.useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = React.useState<number>(0);

  React.useEffect(() => {
    if (!items.length) return;
    setActiveId(items[0].id);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))));
      }

      const offset = 140;
      let currentId = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            currentId = item.id;
          }
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  if (!items || items.length === 0) return null;

  const handleJump = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (variant === 'mobile') {
    return (
      <Card className="lg:hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#00B8DD]" />
            Mục lục bài viết ({items.length} phần)
          </span>
          {isOpenMobile ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isOpenMobile && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleJump(item.id)}
                  className={cn(
                    'w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-all cursor-pointer block',
                    item.level === 3 && 'pl-6 text-[11px]',
                    item.level === 4 && 'pl-9 text-[11px]',
                    isActive
                      ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {item.text}
                </button>
              );
            })}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Mục Lục Tự Động
            </h3>
            <p className="text-[11px] text-slate-500">Tiến độ đọc: {scrollProgress}%</p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {items.length} mục
        </span>
      </div>

      {/* Thanh tiến độ đọc bài */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00B8DD] to-[#007D99] transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <nav aria-label="Mục lục bài viết" className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleJump(item.id)}
              className={cn(
                'w-full text-left py-2 px-3 rounded-xl text-xs leading-snug transition-all cursor-pointer border-l-2 block',
                item.level === 3 && 'pl-6 text-[11px]',
                item.level === 4 && 'pl-8 text-[11px]',
                isActive
                  ? 'border-[#00B8DD] bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {item.text}
            </button>
          );
        })}
      </nav>
    </Card>
  );
}

