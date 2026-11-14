'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Send,
  BookOpen,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Target,
  Clock,
  Infinity as InfinityIcon,
  Home,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MathRenderer } from '@/components/ui/math-renderer';
import { toast } from 'sonner';
import {
  PracticeExamPackage,
  ExamQuestion,
  QuestionChoice,
  TrueFalseStatement,
} from '@/services/mock/practice-flow-data';
import { examSnapshotService } from '@/services/exam-snapshot.service';
import { NgocIcon } from '@/components/ui/point-icons';

const REMEDIATION_STORAGE_KEY = 'schoolify_remediation_exam_data';

const RemediationStopwatch: React.FC<{
  isSubmitted: boolean;
  loading: boolean;
  hasData: boolean;
  onTick: (seconds: number) => void;
}> = React.memo(({ isSubmitted, loading, hasData, onTick }) => {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (isSubmitted || loading || !hasData) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        onTick(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, loading, hasData, onTick]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return <span>{`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`}</span>;
});
RemediationStopwatch.displayName = 'RemediationStopwatch';

interface RemediationStoredData {
  remediationExam: PracticeExamPackage;
  originalExam: PracticeExamPackage;
  snapshotId?: string;
  attemptToken?: string;
}

export default function RemediationExamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Trạng thái nạp dữ liệu
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<RemediationStoredData | null>(null);

  // Tiến trình làm bài
  const [currentQIndex, setCurrentQIndex] = React.useState(0);
  const [choices, setChoices] = React.useState<Record<string, string>>({});
  const [trueFalseAnswers, setTrueFalseAnswers] = React.useState<
    Record<string, Record<string, boolean>>
  >({});
  const [shortAnswers, setShortAnswers] = React.useState<Record<string, string>>({});

  // Bộ đếm thời gian rèn luyện (được tách riêng vào RemediationStopwatch để không re-render trang chính)
  const elapsedSecondsRef = React.useRef(0);
  const [submittedDuration, setSubmittedDuration] = React.useState<string>('00:00');
  const handleTick = React.useCallback((s: number) => {
    elapsedSecondsRef.current = s;
  }, []);

  // Trạng thái nộp bài & kết quả
  const [showConfirmSubmit, setShowConfirmSubmit] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [result, setResult] = React.useState<{
    score: number;
    correctCount: number;
    wrongCount: number;
    questionResults: {
      question: ExamQuestion;
      isCorrect: boolean;
      earnedScore: number;
    }[];
  } | null>(null);

  // 1. Khôi phục dữ liệu bài thi khắc phục từ sessionStorage hoặc snapshot gần nhất
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const raw = sessionStorage.getItem(REMEDIATION_STORAGE_KEY);
        if (raw) {
          const parsed: RemediationStoredData = JSON.parse(raw);
          if (parsed.remediationExam && parsed.remediationExam.questions.length > 0) {
            if (isMounted) {
              setData(parsed);
              setLoading(false);
            }
            return;
          }
        }

        // Fallback: Tìm snapshot gần nhất nếu sessionStorage trống
        const snapshots = await examSnapshotService.getExamSnapshots();
        const latestWithWrong = snapshots.find(
          (s) => s.originalExam?.wrongQuestionIds?.length > 0
        );
        if (latestWithWrong && latestWithWrong.remediation?.questions?.length) {
          const fallbackExam: PracticeExamPackage = {
            id: `remediation_${latestWithWrong.id}`,
            subjectSlug: latestWithWrong.subjectSlug,
            subjectName: latestWithWrong.subjectName,
            level: 'BASIC',
            grade: 12,
            chapterId: 1,
            chapterName: 'Khắc phục lỗ hổng',
            format: 'MIXED',
            title: `Đề Khắc Phục Lỗi Sai: ${latestWithWrong.examTitle}`,
            durationMinutes: 0,
            totalPoints: 10,
            questions: latestWithWrong.remediation.questions,
          };
          if (isMounted) {
            setData({
              remediationExam: fallbackExam,
              originalExam: fallbackExam,
              snapshotId: latestWithWrong.id,
              attemptToken: latestWithWrong.attemptToken,
            });
            setLoading(false);
          }
          return;
        }
      } catch {}

      if (isMounted) setLoading(false);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const remediationExam = data?.remediationExam;
  const questions = remediationExam?.questions || [];
  const currentQ = questions[currentQIndex];

  // Tính số câu đã làm
  const answeredCount = React.useMemo(() => {
    let count = 0;
    questions.forEach((q) => {
      if (q.type === 'MULTIPLE_CHOICE') {
        if (choices[q.id]) count++;
      } else if (q.type === 'TRUE_FALSE') {
        const tf = trueFalseAnswers[q.id];
        if (tf && Object.keys(tf).length > 0) count++;
      } else if (q.type === 'SHORT_ANSWER') {
        if (shortAnswers[q.id]?.trim()) count++;
      }
    });
    return count;
  }, [questions, choices, trueFalseAnswers, shortAnswers]);

  // Xử lý nộp bài
  const handleSubmitExam = () => {
    if (!remediationExam) return;
    setIsSubmitting(true);

    let correct = 0;
    let wrong = 0;
    let earned = 0;

    const questionResults = remediationExam.questions.map((q) => {
      let isCorrect = false;
      let qEarned = 0;

      if (q.type === 'MULTIPLE_CHOICE') {
        const studentChoice = choices[q.id];
        if (studentChoice === q.correctChoice) {
          isCorrect = true;
          qEarned = q.score || 1;
          correct++;
        } else {
          wrong++;
        }
      } else if (q.type === 'TRUE_FALSE') {
        const answers = trueFalseAnswers[q.id] || {};
        let subCorrect = 0;
        q.statements?.forEach((st) => {
          if (answers[st.subId] === st.isCorrect) subCorrect++;
        });
        if (subCorrect === 4) qEarned = 1.0;
        else if (subCorrect === 3) qEarned = 0.5;
        else if (subCorrect === 2) qEarned = 0.25;
        else if (subCorrect === 1) qEarned = 0.1;

        if (subCorrect === 4) correct++;
        else wrong++;
        isCorrect = subCorrect >= 3;
      } else if (q.type === 'SHORT_ANSWER') {
        const studentAns = shortAnswers[q.id]?.trim();
        if (studentAns === q.shortAnswerCorrect) {
          isCorrect = true;
          qEarned = q.score || 1;
          correct++;
        } else {
          wrong++;
        }
      } else {
        isCorrect = true;
        correct++;
        qEarned = q.score || 1;
      }

      earned += qEarned;
      return {
        question: q,
        isCorrect,
        earnedScore: Math.round(qEarned * 100) / 100,
      };
    });

    const scaledScore =
      Math.round((earned / (remediationExam.totalPoints || 10)) * 100) / 10;
    const finalScore = Math.min(10, Math.max(0, scaledScore));

    const res = {
      score: finalScore,
      correctCount: correct,
      wrongCount: wrong,
      questionResults,
    };

    const finalSec = elapsedSecondsRef.current;
    const mins = Math.floor(finalSec / 60);
    const secs = finalSec % 60;
    setSubmittedDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

    setResult(res);
    setIsSubmitted(true);
    setShowConfirmSubmit(false);
    setIsSubmitting(false);

    // Cập nhật kết quả vào Snapshot & Hồ sơ Kiến thức trong PostgreSQL Backend
    examSnapshotService
      .updateRemediationInSnapshot(
        data?.snapshotId || `REM-${Date.now()}`,
        {
          attempted: true,
          attemptedAt: new Date().toISOString(),
          finalScore: finalScore,
          totalQuestions: remediationExam.questions.length,
          correctCount: correct,
          questions: remediationExam.questions,
          studentAnswers: {
            multipleChoices: choices,
            trueFalseAnswers,
            shortAnswers,
            essayAnswers: {},
          },
        },
        {
          attemptToken: data?.attemptToken,
          subjectSlug: remediationExam.subjectSlug,
          grade: remediationExam.grade,
          chapterId: remediationExam.chapterId,
        }
      )
      .then(() => toast.success('Đã lưu kết quả bài khắc phục & cập nhật lộ trình thành công!'))
      .catch(() => {});

    // Tặng thưởng khích lệ Ngọc Tri Thức vì tinh thần rèn luyện
    try {
      const curDiamonds = parseInt(
        localStorage.getItem('schoolify_user_diamonds') || '100',
        10
      );
      const newDiamonds = curDiamonds + 5;
      localStorage.setItem('schoolify_user_diamonds', String(newDiamonds));
      window.dispatchEvent(
        new CustomEvent('tokens-updated', { detail: { diamonds: newDiamonds } })
      );
    } catch {}

    toast.success('🎉 Đã nộp bài khắc phục thành công! Bạn nhận được +5 Ngọc Tri Thức 💎 thưởng nỗ lực.');
  };

  // Màn hình Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1324] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#00B8DD] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Đang chuẩn bị phòng rèn luyện khắc phục...
          </p>
        </div>
      </div>
    );
  }

  // Màn hình Empty State nếu không có bài khắc phục nào
  if (!data || !remediationExam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1324] flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Không tìm thấy đề thi cần khắc phục
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Bạn chưa có câu hỏi nào cần khắc phục hoặc bài làm đã hoàn thành. Hãy vào Cổng Luyện Thi để thử sức với các bộ đề mới nhé!
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => router.push('/student/practice')}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs px-5 py-2.5 cursor-pointer"
            >
              Vào Cổng Luyện Thi K-12
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090E17] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#00B8DD]/20">
      {/* HEADER PHÒNG THI KHẮC PHỤC (STICKY) */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B1324]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Nút quay lại & Tiêu đề đề thi */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitted && answeredCount > 0) {
                  if (confirm('Bạn đang làm bài rèn luyện. Bạn có chắc muốn quay lại kết quả không?')) {
                    router.back();
                  }
                } else {
                  router.back();
                }
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  🎯 Khắc phục câu sai
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Biến thể tương đương • GDPT 2018
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {remediationExam.title}
              </h1>
            </div>
          </div>

          {/* BỘ ĐẾM THỜI GIAN VÔ HẠN & NÚT NỘP BÀI */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <ThemeToggle className="shrink-0" />

            {/* Badge thời gian vô hạn */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-1 text-[#007D99] dark:text-[#00B8DD]" title="Thời gian làm bài vô hạn, làm đến khi nắm vững">
                <InfinityIcon className="w-4 h-4" />
                <span className="hidden md:inline font-bold">Vô hạn thời gian</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="flex items-center gap-1 font-mono text-[11px]" title="Thời gian bạn đã dành để rèn luyện">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <RemediationStopwatch isSubmitted={isSubmitted} loading={loading} hasData={Boolean(data)} onTick={handleTick} />
              </div>
            </div>

            {/* Nút nộp bài / nộp khi bỏ cuộc */}
            {!isSubmitted ? (
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Nộp Bài Khắc Phục</span>
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/student/practice')}
                className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Về Cổng Luyện Thi</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* THANH ĐIỀU HƯỚNG CÂU HỎI (HẾT HÀNG TỰ ĐỘNG XUỐNG DÒNG - TUÂN THỦ MOBILE-NO-SCROLL) */}
      <section className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Tiến độ:</span>
            <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">
              {answeredCount}/{questions.length} câu đã trả lời
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              (Làm câu nào nộp câu đó, tự do dừng lại bất cứ lúc nào)
            </span>
          </div>

          {/* Danh sách nút số câu hỏi - TỰ ĐỘNG XUỐNG DÒNG flex-wrap */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQIndex;
              let isAnswered = false;
              if (q.type === 'MULTIPLE_CHOICE') isAnswered = Boolean(choices[q.id]);
              else if (q.type === 'TRUE_FALSE') {
                const tf = trueFalseAnswers[q.id];
                isAnswered = Boolean(tf && Object.keys(tf).length > 0);
              } else if (q.type === 'SHORT_ANSWER') {
                isAnswered = Boolean(shortAnswers[q.id]?.trim());
              }

              // Trạng thái đúng/sai sau khi nộp
              let statusColor = '';
              if (isSubmitted && result) {
                const qr = result.questionResults[idx];
                statusColor = qr?.isCorrect
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-rose-500 text-white border-rose-600';
              } else if (isCurrent) {
                statusColor =
                  'bg-[#00B8DD] text-white border-[#00B8DD] shadow-xs font-bold ring-2 ring-[#00B8DD]/30';
              } else if (isAnswered) {
                statusColor =
                  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 font-semibold';
              } else {
                statusColor =
                  'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#00B8DD]';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center border transition-all cursor-pointer ${statusColor}`}
                  title={`Câu ${idx + 1}${isAnswered ? ' (Đã làm)' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* BANNER THÔNG BÁO KẾT QUẢ SAU KHI NỘP BÀI */}
        {isSubmitted && result && (
          <Card className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[#00B8DD]/10 to-amber-500/10 border-2 border-emerald-500/40 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Kết Quả Rèn Luyện Khắc Phục
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {result.score >= 8.5
                      ? '🎉 Xuất Sắc! Bạn Đã Làm Chủ Hoàn Toàn Dạng Bài Này'
                      : result.score >= 5
                      ? '👏 Rất Đáng Khen! Bạn Đã Tiến Bộ Vượt Bậc'
                      : '💪 Cố Gắng Lên! Đọc Kỹ Hướng Dẫn Chi Tiết Bên Dưới'}
                  </h2>
                </div>
              </div>

              {/* Điểm số */}
              <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#007D99] dark:text-[#00B8DD]">
                    {result.score}
                    <span className="text-xs text-slate-400 font-medium">/10đ</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Đúng {result.correctCount}/{questions.length} câu
                  </div>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-700 pl-3 text-left">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                    +5 Ngọc Tri Thức 💎
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Thời gian: {submittedDuration}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có thể xem lại đáp án chi tiết và phương pháp giải từng câu biến thể bên dưới để ghi nhớ sâu bản chất của bài toán.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="rounded-xl font-bold text-xs"
                leftIcon={<BookOpen className="w-4 h-4 text-[#00B8DD]" />}
              >
                Quay Lại Bài Thi Gốc
              </Button>
              <Button
                onClick={() => router.push('/student/practice')}
                className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Vào Cổng Luyện Thi Mới
              </Button>
            </div>
          </Card>
        )}

        {/* THẺ HIỂN THỊ CÂU HỎI HIỆN TẠI */}
        {currentQ && (
          <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header câu hỏi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-black text-xs">
                  Câu {currentQIndex + 1} / {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {currentQ.type === 'MULTIPLE_CHOICE'
                    ? 'Trắc nghiệm 4 lựa chọn'
                    : currentQ.type === 'TRUE_FALSE'
                    ? 'Đúng / Sai 4 ý'
                    : 'Điền kết quả ngắn'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {currentQ.score || 1} điểm
                </span>
              </div>

              {/* Trạng thái câu này sau khi nộp bài */}
              {isSubmitted && result && (
                <div>
                  {result.questionResults[currentQIndex]?.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      Khắc phục thành công (+{result.questionResults[currentQIndex].earnedScore}đ)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-xl border border-rose-300 dark:border-rose-800">
                      <AlertCircle className="w-4 h-4" />
                      Chưa chính xác (0đ)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Nội dung đề bài câu hỏi biến thể */}
            <div className="space-y-2 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100 font-medium">
              <MathRenderer text={currentQ.content} />
            </div>

            {/* VÙNG TRẢ LỜI CỦA HỌC SINH */}
            <div className="pt-2">
              {/* 1. DẠNG TRẮC NGHIỆM 4 LỰA CHỌN */}
              {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.choices && (
                <div className="space-y-3">
                  {currentQ.choices.map((c) => {
                    const isSelected = choices[currentQ.id] === c.key;
                    const isCorrectChoice = c.key === currentQ.correctChoice;

                    let choiceStyle = '';
                    if (isSubmitted) {
                      if (isCorrectChoice) {
                        choiceStyle =
                          'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                      } else if (isSelected && !isCorrectChoice) {
                        choiceStyle =
                          'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-100 line-through';
                      } else {
                        choiceStyle = 'opacity-60 border-slate-200 dark:border-slate-800';
                      }
                    } else if (isSelected) {
                      choiceStyle =
                        'bg-[#00B8DD]/10 border-[#00B8DD] text-[#007D99] dark:text-[#5CE1FF] font-bold shadow-xs';
                    } else {
                      choiceStyle =
                        'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800';
                    }

                    return (
                      <button
                        key={c.key}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          setChoices((prev) => ({ ...prev, [currentQ.id]: c.key }));
                        }}
                        className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer min-h-[52px] ${choiceStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#00B8DD] text-white'
                              : isSubmitted && isCorrectChoice
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {c.key}
                        </span>
                        <div className="flex-1 text-sm leading-relaxed min-w-0">
                          <MathRenderer text={c.content} inline />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. DẠNG ĐÚNG / SAI 4 Ý */}
              {currentQ.type === 'TRUE_FALSE' && currentQ.statements && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Chọn Đúng (Đ) hoặc Sai (S) cho từng phát biểu:
                  </div>
                  {currentQ.statements.map((st) => {
                    const userVal = trueFalseAnswers[currentQ.id]?.[st.subId];
                    const isCorrectSub = userVal === st.isCorrect;

                    return (
                      <div
                        key={st.subId}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0 text-sm">
                          <span className="font-bold text-slate-500 uppercase shrink-0">
                            {st.subId})
                          </span>
                          <div className="flex-1">
                            <MathRenderer text={st.statement} inline />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => {
                              setTrueFalseAnswers((prev) => ({
                                ...prev,
                                [currentQ.id]: {
                                  ...(prev[currentQ.id] || {}),
                                  [st.subId]: true,
                                },
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              userVal === true
                                ? 'bg-[#00B8DD] text-white border-[#00B8DD]'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => {
                              setTrueFalseAnswers((prev) => ({
                                ...prev,
                                [currentQ.id]: {
                                  ...(prev[currentQ.id] || {}),
                                  [st.subId]: false,
                                },
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              userVal === false
                                ? 'bg-rose-500 text-white border-rose-500'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Sai
                          </button>

                          {isSubmitted && (
                            <span className="ml-1 text-xs font-bold">
                              {isCorrectSub ? (
                                <span className="text-emerald-500">✓ Đúng</span>
                              ) : (
                                <span className="text-rose-500">
                                  ✗ Đáp án: {st.isCorrect ? 'Đúng' : 'Sai'}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. DẠNG ĐIỀN KẾT QUẢ NGẮN */}
              {currentQ.type === 'SHORT_ANSWER' && (
                <div className="space-y-3 max-w-md">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nhập câu trả lời của bạn:
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={shortAnswers[currentQ.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShortAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
                    }}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD]"
                  />

                  {isSubmitted && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                      <div>
                        Đáp án chính xác:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {currentQ.shortAnswerCorrect}
                        </strong>
                      </div>
                      <div>
                        Câu trả lời của bạn:{' '}
                        <span className="font-mono">
                          {shortAnswers[currentQ.id] || '(Chưa điền)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LỜI GIẢI CHI TIẾT SAU KHI NỘP BÀI (RENDER KATEX SẮC NÉT) */}
            {isSubmitted && currentQ.explanation && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Lời giải phân tích câu biến thể:</span>
                </div>
                <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-400/30 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  <MathRenderer text={currentQ.explanation} />
                </div>
              </div>
            )}

            {/* THANH ĐIỀU HƯỚNG PREV / NEXT */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-xl text-xs font-semibold"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Câu trước
              </Button>

              <span className="text-xs text-slate-400 font-medium">
                {currentQIndex + 1} / {questions.length}
              </span>

              {currentQIndex < questions.length - 1 ? (
                <Button
                  type="button"
                  onClick={() =>
                    setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Câu tiếp theo
                </Button>
              ) : !isSubmitted ? (
                <Button
                  type="button"
                  onClick={() => setShowConfirmSubmit(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs"
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Nộp bài ngay
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => router.push('/student/practice')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  rightIcon={<Home className="w-3.5 h-3.5" />}
                >
                  Hoàn tất
                </Button>
              )}
            </div>
          </Card>
        )}
      </main>

      {/* MODAL XÁC NHẬN NỘP BÀI (KHI BỎ CUỘC HOẶC LÀM XONG) */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Xác nhận nộp bài khắc phục
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Bạn đã trả lời <strong className="text-[#00B8DD]">{answeredCount}</strong> trên tổng số{' '}
                <strong>{questions.length}</strong> câu hỏi biến thể.
              </p>
              {answeredCount < questions.length && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  💡 Bạn có thể dừng bài làm bất cứ lúc nào! Hệ thống sẽ chấm các câu bạn đã làm và mở đầy đủ lời giải chi tiết cho tất cả câu hỏi.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmSubmit(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Làm tiếp
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSubmitExam}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài ngay'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
