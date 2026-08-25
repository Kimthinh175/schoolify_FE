'use client';

import Link from 'next/link';
import { Award, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_EXAMS, MOCK_SUBMISSIONS } from '@/services/mock/data';

export default function StudentExamsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="purple" className="mb-2">Khảo Thí Trực Tuyến</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bài Kiểm Tra & Điểm Số
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Danh sách các bài kiểm tra cần làm và xem lại chi tiết điểm số, lời phê của thầy cô.
        </p>
      </div>

      {/* Upcoming Exams */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Bài Thi Cần Hoàn Thành</h3>
        {MOCK_EXAMS.map((exam) => (
          <Card key={exam.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Badge variant="warning" className="text-[10px]">Hạn chót: 01/09/2026</Badge>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{exam.title}</h4>
              <p className="text-xs text-slate-500">{exam.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <span>{exam.duration_minutes} phút</span>
                <span>•</span>
                <span>{exam.total_questions} câu hỏi</span>
                <span>•</span>
                <span>Điểm tối đa: {exam.max_score}đ</span>
              </div>
            </div>

            <Link href={`/student/exam/${exam.id}`}>
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Bắt Đầu Làm Bài
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {/* Graded Submissions */}
      <div className="space-y-4 pt-4">
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
