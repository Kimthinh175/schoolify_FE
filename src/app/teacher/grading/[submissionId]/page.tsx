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

  // Grading states
  const [essayPoints, setEssayPoints] = React.useState('2.0');
  const [essayFeedback, setEssayFeedback] = React.useState(
    'Lời giải xuất sắc và chặt chẽ, chỉ cần chú ý viết ký hiệu toán học chuẩn hơn.'
  );
  const [generalNotes, setGeneralNotes] = React.useState(
    submission.teacher_notes ||
      'Em nắm rất vững bản chất công thức lượng giác. Câu tự luận trình bày rõ ràng, đủ điều kiện k thuộc Z. Tiếp tục phát huy!'
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bài nộp
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chấm Bài: {submission.student_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bài thi: <span className="font-semibold text-slate-700 dark:text-slate-300">{submission.exam_title}</span> • Nộp lúc {new Date(submission.submitted_at || '').toLocaleString('vi-VN')}
          </p>
        </div>

        <Button
          onClick={handleSave}
          leftIcon={isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          variant={isSaved ? 'success' : 'primary'}
        >
          {isSaved ? 'Đã Lưu & Trả Điểm' : 'Lưu Điểm & Trả Bài'}
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
              <Badge variant={q.type === 'ESSAY' ? 'purple' : 'success'}>
                {q.type === 'ESSAY' ? 'Chấm Tự Luận' : 'Trắc nghiệm tự động'}
              </Badge>
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.content}</p>

            {/* Answer Display */}
            {q.type === 'ESSAY' ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Bài Làm Của Học Sinh:</span>
                  <p className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line">
                    {submission.answers[3]?.text_answer}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-bold">Đáp án chuẩn tham khảo:</span> {q.sample_essay_answer}
                </div>

                {/* Grading Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div>
                    <Input
                      label="Điểm cho câu này (max 2.5đ)"
                      value={essayPoints}
                      onChange={(e) => setEssayPoints(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      label="Lời nhận xét cho câu này"
                      value={essayFeedback}
                      onChange={(e) => setEssayFeedback(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>Học sinh đã chọn đáp án đúng (+{q.points}đ)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            )}
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
