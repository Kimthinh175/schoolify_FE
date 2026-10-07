'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/exam';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { QuestionStudioForm } from '@/components/features/admin/questions/QuestionStudioForm';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';
import { toast } from 'sonner';

export default function AdminQuestionCreatePage() {
  const router = useRouter();

  const handleSave = (newQuestion: Question) => {
    toast.success('Đã thêm câu hỏi mới vào Master Question Bank!');
    setTimeout(() => {
      router.push('/admin/questions');
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Ngân hàng câu hỏi
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-primary" />
          Soạn Thảo Câu Hỏi Chuẩn Hóa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hỗ trợ đầy đủ 9 định dạng câu hỏi hiện đại, phân loại Khối lớp (1 - 12), chọn chương có sẵn hoặc tạo chương mới linh hoạt.
        </p>
      </div>

      {/* Form Studio */}
      <QuestionStudioForm
        questionPool={INITIAL_MASTER_QUESTIONS}
        onSave={handleSave}
        onCancel={() => router.push('/admin/questions')}
      />
    </div>
  );
}
