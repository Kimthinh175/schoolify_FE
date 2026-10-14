'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PracticeHistoryList } from '@/components/features/student/PracticeHistoryList';
import { MOCK_EXAMS, MOCK_SUBMISSIONS } from '@/services/mock/data';

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
            className="min-h-[44px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 rounded-xl cursor-pointer"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Luyện Đề Mới Ngay
          </Button>
        </Link>
      </header>

      {/* Danh Sách Bài Thi Cần Làm */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Bài Thi Cần Hoàn Thành</h3>
        {MOCK_EXAMS.map((exam) => (
          <Card key={exam.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-[10px]">Hạn chót: 01/09/2026</Badge>
                <Badge variant="primary" className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-bold">Thưởng +30 💎</Badge>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Bài Thi Cuối Bài: Đánh Giá Năng Lực</h4>
              <p className="text-xs text-slate-500">Hoàn thành bài thi để nhận kim cương và mở khóa bài học tiếp theo.</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 30 phút</span>
                <span>•</span>
                <span>15 câu hỏi</span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400">Điểm đạt: 7.0+</span>
              </div>
            </div>

            <Link href={`/student/exam/${exam.id}`}>
              <Button variant="primary" className="bg-cyan-500 hover:bg-cyan-600 shadow-md shadow-cyan-500/20 border-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Bắt Đầu Làm Bài Thi Tính Giờ
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {/* Danh sách lịch sử luyện thi */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Lịch Sử Luyện Đề Thi</h3>
        <PracticeHistoryList showHeader={false} />
      </div>

      {/* Bài Thi Đã Chấm Điểm */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Kết Quả Bài Đã Chấm</h3>
        {MOCK_SUBMISSIONS.map((sub) => (
          <Card key={sub.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px]">Đã có điểm</Badge>
                <span className="text-xs text-slate-400">Nộp ngày {new Date(sub.submitted_at || '').toLocaleDateString('vi-VN')}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{sub.exam_title}</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium italic">
                Lời phê: "{sub.teacher_notes}"
              </p>
            </div>

            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {sub.score} / 10
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Đạt chuẩn xuất sắc</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
