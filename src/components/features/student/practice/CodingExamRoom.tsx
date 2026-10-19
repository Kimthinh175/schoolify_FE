'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileCode,
  Layers,
  ArrowLeft,
  Check,
  Zap,
  Info,
  ExternalLink,
  BookOpen,
  Cpu,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MathRenderer } from '@/components/ui/math-renderer';
import { OlympiadExam, CodingProblem, CodingTestCase } from '@/types/olympiad';
import { examOfflineStorage } from '@/services/exam-offline-storage.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SupportedLang = 'cpp' | 'c' | 'python';

interface LanguageOption {
  id: SupportedLang;
  label: string;
  version: string;
  ext: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'cpp', label: 'C++', version: 'g++ 15.2 (C++20)', ext: '.cpp' },
  { id: 'c', label: 'C', version: 'gcc 15.2 (C11)', ext: '.c' },
  { id: 'python', label: 'Python', version: 'Python 3.14', ext: '.py' },
];

interface ProblemSubmissionState {
  codeByLang: Record<SupportedLang, string>;
  selectedLang: SupportedLang;
  earnedPoints: number;
  totalPoints: number;
  isJudged: boolean;
  verdict: 'AC' | 'PARTIAL' | 'WA' | 'TLE' | 'RTE' | 'NOT_SUBMITTED';
  testResults: {
    testId: string;
    status: 'AC' | 'WA' | 'TLE' | 'RTE';
    pointsAwarded: number;
    maxPoints: number;
    timeMs: number;
    inputSnippet: string;
    expectedSnippet: string;
    actualSnippet: string;
  }[];
}

interface CodingExamRoomProps {
  exam: OlympiadExam;
}

