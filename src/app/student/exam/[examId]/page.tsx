'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_EXAMS } from '@/services/mock/data';

export default function OnlineExamRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const exam = MOCK_EXAMS.find((e) => e.id === params.examId) || MOCK_EXAMS[0];

  // Timer state (15 minutes in seconds)
  const [secondsLeft, setSecondsLeft] = React.useState(15 * 60);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({
    'q-01': 'opt-1',
    'q-02': 'opt-5',
    'q-03': 'opt-7',
  });
  const [essayAnswer, setEssayAnswer] = React.useState(
    'Ta có sin(2x) = 1/2 <=> sin(2x) = sin(pi/6)\n<=> 2x = pi/6 + k2pi hoặc 2x = 5pi/6 + k2pi\n<=> x = pi/12 + kpi hoặc x = 5pi/12 + kpi (k thuộc Z).'
  );
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitExam = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nộp Bài Thành Công!</h2>
          <p className="text-xs text-slate-500">
            Bài làm của bạn đã được ghi nhận. Giáo viên sẽ chấm điểm phần tự luận và gửi lời phê sớm nhất qua Sổ liên lạc.
          </p>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
            🎉 Bạn nhận được +50 Điểm thưởng chuyên cần!
          </div>
          <Link href="/student/dashboard" className="block">
            <Button className="w-full justify-center">Về Góc Học Tập</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Sticky Exam Top Header with Timer */}
      <div className="sticky top-16 z-20 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {exam.title}
          </h1>
          <span className="text-xs text-slate-500">{exam.total_questions} Câu hỏi • Điểm tối đa: {exam.max_score}đ</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-mono font-bold text-sm border border-rose-200 dark:border-rose-800">
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <Button onClick={() => setIsSubmitModalOpen(true)} variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
            Nộp Bài
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {exam.questions?.map((q, qIdx) => (
          <Card key={q.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Câu {qIdx + 1} ({q.points} điểm)
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {q.type}
              </Badge>
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              {q.content}
            </p>

            {/* Options */}
            {q.type === 'ESSAY' ? (
              <div className="pt-2">
                <Textarea
                  rows={5}
                  placeholder="Nhập lời giải tự luận chi tiết của bạn vào đây..."
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options?.map((opt) => {
                  const isSelected = selectedAnswers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-200 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Dialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Xác Nhận Nộp Bài Thi"
        description="Bạn đã hoàn thành đủ 4/4 câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500">
            Sau khi nộp bài, hệ thống sẽ tự động chấm điểm phần trắc nghiệm và gửi bài tự luận tới thầy cô bộ môn.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>
              Xem Lại Bài
            </Button>
            <Button variant="primary" onClick={handleSubmitExam}>
              Xác Nhận Nộp
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
