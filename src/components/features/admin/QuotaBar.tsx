'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface QuotaBarProps {
    /** Tên hạng mục: "Học sinh", "Giáo viên", "Lưu trữ" */
    label: string;
    /** Số lượng đã dùng */
    used: number;
    /** Hạn mức tối đa của gói */
    max: number;
    /** Đơn vị hiển thị (VD: 'GB') */
    suffix?: string;
    /** Icon trước label */
    icon?: React.ReactNode;
    /** kích thước: sm = cột bảng, md = dialog chi tiết */
    size?: 'sm' | 'md';
    className?: string;
}

function getQuotaColor(pct: number): string {
    if (pct >= 90) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
}

export function QuotaBar({
    label,
    used,
    max,
    suffix,
    icon,
    size = 'md',
    className,
}: QuotaBarProps) {
    if (!max) {
        return null;
    }

    const rawPct = (used / max) * 100;
    const displayPct = Math.min(rawPct, 100);
    const isOverQuota = rawPct > 100;
    const indicatorColor = getQuotaColor(displayPct);

    const compact = size === 'sm';

    return (
        <div className={cn('w-full space-y-1', compact && 'space-y-0.5', className)}>
            <div className="flex items-center justify-between gap-2">
                <span className={cn('flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400', compact && 'text-[10px]')}>
                    {icon}
                    {label}
                </span>
                <span className={cn('text-[11px] font-semibold tabular-nums text-slate-600 dark:text-slate-300', compact && 'text-[10px]')}>
                    {used.toLocaleString('vi-VN')}
                    {suffix ? ` ${suffix}` : ''} / {max.toLocaleString('vi-VN')}
                    {suffix ? ` ${suffix}` : ''}
                    {isOverQuota ? (
                        <span className="ml-1 font-bold text-rose-600 dark:text-rose-400">Vượt mức</span>
                    ) : (
                        <span className="ml-1 text-slate-400 dark:text-slate-500">• {Math.round(displayPct)}%</span>
                    )}
                </span>
            </div>
            <div
                className={cn(
                    'w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
                    compact ? 'h-1.5' : 'h-2.5'
                )}
            >
                <div
                    className={cn('h-full rounded-full transition-all duration-300 ease-out', indicatorColor)}
                    style={{ width: `${displayPct}%` }}
                />
            </div>
        </div>
    );
}