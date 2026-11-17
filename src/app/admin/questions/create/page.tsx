'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/exam';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { QuestionStudioForm } from '@/components/features/admin/questions/QuestionStudioForm';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';
import { questionBankService } from '@/services/question-bank.service';
import { toast } from 'sonner';

export default function AdminQuestionCreatePage() {
  const router = useRouter();
  const [questionPool, setQuestionPool] = React.useState<Question[]>(INITIAL_MASTER_QUESTIONS);

  React.useEffect(() => {
    questionBankService
      .fetchPostgresQuestions({ page: 1, limit: 500 })
      .then((res) => {
        if (res.items.length > 0) {
          setQuestionPool((prev) => [...res.items, ...prev]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (newQuestion: Question) => {
    const created = await questionBankService.createPostgresQuestion(newQuestion);
    if (created) {
      toast.success('Đã lưu câu hỏi mới vào Ngân hàng câu hỏi PostgreSQL!');
    } else {
      toast.success('Đã thêm câu hỏi mới vào Master Question Bank!');
    }
    setTimeout(() => {
      router.push('/admin/questions');
    }, 800);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Ngân hàng câu hỏi
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-primary" />
          Soạn Thảo Câu Hỏi Chuẩn Hóa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hỗ trợ đầy đủ 9 định dạng câu hỏi hiện đại, phân loại Khối lớp (1 - 12), lưu trực tiếp vào PostgreSQL.
        </p>
      </div>

      {/* Form Studio */}
      <QuestionStudioForm
        questionPool={questionPool}
        onSave={handleSave}
        onCancel={() => router.push('/admin/questions')}
      />
    </div>
  );
}
