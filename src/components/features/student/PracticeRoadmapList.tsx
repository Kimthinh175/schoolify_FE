'use client';

import * as React from 'react';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { PendingSubjectModal } from '@/components/features/student/practice/PendingSubjectModal';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import { useAuthStore } from '@/store/auth.store';
import {
  getCachedPointsBalance,
  getExamLevelCost,
  examPointsService,
  notifyExamPointsUpdated,
} from '@/services/exam-points.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  BrainCircuit,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Cpu,
  Dna,
  FileText,
  Flame,
  FlaskConical,
  Gauge,
  Globe,
  HeartHandshake,
  Home,
  Landmark,
  Languages,
  Layers,
  Lock,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { NgocIcon } from '@/components/ui/point-icons';
import { PracticeRoadmapSkeleton } from '@/components/skeletons/page-skeletons';
import {
  knowledgeProfileService,
  KnowledgeProfileResponse,
  KNOWLEDGE_PROFILE_UPDATED_EVENT,
  PersonalizedRoadmapResponse,
  TopicMasteryItem,
} from '@/services/knowledge-profile.service';
import {
  chapterRoadmapService,
  DiagnosticStatusInfo,
} from '@/services/chapter-roadmap.service';
import { ChapterConstellation } from '@/components/features/student/practice/constellation/ChapterConstellation';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';

export interface LessonRoadmapItem {
  id: string;
  number: string;
  title: string;
  description: string;
  progressPercent: number;
  rewardDiamonds: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  badges: {
    theory: { completed: boolean; label: string };
    quiz: { completed: boolean; score: string; total: number };
    exam: { completed: boolean; score?: string; locked?: boolean };
  };
}

export const MOCK_SUBJECTS: {
  slug: string;
  name: string;
  icon: string;
  iconName: string;
  colorClass: string;
  count: number;
  status: 'ACTIVE' | 'PENDING';
}[] = [
  { slug: 'toan-hoc', name: 'Toán Học', icon: '📐', iconName: 'Calculator', colorClass: 'text-sky-600 dark:text-sky-400', count: 180, status: 'ACTIVE' },
  { slug: 'tin-hoc', name: 'Tin Học', icon: '💻', iconName: 'Cpu', colorClass: 'text-cyan-600 dark:text-cyan-400', count: 90, status: 'ACTIVE' },
  { slug: 'vat-ly', name: 'Vật Lý', icon: '⚡', iconName: 'Atom', colorClass: 'text-indigo-500 dark:text-indigo-400', count: 135, status: 'PENDING' },
  { slug: 'hoa-hoc', name: 'Hóa Học', icon: '🧪', iconName: 'FlaskConical', colorClass: 'text-emerald-500 dark:text-emerald-400', count: 125, status: 'PENDING' },
  { slug: 'sinh-hoc', name: 'Sinh Học', icon: '🧬', iconName: 'Dna', colorClass: 'text-teal-500 dark:text-teal-400', count: 95, status: 'PENDING' },
  { slug: 'tieng-anh', name: 'Tiếng Anh', icon: '🇬🇧', iconName: 'Languages', colorClass: 'text-amber-500 dark:text-amber-400', count: 165, status: 'PENDING' },
  { slug: 'ngu-van', name: 'Ngữ Văn', icon: '📚', iconName: 'BookOpen', colorClass: 'text-rose-500 dark:text-rose-400', count: 110, status: 'PENDING' },
  { slug: 'lich-su', name: 'Lịch Sử', icon: '🏛️', iconName: 'Landmark', colorClass: 'text-orange-500 dark:text-orange-400', count: 85, status: 'PENDING' },
  { slug: 'dia-ly', name: 'Địa Lý', icon: '🌍', iconName: 'Globe', colorClass: 'text-blue-500 dark:text-blue-400', count: 78, status: 'PENDING' },
  { slug: 'gdcd', name: 'GDKT & Pháp Luật', icon: '⚖️', iconName: 'Scale', colorClass: 'text-purple-500 dark:text-purple-400', count: 65, status: 'PENDING' },
  { slug: 'cong-nghe', name: 'Công Nghệ', icon: '🔧', iconName: 'Wrench', colorClass: 'text-slate-500 dark:text-slate-400', count: 50, status: 'PENDING' },
  { slug: 'khoa-hoc-tu-nhien', name: 'Khoa Học Tự Nhiên', icon: '✨', iconName: 'Sparkles', colorClass: 'text-emerald-600 dark:text-emerald-400', count: 75, status: 'PENDING' },
];

