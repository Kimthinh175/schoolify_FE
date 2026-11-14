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
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Lock,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { NgocIcon } from '@/components/ui/point-icons';
import { PracticeRoadmapSkeleton } from '@/components/skeletons/page-skeletons';
import {
  knowledgeProfileService,
  KNOWLEDGE_PROFILE_UPDATED_EVENT,
  PersonalizedRoadmapResponse,
} from '@/services/knowledge-profile.service';
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
    essay: { completed: boolean; label: string };
    exam: { completed: boolean; score?: string; locked?: boolean };
  };
}

export const MOCK_SUBJECTS: {
  slug: string;
  name: string;
  icon: string;
  count: number;
  status: 'ACTIVE' | 'PENDING';
}[] = [
  { slug: 'toan-hoc', name: 'Toán Học', icon: '📐', count: 180, status: 'ACTIVE' },
  { slug: 'tin-hoc', name: 'Tin Học', icon: '💻', count: 90, status: 'ACTIVE' },
  { slug: 'vat-ly', name: 'Vật Lý', icon: '⚡', count: 10, status: 'PENDING' },
  { slug: 'hoa-hoc', name: 'Hóa Học', icon: '🧪', count: 10, status: 'PENDING' },
  { slug: 'tieng-anh', name: 'Tiếng Anh', icon: '🇬🇧', count: 15, status: 'PENDING' },
  { slug: 'ngu-van', name: 'Ngữ Văn', icon: '📚', count: 8, status: 'PENDING' },
  { slug: 'sinh-hoc', name: 'Sinh Học', icon: '🧬', count: 8, status: 'PENDING' },
];

export const MOCK_LEVELS = [
  { slug: 'basic', name: '1. Cơ Bản', isFree: true },
  { slug: 'medium', name: '2. Trung Bình', isFree: true },
  { slug: 'advanced', name: '3. Nâng Cao', isFree: false },
  { slug: 'provincial_excellent', name: '4. HSG Tỉnh', isFree: false },
  { slug: 'national_excellent', name: '5. HSG Quốc Gia', isFree: false },
  { slug: 'lop-10', name: 'Lớp 10', isFree: true },
  { slug: 'lop-11', name: 'Lớp 11', isFree: true },
  { slug: 'lop-12', name: 'Lớp 12', isFree: true },
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
      essay: { completed: true, label: 'Đã nộp' },
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
      essay: { completed: true, label: 'Đã nộp' },
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
      essay: { completed: false, label: 'Chưa nộp' },
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
      essay: { completed: false, label: 'Chưa nộp' },
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
      essay: { completed: false, label: 'Chưa nộp' },
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
      essay: { completed: true, label: 'Đã nộp' },
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
      essay: { completed: true, label: 'Đã nộp' },
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
      essay: { completed: false, label: 'Chưa nộp' },
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
      essay: { completed: false, label: 'Chưa nộp' },
      exam: { completed: false, locked: true },
    },
  },
  {
    id: 'lesson-05',
    number: 'Bài 05',
    title: 'Ôn Tập Chương Lượng Giác & Đề Thi Mẫu',
    description: 'Tổng hợp câu hỏi trắc nghiệm và tự luận phân hóa cao chuẩn cấu trúc đề thi THPT.',
    progressPercent: 0,
    rewardDiamonds: 100,
    status: 'LOCKED',
    badges: {
      theory: { completed: false, label: 'Chưa học' },
      quiz: { completed: false, score: '0/10', total: 10 },
      essay: { completed: false, label: 'Chưa nộp' },
      exam: { completed: false, locked: true },
    },
  },
];

interface PracticeRoadmapListProps {
  currentSubjectSlug?: string;
  currentLevelSlug?: string;
}

function resolveGradeFromLevelSlug(levelSlug: string): number {
  if (levelSlug === 'lop-10') return 10;
  if (levelSlug === 'lop-11') return 11;
  return 12;
}