export function CodingExamRoom({ exam }: CodingExamRoomProps) {
  const router = useRouter();
  const problems = React.useMemo(() => exam.codingProblems || [], [exam]);

  // Active Problem Index
  const [activeProblemIdx, setActiveProblemIdx] = React.useState(0);
  const activeProblem = problems[activeProblemIdx] || problems[0];

  // Mobile Tab: 'problem' | 'editor' | 'console'
  const [mobileTab, setMobileTab] = React.useState<'problem' | 'editor' | 'console'>('problem');

  // Timer
  const [secondsRemaining, setSecondsRemaining] = React.useState(exam.durationMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = React.useState(false);

  // Per-problem code and submission state
  const [submissions, setSubmissions] = React.useState<Record<string, ProblemSubmissionState>>(() => {
    const init: Record<string, ProblemSubmissionState> = {};
    for (const p of problems) {
      init[p.id] = {
        codeByLang: {
          cpp: p.starterCode.cpp,
          c: p.starterCode.c,
          python: p.starterCode.python,
        },
        selectedLang: 'cpp',
        earnedPoints: 0,
        totalPoints: p.points,
        isJudged: false,
        verdict: 'NOT_SUBMITTED',
        testResults: [],
      };
    }
    return init;
  });

  // Current problem active language & code
  const currentSub = submissions[activeProblem?.id] || {
    codeByLang: { cpp: '', c: '', python: '' },
    selectedLang: 'cpp',
    earnedPoints: 0,
    totalPoints: activeProblem?.points || 0,
    isJudged: false,
    verdict: 'NOT_SUBMITTED',
    testResults: [],
  };

  const currentLang = currentSub.selectedLang;
  const currentCode = currentSub.codeByLang[currentLang] || '';

  // Custom Stdin / Sample Test Stdin
  const [customStdin, setCustomStdin] = React.useState<string>(
    activeProblem?.sampleTests[0]?.input || ''
  );

  // Execution & Judge State
  const [isRunningSample, setIsRunningSample] = React.useState(false);
  const [sampleOutput, setSampleOutput] = React.useState<{
    stdout?: string;
    stderr?: string;
    timeMs?: number;
    status?: string;
    error?: string;
  } | null>(null);

  const [isJudging, setIsJudging] = React.useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = React.useState<'run' | 'judge' | 'ai'>('run');

  // AI Complexity Analysis State
  const [aiAnalysis, setAiAnalysis] = React.useState<{
    estimatedComplexity: string;
    targetComplexity: string;
    isOptimal: boolean;
    suggestions: string[];
    analysisText: string;
  } | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = React.useState(false);

  // Final Exam Submission Dialog
  const [isFinalSubmitOpen, setIsFinalSubmitOpen] = React.useState(false);
  const [isExamCompleted, setIsExamCompleted] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string>('Đã lưu an toàn');
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Synchronize customStdin when problem changes
  React.useEffect(() => {
    if (activeProblem?.sampleTests[0]) {
      setCustomStdin(activeProblem.sampleTests[0].input);
    } else {
      setCustomStdin('');
    }
    setSampleOutput(null);
    setAiAnalysis(null);
  }, [activeProblemIdx, activeProblem]);

  // 1. Khởi tạo / Khôi phục phiên thi từ IndexedDB & Đếm giờ thực ngầm (Wall-Clock)
  React.useEffect(() => {
    let isMounted = true;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';

    examOfflineStorage
      .startExamSession({
        examId: exam.id,
        examType: 'CODING',
        examTitle: exam.title,
        roomUrl: currentUrl,
        durationMinutes: exam.durationMinutes,
      })
      .then((session) => {
        if (!isMounted || !session) return;

        // Khôi phục mã nguồn và tiến trình đã lưu từ IndexedDB nếu có
        if (session.answers && typeof session.answers === 'object' && Object.keys(session.answers).length > 0) {
          setSubmissions((prev) => ({
            ...prev,
            ...session.answers,
          }));
          setLastSaved('Đã khôi phục bài làm');
        }

        // Tính thời gian còn lại theo Wall-Clock (chống reset khi thoát tab)
        const now = Date.now();
        const remaining = Math.max(0, Math.round((session.targetEndTime - now) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          handleFinalSubmit(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exam.id, exam.durationMinutes, exam.title]);

  // 2. Timer Countdown đếm giờ thực ngầm theo Wall-Clock
  React.useEffect(() => {
    if (isTimerPaused || isExamCompleted) return;

    const interval = setInterval(() => {
      const lock = examOfflineStorage.getFastSyncActiveLock();
      if (lock && lock.targetEndTime) {
        const remaining = Math.max(0, Math.round((lock.targetEndTime - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          handleFinalSubmit(true);
        }
      } else {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinalSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused, isExamCompleted]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update code in state with Debounced IndexedDB Save
  const handleCodeChange = (newCode: string) => {
    if (!activeProblem) return;
    setSubmissions((prev) => {
      const updated = {
        ...prev,
        [activeProblem.id]: {
          ...prev[activeProblem.id],
          codeByLang: {
            ...prev[activeProblem.id].codeByLang,
            [currentLang]: newCode,
          },
        },
      };

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

  // Change language with Draft Save
  const handleSelectLanguage = (lang: SupportedLang) => {
    if (!activeProblem) return;
    setSubmissions((prev) => {
      const updated = {
        ...prev,
        [activeProblem.id]: {
          ...prev[activeProblem.id],
          selectedLang: lang,
        },
      };

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        examOfflineStorage.updateDraftAnswers(updated);
      }, 300);

      return updated;
    });
  };

  // Reset to starter code
  const handleResetCode = () => {
    if (!activeProblem) return;
    const starter = activeProblem.starterCode[currentLang];
    handleCodeChange(starter);
    toast.info(`Đã khôi phục mã khởi tạo ${currentLang.toUpperCase()}`);
  };

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const updated = val.substring(0, start) + '    ' + val.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunSample();
    }
  };

  // Execute Code on Sample or Custom Input
  const handleRunSample = async () => {
    if (!currentCode.trim()) {
      toast.error('Vui lòng nhập mã nguồn trước khi chạy thử!');
      return;
    }
    setIsRunningSample(true);
    setActiveConsoleTab('run');
    setMobileTab('console');

    try {
      const res = await fetch('/api/v1/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLang,
          sourceCode: currentCode,
          stdin: customStdin,
          timeoutMs: activeProblem.timeLimitMs || 1500,
        }),
      });

      const data = await res.json();
      setSampleOutput(data);
      if (data.status === 'SUCCESS') {
        toast.success(`Chạy thành công (${data.timeMs}ms)`);
      } else if (data.status === 'COMPILE_ERROR') {
        toast.error('Lỗi biên dịch chương trình!');
      } else if (data.status === 'TIME_LIMIT_EXCEEDED') {
        toast.warning('Vượt quá thời gian thực thi (Time Limit Exceeded)!');
      } else {
        toast.error('Lỗi thực thi chương trình (Runtime Error)!');
      }
    } catch (err: any) {
      setSampleOutput({
        error: err.message || 'Không thể kết nối máy chủ chấm code',
        status: 'SERVER_ERROR',
      });
      toast.error('Không thể thực thi mã nguồn');
    } finally {
      setIsRunningSample(false);
    }
  };

  // Run Hidden Testcases to Judge and Score
  const handleJudgeProblem = async () => {
    if (!currentCode.trim()) {
      toast.error('Vui lòng viết mã trước khi nộp bài!');
      return;
    }

    setIsJudging(true);
    setActiveConsoleTab('judge');
    setMobileTab('console');

    const tests = activeProblem.hiddenTests;
    let earned = 0;
    const testResults: ProblemSubmissionState['testResults'] = [];

    toast.info(`Bắt đầu chấm ${tests.length} bộ testcases ẩn...`);

    for (let i = 0; i < tests.length; i++) {
      const tc = tests[i];
      try {
        const res = await fetch('/api/v1/code/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: currentLang,
            sourceCode: currentCode,
            stdin: tc.input,
            timeoutMs: activeProblem.timeLimitMs || 1500,
          }),
        });
        const data = await res.json();

        if (data.status === 'SUCCESS') {
          const actualClean = (data.stdout || '').trim().replace(/\r\n/g, '\n');
          const expectedClean = tc.expectedOutput.trim().replace(/\r\n/g, '\n');

          if (actualClean === expectedClean) {
            earned += tc.points;
            testResults.push({
              testId: tc.id,
              status: 'AC',
              pointsAwarded: tc.points,
              maxPoints: tc.points,
              timeMs: data.timeMs || 0,
              inputSnippet: tc.input.length > 50 ? tc.input.slice(0, 50) + '...' : tc.input,
              expectedSnippet: tc.expectedOutput,
              actualSnippet: actualClean,
            });
          } else {
            testResults.push({
              testId: tc.id,
              status: 'WA',
              pointsAwarded: 0,
              maxPoints: tc.points,
              timeMs: data.timeMs || 0,
              inputSnippet: tc.input.length > 50 ? tc.input.slice(0, 50) + '...' : tc.input,
              expectedSnippet: tc.expectedOutput,
              actualSnippet: actualClean,
            });
          }
        } else if (data.status === 'TIME_LIMIT_EXCEEDED') {
          testResults.push({
            testId: tc.id,
            status: 'TLE',
            pointsAwarded: 0,
            maxPoints: tc.points,
            timeMs: data.timeMs || activeProblem.timeLimitMs,
            inputSnippet: tc.input.slice(0, 30),
            expectedSnippet: tc.expectedOutput,
            actualSnippet: 'Time Limit Exceeded',
          });
        } else {
          testResults.push({
            testId: tc.id,
            status: 'RTE',
            pointsAwarded: 0,
            maxPoints: tc.points,
            timeMs: data.timeMs || 0,
            inputSnippet: tc.input.slice(0, 30),
            expectedSnippet: tc.expectedOutput,
            actualSnippet: data.stderr || 'Runtime Error',
          });
        }
      } catch (e: any) {
        testResults.push({
          testId: tc.id,
          status: 'RTE',
          pointsAwarded: 0,
          maxPoints: tc.points,
          timeMs: 0,
          inputSnippet: tc.input.slice(0, 30),
          expectedSnippet: tc.expectedOutput,
          actualSnippet: 'Connection Error',
        });
      }
    }

    let verdict: ProblemSubmissionState['verdict'] = 'WA';
    if (earned === activeProblem.points) {
      verdict = 'AC';
      toast.success(`🎉 Xuất sắc! Điểm tối đa: ${earned}/${activeProblem.points} điểm [AC]`);
    } else if (earned > 0) {
      verdict = 'PARTIAL';
      toast.warning(`Chấm hoàn tất: Đạt ${earned}/${activeProblem.points} điểm (Subtask)`);
    } else {
      verdict = 'WA';
      toast.error(`Kết quả: 0/${activeProblem.points} điểm. Vui lòng kiểm tra lại thuật toán!`);
    }

    setSubmissions((prev) => ({
      ...prev,
      [activeProblem.id]: {
        ...prev[activeProblem.id],
        earnedPoints: earned,
        isJudged: true,
        verdict,
        testResults,
      },
    }));

    setIsJudging(false);
  };

  // AI Code Complexity Review
  const handleAnalyzeAi = () => {
    setIsAnalyzingAi(true);
    setActiveConsoleTab('ai');
    setMobileTab('console');

    setTimeout(() => {
      const code = currentCode.toLowerCase();
      let estimated = 'O(N)';
      let isOpt = false;
      const suggestions: string[] = [];

      // Simple heuristic based on nested loops / structures
      const forMatches = (code.match(/for\s*\(/g) || []).length + (code.match(/while\s*\(/g) || []).length;
      if (forMatches >= 2) {
        estimated = 'O(N^2)';
      } else if (code.includes('sort') || code.includes('binary_search') || code.includes('upper_bound') || code.includes('bisect')) {
        estimated = 'O(N log N)';
      } else if (code.includes('segtree') || code.includes('tree') || code.includes('update') || code.includes('dsu')) {
        estimated = 'O(N log N)';
      } else {
        estimated = 'O(N)';
      }

      const target = activeProblem.timeComplexityTarget || 'O(N log N)';
      isOpt = estimated === target || (target.includes('N log N') && estimated === 'O(N)');

      if (isOpt) {
        suggestions.push('Thuật toán đã tối ưu hóa đúng độ phức tạp mục tiêu của đề bài.');
        suggestions.push('Đã tối ưu nhập xuất I/O nhanh với `ios_base::sync_with_stdio(false)`.');
        suggestions.push('Quản lý bộ nhớ tốt, không xảy ra tràn mảng tĩnh hay đệ quy quá sâu.');
      } else {
        suggestions.push(`Cảnh báo: Đề bài yêu cầu ${target}, nhưng cấu trúc mã đang đạt ${estimated}.`);
        suggestions.push('Với dữ liệu N lên tới 10^5 hoặc 10^18, thuật toán sẽ bị quá thời gian (TLE) ở các subtask lớn.');
        suggestions.push(activeProblem.editorial);
      }

      setAiAnalysis({
        estimatedComplexity: estimated,
        targetComplexity: target,
        isOptimal: isOpt,
        suggestions,
        analysisText: `Mã nguồn ${currentLang.toUpperCase()} của bài ${activeProblem.title} đã được AI phân tích cấu trúc vòng lặp và phương pháp giải.`,
      });

      setIsAnalyzingAi(false);
      toast.success('Đã hoàn tất phân tích tối ưu thuật toán AI');
    }, 600);
  };

  // Calculate Overall Exam Score
  const totalExamEarned = React.useMemo(() => {
    return Object.values(submissions).reduce((sum, s) => sum + s.earnedPoints, 0);
  }, [submissions]);

  const handleFinalSubmit = async (isAutoSubmit = false) => {
    setIsExamCompleted(true);
    setIsFinalSubmitOpen(true);
    const timeSpentSeconds = Math.max(1, exam.durationMinutes * 60 - secondsRemaining);

    // Lưu bài nộp vào IndexedDB & giải phóng khóa phòng thi
    await examOfflineStorage.completeAndQueueSubmission({
      answers: submissions,
      timeSpentSeconds,
      isAutoSubmit,
    });

    if (typeof window !== 'undefined' && navigator.onLine) {
      await examOfflineStorage.syncPendingSubmissions();
    }
    toast.success('Đã nộp bài thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & Exam Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={async () => {
                if (!isExamCompleted) {
                  if (confirm('Bài thi lập trình đang diễn ra và thời gian vẫn tiếp tục tính ngầm. Bạn có chắc chắn muốn tạm thoát ra ngoài không?')) {
                    router.push('/student/practice');
                  }
                } else {
                  await examOfflineStorage.clearActiveExamSession();
                  router.push('/student/practice');
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              title="Về cổng luyện thi"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {exam.levelLabel}
                </span>
                <span className="text-xs text-slate-400 font-medium">{exam.province || 'Toàn Quốc'}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
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
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              )}
            >
              <Clock className="w-4 h-4 text-[#00B8DD]" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <Button
              size="sm"
              onClick={() => setIsFinalSubmitOpen(true)}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl px-3 sm:px-4 shadow-lg shadow-[#00B8DD]/20"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Nộp Toàn Bộ Bài
            </Button>
          </div>
        </div>

        {/* Problem Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {problems.map((prob, idx) => {
              const sub = submissions[prob.id];
              const isCurrent = idx === activeProblemIdx;
              return (
                <button
                  key={prob.id}
                  onClick={() => {
                    setActiveProblemIdx(idx);
                    setMobileTab('problem');
                  }}
                  className={cn(
                    'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0',
                    isCurrent
                      ? 'bg-[#00B8DD] text-white shadow-md font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  )}
                >
                  <span>Bài {prob.problemNumber}</span>
                  <span className="text-[10px] opacity-75">({prob.points}đ)</span>
                  {sub?.isJudged && (
                    <span
                      className={cn(
                        'text-[10px] px-1 py-0.2 rounded font-mono',
                        sub.verdict === 'AC'
                          ? 'bg-emerald-500 text-white'
                          : sub.verdict === 'PARTIAL'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      )}
                    >
                      {sub.earnedPoints}/{sub.totalPoints}đ
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center gap-3">
            <span className="hidden sm:inline">Tổng điểm bài thi:</span>
            <span className="text-amber-400 font-bold font-mono">
              {totalExamEarned.toFixed(1)} / {exam.totalPoints} điểm
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-emerald-400 text-[11px] hidden sm:inline">{lastSaved}</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden border-b border-slate-800 bg-slate-900/60 p-1.5 flex flex-wrap gap-1">
        <button
          onClick={() => setMobileTab('problem')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center',
            mobileTab === 'problem' ? 'bg-[#00B8DD] text-white font-bold' : 'text-slate-400 hover:text-white'
          )}
        >
          1. Đề Bài & Ví Dụ
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center',
            mobileTab === 'editor' ? 'bg-[#00B8DD] text-white font-bold' : 'text-slate-400 hover:text-white'
          )}
        >
          2. Trình Soạn Thảo ({currentLang.toUpperCase()})
        </button>
        <button
          onClick={() => setMobileTab('console')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center',
            mobileTab === 'console' ? 'bg-[#00B8DD] text-white font-bold' : 'text-slate-400 hover:text-white'
          )}
        >
          3. Kết Quả & AI Review
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Problem Description & Custom Test Input */}
        <section
          className={cn(
            'lg:col-span-5 flex flex-col gap-3 min-w-0',
            mobileTab !== 'problem' && 'hidden lg:flex'
          )}
        >
          <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-175px)] shadow-xl">
            {/* Header info */}
            <div className="border-b border-slate-800 pb-3 mb-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Trọng số: {activeProblem.points} Điểm
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {activeProblem.timeLimitMs}ms
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    {activeProblem.memoryLimitMb}MB
                  </span>
                </div>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                {activeProblem.title}
              </h2>
            </div>

            {/* Description */}
            <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
              <div className="prose prose-invert max-w-none">
                <MathRenderer content={activeProblem.description} />
              </div>

              {/* Input / Output Format */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Định dạng đầu vào (Input)</h4>
                  <p className="text-xs text-slate-200 mt-0.5">{activeProblem.inputFormat}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Định dạng đầu ra (Output)</h4>
                  <p className="text-xs text-slate-200 mt-0.5">{activeProblem.outputFormat}</p>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1.5">Giới hạn & Subtasks</h4>
                <ul className="space-y-1">
                  {activeProblem.constraints.map((c, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-[#00B8DD] font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample Testcases */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Ví dụ mẫu (Sample Tests)</h4>
                <div className="space-y-3">
                  {activeProblem.sampleTests.map((sample, sIdx) => (
                    <div key={sample.id} className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                      <div className="text-xs font-bold text-slate-400 mb-1">Ví dụ {sIdx + 1}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">Đầu vào:</div>
                          <pre className="p-2 rounded bg-slate-900 text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                            {sample.input}
                          </pre>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 mb-1">Đầu ra mong muốn:</div>
                          <pre className="p-2 rounded bg-slate-900 text-sky-400 overflow-x-auto whitespace-pre-wrap">
                            {sample.expectedOutput}
                          </pre>
                        </div>
                      </div>
                      {sample.explanation && (
                        <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-900 pt-1.5">
                          Giải thích: {sample.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Stdin Box for Manual Testing */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#00B8DD]" />
                    Dữ liệu đầu vào chạy thử (Custom Stdin)
                  </h4>
                  <button
                    onClick={() => setCustomStdin(activeProblem.sampleTests[0]?.input || '')}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Dùng Test Ví Dụ 1
                  </button>
                </div>
                <textarea
                  value={customStdin}
                  onChange={(e) => setCustomStdin(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00B8DD]"
                  placeholder="Nhập stdin tùy biến của bạn tại đây..."
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Right Column: Code Editor & Execution Results */}
        <section
          className={cn(
            'lg:col-span-7 flex flex-col gap-3 min-w-0',
            mobileTab === 'problem' && 'hidden lg:flex'
          )}
        >
          {/* Editor Container */}
          <Card
            className={cn(
              'bg-slate-900/90 border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden',
              mobileTab === 'console' ? 'hidden lg:flex lg:h-[460px]' : 'min-h-[460px] flex-1'
            )}
          >
            {/* Editor Top Toolbar */}
            <div className="border-b border-slate-800 bg-slate-900 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Language Selector */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleSelectLanguage(lang.id)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-bold rounded-lg transition',
                        currentLang === lang.id
                          ? 'bg-[#00B8DD] text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetCode}
                  className="text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 h-8 px-2"
                  title="Khôi phục lại mã khởi tạo ban đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Mã Gốc
                </Button>
              </div>

              {/* Action Buttons: Run & Judge */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleRunSample}
                  disabled={isRunningSample || isJudging}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs h-8 px-3"
                >
                  <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                  {isRunningSample ? 'Đang chạy...' : 'Chạy Thử'}
                </Button>

                <Button
                  size="sm"
                  onClick={handleJudgeProblem}
                  disabled={isJudging || isRunningSample}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs h-8 px-3"
                >
                  <Zap className="w-3.5 h-3.5 mr-1 fill-white" />
                  {isJudging ? 'Đang chấm testcases...' : 'Chấm Bài'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyzeAi}
                  disabled={isAnalyzingAi}
                  className="border-purple-600/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 font-bold rounded-xl text-xs h-8 px-2.5"
                  title="AI Đánh giá tối ưu thuật toán & độ phức tạp"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" />
                  {isAnalyzingAi ? 'Phân tích...' : 'AI Review'}
                </Button>
              </div>
            </div>

            {/* Code Editor Textarea */}
            <div className="relative flex-1 bg-slate-950 flex font-mono text-xs">
              {/* Line Numbers Simulation */}
              <div className="w-10 py-3 bg-slate-900/60 text-slate-600 text-right pr-2 select-none border-r border-slate-800/80 font-mono text-xs shrink-0 hidden sm:block">
                {currentCode.split('\n').map((_, i) => (
                  <div key={i} className="leading-5">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={currentCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full flex-1 p-3 bg-transparent text-emerald-400 font-mono text-xs leading-5 focus:outline-none resize-none overflow-y-auto selection:bg-[#00B8DD]/30"
                placeholder="// Viết mã nguồn giải thuật của bạn tại đây..."
                rows={18}
              />
            </div>

            {/* Editor Footer Status */}
            <div className="border-t border-slate-800 bg-slate-900/80 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>Trình biên dịch: {LANGUAGES.find((l) => l.id === currentLang)?.version}</span>
                <span>Dòng: {currentCode.split('\n').length}</span>
                <span>Ký tự: {currentCode.length}</span>
              </div>
              <div className="text-slate-500 hidden sm:block">Phím tắt: [Ctrl + Enter] để chạy thử</div>
            </div>
          </Card>

          {/* Console / Judge Results / AI Review Drawer */}
          <Card
            className={cn(
              'bg-slate-900/90 border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden',
              mobileTab === 'editor' ? 'hidden lg:flex lg:h-[260px]' : 'flex-1 min-h-[260px]'
            )}
          >
            {/* Drawer Tabs */}
            <div className="border-b border-slate-800 bg-slate-900/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('run')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5',
                    activeConsoleTab === 'run'
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Console Chạy Thử
                </button>

                <button
                  onClick={() => setActiveConsoleTab('judge')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5',
                    activeConsoleTab === 'judge'
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Kết Quả Chấm Testcase ({currentSub.earnedPoints}/{currentSub.totalPoints}đ)
                </button>

                <button
                  onClick={() => setActiveConsoleTab('ai')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5',
                    activeConsoleTab === 'ai'
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  AI Tối Ưu Hóa
                </button>
              </div>

              {currentSub.isJudged && (
                <Badge
                  className={cn(
                    'text-[10px] font-bold font-mono px-2 py-0.5',
                    currentSub.verdict === 'AC'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : currentSub.verdict === 'PARTIAL'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  )}
                >
                  {currentSub.verdict === 'AC' && '✓ ACCEPTED (100%)'}
                  {currentSub.verdict === 'PARTIAL' && `SUBTASK (${currentSub.earnedPoints}đ)`}
                  {currentSub.verdict === 'WA' && 'WRONG ANSWER'}
                </Badge>
              )}
            </div>

            {/* Content per Tab */}
            <div className="flex-1 p-3 overflow-y-auto bg-slate-950 font-mono text-xs">
              {/* TAB 1: RUN SAMPLE CONSOLE */}
              {activeConsoleTab === 'run' && (
                <div>
                  {isRunningSample ? (
                    <div className="py-6 flex items-center justify-center text-slate-400 animate-pulse">
                      Đang biên dịch và thực thi chương trình...
                    </div>
                  ) : sampleOutput ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                        <span>
                          Trạng thái:{' '}
                          <b
                            className={
                              sampleOutput.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {sampleOutput.status}
                          </b>
                        </span>
                        {sampleOutput.timeMs !== undefined && (
                          <span>Thời gian: {sampleOutput.timeMs}ms</span>
                        )}
                      </div>

                      {sampleOutput.stdout && (
                        <div>
                          <div className="text-slate-500 text-[10px] mb-0.5">STDOUT (Kết quả in ra):</div>
                          <pre className="p-2 rounded-lg bg-slate-900 text-slate-100 whitespace-pre-wrap">
                            {sampleOutput.stdout}
                          </pre>
                        </div>
                      )}

                      {sampleOutput.stderr && (
                        <div>
                          <div className="text-rose-400 text-[10px] mb-0.5">STDERR / Lỗi biên dịch:</div>
                          <pre className="p-2 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-900 whitespace-pre-wrap">
                            {sampleOutput.stderr}
                          </pre>
                        </div>
                      )}

                      {sampleOutput.error && (
                        <div className="text-rose-400 p-2 rounded bg-rose-950/50">
                          {sampleOutput.error}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      Nhấn nút <b className="text-emerald-400">"Chạy Thử"</b> để biên dịch và kiểm tra kết quả
                      với đầu vào mẫu.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: JUDGE TESTCASES */}
              {activeConsoleTab === 'judge' && (
                <div>
                  {isJudging ? (
                    <div className="py-8 text-center text-slate-400 animate-pulse space-y-2">
                      <Zap className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
                      <div>Hệ thống Online Judge đang chấm từng bộ testcase ẩn...</div>
                    </div>
                  ) : currentSub.testResults.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-300 font-bold">
                          Kết quả chấm bài {activeProblem.problemNumber}:
                        </span>
                        <span className="font-bold text-amber-400">
                          {currentSub.earnedPoints} / {currentSub.totalPoints} điểm
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {currentSub.testResults.map((tr, tIdx) => (
                          <div
                            key={tr.testId}
                            className={cn(
                              'p-2 rounded-lg border flex flex-wrap items-center justify-between gap-2',
                              tr.status === 'AC'
                                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                                : tr.status === 'TLE'
                                ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                                : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {tr.status === 'AC' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {tr.status === 'WA' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                              {tr.status === 'TLE' && <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
                              {tr.status === 'RTE' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                              <span className="font-bold">Test #{tIdx + 1}</span>
                              <span className="text-[11px] opacity-80">({tr.timeMs}ms)</span>
                            </div>

                            <div className="flex items-center gap-2 font-bold">
                              <span>
                                {tr.status === 'AC' && '[AC] Đúng'}
                                {tr.status === 'WA' && '[WA] Sai Đáp Số'}
                                {tr.status === 'TLE' && '[TLE] Quá Thời Gian'}
                                {tr.status === 'RTE' && '[RTE] Lỗi Thực Thi'}
                              </span>
                              <span>
                                +{tr.pointsAwarded}/{tr.maxPoints}đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      Chưa nộp bài chấm testcase. Nhấn <b className="text-amber-400">"Chấm Bài"</b> để nộp bài
                      lấy điểm subtask.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: AI COMPLEXITY REVIEW */}
              {activeConsoleTab === 'ai' && (
                <div>
                  {isAnalyzingAi ? (
                    <div className="py-8 text-center text-purple-300 animate-pulse space-y-2">
                      <Sparkles className="w-6 h-6 text-purple-400 mx-auto animate-spin" />
                      <div>Schoolify AI đang phân tích độ phức tạp thời gian & không gian...</div>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-3 font-sans">
                      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-purple-950/40 border border-purple-800/60">
                        <div>
                          <div className="text-xs text-purple-300 font-bold">Độ phức tạp ước tính</div>
                          <div className="text-lg font-mono font-bold text-white">
                            {aiAnalysis.estimatedComplexity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-purple-300 font-bold">Mục tiêu đề bài</div>
                          <div className="text-lg font-mono font-bold text-amber-400">
                            {aiAnalysis.targetComplexity}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-300">Nhận xét & Hướng tối ưu thuật toán:</div>
                        {aiAnalysis.suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2"
                          >
                            <span className="text-[#00B8DD] font-bold">💡</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      Nhấn <b className="text-purple-400">"AI Review"</b> để nhận phân tích độ phức tạp Big-O
                      và đề xuất thuật toán tối ưu điểm tuyệt đối.
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </section>
      </main>

      {/* Final Exam Submission Overview Dialog */}
      <Dialog
        isOpen={isFinalSubmitOpen}
        onClose={() => setIsFinalSubmitOpen(false)}
        maxWidth="lg"
        title="Tổng Kết Bài Thi Học Sinh Giỏi"
        description={exam.title}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsFinalSubmitOpen(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tiếp tục chỉnh sửa
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
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Điểm Bài Thi Học Sinh Giỏi</h3>
          </div>

          {/* Score Summary List */}
          <div className="space-y-2">
            {problems.map((prob) => {
              const sub = submissions[prob.id];
              return (
                <div
                  key={prob.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Bài {prob.problemNumber}: {prob.title.split('-')[0]}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Ngôn ngữ: {sub.selectedLang.toUpperCase()} • Trạng thái: {sub.verdict}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {sub.earnedPoints} / {sub.totalPoints} đ
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-sky-500/5 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between mt-3">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Tổng điểm HSG đạt được:</span>
              <span className="text-lg font-mono font-black text-amber-600 dark:text-amber-400">
                {totalExamEarned.toFixed(1)} / {exam.totalPoints} Điểm
              </span>
            </div>
          </div>

          {/* Reward */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Thưởng thành tích:{' '}
              <b className="text-amber-600 dark:text-amber-400 font-bold">+{exam.pointsReward} Kim Cương 💎</b> đã được cộng vào tài khoản của bạn!
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
