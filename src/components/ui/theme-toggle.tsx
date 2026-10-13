'use client';

import * as React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  align?: 'left' | 'right';
  showLabel?: boolean;
}

export function ThemeToggle({ className, align = 'right', showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const themeOptions: { id: Theme; label: string; subLabel: string; icon: React.ElementType }[] = [
    {
      id: 'light',
      label: 'Giao diện Sáng',
      subLabel: 'Màu nền trắng sáng tiêu chuẩn',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Giao diện Tối',
      subLabel: 'Dịu mắt khi học đêm & tập trung',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'Tự động (Hệ thống)',
      subLabel: 'Tự đổi theo cài đặt của trình duyệt',
      icon: Laptop,
    },
  ];

  // Render static placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          'p-2 rounded-xl border border-slate-200/80 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900',
          className
        )}
      >
        <Sun className="w-4 h-4 opacity-50" />
      </div>
    );
  }

  const ActiveIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs',
          'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700',
          'dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-750 dark:text-slate-200',
          isOpen && 'ring-2 ring-[#00B8DD]/40 border-[#00B8DD]'
        )}
        title={`Chuyển chế độ giao diện (Hiện tại: ${
          theme === 'dark' ? 'Tối' : theme === 'light' ? 'Sáng' : 'Tự động theo trình duyệt'
        })`}
        aria-label="Chuyển chế độ giao diện"
      >
        <span className="relative flex items-center justify-center">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          )}
          {theme === 'system' && (
            <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-[#00B8DD] ring-1 ring-white dark:ring-slate-900" />
          )}
        </span>

        {showLabel && (
          <span className="text-xs font-semibold hidden sm:inline-block">
            {theme === 'dark' ? 'Tối' : theme === 'light' ? 'Sáng' : 'Tự động'}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 w-64 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-md',
              'bg-white/95 border-slate-200 dark:bg-slate-900/95 dark:border-slate-800',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Chế độ giao diện (Theme)
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {theme === 'system'
                  ? `Đang tự động theo trình duyệt (${resolvedTheme === 'dark' ? 'Đang bật nền Tối' : 'Đang bật nền Sáng'})`
                  : `Đang chọn thủ công: ${theme === 'dark' ? 'Giao diện Tối' : 'Giao diện Sáng'}`}
              </p>
            </div>

            <div className="space-y-1">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                          isSelected
                            ? 'bg-white dark:bg-slate-800 border-[#00B8DD]/40 text-[#00B8DD]'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs block leading-tight truncate">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight truncate mt-0.5">
                          {opt.subLabel}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#00B8DD] shrink-0 ml-2 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
