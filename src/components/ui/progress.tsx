import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  indicatorClassName?: string;
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  indicatorClassName,
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Tiến độ</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out',
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
