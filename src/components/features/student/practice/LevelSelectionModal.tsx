'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Award,
  Flame,
  Trophy,
  Crown,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileText,
  Check,
  RotateCcw,
  Target,
  Layers,
  Zap,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { K12Subject, PracticeLevel, LevelDetail } from '@/types/subject';
import { PRACTICE_LEVELS } from '@/services/mock/subject-data';

const CORE_PRACTICE_LEVELS = PRACTICE_LEVELS.filter(
  (lvl) => lvl.id !== 'PROVINCIAL_EXCELLENT' && lvl.id !== 'NATIONAL_EXCELLENT'
);
import {
  MATH_GRADE_12_CHAPTERS,
  getChaptersBySubject,
  ExamFormat,
} from '@/services/mock/practice-flow-data';
import { getOlympiadExamsBySubject, OLYMPIAD_EXAMS } from '@/services/mock/olympiad-exams';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import {
  examPointsService,
  getCachedPointsBalance,
  getExamLevelCost,
  notifyExamPointsUpdated,
} from '@/services/exam-points.service';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { NgocIcon } from '@/components/ui/point-icons';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';
import { buildTopicRoadmapHref } from '@/lib/topic-route-utils';

interface LevelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: K12Subject | null;
  isLoggedIn?: boolean;
  initialMode?: 'TOPIC' | 'MOCK_EXAM';
}

type WizardStep =
  | 'MODE'
  | 'CHAPTER_PATH'
  | 'LEVEL'
  | 'GRADE'
  | 'CHAPTER'
  | 'FORMAT'
  | 'DURATION'
  | 'HSG_EXAMS'
  | 'MOCK_MILESTONE'
  | 'MOCK_READY';

const TOPIC_WIZARD_STEPS: { step: WizardStep; number: number; label: string }[] = [
  { step: 'MODE', number: 1, label: 'Chế độ' },
  { step: 'CHAPTER_PATH', number: 2, label: 'Lộ trình chương' },
];

const MOCK_WIZARD_STEPS: { step: WizardStep; number: number; label: string }[] = [
  { step: 'MODE', number: 1, label: 'Chế độ' },
  { step: 'MOCK_MILESTONE', number: 2, label: 'Mốc thi' },
  { step: 'GRADE', number: 3, label: 'Khối lớp' },
  { step: 'MOCK_READY', number: 4, label: 'Tạo đề' },
];

function OrigamiGlider({ className = "w-20 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <g transform="translate(340, 0) scale(-1, 1)">
        {/* Main Upper Wing */}
        <polygon
          points="14,62 320,10 278,54"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Main Lower Wing */}
        <polygon
          points="14,62 278,70 320,114"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Upper Inner Fold / Shading */}
        <polygon
          points="14,62 278,54 256,62"
          fill="#F1F5F9"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Lower Inner Fold / Shading */}
        <polygon
          points="14,62 256,62 278,70"
          fill="#E2E8F0"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Blueprint CAD Guidelines */}
        <g stroke="#94A3B8" strokeWidth="1.2">
          <line x1="126" y1="45" x2="286" y2="19" />
          <line x1="168" y1="48" x2="294" y2="29" />
          <line x1="210" y1="51" x2="302" y2="39" />

          <line x1="126" y1="79" x2="286" y2="105" />
          <line x1="168" y1="76" x2="294" y2="95" />
          <line x1="210" y1="73" x2="302" y2="85" />
        </g>

        {/* Schoolify Brand Accent Stripes */}
        <line x1="62" y1="54" x2="76" y2="59" stroke="#00B8DD" strokeWidth="3.2" />
        <line x1="62" y1="70" x2="76" y2="65" stroke="#F59E0B" strokeWidth="3.2" />
        <circle cx="232" cy="37" r="6" fill="none" stroke="#00B8DD" strokeWidth="1.8" />
        <line x1="256" y1="62" x2="334" y2="62" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

export type MockMilestoneId = '15P' | '45P' | 'MIDTERM' | 'FINAL' | 'THPT';

export interface MockMilestone {
  id: MockMilestoneId;
  name: string;
  badge: string;
  duration: number;
  questionCount: number;
  description: string;
  matrixDesc: string;
  requiresGrade12?: boolean;
}

export const MOCK_MILESTONES: MockMilestone[] = [
  {
    id: '15P',
    name: 'Kiểm tra 15 phút',
    badge: '15 phút • 10 câu',
    duration: 15,
    questionCount: 10,
    description: 'Kiểm tra nhanh kiến thức trọng tâm bài học, rèn phản xạ và ghi nhớ định nghĩa, công thức cốt lõi.',
    matrixDesc: '100% Trắc nghiệm nhận biết & thông hiểu',
  },
  {
    id: '45P',
    name: 'Kiểm tra 45 phút (1 tiết)',
    badge: '45 phút • 25 câu',
    duration: 45,
    questionCount: 25,
    description: 'Bài kiểm tra định kỳ 1 chương / chủ đề lớn, đánh giá năng lực tư duy và vận dụng kiến thức.',
    matrixDesc: 'Trắc nghiệm nhiều lựa chọn & điền số',
  },
  {
    id: 'MIDTERM',
    name: 'Thi Giữa kỳ',
    badge: '60 - 90 phút • 40 câu',
    duration: 90,
    questionCount: 40,
    description: 'Chuẩn ma trận đề kiểm tra giữa học kỳ theo khung chương trình GDPT 2018 của Bộ GD&ĐT.',
    matrixDesc: '40% NB • 30% TH • 20% VD • 10% VDC',
  },
  {
    id: 'FINAL',
    name: 'Thi Cuối kỳ',
    badge: '90 phút • 50 câu',
    duration: 90,
    questionCount: 50,
    description: 'Đề thi tổng hợp toàn bộ học kỳ, tổng kết điểm số và đánh giá toàn diện năng lực học tập.',
    matrixDesc: 'Chuẩn cấu trúc đề kiểm tra học kỳ Sở GD&ĐT',
  },
  {
    id: 'THPT',
    name: 'Thi Tốt nghiệp THPT',
    badge: 'Dành cho Lớp 12',
    duration: 90,
    questionCount: 50,
    description: 'Đề thi thử Tốt nghiệp THPT chuẩn cấu trúc định dạng đề thi mới nhất từ Bộ GD&ĐT.',
    matrixDesc: 'Chuẩn 3 phần: Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn',
    requiresGrade12: true,
  },
];

interface DurationOption {
  minutes: number;
  label: string;
  badge: string;
  desc: string;
  badgeColor: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    minutes: 10,
    label: '10 Phút',
    badge: '10 phút',
    desc: 'Luyện tập nhanh, ôn tập dạng bài trọng tâm trong thời gian ngắn.',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
  },
  {
    minutes: 15,
    label: '15 Phút',
    badge: '15 phút',
    desc: 'Tương đương một bài kiểm tra 15 phút thường xuyên trên lớp.',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
  },
  {
    minutes: 45,
    label: '45 Phút',
    badge: '1 tiết',
    desc: 'Thời lượng kiểm tra 1 tiết định kỳ, bao quát các mức độ câu hỏi.',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
  },
  {
    minutes: 60,
    label: '60 Phút',
    badge: 'Chuyên đề',
    desc: 'Ôn tập chuyên đề tổng hợp, rèn luyện kỹ năng giải các câu phân loại.',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
  },
  {
    minutes: 90,
    label: '90 Phút',
    badge: 'Thi THPT',
    desc: 'Thời gian chuẩn theo cấu trúc đề thi Tốt nghiệp THPT của Bộ GD&ĐT.',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
  },
];

const LEVEL_ICONS: Record<PracticeLevel, React.ReactNode> = {
  BASIC: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  MEDIUM: <Award className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
  ADVANCED: <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  PROVINCIAL_EXCELLENT: <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
  NATIONAL_EXCELLENT: <Crown className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
  ASSESSMENT: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
};

