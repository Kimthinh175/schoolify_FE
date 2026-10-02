'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  Award,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  FileText,
  Gem,
  Share2,
  Home,
  BrainCircuit,
  PenTool,
  ListOrdered,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import {
  getPracticeExam,
  PracticeExamPackage,
  ExamQuestion,
  ExamFormat,
} from '@/services/mock/practice-flow-data';
import { PracticeLevel } from '@/types/subject';
import { cn } from '@/lib/utils';
import { MathEssayEditor } from '@/components/ui/math-editor';
import { Navbar } from '@/components/layout/Navbar';

function ExamRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectSlug = searchParams.get('subject') || 'toan-hoc';
  const levelParam = (searchParams.get('level') || 'basic').toUpperCase() as PracticeLevel;
  const gradeParam = Number(searchParams.get('grade') || '12');
  const chapterParam = Number(searchParams.get('chapter') || '1');
  const formatParam = (searchParams.get('format') || 'quiz').toUpperCase() as ExamFormat;
  const countParam = searchParams.get('count') ? Number(searchParams.get('count')) : undefined;
  const durationParam = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined;
  const quizCountParam = searchParams.get('quizCount') ? Number(searchParams.get('quizCount')) : undefined;
  const essayCountParam = searchParams.get('essayCount') ? Number(searchParams.get('essayCount')) : undefined;

  // Load Exam Package
  const exam = React.useMemo(() => {
    return getPracticeExam(subjectSlug, levelParam, gradeParam, chapterParam, formatParam, {
      requestedCount: countParam,
      quizCount: quizCountParam,
      essayCount: essayCountParam,
      durationMinutes: durationParam,
    });
  }, [subjectSlug, levelParam, gradeParam, chapterParam, formatParam, countParam, quizCountParam, essayCountParam, durationParam]);

  // Phân chia danh sách câu hỏi Trắc nghiệm và Tự luận
  const quizQuestions = React.useMemo(
    () => exam.questions.filter((q) => q.type !== 'ESSAY'),
    [exam.questions]
  );
  const essayQuestions = React.useMemo(
    () => exam.questions.filter((q) => q.type === 'ESSAY'),
    [exam.questions]
  );

  // Tab state (giống /student/learn/crs-01/ls-01: 'quiz' | 'essay')
  const [activeTab, setActiveTab] = React.useState<'quiz' | 'essay'>(
    formatParam === 'ESSAY' ? 'essay' : 'quiz'
  );

  // Timer state
  const totalLimitSeconds = exam.durationMinutes * 60;
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const [secondsRemaining, setSecondsRemaining] = React.useState(totalLimitSeconds);

  // Student Answers State
  const [activeQuestionIdx, setActiveQuestionIdx] = React.useState(0);
  const [multipleChoices, setMultipleChoices] = React.useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [trueFalseAnswers, setTrueFalseAnswers] = React.useState<Record<string, Record<string, boolean>>>({});
  const [shortAnswers, setShortAnswers] = React.useState<Record<string, string>>({});
  const [essayAnswers, setEssayAnswers] = React.useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = React.useState<Record<string, boolean>>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Quick jump to a question and auto switch tab if needed
  const handleJumpToQuestion = (q: ExamQuestion, globalIdx: number) => {
    setActiveQuestionIdx(globalIdx);
    if (q.type === 'ESSAY' && activeTab !== 'essay') {
      setActiveTab('essay');
    } else if (q.type !== 'ESSAY' && activeTab !== 'quiz') {
      setActiveTab('quiz');
    }
    setIsMobileSidebarOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`question-card-${q.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Submission & Confirmation modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [activeReviewFilter, setActiveReviewFilter] = React.useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');

  // Live Timer Effect
  React.useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Auto submit on time-out
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted]);

  // Format Timer strings (MM:SS)
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle flag
  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Multiple Choice Select
  const handleSelectChoice = (qId: string, key: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setMultipleChoices((prev) => ({ ...prev, [qId]: key }));
  };

  // True/False Select
  const handleSelectTrueFalse = (qId: string, subId: string, value: boolean) => {
    if (isSubmitted) return;
    setTrueFalseAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        [subId]: value,
      },
    }));
  };

  // Check if a question is answered
  const isQuestionAnswered = (q: ExamQuestion): boolean => {
    if (q.type === 'MULTIPLE_CHOICE') return !!multipleChoices[q.id];
    if (q.type === 'TRUE_FALSE') {
      const answers = trueFalseAnswers[q.id];
      return answers && Object.keys(answers).length === 4;
    }
    if (q.type === 'SHORT_ANSWER') return !!shortAnswers[q.id]?.trim();
    if (q.type === 'ESSAY') return !!essayAnswers[q.id]?.trim();
    return false;
  };

  const answeredCount = exam.questions.filter(isQuestionAnswered).length;
  const answeredQuizCount = quizQuestions.filter(isQuestionAnswered).length;
  const answeredEssayCount = essayQuestions.filter(isQuestionAnswered).length;

  // Calculate detailed exam results
  const examResult = React.useMemo(() => {
    if (!isSubmitted) return null;

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const questionResults = exam.questions.map((q) => {
      let isCorrect = false;
      let earnedScore = 0;

      if (q.type === 'MULTIPLE_CHOICE') {
        const studentChoice = multipleChoices[q.id];
        if (studentChoice === q.correctChoice) {
          isCorrect = true;
          earnedScore = q.score;
          correctCount++;
        } else if (studentChoice) {
          wrongCount++;
        }
      } else if (q.type === 'TRUE_FALSE') {
        const studentAnswers = trueFalseAnswers[q.id] || {};
        let subCorrect = 0;
        q.statements?.forEach((st) => {
          if (studentAnswers[st.subId] === st.isCorrect) {
            subCorrect++;
          }
        });
        // Quy chế điểm Đúng/Sai của Bộ GD: đúng 1 ý: 0.1đ, 2 ý: 0.25đ, 3 ý: 0.5đ, 4 ý: 1.0đ
        if (subCorrect === 4) earnedScore = 1.0;
        else if (subCorrect === 3) earnedScore = 0.5;
        else if (subCorrect === 2) earnedScore = 0.25;
        else if (subCorrect === 1) earnedScore = 0.1;

        if (subCorrect === 4) correctCount++;
        else if (subCorrect > 0) correctCount += 0.5;
        else wrongCount++;
        isCorrect = subCorrect >= 3;
      } else if (q.type === 'SHORT_ANSWER') {
        const studentAns = shortAnswers[q.id]?.trim();
        if (studentAns === q.shortAnswerCorrect) {
          isCorrect = true;
          earnedScore = q.score;
          correctCount++;
        } else if (studentAns) {
          wrongCount++;
        }
      } else if (q.type === 'ESSAY') {
        const studentEssay = essayAnswers[q.id]?.trim();
        // Giả lập chấm điểm tự luận: hoàn thành bài làm được điểm cộng khuyến khích
        if (studentEssay && studentEssay.length > 30) {
          earnedScore = q.score * 0.85; // 85% điểm số nếu trình bày đầy đủ
          isCorrect = true;
          correctCount++;
        }
      }

      totalScore += earnedScore;
      return {
        question: q,
        isCorrect,
        earnedScore: Math.round(earnedScore * 100) / 100,
      };
    });

    // Scale to standard 10-point scale
    const finalScore = Math.min(10, Math.round((totalScore / exam.totalPoints) * 10 * 10) / 10);
    const diamondReward = finalScore >= 8 ? 50 : finalScore >= 5 ? 30 : 15;

    return {
      finalScore,
      earnedScore: Math.round(totalScore * 10) / 10,
      maxScore: exam.totalPoints,
      correctCount: Math.round(correctCount),
      wrongCount,
      unansweredCount: exam.questions.length - answeredCount,
      timeSpentSeconds: secondsElapsed,
      diamondReward,
      questionResults,
    };
  }, [
    isSubmitted,
    exam,
    multipleChoices,
    trueFalseAnswers,
    shortAnswers,
    essayAnswers,
    answeredCount,
    secondsElapsed,
  ]);

  const handleRetakeExam = () => {
    setMultipleChoices({});
    setTrueFalseAnswers({});
    setShortAnswers({});
    setEssayAnswers({});
    setFlaggedIds({});
    setActiveQuestionIdx(0);
    setSecondsElapsed(0);
    setSecondsRemaining(totalLimitSeconds);
    setIsSubmitted(false);
  };

  const currentQ = exam.questions[activeQuestionIdx];

  // =========================================================================
  // VIEW: RESULT SCREEN (HIỆN KẾT QUẢ VÀ LỜI GIẢI CHI TIẾT)
  // =========================================================================
  if (isSubmitted && examResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-20 font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto space-y-8 w-full py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Result Card */}
          <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#00B8DD]/15 blur-3xl rounded-full pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-800 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Hoàn Thành Bài Thi Khảo Thí
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Kết Quả Luyện Tập: {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {exam.subjectName} • Lớp {exam.grade} • {exam.chapterName}
            </p>

            {/* Score Showcase */}
            <div className="my-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#E6F8FC] to-white dark:from-slate-800 dark:to-slate-850 border-2 border-[#00B8DD]/40 shadow-lg min-w-[200px]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#007D99] dark:text-[#00B8DD]">
                  Điểm Số Đạt Được
                </span>
                <div className="text-5xl font-black text-slate-950 dark:text-white my-1">
                  {examResult.finalScore}{' '}
                  <span className="text-lg font-bold text-slate-400">/ 10</span>
                </div>
                <Badge
                  variant={
                    examResult.finalScore >= 8 ? 'success' : examResult.finalScore >= 5 ? 'primary' : 'warning'
                  }
                  className="mt-1"
                >
                  {examResult.finalScore >= 8
                    ? 'Xuất Sắc ⭐'
                    : examResult.finalScore >= 6.5
                    ? 'Khá Tốt 👍'
                    : 'Cần Ôn Lại'}
                </Badge>
              </div>

              {/* Diamond Reward & Time */}
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Clock className="w-4 h-4" /> Thời Gian Làm Bài
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {formatTimer(examResult.timeSpentSeconds)}
                  </div>
                  <span className="text-[10px] text-slate-500">Giới hạn: {exam.durationMinutes} phút</span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400">
                    <Gem className="w-4 h-4 text-cyan-500 animate-pulse" /> Thưởng Kim Cương
                  </div>
                  <div className="text-xl font-black text-[#007D99] dark:text-[#00B8DD] mt-1">
                    +{examResult.diamondReward} 💎
                  </div>
                  <span className="text-[10px] text-slate-500">Đã cộng vào ví học sinh</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Check className="w-4 h-4" /> Số Câu Làm Đúng
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {examResult.correctCount} / {exam.questions.length}
                  </div>
                  <span className="text-[10px] text-slate-500">Chuẩn barem đáp án</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                    <X className="w-4 h-4" /> Câu Chưa Chuẩn
                  </div>
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    {examResult.wrongCount + examResult.unansweredCount}
                  </div>
                  <span className="text-[10px] text-slate-500">Xem giải thích bên dưới</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleRetakeExam}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="rounded-xl font-bold"
              >
                Làm Lại Đề Này
              </Button>
              <Link href="/#kho-mon-hoc">
                <Button
                  variant="primary"
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Chọn Luyện Đề Môn Khác
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="rounded-xl font-semibold" leftIcon={<Home className="w-4 h-4" />}>
                  Về Trang Chủ
                </Button>
              </Link>
            </div>
          </Card>

          {/* Detailed Solutions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#00B8DD]" />
                  Xem Lời Giải Chi Tiết Từng Câu Chuẩn SGK Mới 2018
                </h2>
                <p className="text-xs text-slate-500">
                  Đối chiếu phương pháp làm bài, công thức đạo hàm và barem điểm từng bước.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setActiveReviewFilter('ALL')}
                  className={cn(
                    'px-3 py-1 rounded-lg font-semibold transition-all',
                    activeReviewFilter === 'ALL'
                      ? 'bg-[#00B8DD] text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Tất Cả ({exam.questions.length})
                </button>
                <button
                  onClick={() => setActiveReviewFilter('WRONG')}
                  className={cn(
                    'px-3 py-1 rounded-lg font-semibold transition-all',
                    activeReviewFilter === 'WRONG'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Câu Sai ({examResult.wrongCount + examResult.unansweredCount})
                </button>
                <button
                  onClick={() => setActiveReviewFilter('CORRECT')}
                  className={cn(
                    'px-3 py-1 rounded-lg font-semibold transition-all',
                    activeReviewFilter === 'CORRECT'
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Câu Đúng ({examResult.correctCount})
                </button>
              </div>
            </div>

            {/* Questions Review List */}
            <div className="space-y-5">
              {examResult.questionResults
                .filter((r) => {
                  if (activeReviewFilter === 'WRONG') return !r.isCorrect;
                  if (activeReviewFilter === 'CORRECT') return r.isCorrect;
                  return true;
                })
                .map((res, index) => {
                  const q = res.question;
                  return (
                    <Card
                      key={q.id}
                      className={cn(
                        'p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-4',
                        res.isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/40'
                          : 'border-rose-200 dark:border-rose-900/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-lg text-xs font-bold',
                              res.isCorrect
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                            )}
                          >
                            {res.isCorrect ? '✓ Đúng' : '✗ Chưa đúng'} ({res.earnedScore}/{q.score}đ)
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {q.type === 'MULTIPLE_CHOICE'
                              ? 'Trắc nghiệm 4 lựa chọn'
                              : q.type === 'TRUE_FALSE'
                              ? 'Trắc nghiệm Đúng/Sai'
                              : q.type === 'SHORT_ANSWER'
                              ? 'Điền đáp số'
                              : 'Tự luận'}
                          </span>
                        </div>
                      </div>

                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {q.title}
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                        {q.content}
                      </div>

                      {/* Display choices if multiple choice */}
                      {q.type === 'MULTIPLE_CHOICE' && q.choices && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {q.choices.map((choice) => {
                            const isSelected = multipleChoices[q.id] === choice.key;
                            const isCorrectOpt = q.correctChoice === choice.key;

                            let optClasses = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950';
                            if (isCorrectOpt) {
                              optClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200';
                            } else if (isSelected && !isCorrectOpt) {
                              optClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
                            }

                            return (
                              <div
                                key={choice.key}
                                className={cn('p-3 rounded-xl border text-xs flex items-center justify-between', optClasses)}
                              >
                                <span className="font-mono">{choice.key}. {choice.content}</span>
                                {isCorrectOpt && (
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    (Đáp án đúng)
                                  </span>
                                )}
                                {isSelected && !isCorrectOpt && (
                                  <span className="text-[11px] font-bold text-rose-500">
                                    (Bạn đã chọn)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Display True/False statements review */}
                      {q.type === 'TRUE_FALSE' && q.statements && (
                        <div className="space-y-2 pt-2">
                          {q.statements.map((st) => {
                            const studentVal = trueFalseAnswers[q.id]?.[st.subId];
                            const isSubCorrect = studentVal === st.isCorrect;

                            return (
                              <div
                                key={st.subId}
                                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    Ý {st.subId}) {st.statement}
                                  </span>
                                  <p className="text-[11px] text-slate-500">
                                    Giải thích: {st.explanation}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 text-[11px]">
                                  <span className="text-slate-500">
                                    Bạn chọn:{' '}
                                    <strong className={isSubCorrect ? 'text-emerald-600' : 'text-rose-500'}>
                                      {studentVal === true ? 'ĐÚNG' : studentVal === false ? 'SAI' : 'Chưa chọn'}
                                    </strong>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                                    Chuẩn: {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Short answer review */}
                      {q.type === 'SHORT_ANSWER' && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div>
                            Đáp số bạn điền:{' '}
                            <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                              {shortAnswers[q.id] || '(Chưa điền)'}
                            </strong>
                          </div>
                          <div>
                            Đáp số chính xác:{' '}
                            <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {q.shortAnswerCorrect}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* Essay student answer */}
                      {q.type === 'ESSAY' && (
                        <div className="space-y-3 pt-2">
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Bài làm tự luận của bạn:
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line leading-relaxed">
                              {essayAnswers[q.id] || '(Bạn chưa nhập bài làm tự luận)'}
                            </p>
                          </div>

                          {/* Rubrics */}
                          {q.gradingRubric && (
                            <div className="p-4 rounded-xl bg-[#E6F8FC] dark:bg-cyan-950/30 border border-[#00B8DD]/30 space-y-2">
                              <span className="text-xs font-bold text-[#007D99] dark:text-[#00B8DD] uppercase tracking-wider block">
                                Barem Chấm Điểm Sư Phạm Từng Bước
                              </span>
                              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                {q.gradingRubric.map((r, i) => (
                                  <div key={i} className="flex items-start justify-between gap-3">
                                    <span>
                                      • <strong>{r.step}:</strong> {r.detail}
                                    </span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                                      +{r.point}đ
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation box */}
                      <div className="mt-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-1">
                        <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-[#00B8DD]" />
                          Phương pháp giải chi tiết theo SGK GDPT 2018:
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono leading-relaxed pl-5">
                          {q.explanation}
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: EXAM ROOM (PHÒNG THI ĐO THỜI GIAN LÀM BÀI TRỰC TIẾP)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pt-20 font-sans">
      {/* ── HEADER GIỐNG TRANG CHỦ ── */}
      <Navbar />

      {/* Top Focus Sub-bar */}
      <div className="sticky top-20 z-20 px-4 sm:px-6 py-2.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between backdrop-blur-md lg:mr-72 xl:mr-80">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/#kho-mon-hoc')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
            title="Thoát phòng thi"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rời Phòng Thi</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00B8DD]/20 text-[#00B8DD]">
              {exam.subjectName} • Lớp {exam.grade}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm font-bold truncate max-w-md text-slate-200">
              {exam.title}
            </span>
          </div>
        </div>

        {/* Right: Live Timers & Submit */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile open question list button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-[#00B8DD] transition-colors"
            title="Danh sách câu hỏi"
          >
            <ListOrdered className="w-4 h-4" />
            <span>{answeredCount}/{exam.questions.length}</span>
          </button>

          {/* Live Timer Countdown */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm border shadow-xs transition-colors',
              secondsRemaining < 300
                ? 'bg-rose-950/60 text-rose-400 border-rose-800 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            )}
          >
            <Clock className="w-4 h-4 text-[#00B8DD]" />
            <span>{formatTimer(secondsElapsed)}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              / {formatTimer(totalLimitSeconds)}
            </span>
          </div>

          {/* Nộp Bài Button */}
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#00B8DD]/20"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Nộp Bài ({answeredCount}/{exam.questions.length})
          </Button>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="sticky top-[125px] z-10 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-sm sm:px-6 lg:mr-72 xl:mr-80">
        <div className="flex gap-0 max-w-4xl mx-auto">
          {quizQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === 'quiz'
                  ? 'border-[#00B8DD] text-[#00B8DD]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <BrainCircuit className="h-4 w-4" />
              Luyện Tập (Trắc Nghiệm)
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === 'quiz'
                    ? 'bg-[#00B8DD]/20 text-[#00B8DD]'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {answeredQuizCount}/{quizQuestions.length}
              </span>
            </button>
          )}

          {essayQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('essay')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === 'essay'
                  ? 'border-[#00B8DD] text-[#00B8DD]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <PenTool className="h-4 w-4" />
              Tự Luận
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === 'essay'
                    ? 'bg-[#00B8DD]/20 text-[#00B8DD]'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {answeredEssayCount}/{essayQuestions.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Exam Body ── */}
      <div className="flex-1 bg-slate-900 overflow-y-auto px-4 py-6 sm:px-6 lg:mr-72 xl:mr-80">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {/* Render Questions List */}
          <div className="space-y-6">
            {(activeTab === 'quiz' ? quizQuestions : essayQuestions).map((q) => {
              const globalIdx = exam.questions.findIndex((item) => item.id === q.id);
              const isFlagged = flaggedIds[q.id];

              return (
                <div
                  key={q.id}
                  id={`question-card-${q.id}`}
                  className="rounded-2xl border border-slate-700 bg-slate-800/40 overflow-hidden shadow-lg transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4 bg-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 px-2.5 rounded-lg bg-[#00B8DD] text-slate-950 font-black text-xs flex items-center justify-center">
                        Câu {globalIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {q.type === 'MULTIPLE_CHOICE'
                          ? 'Trắc Nghiệm 4 Lựa Chọn'
                          : q.type === 'TRUE_FALSE'
                          ? 'Đúng / Sai (4 Mệnh Đề)'
                          : q.type === 'SHORT_ANSWER'
                          ? 'Điền Số Đáp Án'
                          : 'Tự Luận Chuyên Sâu'}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                        {q.score} điểm
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlag(q.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                        isFlagged
                          ? 'bg-amber-950 text-amber-300 border border-amber-600'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      )}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Title & Content */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white leading-relaxed">
                        {q.title}
                      </h3>
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-mono text-slate-200 leading-relaxed whitespace-pre-line">
                        {q.content}
                      </div>
                    </div>

                    {/* Question Interactive Inputs */}
                    {/* 1. MULTIPLE CHOICE */}
                    {q.type === 'MULTIPLE_CHOICE' && q.choices && (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Chọn 1 đáp án chính xác:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.choices.map((choice) => {
                            const isSelected = multipleChoices[q.id] === choice.key;
                            return (
                              <button
                                key={choice.key}
                                type="button"
                                onClick={() => handleSelectChoice(q.id, choice.key)}
                                className={cn(
                                  'p-3.5 rounded-xl border text-left text-sm transition-all flex items-center gap-3 cursor-pointer group',
                                  isSelected
                                    ? 'bg-[#00B8DD]/20 border-[#00B8DD] text-white font-bold shadow-md shadow-[#00B8DD]/15'
                                    : 'bg-slate-900/60 border-slate-700/80 hover:border-[#00B8DD]/60 text-slate-300'
                                )}
                              >
                                <span
                                  className={cn(
                                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                                    isSelected
                                      ? 'bg-[#00B8DD] text-slate-950'
                                      : 'bg-slate-800 text-slate-400 group-hover:text-[#00B8DD]'
                                  )}
                                >
                                  {choice.key}
                                </span>
                                <span className="font-mono text-xs sm:text-sm">{choice.content}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. TRUE / FALSE STATEMENTS */}
                    {q.type === 'TRUE_FALSE' && q.statements && (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Chọn Đúng hoặc Sai cho từng mệnh đề sau:
                        </span>
                        <div className="space-y-2.5">
                          {q.statements.map((st) => {
                            const currentVal = trueFalseAnswers[q.id]?.[st.subId];
                            return (
                              <div
                                key={st.subId}
                                className="p-3 rounded-xl border border-slate-700/70 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="text-xs sm:text-sm text-slate-200 font-mono">
                                  <strong className="text-[#00B8DD] mr-1.5">
                                    {st.subId})
                                  </strong>
                                  {st.statement}
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectTrueFalse(q.id, st.subId, true)}
                                    className={cn(
                                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                                      currentVal === true
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500'
                                    )}
                                  >
                                    ĐÚNG
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectTrueFalse(q.id, st.subId, false)}
                                    className={cn(
                                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                                      currentVal === false
                                        ? 'bg-rose-500 text-white shadow-sm'
                                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-rose-500'
                                    )}
                                  >
                                    SAI
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. SHORT ANSWER */}
                    {q.type === 'SHORT_ANSWER' && (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Nhập kết quả / đáp số tính toán của bạn:
                        </label>
                        <div className="max-w-xs">
                          <input
                            type="text"
                            value={shortAnswers[q.id] || ''}
                            onChange={(e) =>
                              setShortAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            placeholder="Ví dụ: 6 hoặc 2.5 hoặc -1/2"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                          />
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            * Nhập số nguyên hoặc số thập phân/phân số tối giản.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 4. ESSAY */}
                    {q.type === 'ESSAY' && (
                      <div className="space-y-3 pt-2">
                        <MathEssayEditor
                          value={essayAnswers[q.id] || ''}
                          onChange={(val) =>
                            setEssayAnswers((prev) => ({ ...prev, [q.id]: val }))
                          }
                          placeholder="Trình bày chi tiết từng bước: Tập xác định -> Đạo hàm y' -> Lập bảng biến thiên -> Biện luận tham số m..."
                          rows={8}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Submit CTA Strip */}
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">
                Đã hoàn thành {answeredCount} / {exam.questions.length} câu hỏi
              </h4>
              <p className="text-xs text-slate-400">
                {exam.questions.length - answeredCount > 0
                  ? `Còn ${exam.questions.length - answeredCount} câu chưa làm. Bạn có thể kiểm tra lại trước khi nộp.`
                  : 'Tất cả câu hỏi đã được trả lời. Bạn có thể nộp bài ngay!'}
              </p>
            </div>
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full sm:w-auto bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-black rounded-xl px-6 py-2.5 shadow-lg shadow-[#00B8DD]/20"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Nộp Bài Khảo Thí
            </Button>
          </div>
        </div>
      </div>

      {/* ── FIXED RIGHT SIDEBAR: BẢNG DANH SÁCH CÂU HỎI ── */}
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Mobile Floating Button */}
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-black text-xs shadow-xl shadow-[#00B8DD]/30 active:scale-95 transition-all cursor-pointer"
        title="Mở danh sách câu hỏi"
      >
        <ListOrdered className="w-4 h-4" />
        <span>Danh sách câu ({answeredCount}/{exam.questions.length})</span>
      </button>

      {/* Fixed Right Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-20 bottom-0 w-72 xl:w-80 bg-slate-950/95 border-l border-slate-800 z-50 lg:z-30 flex flex-col backdrop-blur-md transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ListOrdered className="w-4 h-4 text-[#00B8DD] shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">
                Danh Sách Câu Hỏi
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#00B8DD]/20 text-[#00B8DD] border border-[#00B8DD]/30">
                {answeredCount}/{exam.questions.length} ĐÃ LÀM
              </span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Nhấn số câu để chuyển nhanh đến vị trí làm bài.
          </p>
        </div>

        {/* Sidebar Content (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Section 1: Trắc nghiệm (nếu có) */}
          {quizQuestions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#00B8DD]" />
                  Phần Trắc Nghiệm
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {answeredQuizCount}/{quizQuestions.length} câu
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((q) => {
                  const globalIdx = exam.questions.findIndex((item) => item.id === q.id);
                  const isAnswered = isQuestionAnswered(q);
                  const isFlagged = flaggedIds[q.id];
                  const isActive = activeQuestionIdx === globalIdx;

                  let btnClass = 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200';
                  if (isActive) {
                    btnClass = 'ring-2 ring-[#00B8DD] bg-[#00B8DD]/20 text-white font-black border-[#00B8DD] shadow-sm shadow-[#00B8DD]/20';
                  } else if (isFlagged) {
                    btnClass = 'bg-amber-950 text-amber-300 border border-amber-500 font-bold';
                  } else if (isAnswered) {
                    btnClass = 'bg-emerald-600 text-white font-bold border border-emerald-500 shadow-xs';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(q, globalIdx)}
                      className={cn(
                        'h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition-transform hover:scale-105 cursor-pointer',
                        btnClass
                      )}
                      title={`Câu ${globalIdx + 1}: ${q.title}`}
                    >
                      {globalIdx + 1}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Tự luận (nếu có) */}
          {essayQuestions.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#00B8DD]" />
                  Phần Tự Luận
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {answeredEssayCount}/{essayQuestions.length} câu
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {essayQuestions.map((q) => {
                  const globalIdx = exam.questions.findIndex((item) => item.id === q.id);
                  const isAnswered = isQuestionAnswered(q);
                  const isFlagged = flaggedIds[q.id];
                  const isActive = activeQuestionIdx === globalIdx;

                  let btnClass = 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200';
                  if (isActive) {
                    btnClass = 'ring-2 ring-[#00B8DD] bg-[#00B8DD]/20 text-white font-black border-[#00B8DD] shadow-sm shadow-[#00B8DD]/20';
                  } else if (isFlagged) {
                    btnClass = 'bg-amber-950 text-amber-300 border border-amber-500 font-bold';
                  } else if (isAnswered) {
                    btnClass = 'bg-emerald-600 text-white font-bold border border-emerald-500 shadow-xs';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(q, globalIdx)}
                      className={cn(
                        'h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition-transform hover:scale-105 cursor-pointer',
                        btnClass
                      )}
                      title={`Câu ${globalIdx + 1}: ${q.title}`}
                    >
                      {globalIdx + 1}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend (Chú thích) */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600" />
              <span>Đã làm ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-900 border border-slate-700" />
              <span>Chưa làm ({exam.questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-950 border border-amber-500" />
              <span>Đánh dấu cờ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-[#00B8DD] bg-[#00B8DD]/20" />
              <span>Đang chọn</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer CTA */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-black rounded-xl py-3 text-xs shadow-lg shadow-[#00B8DD]/20"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Nộp Bài Khảo Thí ({answeredCount}/{exam.questions.length})
          </Button>
        </div>
      </aside>

      {/* ── MODAL XÁC NHẬN NỘP BÀI ── */}
      <Dialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        maxWidth="md"
        title="Xác Nhận Nộp Bài Thi"
        description="Vui lòng kiểm tra lại tiến độ làm bài trước khi nộp bài."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số câu đã hoàn thành:</span>
              <strong className="text-emerald-400">
                {answeredCount} / {exam.questions.length} câu
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số câu chưa trả lời:</span>
              <strong className="text-rose-400">
                {exam.questions.length - answeredCount} câu
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Thời gian làm bài:</span>
              <strong className="text-white font-mono">
                {formatTimer(secondsElapsed)}
              </strong>
            </div>
          </div>

          {exam.questions.length - answeredCount > 0 && (
            <p className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-xl border border-amber-800">
              ⚠️ Bạn vẫn còn {exam.questions.length - answeredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài ngay bây giờ?
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
            >
              Tiếp Tục Làm Bài
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsSubmitModalOpen(false);
                setIsSubmitted(true);
              }}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl"
            >
              Xác Nhận Nộp Bài
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function StudentPracticeExamRoomPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
          Đang khởi tạo phòng thi trực tuyến...
        </div>
      }
    >
      <ExamRoomContent />
    </React.Suspense>
  );
}
