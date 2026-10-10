'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Check,
  Bookmark,
  Maximize2,
  Minimize2,
  CloudCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MathEssayEditor } from '@/components/ui/math-editor';
import { MOCK_EXAMS } from '@/services/mock/data';
import { MathText, cleanOptionText } from '@/components/ui/math-text';
import { MathEditorToolbar } from '@/components/ui/math-editor-toolbar';

export interface QuestionOption {
  id: string;
  content: string;
}

export interface QuestionItem {
  id: string;
  number: number;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  points: number;
  content: string;
  answers?: QuestionOption[];
}

const QUESTIONS_PER_PAGE = 10;

// Dynamic Mock Question Generator (20 câu hỏi phong phú)
const GENERATED_EXAM_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-1',
    number: 1,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Tính giá trị của $\\sin\\left(\\frac{\\pi}{6}\\right)$:',
    answers: [
      { id: 'opt-1-a', content: 'A. $\\frac{1}{2}$' },
      { id: 'opt-1-b', content: 'B. $\\frac{\\sqrt{2}}{2}$' },
      { id: 'opt-1-c', content: 'C. $\\frac{\\sqrt{3}}{2}$' },
      { id: 'opt-1-d', content: 'D. $1$' },
    ],
  },
  {
    id: 'q-2',
    number: 2,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Rút gọn công thức cốt lõi $\\sin^2(\\alpha) + \\cos^2(\\alpha)$:',
    answers: [
      { id: 'opt-2-a', content: 'A. $0$' },
      { id: 'opt-2-b', content: 'B. $1$' },
      { id: 'opt-2-c', content: 'C. $2$' },
      { id: 'opt-2-d', content: 'D. $\\tan^2(\\alpha)$' },
    ],
  },
  {
    id: 'q-3',
    number: 3,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Cho $\\frac{\\pi}{2} < \\alpha < \\pi$. Khẳng định nào sau đây đúng?',
    answers: [
      { id: 'opt-3-a', content: 'A. $\\sin(\\alpha) < 0, \\cos(\\alpha) > 0$' },
      { id: 'opt-3-b', content: 'B. $\\sin(\\alpha) > 0, \\cos(\\alpha) < 0$' },
      { id: 'opt-3-c', content: 'C. $\\sin(\\alpha) > 0, \\cos(\\alpha) > 0$' },
      { id: 'opt-3-d', content: 'D. $\\sin(\\alpha) < 0, \\cos(\\alpha) < 0$' },
    ],
  },
  {
    id: 'q-4',
    number: 4,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Tập xác định của hàm số $y = \\tan(x)$ là:',
    answers: [
      { id: 'opt-4-a', content: 'A. $\\mathbb{R} \\setminus \\{k\\pi\\}$' },
      { id: 'opt-4-b', content: 'B. $\\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi\\}$' },
      { id: 'opt-4-c', content: 'C. $\\mathbb{R}$' },
      { id: 'opt-4-d', content: 'D. $[-1; 1]$' },
    ],
  },
  {
    id: 'q-5',
    number: 5,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Công thức cộng $\\sin(a + b)$ bằng:',
    answers: [
      { id: 'opt-5-a', content: 'A. $\\sin(a)\\cos(b) + \\cos(a)\\sin(b)$' },
      { id: 'opt-5-b', content: 'B. $\\sin(a)\\cos(b) - \\cos(a)\\sin(b)$' },
      { id: 'opt-5-c', content: 'C. $\\cos(a)\\cos(b) - \\sin(a)\\sin(b)$' },
      { id: 'opt-5-d', content: 'D. $\\cos(a)\\cos(b) + \\sin(a)\\sin(b)$' },
    ],
  },
  {
    id: 'q-6',
    number: 6,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Nghiệm phương trình $\\cos(x) = 0$ là:',
    answers: [
      { id: 'opt-6-a', content: 'A. $x = k\\pi$' },
      { id: 'opt-6-b', content: 'B. $x = \\frac{\\pi}{2} + k\\pi$' },
      { id: 'opt-6-c', content: 'C. $x = \\frac{\\pi}{2} + k2\\pi$' },
      { id: 'opt-6-d', content: 'D. $x = k2\\pi$' },
    ],
  },
  {
    id: 'q-7',
    number: 7,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Giá trị $\\cos(0^\\circ)$ bằng bao nhiêu?',
    answers: [
      { id: 'opt-7-a', content: 'A. $0$' },
      { id: 'opt-7-b', content: 'B. $1$' },
      { id: 'opt-7-c', content: 'C. $-1$' },
      { id: 'opt-7-d', content: 'D. \\text{Không xác định}' },
    ],
  },
  {
    id: 'q-8',
    number: 8,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Chu kỳ của hàm số $y = \\sin(x)$ là:',
    answers: [
      { id: 'opt-8-a', content: 'A. $\\pi$' },
      { id: 'opt-8-b', content: 'B. $2\\pi$' },
      { id: 'opt-8-c', content: 'C. \\frac{\\pi}{2}' },
      { id: 'opt-8-d', content: 'D. $4\\pi$' },
    ],
  },
  {
    id: 'q-9',
    number: 9,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Biến đổi $1 + \\tan^2(\\alpha)$ thành:',
    answers: [
      { id: 'opt-9-a', content: 'A. $\\frac{1}{\\sin^2(\\alpha)}$' },
      { id: 'opt-9-b', content: 'B. $\\frac{1}{\\cos^2(\\alpha)}$' },
      { id: 'opt-9-c', content: 'C. $\\cot^2(\\alpha)$' },
      { id: 'opt-9-d', content: 'D. $-\\tan^2(\\alpha)$' },
    ],
  },
  {
    id: 'q-10',
    number: 10,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Phương trình $\\sin(x) = 2$ có bao nhiêu nghiệm?',
    answers: [
      { id: 'opt-10-a', content: 'A. $0$ (Vô nghiệm)' },
      { id: 'opt-10-b', content: 'B. $1$' },
      { id: 'opt-10-c', content: 'C. $2$' },
      { id: 'opt-10-d', content: 'D. Vô số nghiệm' },
    ],
  },
  {
    id: 'q-11',
    number: 11,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Công thức nhân đôi $\\sin(2a)$ bằng:',
    answers: [
      { id: 'opt-11-a', content: 'A. $2\\sin(a)\\cos(a)$' },
      { id: 'opt-11-b', content: 'B. $\\cos^2(a) - \\sin^2(a)$' },
      { id: 'opt-11-c', content: 'C. $2\\sin(a)$' },
      { id: 'opt-11-d', content: 'D. $\\sin^2(a)$' },
    ],
  },
  {
    id: 'q-12',
    number: 12,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Công thức nhân đôi $\\cos(2a)$ bằng:',
    answers: [
      { id: 'opt-12-a', content: 'A. $\\cos^2(a) - \\sin^2(a)$' },
      { id: 'opt-12-b', content: 'B. $2\\cos^2(a) - 1$' },
      { id: 'opt-12-c', content: 'C. $1 - 2\\sin^2(a)$' },
      { id: 'opt-12-d', content: 'D. Cả 3 phương án trên đều đúng' },
    ],
  },
  {
    id: 'q-13',
    number: 13,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Tính $\\tan\\left(\\frac{\\pi}{4}\\right)$:',
    answers: [
      { id: 'opt-13-a', content: 'A. $1$' },
      { id: 'opt-13-b', content: 'B. $0$' },
      { id: 'opt-13-c', content: 'C. $\\sqrt{3}$' },
      { id: 'opt-13-d', content: 'D. $\\frac{\\sqrt{3}}{3}$' },
    ],
  },
  {
    id: 'q-14',
    number: 14,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Khẳng định nào đúng đối với góc bù nhau $(\\pi - \\alpha)$?',
    answers: [
      { id: 'opt-14-a', content: 'A. $\\sin(\\pi - \\alpha) = \\sin(\\alpha)$' },
      { id: 'opt-14-b', content: 'B. $\\cos(\\pi - \\alpha) = \\cos(\\alpha)$' },
      { id: 'opt-14-c', content: 'C. $\\tan(\\pi - \\alpha) = \\tan(\\alpha)$' },
      { id: 'opt-14-d', content: 'D. $\\cot(\\pi - \\alpha) = \\cot(\\alpha)$' },
    ],
  },
  {
    id: 'q-15',
    number: 15,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Giá trị nhỏ nhất của hàm số $y = 3\\sin(x) - 1$ là:',
    answers: [
      { id: 'opt-15-a', content: 'A. $-4$' },
      { id: 'opt-15-b', content: 'B. $-1$' },
      { id: 'opt-15-c', content: 'C. $2$' },
      { id: 'opt-15-d', content: 'D. $-3$' },
    ],
  },
  {
    id: 'q-16',
    number: 16,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Giá trị lớn nhất của hàm số $y = \\cos(2x) + 5$ là:',
    answers: [
      { id: 'opt-16-a', content: 'A. $6$' },
      { id: 'opt-16-b', content: 'B. $5$' },
      { id: 'opt-16-c', content: 'C. $4$' },
      { id: 'opt-16-d', content: 'D. $7$' },
    ],
  },
  {
    id: 'q-17',
    number: 17,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Giải phương trình $\\tan(x) = 1$:',
    answers: [
      { id: 'opt-17-a', content: 'A. $x = \\frac{\\pi}{4} + k\\pi$' },
      { id: 'opt-17-b', content: 'B. $x = \\frac{\\pi}{4} + k2\\pi$' },
      { id: 'opt-17-c', content: 'C. $x = -\\frac{\\pi}{4} + k\\pi$' },
      { id: 'opt-17-d', content: 'D. $x = k\\pi$' },
    ],
  },
  {
    id: 'q-18',
    number: 18,
    type: 'SINGLE_CHOICE',
    points: 0.5,
    content: 'Đổi góc $180^\\circ$ sang Radian:',
    answers: [
      { id: 'opt-18-a', content: 'A. $\\pi$ rad' },
      { id: 'opt-18-b', content: 'B. $2\\pi$ rad' },
      { id: 'opt-18-c', content: 'C. \\frac{\\pi}{2} rad' },
      { id: 'opt-18-d', content: 'D. \\frac{\\pi}{4} rad' },
    ],
  },
  {
    id: 'q-19',
    number: 19,
    type: 'ESSAY',
    points: 1.0,
    content:
      'Ví dụ Tự luận 1: Cho $\\sin(\\alpha) = \\frac{3}{5}$ với $\\frac{\\pi}{2} < \\alpha < \\pi$. Hãy trình bày các bước tính giá trị của $\\cos(\\alpha)$ và $\\tan(\\alpha)$.',
  },
  {
    id: 'q-20',
    number: 20,
    type: 'ESSAY',
    points: 1.0,
    content:
      'Ví dụ Tự luận 2: Giải phương trình lượng giác $\\sin(2x) = \\frac{1}{2}$ trên tập số thực $\\mathbb{R}$.',
  },
];

