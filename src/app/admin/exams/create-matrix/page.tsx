'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';
import { ExamVariant } from '@/types/exam';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { ExamMatrixBuilder } from '@/components/features/admin/exams/ExamMatrixBuilder';
import { toast } from 'sonner';

export default function AdminExamCreateMatrixPage() {
  const router = useRouter();

  const handleSaveExams = (variants: ExamVariant[]) => {
    toast.success(`Đã lưu thành công ${variants.length} mã đề thi vào hệ thống!`);
    setTimeout(() => {
      router.push('/admin/exams');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/exams"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Kho đề thi hệ thống
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-7 h-7 text-primary" />
          Thiết Kế Đề Thi Tự Động Theo Ma Trận (Blueprint)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cấu hình tỉ lệ % độ khó (Bloom), tỉ lệ % chương học cũ vs mới, và tự động sinh 2, 4 hoặc 8 mã đề độc lập.
        </p>
      </div>

      {/* Matrix Builder Component */}
      <ExamMatrixBuilder
        questionPool={INITIAL_MASTER_QUESTIONS}
        onSaveExams={handleSaveExams}
      />
    </div>
  );
}
