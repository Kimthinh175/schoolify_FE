'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  className?: string;
  'aria-label'?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  id,
  className,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const isSmall = size === 'sm';
  const travel = isSmall ? 16 : 20;

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isSmall ? 'h-5 w-9' : 'h-6 w-11',
        checked ? 'bg-[#00B8DD]' : 'bg-slate-300 dark:bg-slate-700',
        className
      )}
    >
      <motion.span
        initial={false}
        animate={{ x: checked ? travel : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'inline-block rounded-full bg-white shadow-sm',
          isSmall ? 'h-4 w-4' : 'h-5 w-5'
        )}
      />
    </button>
  );
}