export default function OnlineExamRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const exam = MOCK_EXAMS.find((e) => e.id === params.examId) || MOCK_EXAMS[0];

  // Questions setup
  const questions = GENERATED_EXAM_QUESTIONS;
  const totalQuestions = questions.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);

  // States
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [secondsLeft, setSecondsLeft] = React.useState<number>(45 * 60); // 45 phút
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  // States nâng cao: Đánh dấu câu hỏi cần xem lại & Lọc trạng thái
  const [flaggedQuestions, setFlaggedQuestions] = React.useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'UNANSWERED' | 'FLAGGED'>('ALL');

  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);

  // Countdown timer effect
  React.useEffect(() => {
    if (secondsLeft <= 0) {
      setIsSubmitted(true);
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleEssayChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Calculate statistics
  const answeredCount = React.useMemo(() => {
    return Object.values(answers).filter((val) => val && val.trim().length > 0).length;
  }, [answers]);

  const flaggedCount = React.useMemo(() => {
    return Object.values(flaggedQuestions).filter(Boolean).length;
  }, [flaggedQuestions]);

  const unansweredCount = totalQuestions - answeredCount;

  // Pagination calculation
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

  // Jump to specific question and its page
  const handleJumpToQuestion = (qNum: number) => {
    const targetPage = Math.ceil(qNum / QUESTIONS_PER_PAGE);
    setCurrentPage(targetPage);

    setTimeout(() => {
      const el = document.getElementById(`question-card-${qNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSubmitExam = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
  };

  // Submitted Screen
  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nộp Bài Thành Công!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống đã nhận được bài làm của bạn với <strong className="text-emerald-600">{answeredCount}/{totalQuestions} câu đã trả lời</strong>. Giáo viên bộ môn sẽ duyệt và công bố điểm chi tiết.
          </p>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-100 dark:border-indigo-900/50">
            🎉 Bạn nhận được +50 Điểm chuyên cần luyện tập!
          </div>
          <Link href="/student/dashboard" className="block pt-2">
            <Button className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5">
              Về Góc Học Tập
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Sticky Top Bar: Title + Timer + AutoSave Indicator + Action */}
      <div className="sticky top-16 z-20 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-700 text-[10px]">
              Bài Thi Trực Tuyến
            </Badge>
            <span className="text-xs text-slate-500 font-medium">{totalQuestions} câu hỏi • 10đ tối đa</span>

            {/* AutoSave Indicator */}
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium ml-2">
              <CloudCheck className="w-3.5 h-3.5" />
              <span>Đã tự động lưu</span>
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-lg mt-0.5">
            {exam.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-mono font-bold text-sm border border-rose-200/80 dark:border-rose-800/60 shadow-2xs">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Thời gian còn lại: {formatTimer(secondsLeft)}</span>
          </div>

          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 rounded-xl shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Nộp Bài</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Questions List & Right Overview Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Question List (10 câu / trang) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Trang {currentPage} / {totalPages} (Hiển thị câu {startIndex + 1} - {Math.min(startIndex + QUESTIONS_PER_PAGE, totalQuestions)})
            </span>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Đã làm: {answeredCount}/{totalQuestions}
              </span>
              {flaggedCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Xem lại: {flaggedCount}
                </span>
              )}
            </div>
          </div>

          {/* Current Page Questions */}
          <div className="space-y-6">
            {currentQuestions.map((q) => {
              const isAnswered = Boolean(answers[q.id] && answers[q.id].trim().length > 0);
              const isFlagged = Boolean(flaggedQuestions[q.id]);
              const currentVal = answers[q.id] || '';

              return (
                <Card
                  id={`question-card-${q.number}`}
                  key={q.id}
                  className="p-5 sm:p-6 space-y-4 transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                        Câu {q.number}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">({q.points} điểm)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bookmark Flag Button */}
                      <button
                        type="button"
                        onClick={() => toggleFlagQuestion(q.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isFlagged
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                            : 'bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        title="Đánh dấu câu hỏi cần xem lại sau"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span>{isFlagged ? 'Cần xem lại' : 'Xem lại'}</span>
                      </button>

                      {isAnswered ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold border-0">
                          <Check className="w-3 h-3 mr-1 inline text-emerald-600" />
                          Đã trả lời
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-500 text-[10px]">
                          Chưa trả lời
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    <MathText text={q.content} />
                  </div>

                  {/* Question Options or Essay */}
                  {q.type === 'ESSAY' ? (
                    <div className="pt-2">
                      <MathEditorToolbar
                        value={currentVal}
                        onChange={(val) => handleEssayChange(q.id, val)}
                        placeholder="Nhập hoặc sử dụng các phím chèn công thức để trình bày lời giải..."
                        label="Bài làm tự luận của bạn:"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {q.answers?.map((ans) => {
                        const isSelected = currentVal === ans.id;
                        return (
                          <button
                            key={ans.id}
                            type="button"
                            onClick={() => handleSelectOption(q.id, ans.id)}
                            className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${isSelected
                                ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/80 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-200 font-bold shadow-2xs'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50/80'
                              }`}
                          >
                            <div
                              className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${isSelected
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                }`}
                            >
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className="leading-snug">
                              <MathText text={cleanOptionText(ans.content)} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS (Chỉ cho 10 câu 1 trang) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <Button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Trang Trước
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => {
                    setCurrentPage(pNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`h-9 min-w-9 px-3 rounded-xl text-xs font-bold transition-all ${currentPage === pNum
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                >
                  Trang {pNum}
                </button>
              ))}
            </div>

            <Button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Trang Sau
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Question Overview Grid (Bảng Tóm Tắt Tất Cả Câu Hỏi) */}
        <div className="lg:col-span-4 sticky top-36 space-y-4">
          <Card className="p-5 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Danh Sách Câu Hỏi
                </h3>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {totalQuestions} Câu
              </Badge>
            </div>

            {/* Status Statistics Legend & Quick Filter */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Đã làm:
                  </span>
                  <span className="font-extrabold text-sm">{answeredCount}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                    Chưa làm:
                  </span>
                  <span className="font-extrabold text-sm">{unansweredCount}</span>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('UNANSWERED')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    statusFilter === 'UNANSWERED'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Chưa làm ({unansweredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('FLAGGED')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    statusFilter === 'FLAGGED'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
                  }`}
                >
                  Xem lại ({flaggedCount})
                </button>
              </div>
            </div>

            {/* Questions Grid Palette (Tất cả câu hỏi) */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Bấm số câu để nhảy đến vị trí làm bài:
              </p>

              <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto p-1 scrollbar-thin">
                {questions
                  .filter((q) => {
                    if (statusFilter === 'UNANSWERED') return !answers[q.id] || answers[q.id].trim().length === 0;
                    if (statusFilter === 'FLAGGED') return Boolean(flaggedQuestions[q.id]);
                    return true;
                  })
                  .map((q) => {
                    const isDone = Boolean(answers[q.id] && answers[q.id].trim().length > 0);
                    const isFlagged = Boolean(flaggedQuestions[q.id]);

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(q.number)}
                        title={`Câu ${q.number}: ${isDone ? 'Đã làm' : 'Chưa làm'}${isFlagged ? ' (Xem lại)' : ''}`}
                        className={`relative h-10 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${isDone
                            ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600 border-0'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                      >
                        <span>{q.number}</span>
                        {/* Flag Indicator Dot */}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                            <span className="text-[8px] font-black text-amber-950">!</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Quick Submit Action Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-xs gap-2 justify-center"
              >
                <Send className="w-4 h-4" />
                <span>Nộp Bài Ngay</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Xác Nhận Nộp Bài Thi"
        description={`Bạn đã làm ${answeredCount}/${totalQuestions} câu hỏi.`}
      >
        <div className="space-y-4 py-2">
          {unansweredCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Chú ý: Bạn còn {unansweredCount} câu chưa trả lời!</p>
                {flaggedCount > 0 && <p className="mt-0.5 text-amber-700">Có {flaggedCount} câu bạn đã đánh dấu cần xem lại.</p>}
                <p className="mt-0.5">Bạn có muốn kiểm tra lại trước khi chốt nộp bài?</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tuyệt vời! Bạn đã hoàn thành 100% tất cả các câu hỏi.</span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Sau khi nộp bài, hệ thống sẽ tự động tính điểm và lưu lại kết quả của bạn.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>
              Xem Lại Bài
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5"
              onClick={handleSubmitExam}
            >
              Chắc Chắn Nộp
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
