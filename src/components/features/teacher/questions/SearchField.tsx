'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

/** Ô tìm kiếm có icon + nút xoá nhanh (dùng chung cho Ngân hàng đề & Danh sách câu hỏi) */
export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      leftIcon={<Search className="w-4 h-4" />}
      rightIcon={
        value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-md p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Xoá từ khoá tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        ) : undefined
      }
    />
  );
}
