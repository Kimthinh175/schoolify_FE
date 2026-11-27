'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DifficultyLevel, ExamVariant, Question, QuestionType } from '@/types/exam';
import { ArrowLeft, Database, Loader2, Wand2 } from 'lucide-react';
import { ExamMatrixBuilder } from '@/components/features/admin/exams/ExamMatrixBuilder';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function mapDbQuestionToUiQuestion(row: any, idx: number): Question {
  const qFormat = String(row.question_format || 'SINGLE_CHOICE').toUpperCase();
  let type: QuestionType = 'SINGLE_CHOICE';
  if (qFormat === 'TRUE_FALSE') type = 'TRUE_FALSE';
  else if (qFormat === 'SHORT_ANSWER') type = 'FILL_BLANK';
  else if (qFormat === 'MULTI_CHOICE') type = 'MULTIPLE_CHOICE';

  const bloomMap: Record<string, DifficultyLevel> = {
    NHAN_BIET: 'RECOGNITION',
    THONG_HIEU: 'UNDERSTANDING',
    VAN_DUNG: 'APPLICATION',
    VAN_DUNG_CAO: 'ADVANCED_APPLICATION',
  };

  const rawAnswers = Array.isArray(row.answers) ? row.answers : [];
  const answers = rawAnswers.map((a: any, aIdx: number) => ({
    id: String(a.id || `ans-${idx}-${aIdx}`),
    question_id: String(row.id),
    content: String(a.content || ''),
    is_answer: Boolean(a.is_answer),
    label: String(a.sub_label || String.fromCharCode(65 + aIdx)),
  }));

  return {
    id: String(row.id),
    type,
    title: row.title || `Câu ${idx + 1}`,
    content: String(row.question || ''),
    points: Number(row.default_points || 0.25),
    difficulty: bloomMap[String(row.bloom_level || 'THONG_HIEU')] || 'UNDERSTANDING',
    subject: row.subject || 'toan-hoc',
    grade_level: String(row.grade || 12),
    chapter: `Chương ${row.chapter_id || 1}`,
    answers,
    explain: row.explanation || undefined,
    shortAnswerCorrect: type === 'FILL_BLANK' ? row.answer || undefined : undefined,
    statements:
      type === 'TRUE_FALSE'
        ? answers.map((a: any, aIdx: number) => ({
            subId: (a.label || ['a', 'b', 'c', 'd'][aIdx] || 'a').toLowerCase(),
            statement: a.content,
            isCorrect: a.is_answer,
          }))
        : undefined,
  };
}

export default function AdminExamCreateMatrixPage() {
  const router = useRouter();
  const [questionPool, setQuestionPool] = React.useState<Question[]>([]);
  const [totalInDb, setTotalInDb] = React.useState<number>(0);
  const [isLoadingPool, setIsLoadingPool] = React.useState<boolean>(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setIsLoadingPool(true);
      try {
        const res = await fetch('/api/v1/exams/questions?page=1&limit=1000', {
          cache: 'no-store',
        });
        const json = await res.json().catch(() => null);
        const items = json?.data?.items;
        if (active && Array.isArray(items)) {
          setQuestionPool(items.map(mapDbQuestionToUiQuestion));
          setTotalInDb(Number(json?.data?.total ?? items.length));
        }
      } catch {
        if (active) {
          toast.error('Không thể tải ngân hàng câu hỏi từ PostgreSQL.');
        }
      } finally {
        if (active) setIsLoadingPool(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveExams = (variants: ExamVariant[]) => {
    toast.success(`Đã lưu thành công ${variants.length} mã đề thi vào hệ thống!`);
    setTimeout(() => {
      router.push('/admin/exams');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Quản lý Ma trận đề thi
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wand2 className="w-7 h-7 text-primary" />
            Thiết Kế Đề Thi Tự Động Theo Ma Trận (Blueprint)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cấu hình tỉ lệ % độ khó (Bloom), tỉ lệ % chương học cũ vs mới, và tự động sinh 2, 4 hoặc 8 mã đề độc lập từ PostgreSQL.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs px-3 py-1.5 gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        >
          {isLoadingPool ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Đang nạp kho PostgreSQL...
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5" />
              PostgreSQL: {totalInDb} câu hỏi
            </>
          )}
        </Badge>
      </div>

      {/* Matrix Builder Component */}
      <ExamMatrixBuilder
        questionPool={questionPool}
        onSaveExams={handleSaveExams}
      />
    </div>
  );
}
