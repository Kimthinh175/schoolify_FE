'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PracticeHistoryList } from '@/components/features/student/PracticeHistoryList';

export default function StudentExamsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge className="bg-cyan-50 text-[#007D99] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-[10px] font-bold">
            Khảo Thí & Luyện Đề
          </Badge>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Lịch Sử Luyện Thi & Điểm Số</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Xem lại các đề đã luyện và chi tiết từng bài làm.
          </p>
        </div>
        <Link href="/luyen-thi" className="shrink-0">
          <Button
            className="min-h-[44px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold shadow-md shadow-[#00B8DD]/25 text-xs px-4 rounded-xl cursor-pointer"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Luyện Đề Mới Ngay
          </Button>
        </Link>
      </header>

      {/* Danh sách lịch sử luyện thi */}
      <PracticeHistoryList showHeader={false} />
    </div>
  );
}
