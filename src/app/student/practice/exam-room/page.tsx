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
  CheckCircle,
  Target,
  Calculator,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getPracticeExam,
  PracticeExamPackage,
  ExamQuestion,
  ExamFormat,
  QuestionDifficulty,
} from '@/services/mock/practice-flow-data';
import { PracticeLevel } from '@/types/subject';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { MathEssayEditor } from '@/components/ui/math-editor';
import { MathRenderer } from '@/components/ui/math-renderer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Navbar } from '@/components/layout/Navbar';
import { ReportQuestionModal } from '@/components/features/student/practice/ReportQuestionModal';
import { generateRemediationExamPackage } from '@/services/remediation-engine.service';
import { examSnapshotService, ExamSnapshot, generateAttemptToken } from '@/services/exam-snapshot.service';
import { ExamSnapshotModal } from '@/components/features/student/practice/ExamSnapshotModal';
import { CodingExamRoom } from '@/components/features/student/practice/CodingExamRoom';
import { OlympiadEssayExamRoom } from '@/components/features/student/practice/OlympiadEssayExamRoom';
import { getOlympiadExamById, getOlympiadExamsBySubject } from '@/services/mock/olympiad-exams';
import { examOfflineStorage } from '@/services/exam-offline-storage.service';
import { examPointsService } from '@/services/exam-points.service';
import { toast } from 'sonner';

function renderDifficultyBadge(difficulty?: QuestionDifficulty, isDark = false) {
  switch (difficulty) {
    case 'EASY':
      return (
        <span
          className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60"
        >
          Nhận biết<span className="hidden sm:inline"> (Dễ)</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60"
        >
          Thông hiểu<span className="hidden sm:inline"> (TB)</span>
        </span>
      );
    case 'HARD':
      return (
        <span
          className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
        >
          Vận dụng<span className="hidden sm:inline"> (Khó)</span>
        </span>
      );
    case 'VERY_HARD':
      return (
        <span
          className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60"
        >
          Vận dụng cao
        </span>
      );
    default:
      return null;
  }
}

function renderPreviousChapterBadge(q: ExamQuestion, isDark = false) {
  if (!q.isPreviousChapterReview) return null;
  const relCh = q.relatedChapterIds?.[0] || (q.chapterId > 1 ? q.chapterId - 1 : 1);
  return (
    <span
      className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/60"
    >
      <RotateCcw className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
      <span className="hidden sm:inline">Ôn tập </span>C.{relCh}
    </span>
  );
}

function StandardExamRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const subjectSlug = searchParams.get('subject') || 'toan-hoc';
  const levelParam = (searchParams.get('level') || 'basic').toUpperCase() as PracticeLevel;

  const gradeParam = Number(searchParams.get('grade') || '12');
  const chapterParam = Number(searchParams.get('chapter') || '1');
  const formatParam = (searchParams.get('format') || 'quiz').toUpperCase() as ExamFormat;
  const countParam = searchParams.get('count') ? Number(searchParams.get('count')) : undefined;
  const durationParam = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined;
  const quizCountParam = searchParams.get('quizCount') ? Number(searchParams.get('quizCount')) : undefined;
  const essayCountParam = searchParams.get('essayCount') ? Number(searchParams.get('essayCount')) : undefined;
  const modeParam = searchParams.get('mode') || '';
  const isAssessment = levelParam === 'ASSESSMENT' || modeParam === 'diagnostic';

  const computedExamId = `exam-${subjectSlug}-${levelParam.toLowerCase()}-g${gradeParam}-ch${chapterParam}-${formatParam.toLowerCase()}`;

  // Load Exam Package with persistence (chống đổi/đảo câu hỏi khi reload hoặc rời phòng thi)
  const [exam, setExam] = React.useState<PracticeExamPackage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const lock = examOfflineStorage.getFastSyncActiveLock();
        // Nếu đang có phiên thi dở của đề này, ưu tiên lấy đề đã lưu trong localStorage
        if (lock && lock.isActive && lock.examId === computedExamId) {
          const cachedRaw = localStorage.getItem(`schoolify_pkg_${computedExamId}`);
          if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw);
            if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              return parsed;
            }
          }
        }
      } catch (err) {
        console.error('Lỗi đọc examPackage từ cache:', err);
      }
    }
    const fresh = getPracticeExam(subjectSlug, levelParam, gradeParam, chapterParam, formatParam, {
      requestedCount: countParam,
      quizCount: quizCountParam,
      essayCount: essayCountParam,
      durationMinutes: durationParam,
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`schoolify_pkg_${computedExamId}`, JSON.stringify(fresh));
      } catch {}
    }
    return fresh;
  });

  // Đồng bộ đề thi khi đổi param URL (nếu có chuyển đề)
  React.useEffect(() => {
    if (exam.id !== computedExamId) {
      let restored: PracticeExamPackage | null = null;
      if (typeof window !== 'undefined') {
        try {
          const lock = examOfflineStorage.getFastSyncActiveLock();
          if (lock && lock.isActive && lock.examId === computedExamId) {
            const cachedRaw = localStorage.getItem(`schoolify_pkg_${computedExamId}`);
            if (cachedRaw) {
              const parsed = JSON.parse(cachedRaw);
              if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                restored = parsed;
              }
            }
          }
        } catch {}
      }
      if (restored) {
        setExam(restored);
      } else {
        const fresh = getPracticeExam(subjectSlug, levelParam, gradeParam, chapterParam, formatParam, {
          requestedCount: countParam,
          quizCount: quizCountParam,
          essayCount: essayCountParam,
          durationMinutes: durationParam,
        });
        setExam(fresh);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`schoolify_pkg_${computedExamId}`, JSON.stringify(fresh));
          } catch {}
        }
      }
    }
  }, [computedExamId, subjectSlug, levelParam, gradeParam, chapterParam, formatParam, countParam, quizCountParam, essayCountParam, durationParam]);

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
  const [lastSaved, setLastSaved] = React.useState<string>('Đã lưu an toàn');
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const answersDraftRef = React.useRef({
    multipleChoices: {} as Record<string, 'A' | 'B' | 'C' | 'D'>,
    trueFalseAnswers: {} as Record<string, Record<string, boolean>>,
    shortAnswers: {} as Record<string, string>,
    essayAnswers: {} as Record<string, string>,
    flaggedIds: {} as Record<string, boolean>,
  });

  React.useEffect(() => {
    answersDraftRef.current = {
      multipleChoices,
      trueFalseAnswers,
      shortAnswers,
      essayAnswers,
      flaggedIds,
    };
  }, [multipleChoices, trueFalseAnswers, shortAnswers, essayAnswers, flaggedIds]);

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
      const scrollContainer = document.getElementById('exam-main-scroll');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const pill = document.getElementById(`top-question-pill-${globalIdx}`);
      if (pill) {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 40);
  };

  // Auto-scroll pill into view and reset scroll on question change
  React.useEffect(() => {
    const pill = document.getElementById(`top-question-pill-${activeQuestionIdx}`);
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    const scrollContainer = document.getElementById('exam-main-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeQuestionIdx]);

  // Keyboard navigation with ArrowLeft / ArrowRight
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      if (e.key === 'ArrowLeft') {
        if (activeQuestionIdx > 0) {
          e.preventDefault();
          const prevIdx = activeQuestionIdx - 1;
          handleJumpToQuestion(exam.questions[prevIdx], prevIdx);
        }
      } else if (e.key === 'ArrowRight') {
        if (activeQuestionIdx < exam.questions.length - 1) {
          e.preventDefault();
          const nextIdx = activeQuestionIdx + 1;
          handleJumpToQuestion(exam.questions[nextIdx], nextIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestionIdx, exam.questions]);

  // Submission & Confirmation modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [activeReviewFilter, setActiveReviewFilter] = React.useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');
  const [reportingQuestion, setReportingQuestion] = React.useState<ExamQuestion | null>(null);

  // Remediation & Snapshot states
  const [showRemediationMode, setShowRemediationMode] = React.useState(false);
  const [isGeneratingRemediation, setIsGeneratingRemediation] = React.useState(false);
  const [remediationGenStep, setRemediationGenStep] = React.useState('');
  const [isTakingRemediation, setIsTakingRemediation] = React.useState(false);
  const [remediationExam, setRemediationExam] = React.useState<PracticeExamPackage | null>(null);
  const [remediationChoices, setRemediationChoices] = React.useState<Record<string, string>>({});
  const [remediationTrueFalse, setRemediationTrueFalse] = React.useState<Record<string, Record<string, boolean>>>({});
  const [remediationShortAnswers, setRemediationShortAnswers] = React.useState<Record<string, string>>({});
  const [remediationSubmitted, setRemediationSubmitted] = React.useState(false);
  const [remediationResult, setRemediationResult] = React.useState<{
    score: number;
    maxScore: number;
    correctCount: number;
    wrongCount: number;
    questionResults: {
      question: ExamQuestion;
      isCorrect: boolean;
      earnedScore: number;
    }[];
  } | null>(null);
  const [currentSnapshotId, setCurrentSnapshotId] = React.useState<string | null>(null);
  const attemptTokenParam = searchParams.get('attemptToken') || searchParams.get('token');
  const [currentAttemptToken, setCurrentAttemptToken] = React.useState<string | null>(attemptTokenParam || null);
  const [isRestoringResult, setIsRestoringResult] = React.useState(!!attemptTokenParam);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = React.useState(false);
  const [viewingSnapshot, setViewingSnapshot] = React.useState<ExamSnapshot | null>(null);

  // Khôi phục kết quả bài thi từ attemptToken bảo mật (hỗ trợ F5 giữ nguyên kết quả & kiểm tra quyền truy cập)
  React.useEffect(() => {
    if (!attemptTokenParam) return;

    let isMounted = true;
    setIsRestoringResult(true);

    examSnapshotService
      .getExamSnapshotByToken(attemptTokenParam)
      .then((snap) => {
        if (!isMounted) return;
        setIsRestoringResult(false);

        if (!snap) {
          toast.error('Không tìm thấy kết quả bài thi hoặc mã truy cập không hợp lệ.');
          return;
        }

        // Kiểm tra phân quyền truy cập (Chống IDOR: chỉ chủ sở hữu hoặc giáo viên/admin mới xem được)
        const hasAccess = examSnapshotService.canUserAccessSnapshot(
          snap,
          user?.id,
          user?.role
        );

        if (!hasAccess) {
          setAccessDenied(true);
          return;
        }

        // Nạp lại cấu hình đề thi và toàn bộ câu trả lời từ snapshot
        setExam({
          id: snap.examId,
          title: snap.examTitle,
          subjectSlug: snap.subjectSlug,
          subjectName: snap.subjectName,
          grade: snap.grade,
          chapterId: snap.chapterId,
          chapterName: snap.chapterName,
          durationMinutes: snap.durationMinutes,
          totalPoints: snap.originalExam.maxScore || 10,
          questions: snap.originalExam.questions,
          level: 'BASIC',
          format: 'QUIZ',
        });
        setMultipleChoices(
          (snap.originalExam.studentAnswers.multipleChoices as any) || {}
        );
        setTrueFalseAnswers(
          snap.originalExam.studentAnswers.trueFalseAnswers || {}
        );
        setShortAnswers(snap.originalExam.studentAnswers.shortAnswers || {});
        setEssayAnswers(snap.originalExam.studentAnswers.essayAnswers || {});
        setSecondsElapsed(snap.timeSpentSeconds || 0);
        setCurrentSnapshotId(snap.id);
        setCurrentAttemptToken(snap.attemptToken || attemptTokenParam);
        setIsSubmitted(true);
      })
      .catch((err) => {
        if (isMounted) {
          setIsRestoringResult(false);
          console.error('Lỗi khi nạp snapshot theo token:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [attemptTokenParam, user?.id, user?.role]);

  // 1. Khởi tạo / Khôi phục phiên thi từ IndexedDB & Đếm giờ thực ngầm (Wall-Clock)
  React.useEffect(() => {
    if (attemptTokenParam || isSubmitted) return; // Nếu đang ở chế độ xem kết quả hoặc đã nộp bài thì không mở phiên thi mới!
    let isMounted = true;
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';

    examOfflineStorage
      .startExamSession({
        examId: exam.id,
        examType: 'STANDARD',
        examTitle: exam.title,
        roomUrl: currentUrl,
        durationMinutes: exam.durationMinutes,
        examPackage: exam,
      })
      .then((session) => {
        if (!isMounted || !session) return;

        // Khôi phục bộ câu hỏi đã lưu từ phiên thi (chống đổi/đảo câu khi reload)
        if (session.examPackage && Array.isArray(session.examPackage.questions) && session.examPackage.questions.length > 0) {
          setExam(session.examPackage);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`schoolify_pkg_${session.examId}`, JSON.stringify(session.examPackage));
            } catch {}
          }
        }

        // Khôi phục câu trả lời đã lưu từ IndexedDB nếu có
        if (session.answers && typeof session.answers === 'object') {
          const ans = session.answers as any;
          if (ans.multipleChoices && Object.keys(ans.multipleChoices).length > 0) {
            setMultipleChoices(ans.multipleChoices);
          }
          if (ans.trueFalseAnswers && Object.keys(ans.trueFalseAnswers).length > 0) {
            setTrueFalseAnswers(ans.trueFalseAnswers);
          }
          if (ans.shortAnswers && Object.keys(ans.shortAnswers).length > 0) {
            setShortAnswers(ans.shortAnswers);
          }
          if (ans.essayAnswers && Object.keys(ans.essayAnswers).length > 0) {
            setEssayAnswers(ans.essayAnswers);
          }
          if (ans.flaggedIds && Object.keys(ans.flaggedIds).length > 0) {
            setFlaggedIds(ans.flaggedIds);
          }
          setLastSaved('Đã khôi phục bài làm');
        }

        // Tính thời gian còn lại theo Wall-Clock (chống reset khi thoát tab)
        const now = Date.now();
        const remaining = Math.max(0, Math.round((session.targetEndTime - now) / 1000));
        setSecondsRemaining(remaining);
        setSecondsElapsed(Math.max(0, totalLimitSeconds - remaining));

        if (remaining <= 0) {
          handleSubmitExam(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exam.id, exam.durationMinutes, exam.title, totalLimitSeconds]);

  // Submit Exam Handler với Offline Queue & Auto-Sync
  const handleSubmitExam = async (isAutoSubmit = false) => {
    setIsSubmitted(true);
    setIsSubmitModalOpen(false);
    await examOfflineStorage.clearActiveExamSession();

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`schoolify_pkg_${exam.id}`);
      } catch {}
    }

    const timeSpent = Math.max(1, totalLimitSeconds - secondsRemaining);
    const answersPayload = {
      multipleChoices: answersDraftRef.current.multipleChoices,
      trueFalseAnswers: answersDraftRef.current.trueFalseAnswers,
      shortAnswers: answersDraftRef.current.shortAnswers,
      essayAnswers: answersDraftRef.current.essayAnswers,
      flaggedIds: answersDraftRef.current.flaggedIds,
    };

    // Lưu bài nộp vào IndexedDB & giải phóng khóa phòng thi
    await examOfflineStorage.completeAndQueueSubmission({
      answers: answersPayload,
      timeSpentSeconds: timeSpent,
      isAutoSubmit,
    });

    if (typeof window !== 'undefined' && navigator.onLine) {
      await examOfflineStorage.syncPendingSubmissions();
    }
    toast.success('Đã nộp bài thành công!');
  };

  // 2. Live Timer Effect đếm giờ thực ngầm theo Wall-Clock
  React.useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      const lock = examOfflineStorage.getFastSyncActiveLock();
      if (lock && lock.targetEndTime) {
        const remaining = Math.max(0, Math.round((lock.targetEndTime - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        setSecondsElapsed(Math.max(0, totalLimitSeconds - remaining));

        if (remaining <= 0) {
          clearInterval(interval);
          handleSubmitExam(true);
        }
      } else {
        setSecondsElapsed((prev) => prev + 1);
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, totalLimitSeconds]);

  // Format Timer strings (MM:SS)
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper lưu trữ draft tự động vào IndexedDB
  const triggerDebouncedSave = (patch: Partial<typeof answersDraftRef.current>) => {
    const merged = {
      ...answersDraftRef.current,
      ...patch,
    };
    answersDraftRef.current = merged;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      examOfflineStorage.updateDraftAnswers(answersDraftRef.current).then(() => {
        setLastSaved('Đã lưu an toàn');
      });
    }, 300);
    setLastSaved('Đang lưu...');
  };

  // Toggle flag
  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) => {
      const updated = { ...prev, [qId]: !prev[qId] };
      triggerDebouncedSave({ flaggedIds: updated });
      return updated;
    });
  };

  // Multiple Choice Select
  const handleSelectChoice = (qId: string, key: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setMultipleChoices((prev) => {
      const updated = { ...prev, [qId]: key };
      triggerDebouncedSave({ multipleChoices: updated });
      return updated;
    });
  };

  // True/False Select
  const handleSelectTrueFalse = (qId: string, subId: string, value: boolean) => {
    if (isSubmitted) return;
    setTrueFalseAnswers((prev) => {
      const updated = {
        ...prev,
        [qId]: {
          ...(prev[qId] || {}),
          [subId]: value,
        },
      };
      triggerDebouncedSave({ trueFalseAnswers: updated });
      return updated;
    });
  };

  // Short Answer Change
  const handleShortAnswerChange = (qId: string, val: string) => {
    if (isSubmitted) return;
    setShortAnswers((prev) => {
      const updated = { ...prev, [qId]: val };
      triggerDebouncedSave({ shortAnswers: updated });
      return updated;
    });
  };

  // Essay Answer Change
  const handleEssayAnswerChange = (qId: string, val: string) => {
    if (isSubmitted) return;
    setEssayAnswers((prev) => {
      const updated = { ...prev, [qId]: val };
      triggerDebouncedSave({ essayAnswers: updated });
      return updated;
    });
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

    // Thống kê theo ma trận độ khó và câu hỏi liên chương
    const difficultyBreakdown: Record<QuestionDifficulty, { total: number; correct: number }> = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
      VERY_HARD: { total: 0, correct: 0 },
    };

    let previousChapterCount = 0;
    let previousChapterCorrect = 0;

    questionResults.forEach((res) => {
      const diff = res.question.difficulty || 'MEDIUM';
      if (difficultyBreakdown[diff]) {
        difficultyBreakdown[diff].total++;
        if (res.isCorrect) {
          difficultyBreakdown[diff].correct++;
        }
      }
      if (res.question.isPreviousChapterReview) {
        previousChapterCount++;
        if (res.isCorrect) {
          previousChapterCorrect++;
        }
      }
    });

    // Scale to standard 10-point scale
    const finalScore = Math.min(10, Math.round((totalScore / exam.totalPoints) * 10 * 10) / 10);

    // Quy chế tích lũy điểm thưởng / Token luyện thi:
    // - Làm 10 điểm tuyệt đối: +2 điểm (+2 💎)
    // - Làm > 8.5 điểm (và < 10): +1 điểm (+1 💎)
    // - Làm từ 5.0 - 8.5 điểm: 0 điểm (không được gì, 0 💎)
    // - Dưới 5.0 điểm: -1 điểm (bị trừ 1 điểm, -1 💎)
    let rewardPoints = 0;
    let rewardTier: 'PERFECT' | 'EXCELLENT' | 'NEUTRAL' | 'PENALTY' = 'NEUTRAL';
    let rewardLabel = '0 Điểm';
    let rewardNote = 'Mức 5.0 - 8.5: Không cộng/trừ';

    if (finalScore === 10) {
      rewardPoints = 2;
      rewardTier = 'PERFECT';
      rewardLabel = '+2 Điểm Thưởng';
      rewardNote = 'Điểm 10 tuyệt đối: Thưởng tối đa +2 điểm';
    } else if (finalScore > 8.5) {
      rewardPoints = 1;
      rewardTier = 'EXCELLENT';
      rewardLabel = '+1 Điểm Thưởng';
      rewardNote = 'Điểm thi > 8.5: Thưởng +1 điểm';
    } else if (finalScore >= 5.0) {
      rewardPoints = 0;
      rewardTier = 'NEUTRAL';
      rewardLabel = '0 Điểm';
      rewardNote = 'Mức 5.0 - 8.5: Giữ nguyên điểm (0đ)';
    } else {
      rewardPoints = -1;
      rewardTier = 'PENALTY';
      rewardLabel = '-1 Điểm Phạt';
      rewardNote = 'Dưới 5.0: Bị trừ 1 điểm (-1 điểm)';
    }

    return {
      finalScore,
      earnedScore: Math.round(totalScore * 10) / 10,
      maxScore: exam.totalPoints,
      correctCount: Math.round(correctCount),
      wrongCount,
      unansweredCount: exam.questions.length - answeredCount,
      timeSpentSeconds: secondsElapsed,
      diamondReward: rewardPoints,
      rewardPoints,
      rewardTier,
      rewardLabel,
      rewardNote,
      questionResults,
      difficultyBreakdown,
      previousChapterStats: {
        total: previousChapterCount,
        correct: previousChapterCorrect,
      },
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

  const hasProcessedRewardRef = React.useRef(false);

  const handleRetakeExam = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`schoolify_pkg_${exam.id}`);
      } catch {}
    }

    const fresh = getPracticeExam(subjectSlug, levelParam, gradeParam, chapterParam, formatParam, {
      requestedCount: countParam,
      quizCount: quizCountParam,
      essayCount: essayCountParam,
      durationMinutes: durationParam,
    });
    setExam(fresh);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`schoolify_pkg_${fresh.id}`, JSON.stringify(fresh));
      } catch {}
    }

    await examOfflineStorage.clearActiveExamSession();
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
    await examOfflineStorage.startExamSession({
      examId: fresh.id,
      examType: 'STANDARD',
      examTitle: fresh.title,
      roomUrl: currentUrl,
      durationMinutes: fresh.durationMinutes,
      examPackage: fresh,
    });

    setMultipleChoices({});
    setTrueFalseAnswers({});
    setShortAnswers({});
    setEssayAnswers({});
    setFlaggedIds({});
    setActiveQuestionIdx(0);
    setSecondsElapsed(0);
    setSecondsRemaining(fresh.durationMinutes * 60);
    hasProcessedRewardRef.current = false;
    setIsSubmitted(false);
    setShowRemediationMode(false);
    setIsTakingRemediation(false);
    setRemediationExam(null);
    setRemediationChoices({});
    setRemediationTrueFalse({});
    setRemediationShortAnswers({});
    setRemediationSubmitted(false);
    setRemediationResult(null);
    setCurrentSnapshotId(null);
    setCurrentAttemptToken(null);
    setAccessDenied(false);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('attemptToken');
        url.searchParams.delete('token');
        window.history.replaceState(null, '', url.toString());
      } catch {}
    }
    setLastSaved('Đã lưu an toàn');
  };

  // Tự động lưu Snapshot đề thi khi nộp bài kèm attemptToken an toàn
  React.useEffect(() => {
    if (isSubmitted && examResult && !currentSnapshotId && !attemptTokenParam) {
      const snapId = `SNAP-${Date.now()}`;
      const token = generateAttemptToken();
      const wrongIds = examResult.questionResults
        .filter((r) => !r.isCorrect)
        .map((r) => r.question.id);

      const snapshot: ExamSnapshot = {
        id: snapId,
        attemptToken: token,
        userId: user?.id || 'guest',
        userFullName: user?.fullname || 'Học sinh',
        examId: exam.id,
        examTitle: exam.title,
        subjectSlug: exam.subjectSlug,
        subjectName: exam.subjectName,
        grade: exam.grade,
        chapterId: exam.chapterId,
        chapterName: exam.chapterName,
        createdAt: new Date().toISOString(),
        durationMinutes: exam.durationMinutes,
        timeSpentSeconds: examResult.timeSpentSeconds,
        originalExam: {
          finalScore: examResult.finalScore,
          maxScore: examResult.maxScore,
          correctCount: examResult.correctCount,
          wrongCount: examResult.wrongCount + examResult.unansweredCount,
          totalQuestions: exam.questions.length,
          questions: exam.questions,
          studentAnswers: {
            multipleChoices: { ...multipleChoices },
            trueFalseAnswers: { ...trueFalseAnswers },
            shortAnswers: { ...shortAnswers },
            essayAnswers: { ...essayAnswers },
          },
          wrongQuestionIds: wrongIds,
        },
        bloomSummary: {
          EASY: examResult.difficultyBreakdown.EASY,
          MEDIUM: examResult.difficultyBreakdown.MEDIUM,
          HARD: examResult.difficultyBreakdown.HARD,
          VERY_HARD: examResult.difficultyBreakdown.VERY_HARD,
        },
      };

      setCurrentSnapshotId(snapId);
      setCurrentAttemptToken(token);

      // Cập nhật URL với attemptToken bảo mật (chống F5 bị mất màn hình kết quả)
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('attemptToken', token);
          window.history.replaceState(null, '', url.toString());
        } catch {}
      }

      examSnapshotService.saveExamSnapshot(snapshot).catch((err) => {
        console.error('Failed to save exam snapshot:', err);
        toast.error('Không lưu được kết quả đề thi. Vui lòng thử lại sau.');
      });
    }
  }, [
    isSubmitted,
    examResult,
    currentSnapshotId,
    attemptTokenParam,
    exam,
    user,
    multipleChoices,
    trueFalseAnswers,
    shortAnswers,
    essayAnswers,
  ]);

  // Mở modal snapshot
  const handleOpenSnapshot = async () => {
    try {
      if (currentSnapshotId) {
        const snap = await examSnapshotService.getExamSnapshotById(currentSnapshotId);
        if (snap) {
          setViewingSnapshot(snap);
          setIsSnapshotModalOpen(true);
          return;
        }
      }
      const all = await examSnapshotService.getExamSnapshots();
      if (all.length > 0) {
        setViewingSnapshot(all[0]);
        setIsSnapshotModalOpen(true);
        return;
      }
      toast.error('Chưa tìm thấy đề thi đã lưu.');
    } catch {
      toast.error('Không tải được kết quả đề thi. Vui lòng thử lại.');
    }
  };

  // Bắt đầu làm đề thi biến thể khắc phục (Multi-step Shimmer Loading)
  const handleStartRemediation = () => {
    if (!examResult) return;
    const wrongQs = examResult.questionResults
      .filter((r) => !r.isCorrect)
      .map((r) => r.question);

    if (wrongQs.length === 0) {
      toast.success('🎉 Bạn đã làm đúng toàn bộ câu hỏi, không có câu sai cần khắc phục!');
      return;
    }

    setIsGeneratingRemediation(true);
    setRemediationGenStep('Giai đoạn 1/3: Phân tích ma trận lỗi sai & cấu trúc Bloom...');

    setTimeout(() => {
      setRemediationGenStep('Giai đoạn 2/3: Sinh câu hỏi biến thể đẳng cấu & tự động giải số học...');
    }, 400);

    setTimeout(() => {
      setRemediationGenStep('Giai đoạn 3/3: Chuẩn bị giao diện phòng thi khắc phục...');
    }, 800);

    setTimeout(() => {
      const pkg = generateRemediationExamPackage(wrongQs, exam);
      setRemediationExam(pkg);
      setRemediationChoices({});
      setRemediationTrueFalse({});
      setRemediationShortAnswers({});
      setRemediationSubmitted(false);
      setRemediationResult(null);
      setIsGeneratingRemediation(false);
      setIsTakingRemediation(true);
      toast.success(`Đã chuẩn bị xong ${pkg.questions.length} câu biến thể khắc phục! Chúc bạn làm tốt.`);

      setTimeout(() => {
        const el = document.getElementById('remediation-runner-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1150);
  };

  // Nộp bài thi biến thể khắc phục
  const handleSubmitRemediation = () => {
    if (!remediationExam) return;

    let correct = 0;
    let wrong = 0;
    let earned = 0;

    const questionResults = remediationExam.questions.map((q) => {
      let isCorrect = false;
      let qEarned = 0;

      if (q.type === 'MULTIPLE_CHOICE') {
        const studentChoice = remediationChoices[q.id];
        if (studentChoice === q.correctChoice) {
          isCorrect = true;
          qEarned = q.score || 1;
          correct++;
        } else {
          wrong++;
        }
      } else if (q.type === 'TRUE_FALSE') {
        const answers = remediationTrueFalse[q.id] || {};
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
        const studentAns = remediationShortAnswers[q.id]?.trim();
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

    const result = {
      score: finalScore,
      maxScore: 10,
      correctCount: correct,
      wrongCount: wrong,
      questionResults,
    };

    setRemediationResult(result);
    setRemediationSubmitted(true);

    if (currentSnapshotId) {
      examSnapshotService
        .updateRemediationInSnapshot(currentSnapshotId, {
          attempted: true,
          attemptedAt: new Date().toISOString(),
          finalScore: finalScore,
          totalQuestions: remediationExam.questions.length,
          correctCount: correct,
          questions: remediationExam.questions,
          studentAnswers: {
            multipleChoices: remediationChoices,
            trueFalseAnswers: remediationTrueFalse,
            shortAnswers: remediationShortAnswers,
            essayAnswers: {},
          },
        })
        .then(() => toast.success('Đã lưu kết quả bài khắc phục vào đề thi!'))
        .catch(() => toast.error('Không lưu được kết quả bài khắc phục. Vui lòng thử lại.'));
    }
  };

  // Trừ điểm năng lượng khi bắt đầu mở đề thi (PostgreSQL: Cơ bản -3đ, TB -4đ, Giỏi -9đ)
  React.useEffect(() => {
    if (attemptTokenParam || isSubmitted || isAssessment) return;
    const deductedKey = `schoolify_started_pts_${exam.id}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(deductedKey) === '1') {
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(deductedKey, '1');
    }
    examPointsService
      .startExamWithPoints({
        userId: user?.id,
        level: levelParam,
        examTitle: exam.title,
        subjectSlug,
        grade: gradeParam,
        chapterId: chapterParam,
      })
      .then((res) => {
        if (res?.ok && res?.message) {
          toast.info('Đã kích hoạt phiên làm đề', { description: res.message });
        } else if (!res?.ok && res?.message) {
          toast.warning('Thông báo điểm năng lượng', { description: res.message });
        }
      })
      .catch(() => {});
  }, [attemptTokenParam, isSubmitted, isAssessment, exam.id, exam.title, user?.id, levelParam, subjectSlug, gradeParam, chapterParam]);

  // Xử lý cộng/trừ điểm thưởng Token khi nộp bài thi (PostgreSQL)
  React.useEffect(() => {
    if (isSubmitted && examResult && !hasProcessedRewardRef.current) {
      hasProcessedRewardRef.current = true;
      const deductedKey = `schoolify_started_pts_${exam.id}`;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(deductedKey);
      }
      examPointsService
        .settleSubmissionPoints({
          userId: user?.id,
          score: examResult.finalScore,
          level: levelParam,
          examTitle: exam.title,
        })
        .then((res) => {
          if (res?.message) {
            toast.success('Đã cập nhật điểm năng lượng làm đề!', {
              description: res.message,
            });
          }
        })
        .catch(() => {});
      if (false) {
      hasProcessedRewardRef.current = true;

      let currentBalance = 250;
      try {
        const stored = localStorage.getItem('schoolify_user_tokens');
        if (stored) {
          currentBalance = Number(stored);
        } else {
          localStorage.setItem('schoolify_user_tokens', '250');
        }
      } catch {}

      const newBalance = Math.max(0, currentBalance + (examResult?.rewardPoints || 0));
      try {
        localStorage.setItem('schoolify_user_tokens', String(newBalance));
        window.dispatchEvent(new Event('tokens-updated'));
      } catch {}
    }
      }
  }, [isSubmitted, examResult, exam.id, exam.title, user?.id, levelParam]);

  // Lưu kết quả đánh giá năng lực nếu đây là bài thi chẩn đoán (ASSESSMENT)
  React.useEffect(() => {
    if (isSubmitted && isAssessment && examResult) {
      const assignedLevel: PracticeLevel =
        examResult.finalScore >= 8.5
          ? 'ADVANCED'
          : examResult.finalScore >= 5.0
          ? 'MEDIUM'
          : 'BASIC';

      if (typeof window !== 'undefined') {
        const uid = user?.id;
        if (uid) {
          localStorage.setItem(`schoolify_competency_${uid}`, assignedLevel);
          localStorage.setItem(`schoolify_competency_${uid}_${subjectSlug}`, assignedLevel);
        }
        localStorage.setItem(`schoolify_competency_guest_${subjectSlug}`, assignedLevel);
      }
    }
  }, [isSubmitted, isAssessment, examResult, user, subjectSlug]);

  const currentQ = exam.questions[activeQuestionIdx] || exam.questions[0];

  // =========================================================================
  // VIEW: TRUY CẬP BỊ TỪ CHỐI (403 FORBIDDEN - BẢO VỆ QUYỀN SỞ HỮU BÀI THI)
  // =========================================================================
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col pt-20">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto text-rose-500 shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Truy Cập Bị Từ Chối (403)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Kết quả bài thi này được bảo vệ quyền riêng tư và chỉ có thể truy cập bởi chính học sinh sở hữu hoặc giáo viên phụ trách.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/login/student">
                <Button className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl min-h-[44px]">
                  Đăng Nhập Đúng Tài Khoản
                </Button>
              </Link>
              <Link href="/luyen-thi">
                <Button variant="outline" className="w-full rounded-xl min-h-[44px] font-bold">
                  Quay Lại Cổng Luyện Thi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: LOADING KHÔI PHỤC KẾT QUẢ TỪ ATTEMPT TOKEN
  // =========================================================================
  if (isRestoringResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col pt-20">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#00B8DD] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Đang xác thực bảo mật và tải kết quả bài làm...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: RESULT SCREEN (HIỆN KẾT QUẢ VÀ LỜI GIẢI CHI TIẾT)
  // =========================================================================
  if (isSubmitted && examResult) {
    const wrongResults = examResult.questionResults.filter((r) => !r.isCorrect);
    const wrongCount = wrongResults.length;
    const accuracyPercent = Math.round((examResult.correctCount / exam.questions.length) * 100);
    const scoreVal = examResult.finalScore;

    // Phân loại sư phạm chuẩn mực (badge trung tính, vòng điểm chỉ khác màu khi chưa đạt)
    const tierBadge =
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    const assessmentTier =
      scoreVal >= 9.0
        ? {
            label: 'Xuất sắc',
            desc: 'Nắm vững toàn diện bản chất và kỹ năng vận dụng cao.',
            badgeBg: tierBadge,
            ringColor: '#00B8DD',
          }
        : scoreVal >= 8.0
        ? {
            label: 'Giỏi',
            desc: 'Nắm chắc kiến thức cốt lõi, phản xạ tốt các bài toán phân hóa.',
            badgeBg: tierBadge,
            ringColor: '#00B8DD',
          }
        : scoreVal >= 6.5
        ? {
            label: 'Khá',
            desc: 'Hoàn thành tốt phần nhận biết và thông hiểu, cần rèn thêm vận dụng.',
            badgeBg: tierBadge,
            ringColor: '#00B8DD',
          }
        : scoreVal >= 5.0
        ? {
            label: 'Đạt yêu cầu',
            desc: 'Đạt chuẩn mức độ nhận biết cơ bản, cần củng cố các dạng bài sai.',
            badgeBg: tierBadge,
            ringColor: '#00B8DD',
          }
        : {
            label: 'Cần củng cố',
            desc: 'Cần ôn tập lại lý thuyết nền tảng và luyện đề biến thể khắc phục.',
            badgeBg: tierBadge,
            ringColor: '#F43F5E',
          };

    // Chu vi vòng tròn Gauge SVG (r = 54 => C = 2 * PI * 54 = ~339.29)
    const gaugeRadius = 54;
    const gaugeCircumference = 2 * Math.PI * gaugeRadius;
    const strokeDashoffset = gaugeCircumference - (Math.min(10, Math.max(0, scoreVal)) / 10) * gaugeCircumference;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col pt-20 font-sans overflow-x-hidden w-full max-w-[100vw]">
        <Navbar />

        <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-6 sm:space-y-8 w-full py-8 px-4 sm:px-6 lg:px-8">
          
          {/* ========================================================================= */}
          {/* 1. HEADER KHẢO THÍ CHUẨN MỰC                                             */}
          {/* ========================================================================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {exam.subjectName} · Khối {exam.grade} · {exam.chapterName}
            </span>

            <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Đã nộp và chấm tự động
              </span>
              {currentAttemptToken && (
                <span className="font-mono hidden sm:inline text-slate-400">
                  #{currentAttemptToken.slice(0, 14)}
                </span>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. SCORECARD: ĐIỂM SỐ + 4 CHỈ SỐ                                          */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

            {/* Cột Trái: Điểm số & vòng tròn */}
            <Card className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none flex flex-col justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  Điểm số đạt được
                </span>
              </div>

              <div className="my-6 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r={gaugeRadius}
                      className="text-slate-100 dark:text-slate-800 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={gaugeRadius}
                      stroke={assessmentTier.ringColor}
                      strokeWidth="10"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div className="absolute flex items-baseline justify-center">
                    <span className="text-5xl font-semibold text-slate-900 dark:text-white tracking-tight tabular-nums">
                      {scoreVal}
                    </span>
                    <span className="text-sm font-medium text-slate-400 ml-1">/10</span>
                  </div>
                </div>

                <div className="mt-4 text-center space-y-1.5">
                  <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border', assessmentTier.badgeBg)}>
                    {assessmentTier.label}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {assessmentTier.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Số câu hỏi</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {exam.questions.length} câu
                </span>
              </div>
            </Card>

            {/* Cột Phải: 4 chỉ số */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* 1. Độ chính xác */}
              <Card className="p-5 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none flex flex-col justify-between gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Độ chính xác</span>
                <div>
                  <div className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
                    {accuracyPercent}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Đúng {examResult.correctCount} / {exam.questions.length} câu
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#00B8DD] rounded-full transition-all duration-700"
                    style={{ width: `${accuracyPercent}%` }}
                  />
                </div>
              </Card>

              {/* 2. Thời gian làm bài */}
              <Card className="p-5 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none flex flex-col justify-between gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Thời gian làm bài</span>
                <div>
                  <div className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatTimer(examResult.timeSpentSeconds)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Giới hạn {exam.durationMinutes} phút · TB {Math.max(1, Math.round(examResult.timeSpentSeconds / exam.questions.length))}s/câu
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#00B8DD] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (examResult.timeSpentSeconds / (exam.durationMinutes * 60)) * 100)}%` }}
                  />
                </div>
              </Card>

              {/* 3. Câu chưa chính xác */}
              <Card className="p-5 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none flex flex-col justify-between gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Câu chưa chính xác</span>
                <div>
                  <div className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
                    {wrongCount}
                    <span className="text-sm font-medium text-slate-400 ml-1.5">câu</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {wrongCount > 0 ? 'Cần luyện lại phương pháp giải' : 'Không có câu sai cần ôn'}
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#00B8DD] rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((wrongCount / exam.questions.length) * 100)}%` }}
                  />
                </div>
              </Card>

              {/* 4. Điểm thưởng */}
              <Card className="p-5 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none flex flex-col justify-between gap-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Điểm thưởng</span>
                <div>
                  <div className="text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
                    {examResult.rewardPoints > 0 ? `+${examResult.rewardPoints}` : examResult.rewardPoints}
                    <span className="text-sm font-medium text-slate-400 ml-1.5">điểm</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {examResult.rewardNote}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. AI COMPETENCY ASSESSMENT DIAGNOSIS (Nếu là bài đánh giá năng lực)      */}
          {/* ========================================================================= */}
          {isAssessment && (
            <Card className="p-6 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none text-left space-y-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Kết quả chẩn đoán năng lực
              </h3>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Dựa trên điểm số <strong className="text-slate-950 dark:text-white font-semibold">{examResult.finalScore}/10</strong>, năng lực hiện tại của bạn phù hợp nhất với cấp độ:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {examResult.finalScore >= 8.5
                    ? 'Nâng cao (Vận dụng cao 9-10đ)'
                    : examResult.finalScore >= 5.0
                    ? 'Trung bình (Học kỳ & Tốt nghiệp)'
                    : 'Cơ bản (SGK & Lý thuyết)'}
                </span>.
              </div>
              <p className="text-xs text-slate-500">
                Kết quả đã được cập nhật vào hồ sơ học tập. Kho môn học sẽ ưu tiên đề xuất lộ trình rèn luyện tương ứng.
              </p>
            </Card>
          )}


          {/* ========================================================================= */}
          {/* 5. ACTION TOOLBAR: CÁC NÚT THAO TÁC ĐIỀU HƯỚNG                             */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                onClick={handleRetakeExam}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="rounded-xl font-semibold min-h-[42px] cursor-pointer"
              >
                Làm lại đề này
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenSnapshot}
                leftIcon={<BookOpen className="w-4 h-4" />}
                className="rounded-xl font-semibold min-h-[42px] cursor-pointer"
              >
                Xem lại đề thi
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/luyen-thi">
                <Button
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl min-h-[42px] cursor-pointer"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Chọn luyện đề môn khác
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="rounded-xl font-semibold min-h-[42px]" leftIcon={<Home className="w-4 h-4" />}>
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>

          {/* ================================================================= */}
          {/* TRUNG TÂM KHẮC PHỤC LỖI SAI & BIẾN THỂ TƯƠNG ĐƯƠNG               */}
          {/* ================================================================= */}
          {(() => {
            const wrongResults = examResult.questionResults.filter((r) => !r.isCorrect);
            const wrongCount = wrongResults.length;

            if (wrongCount === 0) {
              return (
                <Card className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none text-center space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Bạn đã trả lời đúng toàn bộ câu hỏi
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                    Không có câu sai nào cần khắc phục. Đề thi và bài làm đã được lưu vào hồ sơ học tập của bạn.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleOpenSnapshot}
                      leftIcon={<BookOpen className="w-4 h-4" />}
                      className="rounded-xl font-semibold"
                    >
                      Xem lại đề thi
                    </Button>
                  </div>
                </Card>
              );
            }

            return (
              <div className="space-y-6">
                {/* Remediation Entry Card */}
                <Card className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {wrongCount} câu cần củng cố
                      </span>
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                        Luyện tập với đề biến thể tương đương
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                        Xem phân tích các câu làm sai và luyện lại với bộ đề biến thể có cùng dạng bài, khác số liệu hoặc ngữ cảnh.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => setShowRemediationMode(!showRemediationMode)}
                        className="rounded-xl font-semibold text-xs"
                      >
                        {showRemediationMode ? 'Ẩn lời giải câu sai' : `Xem ${wrongCount} câu sai và cách giải`}
                      </Button>
                      <Button
                        onClick={handleStartRemediation}
                        className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Khắc phục ngay
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* SKELETON & MULTI-STEP SHIMMER LOADING KHI KHỞI TẠO ĐỀ BIẾN THỂ */}
                {isGeneratingRemediation && (
                  <Card className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-3 w-3 shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#00B8DD] opacity-75 animate-ping" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00B8DD]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                          Đang khởi tạo đề biến thể khắc phục
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {remediationGenStep}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar Shimmer */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full w-1/3 bg-[#00B8DD] rounded-full animate-pulse" />
                    </div>

                    {/* 2 Skeleton Question Cards */}
                    <div className="space-y-4 pt-1">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-36 rounded-lg" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-5/6 rounded" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                            <Skeleton className="h-10 rounded-xl" />
                            <Skeleton className="h-10 rounded-xl" />
                            <Skeleton className="h-10 rounded-xl" />
                            <Skeleton className="h-10 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* VIEW: ĐANG LÀM ĐỀ BIẾN THỂ KHẮC PHỤC */}
                {isTakingRemediation && remediationExam && (
                  <Card id="remediation-runner-card" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                            Đề biến thể tương đương
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {remediationExam.questions.length} câu hỏi
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                          {remediationExam.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Các câu hỏi giữ nguyên cấu trúc nhưng được thay đổi số liệu hoặc ngữ cảnh để kiểm tra phản xạ của bạn.
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTakingRemediation(false)}
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white self-start sm:self-auto"
                      >
                        Đóng bài khắc phục
                      </Button>
                    </div>

                    {/* Result of Remediation if already submitted */}
                    {remediationSubmitted && remediationResult ? (
                      <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Kết quả đề biến thể
                          </span>
                          <div className="text-4xl font-bold text-slate-900 dark:text-white">
                            {remediationResult.correctCount} / {remediationExam.questions.length} câu đúng
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {remediationResult.correctCount === remediationExam.questions.length
                              ? 'Bạn đã khắc phục hoàn toàn các dạng bài bị sai.'
                              : `Bạn đã làm đúng ${remediationResult.correctCount} câu biến thể. Kết quả đã được lưu vào đề thi.`}
                          </p>
                          <div className="flex flex-wrap justify-center gap-3 pt-3">
                            <Button
                              onClick={handleOpenSnapshot}
                              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs"
                              leftIcon={<BookOpen className="w-4 h-4" />}
                            >
                              Xem Lại Đề Thi & Lời Giải
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsTakingRemediation(false)}
                              className="rounded-xl text-xs font-bold"
                            >
                              Quay Lại Kết Quả Ban Đầu
                            </Button>
                          </div>
                        </div>

                        {/* List variant explanations */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Chi tiết từng câu biến thể và lời giải
                          </h4>
                          {remediationResult.questionResults.map((qr, qIdx) => (
                            <div
                              key={qr.question.id}
                              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  Câu {qIdx + 1}: {qr.question.title}
                                </span>
                                <Badge
                                  className={
                                    qr.isCorrect
                                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                      : 'bg-slate-100 text-rose-600 dark:bg-slate-800 dark:text-rose-400'
                                  }
                                >
                                  {qr.isCorrect ? 'Chính xác' : 'Chưa chính xác'}
                                </Badge>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">
                                <MathRenderer text={qr.question.content} />
                              </p>
                              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                                  Lời giải:
                                </span>
                                <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                                  <MathRenderer text={qr.question.explanation} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Active Runner for Remediation Questions */
                      <div className="space-y-6">
                        {remediationExam.questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                                Câu {idx + 1} (Biến thể)
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                {q.type === 'MULTIPLE_CHOICE'
                                  ? 'Trắc nghiệm 4 lựa chọn'
                                  : q.type === 'TRUE_FALSE'
                                  ? 'Đúng / Sai'
                                  : 'Điền đáp số'}
                              </span>
                            </div>

                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              <MathRenderer text={q.title} />
                            </div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              <MathRenderer text={q.content} />
                            </div>

                            {/* Multiple choice options */}
                            {q.type === 'MULTIPLE_CHOICE' && q.choices && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {q.choices.map((c) => {
                                  const isSelected = remediationChoices[q.id] === c.key;
                                  return (
                                    <button
                                      key={c.key}
                                      type="button"
                                      onClick={() =>
                                        setRemediationChoices((prev) => ({ ...prev, [q.id]: c.key }))
                                      }
                                      className={cn(
                                        'p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all text-left cursor-pointer',
                                        isSelected
                                          ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-cyan-950/40 font-bold text-[#007D99] dark:text-[#00B8DD] ring-2 ring-[#00B8DD]/20'
                                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                                      )}
                                    >
                                      <span className="font-mono font-bold shrink-0">{c.key}.</span>
                                      <MathRenderer text={c.content} inline />
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* True/False statements */}
                            {q.type === 'TRUE_FALSE' && q.statements && (
                              <div className="space-y-2 pt-2">
                                {q.statements.map((st) => {
                                  const curVal = remediationTrueFalse[q.id]?.[st.subId];
                                  return (
                                    <div
                                      key={st.subId}
                                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                    >
                                      <div className="flex items-start gap-1.5">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                                          Ý {st.subId})
                                        </span>
                                        <MathRenderer text={st.statement} inline />
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setRemediationTrueFalse((prev) => ({
                                              ...prev,
                                              [q.id]: { ...(prev[q.id] || {}), [st.subId]: true },
                                            }))
                                          }
                                          className={cn(
                                            'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                            curVal === true
                                              ? 'bg-emerald-500 text-white shadow-xs'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                          )}
                                        >
                                          Đúng
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setRemediationTrueFalse((prev) => ({
                                              ...prev,
                                              [q.id]: { ...(prev[q.id] || {}), [st.subId]: false },
                                            }))
                                          }
                                          className={cn(
                                            'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                            curVal === false
                                              ? 'bg-rose-500 text-white shadow-xs'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                          )}
                                        >
                                          Sai
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Short answer input */}
                            {q.type === 'SHORT_ANSWER' && (
                              <div className="pt-2">
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  Nhập đáp số của bạn:
                                </label>
                                <input
                                  type="text"
                                  value={remediationShortAnswers[q.id] || ''}
                                  onChange={(e) =>
                                    setRemediationShortAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Ví dụ: 3.5 hoặc 12"
                                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                                />
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-end pt-2">
                          <Button
                            onClick={handleSubmitRemediation}
                            className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold px-6 py-3 rounded-xl text-sm cursor-pointer"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Nộp Bài Khắc Phục
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* VIEW: HIỂN THỊ CÁC CÂU LÀM SAI VÀ CÁCH GIẢI CHI TIẾT */}
                {showRemediationMode && (
                  <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-slate-400" />
                          Chi Tiết {wrongCount} Câu Chưa Chính Xác
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Đối chiếu đáp án bạn đã chọn với barem chuẩn của Bộ Giáo Dục và hướng dẫn tư duy từng bước.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {wrongResults.map((res) => {
                        const q = res.question;
                        return (
                          <Card
                            key={q.id}
                            id={`wrong-q-${q.id}`}
                            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none space-y-4 scroll-mt-24"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  Chưa chính xác ({res.earnedScore}/{q.score}đ)
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
                                {renderDifficultyBadge(q.difficulty, false)}
                                {renderPreviousChapterBadge(q, false)}
                              </div>

                              <button
                                type="button"
                                onClick={() => setReportingQuestion(q)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                                title="Báo cáo sai sót câu hỏi cho Ban Khảo thí"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Báo lỗi</span>
                              </button>
                            </div>

                            <div className="text-base font-bold text-slate-900 dark:text-white">
                              <MathRenderer text={q.title} />
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                              <MathRenderer text={q.content} />
                            </div>

                            {/* Display choices if multiple choice */}
                            {q.type === 'MULTIPLE_CHOICE' && q.choices && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                {q.choices.map((choice) => {
                                  const isSelected = multipleChoices[q.id] === choice.key;
                                  const isCorrectOpt = q.correctChoice === choice.key;

                                  let optClasses =
                                    'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950';
                                  if (isCorrectOpt) {
                                    optClasses =
                                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200';
                                  } else if (isSelected && !isCorrectOpt) {
                                    optClasses =
                                      'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
                                  }

                                  return (
                                    <div
                                      key={choice.key}
                                      className={cn(
                                        'p-3 rounded-xl border text-xs flex items-center justify-between gap-2',
                                        optClasses
                                      )}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-mono font-bold shrink-0">{choice.key}.</span>
                                        <MathRenderer text={choice.content} inline />
                                      </div>
                                      {isCorrectOpt && (
                                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                          (Đáp án đúng)
                                        </span>
                                      )}
                                      {isSelected && !isCorrectOpt && (
                                        <span className="text-[11px] font-bold text-rose-500 shrink-0">
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
                                      <div className="space-y-1">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                                          <span className="shrink-0">Ý {st.subId})</span>
                                          <MathRenderer text={st.statement} inline />
                                        </div>
                                        <div className="text-[11px] text-slate-500 flex items-start gap-1">
                                          <span className="shrink-0">Giải thích:</span>
                                          <MathRenderer text={st.explanation} inline />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0 text-[11px]">
                                        <span className="text-slate-500">
                                          Bạn chọn:{' '}
                                          <strong
                                            className={isSubCorrect ? 'text-emerald-600' : 'text-rose-500'}
                                          >
                                            {studentVal === true
                                              ? 'ĐÚNG'
                                              : studentVal === false
                                              ? 'SAI'
                                              : 'Chưa chọn'}
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
                                    <MathRenderer text={q.shortAnswerCorrect || ''} inline />
                                  </strong>
                                </div>
                              </div>
                            )}

                            {/* Explanation box */}
                            <div className="mt-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-1">
                              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4 text-[#00B8DD]" />
                                Phương pháp giải chi tiết theo SGK GDPT 2018:
                              </div>
                              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pl-5">
                                <MathRenderer text={q.explanation} />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {/* DƯỚI CÙNG HIỆN THÊM LỰA CHỌN KHẮC PHỤC NGAY */}
                    <Card className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#00B8DD]/20 to-purple-500/15 border-2 border-amber-400 dark:border-amber-600 shadow-xl text-center space-y-4">
                      <div className="inline-flex p-3.5 rounded-2xl bg-amber-400/25 text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-8 h-8 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="space-y-1.5 max-w-xl mx-auto">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          Đã Hiểu Phương Pháp? Hãy Khắc Phục Ngay!
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          Hệ thống đã tự động chuẩn bị sẵn bộ đề thi biến thể tương đương gồm {wrongCount} câu (Toán đổi số liệu, Văn/Anh đổi ngữ cảnh). Làm ngay để biến lỗi sai thành kiến thức vững vàng!
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
                        <Button
                          onClick={handleStartRemediation}
                          size="lg"
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl shadow-lg shadow-amber-400/30 cursor-pointer"
                          leftIcon={<Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />}
                        >
                          Bắt Đầu Khắc Phục Ngay ({wrongCount} câu biến thể) ➔
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleOpenSnapshot}
                          className="rounded-2xl font-bold text-sm px-5 py-3"
                          leftIcon={<BookOpen className="w-4 h-4 text-[#00B8DD]" />}
                        >
                          Xem Lại Đề Thi
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Modal Xem Snapshot Đề Thi */}
          <ExamSnapshotModal
            isOpen={isSnapshotModalOpen}
            onClose={() => setIsSnapshotModalOpen(false)}
            snapshot={viewingSnapshot}
          />

          {/* Modal Báo Cáo Sai Sót Câu Hỏi */}
          {reportingQuestion && (
            <ReportQuestionModal
              isOpen={!!reportingQuestion}
              onClose={() => setReportingQuestion(null)}
              questionId={reportingQuestion.id}
              questionTitle={reportingQuestion.title}
              subjectName={exam.subjectName}
              questionContentSnippet={reportingQuestion.content}
            />
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: EXAM ROOM (PHÒNG THI ĐO THỜI GIAN LÀM BÀI TRỰC TIẾP)
  // =========================================================================
  return (
    <div className="h-screen max-h-[100dvh] bg-slate-100/70 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col font-sans overflow-hidden w-full max-w-[100vw]">
      {/* Top Focus Sub-bar */}
      <div className="shrink-0 px-3 sm:px-6 py-2 sm:py-2.5 min-h-[52px] sm:min-h-[57px] bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-3 backdrop-blur-md lg:mr-72 xl:mr-80">
        {/* Left: Back & Subject Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
          <button
            onClick={async () => {
              if (!isSubmitted) {
                if (confirm('Bài thi đang diễn ra và thời gian vẫn tiếp tục tính ngầm. Bạn có chắc chắn muốn tạm thoát ra ngoài không?')) {
                  router.push('/#kho-mon-hoc');
                }
              } else {
                await examOfflineStorage.clearActiveExamSession();
                router.push('/#kho-mon-hoc');
              }
            }}
            className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title="Thoát phòng thi"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline ml-1.5">Rời Phòng Thi</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30 truncate max-w-[65px] min-[380px]:max-w-none shrink-0">
              {exam.subjectName}
            </span>
            <span className="text-xs text-slate-400 hidden lg:inline">•</span>
            <span className="text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-xs text-slate-800 dark:text-slate-200 hidden sm:inline">
              {exam.title}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] whitespace-nowrap shrink-0 hidden xl:inline">• {lastSaved}</span>
          </div>
        </div>

        {/* Right: Quick Casio, Question Drawer, Live Timer Countdown, Submit */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Casio Calculator Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('schoolify:open-calculator'))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-[#00B8DD] hover:from-cyan-500 hover:to-[#00A3C4] text-white font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Mở máy tính Casio fx-580VN X"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Casio</span>
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle className="shrink-0 h-auto py-1 px-2 sm:px-2.5 rounded-xl" />

          {/* Mobile open question list button (hidden on <380px since bottom drawer button is available) */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="hidden min-[380px]:flex lg:hidden items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] transition-colors shrink-0"
            title="Danh sách câu hỏi"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{answeredCount}/{exam.questions.length}</span>
          </button>

          {/* Live Timer Countdown (Đếm ngược thời gian làm bài) */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm border shadow-xs transition-colors shrink-0',
              secondsRemaining < 300
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            )}
            title={`Thời gian còn lại: ${formatTimer(secondsRemaining)} (Đã làm: ${formatTimer(secondsElapsed)} / ${formatTimer(totalLimitSeconds)})`}
          >
            <Clock className={cn('w-3.5 h-3.5 shrink-0', secondsRemaining < 300 ? 'text-rose-600 dark:text-rose-400' : 'text-[#007D99] dark:text-[#00B8DD]')} />
            <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
              {formatTimer(secondsRemaining)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
              / {formatTimer(totalLimitSeconds)}
            </span>
          </div>

          {/* Nộp Bài Button */}
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-[#00B8DD]/20 px-2.5 sm:px-4 py-1.5 h-auto min-h-[32px] shrink-0"
            rightIcon={<Send className="w-3.5 h-3.5 hidden sm:inline" />}
          >
            <span className="sm:hidden">Nộp</span>
            <span className="hidden sm:inline">Nộp Bài ({answeredCount}/{exam.questions.length})</span>
          </Button>
        </div>
      </div>

      {/* ── Top Question Navigation Bar (List câu hỏi tự động xuống dòng - Không scroll ngang) ── */}
      <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-6 lg:mr-72 xl:mr-80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-4xl mx-auto py-2 sm:py-2.5">
          {quizQuestions.length > 0 && essayQuestions.length > 0 && (
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const firstQuiz = exam.questions.findIndex((q) => q.type !== 'ESSAY');
                  if (firstQuiz !== -1) handleJumpToQuestion(exam.questions[firstQuiz], firstQuiz);
                }}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs font-bold transition-colors shrink-0',
                  currentQ?.type !== 'ESSAY'
                    ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                TN ({answeredQuizCount}/{quizQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstEssay = exam.questions.findIndex((q) => q.type === 'ESSAY');
                  if (firstEssay !== -1) handleJumpToQuestion(exam.questions[firstEssay], firstEssay);
                }}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs font-bold transition-colors shrink-0',
                  currentQ?.type === 'ESSAY'
                    ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                TL ({answeredEssayCount}/{essayQuestions.length})
              </button>
            </div>
          )}

          {exam.questions.map((q, idx) => {
            const isActive = activeQuestionIdx === idx;
            const isAnswered = isQuestionAnswered(q);
            const isFlagged = flaggedIds[q.id];

            return (
              <button
                key={q.id}
                id={`top-question-pill-${idx}`}
                type="button"
                onClick={() => handleJumpToQuestion(q, idx)}
                className={cn(
                  'h-8 sm:h-9 min-w-[56px] sm:min-w-[66px] px-2.5 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shrink-0 transition-all cursor-pointer select-none active:scale-95',
                  isActive
                    ? 'bg-[#00B8DD] text-white shadow-md shadow-[#00B8DD]/30 ring-2 ring-[#00B8DD] font-black'
                    : isFlagged
                    ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500 font-bold'
                    : isAnswered
                    ? 'bg-emerald-600 text-white border border-emerald-500 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                )}
                title={`Câu ${idx + 1}: ${q.title}`}
              >
                <span>Câu {idx + 1}</span>
                {isFlagged && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Exam Body (Mỗi lần chỉ hiện 1 câu hỏi) ── */}
      <div id="exam-main-scroll" className="flex-1 bg-slate-100/70 dark:bg-slate-900 overflow-y-auto px-4 py-6 sm:px-6 lg:mr-72 xl:mr-80 scroll-smooth">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {currentQ && (
            <div
              key={currentQ.id}
              id={`question-card-${currentQ.id}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 overflow-hidden shadow-sm dark:shadow-lg transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 px-3.5 sm:px-5 py-3 sm:py-4 bg-slate-50/90 dark:bg-slate-800/60 gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap min-w-0">
                  <span className="h-6 sm:h-7 px-2 sm:px-2.5 rounded-lg bg-[#00B8DD] text-white font-black text-xs flex items-center justify-center shrink-0">
                    Câu {activeQuestionIdx + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide truncate max-w-[130px] sm:max-w-none">
                    {currentQ.type === 'MULTIPLE_CHOICE'
                      ? 'Trắc Nghiệm'
                      : currentQ.type === 'TRUE_FALSE'
                      ? 'Đúng / Sai'
                      : currentQ.type === 'SHORT_ANSWER'
                      ? 'Điền Số'
                      : 'Tự Luận'}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-0 h-5">
                    {currentQ.score}đ
                  </Badge>
                  {renderDifficultyBadge(currentQ.difficulty, false)}
                  {renderPreviousChapterBadge(currentQ, false)}
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setReportingQuestion(currentQ)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
                    title="Báo cáo câu hỏi có sai sót cho Ban Khảo thí"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span className="hidden sm:inline">Báo lỗi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFlag(currentQ.id)}
                    className={cn(
                      'flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                      flaggedIds[currentQ.id]
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent'
                    )}
                    title={flaggedIds[currentQ.id] ? 'Đã đánh dấu câu hỏi' : 'Đánh dấu để xem lại'}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span className="hidden min-[380px]:inline">{flaggedIds[currentQ.id] ? 'Đã cắm cờ' : 'Đánh dấu'}</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 sm:p-6 space-y-4 w-full min-w-0 overflow-hidden">
                {/* Title & Content */}
                <div className="space-y-2 w-full min-w-0 overflow-hidden">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed break-words">
                    <MathRenderer text={currentQ.title} />
                  </h3>
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line break-words overflow-hidden">
                    <MathRenderer text={currentQ.content} />
                  </div>
                </div>

                {/* Question Interactive Inputs */}
                {/* 1. MULTIPLE CHOICE */}
                {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.choices && (
                  <div className="space-y-3 pt-2 w-full min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Chọn 1 đáp án chính xác:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                      {currentQ.choices.map((choice) => {
                        const isSelected = multipleChoices[currentQ.id] === choice.key;
                        return (
                          <button
                            key={choice.key}
                            type="button"
                            onClick={() => handleSelectChoice(currentQ.id, choice.key)}
                            className={cn(
                              'p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-2.5 sm:gap-3 cursor-pointer group w-full min-w-0 overflow-hidden',
                              isSelected
                                ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] text-slate-900 dark:text-white font-bold shadow-md shadow-[#00B8DD]/15'
                                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 hover:border-[#00B8DD]/60 text-slate-800 dark:text-slate-300'
                            )}
                          >
                            <span
                              className={cn(
                                'w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                                isSelected
                                  ? 'bg-[#00B8DD] text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 group-hover:text-[#00B8DD]'
                              )}
                            >
                              {choice.key}
                            </span>
                            <span className="text-xs sm:text-sm min-w-0 break-words overflow-hidden">
                              <MathRenderer text={choice.content} inline />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. TRUE / FALSE STATEMENTS */}
                {currentQ.type === 'TRUE_FALSE' && currentQ.statements && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Chọn Đúng hoặc Sai cho từng mệnh đề sau:
                    </span>
                    <div className="space-y-2.5">
                      {currentQ.statements.map((st) => {
                        const currentVal = trueFalseAnswers[currentQ.id]?.[st.subId];
                        return (
                          <div
                            key={st.subId}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                              <strong className="text-[#007D99] dark:text-[#00B8DD] mr-1.5 shrink-0">
                                {st.subId})
                              </strong>
                              <MathRenderer text={st.statement} inline />
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse(currentQ.id, st.subId, true)}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                  currentVal === true
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                                )}
                              >
                                ĐÚNG
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectTrueFalse(currentQ.id, st.subId, false)}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                  currentVal === false
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-500'
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
                {currentQ.type === 'SHORT_ANSWER' && (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Nhập kết quả / đáp số tính toán của bạn:
                    </label>
                    <div className="max-w-xs">
                      <input
                        type="text"
                        value={shortAnswers[currentQ.id] || ''}
                        onChange={(e) =>
                          handleShortAnswerChange(currentQ.id, e.target.value)
                        }
                        placeholder="Ví dụ: 6 hoặc 2.5 hoặc -1/2"
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                        * Nhập số nguyên hoặc số thập phân/phân số tối giản.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. ESSAY */}
                {currentQ.type === 'ESSAY' && (
                  <div className="space-y-3 pt-2">
                    <MathEssayEditor
                      value={essayAnswers[currentQ.id] || ''}
                      onChange={(val) =>
                        handleEssayAnswerChange(currentQ.id, val)
                      }
                      placeholder="Trình bày chi tiết từng bước: Tập xác định -> Đạo hàm y' -> Lập bảng biến thiên -> Biện luận tham số m..."
                      rows={8}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed Bottom Navigation Bar (Cố định ở đáy màn hình, không bị ảnh hưởng bởi độ dài câu hỏi) ── */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 lg:mr-72 xl:mr-80 z-20 shadow-lg dark:shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Nút Câu trước bên trái */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (activeQuestionIdx > 0) {
                const prevIdx = activeQuestionIdx - 1;
                handleJumpToQuestion(exam.questions[prevIdx], prevIdx);
              }
            }}
            disabled={activeQuestionIdx === 0}
            className={cn(
              "h-10 sm:h-11 px-3 sm:px-6 rounded-xl font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs active:scale-95 shrink-0",
              activeQuestionIdx === 0 && "opacity-30 cursor-not-allowed pointer-events-none"
            )}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            <span>Câu trước</span>
          </Button>

          {/* Chỉ báo câu hỏi hiện tại & Mở danh sách câu hỏi */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center text-center px-2 sm:px-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
            title="Nhấn để xem bảng danh sách toàn bộ câu hỏi"
          >
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors flex items-center gap-1.5">
              Câu {activeQuestionIdx + 1} / {exam.questions.length}
              <ListOrdered className="w-3.5 h-3.5 text-[#007D99] dark:text-[#00B8DD]" />
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Đã làm: {answeredCount}/{exam.questions.length}
            </span>
          </button>

          {/* Nút Câu kế tiếp bên phải */}
          {activeQuestionIdx < exam.questions.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                const nextIdx = activeQuestionIdx + 1;
                handleJumpToQuestion(exam.questions[nextIdx], nextIdx);
              }}
              className="h-10 sm:h-11 px-3 sm:px-6 rounded-xl font-black text-xs sm:text-sm bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-md shadow-[#00B8DD]/25 transition-all cursor-pointer active:scale-95 shrink-0"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              <span>Câu kế tiếp</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="h-10 sm:h-11 px-3 sm:px-6 rounded-xl font-black text-xs sm:text-sm bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-md shadow-[#00B8DD]/25 transition-all cursor-pointer active:scale-95 shrink-0"
              rightIcon={<Send className="w-4 h-4" />}
            >
              <span>Nộp bài thi</span>
            </Button>
          )}
        </div>
      </div>

      {/* Fixed Right Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 bottom-0 w-72 xl:w-80 bg-white/95 dark:bg-slate-950/95 border-l border-slate-200 dark:border-slate-800 z-50 lg:z-30 flex flex-col backdrop-blur-md transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          isMobileSidebarOpen
            ? 'translate-x-0 visible pointer-events-auto'
            : 'translate-x-full invisible pointer-events-none lg:visible lg:pointer-events-auto lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ListOrdered className="w-4 h-4 text-[#007D99] dark:text-[#00B8DD] shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                Danh Sách Câu Hỏi
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30">
                {answeredCount}/{exam.questions.length} ĐÃ LÀM
              </span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Nhấn số câu để chuyển nhanh đến vị trí làm bài.
          </p>

          {/* Sidebar Live Timer Card */}
          <div
            className={cn(
              'mt-3 px-3 py-2 rounded-xl border flex items-center justify-between transition-colors shadow-xs',
              secondsRemaining < 300
                ? 'bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            )}
            title="Thời gian làm bài còn lại"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Clock className={cn('w-4 h-4 shrink-0', secondsRemaining < 300 ? 'text-rose-600 dark:text-rose-400' : 'text-[#007D99] dark:text-[#00B8DD]')} />
              <span>Thời gian còn lại:</span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className={cn('font-black text-sm', secondsRemaining < 300 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white')}>
                {formatTimer(secondsRemaining)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                / {formatTimer(totalLimitSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Content (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Section 1: Trắc nghiệm (nếu có) */}
          {quizQuestions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#007D99] dark:text-[#00B8DD]" />
                  Phần Trắc Nghiệm
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {answeredQuizCount}/{quizQuestions.length} câu
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((q) => {
                  const globalIdx = exam.questions.findIndex((item) => item.id === q.id);
                  const isAnswered = isQuestionAnswered(q);
                  const isFlagged = flaggedIds[q.id];
                  const isActive = activeQuestionIdx === globalIdx;

                  let btnClass = 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-[#00B8DD] hover:text-[#007D99] dark:hover:text-[#00B8DD]';
                  if (isActive) {
                    btnClass = 'ring-2 ring-[#00B8DD] bg-[#00B8DD] text-white font-black border-[#00B8DD] shadow-sm shadow-[#00B8DD]/20';
                  } else if (isFlagged) {
                    btnClass = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500 font-bold';
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
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Tự luận (nếu có) */}
          {essayQuestions.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#007D99] dark:text-[#00B8DD]" />
                  Phần Tự Luận
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {answeredEssayCount}/{essayQuestions.length} câu
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {essayQuestions.map((q) => {
                  const globalIdx = exam.questions.findIndex((item) => item.id === q.id);
                  const isAnswered = isQuestionAnswered(q);
                  const isFlagged = flaggedIds[q.id];
                  const isActive = activeQuestionIdx === globalIdx;

                  let btnClass = 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-[#00B8DD] hover:text-[#007D99] dark:hover:text-[#00B8DD]';
                  if (isActive) {
                    btnClass = 'ring-2 ring-[#00B8DD] bg-[#00B8DD] text-white font-black border-[#00B8DD] shadow-sm shadow-[#00B8DD]/20';
                  } else if (isFlagged) {
                    btnClass = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500 font-bold';
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
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend (Chú thích) */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600" />
              <span>Đã làm ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
              <span>Chưa làm ({exam.questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-500" />
              <span>Đánh dấu cờ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-[#00B8DD] bg-[#00B8DD]" />
              <span>Đang chọn</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer CTA */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 shrink-0">
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-black rounded-xl py-3 text-xs shadow-lg shadow-[#00B8DD]/20"
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
        title={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#00B8DD]/10 dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#00B8DD]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Xác Nhận Nộp Bài Thi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Vui lòng kiểm tra lại tiến độ làm bài trước khi kết thúc
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {/* Progress Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            {/* Completion rate bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tiến độ hoàn thành:</span>
                <span className="font-mono font-bold text-[#007D99] dark:text-[#00B8DD]">
                  {Math.round((answeredCount / (exam.questions.length || 1)) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00B8DD] to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round((answeredCount / (exam.questions.length || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metric Items */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Đã làm
                </span>
                <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  {answeredCount} / {exam.questions.length}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Chưa trả lời
                </span>
                <strong
                  className={cn(
                    'text-sm font-bold font-mono mt-0.5 block',
                    exam.questions.length - answeredCount > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {exam.questions.length - answeredCount} câu
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Thời gian
                </span>
                <strong className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">
                  {formatTimer(secondsElapsed)}
                </strong>
              </div>
            </div>
          </div>

          {/* Status Alert Banner */}
          {exam.questions.length - answeredCount > 0 ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  Bạn vẫn còn {exam.questions.length - answeredCount} câu chưa trả lời
                </p>
                <p className="text-amber-700/90 dark:text-amber-400/90 leading-relaxed text-[11px]">
                  Các câu bỏ trống sẽ không được tính điểm. Bạn có thể chọn quay lại làm tiếp để tối đa hóa điểm số hoặc xác nhận nộp bài ngay.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">
                  Tuyệt vời! Bạn đã hoàn thành 100% câu hỏi
                </p>
                <p className="text-emerald-700/90 dark:text-emerald-400/90 text-[11px] mt-0.5">
                  Hệ thống sẵn sàng chấm điểm tự động và ghi nhận kết quả cho bạn.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold px-4 cursor-pointer text-xs sm:text-sm"
            >
              Tiếp Tục Làm Bài
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleSubmitExam(false);
              }}
              className="bg-gradient-to-r from-[#00B8DD] to-[#009bbd] hover:brightness-105 text-white font-black rounded-xl px-5 shadow-sm shadow-[#00B8DD]/20 cursor-pointer text-xs sm:text-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác Nhận Nộp Bài
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal Báo Cáo Sai Sót Câu Hỏi Cho Ban Khảo Thí */}
      {reportingQuestion && (
        <ReportQuestionModal
          isOpen={!!reportingQuestion}
          onClose={() => setReportingQuestion(null)}
          questionId={reportingQuestion.id}
          questionTitle={reportingQuestion.title}
          subjectName={exam.subjectName}
          questionContentSnippet={reportingQuestion.content}
        />
      )}
    </div>
  );
}

function ExamRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  const olympiadId = searchParams.get('olympiadId');
  const subjectSlug = searchParams.get('subject') || 'toan-hoc';
  const levelParam = (searchParams.get('level') || 'basic').toUpperCase() as PracticeLevel;

  const isOlympiad =
    !!olympiadId ||
    levelParam === 'PROVINCIAL_EXCELLENT' ||
    levelParam === 'NATIONAL_EXCELLENT';

  const isGatedExam = isOlympiad || levelParam === 'ADVANCED';

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    if (isGatedExam && !isAuthenticated) {
      const currentUrl =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '';
      toast.warning('Yêu cầu đăng nhập tài khoản!', {
        description:
          'Bạn cần đăng nhập tài khoản học sinh để tham gia kỳ thi Nâng cao & Học sinh giỏi.',
      });
      router.replace(`/login/student?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [isMounted, isGatedExam, isAuthenticated, router]);

  const olympiadExam = React.useMemo(() => {
    if (!isOlympiad) return null;
    if (olympiadId) {
      const found = getOlympiadExamById(olympiadId);
      if (found) return found;
    }
    const matched = getOlympiadExamsBySubject(subjectSlug, levelParam);
    if (matched.length > 0) return matched[0];
    return null;
  }, [isOlympiad, olympiadId, subjectSlug, levelParam]);

  // Nếu là kỳ thi nâng cao / HSG mà chưa login, hiển thị màn hình khóa trong khi đang chuyển hướng
  if (isGatedExam && (!isMounted || !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Kỳ Thi Yêu Cầu Đăng Nhập</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Cấp độ Nâng cao & HSG yêu cầu tài khoản học sinh để ghi nhận kết quả và mở khóa đầy đủ tính năng. Đang chuyển hướng bạn đến cổng đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  if (isOlympiad && olympiadExam) {
    if (olympiadExam.examType === 'CODING') {
      return <CodingExamRoom exam={olympiadExam} />;
    } else {
      return <OlympiadEssayExamRoom exam={olympiadExam} />;
    }
  }

  return <StandardExamRoomContent />;
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
