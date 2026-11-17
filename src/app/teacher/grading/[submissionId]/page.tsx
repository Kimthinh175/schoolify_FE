'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  MessageSquare,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_SUBMISSIONS, MOCK_EXAMS } from '@/services/mock/data';

export default function TeacherGradingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submission =
    MOCK_SUBMISSIONS.find((s) => s.id === params.submissionId) || MOCK_SUBMISSIONS[0];
  const exam = MOCK_EXAMS.find((e) => e.id === submission.exam_id) || MOCK_EXAMS[0];

  // Teacher feedback state
  const [generalNotes, setGeneralNotes] = React.useState(
    submission.teacher_notes ||
      'Em nắm rất vững kiến thức trọng tâm và hoàn thành tốt các câu hỏi trắc nghiệm. Tiếp tục phát huy!'
  );
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/teacher/grading"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bài nộp
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nhận Xét Bài Làm: {submission.student_name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bài thi: <span className="font-semibold text-slate-700 dark:text-slate-300">{submission.exam_title}</span> • Nộp lúc {new Date(submission.submitted_at || '').toLocaleString('vi-VN')}
          </p>
        </div>

        <Button
          onClick={handleSave}
          leftIcon={isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          variant={isSaved ? 'success' : 'primary'}
        >
          {isSaved ? 'Đã Lưu & Trả Bài' : 'Lưu Nhận Xét & Trả Bài'}
        </Button>
      </div>

      {/* Main Grading Cards */}
      <div className="space-y-6">
        {/* Questions from Exam */}
        {exam.questions?.map((q, idx) => (
          <Card key={q.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Câu {idx + 1} ({q.type}) • Điểm tối đa: {q.points}đ
              </span>
              <Badge variant="success">Trắc nghiệm tự động</Badge>
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.content}</p>

            {/* Answer Display */}
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span>Học sinh đã chọn đáp án đúng (+{q.points}đ)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </Card>
        ))}

        {/* General Teacher Notes */}
        <Card className="p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Lời Nhận Xét Tổng Quan Gửi Học Sinh & Phụ Huynh
          </h3>
          <Textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Nhập lời phê chung hiển thị trên Sổ liên lạc điện tử của phụ huynh..."
          />
        </Card>
      </div>
    </div>
  );
}
