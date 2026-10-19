'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Send,
  Clock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Award,
  Trophy,
  Check,
  RotateCcw,
  FileText,
  Eye,
  Layers,
  WifiOff,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MathRenderer } from '@/components/ui/math-renderer';
import { MathEssayEditor } from '@/components/ui/math-editor';
import { examOfflineStorage } from '@/services/exam-offline-storage.service';
import {
  OlympiadExam,
  OlympiadMathProblem,
  OlympiadSubPart,
  OlympiadGradingReport,
  ProblemGradingResult,
  SubPartGradingResult,
} from '@/types/olympiad';
import { gradeOlympiadExam, gradeSubPart } from '@/services/ai-essay-grading.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OlympiadEssayExamRoomProps {
  exam: OlympiadExam;
}

export function OlympiadEssayExamRoom({ exam }: OlympiadEssayExamRoomProps) {
  const router = useRouter();
  const problems = React.useMemo(() => exam.mathProblems || [], [exam]);

  // Active Problem Index
  const [activeProblemIdx, setActiveProblemIdx] = React.useState(0);
  const activeProblem = problems[activeProblemIdx] || problems[0];

  // Timer
  const [secondsRemaining, setSecondsRemaining] = React.useState(exam.durationMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = React.useState(false);

  // Student Answers: { [problemId]: { [subId]: string } }
  const [answers, setAnswers] = React.useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    for (const p of problems) {
      init[p.id] = {};
      for (const sub of p.subParts) {
        init[p.id][sub.subId] = '';
      }
    }
    return init;
  });

  // Saved timestamp indicator
  const [lastSaved, setLastSaved] = React.useState<string>('Vừa lưu');

  // AI Grading States
  const [isGrading, setIsGrading] = React.useState(false);
  const [gradingReport, setGradingReport] = React.useState<OlympiadGradingReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

  // Single Problem Quick Grading State (for instant feedback)
  const [singleProbResult, setSingleProbResult] = React.useState<ProblemGradingResult | null>(null);
  const [isSingleProbGrading, setIsSingleProbGrading] = React.useState(false);

  // Debounce timeout ref for saving drafts to IndexedDB
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // 1. Khởi tạo hoặc khôi phục phiên thi từ IndexedDB khi mount
  React.useEffect(() => {
    let isMounted = true;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';

    examOfflineStorage
      .startExamSession({
        examId: exam.id,
        examType: 'OLYMPIAD_ESSAY',
        examTitle: exam.title,
        roomUrl: currentUrl,
        durationMinutes: exam.durationMinutes,
      })
      .then((session) => {
        if (!isMounted || !session) return;

        // Khôi phục bài làm đã lưu từ IndexedDB nếu có
        if (session.answers && Object.keys(session.answers).length > 0) {
          setAnswers((prev) => ({
            ...prev,
            ...session.answers,
          }));
          setLastSaved('Đã khôi phục bài làm');
        }

        // Tính toán chính xác thời gian còn lại theo Wall-Clock (chống reset khi thoát tab)
        const now = Date.now();
        const remaining = Math.max(0, Math.round((session.targetEndTime - now) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          handleSubmitFullExam(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exam.id, exam.durationMinutes, exam.title]);

  // 2. Countdown Timer đếm giờ thực ngầm theo Wall-Clock
  React.useEffect(() => {
    if (isTimerPaused || gradingReport) return;

    const interval = setInterval(() => {
      const lock = examOfflineStorage.getFastSyncActiveLock();
      if (lock && lock.targetEndTime) {
        const remaining = Math.max(0, Math.round((lock.targetEndTime - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          handleSubmitFullExam(true);
        }
      } else {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitFullExam(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused, gradingReport]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Answer Changes for a Sub-Part with Debounced IndexedDB Save
  const handleAnswerChange = (probId: string, subId: string, val: string) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [probId]: {
          ...prev[probId],
          [subId]: val,
        },
      };

      // Lưu trữ tự động vào IndexedDB
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        examOfflineStorage.updateDraftAnswers(updated).then(() => {
          setLastSaved('Đã lưu an toàn');
        });
      }, 300);

      return updated;
    });
    setLastSaved('Đang lưu...');
  };

  // Quick AI Grading for Current Problem Only
  const handleGradeCurrentProblem = () => {
    if (!activeProblem) return;
    setIsSingleProbGrading(true);

    setTimeout(() => {
      const probAnswers = answers[activeProblem.id] || {};
      const subPartResults: SubPartGradingResult[] = [];
      let earned = 0;

      for (const sub of activeProblem.subParts) {
        const studentAns = probAnswers[sub.subId] || '';
        const res = gradeSubPart(sub, studentAns);
        subPartResults.push(res);
        earned += res.pointsEarned;
      }

      setSingleProbResult({
        problemId: activeProblem.id,
        problemNumber: activeProblem.problemNumber,
        title: activeProblem.title,
        pointsEarned: Math.round(earned * 100) / 100,
        maxPoints: activeProblem.points,
        subPartResults,
      });

      setIsSingleProbGrading(false);
      toast.success(`Đã hoàn tất chấm thử AI Bài ${activeProblem.problemNumber}!`);
    }, 600);
  };

  // Submit Full Exam for 2-Stage AI Grading with Offline Fallback & Auto-Sync Queue
  const handleSubmitFullExam = async (isAutoSubmit = false) => {
    setIsGrading(true);
    const timeSpentSeconds = Math.max(1, exam.durationMinutes * 60 - secondsRemaining);

    // 1. Lưu bài nộp vào IndexedDB & giải phóng khóa phòng thi
    await examOfflineStorage.completeAndQueueSubmission({
      answers,
      timeSpentSeconds,
      isAutoSubmit,
    });

    if (typeof window !== 'undefined' && navigator.onLine) {
      toast.info('AI Khảo Thí đang phân tích hai giai đoạn và chấm điểm toàn bộ bài thi...');

      setTimeout(async () => {
        const report = gradeOlympiadExam(exam, answers);
        setGradingReport(report);
        setIsGrading(false);
        setIsReportModalOpen(true);
        toast.success(`Đã hoàn tất chấm điểm! Tổng điểm: ${report.totalScore}/${report.maxScore}đ`);

        // Đồng bộ dữ liệu lên máy chủ
        await examOfflineStorage.syncPendingSubmissions();
      }, 1000);
    } else {
      // 2. Chế độ MẤT MẠNG (Offline Mode)
      setIsGrading(false);
      toast.success('Đã nộp bài thành công!');

      // Vẫn hiển thị kết quả chấm client-side để học sinh xem lại
      const report = gradeOlympiadExam(exam, answers);
      setGradingReport(report);
      setIsReportModalOpen(true);
    }
  };

  // Count answered subparts
  const totalSubParts = React.useMemo(() => {
    return problems.reduce((acc, p) => acc + p.subParts.length, 0);
  }, [problems]);

  const answeredCount = React.useMemo(() => {
    let count = 0;
    for (const p of problems) {
      const subMap = answers[p.id] || {};
      for (const sub of p.subParts) {
        if (subMap[sub.subId]?.trim().length > 10) count++;
      }
    }
    return count;
  }, [answers, problems]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Sticky Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={async () => {
                if (!gradingReport) {
                  if (confirm('Bài thi đang diễn ra và thời gian vẫn tiếp tục tính ngầm. Bạn có chắc chắn muốn tạm thoát ra ngoài không?')) {
                    router.push('/student/practice');
                  }
                } else {
                  await examOfflineStorage.clearActiveExamSession();
                  router.push('/student/practice');
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              title="Về cổng luyện thi"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                  {exam.levelLabel}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{exam.province || 'Toàn Quốc'}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {exam.title}
              </h1>
            </div>
          </div>

          {/* Right: Timer & Submit Action */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold transition',
                secondsRemaining <= 600
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-500 text-rose-700 dark:text-rose-300 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              )}
            >
              <Clock className="w-4 h-4 text-[#00B8DD]" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <Button
              size="sm"
              onClick={() => handleSubmitFullExam(false)}
              disabled={isGrading}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl px-3 sm:px-4 shadow-lg shadow-[#00B8DD]/20"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isGrading ? 'AI Đang Chấm...' : 'Nộp Bài Chấm AI'}
            </Button>
          </div>
        </div>

        {/* Problem Navigation Bar */}
        <div className="max-w-6xl mx-auto mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {problems.map((prob, idx) => {
              const isCurrent = idx === activeProblemIdx;
              const probAns = answers[prob.id] || {};
              const filledSubs = prob.subParts.filter((s) => (probAns[s.subId] || '').trim().length > 10).length;
              return (
                <button
                  key={prob.id}
                  onClick={() => {
                    setActiveProblemIdx(idx);
                    setSingleProbResult(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0',
                    isCurrent
                      ? 'bg-[#00B8DD] text-white shadow-md font-bold'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                  )}
                >
                  <span>Bài {prob.problemNumber}</span>
                  <span className="text-[10px] opacity-75">({prob.points}đ)</span>
                  {filledSubs > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" title={`Đã làm ${filledSubs}/${prob.subParts.length} ý`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>
              Tiến độ:{' '}
              <b className="text-slate-800 dark:text-slate-200">
                {answeredCount}/{totalSubParts} ý
              </b>
            </span>
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] hidden sm:inline">{lastSaved}</span>
          </div>
        </div>
      </header>

      {/* Main Problem & Subparts Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 space-y-6">
        {/* Active Problem Overview Card */}
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold text-xs px-2.5 py-0.5">
                {activeProblem.topic}
              </Badge>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">
                <MathRenderer text={activeProblem.title} inline />
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/30">
              Thang điểm: {activeProblem.points} Điểm
            </span>
          </div>

          {/* Problem Statement */}
          <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 mb-6">
            <MathRenderer content={activeProblem.content} />
          </div>

          {/* Sub-parts List */}
          <div className="space-y-6">
            {activeProblem.subParts.map((sub, sIdx) => {
              const currentAns = answers[activeProblem.id]?.[sub.subId] || '';

              return (
                <div
                  key={sub.subId}
                  className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Sub-part Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] font-bold text-xs flex items-center justify-center shrink-0">
                        {sub.subId.toUpperCase()}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words min-w-0">
                        <MathRenderer text={sub.title} inline />
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-xs text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 shrink-0">
                      {sub.points} Điểm
                    </Badge>
                  </div>

                  {/* Math Essay Editor for this sub-part */}
                  <div className="space-y-1.5">
                    <MathEssayEditor
                      value={currentAns}
                      onChange={(newVal) => handleAnswerChange(activeProblem.id, sub.subId, newVal)}
                      placeholder="Nhập lập luận toán học, công thức và kết luận chi tiết tại đây (hỗ trợ gõ KaTeX và bấm nút công thức)..."
                      rows={5}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Problem Bottom Actions */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGradeCurrentProblem}
              disabled={isSingleProbGrading}
              className="border-purple-300 dark:border-purple-600/60 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl font-bold text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-400" />
              {isSingleProbGrading ? 'AI Đang Chấm...' : `Chấm Thử Riêng Bài ${activeProblem.problemNumber}`}
            </Button>

            <div className="flex items-center gap-2">
              {activeProblemIdx > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveProblemIdx((prev) => prev - 1);
                    setSingleProbResult(null);
                  }}
                  className="rounded-xl text-xs"
                >
                  Bài Trước
                </Button>
              )}
              {activeProblemIdx < problems.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveProblemIdx((prev) => prev + 1);
                    setSingleProbResult(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                >
                  Bài Kế Tiếp
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleSubmitFullExam(false)}
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs"
                >
                  Nộp Toàn Bộ Bài Thi
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Instant Single Problem AI Grading Card (if triggered) */}
        {singleProbResult && (
          <Card className="bg-white dark:bg-slate-900/90 border-purple-300 dark:border-purple-800/80 p-5 rounded-2xl shadow-lg dark:shadow-xl space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">KẾT QUẢ CHẤM THỬ AI</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bài {singleProbResult.problemNumber}: {singleProbResult.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Điểm đạt được:</span>
                <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">
                  {singleProbResult.pointsEarned} / {singleProbResult.maxPoints} Điểm
                </div>
              </div>
            </div>

            {/* Sub-parts evaluation details */}
            <div className="space-y-3">
              {singleProbResult.subPartResults.map((subRes) => (
                <div
                  key={subRes.subId}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                    <span className="text-slate-800 dark:text-slate-200">Ý {subRes.subId.toUpperCase()}</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {subRes.pointsEarned} / {subRes.maxPoints} đ
                    </span>
                  </div>

                  {/* Stage 1 Match Badge */}
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5',
                        subRes.answerMatchStatus === 'MATCHED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : subRes.answerMatchStatus === 'PARTIALLY_MATCHED'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                      )}
                    >
                      Giai đoạn 1: {subRes.answerMatchNote}
                    </Badge>
                  </div>

                  {/* Stage 2 Rubric Steps */}
                  <div className="space-y-1 pt-1">
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                      Giai đoạn 2 - Barem tiêu chí phương pháp:
                    </div>
                    {subRes.rubricBreakdown.map((rb) => (
                      <div
                        key={rb.step}
                        className={cn(
                          'p-1.5 rounded flex items-center justify-between text-[11px]',
                          rb.passed
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          {rb.passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          )}
                          <span>Bước {rb.step}: {rb.criterion}</span>
                        </span>
                        <span className="font-bold shrink-0">
                          +{rb.pointsAwarded}/{rb.maxPoints}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pedagogical Teacher Feedback */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-900">
                    💬 <b>Nhận xét AI:</b> {subRes.feedback}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Full Exam Final AI Evaluation Dialog */}
      <Dialog
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        maxWidth="2xl"
        title="Báo Cáo Đánh Giá Tự Luận HSG"
        description={exam.title}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(false)}
              className="rounded-xl text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Xem lại bài làm
            </Button>
            <Button
              onClick={async () => {
                await examOfflineStorage.clearActiveExamSession();
                router.push('/student/practice');
              }}
              className="bg-gradient-to-r from-[#00B8DD] to-[#009bbd] hover:brightness-105 text-white font-bold rounded-xl text-xs shadow-sm shadow-[#00B8DD]/20 cursor-pointer"
            >
              Rời phòng thi & Lưu kết quả
            </Button>
          </div>
        }
      >
        {gradingReport && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header badge */}
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-2 shadow-lg shadow-amber-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <Badge className="bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5 mb-1 font-bold">
                {gradingReport.rankingClassification}
              </Badge>
            </div>

            {/* Total Score & Feedback */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1.5">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                Tổng Điểm Chấm Thi Chính Thức
              </div>
              <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                {gradingReport.totalScore.toFixed(1)} / {gradingReport.maxScore} Điểm
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto pt-1 border-t border-slate-200 dark:border-slate-800/80 leading-relaxed">
                {gradingReport.overallTeacherComments}
              </p>
            </div>

            {/* Problem Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Chi tiết từng bài thi & barem
              </h4>
              {gradingReport.problemResults.map((pr) => (
                <div
                  key={pr.problemId}
                  className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-slate-100">
                      Bài {pr.problemNumber}: {pr.title.split('(')[0]}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">
                      {pr.pointsEarned} / {pr.maxPoints} đ
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                    {pr.subPartResults.map((sr) => (
                      <div key={sr.subId} className="space-y-1">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span>Ý {sr.subId.toUpperCase()}</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {sr.pointsEarned} / {sr.maxPoints} đ
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sr.answerMatchNote}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reward Bonus */}
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-300">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Thành tích đạt giải: <b className="text-amber-600 dark:text-amber-400 font-bold">+{exam.pointsReward} Kim Cương 💎</b> đã được cộng vào tài khoản của bạn!
              </span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
