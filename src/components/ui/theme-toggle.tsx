'use client';

import * as React from 'react';
import { Sun, Moon, SunMoon } from 'lucide-react';
import { useTheme, Theme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  align?: 'left' | 'right';
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Thứ tự chuyển đổi: Sáng -> Tối -> Auto -> Sáng
  const handleCycleTheme = () => {
    let nextTheme: Theme = 'light';
    if (theme === 'light') {
      nextTheme = 'dark';
    } else if (theme === 'dark') {
      nextTheme = 'system';
    } else {
      nextTheme = 'light';
    }

    setTheme(nextTheme);
  };

  // Render static placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          'p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/80 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900',
          className
        )}
      >
        <Sun className="w-4 h-4 opacity-50" />
      </div>
    );
  }

  const tooltipTitle =
    theme === 'light'
      ? 'Chế độ Sáng (Bấm để chuyển sang Tối)'
      : theme === 'dark'
      ? 'Chế độ Tối (Bấm để chuyển sang Auto)'
      : 'Chế độ Auto (Bấm để chuyển sang Sáng)';

  return (
    <button
      type="button"
      onClick={handleCycleTheme}
      className={cn(
        'relative inline-flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs select-none',
        'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700',
        'dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-750 dark:text-slate-200',
        'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]',
        className
      )}
      title={tooltipTitle}
      aria-label={tooltipTitle}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -70, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative flex items-center justify-center shrink-0"
      >
        {theme === 'light' && (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        )}
        {theme === 'dark' && (
          <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
        )}
        {theme === 'system' && (
          <SunMoon className="w-4 h-4 text-[#00B8DD]" />
        )}
      </motion.span>

      {showLabel && (
        <span className="text-xs font-semibold hidden sm:inline-block">
          {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Auto'}
        </span>
      )}
    </button>
  );
}