function renderSubjectLogo(iconName: string, className = 'w-4 h-4') {
  switch (iconName) {
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Dna':
      return <Dna className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Scale':
      return <Scale className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

export const MOCK_LEVELS = [
  { slug: 'national_excellent', name: '5. HSG Quốc Gia', isFree: false },
  { slug: 'provincial_excellent', name: '4. HSG Tỉnh', isFree: false },
  { slug: 'advanced', name: '3. Nâng Cao', isFree: false },
  { slug: 'medium', name: '2. Trung Bình', isFree: true },
  { slug: 'basic', name: '1. Cơ Bản', isFree: true },
  ...Array.from({ length: 12 }, (_, idx) => {
    const gradeNum = 12 - idx;
    return { slug: `lop-${gradeNum}`, name: `Lớp ${gradeNum}`, isFree: true };
  }),
];

export const MOCK_TIN_ROADMAP_LESSONS: LessonRoadmapItem[] = [
  {
    id: 'tin-lesson-01',
    number: 'Bài 01',
    title: 'Biến, Kiểu Dữ Liệu & Nhập Xuất Chuẩn Python',
    description: 'Nắm vững các kiểu dữ liệu int, float, str, toán tử số học, điều kiện if/else và ép kiểu.',
    progressPercent: 100,
    rewardDiamonds: 50,
    status: 'COMPLETED',
    badges: {
      theory: { completed: true, label: 'Đã học' },
      quiz: { completed: true, score: '3/3', total: 3 },
      exam: { completed: true, score: '10/10' },
    },
  },
  {
    id: 'tin-lesson-02',
    number: 'Bài 02',
    title: 'Vòng Lặp For/While & Xử Lý Mảng 1 Chiều',
    description: 'Kỹ thuật duyệt danh sách, tìm giá trị lớn nhất/nhỏ nhất, sắp xếp nổi bọt và cộng dồn mảng.',
    progressPercent: 70,
    rewardDiamonds: 50,
    status: 'IN_PROGRESS',
    badges: {
      theory: { completed: true, label: 'Đã học' },
      quiz: { completed: true, score: '4/5', total: 5 },
      exam: { completed: false, locked: false },
    },
  },
  {
    id: 'tin-lesson-03',
    number: 'Bài 03',
    title: 'Hàm, Đệ Quy & Thuật Toán Tìm Kiếm Nhị Phân',
    description: 'Tổ chức chương trình dạng module hàm, bài toán đệ quy kinh điển và tìm kiếm nhị phân O(log N).',
    progressPercent: 20,
    rewardDiamonds: 50,
    status: 'IN_PROGRESS',
    badges: {
      theory: { completed: true, label: 'Đã học' },
      quiz: { completed: false, score: '0/5', total: 5 },
      exam: { completed: false, locked: false },
    },
  },
  {
    id: 'tin-lesson-04',
    number: 'Bài 04',
    title: 'Quy Hoạch Động & Bài Toán Cái Túi (0/1 Knapsack)',
    description: 'Công thức truy hồi, bảng phương án và truy vết nghiệm tối ưu trong các bài toán quy hoạch động.',
    progressPercent: 0,
    rewardDiamonds: 50,
    status: 'LOCKED',
    badges: {
      theory: { completed: false, label: 'Chưa học' },
      quiz: { completed: false, score: '0/5', total: 5 },
      exam: { completed: false, locked: true },
    },
  },
  {
    id: 'tin-lesson-05',
    number: 'Bài 05',
    title: 'Luyện Đề Lập Trình Thi Học Sinh Giỏi (C++ / Python)',
    description: '3 bài toán lập trình chuẩn Olympic chấm testcase tự động với giới hạn thời gian 1.0 giây.',
    progressPercent: 0,
    rewardDiamonds: 100,
    status: 'LOCKED',
    badges: {
      theory: { completed: false, label: 'Chưa học' },
      quiz: { completed: false, score: '0/10', total: 10 },
      exam: { completed: false, locked: true },
    },
  },
];

export const MOCK_ROADMAP_LESSONS: LessonRoadmapItem[] = [
  {
    id: 'lesson-01',
    number: 'Bài 01',
    title: 'Giá Trị Lượng Giác & Công Thức Cốt Lõi',
    description: 'Nắm vững các công thức nghiệm cơ bản sin, cos, tan, cot và điều kiện xác định.',
    progressPercent: 100,
    rewardDiamonds: 50,
    status: 'COMPLETED',
    badges: {
      theory: { completed: true, label: 'Đã học' },
      quiz: { completed: true, score: '3/3', total: 3 },
      exam: { completed: true, score: '9/10' },
    },
  },
  {
    id: 'lesson-02',
    number: 'Bài 02',
    title: 'Phương Trình Lượng Giác Bậc Hai & Biến Đổi',
    description: 'Phương pháp đặt ẩn phụ t = cos(x) hoặc t = sin(x) và điều kiện chọn nghiệm.',
    progressPercent: 75,
    rewardDiamonds: 50,
    status: 'IN_PROGRESS',
    badges: {
      theory: { completed: true, label: 'Đã học' },
      quiz: { completed: true, score: '4/5', total: 5 },
      exam: { completed: false, locked: false },
    },
  },
  {
    id: 'lesson-03',
    number: 'Bài 03',
    title: 'Phương Trình Dạng a.sin(x) + b.cos(x) = c',
    description: 'Điều kiện a² + b² ≥ c² và phương pháp chia cả 2 vế cho √(a² + b²).',
    progressPercent: 25,
    rewardDiamonds: 50,
    status: 'IN_PROGRESS',
    badges: {
      theory: { completed: true, label: 'Đã học' },
      quiz: { completed: false, score: '0/5', total: 5 },
      exam: { completed: false, locked: false },
    },
  },
  {
    id: 'lesson-04',
    number: 'Bài 04',
    title: 'Hàm Số Lượng Giác & Tập Xác Định - Chu Kỳ',
    description: 'Khảo sát tính tuần hoàn, chu kỳ T = 2π/ω và đồ thị hàm số sin, cos, tan.',
    progressPercent: 0,
    rewardDiamonds: 50,
    status: 'LOCKED',
    badges: {
      theory: { completed: false, label: 'Chưa học' },
      quiz: { completed: false, score: '0/5', total: 5 },
      exam: { completed: false, locked: true },
    },
  },
  {
    id: 'lesson-05',
    number: 'Bài 05',
    title: 'Ôn Tập Chương Lượng Giác & Đề Thi Mẫu',
    description: 'Tổng hợp câu hỏi trắc nghiệm phân hóa cao chuẩn cấu trúc đề thi THPT.',
    progressPercent: 0,
    rewardDiamonds: 100,
    status: 'LOCKED',
    badges: {
      theory: { completed: false, label: 'Chưa học' },
      quiz: { completed: false, score: '0/10', total: 10 },
      exam: { completed: false, locked: true },
    },
  },
];

interface PracticeRoadmapListProps {
  currentSubjectSlug?: string;
  currentLevelSlug?: string;
}

function resolveGradeFromLevelSlug(levelSlug: string): number {
  const match = String(levelSlug || '').match(/^lop-(\d+)$/);
  if (match) {
    const num = Number(match[1]);
    if (num >= 1 && num <= 12) return num;
  }
  return 12;
}

function extractUserGradeNumber(rawGrade?: string | number | null): number | null {
  if (rawGrade === null || rawGrade === undefined) return null;
  const match = String(rawGrade).match(/(1[0-2]|[1-9])\b/);
  if (!match) return null;
  const num = Number(match[1]);
  return num >= 1 && num <= 12 ? num : null;
}

export function PracticeRoadmapList({
  currentSubjectSlug = 'ALL',
  currentLevelSlug = 'lop-12',
}: PracticeRoadmapListProps) {
  const router = useRouter();
  const { isAuthenticated, user, currentRole } = useAuthStore();
  const isLoggedIn = Boolean(isAuthenticated && user?.id);
  const isAdmin =
    (currentRole as string) === 'ADMIN' ||
    currentRole === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';
  const [isMounted, setIsMounted] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState(currentSubjectSlug);
  const [hasManualGradeSelect, setHasManualGradeSelect] = React.useState(false);
  const [selectedGradeSlug, setSelectedGradeSlug] = React.useState(() => {
    const profileGrade = extractUserGradeNumber(user?.student_profile?.grade_level);
    if (profileGrade && currentLevelSlug === 'lop-12') {
      return `lop-${profileGrade}`;
    }
    return currentLevelSlug.startsWith('lop-') ? currentLevelSlug : 'lop-12';
  });
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');

  React.useEffect(() => {
    if (hasManualGradeSelect) return;
    const profileGrade = extractUserGradeNumber(user?.student_profile?.grade_level);
    if (profileGrade && currentLevelSlug === 'lop-12') {
      setSelectedGradeSlug(`lop-${profileGrade}`);
    }
  }, [user?.id, user?.student_profile?.grade_level, currentLevelSlug, hasManualGradeSelect]);
  const [activeMode, setActiveMode] = React.useState<'ADAPTIVE' | 'CURRICULUM'>('ADAPTIVE');
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [gatedLevelName, setGatedLevelName] = React.useState('');
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);
  const [pendingSubjectName, setPendingSubjectName] = React.useState('Môn học');
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

  const handleStartPracticeExam = async (practiceUrl: string, title?: string) => {
    const safeUrl = practiceUrl?.trim();
    if (!safeUrl) return;
    const urlLevelMatch = safeUrl.match(/[?&]level=([^&]+)/i);
    const rawLevel = urlLevelMatch ? urlLevelMatch[1] : 'BASIC';
    const isDiagnostic = /[?&]practiceMode=DIAGNOSTIC/i.test(safeUrl);

    if (!isLoggedIn) {
      const guest = getGuestOnboarding();
      const canGuestTry =
        Boolean(guest) &&
        (guest?.trialUsedCount ?? 0) < 1 &&
        (isDiagnostic || String(rawLevel).toUpperCase() === 'BASIC');
      if (canGuestTry) {
        router.push(safeUrl);
        return;
      }
      setGatedLevelName(title || 'Đề luyện thi cá nhân hóa');
      setRequireLoginOpen(true);
      return;
    }

    if (isAdmin || isDiagnostic) {
      router.push(safeUrl);
      return;
    }

    const costInfo = getExamLevelCost(rawLevel);
    const cached = getCachedPointsBalance();
    if (cached !== null && cached < costInfo.costPoints) {
      setOutOfPointsModal({
        isOpen: true,
        currentPoints: Math.max(0, cached),
        requiredPoints: costInfo.costPoints,
        levelLabel: title || costInfo.label,
      });
      return;
    }

    const latest = await examPointsService.getBalance(user?.id);
    if (latest && typeof latest.currentPoints === 'number') {
      notifyExamPointsUpdated(latest.currentPoints);
      if (latest.currentPoints < costInfo.costPoints) {
        setOutOfPointsModal({
          isOpen: true,
          currentPoints: Math.max(0, latest.currentPoints),
          requiredPoints: costInfo.costPoints,
          levelLabel: title || costInfo.label,
        });
        return;
      }
    }

    router.push(practiceUrl);
  };

  // State cho Lộ trình Cá nhân hóa, Hồ sơ Chuyên đề & Chẩn đoán Đầu vào (Module 09)
  const [adaptiveData, setAdaptiveData] = React.useState<PersonalizedRoadmapResponse | null>(null);
  const [knowledgeProfile, setKnowledgeProfile] = React.useState<KnowledgeProfileResponse | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = React.useState<DiagnosticStatusInfo | null>(null);
  const [topicFilter, setTopicFilter] = React.useState<'ALL' | 'WEAK' | 'REVIEW' | 'MASTERED' | 'UNTESTED'>('ALL');
  const [roadmapSearch, setRoadmapSearch] = React.useState('');
  const [adaptiveLoading, setAdaptiveLoading] = React.useState(true);
  const [adaptiveError, setAdaptiveError] = React.useState<string | null>(null);

  const activeGrade = resolveGradeFromLevelSlug(selectedGradeSlug);

  const fetchAdaptiveRoadmap = React.useCallback(async () => {
    if (!isLoggedIn) {
      setAdaptiveData(null);
      setKnowledgeProfile(null);
      setDiagnosticInfo(null);
      setAdaptiveError(null);
      setAdaptiveLoading(false);
      return;
    }

    const apiSubject = selectedSubject === 'ALL' ? 'toan-hoc' : selectedSubject;
    setAdaptiveLoading(true);
    setAdaptiveError(null);
    try {
      const [roadmapRes, profileRes, diagRes] = await Promise.allSettled([
        knowledgeProfileService.getPersonalizedRoadmap({
          subject: apiSubject,
          grade: activeGrade,
          userId: user?.id,
        }),
        knowledgeProfileService.getKnowledgeProfile({
          subject: apiSubject,
          grade: activeGrade,
          userId: user?.id,
        }),
        chapterRoadmapService.getDiagnosticStatus(apiSubject, activeGrade),
      ]);

      if (roadmapRes.status === 'fulfilled') {
        setAdaptiveData(roadmapRes.value);
      } else {
        throw roadmapRes.reason;
      }

      if (profileRes.status === 'fulfilled') {
        setKnowledgeProfile(profileRes.value);
      }
      if (diagRes.status === 'fulfilled') {
        setDiagnosticInfo(diagRes.value);
      }
    } catch (err: any) {
      setAdaptiveError(err?.message || 'Không thể tải lộ trình cá nhân hóa từ máy chủ');
    } finally {
      setAdaptiveLoading(false);
    }
  }, [isLoggedIn, user?.id, selectedSubject, activeGrade]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    fetchAdaptiveRoadmap();

    const onUpdated = () => fetchAdaptiveRoadmap();
    window.addEventListener(KNOWLEDGE_PROFILE_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(KNOWLEDGE_PROFILE_UPDATED_EVENT, onUpdated);
  }, [isMounted, fetchAdaptiveRoadmap]);

  if (!isMounted) {
    return <PracticeRoadmapSkeleton />;
  }

  const subjectInfo =
    selectedSubject === 'ALL'
      ? {
          slug: 'ALL',
          name: 'Tất cả các môn học',
          icon: '📚',
          iconName: 'BookOpen',
          colorClass: 'text-[#00B8DD]',
          count: MOCK_SUBJECTS.reduce((s, m) => s + m.count, 0),
          status: 'ACTIVE' as const,
        }
      : MOCK_SUBJECTS.find((s) => s.slug === selectedSubject) || MOCK_SUBJECTS[0];
  const levelInfo =
    MOCK_LEVELS.find((l) => l.slug === selectedGradeSlug) || MOCK_LEVELS[0];

  const handleSubjectClick = (subj: (typeof MOCK_SUBJECTS)[0] | 'ALL') => {
    if (subj === 'ALL') {
      setSelectedSubject('ALL');
      return;
    }
    if (subj.status === 'PENDING') {
      setPendingSubjectName(subj.name);
      setIsPendingModalOpen(true);
      return;
    }
    setSelectedSubject(subj.slug);
  };

  const handlePendingModalSelect = (slug: 'toan-hoc' | 'tin-hoc') => {
    setIsPendingModalOpen(false);
    setSelectedSubject(slug);
  };

  const handleGradeChange = (slug: string) => {
    setHasManualGradeSelect(true);
    setSelectedGradeSlug(slug);
  };

  const handleRefreshRoadmap = () => {
    const profileGrade = extractUserGradeNumber(user?.student_profile?.grade_level);
    const defaultGradeSlug = profileGrade ? `lop-${profileGrade}` : 'lop-12';
    setRoadmapSearch('');
    setSelectedSubject('ALL');
    setHasManualGradeSelect(false);
    setSelectedGradeSlug(defaultGradeSlug);
    setSelectedDifficulty('ALL');
    setTopicFilter('ALL');
    void fetchAdaptiveRoadmap();
  };

  const handleDifficultyChange = (slug: string) => {
    if (slug === 'ALL') {
      setSelectedDifficulty('ALL');
      return;
    }
    const targetLvl = MOCK_LEVELS.find((l) => l.slug === slug);
    if (!isLoggedIn && targetLvl && !targetLvl.isFree) {
      setGatedLevelName(targetLvl.name);
      setRequireLoginOpen(true);
      return;
    }
    setSelectedDifficulty(slug);
  };

  const currentLessons =
    selectedSubject === 'tin-hoc' ? MOCK_TIN_ROADMAP_LESSONS : MOCK_ROADMAP_LESSONS;
  const totalLessons = currentLessons.length;
  const completedLessonsCount = currentLessons.filter(
    (l) => l.status === 'COMPLETED'
  ).length;
  const overallProgress = Math.round(
    (currentLessons.reduce((acc, curr) => acc + curr.progressPercent, 0) /
      (totalLessons * 100)) *
      100
  );

  const summary = adaptiveData?.knowledgeSummary;
  const bloomStats = adaptiveData?.bloomStats;
  const primaryRec = adaptiveData?.primaryRecommendation;

  const gradeLevels = MOCK_LEVELS.filter((lvl) => lvl.slug.startsWith('lop-'));
  const difficultyLevels = MOCK_LEVELS.filter((lvl) => !lvl.slug.startsWith('lop-'));
  const currentGradeOption =
    gradeLevels.find((g) => g.slug === selectedGradeSlug) ||
    gradeLevels.find((g) => g.slug === `lop-${activeGrade}`) ||
    gradeLevels[0];
  const currentDifficultyOption =
    selectedDifficulty === 'ALL'
      ? null
      : difficultyLevels.find((d) => d.slug === selectedDifficulty) || null;

  return (
    <div className="space-y-5">
      {/* 1. FILTER & HEADER SECTION */}
      <section className="relative z-30 overflow-visible bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#00B8DD]/10 text-[#00B8DD] text-xs font-semibold">
                <BrainCircuit className="w-3.5 h-3.5" />
                Cá nhân hóa từ dữ liệu bài thi
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Khối {activeGrade} • {subjectInfo.name}
                {isLoggedIn && user?.fullname ? ` • ${user.fullname}` : ''}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 inline-flex items-center justify-center shrink-0">
                {renderSubjectLogo(subjectInfo.iconName, `w-4.5 h-4.5 ${subjectInfo.colorClass}`)}
              </span>
              <span>
                {selectedSubject === 'ALL'
                  ? 'Hồ sơ Năng lực & Lộ trình Cá nhân hóa'
                  : `Hồ sơ Năng lực & Lộ trình Cá nhân hóa ${subjectInfo.name}`}
              </span>
            </h1>
          </div>

          {/* Mode Toggle Switcher (flex-wrap, Zero Horizontal Scroll) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start lg:self-auto">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer min-h-[40px]"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Về Trang Chủ</span>
            </Link>
            <button
              type="button"
              onClick={() => setActiveMode('CURRICULUM')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                activeMode === 'CURRICULUM'
                  ? 'bg-[#00B8DD] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Bản đồ Chòm sao</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('ADAPTIVE')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                activeMode === 'ADAPTIVE'
                  ? 'bg-[#00B8DD] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hồ sơ Năng lực AI</span>
            </button>
          </div>
        </div>

        {/* Filters Controls (Đồng bộ bố cục Search + Dropdown List với Lịch sử luyện đề) */}
        <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3 space-y-2.5">
          <div className="flex flex-col xl:flex-row xl:items-center gap-2.5">
            {/* Search Input */}
            <div className="flex-1 relative min-w-[220px]">
              <Input
                placeholder="Tìm chuyên đề, chương học hoặc bẫy sai lầm..."
                value={roadmapSearch}
                onChange={(e) => setRoadmapSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="w-full text-xs h-10 pr-8 bg-white dark:bg-slate-900 rounded-xl"
              />
              {roadmapSearch && (
                <button
                  type="button"
                  onClick={() => setRoadmapSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Xoá tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3 Dropdowns + Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Dropdown Môn học */}
              <DropdownMenu
                align="left"
                className="min-w-[240px] max-h-80 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[90]"
                trigger={
                  <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/60 dark:hover:border-[#00B8DD]/50 text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      {renderSubjectLogo(subjectInfo.iconName, `w-4 h-4 shrink-0 ${subjectInfo.colorClass}`)}
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Môn:</span>
                      <span className="truncate">{subjectInfo.name}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                }
              >
                <DropdownMenuItem
                  onClick={() => handleSubjectClick('ALL')}
                  className={`py-2 px-2.5 rounded-xl text-xs ${
                    selectedSubject === 'ALL'
                      ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
                      : ''
                  }`}
                  icon={<BookOpen className="w-4 h-4 shrink-0 text-[#00B8DD]" />}
                >
                  Tất cả các môn học
                </DropdownMenuItem>
                {MOCK_SUBJECTS.map((subj) => {
                  const isSelected = subj.slug === selectedSubject;
                  const isPending = subj.status === 'PENDING';
                  return (
                    <DropdownMenuItem
                      key={subj.slug}
                      onClick={() => handleSubjectClick(subj)}
                      className={`py-2 px-2.5 rounded-xl text-xs ${
                        isSelected
                          ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
                          : isPending
                          ? 'text-slate-500 dark:text-slate-400'
                          : ''
                      }`}
                      icon={renderSubjectLogo(subj.iconName, `w-4 h-4 shrink-0 ${subj.colorClass}`)}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>{subj.name}</span>
                        {isPending && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Sắp có
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenu>

              {/* 2. Dropdown Khối lớp (Từ Lớp 12 giảm xuống Lớp 1) */}
              <DropdownMenu
                align="left"
                className="min-w-[170px] max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[90]"
                trigger={
                  <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/60 dark:hover:border-[#00B8DD]/50 text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Khối:</span>
                      <span className="truncate">{currentGradeOption?.name || 'Lớp 12'}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                }
              >
                {gradeLevels.map((lvl) => {
                  const isSelected = currentGradeOption?.slug === lvl.slug;
                  return (
                    <DropdownMenuItem
                      key={lvl.slug}
                      onClick={() => handleGradeChange(lvl.slug)}
                      className={`py-2 px-2.5 rounded-xl text-xs ${
                        isSelected ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold' : ''
                      }`}
                      icon={
                        isSelected ? (
                          <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
                        ) : (
                          <span className="w-3.5 h-3.5 block" />
                        )
                      }
                    >
                      {lvl.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenu>

              {/* 3. Dropdown Cấp độ (Tất cả cấp độ + Từ 5. HSG Quốc Gia giảm xuống 1. Cơ Bản) */}
              <DropdownMenu
                align="right"
                className="min-w-[205px] max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[90]"
                trigger={
                  <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/60 dark:hover:border-[#00B8DD]/50 text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Mức:</span>
                      <span className="truncate">
                        {currentDifficultyOption ? currentDifficultyOption.name : 'Tất cả cấp độ'}
                      </span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                }
              >
                <DropdownMenuItem
                  onClick={() => handleDifficultyChange('ALL')}
                  className={`py-2 px-2.5 rounded-xl text-xs ${
                    selectedDifficulty === 'ALL'
                      ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
                      : ''
                  }`}
                  icon={
                    selectedDifficulty === 'ALL' ? (
                      <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
                    ) : (
                      <span className="w-3.5 h-3.5 block" />
                    )
                  }
                >
                  Tất cả cấp độ
                </DropdownMenuItem>
                {difficultyLevels.map((lvl) => {
                  const isSelected = currentDifficultyOption?.slug === lvl.slug;
                  return (
                    <DropdownMenuItem
                      key={lvl.slug}
                      onClick={() => handleDifficultyChange(lvl.slug)}
                      className={`py-2 px-2.5 rounded-xl text-xs ${
                        isSelected ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold' : ''
                      }`}
                      icon={
                        !lvl.isFree && !isLoggedIn ? (
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        ) : isSelected ? (
                          <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
                        ) : (
                          <span className="w-3.5 h-3.5 block" />
                        )
                      }
                    >
                      {lvl.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenu>
            </div>
          </div>

          {/* Summary bar đồng bộ */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
            <span>
              Đang hiển thị: <strong className="text-slate-800 dark:text-slate-200">{subjectInfo.name}</strong> • Khối {activeGrade}
              {roadmapSearch.trim() ? ` • Từ khóa "${roadmapSearch.trim()}"` : ''}
            </span>
            <div className="flex items-center gap-3">
              <span>{MOCK_SUBJECTS.length} môn học • Khối 12 → 1</span>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleRefreshRoadmap}
                  disabled={adaptiveLoading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#007D99] dark:text-[#00B8DD] hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${adaptiveLoading ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHẾ ĐỘ 1: HỒ SƠ KIẾN THỨC & LỘ TRÌNH CÁ NHÂN HÓA (POSTGRESQL BACKEND) */}
      {/* ===================================================================== */}
      {activeMode === 'ADAPTIVE' && (
        <div className="space-y-6">
          {!isLoggedIn ? (
            <Card className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00B8DD]/10 text-[#00B8DD] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Đăng nhập để xem Hồ sơ Năng lực &amp; Lộ trình Cá nhân hóa
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Dữ liệu chẩn đoán đầu vào, độ thành thạo chuyên đề và lộ trình AI được bảo mật theo từng tài khoản học sinh.
              </p>
              <div className="pt-1">
                <Link href="/login/student?returnUrl=/student/practice">
                  <Button className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold rounded-xl px-5">
                    Đăng nhập tài khoản học sinh
                  </Button>
                </Link>
              </div>
            </Card>
          ) : adaptiveLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60"
                />
              ))}
            </div>
          ) : adaptiveError ? (
            <Card className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  Không thể đồng bộ hồ sơ kiến thức
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{adaptiveError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAdaptiveRoadmap}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Thử lại
              </Button>
            </Card>
          ) : adaptiveData && summary ? (
            <>
              {/* KHỐI 1: THỐNG KÊ TỔNG QUAN (4 CARDS - TÔNG CHỦ ĐẠO #00B8DD + SLATE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Thành thạo tích lũy</span>
                    <TrendingUp className="w-4 h-4 text-[#00B8DD]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {summary.overallMasteryScore}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {summary.countsByStatus.mastered}/{summary.countsByStatus.totalCurriculumTopics} vững
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#00B8DD] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, summary.overallMasteryScore)}%` }}
                    />
                  </div>
                </Card>

                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Tỉ lệ chính xác</span>
                    <Target className="w-4 h-4 text-[#00B8DD]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {summary.overallAccuracyPercent}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {summary.totalCorrect}/{summary.totalQuestionsAttempted} câu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {summary.totalExamsSubmitted} đề • TB {summary.avgSecondsPerQuestion || 30}s/câu
                  </p>
                </Card>

                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Phân loại chuyên đề</span>
                    <BrainCircuit className="w-4 h-4 text-[#00B8DD]" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Yếu: {summary.countsByStatus.weak}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Ôn: {summary.countsByStatus.review}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />
                      Vững: {summary.countsByStatus.mastered}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {summary.countsByStatus.untested} chuyên đề chưa làm
                  </p>
                </Card>

                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Cấp độ Bloom</span>
                    <Flame className="w-4 h-4 text-[#00B8DD]" />
                  </div>
                  {bloomStats && (
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-xs">
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Nhận biết</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {bloomStats.NHAN_BIET.accuracy}%
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Thông hiểu</span>
                        <span className="font-bold text-[#007D99] dark:text-[#00B8DD] tabular-nums">
                          {bloomStats.THONG_HIEU.accuracy}%
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Vận dụng</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {bloomStats.VAN_DUNG.accuracy}%
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">VDC (9+)</span>
                        <span className="font-bold text-[#007D99] dark:text-[#00B8DD] tabular-nums">
                          {bloomStats.VAN_DUNG_CAO.accuracy}%
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* KHỐI 1B: ĐÁNH GIÁ ĐẦU VÀO & PHONG ĐỘ HỌC TẬP */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#00B8DD] shrink-0" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Đánh giá đầu vào
                        </h3>
                      </div>
                      {diagnosticInfo?.diagnosticCompleted && diagnosticInfo.diagnosticResult ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                          {diagnosticInfo.diagnosticResult.assignedLevel === 'ADVANCED'
                            ? 'Mức Nâng cao'
                            : diagnosticInfo.diagnosticResult.assignedLevel === 'MEDIUM'
                            ? 'Mức Trung bình'
                            : 'Mức Cơ bản'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Chưa khảo sát
                        </span>
                      )}
                    </div>

                    {diagnosticInfo?.diagnosticCompleted && diagnosticInfo.diagnosticResult ? (
                      <div className="space-y-2.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                            {diagnosticInfo.diagnosticResult.overallScore}
                          </span>
                          <span className="text-xs font-medium text-slate-400">/ 10 điểm</span>
                        </div>
                        {diagnosticInfo.diagnosticResult.trackScores && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(diagnosticInfo.diagnosticResult.trackScores).map(([trackName, trackVal]) => (
                              <div
                                key={trackName}
                                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                              >
                                <span className="text-slate-600 dark:text-slate-300 truncate mr-2">
                                  {trackName}
                                </span>
                                <span className="font-bold text-[#007D99] dark:text-[#00B8DD] tabular-nums shrink-0">
                                  {trackVal}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Làm bài đánh giá ngắn để xác định cấp độ xuất phát phù hợp.
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Xếp hạng tự động theo môn</span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        void handleStartPracticeExam(
                          `/student/practice/exam-room?subject=${selectedSubject === 'ALL' ? 'toan-hoc' : selectedSubject}&level=basic&grade=${activeGrade}&format=quiz&duration=15&quizCount=15&count=15&practiceMode=DIAGNOSTIC`,
                          `Đánh giá năng lực ${subjectInfo.name} Lớp ${activeGrade}`
                        )
                      }
                      className="h-9 px-4 text-xs font-semibold rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] active:scale-[0.98] text-white shadow-xs shadow-[#00B8DD]/25 hover:shadow-md hover:shadow-[#00B8DD]/30 transition-all duration-150 cursor-pointer group"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />}
                    >
                      {diagnosticInfo?.diagnosticCompleted ? 'Đánh giá lại' : 'Đánh giá ngay'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-[#00B8DD] shrink-0" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Phong độ &amp; Tư duy
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                        AI phân tích
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>Tinh thần học tập</span>
                          <span className="tabular-nums font-bold text-[#007D99] dark:text-[#00B8DD]">
                            {adaptiveData.behaviorSummary?.avgLearningSpiritScore ?? 80}/100
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {adaptiveData.behaviorSummary?.latestLearningSpiritLabel || 'Ổn định & Chủ động'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>Tư duy &amp; Nhạy bén</span>
                          <span className="tabular-nums font-bold text-[#007D99] dark:text-[#00B8DD]">
                            {adaptiveData.behaviorSummary?.avgIntelligenceScore ?? 75}/100
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {adaptiveData.behaviorSummary?.latestIntelligenceLabel || 'Phân tích logic tốt'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Vá lỗ hổng:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {summary.remediationCorrect}/{summary.remediationAttempted} câu
                      </strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {adaptiveData.behaviorSummary?.totalSessions ?? 0} lượt luyện nhanh
                    </span>
                  </div>
                </Card>
              </div>

              {/* KHỐI 2: ƯU TIÊN HÔM NAY + LỖI HAY MẮC */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {primaryRec && (
                  <Card className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#00B8DD]/[0.07] via-white to-white dark:from-[#00B8DD]/10 dark:via-slate-900 dark:to-slate-900 border border-[#00B8DD]/35 flex flex-col justify-between gap-3.5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00B8DD] text-white">
                          Ưu tiên hôm nay
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {primaryRec.chapterName}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {primaryRec.questionCount} câu ({primaryRec.durationMinutes}p)
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {primaryRec.title}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {primaryRec.diagnosticReason}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          Hiện tại:{' '}
                          <strong className="text-slate-900 dark:text-white tabular-nums">
                            {primaryRec.currentMastery}%
                          </strong>
                        </span>
                        <span>→</span>
                        <span>
                          Mục tiêu:{' '}
                          <strong className="text-[#00B8DD] tabular-nums">{primaryRec.targetMastery}%</strong>
                        </span>
                      </div>

                      <Button
                        type="button"
                        onClick={() =>
                          void handleStartPracticeExam(
                            primaryRec.practiceUrl ||
                              `/student/practice/exam-room?subject=${primaryRec.subject || (selectedSubject === 'ALL' ? 'toan-hoc' : selectedSubject)}&level=${String(primaryRec.recommendedLevel || 'BASIC').toLowerCase()}&grade=${primaryRec.grade || activeGrade}&chapter=${primaryRec.chapterId || 1}&format=quiz&duration=${primaryRec.durationMinutes || 15}&quizCount=${primaryRec.questionCount || 10}&count=${primaryRec.questionCount || 10}&practiceMode=TOPIC`,
                            primaryRec.title
                          )
                        }
                        className="bg-[#00B8DD] hover:bg-[#009bbd] active:scale-[0.98] text-white font-semibold rounded-xl px-4 h-9 text-xs shadow-xs shadow-[#00B8DD]/25 hover:shadow-md hover:shadow-[#00B8DD]/30 transition-all duration-150 cursor-pointer group"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />}
                      >
                        Luyện ngay
                      </Button>
                    </div>
                  </Card>
                )}

                <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#00B8DD] shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Lỗi hay mắc
                    </h3>
                  </div>

                  {adaptiveData.frequentTraps.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chưa ghi nhận lỗi lặp lại.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {adaptiveData.frequentTraps.slice(0, 3).map((trap) => (
                        <div
                          key={trap.trapTag}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                              {trap.trapTag}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] text-[10px] font-bold shrink-0">
                              {trap.count} lần
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {trap.topicTag}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* KHỐI 3: LỘ TRÌNH 3 CHẶNG GỌN GÀNG */}
              <div className="space-y-4">
                {adaptiveData.phases.map((phaseGroup) => {
                  const q = roadmapSearch.trim().toLowerCase();
                  const targetRecLevel =
                    selectedDifficulty === 'basic'
                      ? 'BASIC'
                      : selectedDifficulty === 'medium'
                      ? 'MEDIUM'
                      : selectedDifficulty === 'ALL'
                      ? null
                      : 'ADVANCED';
                  const visibleSteps = phaseGroup.steps.filter((s) => {
                    const matchQuery =
                      !q ||
                      s.title.toLowerCase().includes(q) ||
                      s.topicTag.toLowerCase().includes(q) ||
                      s.chapterName.toLowerCase().includes(q) ||
                      (s.topTrapTag || '').toLowerCase().includes(q);
                    const matchLevel = !targetRecLevel || s.recommendedLevel === targetRecLevel;
                    return matchQuery && matchLevel;
                  });
                  if ((q || targetRecLevel) && visibleSteps.length === 0) return null;
                  const isPhase1 = phaseGroup.phase === 1;
                  return (
                    <section
                      key={phaseGroup.phase}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isPhase1
                                ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {phaseGroup.badge}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {phaseGroup.title}
                          </h3>
                        </div>
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                          {visibleSteps.length} chuyên đề
                        </span>
                      </div>

                      <div className="space-y-3">
                        {visibleSteps.map((step) => {
                          const isRecommended = step.status === 'RECOMMENDED';
                          const isCompleted = step.status === 'COMPLETED';
                          const isLocked = step.status === 'LOCKED';

                          return (
                            <div
                              key={step.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 ${
                                isRecommended
                                  ? 'border-[#00B8DD]/60 bg-[#00B8DD]/[0.03] dark:bg-[#00B8DD]/[0.06]'
                                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                              }`}
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    Bước {step.stepOrder}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {step.chapterName}
                                  </span>
                                  {isRecommended && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00B8DD] text-white">
                                      Ưu tiên
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]">
                                      Đã vững
                                    </span>
                                  )}
                                  <span className="text-xs text-slate-400">
                                    • {step.questionCount} câu ({step.durationMinutes}p)
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 dark:text-white break-words">
                                  {step.title}
                                </h4>

                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {step.diagnosticReason}
                                </p>

                                {step.topTrapTag && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/80 rounded-lg px-2.5 py-1 w-fit max-w-full truncate">
                                    <span className="font-semibold text-[#007D99] dark:text-[#00B8DD]">Lưu ý:</span>{' '}
                                    {step.topTrapTag}
                                  </p>
                                )}

                                {/* Thanh thành thạo hiện tại -> mục tiêu */}
                                <div className="max-w-md pt-1 space-y-1">
                                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>
                                      Đúng {step.correctCount}/{step.attemptedCount} câu
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                      {step.currentMastery}% / {step.targetMastery}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={Math.max(4, step.currentMastery)}
                                    className="h-1.5 bg-slate-200 dark:bg-slate-800"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center shrink-0">
                                <Button
                                  type="button"
                                  onClick={() =>
                                    void handleStartPracticeExam(
                                      step.practiceUrl ||
                                        `/student/practice/exam-room?subject=${step.subject || (selectedSubject === 'ALL' ? 'toan-hoc' : selectedSubject)}&level=${String(step.recommendedLevel || 'BASIC').toLowerCase()}&grade=${step.grade || activeGrade}&chapter=${step.chapterId || 1}&format=quiz&duration=${step.durationMinutes || 15}&quizCount=${step.questionCount || 10}&count=${step.questionCount || 10}&practiceMode=TOPIC`,
                                      step.title
                                    )
                                  }
                                  className="bg-[#00B8DD] hover:bg-[#009bbd] active:scale-[0.98] text-white font-semibold rounded-xl h-9 px-4 text-xs shadow-xs shadow-[#00B8DD]/25 hover:shadow-md hover:shadow-[#00B8DD]/30 transition-all duration-150 cursor-pointer group"
                                  rightIcon={
                                    isLocked ? (
                                      <Lock className="w-3.5 h-3.5" />
                                    ) : (
                                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                                    )
                                  }
                                >
                                  {step.attemptedCount === 0
                                    ? 'Khảo sát'
                                    : isCompleted
                                    ? 'Nâng cao'
                                    : 'Luyện ngay'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* KHỐI 4: MA TRẬN CHUYÊN ĐỀ (TỐI GIẢN & TẬP TRUNG) */}
              {knowledgeProfile && knowledgeProfile.topics.length > 0 && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#00B8DD]" />
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Ma trận Chuyên đề
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'ALL', label: `Tất cả (${knowledgeProfile.topics.length})` },
                          { id: 'WEAK', label: `Yếu (${knowledgeProfile.groupedTopics.weak.length})` },
                          { id: 'REVIEW', label: `Cần ôn (${knowledgeProfile.groupedTopics.review.length})` },
                          { id: 'MASTERED', label: `Vững (${knowledgeProfile.groupedTopics.mastered.length})` },
                          { id: 'UNTESTED', label: `Chưa làm (${knowledgeProfile.groupedTopics.untested.length})` },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTopicFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            topicFilter === tab.id
                              ? 'bg-[#00B8DD] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(topicFilter === 'ALL'
                      ? knowledgeProfile.topics
                      : knowledgeProfile.topics.filter((t) => t.masteryStatus === topicFilter)
                    )
                      .filter((t) => {
                        const q = roadmapSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          t.topicTag.toLowerCase().includes(q) ||
                          t.chapterName.toLowerCase().includes(q) ||
                          t.topTraps.some((tr) => tr.trapTag.toLowerCase().includes(q))
                        );
                      })
                      .map((topic: TopicMasteryItem) => {
                        const statusMeta =
                          topic.masteryStatus === 'WEAK'
                            ? { label: 'Lỗ hổng', dotClass: 'bg-rose-500' }
                            : topic.masteryStatus === 'REVIEW'
                            ? { label: 'Cần ôn', dotClass: 'bg-amber-500' }
                            : topic.masteryStatus === 'MASTERED'
                            ? { label: 'Đã vững', dotClass: 'bg-[#00B8DD]' }
                            : { label: 'Chưa làm', dotClass: 'bg-slate-400' };

                        return (
                          <div
                            key={topic.id}
                            className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {topic.chapterName}
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {topic.topicTag}
                                </h4>
                              </div>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                                {statusMeta.label}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                <span>
                                  Đúng {topic.totalCorrect}/{topic.totalAttempted} ({topic.accuracyPercent}%)
                                </span>
                                <span className="font-bold text-[#007D99] dark:text-[#00B8DD] tabular-nums">
                                  {topic.masteryScore}%
                                </span>
                              </div>
                              <Progress
                                value={Math.max(3, topic.masteryScore)}
                                className="h-1.5 bg-slate-200 dark:bg-slate-800"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1 shrink-0">
                                <Gauge className="w-3 h-3 text-[#00B8DD]" />
                                {topic.avgSecondsPerQuestion > 0
                                  ? `${topic.avgSecondsPerQuestion}s/câu`
                                  : 'Chưa có'}
                              </span>
                              {topic.topTraps[0] && (
                                <span className="text-slate-500 dark:text-slate-400 truncate">
                                  Lỗi: {topic.topTraps[0].trapTag}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ===================================================================== */}
      {/* CHẾ ĐỘ 1: BẢN ĐỒ CHÒM SAO TỪNG CHƯƠNG (POSTGRESQL BACKEND)             */}
      {/* ===================================================================== */}
      {activeMode === 'CURRICULUM' && (
        <section className="w-full min-[900px]:h-[min(720px,calc(100dvh-10rem))] min-[900px]:min-h-[560px]">
          <ChapterConstellation
            variant="embedded"
            subjectSlug={selectedSubject === 'ALL' ? 'toan-hoc' : selectedSubject}
            subjectName={selectedSubject === 'ALL' ? 'Toán Học' : subjectInfo.name}
            initialGrade={activeGrade}
            onRequestAuth={() => {
              setGatedLevelName('Lưu tiến độ lộ trình chuyên đề');
              setRequireLoginOpen(true);
            }}
            onStartPractice={(payload) => {
              const diffMap: Record<string, string> = {
                BASIC: 'EASY',
                MEDIUM: 'MEDIUM',
                ADVANCED: 'HARD',
              };
              const levelLabelMap: Record<string, string> = {
                BASIC: 'Cơ bản',
                MEDIUM: 'Trung bình',
                ADVANCED: 'Nâng cao',
              };
              const examRoomUrl = `/student/practice/exam-room?subject=${payload.subjectSlug}&level=${payload.level.toLowerCase()}&grade=${payload.grade}&chapter=${payload.chapterId}&track=${payload.track}&format=quiz&duration=${payload.durationMinutes}&quizCount=${payload.questionCount}&count=${payload.questionCount}&practiceMode=TOPIC&difficulty=${diffMap[payload.level] || 'ALL'}`;
              void handleStartPracticeExam(
                examRoomUrl,
                `${payload.chapterName} (${levelLabelMap[payload.level] || payload.level})`
              );
            }}
          />
        </section>
      )}

      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={gatedLevelName}
      />
      <OutOfPointsModal
        isOpen={outOfPointsModal.isOpen}
        onClose={() => setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }))}
        currentPoints={outOfPointsModal.currentPoints}
        requiredPoints={outOfPointsModal.requiredPoints}
        levelLabel={outOfPointsModal.levelLabel}
      />
      <PendingSubjectModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        subjectName={pendingSubjectName}
        onSelectSubject={handlePendingModalSelect}
      />
    </div>
  );
}
