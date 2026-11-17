import * as React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonRoot({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn('w-full', className)}
    >
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SkeletonSurface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 shadow-xs',
        className,
      )}
    >
      {children}
    </div>
  );
}