export function LevelSelectionModal({
  isOpen,
  onClose,
  subject,
  isLoggedIn = false,
  initialMode,
}: LevelSelectionModalProps) {
  const router = useRouter();
  const { user, isAuthenticated, currentRole } = useAuthStore();
  const effectiveIsLoggedIn = Boolean((isLoggedIn || isAuthenticated) && user?.id);
  const isAdmin =
    (currentRole as string) === 'ADMIN' ||
    currentRole === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';
  const [isVerifyingStart, setIsVerifyingStart] = React.useState(false);

  // Wizard Steps
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('MODE');
  const [maxStepReached, setMaxStepReached] = React.useState<number>(1);
  const [isAssessmentMode, setIsAssessmentMode] = React.useState<boolean>(false);

  // Selected State
  const [selectedPracticeMode, setSelectedPracticeMode] = React.useState<'TOPIC' | 'MOCK_EXAM'>('TOPIC');
  const [activeModeTooltip, setActiveModeTooltip] = React.useState<'TOPIC' | 'MOCK_EXAM' | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<LevelDetail>(CORE_PRACTICE_LEVELS[0]);
  const [selectedMockMilestone, setSelectedMockMilestone] = React.useState<MockMilestone>(MOCK_MILESTONES[0]);
  const [selectedGrade, setSelectedGrade] = React.useState<number>(12);
  const [selectedChapterId, setSelectedChapterId] = React.useState<number>(1);
  const [isAllChaptersMock, setIsAllChaptersMock] = React.useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = React.useState<ExamFormat>('QUIZ');
  const [quizCount, setQuizCount] = React.useState<number>(10);
  const [essayCount, setEssayCount] = React.useState<number>(5);
  const [selectedDuration, setSelectedDuration] = React.useState<number>(45);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD'>('ALL');

  // Danh sách chương học động bám sát môn học và khối lớp đang chọn
  const chapters = React.useMemo(() => {
    if (!subject) return MATH_GRADE_12_CHAPTERS;
    return getChaptersBySubject(subject.slug, selectedGrade);
  }, [subject, selectedGrade]);

  // Danh sách đề thi Học Sinh Giỏi theo môn và cấp độ
  const hsgExams = React.useMemo(() => {
    if (!subject) return [];
    const matched = getOlympiadExamsBySubject(subject.slug, selectedLevel.id);
    if (matched.length > 0) return matched;
    return OLYMPIAD_EXAMS.filter((e) => e.level === selectedLevel.id);
  }, [subject, selectedLevel]);

  // Gated Login Modal State
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [selectedGatedLevelName, setSelectedGatedLevelName] = React.useState<string>('');
  const [pendingReturnUrl, setPendingReturnUrl] = React.useState<string>('');

  // Out of Points (Hết Tia Sáng) Modal State
  const [currentPoints, setCurrentPoints] = React.useState<number>(() => {
    const cached = getCachedPointsBalance();
    return cached !== null ? cached : 9;
  });
  const [outOfPointsModal, setOutOfPointsModal] = React.useState<{
    isOpen: boolean;
    currentPoints: number;
    requiredPoints: number;
    levelLabel: string;
  }>({
    isOpen: false,
    currentPoints: 0,
    requiredPoints: 3,
    levelLabel: 'Cơ bản',
  });

  // Sync Tia Sáng balance from localStorage & backend
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncPoints = () => {
      const cached = getCachedPointsBalance();
      if (cached !== null) {
        setCurrentPoints(cached);
      }
    };
    syncPoints();

    // Luôn đồng bộ số dư điểm thực tế mới nhất từ Backend khi mở Modal
    if (isOpen && user?.id) {
      examPointsService.getBalance(user.id).then((res) => {
        if (res && typeof res.currentPoints === 'number') {
          setCurrentPoints(res.currentPoints);
          notifyExamPointsUpdated(res.currentPoints);
        }
      });
    }

    window.addEventListener('tokens-updated', syncPoints);
    window.addEventListener('storage', syncPoints);
    return () => {
      window.removeEventListener('tokens-updated', syncPoints);
      window.removeEventListener('storage', syncPoints);
    };
  }, [user?.id, isOpen]);

  const checkAndGatePoints = React.useCallback(
    (rawLevel: string, customLabel?: string, targetUrl?: string): boolean => {
      // 1. Chưa đăng nhập -> Cho phép Khách làm thử miễn phí 1 đề CƠ BẢN sau khi điền Tên + Lớp
      if (!effectiveIsLoggedIn) {
        const guest = getGuestOnboarding();
        const isFreeBasicGuestTrial =
          Boolean(guest) &&
          (guest?.trialUsedCount ?? 0) < 1 &&
          String(rawLevel || '').toUpperCase() === 'BASIC';
        if (isFreeBasicGuestTrial) {
          return true;
        }
        setSelectedGatedLevelName(customLabel || 'Đề luyện thi');
        setPendingReturnUrl(targetUrl || '/luyen-thi');
        setRequireLoginOpen(true);
        return false;
      }

      if (isAdmin) return true;

      // 2. Kiểm tra số dư Tia Sáng hiện tại
      const cached = getCachedPointsBalance();
      const effectivePoints = cached !== null ? cached : currentPoints;
      const costInfo = getExamLevelCost(rawLevel);
      if (effectivePoints <= 0 || effectivePoints < costInfo.costPoints) {
        setOutOfPointsModal({
          isOpen: true,
          currentPoints: Math.max(0, effectivePoints),
          requiredPoints: costInfo.costPoints,
          levelLabel: customLabel || costInfo.label,
        });
        return false;
      }
      return true;
    },
    [effectiveIsLoggedIn, isAdmin, currentPoints]
  );

  // Xác thực đăng nhập + kiểm tra điểm thực tế từ PostgreSQL TRƯỚC khi tạo bài thi & chuyển trang
  const verifyPointsAndStartExam = React.useCallback(
    async (targetUrl: string, rawLevel: string, customLabel?: string) => {
      if (isVerifyingStart) return;
      if (!checkAndGatePoints(rawLevel, customLabel, targetUrl)) {
        return;
      }

      // Khách làm thử đề đầu tiên (BASIC) hoặc Admin -> Vào thẳng phòng thi không cần kiểm tra ví điểm
      if (!effectiveIsLoggedIn || isAdmin) {
        onClose();
        router.push(targetUrl);
        return;
      }

      setIsVerifyingStart(true);
      try {
        const costInfo = getExamLevelCost(rawLevel);
        const latestBalance = await examPointsService.getBalance(user?.id);
        if (latestBalance && typeof latestBalance.currentPoints === 'number') {
          setCurrentPoints(latestBalance.currentPoints);
          notifyExamPointsUpdated(latestBalance.currentPoints);
          if (
            latestBalance.currentPoints <= 0 ||
            latestBalance.currentPoints < costInfo.costPoints
          ) {
            setOutOfPointsModal({
              isOpen: true,
              currentPoints: Math.max(0, latestBalance.currentPoints),
              requiredPoints: costInfo.costPoints,
              levelLabel: customLabel || costInfo.label,
            });
            return;
          }
        }
        onClose();
        router.push(targetUrl);
      } finally {
        setIsVerifyingStart(false);
      }
    },
    [isVerifyingStart, checkAndGatePoints, effectiveIsLoggedIn, isAdmin, user?.id, onClose, router]
  );

  // Competency Check State
  const [hasAssessedCompetency, setHasAssessedCompetency] = React.useState<boolean>(false);
  const [assessedLevelName, setAssessedLevelName] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const userId = user?.id || '';
    const subjectSlug = subject?.slug || '';

    const userLevel = (user as any)?.competency_level || user?.student_profile?.competency_level;
    const localUserLevel = userId ? localStorage.getItem(`schoolify_competency_${userId}`) : null;
    const localSubjectLevel = userId && subjectSlug ? localStorage.getItem(`schoolify_competency_${userId}_${subjectSlug}`) : null;

    const resolvedLevel = localSubjectLevel || localUserLevel || userLevel;

    if (resolvedLevel) {
      setHasAssessedCompetency(true);
      const mapLevelName: Record<string, string> = {
        BASIC: 'Cơ Bản',
        MEDIUM: 'Trung Bình',
        ADVANCED: 'Nâng Cao',
        PROVINCIAL_EXCELLENT: 'HSG Tỉnh',
        NATIONAL_EXCELLENT: 'HSG Quốc Gia',
      };
      setAssessedLevelName(mapLevelName[resolvedLevel] || resolvedLevel);
    } else {
      setHasAssessedCompetency(false);
      setAssessedLevelName('');
    }
  }, [user, subject, isOpen]);

  // Reset step on reopen
  React.useEffect(() => {
    if (isOpen) {
      const detectedGrade =
        parseHighSchoolGrade(user?.student_profile?.grade_level) ||
        getGuestOnboarding()?.grade ||
        12;
      if (initialMode === 'TOPIC' && subject) {
        onClose();
        router.push(buildTopicRoadmapHref(subject.slug, { grade: detectedGrade }));
        return;
      }
      if (initialMode === 'MOCK_EXAM') {
        setSelectedPracticeMode('MOCK_EXAM');
        setCurrentStep('MOCK_MILESTONE');
        setMaxStepReached(2);
        setIsAllChaptersMock(true);
      } else {
        setCurrentStep('MODE');
        setMaxStepReached(1);
        setSelectedPracticeMode('TOPIC');
        setIsAllChaptersMock(false);
      }
      setSelectedLevel(CORE_PRACTICE_LEVELS[0]);
      setSelectedMockMilestone(MOCK_MILESTONES[0]);
      setSelectedGrade(detectedGrade);
      setSelectedChapterId(1);
      setSelectedFormat('QUIZ');
      setQuizCount(10);
      setEssayCount(5);
      setSelectedDuration(45);
      setIsAssessmentMode(false);
      setSelectedDifficulty('ALL');
    }
  }, [isOpen, initialMode, onClose, router, subject, user?.student_profile?.grade_level]);

  if (!subject) return null;

  // Step calculations & Navigation based on Mode
  const activeWizardSteps = selectedPracticeMode === 'MOCK_EXAM' ? MOCK_WIZARD_STEPS : TOPIC_WIZARD_STEPS;
  const currentStepIndex = activeWizardSteps.findIndex((s) => s.step === currentStep) + 1;
  const canGoBack = currentStep === 'HSG_EXAMS' ? true : currentStepIndex > 1;
  const canGoForward = currentStep === 'HSG_EXAMS' ? false : currentStepIndex < maxStepReached;

  const handleGoBack = () => {
    if (currentStep === 'HSG_EXAMS') {
      setCurrentStep('LEVEL');
      return;
    }
    if (canGoBack && currentStepIndex > 1) {
      setCurrentStep(activeWizardSteps[currentStepIndex - 2].step);
    }
  };

  const handleGoForward = () => {
    if (canGoForward && currentStepIndex < activeWizardSteps.length) {
      setCurrentStep(activeWizardSteps[currentStepIndex].step);
    }
  };

  // Step 1: Handle Mode Click (Chuyên đề trang riêng vs Thi thử)
  const handleSelectMode = (mode: 'TOPIC' | 'MOCK_EXAM') => {
    if (mode === 'TOPIC') {
      onClose();
      router.push(buildTopicRoadmapHref(subject.slug, { grade: selectedGrade }));
      return;
    }

    if (!checkAndGatePoints('MEDIUM', 'Thi thử tổng hợp')) {
      return;
    }
    setIsAssessmentMode(false);
    setSelectedPracticeMode('MOCK_EXAM');
    setSelectedDuration(selectedMockMilestone.duration);
    setQuizCount(selectedMockMilestone.questionCount);
    setSelectedDifficulty('ALL');
    setIsAllChaptersMock(true);
    setMaxStepReached((prev) => Math.max(prev, 2));
    setCurrentStep('MOCK_MILESTONE');
  };

  // Step 2 (MOCK_EXAM): Handle Milestone Click
  const handleSelectMockMilestone = (milestone: MockMilestone) => {
    if (!checkAndGatePoints('MEDIUM', milestone.name)) {
      return;
    }
    setSelectedMockMilestone(milestone);
    setSelectedDuration(milestone.duration);
    setQuizCount(milestone.questionCount);

    if (milestone.requiresGrade12) {
      setSelectedGrade(12);
    }
    setMaxStepReached((prev) => Math.max(prev, 3));
    setCurrentStep('GRADE');
  };

  // Step 4 (MOCK_EXAM): Start Mock Exam
  const handleStartMockExam = () => {
    const examRoomUrl = `/student/practice/exam-room?subject=${subject.slug}&level=medium&grade=${selectedGrade}&chapter=1&format=quiz&duration=${selectedMockMilestone.duration}&quizCount=${selectedMockMilestone.questionCount}&count=${selectedMockMilestone.questionCount}&practiceMode=MOCK_EXAM&difficulty=ALL&milestone=${selectedMockMilestone.id.toLowerCase()}`;
    void verifyPointsAndStartExam(examRoomUrl, 'MEDIUM', selectedMockMilestone.name);
  };

  // Handle Assessment Click
  const handleSelectAssessment = () => {
    if (!checkAndGatePoints('BASIC', 'Kiểm Tra Năng Lực')) {
      return;
    }
    setIsAssessmentMode(true);
    setSelectedPracticeMode('MOCK_EXAM');
    setSelectedLevel({
      id: 'ASSESSMENT',
      name: 'Kiểm Tra Năng Lực',
      badge: '15 phút',
      tagline: 'Xác định trình độ hiện tại',
      description: 'Làm bài kiểm tra ngắn 15 phút để biết mức độ nắm kiến thức của bạn.',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      gradient: '',
      pointsReward: 30,
      totalExams: 1,
    });
    setMaxStepReached((prev) => Math.max(prev, 3));
    setCurrentStep('GRADE');
  };

  // Step 2: Handle Level Click
  const handleSelectLevel = (level: LevelDetail) => {
    if (!checkAndGatePoints(level.id, level.name)) {
      return;
    }

    setIsAssessmentMode(false);
    const diffMap: Record<string, 'ALL' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD'> = {
      BASIC: 'EASY',
      MEDIUM: 'MEDIUM',
      ADVANCED: 'HARD',
    };
    const nextDiff = selectedPracticeMode === 'MOCK_EXAM' ? 'ALL' : (diffMap[level.id] || 'ALL');
    setSelectedDifficulty(nextDiff);

    if (level.id === 'PROVINCIAL_EXCELLENT' || level.id === 'NATIONAL_EXCELLENT') {
      setSelectedLevel(level);
      setCurrentStep('HSG_EXAMS');
      return;
    }

    setSelectedLevel(level);
    setMaxStepReached((prev) => Math.max(prev, 3));
    setCurrentStep('GRADE');
  };

  // Step 3: Handle Grade Click
  const handleSelectGrade = (gradeId: number) => {
    if (selectedPracticeMode === 'MOCK_EXAM' && selectedMockMilestone.requiresGrade12 && gradeId !== 12) {
      return;
    }
    setSelectedGrade(gradeId);
    if (isAssessmentMode) {
      const targetUrl = `/student/practice/exam-room?subject=${subject.slug}&level=assessment&grade=${gradeId}&chapter=1&format=quiz&duration=50&quizCount=30&count=30&practiceMode=MOCK_EXAM&difficulty=ALL`;
      void verifyPointsAndStartExam(targetUrl, 'BASIC', 'Kiểm Tra Năng Lực');
      return;
    }
    if (selectedPracticeMode === 'MOCK_EXAM') {
      setMaxStepReached((prev) => Math.max(prev, 4));
      setCurrentStep('MOCK_READY');
      return;
    }
    setMaxStepReached((prev) => Math.max(prev, 4));
    setCurrentStep('CHAPTER');
  };

  // Step 4: Handle Chapter Click
  const handleSelectChapter = (chapterId: number, allChapters = false) => {
    setSelectedChapterId(chapterId);
    setIsAllChaptersMock(allChapters);
    setMaxStepReached((prev) => Math.max(prev, 5));
    setCurrentStep('FORMAT');
  };

  // Step 5: Handle Format Selection
  const handleSelectFormat = (format: ExamFormat) => {
    setSelectedFormat(format);
    if (format === 'QUIZ') {
      setQuizCount((prev) => Math.max(5, Math.min(40, prev)));
    } else if (format === 'ESSAY') {
      setEssayCount((prev) => Math.max(5, Math.min(10, prev)));
    } else if (format === 'MIXED') {
      setQuizCount((prev) => Math.max(5, Math.min(30, prev)));
      setEssayCount((prev) => Math.max(1, Math.min(10, prev)));
    }
  };

  // Step 6: Start Exam
  const handleStartExam = () => {
    const countParam =
      selectedFormat === 'QUIZ'
        ? quizCount
        : selectedFormat === 'ESSAY'
        ? essayCount
        : quizCount + essayCount;

    const examRoomUrl = `/student/practice/exam-room?subject=${subject.slug}&level=${selectedLevel.id.toLowerCase()}&grade=${selectedGrade}&chapter=${selectedChapterId}&format=${selectedFormat.toLowerCase()}&duration=${selectedDuration}&quizCount=${quizCount}&essayCount=${essayCount}&count=${countParam}&practiceMode=${selectedPracticeMode}&difficulty=${selectedDifficulty}`;

    void verifyPointsAndStartExam(examRoomUrl, selectedLevel.id, selectedLevel.name);
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        fullscreen={true}
        className={cn(
          'w-full h-full p-4 sm:p-6',
          currentStep === 'CHAPTER_PATH' ? 'md:px-8 md:py-4' : 'md:px-12 md:py-6',
        )}
        title={
          <div
            className={cn(
              'mx-auto w-full flex flex-wrap items-center justify-between gap-3',
              currentStep === 'CHAPTER_PATH'
                ? 'max-w-7xl'
                : 'max-w-4xl lg:max-w-5xl',
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base border shrink-0',
                  currentStep === 'CHAPTER_PATH'
                    ? 'bg-[#00B8DD]/10 text-[#00B8DD] border-[#00B8DD]/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700',
                )}
              >
                <BookOpen
                  className={cn(
                    'w-5 h-5',
                    currentStep === 'CHAPTER_PATH'
                      ? 'text-[#00B8DD]'
                      : 'text-slate-700 dark:text-slate-300',
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Môn {subject.name}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentStep === 'MODE'
                      ? 'Khảo thí & Luyện tập'
                      : selectedPracticeMode === 'MOCK_EXAM'
                        ? 'Thi thử tổng hợp'
                        : 'Luyện theo chuyên đề'}
                  </span>
                </div>
                <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-snug break-words sm:truncate">
                  {currentStep === 'MODE' && 'Hôm nay bạn muốn học như thế nào?'}
                  {currentStep === 'CHAPTER_PATH' &&
                    'Không gian lộ trình chuyên đề GDPT 2018'}
                  {currentStep === 'MOCK_MILESTONE' &&
                    'Bước 2/4: Chọn mốc thi thử định kỳ'}
                  {currentStep === 'LEVEL' && 'Bước 2/6: Chọn cấp độ học tập'}
                  {currentStep === 'GRADE' &&
                    (isAssessmentMode
                      ? 'Bước 2/2: Chọn khối lớp'
                      : selectedPracticeMode === 'MOCK_EXAM'
                        ? 'Bước 3/4: Chọn khối lớp bạn đang học'
                        : 'Bước 3/6: Chọn khối lớp bạn đang học')}
                  {currentStep === 'CHAPTER' &&
                    'Bước 4/6: Chọn chương / chuyên đề cần ôn'}
                  {currentStep === 'FORMAT' && 'Bước 5/6: Chọn hình thức làm bài'}
                  {currentStep === 'DURATION' && 'Bước 6/6: Chọn thời gian làm bài'}
                  {currentStep === 'MOCK_READY' &&
                    'Bước 4/4: Xác nhận & Bắt đầu làm đề'}
                  {currentStep === 'HSG_EXAMS' &&
                    `Đề thi học sinh giỏi ${selectedLevel.id === 'PROVINCIAL_EXCELLENT' ? 'cấp Tỉnh' : 'cấp Quốc Gia'} - Môn ${subject.name}`}
                </div>
              </div>
            </div>

            {currentStep === 'CHAPTER_PATH' && (
              <button
                type="button"
                onClick={() => setCurrentStep('MODE')}
                className="hidden sm:inline-flex min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Đổi chế độ</span>
              </button>
            )}
          </div>
        }
        description={
          currentStep === 'MODE' || currentStep === 'CHAPTER_PATH' ? null : (
            <div className="max-w-4xl lg:max-w-5xl mx-auto w-full space-y-2 mt-2">
              {currentStep === 'HSG_EXAMS' ? (
                <div className="flex flex-wrap items-center justify-between gap-2 py-1 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('LEVEL')}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Quay lại chọn cấp độ
                    </button>
                    <span className="text-slate-400 select-none">➔</span>
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 text-xs px-2.5 py-0.5 font-semibold">
                      {selectedLevel.name}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Đề thi chọn lọc • Có barem điểm và hướng dẫn giải
                  </span>
                </div>
              ) : (
                /* 4 Pillars Style Hero Circular Stepper with Connecting Wire & Plane Replacing Circle */
                <div className="w-full max-w-4xl mx-auto pt-2 pb-2">
                  <div className="relative flex items-start justify-between w-full">
                    {/* Background connecting wire */}
                    <div className="absolute top-[20px] sm:top-[24px] left-[24px] right-[24px] sm:left-[32px] sm:right-[32px] h-[3px] bg-slate-200 dark:bg-slate-800 z-[1] rounded-full" />

                    {/* Illuminated wake wire with cyan glow */}
                    <div
                      className="absolute top-[20px] sm:top-[24px] left-[24px] sm:left-[32px] h-[3px] bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_14px_rgba(0,212,255,0.85)] transition-all duration-500 ease-out z-[2] rounded-full"
                      style={{
                        width: `calc((100% - 64px) * ${
                          activeWizardSteps.length > 1
                            ? ((currentStepIndex - 1) / (activeWizardSteps.length - 1)) * 100
                            : 0
                        } / 100)`,
                      }}
                    />

                    {/* Circular Step Nodes with Active Paper Plane directly replacing the circle */}
                    {activeWizardSteps.map((s) => {
                      const isCurrent = s.number === currentStepIndex;
                      const isUnlocked = s.number <= maxStepReached;
                      const isPast = s.number < currentStepIndex;

                      return (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => isUnlocked && setCurrentStep(s.step)}
                          disabled={!isUnlocked}
                          className="relative z-[3] flex flex-col items-center group cursor-pointer select-none focus-visible:outline-hidden min-w-[54px] sm:min-w-[72px]"
                        >
                          {/* Slot: on active step, the paper plane directly replacing the circle */}
                          <div className="relative w-12 sm:w-16 h-10 sm:h-12 flex items-center justify-center">
                            {isCurrent ? (
                              <motion.div
                                layoutId="activeOrigamiHeroGlider"
                                className="relative flex items-center justify-center z-10"
                                animate={{
                                  y: [0, -3, 0],
                                  rotate: [0, -1.5, 0],
                                }}
                                transition={{
                                  layout: { type: 'spring', stiffness: 300, damping: 26 },
                                  y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
                                  rotate: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' },
                                }}
                              >
                                {/* Radar Pulse Halo behind the glider like 4 Tru Cot */}
                                <span className="absolute -inset-2 sm:-inset-3 rounded-full border-2 border-cyan-400 dark:border-cyan-300 animate-ping pointer-events-none opacity-60" />
                                <OrigamiGlider className="w-[68px] sm:w-[84px] h-[30px] sm:h-[38px] drop-shadow-[0_6px_16px_rgba(0,184,221,0.65)]" />
                              </motion.div>
                            ) : isPast ? (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold text-xs sm:text-sm flex items-center justify-center border-2 border-cyan-500 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 shadow-xs transition-colors">
                                ✓
                              </div>
                            ) : isUnlocked ? (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-xs sm:text-sm flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 hover:border-slate-400 transition-colors">
                                {s.number < 10 ? `0${s.number}` : s.number}
                              </div>
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 font-semibold text-xs sm:text-sm flex items-center justify-center border-2 border-slate-200 dark:border-slate-800 opacity-60">
                                {s.number < 10 ? `0${s.number}` : s.number}
                              </div>
                            )}
                          </div>

                          {/* Label below node */}
                          <span
                            className={cn(
                              'mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-center transition-colors leading-tight max-w-[60px] sm:max-w-none truncate sm:overflow-visible',
                              isCurrent
                                ? 'text-cyan-600 dark:text-cyan-400 font-extrabold sm:text-sm'
                                : isPast
                                  ? 'text-slate-700 dark:text-slate-300 font-semibold'
                                  : 'text-slate-400 dark:text-slate-500',
                            )}
                          >
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        }
      >
        <div
          className={cn(
            'w-full mx-auto flex-1 flex flex-col justify-start',
            currentStep === 'CHAPTER_PATH'
              ? 'max-w-7xl py-1 sm:py-2'
              : 'max-w-4xl lg:max-w-5xl py-2 sm:py-6',
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* ========================================================================= */}
              {/* STEP 1: CHỌN CHẾ ĐỘ LUYỆN TẬP (CHUYÊN ĐỀ HOẶC THI THỬ)                    */}
              {/* ========================================================================= */}
              {currentStep === 'MODE' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span>Chọn phương pháp ôn luyện phù hợp cho môn <strong className="text-slate-900 dark:text-white font-bold">{subject.name}</strong> hôm nay:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Chế độ 1: Luyện theo chuyên đề */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      role="button"
                      tabIndex={0}
                      data-testid="modal-mode-topic"
                      onClick={() => handleSelectMode('TOPIC')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectMode('TOPIC');
                        }
                      }}
                       className={cn(
                        'min-h-[132px] sm:min-h-[148px] p-5 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 group relative isolate focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500',
                        'bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100 dark:from-cyan-950 dark:via-slate-900 dark:to-indigo-950/70',
                        activeModeTooltip === 'TOPIC' && 'z-30',
                        selectedPracticeMode === 'TOPIC'
                          ? 'border-cyan-400 shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/60'
                          : 'border-cyan-200/80 dark:border-cyan-900/60 shadow-md shadow-cyan-500/10 hover:border-cyan-400 dark:hover:border-cyan-500/70 hover:shadow-xl hover:shadow-cyan-500/25'
                      )}
                    >
                      {/* Lớp trang trí nền (cắt gọn trong khung, không che popup giải thích) */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl overflow-hidden"
                      >
                        <div className="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-cyan-400/45 dark:bg-cyan-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-indigo-400/35 dark:bg-indigo-500/15 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="absolute top-1/2 left-1/3 w-32 h-32 -translate-y-1/2 rounded-full bg-sky-300/40 dark:bg-sky-400/10 blur-2xl" />
                        <div
                          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at 1px 1px, rgba(8,145,178,0.45) 1px, transparent 0)',
                            backgroundSize: '18px 18px',
                            maskImage: 'linear-gradient(115deg, transparent 15%, black 75%)',
                            WebkitMaskImage: 'linear-gradient(115deg, transparent 15%, black 75%)',
                          }}
                        />
                        <BookOpen className="absolute -right-4 -bottom-6 w-36 h-36 sm:w-44 sm:h-44 text-cyan-500/20 dark:text-cyan-400/10 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700" />
                        <div className="absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[420%] transition-all duration-1000 ease-out" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                      </div>

                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/40 ring-4 ring-white/70 dark:ring-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          Luyện theo chuyên đề
                        </h3>
                      </div>

                      {/* Nút dấu ? có vòng tròn bọc ngoài (Hover hoặc Click hiện giải thích) */}
                      <div
                        className="relative shrink-0"
                        onMouseEnter={() => setActiveModeTooltip('TOPIC')}
                        onMouseLeave={() =>
                          setActiveModeTooltip((prev) => (prev === 'TOPIC' ? null : prev))
                        }
                      >
                        <button
                          type="button"
                          aria-label="Giải thích chế độ Luyện theo chuyên đề"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModeTooltip((prev) => (prev === 'TOPIC' ? null : 'TOPIC'));
                          }}
                          className={cn(
                            'w-6 h-6 rounded-full border flex items-center justify-center text-xs font-extrabold transition-all cursor-pointer',
                            activeModeTooltip === 'TOPIC'
                              ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm scale-105'
                              : 'bg-white/90 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/60'
                          )}
                        >
                          ?
                        </button>

                        <AnimatePresence>
                          {activeModeTooltip === 'TOPIC' && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800 shadow-xl shadow-slate-900/15 z-50 text-left space-y-2.5 cursor-default"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-cyan-700 dark:text-cyan-300">
                                  Luyện theo chuyên đề
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                  Học hằng ngày
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                Ôn sâu từng bài học SGK, vững nền tảng kiến thức.
                              </p>
                              <div className="p-2 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/50 border border-cyan-500/20 text-[11px] font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                <span>Có Gia Sư AI kèm 1:1 hướng dẫn từng bước tư duy</span>
                              </div>
                              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-cyan-600 font-bold">✓</span>
                                  <span><strong>Bám sát SGK 2018:</strong> Chọn đúng bài đang học trên lớp</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-cyan-600 font-bold">✓</span>
                                  <span><strong>Tự do thời gian:</strong> Thảnh thơi suy nghĩ, không áp lực</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-cyan-600 font-bold">✓</span>
                                  <span><strong>Đủ cấp độ:</strong> Lấy lại gốc SGK đến rèn tư duy 9–10</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Chế độ 2: Thi thử tổng hợp */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      role="button"
                      tabIndex={0}
                      data-testid="modal-mode-mock"
                      onClick={() => handleSelectMode('MOCK_EXAM')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectMode('MOCK_EXAM');
                        }
                      }}
                      className={cn(
                        'min-h-[132px] sm:min-h-[148px] p-5 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 group relative isolate focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500',
                        'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 dark:from-amber-950 dark:via-slate-900 dark:to-orange-950/70',
                        activeModeTooltip === 'MOCK_EXAM' && 'z-30',
                        selectedPracticeMode === 'MOCK_EXAM'
                          ? 'border-amber-400 shadow-xl shadow-amber-500/25 ring-2 ring-amber-400/60'
                          : 'border-amber-200/80 dark:border-amber-900/60 shadow-md shadow-amber-500/10 hover:border-amber-400 dark:hover:border-amber-500/70 hover:shadow-xl hover:shadow-amber-500/25'
                      )}
                    >
                      {/* Lớp trang trí nền (cắt gọn trong khung, không che popup giải thích) */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl overflow-hidden"
                      >
                        <div className="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-amber-400/45 dark:bg-amber-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-rose-400/35 dark:bg-rose-500/15 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="absolute top-1/2 left-1/3 w-32 h-32 -translate-y-1/2 rounded-full bg-yellow-300/40 dark:bg-yellow-400/10 blur-2xl" />
                        <div
                          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at 1px 1px, rgba(217,119,6,0.45) 1px, transparent 0)',
                            backgroundSize: '18px 18px',
                            maskImage: 'linear-gradient(115deg, transparent 15%, black 75%)',
                            WebkitMaskImage: 'linear-gradient(115deg, transparent 15%, black 75%)',
                          }}
                        />
                        <Trophy className="absolute -right-4 -bottom-6 w-36 h-36 sm:w-44 sm:h-44 text-amber-500/20 dark:text-amber-400/10 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700" />
                        <div className="absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[420%] transition-all duration-1000 ease-out" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                      </div>

                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40 ring-4 ring-white/70 dark:ring-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                          Thi thử tổng hợp
                        </h3>
                      </div>

                      {/* Nút dấu ? có vòng tròn bọc ngoài (Hover hoặc Click hiện giải thích) */}
                      <div
                        className="relative shrink-0"
                        onMouseEnter={() => setActiveModeTooltip('MOCK_EXAM')}
                        onMouseLeave={() =>
                          setActiveModeTooltip((prev) => (prev === 'MOCK_EXAM' ? null : prev))
                        }
                      >
                        <button
                          type="button"
                          aria-label="Giải thích chế độ Thi thử tổng hợp"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModeTooltip((prev) =>
                              prev === 'MOCK_EXAM' ? null : 'MOCK_EXAM'
                            );
                          }}
                          className={cn(
                            'w-6 h-6 rounded-full border flex items-center justify-center text-xs font-extrabold transition-all cursor-pointer',
                            activeModeTooltip === 'MOCK_EXAM'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm scale-105'
                              : 'bg-white/90 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                          )}
                        >
                          ?
                        </button>

                        <AnimatePresence>
                          {activeModeTooltip === 'MOCK_EXAM' && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-xl shadow-slate-900/15 z-50 text-left space-y-2.5 cursor-default"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                                  Thi thử tổng hợp
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Chuẩn Bộ GD&amp;ĐT
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                Kiểm tra định kỳ &amp; thi thử toàn diện theo cấu trúc chuẩn.
                              </p>
                              <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 border border-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>Bấm giờ phòng thi • Tự động chấm &amp; chữa chi tiết</span>
                              </div>
                              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold">✓</span>
                                  <span><strong>Đủ các mốc thi:</strong> 15p, 45p, Giữa kỳ, Cuối kỳ &amp; Tốt nghiệp</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold">✓</span>
                                  <span><strong>Chấm điểm tức thì:</strong> Nhận điểm số và phân tích lỗ hổng ngay</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold">✓</span>
                                  <span><strong>Rèn tâm lý phòng thi:</strong> Đồng hồ đếm ngược rèn phản xạ tốc độ</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>

                  {/* Smart Advisory Callout: Kiểm tra năng lực nhanh (15 phút) */}
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={handleSelectAssessment}
                    className="p-3.5 sm:p-4 rounded-2xl border border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Chưa rõ con nên bắt đầu từ đâu? Làm bài chẩn đoán nhanh 15 phút
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
                            10 câu xếp lớp
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          AI tự động xác định trình độ hiện tại và đề xuất bài học bám sát năng lực học sinh.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all flex items-center gap-1.5 shadow-2xs">
                        Kiểm tra ngay <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}


          {/* ========================================================================= */}
          {/* STEP 2 (MOCK_EXAM): CHỌN MỐC THI THỬ                                      */}
          {/* ========================================================================= */}
          {currentStep === 'MOCK_MILESTONE' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Chọn mốc kiểm tra định kỳ hoặc kỳ thi thử chuẩn GDPT 2018:</span>
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">5 mốc luyện thi</span>
              </div>

              {MOCK_MILESTONES.map((m) => {
                const isSelected = selectedMockMilestone.id === m.id;
                const isThpt = m.requiresGrade12;

                const icon =
                  m.id === '15P' ? (
                    <Clock className="w-5 h-5" />
                  ) : m.id === '45P' ? (
                    <FileText className="w-5 h-5" />
                  ) : m.id === 'MIDTERM' ? (
                    <Target className="w-5 h-5" />
                  ) : m.id === 'FINAL' ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    <Crown className="w-5 h-5" />
                  );

                const iconStyles =
                  m.id === '15P'
                    ? { frame: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200/80 dark:border-cyan-800/60', hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400' }
                    : m.id === '45P'
                    ? { frame: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/60', hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400' }
                    : m.id === 'MIDTERM'
                    ? { frame: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800/60', hoverText: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' }
                    : m.id === 'FINAL'
                    ? { frame: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60', hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400' }
                    : { frame: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60', hoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400' };

                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    data-testid={`mock-milestone-${m.id.toLowerCase()}`}
                    onClick={() => handleSelectMockMilestone(m)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectMockMilestone(m);
                      }
                    }}
                    className={cn(
                      'p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500',
                      isSelected
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-500/80 dark:border-amber-500/70 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-xs hover:translate-x-0.5'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform', iconStyles.frame)}>
                        {icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className={cn('text-sm sm:text-base font-bold text-slate-900 dark:text-white transition-colors', iconStyles.hoverText)}>
                            {m.name}
                          </h4>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {m.badge}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-1 sm:line-clamp-2">
                          {m.description}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{m.matrixDesc}</span>
                          {isThpt && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-rose-600 dark:text-rose-400">
                                Dành riêng cho Lớp 12
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CHỌN CẤP ĐỘ                                                       */}
          {/* ========================================================================= */}
          {currentStep === 'LEVEL' && (
            <div className="space-y-2.5">
              {/* 0. Trạng thái năng lực đã xác định (nếu đã login và đã có kết quả đánh giá) */}
              {effectiveIsLoggedIn && hasAssessedCompetency && (
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Năng lực môn này đã xác định: <strong className="font-bold">{assessedLevelName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAssessment}
                    className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Kiểm tra lại
                  </button>
                </div>
              )}

              {/* 1 -> 3: Danh Sách Cấp Độ Mục Tiêu (Cơ Bản -> Nâng Cao) */}
              {CORE_PRACTICE_LEVELS.map((level) => {
                const icon = LEVEL_ICONS[level.id];

                const levelStyles =
                  level.id === 'BASIC'
                    ? { frame: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60', hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' }
                    : level.id === 'MEDIUM'
                    ? { frame: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800/60', hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800' }
                    : { frame: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/60', hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400', badge: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };

                return (
                  <div
                    key={level.id}
                    role="button"
                    tabIndex={0}
                    data-testid={`practice-level-${level.id.toLowerCase()}`}
                    onClick={() => handleSelectLevel(level)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectLevel(level);
                      }
                    }}
                    className="p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-xs hover:translate-x-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform', levelStyles.frame)}>
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className={cn('text-sm sm:text-base font-bold text-slate-900 dark:text-white transition-colors', levelStyles.hoverText)}>
                            {level.name}
                          </h4>
                          <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border', levelStyles.badge)}>
                            {level.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-1 sm:line-clamp-2">
                          {level.id === 'BASIC'
                            ? 'Nắm chắc định nghĩa, công thức SGK và các câu hỏi nhận biết cốt lõi để lấy lại gốc.'
                            : level.id === 'MEDIUM'
                            ? 'Rèn luyện thành thạo phương pháp giải các dạng bài thông dụng và nâng cao tốc độ phản xạ.'
                            : 'Chinh phục điểm 9–10 với các bài toán vận dụng cao và dạng bài phân hóa sâu.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP HSG: KHO ĐỀ THI HỌC SINH GIỎI CẤP TỈNH & QUỐC GIA                    */}
          {/* ========================================================================= */}
          {currentStep === 'HSG_EXAMS' && (
            <div className="space-y-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Đề thi chọn lọc: {selectedLevel.name}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {subject.slug === 'tin-hoc'
                        ? 'Đề thi lập trình giải trực tiếp trên trình soạn thảo code (C++, Python), chấm tự động theo bộ testcase.'
                        : 'Đề thi tự luận nâng cao có barem điểm rõ ràng và hướng dẫn giải chi tiết cho từng ý.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách các đề thi HSG đã tuyển chọn */}
              <div className="space-y-3">
                {hsgExams.length > 0 ? (
                  hsgExams.map((hExam) => (
                    <div
                      key={hExam.id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition-all space-y-3 group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {hExam.levelLabel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {hExam.province || 'Toàn Quốc'} • {hExam.year}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {hExam.examType === 'CODING' ? '💻 Lập trình chấm testcase' : '✍️ Tự luận có barem'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          Thang 20 điểm
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {hExam.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {hExam.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {hExam.durationMinutes} phút
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            +{hExam.pointsReward} <NgocIcon className="inline-block w-[1.1em] h-[1.1em] align-[-0.18em]" flat />
                          </span>
                          <span>•</span>
                          <span>
                            {hExam.examType === 'CODING'
                              ? `${hExam.codingProblems?.length || 3} bài thuật toán`
                              : `${hExam.mathProblems?.length || 4} bài tự luận`}
                          </span>
                        </div>

                        <Button
                          onClick={() => {
                            const targetUrl = `/student/practice/exam-room?olympiadId=${hExam.id}&subject=${subject.slug}&level=${selectedLevel.id.toLowerCase()}`;
                            void verifyPointsAndStartExam(targetUrl, selectedLevel.id, hExam.title);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold rounded-xl text-xs px-4"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Vào làm đề
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">
                      Hiện tại môn {subject.name} đang hoàn tất biên soạn kho đề thi {selectedLevel.name}. Bạn có thể trải nghiệm các đề HSG mẫu đang mở:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const targetUrl = '/student/practice/exam-room?olympiadId=olympiad-toan-hn-2025&subject=toan-hoc&level=provincial_excellent';
                          void verifyPointsAndStartExam(targetUrl, 'PROVINCIAL_EXCELLENT', 'Đề HSG Toán Hà Nội');
                        }}
                        className="text-xs rounded-xl"
                      >
                        Đề HSG Toán Hà Nội (Tự Luận)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const targetUrl = '/student/practice/exam-room?olympiadId=olympiad-tin-tinh-2025&subject=tin-hoc&level=provincial_excellent';
                          void verifyPointsAndStartExam(targetUrl, 'PROVINCIAL_EXCELLENT', 'Đề HSG Tin Học Nghệ An');
                        }}
                        className="text-xs rounded-xl"
                      >
                        Đề HSG Tin Học Nghệ An (Coding IDE)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CHỌN KHỐI LỚP (1 - 12)                                            */}
          {/* ========================================================================= */}
          {currentStep === 'GRADE' && (
            <div className="space-y-4">
              {isAssessmentMode && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Kiểm tra năng lực môn {subject.name}:</span> Chọn khối lớp bạn đang học để làm bài kiểm tra 15 phút (10 câu hỏi bao quát).
                  </div>
                </div>
              )}

              {selectedPracticeMode === 'MOCK_EXAM' && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Mốc thi thử: {selectedMockMilestone.name}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {selectedMockMilestone.requiresGrade12
                          ? 'Kỳ thi Tốt nghiệp THPT chỉ dành riêng cho khối Lớp 12. Chọn Lớp 12 để tạo đề.'
                          : 'Chọn khối lớp bạn đang học để hệ thống bốc đề chuẩn theo phân phối chương trình.'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] shrink-0 font-semibold hidden sm:inline-flex">
                    {selectedMockMilestone.badge}
                  </Badge>
                </div>
              )}

              {/* Group THPT (10, 11, 12) */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Trung học phổ thông (THPT)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 11, 12].map((g) => {
                    const isSelected = selectedGrade === g;
                    const isThptLocked = selectedPracticeMode === 'MOCK_EXAM' && selectedMockMilestone.requiresGrade12 && g !== 12;

                    return (
                      <div
                        key={g}
                        onClick={() => !isThptLocked && handleSelectGrade(g)}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all relative group flex flex-col items-center justify-center gap-1',
                          isThptLocked
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                            : isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-slate-900 shadow-2xs cursor-pointer'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer'
                        )}
                      >
                        <span className="text-sm font-semibold transition-colors">
                          Lớp {g}
                        </span>
                        {isThptLocked && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Chỉ dành cho Lớp 12
                          </span>
                        )}
                        {!isThptLocked && selectedMockMilestone.requiresGrade12 && g === 12 && (
                          <span className="text-[10px] text-amber-500 dark:text-amber-300 font-semibold">
                            Chuẩn Bộ GD&ĐT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group THCS (6, 7, 8, 9) */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Trung học cơ sở (THCS)
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                  {[6, 7, 8, 9].map((g) => {
                    const isSelected = selectedGrade === g;
                    const isThptLocked = selectedPracticeMode === 'MOCK_EXAM' && selectedMockMilestone.requiresGrade12;

                    return (
                      <div
                        key={g}
                        onClick={() => !isThptLocked && handleSelectGrade(g)}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all flex items-center justify-center',
                          isThptLocked
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                            : isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-slate-900 shadow-2xs cursor-pointer'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer'
                        )}
                      >
                        <span className="text-sm font-semibold transition-colors">
                          Lớp {g}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group Tiểu Học (1 - 5) */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Tiểu học
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((g) => {
                    const isSelected = selectedGrade === g;
                    const isThptLocked = selectedPracticeMode === 'MOCK_EXAM' && selectedMockMilestone.requiresGrade12;

                    return (
                      <div
                        key={g}
                        onClick={() => !isThptLocked && handleSelectGrade(g)}
                        className={cn(
                          'p-2.5 rounded-xl border text-center transition-all flex items-center justify-center',
                          isThptLocked
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                            : isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-slate-900 shadow-2xs cursor-pointer'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer'
                        )}
                      >
                        <span className="text-xs font-semibold transition-colors">
                          Lớp {g}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mock Exam Mode Bottom CTA */}
              {selectedPracticeMode === 'MOCK_EXAM' && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-500">
                    Đang chọn: <strong className="text-slate-900 dark:text-white font-semibold">Lớp {selectedGrade}</strong> • {selectedMockMilestone.name} ({selectedMockMilestone.badge})
                  </div>
                  <Button
                    data-testid="btn-continue-to-mock-ready"
                    onClick={() => {
                      if (!checkAndGatePoints('MEDIUM', selectedMockMilestone.name)) {
                        return;
                      }
                      setMaxStepReached((prev) => Math.max(prev, 4));
                      setCurrentStep('MOCK_READY');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold gap-1.5 rounded-xl text-xs sm:text-sm px-5"
                  >
                    Tiếp tục tạo đề
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Assessment Mode Quick CTA */}
              {isAssessmentMode && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-500">
                    Đang chọn: <strong className="text-slate-900 dark:text-white font-semibold">Lớp {selectedGrade}</strong> (10 câu trắc nghiệm • 15 phút)
                  </div>
                  <Button
                    onClick={() => {
                      const targetUrl = `/student/practice/exam-room?subject=${subject.slug}&level=assessment&grade=${selectedGrade}&chapter=1&format=quiz&duration=15&count=10&mode=diagnostic`;
                      void verifyPointsAndStartExam(targetUrl, 'BASIC', 'Kiểm Tra Năng Lực');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold gap-1.5 rounded-xl text-xs sm:text-sm"
                  >
                    Bắt đầu làm bài
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CHỌN CHƯƠNG HỌC / PHẠM VI ĐỀ THI (SGK MỚI GDPT 2018)              */}
          {/* ========================================================================= */}
          {currentStep === 'CHAPTER' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {selectedPracticeMode === 'MOCK_EXAM' ? (
                  <>
                    Chọn phạm vi kiến thức cho đề <strong>Thi thử</strong> môn{' '}
                    <strong className="text-slate-900 dark:text-white">{subject.name}</strong> Lớp {selectedGrade}:
                  </>
                ) : (
                  <>
                    Danh sách các chương/chuyên đề chuẩn SGK môn{' '}
                    <strong className="text-slate-900 dark:text-white">{subject.name}</strong> Lớp {selectedGrade}. Chọn chương để luyện tập:
                  </>
                )}
              </p>

              <div className="space-y-2.5 pr-1">
                {/* Nếu ở chế độ Thi thử: Hiển thị lựa chọn Tổng hợp toàn bộ các chương lên đầu */}
                {selectedPracticeMode === 'MOCK_EXAM' && (
                  <div
                    onClick={() => handleSelectChapter(1, true)}
                    className={cn(
                      'p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer group',
                      isAllChaptersMock
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-slate-900 shadow-2xs'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800 hover:border-amber-400'
                    )}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Layers className="w-4 h-4 shrink-0 text-amber-500" />
                        <h4 className="text-sm font-bold transition-colors">
                          Đề tổng hợp toàn bộ chương trình Lớp {selectedGrade}
                        </h4>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                            isAllChaptersMock
                              ? 'bg-white/15 text-white dark:bg-slate-900/15 dark:text-slate-900 border-white/20'
                              : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                          )}
                        >
                          Khuyên dùng cho Thi thử
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-xs leading-relaxed',
                          isAllChaptersMock ? 'text-slate-200 dark:text-slate-700' : 'text-slate-600 dark:text-slate-400'
                        )}
                      >
                        Bao quát toàn diện các chương trọng tâm theo tỷ lệ 40% Nhận biết • 30% Thông hiểu • 20% Vận dụng • 10% Vận dụng cao.
                      </p>
                    </div>

                    <div className="flex items-center shrink-0">
                      <ArrowRight
                        className={cn(
                          'w-4 h-4 transition-all',
                          isAllChaptersMock ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                        )}
                      />
                    </div>
                  </div>
                )}

                {chapters.map((ch) => {
                  const isSelected = !isAllChaptersMock && selectedChapterId === ch.id;

                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch.id, false)}
                      className={cn(
                        'p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer group',
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-slate-900 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      )}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h4 className="text-sm font-semibold transition-colors">
                          {ch.name}
                        </h4>
                        <p className={cn(
                          'text-xs leading-relaxed line-clamp-1 sm:line-clamp-2',
                          isSelected ? 'text-slate-200 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'
                        )}>
                          {ch.description}
                        </p>
                      </div>

                      <div className="flex items-center shrink-0">
                        <ArrowRight className={cn(
                          'w-4 h-4 transition-all',
                          isSelected ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: CHỌN HÌNH THỨC ĐỀ THI                                             */}
          {/* ========================================================================= */}
          {currentStep === 'FORMAT' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Chọn hình thức làm bài phù hợp với nhu cầu ôn luyện:
              </p>

              {/* 3 Formats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Trắc Nghiệm */}
                <div
                  onClick={() => handleSelectFormat('QUIZ')}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group',
                    selectedFormat === 'QUIZ'
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {quizCount} câu
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Trắc nghiệm
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Lựa chọn đáp án đúng, câu hỏi đúng/sai và trả lời ngắn.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {quizCount} câu hỏi • Chấm ngay
                  </div>
                </div>

                {/* 2. Tự Luận */}
                <div
                  onClick={() => handleSelectFormat('ESSAY')}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group',
                    selectedFormat === 'ESSAY'
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {essayCount} câu
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tự luận
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Trình bày bài giải từng bước và đối chiếu với barem điểm chi tiết.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {essayCount} câu tự luận • Có barem
                  </div>
                </div>

                {/* 3. Trộn Kết Hợp */}
                <div
                  onClick={() => handleSelectFormat('MIXED')}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group',
                    selectedFormat === 'MIXED'
                      ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {quizCount + essayCount} câu
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Kết hợp (Trắc nghiệm + Tự luận)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Luyện cả câu trắc nghiệm tốc độ và các bài tự luận phân hóa.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {quizCount} TN + {essayCount} TL
                  </div>
                </div>
              </div>

              {/* Option A: Input tùy chọn số lượng câu hỏi trắc nghiệm (min 5, max 40) & Tag Mức độ */}
              {selectedFormat === 'QUIZ' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        Số lượng câu hỏi trắc nghiệm:
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tùy chỉnh số lượng câu hỏi trong đề (từ 5 đến 40 câu).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min={5}
                        max={40}
                        value={quizCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val)) {
                            setQuizCount(10);
                          } else {
                            setQuizCount(Math.min(40, Math.max(5, val)));
                          }
                        }}
                        className="w-20 px-3 py-1.5 text-center rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">câu</span>
                    </div>
                  </div>

                  {/* Quick-pick Chips */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Chọn nhanh:</span>
                    {[5, 10, 15, 20, 25, 30].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuizCount(num)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                          quizCount === num
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        )}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>

                  {/* Cognitive Difficulty Tag Filter (khi luyện chuyên đề) */}
                  {selectedPracticeMode === 'TOPIC' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-medium">Mức độ câu hỏi:</span>
                      {[
                        { id: 'ALL', label: 'Tất cả mức độ' },
                        { id: 'EASY', label: 'Nhận biết' },
                        { id: 'MEDIUM', label: 'Thông hiểu' },
                        { id: 'HARD', label: 'Vận dụng' },
                        { id: 'VERY_HARD', label: 'Vận dụng cao' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDifficulty(d.id as any)}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                            selectedDifficulty === d.id
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Option B: Input tùy chọn số lượng câu hỏi tự luận (min 5, max 10) */}
              {selectedFormat === 'ESSAY' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        Số lượng câu hỏi tự luận:
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tùy chỉnh số lượng câu tự luận trong đề (từ 5 đến 10 câu).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min={5}
                        max={10}
                        value={essayCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val)) {
                            setEssayCount(5);
                          } else {
                            setEssayCount(Math.min(10, Math.max(5, val)));
                          }
                        }}
                        className="w-20 px-3 py-1.5 text-center rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">câu</span>
                    </div>
                  </div>

                  {/* Quick-pick Chips for Essay */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Chọn nhanh:</span>
                    {[5, 6, 7, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEssayCount(num)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                          essayCount === num
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        )}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option C: Tùy chọn cấu hình đề Trộn (cả Trắc nghiệm & Tự luận) */}
              {selectedFormat === 'MIXED' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      Số lượng câu hỏi trong đề:
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tùy chọn số lượng câu trắc nghiệm (5 - 30) và câu tự luận (1 - 10):
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Trắc nghiệm Config */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Trắc nghiệm (5-30):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={5}
                            max={30}
                            value={quizCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val)) {
                                setQuizCount(5);
                              } else {
                                setQuizCount(Math.min(30, Math.max(5, val)));
                              }
                            }}
                            className="w-16 px-2 py-1 text-center rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <span className="text-[11px] text-slate-500">câu</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                        {[5, 10, 15, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuizCount(num)}
                            className={cn(
                              'px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer',
                              quizCount === num
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            )}
                          >
                            {num}c
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tự luận Config */}
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Tự luận (1-10):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={essayCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val)) {
                                setEssayCount(1);
                              } else {
                                setEssayCount(Math.min(10, Math.max(1, val)));
                              }
                            }}
                            className="w-16 px-2 py-1 text-center rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <span className="text-[11px] text-slate-500">câu</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                        {[1, 2, 3, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setEssayCount(num)}
                            className={cn(
                              'px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer',
                              essayCount === num
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            )}
                          >
                            {num}c
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                    Tổng số câu: <strong className="text-slate-900 dark:text-white">{quizCount + essayCount} câu</strong> ({quizCount} trắc nghiệm + {essayCount} tự luận).
                  </div>
                </div>
              )}

              {/* Step 5 Footer: Next to Step 6 (Duration) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span>Cấu hình đề: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedPracticeMode === 'MOCK_EXAM' ? 'Thi thử' : 'Chuyên đề'} • {subject.name} • Lớp {selectedGrade} •{' '}
                    {isAllChaptersMock ? 'Tổng hợp cả năm' : `Chương ${selectedChapterId}`} (
                    {selectedFormat === 'QUIZ'
                      ? `Trắc nghiệm: ${quizCount} câu`
                      : selectedFormat === 'ESSAY'
                      ? `Tự luận: ${essayCount} câu`
                      : `Trộn: ${quizCount} TN + ${essayCount} TL`}
                    )
                  </strong>
                </div>

                <Button
                  onClick={() => {
                    setMaxStepReached((prev) => Math.max(prev, 6));
                    setCurrentStep('DURATION');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold rounded-xl text-xs sm:text-sm px-4 py-2 shrink-0"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Chọn thời gian làm bài
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: CHỌN THỜI GIAN LÀM BÀI (10p, 15p, 45p, 60p, 90p)                  */}
          {/* ========================================================================= */}
          {currentStep === 'DURATION' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Chọn thời gian làm bài phù hợp với bạn:
              </p>

              {/* 5 Duration Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedDuration === opt.minutes;
                  return (
                    <div
                      key={opt.minutes}
                      onClick={() => setSelectedDuration(opt.minutes)}
                      className={cn(
                        'p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative',
                        isSelected
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-500" />
                            {opt.label}
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-3">
                          {opt.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {opt.minutes} phút làm bài
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ready summary bar & Start exam button */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span>Cấu hình hoàn tất: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedPracticeMode === 'MOCK_EXAM' ? 'Thi thử' : 'Chuyên đề'} • {subject.name} • Lớp {selectedGrade} •{' '}
                    {isAllChaptersMock ? 'Tổng hợp cả năm' : `Chương ${selectedChapterId}`} •{' '}
                    {selectedFormat === 'QUIZ'
                      ? `${quizCount} câu TN`
                      : selectedFormat === 'ESSAY'
                      ? `${essayCount} câu TL`
                      : `${quizCount} TN + ${essayCount} TL`}{' '}
                    • Thời gian: {selectedDuration} phút
                  </strong>
                </div>

                <Button
                  onClick={handleStartExam}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold rounded-xl text-sm px-6 py-2.5 shrink-0 shadow-2xs"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {selectedPracticeMode === 'MOCK_EXAM' ? 'Bắt đầu thi thử' : 'Bắt đầu làm bài'}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4 (MOCK_EXAM): XÁC NHẬN & TẠO ĐỀ THI THỬ                             */}
          {/* ========================================================================= */}
          {currentStep === 'MOCK_READY' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-900/40 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-4 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge className="bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 text-[11px] font-semibold">
                        Thi thử tổng hợp
                      </Badge>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <Badge className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-semibold">
                        Khối Lớp {selectedGrade}
                      </Badge>
                      {selectedMockMilestone.requiresGrade12 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <Badge className="bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[11px] font-semibold">
                            Chuẩn Bộ GD&ĐT
                          </Badge>
                        </>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {selectedMockMilestone.name} - Môn {subject.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {selectedMockMilestone.description}
                    </p>
                  </div>
                </div>

                {/* 4 thông số chính */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Thời gian</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      <Clock className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <span>{selectedMockMilestone.duration} phút</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Số lượng câu</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <span>{selectedMockMilestone.questionCount} câu</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hình thức thi</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <span>Trắc nghiệm chuẩn</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cơ chế chấm</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      <Zap className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <span>Tự động & Chi tiết</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white">Ma trận cấu trúc: </span>
                    <span>{selectedMockMilestone.matrixDesc}. Bấm giờ nghiêm ngặt và lưu bài làm liên tục.</span>
                  </div>
                </div>
              </div>

              {/* Ready summary bar & Start exam button */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('GRADE')}
                  className="text-xs sm:text-sm font-semibold rounded-xl"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Đổi khối lớp
                </Button>

                <Button
                  data-testid="btn-start-mock-exam"
                  onClick={handleStartMockExam}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold rounded-xl text-sm px-6 py-2.5 shrink-0 shadow-2xs gap-2"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tạo đề thi &amp; Bắt đầu làm bài
                </Button>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Dialog>

      {/* Require Login Gated Modal */}
      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={selectedGatedLevelName}
        returnUrl={pendingReturnUrl}
        onSuccessLogin={() => {
          setRequireLoginOpen(false);
          if (pendingReturnUrl) {
            onClose();
            router.push(pendingReturnUrl);
          }
        }}
      />

      {/* Out of Tia Sáng Modal */}
      <OutOfPointsModal
        isOpen={outOfPointsModal.isOpen}
        onClose={() => setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }))}
        currentPoints={outOfPointsModal.currentPoints}
        requiredPoints={outOfPointsModal.requiredPoints}
        levelLabel={outOfPointsModal.levelLabel}
        onNavigatePricing={() => {
          setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }));
          onClose();
          router.push('/pricing');
        }}
      />
    </>
  );
}
