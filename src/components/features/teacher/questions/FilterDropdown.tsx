'use client';

import * as React from 'react';
import { ChevronDown, Filter, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** Nút lọc gọn: chỉ hiển thị mục đang chọn, bấm ra dropdown các lựa chọn */
export function FilterDropdown({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <DropdownMenu
      align="right"
      className="min-w-[200px]"
      trigger={
        <div
          className={cn(
            'flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800',
            className
          )}
        >
          <Filter className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
          <span className="truncate max-w-[140px]">{current?.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      }
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <DropdownMenuItem
            key={o.value}
            onClick={() => onChange(o.value)}
            icon={selected ? <Check className="w-4 h-4 text-[#00B8DD]" /> : <span className="w-4" />}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={cn('text-xs', selected && 'font-semibold text-[#007D99] dark:text-[#00B8DD]')}>
                {o.label}
              </span>
              {typeof o.count === 'number' && (
                <span className="text-[10px] text-slate-400">{o.count}</span>
              )}
            </div>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenu>
  );
}