export function PracticeRoadmapList({
  currentSubjectSlug = 'toan-hoc',
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
  const [selectedLevel, setSelectedLevel] = React.useState(() => {
    const profileGrade = parseHighSchoolGrade(user?.student_profile?.grade_level);
    if (profileGrade && currentLevelSlug === 'lop-12') {
      return `lop-${profileGrade}`;
    }
    return currentLevelSlug;
  });
  const [activeMode, setActiveMode] = React.useState<'ADAPTIVE' | 'CURRICULUM'>('CURRICULUM');
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
    const urlLevelMatch = practiceUrl.match(/[?&]level=([^&]+)/i);
    const rawLevel = urlLevelMatch ? urlLevelMatch[1] : 'BASIC';

    if (!isLoggedIn) {
      const guest = getGuestOnboarding();
      const canGuestTry =
        Boolean(guest) &&
        (guest?.trialUsedCount ?? 0) < 1 &&
        String(rawLevel).toUpperCase() === 'BASIC';
      if (canGuestTry) {
        router.push(practiceUrl);
        return;
      }
      setGatedLevelName(title || 'Đề luyện thi cá nhân hóa');
      setRequireLoginOpen(true);
      return;
    }

    if (isAdmin) {
      router.push(practiceUrl);
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

  // State cho Lộ trình Cá nhân hóa từ Backend PostgreSQL
  const [adaptiveData, setAdaptiveData] = React.useState<PersonalizedRoadmapResponse | null>(null);
  const [adaptiveLoading, setAdaptiveLoading] = React.useState(true);
  const [adaptiveError, setAdaptiveError] = React.useState<string | null>(null);

  const activeGrade =
    parseHighSchoolGrade(user?.student_profile?.grade_level) &&
    !['lop-10', 'lop-11', 'lop-12'].includes(selectedLevel)
      ? (parseHighSchoolGrade(user?.student_profile?.grade_level) as number)
      : resolveGradeFromLevelSlug(selectedLevel);

  const fetchAdaptiveRoadmap = React.useCallback(async () => {
    setAdaptiveLoading(true);
    setAdaptiveError(null);
    try {
      const data = await knowledgeProfileService.getPersonalizedRoadmap({
        subject: selectedSubject,
        grade: activeGrade,
      });
      setAdaptiveData(data);
    } catch (err: any) {
      setAdaptiveError(err?.message || 'Không thể tải lộ trình cá nhân hóa từ máy chủ');
    } finally {
      setAdaptiveLoading(false);
    }
  }, [selectedSubject, activeGrade]);

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
    MOCK_SUBJECTS.find((s) => s.slug === selectedSubject) || MOCK_SUBJECTS[0];
  const levelInfo =
    MOCK_LEVELS.find((l) => l.slug === selectedLevel) || MOCK_LEVELS[0];

  const handleSubjectClick = (subj: (typeof MOCK_SUBJECTS)[0]) => {
    if (subj.status === 'PENDING') {
      setPendingSubjectName(subj.name);
      setIsPendingModalOpen(true);
      return;
    }
    setSelectedSubject(subj.slug);
    router.push(`/student/practice/${subj.slug}/${selectedLevel}`);
  };

  const handlePendingModalSelect = (slug: 'toan-hoc' | 'tin-hoc') => {
    setIsPendingModalOpen(false);
    setSelectedSubject(slug);
    router.push(`/student/practice/${slug}/${selectedLevel}`);
  };

  const handleLevelChange = (slug: string) => {
    const targetLvl = MOCK_LEVELS.find((l) => l.slug === slug);
    if (targetLvl && !targetLvl.isFree) {
      setGatedLevelName(targetLvl.name);
      setRequireLoginOpen(true);
      return;
    }
    setSelectedLevel(slug);
    router.push(`/student/practice/${selectedSubject}/${slug}`);
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

  return (
    <div className="space-y-6">
      {/* 1. FILTER & HEADER SECTION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00B8DD]/10 text-[#00B8DD] text-xs font-semibold">
                <BrainCircuit className="w-3.5 h-3.5" />
                Cá nhân hóa từ dữ liệu bài thi
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Khối {activeGrade} • {subjectInfo.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>{subjectInfo.icon}</span>
              <span>Hồ sơ Năng lực &amp; Lộ trình Cá nhân hóa {subjectInfo.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Hệ thống tự động thu thập kết quả từng câu hỏi đúng/sai, cấp độ Bloom và bẫy sai lầm để tối ưu lộ trình cho riêng bạn.
            </p>
          </div>

          {/* Mode Toggle Switcher (flex-wrap, Zero Horizontal Scroll) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveMode('CURRICULUM')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                activeMode === 'CURRICULUM'
                  ? 'bg-[#00B8DD] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lộ trình từng chương (Số &amp; Hình)</span>
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

        {/* Filters Controls (flex-wrap, Zero Horizontal Scroll) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Subject Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              Môn học:
            </span>
            {MOCK_SUBJECTS.map((subj) => {
              const isSelected = selectedSubject === subj.slug;
              const isPending = subj.status === 'PENDING';
              return (
                <button
                  key={subj.slug}
                  type="button"
                  onClick={() => handleSubjectClick(subj)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : isPending
                      ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-700/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{subj.icon}</span>
                  <span>{subj.name}</span>
                  {isPending && (
                    <span className="text-[9px] font-normal px-1.5 py-0.2 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Sắp có
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Level Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start sm:self-auto">
            {MOCK_LEVELS.map((lvl) => (
              <button
                key={lvl.slug}
                type="button"
                onClick={() => handleLevelChange(lvl.slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedLevel === lvl.slug
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CHẾ ĐỘ 1: HỒ SƠ KIẾN THỨC & LỘ TRÌNH CÁ NHÂN HÓA (POSTGRESQL BACKEND) */}
      {/* ===================================================================== */}
      {activeMode === 'ADAPTIVE' && (
        <div className="space-y-6">
          {adaptiveLoading ? (
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
              {/* KHỐI 1: THỐNG KÊ HỒ SƠ KIẾN THỨC TÍCH LŨY (4 CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Điểm thành thạo tích lũy</span>
                    <TrendingUp className="w-4 h-4 text-[#00B8DD]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {summary.overallMasteryScore}%
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      ({summary.countsByStatus.mastered}/{summary.countsByStatus.totalCurriculumTopics} chuyên đề vững)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#00B8DD] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, summary.overallMasteryScore)}%` }}
                    />
                  </div>
                </Card>

                <Card className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Tỉ lệ đúng từ các đề đã làm</span>
                    <Target className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {summary.overallAccuracyPercent}%
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      ({summary.totalCorrect}/{summary.totalQuestionsAttempted} câu • {summary.totalExamsSubmitted} đề)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sai {summary.totalWrong} câu • Tốc độ TB: {summary.avgSecondsPerQuestion || 30}s/câu
                  </p>
                </Card>

                <Card className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Phân loại chuyên đề</span>
                    <BrainCircuit className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50">
                      Lỗ hổng: {summary.countsByStatus.weak}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50">
                      Cần ôn: {summary.countsByStatus.review}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
                      Vững: {summary.countsByStatus.mastered}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Còn {summary.countsByStatus.untested} chuyên đề chưa khảo sát
                  </p>
                </Card>

                <Card className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Năng lực theo cấp độ Bloom</span>
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  {bloomStats && (
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-xs">
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Nhận biết</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {bloomStats.NHAN_BIET.accuracy}%
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Thông hiểu</span>
                        <span className="font-bold text-[#00B8DD]">
                          {bloomStats.THONG_HIEU.accuracy}%
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Vận dụng</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {bloomStats.VAN_DUNG.accuracy}%
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">VDC (9+)</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {bloomStats.VAN_DUNG_CAO.accuracy}%
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* KHỐI 2: ĐỀ XUẤT ƯU TIÊN SỐ 1 HÔM NAY + CẢNH BÁO BẪY HAY MẮC */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {primaryRec && (
                  <Card className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#00B8DD]/10 via-white to-white dark:from-[#00B8DD]/15 dark:via-slate-900 dark:to-slate-900 border border-[#00B8DD]/40 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00B8DD] text-white">
                          Đề xuất ưu tiên hôm nay
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {primaryRec.chapterName}
                        </span>
                        <span className="text-xs text-slate-500">
                          • {primaryRec.questionCount} câu ({primaryRec.durationMinutes} phút)
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {primaryRec.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {primaryRec.diagnosticReason}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          Độ thành thạo hiện tại:{' '}
                          <strong className="text-slate-900 dark:text-white">
                            {primaryRec.currentMastery}%
                          </strong>
                        </span>
                        <span>→</span>
                        <span>
                          Mục tiêu chặng:{' '}
                          <strong className="text-[#00B8DD]">{primaryRec.targetMastery}%</strong>
                        </span>
                      </div>

                      <Button
                        type="button"
                        onClick={() => void handleStartPracticeExam(primaryRec.practiceUrl, primaryRec.title)}
                        className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold rounded-xl px-5 min-h-[42px] cursor-pointer"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Luyện ngay chặng này
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Bẫy sai lầm học sinh hay mắc nhất */}
                <Card className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Bẫy sai lầm bạn hay mắc nhất
                    </h3>
                  </div>

                  {adaptiveData.frequentTraps.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Chưa phát hiện bẫy sai lầm lặp lại. Hãy tiếp tục làm đề để hệ thống phân tích sâu hơn.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {adaptiveData.frequentTraps.slice(0, 3).map((trap) => (
                        <div
                          key={trap.trapTag}
                          className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 break-words">
                              {trap.trapTag}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold shrink-0">
                              Sai {trap.count} lần
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Chuyên đề: {trap.topicTag}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* KHỐI 3: TIMELINE LỘ TRÌNH CÁ NHÂN HÓA 3 CHẶNG */}
              <div className="space-y-6">
                {adaptiveData.phases.map((phaseGroup) => {
                  const isPhase1 = phaseGroup.phase === 1;
                  const isPhase2 = phaseGroup.phase === 2;
                  return (
                    <section
                      key={phaseGroup.phase}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                isPhase1
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                                  : isPhase2
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                              }`}
                            >
                              {phaseGroup.badge}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                              {phaseGroup.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {phaseGroup.subtitle}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-slate-500 shrink-0">
                          {phaseGroup.steps.length} chuyên đề
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {phaseGroup.steps.map((step) => {
                          const isRecommended = step.status === 'RECOMMENDED';
                          const isCompleted = step.status === 'COMPLETED';
                          const isLocked = step.status === 'LOCKED';

                          return (
                            <div
                              key={step.id}
                              className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                                isRecommended
                                  ? 'border-[#00B8DD] bg-[#00B8DD]/[0.03] dark:bg-[#00B8DD]/[0.06]'
                                  : isCompleted
                                  ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                              }`}
                            >
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    Bước {step.stepOrder}
                                  </span>
                                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {step.chapterName}
                                  </span>
                                  {isRecommended && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00B8DD] text-white">
                                      Khuyên làm ngay
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                                      Đã vững vàng
                                    </span>
                                  )}
                                  <span className="text-xs text-slate-500 ml-auto sm:ml-0">
                                    • {step.questionCount} câu ({step.durationMinutes} phút)
                                  </span>
                                </div>

                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white break-words">
                                  {step.title}
                                </h4>

                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {step.diagnosticReason}
                                </p>

                                {/* Thanh thành thạo hiện tại -> mục tiêu */}
                                <div className="max-w-md pt-1 space-y-1">
                                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>
                                      Đã làm: {step.correctCount}/{step.attemptedCount} câu đúng
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                      Thành thạo: {step.currentMastery}% / Mục tiêu {step.targetMastery}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={Math.max(4, step.currentMastery)}
                                    className="h-1.5 bg-slate-200 dark:bg-slate-800"
                                  />
                                </div>
                              </div>


                              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                <Button
                                  type="button"
                                  onClick={() => void handleStartPracticeExam(step.practiceUrl, step.title)}
                                  variant={isRecommended ? 'primary' : 'outline'}
                                  className={
                                    isRecommended
                                      ? 'bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold rounded-xl min-h-[42px] cursor-pointer'
                                      : 'rounded-xl font-semibold min-h-[42px] cursor-pointer'
                                  }
                                  rightIcon={
                                    isLocked ? (
                                      <Lock className="w-4 h-4" />
                                    ) : (
                                      <ArrowRight className="w-4 h-4" />
                                    )
                                  }
                                >
                                  {step.attemptedCount === 0
                                    ? 'Khảo sát ngay'
                                    : isCompleted
                                    ? 'Luyện nâng cao'
                                    : 'Luyện chuyên đề này'}
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
            subjectSlug={selectedSubject}
            subjectName={subjectInfo.name}
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
