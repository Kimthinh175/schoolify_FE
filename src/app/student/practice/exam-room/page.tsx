'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  Calculator,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Flag,
  Flame,
  HelpCircle,
  Home,
  ListOrdered,
  Lock,
  PenTool,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getPracticeExam,
  getSystemQuestionBank,
  getChaptersBySubject,
  getNextChapterInTrack,
  PracticeExamPackage,
  PracticeMode,
  ExamQuestion,
  ExamFormat,
  QuestionDifficulty,
} from '@/services/mock/practice-flow-data';
import { PracticeLevel } from '@/types/subject';
import { useAuthStore } from '@/store/auth.store';
import { getGuestOnboarding, recordGuestChapterCompletion } from '@/lib/semester-utils';
import { buildTopicRoadmapHref } from '@/lib/topic-route-utils';
import { GradeOnboardingModal } from '@/components/features/student/practice/GradeOnboardingModal';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { cn } from '@/lib/utils';
import { SubjectEssayEditor } from '@/components/features/student/practice/SubjectEssayEditor';
import { MathRenderer } from '@/components/ui/math-renderer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Navbar } from '@/components/layout/Navbar';
import { ReportQuestionModal } from '@/components/features/student/practice/ReportQuestionModal';
import {
  buildSharedPatternHint,
  generateRemediationExamPackage,
  generateThreeSameTypeQuestions,
  QuickDrillQuestion,
} from '@/services/remediation-engine.service';
import {
  knowledgeProfileService,
  BehaviorHistoryRecord,
  PersonalizedRoadmapResponse,
  QuickDrillTurnOutcome,
} from '@/services/knowledge-profile.service';
import { examSnapshotService, ExamSnapshot, generateAttemptToken } from '@/services/exam-snapshot.service';
import { ExamSnapshotModal } from '@/components/features/student/practice/ExamSnapshotModal';
import { CodingExamRoom } from '@/components/features/student/practice/CodingExamRoom';
import { OlympiadEssayExamRoom } from '@/components/features/student/practice/OlympiadEssayExamRoom';
import {
  createExamTimerManager,
  ExamTimerManager,
  formatExamTimer,
  ExamTopBarTimerBadge,
  ExamSideBarTimerCard,
} from '@/components/features/student/practice/ExamTimerManager';
import { getOlympiadExamById, getOlympiadExamsBySubject } from '@/services/mock/olympiad-exams';
import { examOfflineStorage } from '@/services/exam-offline-storage.service';
import {
  examPointsService,
  getCachedPointsBalance,
  getExamLevelCost,
} from '@/services/exam-points.service';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import { TiaSangIcon } from '@/components/ui/point-icons';
import { studentExamsService } from '@/services/student-exams.service';
import { AgentChatMessageContent } from '@/components/features/agent/AgentChatMessageContent';
import { Loader2 } from 'lucide-react';
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
  const { user, currentRole } = useAuthStore();
  const isAdmin =
    (currentRole as string) === 'ADMIN' ||
    currentRole === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';

  const subjectSlug = searchParams.get('subject') || 'toan-hoc';
  const levelParam = (searchParams.get('level') || 'basic').toUpperCase() as PracticeLevel;

  const gradeParam = Number(searchParams.get('grade') || '12');
  const chapterParam = Number(searchParams.get('chapter') || '1');
  const formatParam = (searchParams.get('format') || 'quiz').toUpperCase() as ExamFormat;
  const countParam = searchParams.get('count') ? Number(searchParams.get('count')) : undefined;
  const durationParam = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined;
  const quizCountParam = searchParams.get('quizCount') ? Number(searchParams.get('quizCount')) : undefined;
  const essayCountParam = searchParams.get('essayCount') ? Number(searchParams.get('essayCount')) : undefined;
  const practiceModeParam: PracticeMode =
    searchParams.get('practiceMode')?.toUpperCase() === 'MOCK_EXAM' ? 'MOCK_EXAM' : 'TOPIC';
  const difficultyParam = (searchParams.get('difficulty')?.toUpperCase() || 'ALL') as
    | QuestionDifficulty
    | 'ALL';
  const topicTagParam = searchParams.get('topicTag') || undefined;
  const trackParam = searchParams.get('track') || undefined;
  const modeParam = searchParams.get('mode') || '';
  const isAssessment = levelParam === 'ASSESSMENT' || modeParam === 'diagnostic';

  const activeChapterMeta = React.useMemo(() => {
    const list = getChaptersBySubject(subjectSlug, gradeParam);
    return list.find((ch) => ch.id === chapterParam) || null;
  }, [subjectSlug, gradeParam, chapterParam]);

  const activeChapterTrack =
    activeChapterMeta?.track ||
    trackParam ||
    (subjectSlug === 'toan-hoc' ? 'TOAN_SO' : 'DEFAULT');

  const nextChapterInTrack = React.useMemo(
    () => getNextChapterInTrack(subjectSlug, gradeParam, chapterParam),
    [subjectSlug, gradeParam, chapterParam]
  );

  const [guestLoginModalOpen, setGuestLoginModalOpen] = React.useState(false);
  const [guestLoginTargetLabel, setGuestLoginTargetLabel] = React.useState(
    'Lưu kết quả & mở khóa lộ trình chương tiếp theo'
  );
  const [guestLoginReturnUrl, setGuestLoginReturnUrl] = React.useState<string>('');

  const computedExamId = `exam-${subjectSlug}-${levelParam.toLowerCase()}-g${gradeParam}-ch${chapterParam}-${formatParam.toLowerCase()}-${practiceModeParam.toLowerCase()}-${difficultyParam.toLowerCase()}-${quizCountParam || countParam || 'def'}`;
  const attemptTokenParam = searchParams.get('attemptToken') || searchParams.get('token');

  // Submission & Confirmation modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [resultActiveTab, setResultActiveTab] = React.useState<
    'overview' | 'gap_analysis' | 'roadmap_sync' | 'solutions'
  >('overview');

  // Trạng thái kiểm tra số dư Tia Sáng TRƯỚC khi cho phép tạo đề & khóa phiên thi
  const [outOfPointsBlocked, setOutOfPointsBlocked] = React.useState<{
    isBlocked: boolean;
    currentPoints: number;
    requiredPoints: number;
    levelLabel: string;
  }>({
    isBlocked: false,
    currentPoints: 0,
    requiredPoints: 3,
    levelLabel: 'Cơ bản',
  });
  const [isPointsVerified, setIsPointsVerified] = React.useState<boolean>(() => {
    if (attemptTokenParam || isAdmin) return true;
    if (typeof window !== 'undefined') {
      const deductedKey = `schoolify_started_pts_${computedExamId}`;
      if (sessionStorage.getItem(deductedKey) === '1') return true;
    }
    return false;
  });

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
    return getPracticeExam(subjectSlug, levelParam, gradeParam, chapterParam, formatParam, {
      requestedCount: countParam,
      quizCount: quizCountParam,
      essayCount: essayCountParam,
      durationMinutes: durationParam,
      practiceMode: practiceModeParam,
      targetDifficulty: difficultyParam,
      topicTagFilter: topicTagParam,
    });
  });

  // Đồng bộ đề thi từ Backend NestJS API (CHỈ thực thi sau khi đã kiểm tra đủ Tia Sáng!)
  React.useEffect(() => {
    if (attemptTokenParam || isSubmitted) return;
    if (!isPointsVerified || outOfPointsBlocked.isBlocked) return;

    let isCancelled = false;

    const syncOrFetchExam = async () => {
      // 1. Nếu đang có phiên thi dở dang hợp lệ, giữ nguyên phiên
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
        if (!isCancelled) setExam(restored);
        return;
      }

      // 2. Nếu đã nộp bài, không sinh lại đề đè lên kết quả
      if (isSubmitted) return;

      // 3. Tải đề thi ma trận từ Backend API (kèm fallback transparent)
      try {
        const liveExam = await studentExamsService.generateMatrixExam({
          subjectSlug,
          grade: gradeParam,
          chapterId: chapterParam,
          totalQuestions: quizCountParam || countParam || 10,
          durationMinutes: durationParam,
          practiceMode: practiceModeParam,
          targetDifficulty: difficultyParam,
          topicTagFilter: topicTagParam,
          level: levelParam,
          format: formatParam,
        });

        if (!isCancelled && liveExam && Array.isArray(liveExam.questions) && liveExam.questions.length > 0) {
          setExam(liveExam);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`schoolify_pkg_${computedExamId}`, JSON.stringify(liveExam));
            } catch {}
          }
        }
      } catch (err: any) {
        if (!isCancelled && (err?.isInsufficientPoints || err?.errorCode === 'INSUFFICIENT_EXAM_POINTS')) {
          const costInfo = getExamLevelCost(levelParam);
          examOfflineStorage.clearActiveExamSession().catch(() => {});
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(`schoolify_pkg_${computedExamId}`);
              sessionStorage.removeItem(`schoolify_started_pts_${computedExamId}`);
            } catch {}
          }
          setIsPointsVerified(false);
          setOutOfPointsBlocked({
            isBlocked: true,
            currentPoints: Math.max(0, Number(err?.data?.currentPoints ?? 0)),
            requiredPoints: Number(err?.data?.requiredPoints ?? costInfo.costPoints),
            levelLabel: err?.data?.levelLabel || costInfo.label,
          });
          return;
        }
        console.warn('[ExamRoom] Lỗi tải đề từ backend, giữ nguyên đề hiện tại:', err);
      }
    };

    syncOrFetchExam();
    return () => {
      isCancelled = true;
    };
  }, [
    computedExamId,
    subjectSlug,
    levelParam,
    gradeParam,
    chapterParam,
    formatParam,
    countParam,
    quizCountParam,
    essayCountParam,
    durationParam,
    practiceModeParam,
    difficultyParam,
    topicTagParam,
    isSubmitted,
    attemptTokenParam,
    isPointsVerified,
    outOfPointsBlocked.isBlocked,
  ]);

  // Đồng bộ các câu hỏi đã được Admin chỉnh sửa trong PostgreSQL (đè lên câu hỏi hiện tại nếu có)
  const syncedPgExamIdRef = React.useRef<string>('');
  React.useEffect(() => {
    const qIds = exam.questions.map((q) => q.id).filter(Boolean);
    const sig = `${exam.id}::${qIds.join(',')}`;
    if (!qIds.length || syncedPgExamIdRef.current === sig) return;
    syncedPgExamIdRef.current = sig;

    let cancelled = false;
    studentExamsService
      .getQuestionsByIds(qIds)
      .then((pgRows) => {
        if (cancelled || !Array.isArray(pgRows) || pgRows.length === 0) return;
        const pgMap = new Map<string, any>();
        for (const r of pgRows) {
          if (r?.id) pgMap.set(String(r.id), r);
        }
        if (pgMap.size === 0) return;

        setExam((prev) => {
          let changed = false;
          const nextQuestions = prev.questions.map((q) => {
            const ov = pgMap.get(q.id);
            if (!ov) return q;
            changed = true;
            return {
              ...q,
              title: ov.title || q.title,
              content: ov.content || q.content,
              explanation: ov.explanation ?? q.explanation,
              topicTag: ov.topicTag || q.topicTag,
              trapTag: ov.trapTag || q.trapTag,
              correctChoice: (ov.correctChoice || q.correctChoice || 'A') as 'A' | 'B' | 'C' | 'D',
              choices:
                Array.isArray(ov.choices) && ov.choices.length > 0 ? ov.choices : q.choices,
              statements:
                Array.isArray(ov.statements) && ov.statements.length > 0
                  ? ov.statements
                  : q.statements,
              shortAnswerCorrect:
                ov.shortAnswerCorrect !== undefined
                  ? String(ov.shortAnswerCorrect)
                  : q.shortAnswerCorrect,
              essaySampleAnswer:
                ov.essaySampleAnswer !== undefined
                  ? String(ov.essaySampleAnswer)
                  : q.essaySampleAnswer,
            };
          });
          if (!changed) return prev;
          const nextPkg = { ...prev, questions: nextQuestions };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`schoolify_pkg_${computedExamId}`, JSON.stringify(nextPkg));
            } catch {}
          }
          return nextPkg;
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [exam.id, exam.questions, computedExamId]);

  // =========================================================================
  // ADMIN INSPECTOR & DIRECT QUESTION / ANSWER EDITOR STATE (POSTGRESQL REAL)
  // =========================================================================
  const [adminEditingQuestionId, setAdminEditingQuestionId] = React.useState<string | null>(null);
  const [adminSavingQuestionEdit, setAdminSavingQuestionEdit] = React.useState(false);
  const [adminEditDraft, setAdminEditDraft] = React.useState<{
    title: string;
    topicTag: string;
    content: string;
    explanation: string;
    correctChoice: 'A' | 'B' | 'C' | 'D';
    choices: Array<{ key: 'A' | 'B' | 'C' | 'D'; content: string }>;
    statements: Array<{
      subId: 'a' | 'b' | 'c' | 'd';
      statement: string;
      isCorrect: boolean;
      explanation: string;
    }>;
    shortAnswerCorrect: string;
    essaySampleAnswer: string;
  }>({
    title: '',
    topicTag: '',
    content: '',
    explanation: '',
    correctChoice: 'A',
    choices: [
      { key: 'A', content: '' },
      { key: 'B', content: '' },
      { key: 'C', content: '' },
      { key: 'D', content: '' },
    ],
    statements: [
      { subId: 'a', statement: '', isCorrect: true, explanation: '' },
      { subId: 'b', statement: '', isCorrect: false, explanation: '' },
      { subId: 'c', statement: '', isCorrect: true, explanation: '' },
      { subId: 'd', statement: '', isCorrect: false, explanation: '' },
    ],
    shortAnswerCorrect: '',
    essaySampleAnswer: '',
  });

  const handleOpenAdminEditQuestion = React.useCallback((q: ExamQuestion) => {
    setAdminEditingQuestionId((prev) => (prev === q.id ? null : q.id));
    setAdminEditDraft({
      title: q.title || '',
      topicTag: q.topicTag || q.topic || '',
      content: q.content || '',
      explanation: q.explanation || '',
      correctChoice: (q.correctChoice || 'A') as 'A' | 'B' | 'C' | 'D',
      choices:
        Array.isArray(q.choices) && q.choices.length > 0
          ? q.choices.map((c) => ({ key: c.key, content: c.content }))
          : [
              { key: 'A', content: '' },
              { key: 'B', content: '' },
              { key: 'C', content: '' },
              { key: 'D', content: '' },
            ],
      statements:
        Array.isArray(q.statements) && q.statements.length > 0
          ? q.statements.map((st) => ({
              subId: st.subId,
              statement: st.statement,
              isCorrect: Boolean(st.isCorrect),
              explanation: st.explanation || '',
            }))
          : [
              { subId: 'a', statement: '', isCorrect: true, explanation: '' },
              { subId: 'b', statement: '', isCorrect: false, explanation: '' },
              { subId: 'c', statement: '', isCorrect: true, explanation: '' },
              { subId: 'd', statement: '', isCorrect: false, explanation: '' },
            ],
      shortAnswerCorrect: q.shortAnswerCorrect || '',
      essaySampleAnswer: q.essaySampleAnswer || '',
    });
  }, []);

  const handleSaveAdminEditQuestion = React.useCallback(
    async (q: ExamQuestion) => {
      if (adminSavingQuestionEdit) return;
      setAdminSavingQuestionEdit(true);
      try {
        const updatedQ: ExamQuestion = {
          ...q,
          title: adminEditDraft.title.trim() || q.title,
          topicTag: adminEditDraft.topicTag.trim() || q.topicTag,
          topic: adminEditDraft.topicTag.trim() || q.topic,
          content: adminEditDraft.content,
          explanation: adminEditDraft.explanation,
          ...(q.type === 'MULTIPLE_CHOICE'
            ? {
                correctChoice: adminEditDraft.correctChoice,
                choices: adminEditDraft.choices,
              }
            : {}),
          ...(q.type === 'TRUE_FALSE'
            ? {
                statements: adminEditDraft.statements,
              }
            : {}),
          ...(q.type === 'SHORT_ANSWER'
            ? {
                shortAnswerCorrect: adminEditDraft.shortAnswerCorrect.trim(),
              }
            : {}),
          ...(q.type === 'ESSAY'
            ? {
                essaySampleAnswer: adminEditDraft.essaySampleAnswer,
              }
            : {}),
        };

        await studentExamsService.updateQuestionDirect(q.id, {
          title: updatedQ.title,
          topicTag: updatedQ.topicTag,
          content: updatedQ.content,
          explanation: updatedQ.explanation,
          subject: subjectSlug,
          grade: updatedQ.grade || gradeParam,
          chapterId: updatedQ.chapterId || chapterParam,
          type: updatedQ.type,
          correctChoice: updatedQ.correctChoice,
          choices: updatedQ.choices,
          statements: updatedQ.statements,
          shortAnswerCorrect: updatedQ.shortAnswerCorrect,
          essaySampleAnswer: updatedQ.essaySampleAnswer,
        });

        setExam((prev) => {
          const nextQuestions = prev.questions.map((item) =>
            item.id === q.id ? updatedQ : item
          );
          const nextPkg = { ...prev, questions: nextQuestions };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`schoolify_pkg_${computedExamId}`, JSON.stringify(nextPkg));
            } catch {}
          }
          return nextPkg;
        });

        setAdminEditingQuestionId(null);
        toast.success('Đã lưu chỉnh sửa câu hỏi & đáp án vào PostgreSQL!');
      } catch (err: any) {
        toast.error(err?.message || 'Lỗi khi lưu chỉnh sửa câu hỏi vào PostgreSQL');
      } finally {
        setAdminSavingQuestionEdit(false);
      }
    },
    [
      adminSavingQuestionEdit,
      adminEditDraft,
      subjectSlug,
      gradeParam,
      chapterParam,
      computedExamId,
    ]
  );

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

  // Timer state (Tách biệt khỏi React state của ExamRoomPage để tránh re-render toàn bộ đề thi mỗi giây)
  const totalLimitSeconds = exam.durationMinutes * 60;
  const [timerManager, setTimerManager] = React.useState<ExamTimerManager | null>(null);
  const [submittedTimeSpent, setSubmittedTimeSpent] = React.useState(0);

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

  const [activeReviewFilter, setActiveReviewFilter] = React.useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');
  const [reportingQuestion, setReportingQuestion] = React.useState<ExamQuestion | null>(null);

  // Remediation & Snapshot states
  const [showRemediationMode, setShowRemediationMode] = React.useState(true);
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
  const [currentAttemptToken, setCurrentAttemptToken] = React.useState<string | null>(attemptTokenParam || null);
  const [isRestoringResult, setIsRestoringResult] = React.useState(!!attemptTokenParam);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = React.useState(false);
  const [viewingSnapshot, setViewingSnapshot] = React.useState<ExamSnapshot | null>(null);

  // Khôi phục kết quả bài thi từ attemptToken bảo mật (hỗ trợ F5 giữ nguyên kết quả & kiểm tra quyền truy cập)
  React.useEffect(() => {
    if (!attemptTokenParam || isSubmitted) return;

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
        setSubmittedTimeSpent(snap.timeSpentSeconds || 0);
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
  // CHỈ khởi tạo khóa chống thoát phòng thi SAU KHI đã xác thực đủ Tia Sáng!
  React.useEffect(() => {
    if (attemptTokenParam || isSubmitted) return;
    if (!isPointsVerified || outOfPointsBlocked.isBlocked) return;

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

        if (remaining <= 0) {
          handleSubmitExam(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    exam.id,
    exam.durationMinutes,
    exam.title,
    totalLimitSeconds,
    attemptTokenParam,
    isSubmitted,
    isPointsVerified,
    outOfPointsBlocked.isBlocked,
  ]);

  // Submit Exam Handler với Offline Queue & Auto-Sync
  const handleSubmitExam = async (isAutoSubmit = false) => {
    // 1. Tính toán thời gian làm bài đồng bộ trước (tối thiểu 1 giây, chống race condition 0s)
    const elapsed = timerManager ? timerManager.getElapsed() : totalLimitSeconds;
    const timeSpent = Math.max(1, Math.round(Number(elapsed || 1)));
    setSubmittedTimeSpent(timeSpent);

    setIsSubmitted(true);
    setResultActiveTab('overview');
    setIsSubmitModalOpen(false);
    await examOfflineStorage.clearActiveExamSession();

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`schoolify_pkg_${exam.id}`);
      } catch {}
    }
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
      studentExamsService
        .submitExamResult({
          sessionId: exam.id,
          examId: exam.id,
          examTitle: exam.title,
          subjectSlug: exam.subjectSlug,
          grade: exam.grade,
          chapterId: exam.chapterId,
          timeSpentSeconds: timeSpent,
          answers: answersPayload,
          isAutoSubmit,
        })
        .catch((err) => console.warn('[handleSubmitExam] Direct BE submit skipped:', err));

      await examOfflineStorage.syncPendingSubmissions();
    }
    toast.success('Đã nộp bài thành công!');
  };

  // 2. Live Timer Manager độc lập (CHỈ chạy sau khi đã xác thực đủ Tia Sáng!)
  React.useEffect(() => {
    if (isSubmitted || attemptTokenParam) return;
    if (!isPointsVerified || outOfPointsBlocked.isBlocked) return;

    const manager = createExamTimerManager(totalLimitSeconds, () => {
      handleSubmitExam(true);
    });
    setTimerManager(manager);

    return () => {
      manager.destroy();
    };
  }, [isSubmitted, attemptTokenParam, isPointsVerified, outOfPointsBlocked.isBlocked, totalLimitSeconds]);

  const formatTimer = formatExamTimer;

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
      timeSpentSeconds: submittedTimeSpent,
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
    submittedTimeSpent,
  ]);

  const hasProcessedRewardRef = React.useRef(false);

  const handleRetakeExam = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`schoolify_pkg_${exam.id}`);
      } catch {}
    }

    let fresh: PracticeExamPackage;
    try {
      fresh = await studentExamsService.generateMatrixExam({
        subjectSlug,
        grade: gradeParam,
        chapterId: chapterParam,
        totalQuestions: quizCountParam || countParam || 10,
        durationMinutes: durationParam,
        practiceMode: practiceModeParam,
        targetDifficulty: difficultyParam,
        topicTagFilter: topicTagParam,
        level: levelParam,
        format: formatParam,
      });
    } catch (err: any) {
      if (err?.isInsufficientPoints || err?.errorCode === 'INSUFFICIENT_EXAM_POINTS') {
        const costInfo = getExamLevelCost(levelParam);
        setOutOfPointsBlocked({
          isBlocked: true,
          currentPoints: Math.max(0, Number(err?.data?.currentPoints ?? 0)),
          requiredPoints: Number(err?.data?.requiredPoints ?? costInfo.costPoints),
          levelLabel: err?.data?.levelLabel || costInfo.label,
        });
        return;
      }
      fresh = getPracticeExam(subjectSlug, levelParam, gradeParam, chapterParam, formatParam, {
        requestedCount: countParam,
        quizCount: quizCountParam,
        essayCount: essayCountParam,
        durationMinutes: durationParam,
        practiceMode: practiceModeParam,
        targetDifficulty: difficultyParam,
        topicTagFilter: topicTagParam,
      });
    }
    setExam(fresh);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`schoolify_pkg_${fresh.id}`, JSON.stringify(fresh));
        sessionStorage.setItem(`schoolify_started_pts_${fresh.id}`, 'true');
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
    setSubmittedTimeSpent(0);
    hasProcessedRewardRef.current = false;
    setIsSubmitted(false);
    setResultActiveTab('overview');
    setShowRemediationMode(true);
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

  const [knowledgeUpdate, setKnowledgeUpdate] = React.useState<{
    topicDeltas: Array<{
      topicTag: string;
      chapterId: number;
      previousScore: number;
      currentScore: number;
      deltaScore: number;
      previousStatus: string;
      currentStatus: string;
      attemptedInExam: number;
      correctInExam: number;
      topTrapTag?: string | null;
    }>;
    nextRecommendedStep: any | null;
  } | null>(null);

  // Tự động lưu Snapshot đề thi khi nộp bài kèm attemptToken an toàn
  React.useEffect(() => {
    if (isSubmitted && examResult && !currentSnapshotId && !attemptTokenParam) {
      const snapId = `SNAP-${Date.now()}`;
      const token = generateAttemptToken();
      const wrongIds = examResult.questionResults
        .filter((r) => !r.isCorrect)
        .map((r) => r.question.id);
      const guestInfo = getGuestOnboarding();

      const snapshot: ExamSnapshot = {
        id: snapId,
        attemptToken: token,
        userId: user?.id || 'guest',
        userFullName: user?.fullname || guestInfo?.fullname || 'Học sinh',
        examId: exam.id,
        examTitle: exam.title,
        subjectSlug: exam.subjectSlug,
        subjectName: exam.subjectName,
        grade: exam.grade,
        chapterId: exam.chapterId,
        chapterName: exam.chapterName,
        level: levelParam,
        practiceMode: practiceModeParam,
        track: activeChapterTrack,
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

      // Nếu là Khách làm thử (chưa đăng nhập) -> Lưu tiến độ Sao & bài nộp tạm vào localStorage để đồng bộ vào PostgreSQL ngay khi Login
      if (!user?.id) {
        recordGuestChapterCompletion({
          subjectSlug: exam.subjectSlug,
          grade: exam.grade,
          track: activeChapterTrack,
          chapterId: exam.chapterId,
          level: levelParam,
          score: examResult.finalScore,
          submissionPayload: {
            attemptToken: token,
            examId: exam.id,
            examTitle: exam.title,
            subjectSlug: exam.subjectSlug,
            grade: exam.grade,
            chapterId: exam.chapterId,
            level: levelParam,
            practiceMode: practiceModeParam,
            timeSpentSeconds: examResult.timeSpentSeconds,
            scoreOverride: examResult.finalScore,
            answers: snapshot.originalExam.studentAnswers,
            snapshotData: snapshot,
          },
        });
      }

      // Cập nhật URL với attemptToken bảo mật (chống F5 bị mất màn hình kết quả)
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('attemptToken', token);
          window.history.replaceState(null, '', url.toString());
        } catch {}
      }

      examSnapshotService
        .saveExamSnapshot(snapshot)
        .then((ku) => {
          if (ku) {
            setKnowledgeUpdate(ku);
          }
        })
        .catch((err) => {
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
    levelParam,
    practiceModeParam,
    activeChapterTrack,
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
      // Đặt thời gian làm bài vô hạn (durationMinutes = 0)
      pkg.durationMinutes = 0;

      // Lưu đề thi vào sessionStorage để chuyển sang phòng khắc phục chuyên biệt
      try {
        sessionStorage.setItem(
          'schoolify_remediation_exam_data',
          JSON.stringify({
            remediationExam: pkg,
            originalExam: exam,
            snapshotId: currentSnapshotId,
            attemptToken: attemptTokenParam,
          })
        );
      } catch {}

      setRemediationExam(pkg);
      setRemediationChoices({});
      setRemediationTrueFalse({});
      setRemediationShortAnswers({});
      setRemediationSubmitted(false);
      setRemediationResult(null);
      setIsGeneratingRemediation(false);

      toast.success(
        `Đã tạo xong đề mới (${pkg.questions.length} câu biến thể vô hạn thời gian)! Đang chuyển bạn sang phòng thi khắc phục... 🚀`
      );

      // Chuyển ngay sang trang mới chuyên biệt cho việc khắc phục câu sai
      router.push('/student/practice/remediation');
    }, 950);
  };

  // Trợ giúp 1 lần/câu khi đang làm bài trong Chế độ Chuyên đề (practiceModeParam === 'TOPIC')
  const topicHintsStorageKey = `schoolify_topic_hints_${computedExamId}`;
  const [topicHintsByQuestion, setTopicHintsByQuestion] = React.useState<
    Record<string, { doubt: string; hintMarkdown: string }>
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`schoolify_topic_hints_${computedExamId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch {}
    }
    return {};
  });
  const [activeHintQuestionId, setActiveHintQuestionId] = React.useState<string | null>(null);
  const [hintDoubtInputs, setHintDoubtInputs] = React.useState<Record<string, string>>({});
  const [loadingHintQuestionId, setLoadingHintQuestionId] = React.useState<string | null>(null);

  const handleRequestTopicQuestionHint = async (q: ExamQuestion) => {
    if (topicHintsByQuestion[q.id] || loadingHintQuestionId === q.id) return;
    const studentDoubt = (hintDoubtInputs[q.id] || '').trim();
    const topicTag = q.topicTag || exam.chapterName || 'Chuyên đề trọng tâm';
    setLoadingHintQuestionId(q.id);

    try {
      const res = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'usr-student-01',
          message:
            studentDoubt ||
            `Gợi ý hướng giải và 1 ví dụ logic tương đương cho câu "${q.title}"`,
          subject: subjectSlug,
          grade: gradeParam,
          questionContext: {
            mode: 'SOCRATIC_TOPIC_HINT',
            questionId: q.id,
            title: q.title,
            content: q.content,
            choices: q.choices,
            topicTag,
            cognitiveTag: q.cognitiveTag || 'Thông hiểu',
            trapTag: q.trapTag,
            studentDoubt,
            subjectSlug,
            grade: gradeParam,
          },
        }),
      });
      const json = await res.json();
      const payload = json?.data || json;
      const hintMarkdown =
        payload?.message ||
        '💡 **Hướng tư duy:** Hãy xác định điều kiện xác định và công thức cốt lõi của chuyên đề này trước khi biến đổi phương trình.';

      setTopicHintsByQuestion((prev) => {
        const next = {
          ...prev,
          [q.id]: {
            doubt: studentDoubt,
            hintMarkdown,
          },
        };
        try {
          localStorage.setItem(topicHintsStorageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch {
      toast.error('Không thể tải gợi ý lúc này. Bạn vui lòng thử lại nhé!');
    } finally {
      setLoadingHintQuestionId(null);
    }
  };

  // Kích hoạt Gia sư AI Socratic phân tích câu hỏi hiện tại theo Ma trận Tag 4 chiều
  const handleAskSocraticAiTutor = (q: ExamQuestion) => {
    if (typeof window === 'undefined') return;
    const studentChoice = multipleChoices[q.id];
    const topicTag = q.topicTag || exam.chapterName || 'Chuyên đề trọng tâm';
    const cognitiveTag = q.cognitiveTag || 'Thông hiểu';
    const trapTag =
      q.trapTag || 'Cẩn thận kiểm tra điều kiện xác định và dấu biểu thức trước khi kết luận';

    window.dispatchEvent(
      new CustomEvent('schoolify:ask-ai-tutor', {
        detail: {
          questionId: q.id,
          title: q.title,
          content: q.content,
          choices: q.choices,
          studentChoice,
          correctChoice: q.correctChoice,
          topicTag,
          cognitiveTag,
          trapTag,
          explanation: q.explanation,
          subjectSlug,
          grade: gradeParam,
          isSubmitted,
          prompt: `💡 Nhờ Gia sư AI gợi mở Socratic cho câu "${q.title}" [Tag: ${topicTag}]`,
        },
      })
    );
  };

  // ============================================================================
  // POPUP FULL MÀN HÌNH: LUYỆN LẠI NHANH 3 CÂU CÙNG DẠNG
  // - Gợi ý phương pháp chung chỉ hiện 1 lần ở đầu (vì 3 câu chung 1 dạng)
  // - Tách riêng 3 câu thành 3 lần làm độc lập (Lần 1/3, Lần 2/3, Lần 3/3)
  // - Cho phép Skip từng lần hoặc Skip các lần còn lại
  // - Không tính điểm khảo thí (isScored = false), lưu trực tiếp vào bảng PostgreSQL
  //   student_behavior_histories kèm tag đặc biệt #LUYEN_LAI_3_LAN_CUNG_DANG để
  //   đánh giá Tinh thần học tập & Trí thông minh và thiết kế lại lộ trình cá nhân.
  // ============================================================================
  const [quickDrillSourceQuestion, setQuickDrillSourceQuestion] =
    React.useState<ExamQuestion | null>(null);
  const [quickDrillQuestions, setQuickDrillQuestions] = React.useState<QuickDrillQuestion[]>([]);
  const [quickDrillSharedHint, setQuickDrillSharedHint] = React.useState<string>('');
  const [quickDrillSharedHintExpanded, setQuickDrillSharedHintExpanded] =
    React.useState<boolean>(true);
  const [quickDrillSharedAiHint, setQuickDrillSharedAiHint] = React.useState<string>('');
  const [quickDrillLoadingSharedAiHint, setQuickDrillLoadingSharedAiHint] =
    React.useState<boolean>(false);
  const [quickDrillActiveStep, setQuickDrillActiveStep] = React.useState<0 | 1 | 2>(0);
  const [quickDrillChoices, setQuickDrillChoices] = React.useState<
    Record<string, 'A' | 'B' | 'C' | 'D'>
  >({});
  const [quickDrillTrueFalse, setQuickDrillTrueFalse] = React.useState<
    Record<string, Record<string, boolean>>
  >({});
  const [quickDrillShortAnswers, setQuickDrillShortAnswers] = React.useState<
    Record<string, string>
  >({});
  const [quickDrillCheckedIds, setQuickDrillCheckedIds] = React.useState<Record<string, boolean>>(
    {}
  );
  const [quickDrillSkippedIds, setQuickDrillSkippedIds] = React.useState<Record<string, boolean>>(
    {}
  );
  const [quickDrillBehaviorSaved, setQuickDrillBehaviorSaved] = React.useState(false);
  const [quickDrillSavingBehavior, setQuickDrillSavingBehavior] = React.useState(false);
  const [syncedBehaviorRoadmap, setSyncedBehaviorRoadmap] =
    React.useState<PersonalizedRoadmapResponse | null>(null);

  const handleOpenQuickSingleQuestionDrill = (q: ExamQuestion) => {
    const threeVariants = generateThreeSameTypeQuestions(q);
    const sharedHint = buildSharedPatternHint(q);
    setQuickDrillSourceQuestion(q);
    setQuickDrillQuestions(threeVariants);
    setQuickDrillSharedHint(sharedHint);
    setQuickDrillSharedHintExpanded(true);
    setQuickDrillSharedAiHint('');
    setQuickDrillLoadingSharedAiHint(false);
    setQuickDrillActiveStep(0);
    setQuickDrillChoices({});
    setQuickDrillTrueFalse({});
    setQuickDrillShortAnswers({});
    setQuickDrillCheckedIds({});
    setQuickDrillSkippedIds({});
    setQuickDrillBehaviorSaved(false);
    setQuickDrillSavingBehavior(false);
  };

  const hasQuickDrillAnswer = (q: QuickDrillQuestion): boolean => {
    if (q.type === 'MULTIPLE_CHOICE') {
      return Boolean(quickDrillChoices[q.id]);
    }
    if (q.type === 'TRUE_FALSE') {
      const tf = quickDrillTrueFalse[q.id] || {};
      return (q.statements || []).some((st) => typeof tf[st.subId] === 'boolean');
    }
    if (q.type === 'SHORT_ANSWER') {
      return Boolean((quickDrillShortAnswers[q.id] || '').trim());
    }
    return false;
  };

  const isQuickDrillQuestionCorrect = (q: QuickDrillQuestion): boolean => {
    if (q.type === 'MULTIPLE_CHOICE') {
      return quickDrillChoices[q.id] === q.correctChoice;
    }
    if (q.type === 'TRUE_FALSE') {
      const tf = quickDrillTrueFalse[q.id] || {};
      const stmts = q.statements || [];
      return stmts.length > 0 && stmts.every((st) => tf[st.subId] === st.isCorrect);
    }
    if (q.type === 'SHORT_ANSWER') {
      const ans = (quickDrillShortAnswers[q.id] || '').trim().replace(',', '.');
      const target = (q.shortAnswerCorrect || '').trim().replace(',', '.');
      return Boolean(ans && target && ans.toLowerCase() === target.toLowerCase());
    }
    return false;
  };

  const handleRequestSharedAiHint = async () => {
    if (!quickDrillSourceQuestion || quickDrillSharedAiHint || quickDrillLoadingSharedAiHint) {
      return;
    }
    setQuickDrillLoadingSharedAiHint(true);
    const q = quickDrillSourceQuestion;
    const topicTag = q.topicTag || exam.chapterName || 'Chuyên đề trọng tâm';
    try {
      const res = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'usr-student-01',
          message: `Đưa ra 1 ví dụ tương đương ngắn gọn và quy trình giải chung cho dạng bài "${q.title}" (không lộ đáp án 3 câu đang luyện)`,
          subject: subjectSlug,
          grade: gradeParam,
          questionContext: {
            mode: 'SOCRATIC_TOPIC_HINT',
            questionId: q.id,
            title: q.title,
            content: q.content,
            choices: q.choices,
            topicTag,
            cognitiveTag: q.cognitiveTag || 'Thông hiểu',
            trapTag: q.trapTag,
            subjectSlug,
            grade: gradeParam,
          },
        }),
      });
      const json = await res.json();
      const payload = json?.data || json;
      if (payload?.message) {
        setQuickDrillSharedAiHint(payload.message);
      }
    } catch {
      toast.error('Không tải được ví dụ tương đương lúc này.');
    } finally {
      setQuickDrillLoadingSharedAiHint(false);
    }
  };

  // Thu thập ngầm hành vi 3 lần làm vào PostgreSQL (student_behavior_histories) + cập nhật Lộ trình
  const persistQuickDrillBehaviorToPostgres = async (
    nextChecked: Record<string, boolean>,
    nextSkipped: Record<string, boolean>,
    closeModalAfter = false
  ) => {
    if (!quickDrillSourceQuestion || quickDrillQuestions.length === 0) return;
    if (closeModalAfter) {
      setQuickDrillSourceQuestion(null);
    }
    if (quickDrillBehaviorSaved || quickDrillSavingBehavior) {
      return;
    }

    setQuickDrillSavingBehavior(true);
    const finalSkipped: Record<string, boolean> = { ...nextSkipped };
    quickDrillQuestions.forEach((qd) => {
      if (!nextChecked[qd.id] && !finalSkipped[qd.id]) {
        finalSkipped[qd.id] = true;
      }
    });
    setQuickDrillSkippedIds(finalSkipped);

    const turnOutcomes: QuickDrillTurnOutcome[] = quickDrillQuestions.map((qd, idx) => {
      const isChecked = Boolean(nextChecked[qd.id]);
      const isRight = isChecked && isQuickDrillQuestionCorrect(qd);
      return {
        turnIndex: idx + 1,
        questionId: qd.id,
        status: isChecked ? (isRight ? 'CORRECT' : 'WRONG') : 'SKIPPED',
        selectedKey: quickDrillChoices[qd.id] || undefined,
      };
    });

    const totalTurns = quickDrillQuestions.length;
    const completedTurns = turnOutcomes.filter((t) => t.status !== 'SKIPPED').length;
    const skippedTurns = turnOutcomes.filter((t) => t.status === 'SKIPPED').length;
    const correctTurns = turnOutcomes.filter((t) => t.status === 'CORRECT').length;
    const wrongTurns = turnOutcomes.filter((t) => t.status === 'WRONG').length;

    const topicTag =
      quickDrillSourceQuestion.topicTag || exam.chapterName || 'Chuyên đề trọng tâm';

    const saved = await knowledgeProfileService.recordQuickDrillBehavior({
      subjectSlug: exam.subjectSlug || subjectSlug,
      grade: exam.grade || gradeParam,
      chapterId: quickDrillSourceQuestion.chapterId || exam.chapterId || 1,
      topicTag,
      sourceQuestionId: quickDrillSourceQuestion.id,
      totalTurns,
      completedTurns,
      skippedTurns,
      correctTurns,
      wrongTurns,
      turnOutcomes,
    });

    setQuickDrillSavingBehavior(false);
    setQuickDrillBehaviorSaved(true);

    if (saved?.roadmap) {
      setSyncedBehaviorRoadmap(saved.roadmap);
    }
  };

  // Kiểm tra đáp án của Lần thứ idx (0, 1, 2)
  const handleCheckQuickDrillTurn = (qd: QuickDrillQuestion, idx: number) => {
    const nextChecked = { ...quickDrillCheckedIds, [qd.id]: true };
    const nextSkipped = { ...quickDrillSkippedIds };
    delete nextSkipped[qd.id];
    setQuickDrillCheckedIds(nextChecked);
    setQuickDrillSkippedIds(nextSkipped);

    const allResolved = quickDrillQuestions.every(
      (item) => Boolean(nextChecked[item.id] || nextSkipped[item.id])
    );
    if (allResolved) {
      persistQuickDrillBehaviorToPostgres(nextChecked, nextSkipped, false);
    }
  };

  // Skip Lần thứ idx (0, 1, 2) và chuyển ngay sang lần tiếp theo (hoặc đóng popup & lưu ngầm nếu hết 3 lần)
  const handleSkipQuickDrillTurn = (qd: QuickDrillQuestion, idx: number) => {
    const nextSkipped = { ...quickDrillSkippedIds, [qd.id]: true };
    setQuickDrillSkippedIds(nextSkipped);

    const allResolved = quickDrillQuestions.every(
      (item) => Boolean(quickDrillCheckedIds[item.id] || nextSkipped[item.id])
    );
    if (allResolved || idx >= quickDrillQuestions.length - 1) {
      persistQuickDrillBehaviorToPostgres(quickDrillCheckedIds, nextSkipped, true);
    } else {
      setQuickDrillActiveStep((idx + 1) as 0 | 1 | 2);
    }
  };


  // Đồng bộ Lộ trình Cá nhân từ PostgreSQL khi ở màn hình kết quả
  React.useEffect(() => {
    if (!isSubmitted) return;
    let isMounted = true;
    knowledgeProfileService
      .getPersonalizedRoadmap({
        subject: exam.subjectSlug || subjectSlug,
        grade: exam.grade || gradeParam,
      })
      .then((rm) => {
        if (!isMounted || !rm) return;
        setSyncedBehaviorRoadmap(rm);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isSubmitted, exam.subjectSlug, exam.grade, subjectSlug, gradeParam]);


  // Luyện bù ngay 5 câu trắc nghiệm đúng vào các Tag chuyên đề đang yếu (< 75%)

  const handleStartWeakTagRemediation5Q = (weakTags: string[]) => {
    if (!examResult) return;
    const wrongQs = examResult.questionResults
      .filter((r) => !r.isCorrect)
      .map((r) => r.question);

    const bank = getSystemQuestionBank().filter(
      (q) => q.subjectSlug === subjectSlug && q.type === 'MULTIPLE_CHOICE'
    );

    const targetTagSet = new Set(weakTags);
    const matchingTagPool = bank.filter(
      (q) => q.topicTag && targetTagSet.has(q.topicTag)
    );

    const seedQuestions =
      wrongQs.length > 0
        ? wrongQs
        : matchingTagPool.length > 0
        ? matchingTagPool
        : exam.questions.filter((q) => q.type === 'MULTIPLE_CHOICE');

    const basePkg = generateRemediationExamPackage(seedQuestions.slice(0, 5), exam);
    const selected5: ExamQuestion[] = [...basePkg.questions];

    // Bổ sung đủ 5 câu trắc nghiệm từ kho Tag yếu nếu số câu sai < 5
    const fallbackPool = [...matchingTagPool, ...bank, ...exam.questions];
    let idx = 0;
    while (selected5.length < 5 && fallbackPool.length > 0 && idx < 25) {
      const candidate = fallbackPool[idx % fallbackPool.length];
      if (candidate.type === 'MULTIPLE_CHOICE') {
        selected5.push({
          ...candidate,
          id: `rem5-q-${selected5.length + 1}-${Date.now()}-${idx}`,
          title: `Câu ${selected5.length + 1} [Luyện bù Tag: ${candidate.topicTag || exam.chapterName}]`,
          score: 2,
        });
      }
      idx++;
    }

    const pkg5: PracticeExamPackage = {
      ...basePkg,
      id: `rem-weak-tags-5q-${Date.now()}`,
      title: `Đề Luyện Bù 5 Câu Chuyên Biệt — ${weakTags[0] || exam.chapterName}`,
      durationMinutes: 0,
      totalPoints: 10,
      questions: selected5.slice(0, 5).map((q, i) => ({
        ...q,
        score: 2,
        title: q.title.startsWith('Câu') ? q.title : `Câu ${i + 1}: ${q.title}`,
      })),
    };

    setRemediationExam(pkg5);
    setRemediationChoices({});
    setRemediationTrueFalse({});
    setRemediationShortAnswers({});
    setRemediationSubmitted(false);
    setRemediationResult(null);
    setIsTakingRemediation(true);

    toast.success('⚡ Đã khởi tạo 5 câu luyện bù chuyên đề đang yếu!', {
      description: `Tập trung gỡ rối: ${weakTags.slice(0, 2).join(', ') || exam.chapterName}`,
    });

    setTimeout(() => {
      document
        .getElementById('remediation-runner-card')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
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

  // Khi bị chặn do hết Tia Sáng, giải phóng ngay lập tức mọi khóa chống thoát phòng thi
  React.useEffect(() => {
    if (outOfPointsBlocked.isBlocked) {
      examOfflineStorage.clearActiveExamSession().catch(() => {});
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`schoolify_pkg_${computedExamId}`);
          sessionStorage.removeItem(`schoolify_started_pts_${computedExamId}`);
          sessionStorage.removeItem(`schoolify_started_pts_${exam.id}`);
        } catch {}
      }
    }
  }, [outOfPointsBlocked.isBlocked, computedExamId, exam.id]);

  // Kiểm tra & Trừ điểm năng lượng TRƯỚC khi bắt đầu mở đề thi (PostgreSQL: Cơ bản -3đ, TB -4đ, Giỏi -9đ)
  React.useEffect(() => {
    if (attemptTokenParam || isSubmitted) {
      setIsPointsVerified(true);
      return;
    }

    if (isAdmin) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`schoolify_started_pts_${computedExamId}`, '1');
        sessionStorage.setItem(`schoolify_started_pts_${exam.id}`, '1');
      }
      setIsPointsVerified(true);
      return;
    }

    const deductedKey = `schoolify_started_pts_${computedExamId}`;
    const examDeductedKey = `schoolify_started_pts_${exam.id}`;
    if (
      typeof window !== 'undefined' &&
      (sessionStorage.getItem(deductedKey) === '1' ||
        sessionStorage.getItem(examDeductedKey) === '1')
    ) {
      sessionStorage.setItem(deductedKey, '1');
      sessionStorage.setItem(examDeductedKey, '1');
      setIsPointsVerified(true);
      return;
    }

    // Khách chưa đăng nhập: cho phép làm thử miễn phí 1 đề CƠ BẢN (không tạo user ảo hay trừ ví PostgreSQL)
    if (!user?.id) {
      const guest = getGuestOnboarding();
      if (guest && guest.trialUsedCount < 1 && (levelParam === 'BASIC' || isAssessment)) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(deductedKey, '1');
          sessionStorage.setItem(examDeductedKey, '1');
        }
        setIsPointsVerified(true);
        return;
      }
      examOfflineStorage.clearActiveExamSession().catch(() => {});
      setIsPointsVerified(false);
      setGuestLoginModalOpen(true);
      return;
    }

    const costInfo = getExamLevelCost(levelParam);
    const cachedPoints = getCachedPointsBalance();
    if (cachedPoints !== null && (cachedPoints <= 0 || cachedPoints < costInfo.costPoints)) {
      examOfflineStorage.clearActiveExamSession().catch(() => {});
      setIsPointsVerified(false);
      setOutOfPointsBlocked({
        isBlocked: true,
        currentPoints: Math.max(0, cachedPoints),
        requiredPoints: costInfo.costPoints,
        levelLabel: costInfo.label,
      });
      return;
    }

    examPointsService
      .startExamWithPoints({
        userId: user?.id,
        level: isAssessment ? 'BASIC' : levelParam,
        examTitle: exam.title,
        subjectSlug,
        grade: gradeParam,
        chapterId: chapterParam,
      })
      .then((res) => {
        if (res?.ok) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(deductedKey, '1');
            sessionStorage.setItem(examDeductedKey, '1');
          }
          setIsPointsVerified(true);
          if (res?.message) {
            toast.info('Đã kích hoạt phiên làm đề', { description: res.message });
          }
        } else {
          examOfflineStorage.clearActiveExamSession().catch(() => {});
          setIsPointsVerified(false);
          setOutOfPointsBlocked({
            isBlocked: true,
            currentPoints: Math.max(0, Number(res?.data?.currentPoints ?? 0)),
            requiredPoints: Number(res?.data?.requiredPoints ?? costInfo.costPoints),
            levelLabel: res?.data?.levelLabel || costInfo.label,
          });
        }
      })
      .catch((err) => {
        const costInfo = getExamLevelCost(levelParam);
        examOfflineStorage.clearActiveExamSession().catch(() => {});
        setIsPointsVerified(false);
        setOutOfPointsBlocked({
          isBlocked: true,
          currentPoints: Math.max(0, Number(err?.data?.currentPoints ?? 0)),
          requiredPoints: Number(err?.data?.requiredPoints ?? costInfo.costPoints),
          levelLabel: err?.data?.levelLabel || costInfo.label,
        });
      });
  }, [
    attemptTokenParam,
    isSubmitted,
    isAssessment,
    isAdmin,
    computedExamId,
    exam.id,
    exam.title,
    user?.id,
    levelParam,
    subjectSlug,
    gradeParam,
    chapterParam,
  ]);

  // Xử lý cộng/trừ điểm thưởng Token khi nộp bài thi (PostgreSQL)
  React.useEffect(() => {
    if (isSubmitted && examResult && !hasProcessedRewardRef.current) {
      hasProcessedRewardRef.current = true;
      const deductedKey = `schoolify_started_pts_${computedExamId}`;
      const examDeductedKey = `schoolify_started_pts_${exam.id}`;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(deductedKey);
        sessionStorage.removeItem(examDeductedKey);
      }
      if (!user?.id) {
        return;
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
            toast.success('Đã cập nhật Tia Sáng làm đề!', {
              description: res.message,
            });
          }
        })
        .catch(() => {});
    }
  }, [isSubmitted, examResult, computedExamId, exam.id, exam.title, user?.id, levelParam]);

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
  // VIEW: HẾT TIA SÁNG NĂNG LƯỢNG (CHẶN TẠO ĐỀ & MỞ POPUP ĐĂNG KÝ GÓI)
  // =========================================================================
  if (outOfPointsBlocked.isBlocked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col pt-20">
        <Navbar />
        <OutOfPointsModal
          isOpen={true}
          onClose={() => {
            examOfflineStorage.clearActiveExamSession().catch(() => {});
            router.replace('/luyen-thi');
          }}
          currentPoints={outOfPointsBlocked.currentPoints}
          requiredPoints={outOfPointsBlocked.requiredPoints}
          levelLabel={outOfPointsBlocked.levelLabel}
          secondaryLabel="Quay lại Cổng Luyện Thi"
          onNavigatePricing={() => {
            examOfflineStorage.clearActiveExamSession().catch(() => {});
            router.replace('/pricing');
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: ĐANG KIỂM TRA SỐ DƯ TIA SÁNG TRƯỚC KHI KHỞI TẠO PHÒNG THI
  // =========================================================================
  if (!isPointsVerified && !attemptTokenParam && !isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col pt-20">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00B8DD]/10 border border-[#00B8DD]/30 flex items-center justify-center text-[#00B8DD] animate-pulse">
            <TiaSangIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Đang kiểm tra số dư Tia Sáng &amp; khởi tạo đề thi...
          </p>
        </div>
      </div>
    );
  }

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

    // Nhóm độ chính xác theo Chuyên đề Tag (Axis 2: topicTag) & Bẫy sai lầm (Axis 4: trapTag)
    const tagMap = new Map<
      string,
      {
        topicTag: string;
        total: number;
        correct: number;
        wrong: number;
        trapTags: string[];
        cognitiveTags: string[];
      }
    >();

    examResult.questionResults.forEach((r) => {
      const tag = r.question.topicTag || exam.chapterName || 'Chuyên đề trọng tâm';
      const entry = tagMap.get(tag) || {
        topicTag: tag,
        total: 0,
        correct: 0,
        wrong: 0,
        trapTags: [],
        cognitiveTags: [],
      };
      entry.total += 1;
      if (r.isCorrect) {
        entry.correct += 1;
      } else {
        entry.wrong += 1;
        if (r.question.trapTag && !entry.trapTags.includes(r.question.trapTag)) {
          entry.trapTags.push(r.question.trapTag);
        }
      }
      if (r.question.cognitiveTag && !entry.cognitiveTags.includes(r.question.cognitiveTag)) {
        entry.cognitiveTags.push(r.question.cognitiveTag);
      }
      tagMap.set(tag, entry);
    });

    const tagDiagnosticGroups = Array.from(tagMap.values())
      .map((g) => {
        const accuracy = Math.round((g.correct / Math.max(1, g.total)) * 100);
        const status: 'MASTERED' | 'REVIEW' | 'WEAK' =
          accuracy >= 75 ? 'MASTERED' : accuracy >= 50 ? 'REVIEW' : 'WEAK';
        return { ...g, accuracy, status };
      })
      .sort((a, b) => a.accuracy - b.accuracy);

    const weakTopicTagNames = tagDiagnosticGroups
      .filter((g) => g.status !== 'MASTERED')
      .map((g) => g.topicTag);

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
          {/* 4 TABS NAVIGATION (1. Tổng quan -> 2. Bản đồ lỗ hổng -> 3. Lộ trình -> 4. Lời giải) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full">
            {/* Tab 1 */}
            <button
              type="button"
              data-testid="result-tab-overview"
              onClick={() => setResultActiveTab('overview')}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none text-center',
                resultActiveTab === 'overview'
                  ? 'bg-white dark:bg-slate-800 text-[#00B8DD] shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span className="sm:hidden font-bold">1. Tổng quan</span>
              <span className="hidden sm:inline">1. Tổng quan kết quả</span>
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                {scoreVal}/10đ
              </span>
            </button>

            {/* Tab 2 */}
            <button
              type="button"
              data-testid="result-tab-gap-analysis"
              onClick={() => setResultActiveTab('gap_analysis')}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none text-center',
                resultActiveTab === 'gap_analysis'
                  ? 'bg-white dark:bg-slate-800 text-[#00B8DD] shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <BrainCircuit className="w-4 h-4 shrink-0" />
              <span className="sm:hidden font-bold">2. Lỗ hổng</span>
              <span className="hidden sm:inline">2. Bản đồ lỗ hổng</span>
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                {weakTopicTagNames.length > 0 ? `${weakTopicTagNames.length} cần ôn` : 'Đạt'}
              </span>
            </button>

            {/* Tab 3: Lộ trình Học tập Cá nhân hóa (tách riêng theo yêu cầu) */}
            <button
              type="button"
              data-testid="result-tab-roadmap"
              onClick={() => setResultActiveTab('roadmap_sync')}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none text-center',
                resultActiveTab === 'roadmap_sync'
                  ? 'bg-white dark:bg-slate-800 text-[#00B8DD] shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="sm:hidden font-bold">3. Lộ trình</span>
              <span className="hidden sm:inline">3. Lộ trình cá nhân</span>
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#00B8DD]/15 text-[#00B8DD]">
                {knowledgeUpdate?.topicDeltas?.length || tagDiagnosticGroups.length} chuyên đề
              </span>
            </button>

            {/* Tab 4: Chi tiết lời giải */}
            <button
              type="button"
              data-testid="result-tab-solutions"
              onClick={() => setResultActiveTab('solutions')}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none text-center',
                resultActiveTab === 'solutions'
                  ? 'bg-white dark:bg-slate-800 text-[#00B8DD] shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="sm:hidden font-bold">4. Lời giải</span>
              <span className="hidden sm:inline">4. Chi tiết lời giải</span>
              <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                {exam.questions.length} câu
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: TỔNG QUAN KẾT QUẢ (ẢNH 1)                                          */}
          {/* ========================================================================= */}
          {resultActiveTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* ===================================================================== */}
              {/* NEXT-STEP CELEBRATION & DUAL BRANCHING CARD (TOPIC MODE)     */}
              {/* ===================================================================== */}
              {practiceModeParam === 'TOPIC' && !isAssessment && (() => {
                const passedThreshold = examResult.finalScore >= 5.0;
                const earnedStars = passedThreshold
                  ? levelParam === 'ADVANCED'
                    ? 3
                    : levelParam === 'MEDIUM'
                    ? 2
                    : 1
                  : 0;
                const guestInfo = getGuestOnboarding();
                const isGuestResult = !user?.id;

                const currentLevelLower =
                  levelParam === 'ADVANCED'
                    ? 'advanced'
                    : levelParam === 'MEDIUM'
                      ? 'medium'
                      : 'basic';
                const currentDiffCode =
                  levelParam === 'ADVANCED'
                    ? 'HARD'
                    : levelParam === 'MEDIUM'
                      ? 'MEDIUM'
                      : 'EASY';
                const currentLevelLabel =
                  levelParam === 'ADVANCED'
                    ? 'Mức Nâng cao'
                    : levelParam === 'MEDIUM'
                      ? 'Mức Trung bình'
                      : 'Mức Cơ bản';

                const isFirstChapterInTrack =
                  (activeChapterMeta?.trackOrder ?? 1) === 1;

                const levelUpTarget =
                  isFirstChapterInTrack && levelParam === 'BASIC'
                    ? {
                        level: 'medium',
                        diff: 'MEDIUM',
                        title: 'Mở Lộ trình Trung bình · Chương 1',
                        subtitle: 'Bạn vừa mở cổng lộ trình Trung bình ⭐',
                      }
                    : isFirstChapterInTrack && levelParam === 'MEDIUM'
                      ? {
                          level: 'advanced',
                          diff: 'HARD',
                          title: 'Mở Lộ trình Nâng cao · Chương 1',
                          subtitle: 'Bạn vừa mở cổng lộ trình Nâng cao ⭐',
                        }
                      : null;

                const buildBranchUrl = (chId: number, lvl: string, diff: string, trackCode: string) =>
                  `/student/practice/exam-room?subject=${exam.subjectSlug}&level=${lvl}&grade=${exam.grade}&chapter=${chId}&track=${trackCode}&format=quiz&duration=15&quizCount=10&count=10&practiceMode=TOPIC&difficulty=${diff}`;

                const levelUpUrl = levelUpTarget
                  ? buildBranchUrl(
                      exam.chapterId,
                      levelUpTarget.level,
                      levelUpTarget.diff,
                      activeChapterTrack
                    )
                  : null;

                const nextChapterUrl = nextChapterInTrack
                  ? buildBranchUrl(
                      nextChapterInTrack.id,
                      currentLevelLower,
                      currentDiffCode,
                      nextChapterInTrack.track || activeChapterTrack
                    )
                  : buildTopicRoadmapHref(exam.subjectSlug, {
                      grade: exam.grade,
                      track: activeChapterTrack,
                      level: levelParam,
                    });

                const handleBranchAction = (targetUrl: string, label: string) => {
                  if (isGuestResult) {
                    setGuestLoginTargetLabel(label);
                    setGuestLoginReturnUrl(targetUrl);
                    setGuestLoginModalOpen(true);
                    return;
                  }
                  examOfflineStorage.clearActiveExamSession().catch(() => {});
                  router.push(targetUrl);
                };

                return (
                  <Card
                    data-testid="next-step-branching-card"
                    className={cn(
                      'p-5 sm:p-6 rounded-2xl border-2 shadow-sm transition-all',
                      passedThreshold
                        ? 'bg-gradient-to-br from-cyan-50/90 via-white to-amber-50/60 dark:from-[#0B192C] dark:via-[#0B1324] dark:to-amber-950/20 border-[#00B8DD]/50 dark:border-[#00B8DD]/40'
                        : 'bg-white dark:bg-[#0B1324] border-amber-300/70 dark:border-amber-800/60'
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold border',
                              activeChapterTrack === 'TOAN_HINH'
                                ? 'bg-indigo-100/80 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                : activeChapterTrack === 'TOAN_SO'
                                ? 'bg-[#00B8DD]/15 text-[#009bbd] dark:text-[#00B8DD] border-[#00B8DD]/30'
                                : 'bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            )}
                          >
                            {activeChapterTrack === 'TOAN_HINH' ? (
                              <>
                                <Compass className="w-3.5 h-3.5" />
                                <span>Toán Hình · Lớp {exam.grade}</span>
                              </>
                            ) : activeChapterTrack === 'TOAN_SO' ? (
                              <>
                                <Calculator className="w-3.5 h-3.5" />
                                <span>Toán Số · Lớp {exam.grade}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{exam.subjectName} · Lớp {exam.grade}</span>
                              </>
                            )}
                          </span>

                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {currentLevelLabel}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                          {passedThreshold
                            ? isGuestResult
                              ? `Tuyệt vời ${guestInfo?.fullname || 'bạn'}! Bạn đã vượt qua ${activeChapterMeta?.shortName || exam.chapterName}`
                              : `Chúc mừng! Bạn đã mở khóa bước tiếp theo của ${activeChapterMeta?.shortName || exam.chapterName}`
                            : `Cố lên ${guestInfo?.fullname || ''}! Đạt từ 5.0 điểm để mở khóa Sao & chương kế tiếp`}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {passedThreshold
                            ? `Bạn đã hoàn thành ${currentLevelLabel} của chương này! Tiến thẳng sang chương tiếp theo trên lộ trình ${currentLevelLabel} hoặc quay về bản đồ chuyên đề.`
                            : `Bạn đạt ${examResult.finalScore}/10 điểm. Hãy xem lời giải câu sai hoặc thử sức lại mức này để mở khóa lộ trình tiếp theo nhé.`}
                        </p>
                      </div>

                      {/* Cụm 3 Ngôi Sao (3-Crown Badge) */}
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-800/70 shrink-0 self-start lg:self-center shadow-2xs">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((idx) => (
                            <Star
                              key={idx}
                              className={cn(
                                'w-5 h-5 transition-transform',
                                idx <= earnedStars
                                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-xs'
                                  : 'text-slate-300 dark:text-slate-700'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                          {earnedStars}/3 Sao
                        </span>
                      </div>
                    </div>

                    {/* Khu vực Nút Hành Động Tiếp Theo (flex-wrap / Responsive Grid) */}
                    {isGuestResult ? (
                      <div className="pt-4 space-y-3">
                        <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                            <strong>Lưu tiến độ Lớp {guestInfo?.grade || exam.grade}:</strong> Đăng nhập miễn phí chỉ 1 chạm để lưu bài thi thử vừa làm vào hồ sơ và mở khóa toàn bộ các chương tiếp theo!
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              handleBranchAction(
                                nextChapterUrl,
                                'Lưu kết quả đề thử & mở khóa lộ trình'
                              )
                            }
                            className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-extrabold rounded-xl px-4 py-2.5 min-h-[44px] border-b-4 border-[#008ba8] active:border-b-0 active:translate-y-1 shrink-0 cursor-pointer"
                          >
                            Đăng nhập lưu kết quả
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {levelUpTarget && levelUpUrl && (
                            <button
                              type="button"
                              onClick={() => handleBranchAction(levelUpUrl, levelUpTarget.title)}
                              className="p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD] text-left transition-all flex items-center justify-between gap-3 min-h-[56px] cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                                  {levelUpTarget.title}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {levelUpTarget.subtitle}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#00B8DD] shrink-0" />
                            </button>
                          )}

                          {nextChapterInTrack && (
                            <button
                              type="button"
                              onClick={() =>
                                handleBranchAction(
                                  nextChapterUrl,
                                  `Tới ${nextChapterInTrack.shortName} · ${currentLevelLabel}`
                                )
                              }
                              className="p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-left transition-all flex items-center justify-between gap-3 min-h-[56px] cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  Tới {nextChapterInTrack.shortName} · {currentLevelLabel}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                  {nextChapterInTrack.name}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : passedThreshold ? (
                      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nextChapterInTrack ? (
                          <button
                            type="button"
                            data-testid="btn-branch-next-chapter"
                            onClick={() =>
                              handleBranchAction(
                                nextChapterUrl,
                                `Tới ${nextChapterInTrack.shortName} · ${currentLevelLabel}`
                              )
                            }
                            className="p-4 rounded-2xl bg-[#10B981] hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all text-left flex items-center justify-between gap-3 min-h-[60px] cursor-pointer shadow-sm"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
                                <BookOpen className="w-4 h-4 shrink-0" />
                                <span>
                                  Tới {nextChapterInTrack.shortName} · {currentLevelLabel}
                                </span>
                              </div>
                              <div className="text-[11px] text-emerald-50/90 mt-0.5 line-clamp-1">
                                {nextChapterInTrack.name}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRetakeExam}
                            className="p-4 rounded-2xl bg-[#F59E0B] hover:bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all text-left flex items-center justify-between gap-3 min-h-[60px] cursor-pointer shadow-sm"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
                                <Star className="w-4 h-4 fill-white shrink-0" />
                                <span>Hoàn thành chương cuối! Luyện thêm đề mới</span>
                              </div>
                              <div className="text-[11px] text-amber-50/90 mt-0.5">
                                Rèn phản xạ tốc độ với bộ câu hỏi mới cùng chương
                              </div>
                            </div>
                            <RotateCcw className="w-4 h-4 shrink-0" />
                          </button>
                        )}

                        {levelUpTarget && levelUpUrl ? (
                          <button
                            type="button"
                            data-testid="btn-branch-level-up"
                            onClick={() => handleBranchAction(levelUpUrl, levelUpTarget.title)}
                            className="p-4 rounded-2xl bg-[#00B8DD] hover:bg-[#009BBD] text-white border-b-4 border-[#0088a3] active:border-b-0 active:translate-y-1 transition-all text-left flex items-center justify-between gap-3 min-h-[60px] cursor-pointer shadow-sm"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
                                <Flame className="w-4 h-4 shrink-0" />
                                <span>{levelUpTarget.title}</span>
                              </div>
                              <div className="text-[11px] text-cyan-50/90 mt-0.5">
                                {levelUpTarget.subtitle}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                buildTopicRoadmapHref(exam.subjectSlug, {
                                  grade: exam.grade,
                                  track: activeChapterTrack,
                                  level: levelParam,
                                }),
                              )
                            }
                            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-left flex items-center justify-between gap-3 min-h-[60px] cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-extrabold">
                                Về Bản đồ Lộ trình {currentLevelLabel}
                              </div>
                              <div className="text-[11px] text-slate-300 mt-0.5">
                                Xem tiến độ từng mức độ trên bản đồ chuyên đề
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          onClick={handleRetakeExam}
                          className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-extrabold rounded-xl px-5 py-2.5 min-h-[44px] border-b-4 border-[#0088a3] active:border-b-0 active:translate-y-1 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 mr-1.5" />
                          Làm lại mức này ngay
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setResultActiveTab('solutions');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="rounded-xl px-5 py-2.5 min-h-[44px] font-bold cursor-pointer"
                        >
                          Xem chi tiết lời giải
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              buildTopicRoadmapHref(exam.subjectSlug, {
                                grade: exam.grade,
                                track: activeChapterTrack,
                                level: levelParam,
                              }),
                            )
                          }
                          className="rounded-xl px-5 py-2.5 min-h-[44px] font-bold cursor-pointer"
                        >
                          Về Bản đồ Chuyên đề
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })()}

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

              {/* 3. AI COMPETENCY ASSESSMENT DIAGNOSIS (Nếu là bài đánh giá năng lực) */}
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

              {/* Prominent CTA Card to Next Tab (Gap Analysis) */}
              <div
                onClick={() => {
                  setResultActiveTab('gap_analysis');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1324] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group hover:border-[#00B8DD]/60 dark:hover:border-[#00B8DD]/60 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#00B8DD] flex items-center justify-center shrink-0 group-hover:bg-[#00B8DD]/10 transition-colors">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                        Bản đồ lỗ hổng &amp; Cảnh báo bẫy sai lầm
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Bước 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Phân tích mức độ chính xác theo từng dạng bài và bẫy đề thi cần khắc phục.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  data-testid="btn-next-to-gap-analysis"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResultActiveTab('gap_analysis');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold px-5 py-2.5 rounded-xl min-h-[42px] cursor-pointer shadow-xs flex items-center gap-1.5 text-xs sm:text-sm shrink-0 self-end sm:self-auto group"
                >
                  <span>Kế tiếp</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>

              {/* Bottom Navigation of Tab 1 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-20 sm:pb-12 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="outline"
                    onClick={handleRetakeExam}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm"
                  >
                    Làm lại đề này
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleOpenSnapshot}
                    leftIcon={<BookOpen className="w-4 h-4" />}
                    className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm"
                  >
                    Xem lại đề thi
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link href="/luyen-thi">
                    <Button
                      variant="ghost"
                      className="rounded-xl font-semibold min-h-[42px] text-xs sm:text-sm text-slate-600 dark:text-slate-400"
                    >
                      Chọn môn khác
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BẢN ĐỒ LỖ HỔNG & CẢNH BÁO BẪY SAI LẦM (ẢNH 2)                      */}
          {/* ========================================================================= */}
          {resultActiveTab === 'gap_analysis' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <Card
                id="tag-gap-diagnostic-report"
                data-testid="tag-gap-diagnostic-report"
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none space-y-4 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-[#00B8DD]" />
                      <span>Bản đồ lỗ hổng chuyên đề &amp; Cảnh báo bẫy sai lầm</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Phân tích mức độ thành thạo theo từng dạng bài và phát hiện các bẫy đề thi cần lưu ý.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>Vững vàng (≥ 75%)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Cần củng cố (50–74%)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span>Lỗ hổng (&lt; 50%)</span>
                      </span>
                    </div>
                  </div>

                  {weakTopicTagNames.length > 0 && (
                    <Button
                      type="button"
                      data-testid="remediate-weak-tags-5q-btn"
                      onClick={() => handleStartWeakTagRemediation5Q(weakTopicTagNames)}
                      className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl min-h-[42px] cursor-pointer shadow-xs transition-colors shrink-0 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Luyện bù 5 câu dạng đang yếu</span>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {tagDiagnosticGroups.map((group) => {
                    const isWeak = group.status === 'WEAK';
                    const isReview = group.status === 'REVIEW';
                    return (
                      <div
                        key={group.topicTag}
                        className="p-4 sm:p-4.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1324] space-y-3 min-w-0 transition-colors hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug break-words">
                            {group.topicTag}
                          </h4>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0',
                              isWeak
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40'
                                : isReview
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                            )}
                          >
                            {isWeak ? 'Lỗ hổng' : isReview ? 'Cần ôn' : 'Vững vàng'}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span>Độ chính xác</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                              {group.correct}/{group.total} câu ({group.accuracy}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                isWeak ? 'bg-rose-500' : isReview ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${Math.max(6, group.accuracy)}%` }}
                            />
                          </div>
                        </div>

                        {group.trapTags.length > 0 && (
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border-l-2 border-amber-400 dark:border-amber-500 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-slate-200">
                                Bẫy thường gặp:
                              </span>{' '}
                              <span>{group.trapTags[0]}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Bottom Navigation of Tab 2 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-20 sm:pb-12 border-t border-slate-200/80 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResultActiveTab('overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm"
                >
                  Quay lại tổng quan
                </Button>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setResultActiveTab('roadmap_sync');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm border-[#00B8DD]/50 text-[#00B8DD] hover:bg-[#00B8DD]/10"
                  >
                    Xem lộ trình cá nhân hóa
                  </Button>
                  <Button
                    type="button"
                    data-testid="btn-next-to-solutions"
                    onClick={() => {
                      setResultActiveTab('solutions');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-extrabold px-6 py-2.5 rounded-xl min-h-[44px] cursor-pointer shadow-md shadow-[#00B8DD]/20 flex items-center gap-2 group text-xs sm:text-sm"
                  >
                    <span>Kế tiếp: Xem chi tiết lời giải</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CẬP NHẬT LỘ TRÌNH HỌC TẬP CÁ NHÂN HÓA (TÁCH THÀNH TAB RIÊNG)       */}
          {/* ========================================================================= */}
          {resultActiveTab === 'roadmap_sync' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {(() => {
                const effectiveTopicDeltas =
                  knowledgeUpdate && knowledgeUpdate.topicDeltas.length > 0
                    ? knowledgeUpdate.topicDeltas
                    : tagDiagnosticGroups.map((g) => {
                        const targetScore = Math.max(15, Math.min(95, Math.round(g.accuracy * 0.85 + 15)));
                        return {
                          topicTag: g.topicTag,
                          chapterId: exam.chapterId,
                          previousScore: 0,
                          currentScore: targetScore,
                          deltaScore: targetScore,
                          previousStatus: 'NEW',
                          currentStatus: g.status,
                          attemptedInExam: g.total,
                          correctInExam: g.correct,
                          topTrapTag: g.trapTags[0] || null,
                        };
                      });

                return (
                  <div className="space-y-5">
                    <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B1324] border border-[#00B8DD]/40 shadow-none space-y-4">

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00B8DD]/15 text-[#00B8DD]">
                              Đã đồng bộ Hồ sơ Năng lực (PostgreSQL)
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              Cập nhật Lộ trình Học tập Cá nhân hóa của bạn
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kết quả từng câu hỏi đúng/sai, cấp độ tư duy Bloom, bẫy sai lầm và lịch sử hành vi rèn luyện đã được đồng bộ trực tiếp vào lộ trình riêng của bạn.
                          </p>
                        </div>

                        <Link href={`/student/practice/${exam.subjectSlug}/lop-${exam.grade}`}>
                          <Button
                            variant="outline"
                            className="rounded-xl font-semibold text-xs min-h-[40px] border-[#00B8DD]/50 text-[#00B8DD] hover:bg-[#00B8DD]/10 cursor-pointer shrink-0"
                          >
                            Xem Lộ trình Cá nhân hóa
                          </Button>
                        </Link>
                      </div>

                      {effectiveTopicDeltas.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {effectiveTopicDeltas.map((td) => {
                            const isPositive = td.deltaScore >= 0;
                            return (
                              <div
                                key={td.topicTag}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0 space-y-0.5">
                                  <p className="font-semibold text-slate-900 dark:text-white break-words">
                                    {td.topicTag}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Đề này: {td.correctInExam}/{td.attemptedInExam} câu đúng
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                    {td.previousScore}% → {td.currentScore}%
                                  </span>
                                  <span
                                    className={cn(
                                      'block text-[11px] font-bold',
                                      isPositive
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    )}
                                  >
                                    {isPositive ? `+${td.deltaScore}%` : `${td.deltaScore}%`} thành thạo
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>

                    {/* Khối Lịch sử Hành vi & Đánh giá Tinh thần Học tập / Trí thông minh (#LUYEN_LAI_3_LAN_CUNG_DANG) */}
                  </div>
                );
              })()}


              {/* Bottom Navigation of Tab 3 (Roadmap Sync) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-20 sm:pb-12 border-t border-slate-200/80 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResultActiveTab('gap_analysis');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm"
                >
                  Quay lại bản đồ lỗ hổng
                </Button>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    onClick={() => {
                      setResultActiveTab('solutions');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-extrabold px-6 py-2.5 rounded-xl min-h-[44px] cursor-pointer shadow-md shadow-[#00B8DD]/20 flex items-center gap-2 group text-xs sm:text-sm"
                  >
                    <span>Kế tiếp: Xem chi tiết lời giải</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CHI TIẾT BÀI LÀM & LỜI GIẢI (TRUNG TÂM KHẮC PHỤC LỖI SAI)          */}
          {/* ========================================================================= */}
          {resultActiveTab === 'solutions' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
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
                                  Nhập câu trả lời của bạn:
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
                                  placeholder="Nhập câu trả lời của bạn..."
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
                    {(() => {
                      const isQuestionUnanswered = (q: ExamQuestion): boolean => {
                        if (q.type === 'MULTIPLE_CHOICE') return !multipleChoices[q.id];
                        if (q.type === 'TRUE_FALSE') {
                          const tf = trueFalseAnswers[q.id] || {};
                          return (q.statements || []).every((st) => tf[st.subId] === undefined);
                        }
                        if (q.type === 'SHORT_ANSWER') return !(shortAnswers[q.id] || '').trim();
                        if (q.type === 'ESSAY') return !(essayAnswers[q.id] || '').trim();
                        return false;
                      };

                      const unansweredWrongCount = wrongResults.filter((r) =>
                        isQuestionUnanswered(r.question)
                      ).length;
                      const answeredWrongCount = wrongResults.length - unansweredWrongCount;

                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-slate-400" />
                                Chi Tiết {wrongCount} Câu Chưa Chính Xác
                              </h2>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Đối chiếu đáp án bạn đã chọn với barem chuẩn của Bộ Giáo Dục và hướng dẫn tư duy từng bước.
                              </p>
                            </div>

                            {/* Chú giải phân biệt viền Câu chọn sai vs Câu chưa chọn */}
                            <div className="flex flex-wrap items-center gap-2.5 text-xs shrink-0">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-rose-400 dark:border-rose-500/80 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold">
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                <span>Chọn sai ({answeredWrongCount} câu)</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-dashed border-amber-400 dark:border-amber-500/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                <span>Chưa chọn / Bỏ trống ({unansweredWrongCount} câu)</span>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-5">
                            {wrongResults.map((res) => {
                              const q = res.question;
                              const isUnanswered = isQuestionUnanswered(q);

                              return (
                                <Card
                                  key={q.id}
                                  id={`wrong-q-${q.id}`}
                                  className={cn(
                                    'p-5 sm:p-6 rounded-2xl shadow-none space-y-4 scroll-mt-24 transition-all',
                                    isUnanswered
                                      ? 'border-2 border-dashed border-amber-400 dark:border-amber-500/80 bg-amber-50/15 dark:bg-amber-950/10'
                                      : 'border-2 border-rose-400 dark:border-rose-500/80 bg-rose-50/10 dark:bg-rose-950/10'
                                  )}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {isUnanswered ? (
                                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700">
                                          ⚠️ Chưa chọn đáp án • Bỏ trống (0/{q.score}đ)
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700">
                                          ❌ Chọn sai đáp án ({res.earnedScore}/{q.score}đ)
                                        </span>
                                      )}
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

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      {isAdmin && (
                                        <button
                                          type="button"
                                          data-testid={`admin-review-edit-btn-${q.id}`}
                                          onClick={() => handleOpenAdminEditQuestion(q)}
                                          className={cn(
                                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 border',
                                            adminEditingQuestionId === q.id
                                              ? 'bg-amber-500 text-white border-amber-500'
                                              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/40'
                                          )}
                                        >
                                          <PenTool className="w-3.5 h-3.5" />
                                          <span>
                                            {adminEditingQuestionId === q.id
                                              ? 'Đóng chỉnh sửa'
                                              : '✏️ Sửa câu hỏi / đáp án'}
                                          </span>
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        data-testid={`quick-drill-3q-btn-${q.id}`}
                                        onClick={() => handleOpenQuickSingleQuestionDrill(q)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-xs transition-colors cursor-pointer"
                                      >
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>Luyện lại nhanh câu này</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setReportingQuestion(q)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                                        title="Báo cáo sai sót câu hỏi cho Ban Khảo thí"
                                      >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Báo lỗi</span>
                                      </button>
                                    </div>
                                  </div>

                                  {isAdmin && adminEditingQuestionId === q.id && (
                                    <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-400/80 dark:border-amber-600/70 space-y-3">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                            Tiêu đề câu hỏi
                                          </label>
                                          <input
                                            type="text"
                                            value={adminEditDraft.title}
                                            onChange={(e) =>
                                              setAdminEditDraft((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                              }))
                                            }
                                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                            Chuyên đề (Topic Tag)
                                          </label>
                                          <input
                                            type="text"
                                            value={adminEditDraft.topicTag}
                                            onChange={(e) =>
                                              setAdminEditDraft((prev) => ({
                                                ...prev,
                                                topicTag: e.target.value,
                                              }))
                                            }
                                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                          Nội dung câu hỏi
                                        </label>
                                        <textarea
                                          rows={3}
                                          value={adminEditDraft.content}
                                          onChange={(e) =>
                                            setAdminEditDraft((prev) => ({
                                              ...prev,
                                              content: e.target.value,
                                            }))
                                          }
                                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                                        />
                                      </div>
                                      {q.type === 'MULTIPLE_CHOICE' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {adminEditDraft.choices.map((ch, cIdx) => {
                                            const isRight = adminEditDraft.correctChoice === ch.key;
                                            return (
                                              <div
                                                key={ch.key}
                                                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2"
                                              >
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setAdminEditDraft((prev) => ({
                                                      ...prev,
                                                      correctChoice: ch.key,
                                                    }))
                                                  }
                                                  className={cn(
                                                    'px-2 py-1 rounded-lg text-xs font-black shrink-0 cursor-pointer',
                                                    isRight
                                                      ? 'bg-emerald-600 text-white'
                                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                                                  )}
                                                >
                                                  {ch.key} {isRight ? '✓' : ''}
                                                </button>
                                                <input
                                                  type="text"
                                                  value={ch.content}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setAdminEditDraft((prev) => {
                                                      const next = [...prev.choices];
                                                      next[cIdx] = { ...next[cIdx], content: val };
                                                      return { ...prev, choices: next };
                                                    });
                                                  }}
                                                  className="flex-1 min-w-0 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs"
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                      <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                          Lời giải chi tiết
                                        </label>
                                        <textarea
                                          rows={3}
                                          value={adminEditDraft.explanation}
                                          onChange={(e) =>
                                            setAdminEditDraft((prev) => ({
                                              ...prev,
                                              explanation: e.target.value,
                                            }))
                                          }
                                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                                        />
                                      </div>
                                      <div className="flex flex-wrap items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setAdminEditingQuestionId(null)}
                                          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold cursor-pointer"
                                        >
                                          Hủy
                                        </button>
                                        <button
                                          type="button"
                                          disabled={adminSavingQuestionEdit}
                                          onClick={() => handleSaveAdminEditQuestion(q)}
                                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
                                        >
                                          {adminSavingQuestionEdit
                                            ? 'Đang lưu...'
                                            : '💾 Lưu vào PostgreSQL'}
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-base font-bold text-slate-900 dark:text-white">
                                    <MathRenderer text={q.title} />
                                  </div>
                                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                    <MathRenderer text={q.content} />
                                  </div>

                                  {/* Thanh tóm tắt trạng thái Chọn sai vs Chưa chọn cho Trắc nghiệm 4 lựa chọn */}
                                  {q.type === 'MULTIPLE_CHOICE' && (
                                    <div
                                      className={cn(
                                        'px-3.5 py-2 rounded-xl border text-xs font-semibold flex flex-wrap items-center justify-between gap-2',
                                        isUnanswered
                                          ? 'border-dashed border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                                          : 'border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                                      )}
                                    >
                                      <span>
                                        {isUnanswered
                                          ? '⚠️ Trạng thái: Bạn chưa chọn phương án nào (để trống).'
                                          : `❌ Trạng thái: Bạn đã chọn phương án ${multipleChoices[q.id]} (chưa chính xác).`}
                                      </span>
                                      <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                                        ✓ Đáp án đúng: Phương án {q.correctChoice}
                                      </span>
                                    </div>
                                  )}

                                  {/* Display choices if multiple choice */}
                                  {q.type === 'MULTIPLE_CHOICE' && q.choices && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                      {q.choices.map((choice) => {
                                        const isSelected = multipleChoices[q.id] === choice.key;
                                        const isCorrectOpt = q.correctChoice === choice.key;

                                        let optClasses = isUnanswered
                                          ? 'border border-dashed border-amber-300 dark:border-amber-800/70 bg-white/90 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300'
                                          : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300';

                                        if (isCorrectOpt) {
                                          optClasses =
                                            'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 font-bold text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/15';
                                        } else if (isSelected && !isCorrectOpt) {
                                          optClasses =
                                            'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 font-bold text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/15';
                                        }

                                        return (
                                          <div
                                            key={choice.key}
                                            className={cn(
                                              'p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all',
                                              optClasses
                                            )}
                                          >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <span className="font-mono font-bold shrink-0">
                                                {choice.key}.
                                              </span>
                                              <MathRenderer text={choice.content} inline />
                                            </div>
                                            {isCorrectOpt && (
                                              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] font-bold shrink-0">
                                                ✓ Đáp án đúng
                                              </span>
                                            )}
                                            {isSelected && !isCorrectOpt && (
                                              <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[11px] font-bold shrink-0">
                                                ✗ Bạn đã chọn
                                              </span>
                                            )}
                                            {!isCorrectOpt && !isSelected && isUnanswered && (
                                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                                                (Chưa chọn)
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
                                        const isSubUnanswered = studentVal === undefined;
                                        const isSubCorrect = studentVal === st.isCorrect;

                                        return (
                                          <div
                                            key={st.subId}
                                            className={cn(
                                              'p-3.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2',
                                              isSubUnanswered
                                                ? 'border-2 border-dashed border-amber-400 dark:border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20'
                                                : isSubCorrect
                                                ? 'border-2 border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                                                : 'border-2 border-rose-400 dark:border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/20'
                                            )}
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
                                            <div className="flex flex-wrap items-center gap-2 shrink-0 text-[11px]">
                                              <span
                                                className={cn(
                                                  'px-2 py-0.5 rounded-md font-bold border',
                                                  isSubUnanswered
                                                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                                                    : isSubCorrect
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                                                    : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700'
                                                )}
                                              >
                                                Bạn chọn:{' '}
                                                {studentVal === true
                                                  ? 'ĐÚNG'
                                                  : studentVal === false
                                                  ? 'SAI'
                                                  : '⚠️ Chưa chọn'}
                                              </span>
                                              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold">
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
                                    <div
                                      className={cn(
                                        'p-3.5 rounded-xl text-xs space-y-1.5',
                                        isUnanswered
                                          ? 'border-2 border-dashed border-amber-400 dark:border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20'
                                          : 'border-2 border-rose-400 dark:border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/20'
                                      )}
                                    >
                                      <div>
                                        Câu trả lời bạn điền:{' '}
                                        <strong
                                          className={cn(
                                            'font-mono',
                                            isUnanswered
                                              ? 'text-amber-700 dark:text-amber-300'
                                              : 'text-rose-600 dark:text-rose-400'
                                          )}
                                        >
                                          {shortAnswers[q.id] || '⚠️ (Chưa điền đáp số)'}
                                        </strong>
                                      </div>
                                      <div>
                                        Câu trả lời chính xác:{' '}
                                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                                          <MathRenderer text={q.shortAnswerCorrect || ''} inline />
                                        </strong>
                                      </div>
                                    </div>
                                  )}

                                  {/* Trap Tag Warning Callout */}
                                  {q.trapTag && (
                                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs flex flex-wrap items-center justify-between gap-2.5">
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="font-extrabold text-amber-900 dark:text-amber-300 flex flex-wrap items-center gap-1.5">
                                          <span>⚠️ Cảnh báo Bẫy sai lầm (Trap Tag):</span>
                                          {q.topicTag && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 text-[10px]">
                                              🏷️ {q.topicTag}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed break-words">
                                          {q.trapTag}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleAskSocraticAiTutor(q)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00B8DD]/15 hover:bg-[#00B8DD]/25 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30 font-bold text-xs transition-colors cursor-pointer shrink-0"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>💡 Hỏi Gia Sư AI phân tích câu này</span>
                                      </button>
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
                        </>
                      );
                    })()}

                    {/* DƯỚI CÙNG HIỆN THÊM LỰA CHỌN KHẮC PHỤC NGAY */}
                    <Card className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                      <div className="inline-flex p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <RotateCcw className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-xl mx-auto">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          Luyện tập lại các câu chưa đúng
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Hệ thống đã chuẩn bị {wrongCount} câu hỏi tương tự để bạn rèn luyện lại ngay. Không giới hạn thời gian, bạn có thể thong thả làm bài và củng cố kiến thức.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
                        <Button
                          onClick={handleStartRemediation}
                          size="lg"
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold text-sm px-6 py-2.5 rounded-xl cursor-pointer shadow-2xs"
                          leftIcon={<RotateCcw className="w-4 h-4" />}
                        >
                          Làm {wrongCount} câu hỏi tương tự ➔
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleOpenSnapshot}
                          className="rounded-xl font-semibold text-sm px-5 py-2.5 border-slate-200 dark:border-slate-700"
                          leftIcon={<BookOpen className="w-4 h-4 text-slate-500" />}
                        >
                          Xem lại đề thi
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            );
          })()}

              {/* Bottom Navigation of Tab 4 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResultActiveTab('roadmap_sync');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm"
                >
                  Quay lại lộ trình cá nhân
                </Button>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="outline"
                    onClick={handleRetakeExam}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="rounded-xl font-semibold min-h-[42px] cursor-pointer text-xs sm:text-sm"
                  >
                    Làm lại đề này
                  </Button>
                  <Link href="/luyen-thi">
                    <Button
                      className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl min-h-[42px] cursor-pointer text-xs sm:text-sm"
                      leftIcon={<BookOpen className="w-4 h-4" />}
                    >
                      Chọn luyện đề môn khác
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="rounded-xl font-semibold min-h-[42px] text-xs sm:text-sm" leftIcon={<Home className="w-4 h-4" />}>
                      Về trang chủ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

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

          {/* POPUP FULL MÀN HÌNH: LUYỆN LẠI NHANH 3 CÂU CÙNG DẠNG (GỢI Ý CHUNG 1 LẦN + TÁCH 3 LẦN LÀM ĐỘC LẬP + SKIP) */}
          {quickDrillSourceQuestion && quickDrillQuestions.length > 0 && (
            <div
              data-testid="quick-drill-3q-fullscreen-modal"
              className="fixed inset-0 z-[120] bg-slate-50 dark:bg-[#070C18] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200"
            >
              {/* Top Header Bar */}
              <div className="px-4 sm:px-6 py-3.5 bg-white dark:bg-[#0B1324] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#5CE1FF] border border-[#00B8DD]/30">
                    <Zap className="w-3.5 h-3.5 text-[#00B8DD]" />
                    <span>Luyện lại 3 lần cùng dạng</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                    🛡️ Bài tập luyện lại — Không tính điểm
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                    {quickDrillSourceQuestion.topicTag || quickDrillSourceQuestion.title}
                  </h3>
                  {renderDifficultyBadge(quickDrillSourceQuestion.difficulty, false)}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenQuickSingleQuestionDrill(quickDrillSourceQuestion)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    className="rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Đổi 3 số liệu mới
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-testid="close-quick-drill-modal-btn"
                    onClick={() => {
                      const anyTouched = quickDrillQuestions.some(
                        (q) => quickDrillCheckedIds[q.id] || quickDrillSkippedIds[q.id]
                      );
                      if (anyTouched && !quickDrillBehaviorSaved) {
                        void persistQuickDrillBehaviorToPostgres(
                          quickDrillCheckedIds,
                          quickDrillSkippedIds,
                          false
                        );
                      }
                      setQuickDrillSourceQuestion(null);
                    }}
                    leftIcon={<X className="w-4 h-4" />}
                    className="rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Đóng cửa sổ
                  </Button>
                </div>
              </div>

              {/* Main Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                <div className="max-w-4xl mx-auto space-y-5 pb-16">
                  {/* 1. KHUNG GỢI Ý PHƯƠNG PHÁP CHUNG — CHỈ HIỆN 1 LẦN DUY NHẤT VÌ 3 CÂU CHUNG 1 DẠNG */}
                  <Card
                    data-testid="quick-drill-shared-hint-box"
                    className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-300/90 dark:border-amber-700/70 shadow-none space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-black uppercase tracking-wide flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Gợi ý phương pháp chung (1 lần cho cả 3 câu)</span>
                        </span>
                        <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                          Vì cả 3 lần làm đều chung 1 dạng bài, bạn chỉ cần nắm vững 1 phương pháp cốt lõi dưới đây:
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!quickDrillSharedAiHint && (
                          <button
                            type="button"
                            disabled={quickDrillLoadingSharedAiHint}
                            onClick={handleRequestSharedAiHint}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {quickDrillLoadingSharedAiHint ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Đang tạo ví dụ mẫu...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                <span>Xem thêm 1 ví dụ tương đương từ AI</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setQuickDrillSharedHintExpanded((prev) => !prev)}
                          className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-bold cursor-pointer"
                        >
                          {quickDrillSharedHintExpanded ? 'Thu gọn gợi ý' : 'Mở gợi ý chung'}
                        </button>
                      </div>
                    </div>

                    {quickDrillSharedHintExpanded && (
                      <div className="space-y-3 pt-1">
                        <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                          <AgentChatMessageContent
                            content={quickDrillSharedHint}
                            role="assistant"
                          />
                        </div>

                        {quickDrillSharedAiHint && (
                          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-300/80 dark:border-amber-800/70 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            <p className="font-bold text-[#007D99] dark:text-[#5CE1FF] mb-1">
                              ✨ Ví dụ tương đương minh họa cho toàn bộ dạng bài:
                            </p>
                            <AgentChatMessageContent
                              content={quickDrillSharedAiHint}
                              role="assistant"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* 2. THANH STEPPER TÁCH RIÊNG 3 LẦN LÀM ĐỘC LẬP (LẦN 1/3 • LẦN 2/3 • LẦN 3/3) */}
                  <Card className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0B1324] border border-slate-200 dark:border-slate-800 shadow-none flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {quickDrillQuestions.map((qd, idx) => {
                        const isChecked = Boolean(quickDrillCheckedIds[qd.id]);
                        const isSkipped = Boolean(quickDrillSkippedIds[qd.id]);
                        const isRight = isChecked && isQuickDrillQuestionCorrect(qd);
                        const isActiveTurn = quickDrillActiveStep === idx;

                        let pillClass =
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                        if (isActiveTurn) {
                          pillClass =
                            'bg-[#00B8DD] text-white border-[#00B8DD] ring-2 ring-[#00B8DD]/30 font-black';
                        } else if (isChecked) {
                          pillClass = isRight
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold';
                        } else if (isSkipped) {
                          pillClass =
                            'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/50 border-dashed font-bold';
                        }

                        return (
                          <button
                            key={qd.id}
                            type="button"
                            data-testid={`quick-drill-step-btn-${idx + 1}`}
                            onClick={() => setQuickDrillActiveStep(idx as 0 | 1 | 2)}
                            className={cn(
                              'px-3.5 py-2 rounded-xl text-xs border transition-all flex items-center gap-1.5 cursor-pointer',
                              pillClass
                            )}
                          >
                            <span>Lần {idx + 1}/3</span>
                            {isChecked && <span>{isRight ? '✓ Đúng' : '✗ Sai'}</span>}
                            {!isChecked && isSkipped && <span>⏭ Đã Skip</span>}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="quick-drill-skip-remaining-btn"
                      onClick={() =>
                        void persistQuickDrillBehaviorToPostgres(
                          quickDrillCheckedIds,
                          quickDrillSkippedIds,
                          true
                        )
                      }
                      className="rounded-xl text-xs font-bold border-amber-400/70 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                    >
                      ⏭ Bỏ qua các lần còn lại
                    </Button>
                  </Card>

                  {/* 3. NỘI DUNG TỪNG LẦN LÀM ĐỘC LẬP (LẦN 1/3, LẦN 2/3, HOẶC LẦN 3/3) */}
                  {(() => {
                    const idx = quickDrillActiveStep;
                    const qd = quickDrillQuestions[idx];
                    if (!qd) return null;

                    const isChecked = Boolean(quickDrillCheckedIds[qd.id]);
                    const isSkipped = Boolean(quickDrillSkippedIds[qd.id]) && !isChecked;
                    const isRevealed = isChecked;
                    const isCorrect = isQuickDrillQuestionCorrect(qd);
                    const answered = hasQuickDrillAnswer(qd);

                    return (
                      <Card
                        key={qd.id}
                        data-testid={`quick-drill-turn-card-${idx + 1}`}
                        className={cn(
                          'p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B1324] border-2 shadow-none space-y-5 transition-all',
                          isChecked
                            ? isCorrect
                              ? 'border-emerald-500/80 dark:border-emerald-500/60'
                              : 'border-rose-400 dark:border-rose-500/80'
                            : isSkipped
                            ? 'border-dashed border-amber-400 dark:border-amber-500/80'
                            : 'border-slate-200 dark:border-slate-800'
                        )}
                      >
                        {/* Header của Lần làm hiện tại */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#5CE1FF]">
                              Lần thử {idx + 1} / 3 (Độc lập • Không tính điểm)
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {qd.type === 'MULTIPLE_CHOICE'
                                ? 'Trắc nghiệm 4 lựa chọn'
                                : qd.type === 'TRUE_FALSE'
                                ? 'Đúng / Sai'
                                : 'Điền đáp số'}
                            </span>
                            {qd.topicTag && (
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                🏷️ {qd.topicTag}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isChecked && (
                              <span
                                className={cn(
                                  'px-3 py-1 rounded-lg text-xs font-bold border',
                                  isCorrect
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                                    : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                                )}
                              >
                                {isCorrect
                                  ? `✓ Lần ${idx + 1} Chính xác`
                                  : `✗ Lần ${idx + 1} Chưa chính xác`}
                              </span>
                            )}
                            {isSkipped && (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold border border-dashed border-amber-400 bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                ⏭ Đã Skip Lần {idx + 1} (Bạn vẫn có thể chọn làm lại)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nội dung câu hỏi của Lần hiện tại */}
                        <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium">
                          <MathRenderer text={qd.content} />
                        </div>

                        {/* Phương án MULTIPLE_CHOICE */}
                        {qd.type === 'MULTIPLE_CHOICE' && qd.choices && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {qd.choices.map((c) => {
                              const isSelected = quickDrillChoices[qd.id] === c.key;
                              const isRightOpt = qd.correctChoice === c.key;

                              let btnStyle =
                                'border border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/70 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200';
                              if (isRevealed) {
                                if (isRightOpt) {
                                  btnStyle =
                                    'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 font-bold text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/15';
                                } else if (isSelected && !isRightOpt) {
                                  btnStyle =
                                    'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 font-bold text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/15';
                                }
                              } else if (isSelected) {
                                btnStyle =
                                  'border-2 border-[#00B8DD] bg-[#E6F8FC] dark:bg-cyan-950/40 font-bold text-[#007D99] dark:text-[#5CE1FF] ring-2 ring-[#00B8DD]/20';
                              }

                              return (
                                <button
                                  key={c.key}
                                  type="button"
                                  data-testid={`quick-drill-choice-${idx + 1}-${c.key}`}
                                  disabled={isRevealed}
                                  onClick={() =>
                                    setQuickDrillChoices((prev) => ({ ...prev, [qd.id]: c.key }))
                                  }
                                  className={cn(
                                    'p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2.5 transition-all text-left cursor-pointer disabled:cursor-default',
                                    btnStyle
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono font-bold shrink-0">{c.key}.</span>
                                    <MathRenderer text={c.content} inline />
                                  </div>
                                  {isRevealed && isRightOpt && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] font-bold shrink-0">
                                      ✓ Đáp án đúng
                                    </span>
                                  )}
                                  {isRevealed && isSelected && !isRightOpt && (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[11px] font-bold shrink-0">
                                      ✗ Bạn chọn
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Phương án TRUE_FALSE */}
                        {qd.type === 'TRUE_FALSE' && qd.statements && (
                          <div className="space-y-2 pt-1">
                            {qd.statements.map((st) => {
                              const curVal = quickDrillTrueFalse[qd.id]?.[st.subId];
                              return (
                                <div
                                  key={st.subId}
                                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                >
                                  <div className="flex items-start gap-1.5 min-w-0">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                                      Ý {st.subId})
                                    </span>
                                    <MathRenderer text={st.statement} inline />
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      disabled={isRevealed}
                                      onClick={() =>
                                        setQuickDrillTrueFalse((prev) => ({
                                          ...prev,
                                          [qd.id]: { ...(prev[qd.id] || {}), [st.subId]: true },
                                        }))
                                      }
                                      className={cn(
                                        'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                        curVal === true
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      )}
                                    >
                                      Đúng
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isRevealed}
                                      onClick={() =>
                                        setQuickDrillTrueFalse((prev) => ({
                                          ...prev,
                                          [qd.id]: { ...(prev[qd.id] || {}), [st.subId]: false },
                                        }))
                                      }
                                      className={cn(
                                        'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                        curVal === false
                                          ? 'bg-rose-500 text-white'
                                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      )}
                                    >
                                      Sai
                                    </button>
                                    {isRevealed && (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                                        Chuẩn: {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Phương án SHORT_ANSWER */}
                        {qd.type === 'SHORT_ANSWER' && (
                          <div className="pt-1 space-y-2">
                            <input
                              type="text"
                              disabled={isRevealed}
                              value={quickDrillShortAnswers[qd.id] || ''}
                              onChange={(e) =>
                                setQuickDrillShortAnswers((prev) => ({
                                  ...prev,
                                  [qd.id]: e.target.value,
                                }))
                              }
                              placeholder="Nhập đáp số của bạn..."
                              className="w-full sm:w-72 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                            />
                            {isRevealed && (
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Đáp số chính xác:{' '}
                                <MathRenderer text={qd.shortAnswerCorrect || ''} inline />
                              </p>
                            )}
                          </div>
                        )}

                        {/* Thanh hành động của Lần hiện tại: Kiểm tra đáp án HOẶC Skip lần này */}
                        {!isRevealed ? (
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                            <Button
                              type="button"
                              variant="outline"
                              data-testid={`quick-drill-skip-turn-${idx + 1}-btn`}
                              onClick={() => handleSkipQuickDrillTurn(qd, idx)}
                              className="rounded-xl text-xs font-bold border-amber-400/70 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                            >
                              ⏭ Bỏ qua lần này (Skip Lần {idx + 1}/3)
                            </Button>

                            <Button
                              type="button"
                              data-testid={`quick-drill-check-turn-${idx + 1}-btn`}
                              disabled={!answered}
                              onClick={() => handleCheckQuickDrillTurn(qd, idx)}
                              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl px-5 py-2.5 text-xs sm:text-sm cursor-pointer disabled:opacity-40"
                            >
                              Kiểm tra đáp án Lần {idx + 1}/3
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                Lời giải chi tiết Lần {idx + 1}/3:
                              </span>
                              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                <MathRenderer text={qd.explanation} />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2.5">
                              {idx < quickDrillQuestions.length - 1 ? (
                                <Button
                                  type="button"
                                  data-testid={`quick-drill-next-turn-${idx + 2}-btn`}
                                  onClick={() => setQuickDrillActiveStep((idx + 1) as 0 | 1 | 2)}
                                  rightIcon={<ArrowRight className="w-4 h-4" />}
                                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl px-5 py-2.5 text-xs sm:text-sm cursor-pointer"
                                >
                                  Sang Lần {idx + 2}/3
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  data-testid="quick-drill-finish-summary-btn"
                                  onClick={() => {
                                    if (!quickDrillBehaviorSaved) {
                                      void persistQuickDrillBehaviorToPostgres(
                                        quickDrillCheckedIds,
                                        quickDrillSkippedIds,
                                        false
                                      );
                                    }
                                    setQuickDrillSourceQuestion(null);
                                  }}
                                  rightIcon={<ArrowRight className="w-4 h-4" />}
                                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl px-5 py-2.5 text-xs sm:text-sm cursor-pointer"
                                >
                                  Hoàn tất &amp; Quay lại lời giải
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })()}
                </div>
              </div>
            </div>
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

          {/* Live Timer Countdown (Tách riêng component không re-render cây DOM chính) */}
          <ExamTopBarTimerBadge timerManager={timerManager} totalLimitSeconds={totalLimitSeconds} />

          {/* Nộp Bài Button */}
          <Button
            data-testid="open-submit-modal-btn"
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
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700/60 px-3.5 sm:px-5 py-3 sm:py-4 bg-slate-50/90 dark:bg-slate-800/60 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
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
                  {currentQ.topicTag && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30 break-words">
                      🏷️ {currentQ.topicTag}
                    </span>
                  )}
                  {renderPreviousChapterBadge(currentQ, false)}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                  {isAdmin && (
                    <button
                      type="button"
                      data-testid="admin-edit-question-btn"
                      onClick={() => handleOpenAdminEditQuestion(currentQ)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer border',
                        adminEditingQuestionId === currentQ.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/40'
                      )}
                      title="Quản trị viên: Chỉnh sửa trực tiếp nội dung câu hỏi & câu trả lời (lưu thẳng PostgreSQL)"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>
                        {adminEditingQuestionId === currentQ.id
                          ? 'Đóng chỉnh sửa'
                          : '✏️ Sửa câu hỏi / đáp án'}
                      </span>
                    </button>
                  )}

                  {practiceModeParam === 'TOPIC' && !isAssessment && (
                    <button
                      type="button"
                      data-testid="ask-socratic-ai-btn"
                      onClick={() =>
                        setActiveHintQuestionId((prev) =>
                          prev === currentQ.id ? null : currentQ.id
                        )
                      }
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer border',
                        topicHintsByQuestion[currentQ.id]
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30'
                          : 'text-[#007D99] dark:text-[#00B8DD] bg-[#00B8DD]/15 hover:bg-[#00B8DD]/25 border-[#00B8DD]/30'
                      )}
                      title={
                        topicHintsByQuestion[currentQ.id]
                          ? 'Đã dùng 1/1 lần trợ giúp của câu này — bấm để ẩn/hiện gợi ý'
                          : 'Mỗi câu hỏi trong chế độ chuyên đề có 1 lần trợ giúp gợi ý cách giải'
                      }
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
                      <span>
                        {topicHintsByQuestion[currentQ.id]
                          ? activeHintQuestionId === currentQ.id
                            ? '💡 Đã trợ giúp (0/1) • Ẩn'
                            : '💡 Đã trợ giúp (0/1) • Xem gợi ý'
                          : '💡 Trợ giúp (1/1)'}
                      </span>
                    </button>
                  )}

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
                {/* ── KHUNG GỢI Ý CÂU ĐÚNG & CHỈNH SỬA TRỰC TIẾP DÀNH RIÊNG CHO ADMIN ── */}
                {isAdmin && (
                  <div
                    data-testid="admin-answer-key-bar"
                    className="p-3.5 sm:p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-400/80 dark:border-amber-600/70 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider shrink-0">
                          👑 Gợi ý Admin
                        </span>
                        <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 break-words">
                          {currentQ.type === 'MULTIPLE_CHOICE' && (
                            <span>
                              Đáp án đúng:{' '}
                              <strong className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black">
                                Phương án {currentQ.correctChoice}
                              </strong>{' '}
                              {currentQ.choices?.find((c) => c.key === currentQ.correctChoice)
                                ?.content ? (
                                <span className="text-slate-700 dark:text-slate-200 ml-1">
                                  (
                                  <MathRenderer
                                    text={
                                      currentQ.choices.find(
                                        (c) => c.key === currentQ.correctChoice
                                      )?.content || ''
                                    }
                                    inline
                                  />
                                  )
                                </span>
                              ) : null}
                            </span>
                          )}
                          {currentQ.type === 'TRUE_FALSE' && (
                            <span>
                              Đáp án đúng:{' '}
                              {(currentQ.statements || []).map((st) => (
                                <span
                                  key={st.subId}
                                  className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black mr-1.5',
                                    st.isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-600 text-white'
                                  )}
                                >
                                  {st.subId}) {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                              ))}
                            </span>
                          )}
                          {currentQ.type === 'SHORT_ANSWER' && (
                            <span>
                              Đáp số đúng:{' '}
                              <strong className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-black">
                                {currentQ.shortAnswerCorrect || 'Chưa cấu hình'}
                              </strong>
                            </span>
                          )}
                          {currentQ.type === 'ESSAY' && (
                            <span>
                              Đáp án mẫu:{' '}
                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                {currentQ.essaySampleAnswer || currentQ.explanation || 'Tự luận'}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          data-testid="admin-quick-fill-current-btn"
                          onClick={() => {
                            if (currentQ.type === 'MULTIPLE_CHOICE' && currentQ.correctChoice) {
                              handleSelectChoice(currentQ.id, currentQ.correctChoice);
                            } else if (currentQ.type === 'TRUE_FALSE' && currentQ.statements) {
                              for (const st of currentQ.statements) {
                                handleSelectTrueFalse(currentQ.id, st.subId, Boolean(st.isCorrect));
                              }
                            } else if (currentQ.type === 'SHORT_ANSWER') {
                              handleShortAnswerChange(
                                currentQ.id,
                                currentQ.shortAnswerCorrect || ''
                              );
                            } else if (currentQ.type === 'ESSAY') {
                              handleEssayAnswerChange(
                                currentQ.id,
                                currentQ.essaySampleAnswer || currentQ.explanation || ''
                              );
                            }
                            toast.success(`Đã chọn nhanh đáp án đúng cho Câu ${activeQuestionIdx + 1}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          ⚡ Chọn nhanh câu đúng
                        </button>

                        <button
                          type="button"
                          data-testid="admin-quick-fill-all-btn"
                          onClick={() => {
                            const nextMc: Record<string, 'A' | 'B' | 'C' | 'D'> = {
                              ...multipleChoices,
                            };
                            const nextTf: Record<string, Record<string, boolean>> = {
                              ...trueFalseAnswers,
                            };
                            const nextSa: Record<string, string> = { ...shortAnswers };
                            const nextEs: Record<string, string> = { ...essayAnswers };

                            for (const q of exam.questions) {
                              if (q.type === 'MULTIPLE_CHOICE' && q.correctChoice) {
                                nextMc[q.id] = q.correctChoice;
                              } else if (q.type === 'TRUE_FALSE' && q.statements) {
                                const map: Record<string, boolean> = {};
                                for (const st of q.statements) {
                                  map[st.subId] = Boolean(st.isCorrect);
                                }
                                nextTf[q.id] = map;
                              } else if (q.type === 'SHORT_ANSWER') {
                                nextSa[q.id] = q.shortAnswerCorrect || '';
                              } else if (q.type === 'ESSAY') {
                                nextEs[q.id] = q.essaySampleAnswer || q.explanation || '';
                              }
                            }

                            setMultipleChoices(nextMc);
                            setTrueFalseAnswers(nextTf);
                            setShortAnswers(nextSa);
                            setEssayAnswers(nextEs);
                            toast.success(
                              `Đã điền tự động đáp án đúng cho toàn bộ ${exam.questions.length} câu!`
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#00B8DD] hover:bg-[#009bbd] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          ⚡ Điền đúng cả đề
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAdminEditQuestion(currentQ)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-amber-100/60 cursor-pointer"
                        >
                          {adminEditingQuestionId === currentQ.id
                            ? 'Thu gọn khung sửa'
                            : '✏️ Chỉnh sửa nội dung'}
                        </button>
                      </div>
                    </div>

                    {/* KHUNG CHỈNH SỬA TRỰC TIẾP CÂU HỎI & CÂU TRẢ LỜI (LƯU THẲNG POSTGRESQL) */}
                    {adminEditingQuestionId === currentQ.id && (
                      <div
                        data-testid="admin-inline-question-editor"
                        className="pt-3 border-t border-amber-300/80 dark:border-amber-700/70 space-y-3.5 animate-in fade-in duration-150"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                              Tiêu đề câu hỏi
                            </label>
                            <input
                              type="text"
                              data-testid="admin-edit-title-input"
                              value={adminEditDraft.title}
                              onChange={(e) =>
                                setAdminEditDraft((prev) => ({ ...prev, title: e.target.value }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                              Chuyên đề (Topic Tag)
                            </label>
                            <input
                              type="text"
                              data-testid="admin-edit-topic-input"
                              value={adminEditDraft.topicTag}
                              onChange={(e) =>
                                setAdminEditDraft((prev) => ({
                                  ...prev,
                                  topicTag: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                            Nội dung câu hỏi (Hỗ trợ LaTeX $...$)
                          </label>
                          <textarea
                            rows={3}
                            data-testid="admin-edit-content-textarea"
                            value={adminEditDraft.content}
                            onChange={(e) =>
                              setAdminEditDraft((prev) => ({ ...prev, content: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                          />
                        </div>

                        {/* Chỉnh sửa phương án Trắc nghiệm 4 lựa chọn */}
                        {currentQ.type === 'MULTIPLE_CHOICE' && (
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Chỉnh sửa 4 phương án trả lời &amp; Chọn đáp án đúng:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {adminEditDraft.choices.map((ch, cIdx) => {
                                const isRight = adminEditDraft.correctChoice === ch.key;
                                return (
                                  <div
                                    key={ch.key}
                                    className={cn(
                                      'p-2.5 rounded-xl border flex items-center gap-2 bg-white dark:bg-slate-900',
                                      isRight
                                        ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/15'
                                        : 'border-slate-300 dark:border-slate-700'
                                    )}
                                  >
                                    <button
                                      type="button"
                                      data-testid={`admin-set-correct-choice-${ch.key}`}
                                      onClick={() =>
                                        setAdminEditDraft((prev) => ({
                                          ...prev,
                                          correctChoice: ch.key,
                                        }))
                                      }
                                      className={cn(
                                        'px-2.5 py-1.5 rounded-lg text-xs font-black shrink-0 cursor-pointer transition-colors',
                                        isRight
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20'
                                      )}
                                      title="Nhấn để đặt làm Đáp án đúng"
                                    >
                                      {ch.key} {isRight ? '✓ Đúng' : ''}
                                    </button>
                                    <input
                                      type="text"
                                      data-testid={`admin-edit-choice-input-${ch.key}`}
                                      value={ch.content}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAdminEditDraft((prev) => {
                                          const next = [...prev.choices];
                                          next[cIdx] = { ...next[cIdx], content: val };
                                          return { ...prev, choices: next };
                                        });
                                      }}
                                      placeholder={`Nội dung đáp án ${ch.key}...`}
                                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD]"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Chỉnh sửa mệnh đề Đúng/Sai */}
                        {currentQ.type === 'TRUE_FALSE' && (
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Chỉnh sửa nội dung 4 mệnh đề &amp; Đáp án Đúng/Sai chuẩn:
                            </label>
                            <div className="space-y-2">
                              {adminEditDraft.statements.map((st, sIdx) => (
                                <div
                                  key={st.subId}
                                  className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center gap-2"
                                >
                                  <span className="font-black text-xs text-[#007D99] dark:text-[#00B8DD] shrink-0">
                                    Ý {st.subId})
                                  </span>
                                  <input
                                    type="text"
                                    data-testid={`admin-edit-statement-input-${st.subId}`}
                                    value={st.statement}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAdminEditDraft((prev) => {
                                        const next = [...prev.statements];
                                        next[sIdx] = { ...next[sIdx], statement: val };
                                        return { ...prev, statements: next };
                                      });
                                    }}
                                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD]"
                                  />
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAdminEditDraft((prev) => {
                                          const next = [...prev.statements];
                                          next[sIdx] = { ...next[sIdx], isCorrect: true };
                                          return { ...prev, statements: next };
                                        })
                                      }
                                      className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer',
                                        st.isCorrect
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                      )}
                                    >
                                      Chuẩn: ĐÚNG
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAdminEditDraft((prev) => {
                                          const next = [...prev.statements];
                                          next[sIdx] = { ...next[sIdx], isCorrect: false };
                                          return { ...prev, statements: next };
                                        })
                                      }
                                      className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer',
                                        !st.isCorrect
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                      )}
                                    >
                                      Chuẩn: SAI
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chỉnh sửa đáp số Điền số / Trả lời ngắn */}
                        {currentQ.type === 'SHORT_ANSWER' && (
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                              Đáp số đúng (Short Answer)
                            </label>
                            <input
                              type="text"
                              data-testid="admin-edit-short-answer-input"
                              value={adminEditDraft.shortAnswerCorrect}
                              onChange={(e) =>
                                setAdminEditDraft((prev) => ({
                                  ...prev,
                                  shortAnswerCorrect: e.target.value,
                                }))
                              }
                              className="w-full sm:w-72 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                            />
                          </div>
                        )}

                        {/* Chỉnh sửa lời giải chi tiết */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                            Lời giải chi tiết / Hướng dẫn giải
                          </label>
                          <textarea
                            rows={3}
                            data-testid="admin-edit-explanation-textarea"
                            value={adminEditDraft.explanation}
                            onChange={(e) =>
                              setAdminEditDraft((prev) => ({
                                ...prev,
                                explanation: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAdminEditingQuestionId(null)}
                            className="rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Hủy
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            data-testid="admin-save-question-btn"
                            disabled={adminSavingQuestionEdit}
                            onClick={() => handleSaveAdminEditQuestion(currentQ)}
                            className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs px-4 cursor-pointer"
                          >
                            {adminSavingQuestionEdit ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Đang lưu vào PostgreSQL...
                              </span>
                            ) : (
                              '💾 Lưu thay đổi (PostgreSQL)'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Khung Trợ giúp 1 lần/câu trong Chế độ Chuyên đề */}
                {practiceModeParam === 'TOPIC' &&
                  !isAssessment &&
                  activeHintQuestionId === currentQ.id && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/25 border border-[#00B8DD]/35 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                      {!topicHintsByQuestion[currentQ.id] ? (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#007D99] dark:text-[#5CE1FF] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                              <span>
                                Trợ giúp tư duy (1 lần duy nhất cho Câu {activeQuestionIdx + 1})
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Chỉ gợi ý hướng giải &amp; ví dụ tương đương, không tiết lộ đáp án
                            </span>
                          </div>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleRequestTopicQuestionHint(currentQ);
                            }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                          >
                            <input
                              type="text"
                              value={hintDoubtInputs[currentQ.id] || ''}
                              onChange={(e) =>
                                setHintDoubtInputs((prev) => ({
                                  ...prev,
                                  [currentQ.id]: e.target.value,
                                }))
                              }
                              disabled={loadingHintQuestionId === currentQ.id}
                              placeholder="Nhập chỗ bạn đang thắc mắc (không nhập cũng được, bấm Nhận gợi ý luôn)..."
                              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00B8DD]"
                            />
                            <button
                              type="submit"
                              disabled={loadingHintQuestionId === currentQ.id}
                              className="px-4 py-2 rounded-xl bg-[#00B8DD] hover:bg-[#00a3c4] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
                            >
                              {loadingHintQuestionId === currentQ.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang tạo gợi ý...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Nhận gợi ý</span>
                                </>
                              )}
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#00B8DD]/20">
                            <span className="text-xs font-bold text-[#007D99] dark:text-[#5CE1FF] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
                              <span>Gợi ý hướng giải &amp; Ví dụ tương đương (Đã dùng 1/1 lần)</span>
                            </span>
                            {topicHintsByQuestion[currentQ.id].doubt && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                Thắc mắc của bạn: &ldquo;{topicHintsByQuestion[currentQ.id].doubt}&rdquo;
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 leading-relaxed break-words">
                            <AgentChatMessageContent
                              content={topicHintsByQuestion[currentQ.id].hintMarkdown}
                              role="assistant"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
                        const isAdminCorrectHint =
                          isAdmin && currentQ.correctChoice === choice.key;
                        return (
                          <button
                            key={choice.key}
                            type="button"
                            onClick={() => handleSelectChoice(currentQ.id, choice.key)}
                            className={cn(
                              'p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer group w-full min-w-0 overflow-hidden',
                              isSelected
                                ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] text-slate-900 dark:text-white font-bold shadow-md shadow-[#00B8DD]/15'
                                : isAdminCorrectHint
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/80 text-slate-900 dark:text-white font-semibold'
                                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 hover:border-[#00B8DD]/60 text-slate-800 dark:text-slate-300'
                            )}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <span
                                className={cn(
                                  'w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-[#00B8DD] text-white'
                                    : isAdminCorrectHint
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 group-hover:text-[#00B8DD]'
                                )}
                              >
                                {choice.key}
                              </span>
                              <span className="text-xs sm:text-sm min-w-0 break-words overflow-hidden">
                                <MathRenderer text={choice.content} inline />
                              </span>
                            </div>

                            {isAdminCorrectHint && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold shrink-0">
                                ✓ Đáp án đúng
                              </span>
                            )}
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
                              {isAdmin && (
                                <span
                                  className={cn(
                                    'px-2 py-1 rounded-md text-[10px] font-black',
                                    st.isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                                  )}
                                >
                                  👑 Chuẩn: {st.isCorrect ? 'ĐÚNG' : 'SAI'}
                                </span>
                              )}
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
                      Nhập câu trả lời của bạn:
                    </label>
                    <div className="max-w-md space-y-2">
                      <input
                        type="text"
                        value={shortAnswers[currentQ.id] || ''}
                        onChange={(e) =>
                          handleShortAnswerChange(currentQ.id, e.target.value)
                        }
                        placeholder="Nhập câu trả lời của bạn..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                      />
                      {isAdmin && currentQ.shortAnswerCorrect && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          👑 Gợi ý Admin — Đáp số đúng:{' '}
                          <span className="font-mono">{currentQ.shortAnswerCorrect}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. ESSAY */}
                {currentQ.type === 'ESSAY' && (
                  <div className="space-y-3 pt-2">
                    <SubjectEssayEditor
                      subjectSlug={currentQ.subjectSlug || subjectSlug}
                      value={essayAnswers[currentQ.id] || ''}
                      onChange={(val) =>
                        handleEssayAnswerChange(currentQ.id, val)
                      }
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

          {/* Sidebar Live Timer Card (Tách riêng component không re-render cây DOM chính) */}
          <ExamSideBarTimerCard timerManager={timerManager} totalLimitSeconds={totalLimitSeconds} />
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
                  {formatTimer(timerManager ? timerManager.getElapsed() : submittedTimeSpent)}
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
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                  Bạn đã trả lời đầy đủ các câu hỏi
                </p>
                <p className="text-emerald-700/90 dark:text-emerald-400/90 text-[11px] mt-0.5">
                  Nhấn nộp bài để xem điểm số và lời giải chi tiết.
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
              data-testid="confirm-submit-exam-btn"
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

      {/* Modal Đăng nhập Lưu Kết Quả Đề Thử Khách & Mở Khóa Bước Tiếp Theo */}
      <RequireLoginModal
        isOpen={guestLoginModalOpen}
        onClose={() => setGuestLoginModalOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={guestLoginTargetLabel}
        returnUrl={guestLoginReturnUrl || '/student/practice'}
      />
    </div>
  );

}

function ExamRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, currentRole } = useAuthStore();
  const isLoggedIn = Boolean(isAuthenticated && user?.id);
  const isAdmin =
    (currentRole as string) === 'ADMIN' ||
    currentRole === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';
  const [isMounted, setIsMounted] = React.useState(false);

  const olympiadId = searchParams.get('olympiadId');
  const subjectSlug = searchParams.get('subject') || 'toan-hoc';
  const levelParam = (searchParams.get('level') || 'basic').toUpperCase() as PracticeLevel;
  const gradeParam = searchParams.get('grade') || '12';
  const chapterParam = searchParams.get('chapter') || '1';
  const practiceModeParam = searchParams.get('practiceMode') || 'TOPIC';
  const formatParam = searchParams.get('format') || 'quiz';
  const attemptTokenParam = searchParams.get('attemptToken') || searchParams.get('token');

  const roomInstanceKey = `${subjectSlug}-${levelParam}-${gradeParam}-${chapterParam}-${practiceModeParam}-${formatParam}`;

  const isOlympiad =
    !!olympiadId ||
    levelParam === 'PROVINCIAL_EXCELLENT' ||
    levelParam === 'NATIONAL_EXCELLENT';

  const isGuestEligibleBasicExam =
    !isOlympiad && (levelParam === 'BASIC' || levelParam === 'ASSESSMENT');

  const [guestOnboardingSnapshot, setGuestOnboardingSnapshot] = React.useState(() =>
    typeof window !== 'undefined' ? getGuestOnboarding() : null
  );
  const [guestTrialSessionActive, setGuestTrialSessionActive] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const guest = getGuestOnboarding();
    setGuestOnboardingSnapshot(guest);
    if (guest && guest.trialUsedCount < 1 && isGuestEligibleBasicExam) {
      setGuestTrialSessionActive(true);
    }
  }, [isGuestEligibleBasicExam]);

  const needsInlineGuestOnboarding =
    isMounted &&
    !isLoggedIn &&
    !attemptTokenParam &&
    isGuestEligibleBasicExam &&
    !guestOnboardingSnapshot;

  const isAllowedGuestSession =
    !isLoggedIn &&
    isGuestEligibleBasicExam &&
    Boolean(
      guestTrialSessionActive ||
        (guestOnboardingSnapshot && guestOnboardingSnapshot.trialUsedCount < 1)
    );

  const requiresLogin =
    !attemptTokenParam && !needsInlineGuestOnboarding && !isAllowedGuestSession;

  React.useEffect(() => {
    if (!isMounted) return;
    if (requiresLogin && !isLoggedIn) {
      examOfflineStorage.clearActiveExamSession().catch(() => {});
      const currentUrl =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '';
      toast.warning('Đăng nhập để tiếp tục luyện tập!', {
        description: guestOnboardingSnapshot
          ? 'Bạn đã hoàn thành 1 đề làm thử miễn phí. Hãy đăng nhập để lưu kết quả và mở khóa toàn bộ lộ trình!'
          : 'Bạn cần đăng nhập tài khoản học sinh để tạo đề nâng cao hoặc thi thử.',
      });
      router.replace(`/login/student?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [isMounted, requiresLogin, isLoggedIn, guestOnboardingSnapshot, router]);

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

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        Đang khởi tạo phòng thi trực tuyến...
      </div>
    );
  }

  // Nếu khách chưa điền Tên + Lớp khi vào thẳng đề Cơ bản -> Hiện popup Onboarding ngay tại chỗ (Try-First)
  if (needsInlineGuestOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <GradeOnboardingModal
          isOpen={true}
          mode="GUEST_TRIAL"
          onClose={() => router.replace('/luyen-thi')}
          onCompleted={(res) => {
            const latestGuest = getGuestOnboarding();
            setGuestOnboardingSnapshot(latestGuest);
            setGuestTrialSessionActive(true);
            if (String(res.grade) !== String(gradeParam)) {
              const url = new URL(window.location.href);
              url.searchParams.set('grade', String(res.grade));
              router.replace(url.pathname + url.search);
            }
          }}
        />
      </div>
    );
  }

  // Nếu chưa đăng nhập và vượt giới hạn dùng thử / chọn mức khóa -> Chặn và chuyển hướng đăng nhập
  if (requiresLogin && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Đăng Nhập Để Tiếp Tục Lộ Trình</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Đăng nhập miễn phí để lưu kết quả làm bài, mở khóa các chương tiếp theo và nâng cấp mức Trung bình / Nâng cao. Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  if (isOlympiad && olympiadExam) {
    const cachedPts = isMounted ? getCachedPointsBalance() : null;
    if (!isAdmin && cachedPts !== null && cachedPts < 9) {
      examOfflineStorage.clearActiveExamSession().catch(() => {});
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col pt-20">
          <Navbar />
          <OutOfPointsModal
            isOpen={true}
            onClose={() => {
              examOfflineStorage.clearActiveExamSession().catch(() => {});
              router.replace('/luyen-thi');
            }}
            currentPoints={Math.max(0, cachedPts)}
            requiredPoints={9}
            levelLabel={olympiadExam.title || 'Đề HSG / Nâng cao'}
            secondaryLabel="Quay lại Cổng Luyện Thi"
            onNavigatePricing={() => {
              examOfflineStorage.clearActiveExamSession().catch(() => {});
              router.replace('/pricing');
            }}
          />
        </div>
      );
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`schoolify_started_pts_${olympiadExam.id}`, '1');
    }
    if (olympiadExam.examType === 'CODING') {
      return <CodingExamRoom exam={olympiadExam} />;
    } else {
      return <OlympiadEssayExamRoom exam={olympiadExam} />;
    }
  }

  return <StandardExamRoomContent key={roomInstanceKey} />;
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
