'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Dna,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  RotateCcw,
  Scale,
  Sparkles,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { K12_SUBJECTS } from '@/services/mock/data';
import { K12Subject } from '@/types/subject';
import { LevelSelectionModal } from '@/components/features/student/practice/LevelSelectionModal';
import { PendingSubjectModal } from '@/components/features/student/practice/PendingSubjectModal';
import { GradeOnboardingModal } from '@/components/features/student/practice/GradeOnboardingModal';
import { RequireLoginModal, RequireLoginReason } from '@/components/features/auth/RequireLoginModal';
import { useAuthStore } from '@/store/auth.store';
import {
  getCurrentSchoolSemester,
  getGuestOnboarding,
  GuestOnboardingState,
  parseHighSchoolGrade,
} from '@/lib/semester-utils';
import { buildTopicRoadmapHref } from '@/lib/topic-route-utils';
import { cn } from '@/lib/utils';

// Icon môn học nhẹ nhàng
const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-5 h-5 text-sky-600" />,
  BookOpen: <BookOpen className="w-5 h-5 text-rose-500" />,
  Languages: <Languages className="w-5 h-5 text-amber-500" />,
  Atom: <Atom className="w-5 h-5 text-indigo-500" />,
  FlaskConical: <FlaskConical className="w-5 h-5 text-emerald-500" />,
  Dna: <Dna className="w-5 h-5 text-teal-500" />,
  Landmark: <Landmark className="w-5 h-5 text-orange-500" />,
  Globe: <Globe className="w-5 h-5 text-blue-500" />,
  Scale: <Scale className="w-5 h-5 text-purple-500" />,
  Cpu: <Cpu className="w-5 h-5 text-cyan-600" />,
  Wrench: <Wrench className="w-5 h-5 text-slate-500" />,
  Sparkles: <Sparkles className="w-5 h-5 text-emerald-600" />,
};

// 3 cấp độ bài tập gần gũi
const PRACTICE_LEVELS_LIST = [
  {
    level: 'CƠ BẢN',
    name: 'Sách giáo khoa',
    desc: 'Lý thuyết cốt lõi, công thức và dạng bài tập cơ bản giúp bạn nắm chắc kiến thức nền tảng.',
    badge: '3 Tia Sáng / đề',
    isFree: true,
  },
  {
    level: 'VỪA SỨC',
    name: 'Ôn thi học kỳ',
    desc: 'Bài tập thông hiểu và vận dụng bám sát đề thi giữa kỳ, cuối kỳ và tốt nghiệp THPT.',
    badge: '4 Tia Sáng / đề',
    isFree: true,
  },
  {
    level: 'NÂNG CAO',
    name: 'Vận dụng cao (9 - 10 điểm)',
    desc: 'Các bài toán biến tấu, rèn luyện tư duy logic và kỹ năng giải nhanh dạng bài phân loại.',
    badge: '9 Tia Sáng / đề',
    isFree: false,
  },
];

// 3 bước làm bài đơn giản
const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Chọn môn học & chế độ luyện',
    desc: 'Chọn môn học, sau đó chọn Luyện theo chuyên đề từng chương hoặc Thi thử tổng hợp.',
    icon: BookOpen,
  },
  {
    step: '2',
    title: 'Làm bài trực tiếp',
    desc: 'Trắc nghiệm chọn đáp án, đúng/sai, điền số hoặc viết code có chấm điểm tự động.',
    icon: Zap,
  },
  {
    step: '3',
    title: 'Xem lời giải & làm lại câu sai',
    desc: 'Xem giải thích chi tiết cho từng câu và làm lại các câu chưa đúng để nhớ lâu hơn.',
    icon: RotateCcw,
  },
];

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'Trần Hoàng Nam', school: 'THPT Chuyên Hà Nội - Amsterdam', points: 1250 },
  { rank: 2, name: 'Nguyễn Hoàng Minh', school: 'THPT Chuyên TP. Hồ Chí Minh', points: 980 },
  { rank: 3, name: 'Lê Thu Thảo', school: 'THPT Chu Văn An', points: 920 },
];

export default function LuyenThiPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const isLoggedIn = Boolean(isAuthenticated && user?.id);
  const [contactSubmitted, setContactSubmitted] = React.useState(false);

  // Practice Subjects State
  const [activeCategory, setActiveCategory] = React.useState('ALL');
  const [isChangingCategory, setIsChangingCategory] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<K12Subject | null>(null);
  const [isLevelModalOpen, setIsLevelModalOpen] = React.useState(false);
  const [levelModalInitialMode, setLevelModalInitialMode] = React.useState<'TOPIC' | 'MOCK_EXAM' | undefined>(
    undefined
  );

  // Guest Try-First Onboarding State
  const [guestState, setGuestState] = React.useState<GuestOnboardingState | null>(null);
  const [guestOnboardingOpen, setGuestOnboardingOpen] = React.useState(false);
  const [pendingSubjectAfterOnboarding, setPendingSubjectAfterOnboarding] =
    React.useState<K12Subject | null>(null);
  const semesterInfo = React.useMemo(() => getCurrentSchoolSemester(), []);

  React.useEffect(() => {
    const syncGuest = () => setGuestState(getGuestOnboarding());
    syncGuest();
    window.addEventListener('schoolify-guest-onboarding-updated', syncGuest);
    window.addEventListener('storage', syncGuest);
    return () => {
      window.removeEventListener('schoolify-guest-onboarding-updated', syncGuest);
      window.removeEventListener('storage', syncGuest);
    };
  }, []);

  // Tự động mở modal Thi thử tổng hợp nếu điều hướng từ trang chuyên đề (/luyen-thi?subject=toan-hoc&mode=mock)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const subjSlug = params.get('subject');
    if (mode === 'mock' && subjSlug) {
      const matched = K12_SUBJECTS.find((s) => s.slug === subjSlug && s.status === 'ACTIVE');
      if (matched) {
        setSelectedSubject(matched);
        setLevelModalInitialMode('MOCK_EXAM');
        setIsLevelModalOpen(true);
      }
    }
  }, []);

  const activeUserGrade = React.useMemo(() => {
    if (isLoggedIn) {
      return parseHighSchoolGrade(user?.student_profile?.grade_level);
    }
    return guestState?.grade ?? null;
  }, [isLoggedIn, user?.student_profile?.grade_level, guestState?.grade]);

  const handleCategoryChange = (catId: string) => {
    if (catId === activeCategory) return;
    setIsChangingCategory(true);
    setActiveCategory(catId);
    setTimeout(() => {
      setIsChangingCategory(false);
    }, 180);
  };

  // Require Login Modal State
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [loginReason, setLoginReason] = React.useState<RequireLoginReason>('GENERAL');
  const [targetLevelName, setTargetLevelName] = React.useState<string>('');

  const categoryTabs = [
    { id: 'ALL', label: 'Tất cả môn' },
    { id: 'NATURAL', label: 'Khoa học tự nhiên' },
    { id: 'SOCIAL', label: 'Khoa học xã hội' },
    { id: 'LANGUAGE', label: 'Ngoại ngữ' },
    { id: 'TECH', label: 'Tin học & Công nghệ' },
  ];

  const filteredSubjects = React.useMemo(() => {
    const list =
      activeCategory === 'ALL'
        ? [...K12_SUBJECTS]
        : K12_SUBJECTS.filter((s) => s.category === activeCategory);

    // Ưu tiên hiển thị các môn đang khả dụng (ACTIVE - Đang mở đề) lên đầu tiên
    return list.sort((a, b) => {
      const aActive = a.status === 'ACTIVE' ? 1 : 0;
      const bActive = b.status === 'ACTIVE' ? 1 : 0;
      return bActive - aActive;
    });
  }, [activeCategory]);

  // Pending Subject Modal State
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);
  const [pendingSubjectName, setPendingSubjectName] = React.useState<string>('Môn học');

  const handleOpenSubjectLevels = (subject: K12Subject, preferredMode?: 'TOPIC' | 'MOCK_EXAM') => {
    if (subject.status === 'PENDING') {
      setPendingSubjectName(subject.name);
      setIsPendingModalOpen(true);
      return;
    }

    if (preferredMode === 'TOPIC') {
      router.push(buildTopicRoadmapHref(subject.slug, { grade: activeUserGrade ?? undefined }));
      return;
    }

    if (!isLoggedIn) {
      const guest = getGuestOnboarding();
      if (!guest) {
        setPendingSubjectAfterOnboarding(subject);
        setGuestOnboardingOpen(true);
        return;
      }
    }

    setLevelModalInitialMode(preferredMode);
    setSelectedSubject(subject);
    setIsLevelModalOpen(true);
  };

  const handlePendingModalSelect = (slug: 'toan-hoc' | 'tin-hoc') => {
    setIsPendingModalOpen(false);
    const target = K12_SUBJECTS.find((s) => s.slug === slug);
    if (target) {
      handleOpenSubjectLevels(target);
    }
  };

  const handleLevelCardClick = (levelItem: (typeof PRACTICE_LEVELS_LIST)[0]) => {
    if (!isLoggedIn && !levelItem.isFree) {
      setTargetLevelName(levelItem.name);
      setLoginReason('ADVANCED_LEVEL');
      setRequireLoginOpen(true);
      return;
    }
    router.push('/luyen-thi/chuyen-de/toan');
  };

  const handleLeaderboardClick = () => {
    setLoginReason('LEADERBOARD');
    setRequireLoginOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-sky-100 selection:text-slate-900 transition-colors">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HEADER & GIỚI THIỆU CHÍNH                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 pt-8 pb-10 sm:pt-12 sm:pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Luyện thi</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Luyện thi trực tuyến
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Rèn luyện kỹ năng làm bài thi theo lộ trình từng chương chuẩn GDPT 2018.
              Bạn có thể bắt đầu ngay với cấp độ <strong>Cơ bản</strong> hoàn toàn miễn phí.
            </p>

            {/* Thanh trạng thái Lớp & Kỳ học thời gian thực */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/25">
                <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                <span>{semesterInfo.badgeText}</span>
              </span>

              {activeUserGrade ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {!isLoggedIn && guestState?.fullname ? `${guestState.fullname} · ` : ''}
                    Lộ trình Lớp {activeUserGrade}
                  </span>
                  {!isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingSubjectAfterOnboarding(null);
                        setGuestOnboardingOpen(true);
                      }}
                      className="ml-1 underline decoration-dotted hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
                    >
                      Đổi lớp
                    </button>
                  )}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPendingSubjectAfterOnboarding(K12_SUBJECTS[0]);
                    setGuestOnboardingOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#00B8DD] transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <span>Chọn lớp để vẽ lộ trình chương (Lớp 10, 11, 12)</span>
                </button>
              )}
            </div>
          </div>

          {/* 2 Khối Nổi Bật: Toán Học & Tin Học */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {/* Thẻ Môn Toán */}
            <div
              onClick={() => {
                const toan = K12_SUBJECTS.find((s) => s.slug === 'toan-hoc');
                if (toan) handleOpenSubjectLevels(toan);
              }}
              className="p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-800 transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    Ngân hàng 12.500+ câu hỏi
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                  Môn Toán Học
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Luyện tập trắc nghiệm, đúng/sai, điền số, hình không gian và đại số.
                  Có tích hợp máy tính Casio và phòng làm lại câu sai không giới hạn thời gian.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-200/60 dark:border-sky-900/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Từ lớp 1 đến lớp 12</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400 group-hover:translate-x-0.5 transition-all">
                  Làm bài môn Toán <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Thẻ Môn Tin Học */}
            <div
              onClick={() => {
                const tin = K12_SUBJECTS.find((s) => s.slug === 'tin-hoc');
                if (tin) handleOpenSubjectLevels(tin);
              }}
              className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Ngân hàng 4.200+ câu hỏi
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Môn Tin Học
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Thực hành lập trình Python &amp; C++, giải thuật toán, duyệt mảng, đệ quy
                  và quy hoạch động kèm hệ thống chấm testcase tự động.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Python • C++ • Thuật toán</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-all">
                  Làm bài môn Tin <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. DANH SÁCH TOÀN BỘ MÔN HỌC                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="kho-mon-hoc" className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Danh sách các môn học
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Nhấp vào môn học để chọn chế độ luyện chuyên đề hoặc thi thử.
              </p>
            </div>

            {/* Bộ lọc loại môn */}
            <div className="self-start sm:self-auto">
              <Tabs
                tabs={categoryTabs}
                activeTab={activeCategory}
                onChange={handleCategoryChange}
                className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs"
              />
            </div>
          </div>

          {/* Grid môn học */}
          {isChangingCategory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-1/2 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSubjects.map((subject) => {
                const icon = SUBJECT_ICON_MAP[subject.iconName] || (
                  <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                );
                const isActive = subject.status === 'ACTIVE';

                return (
                  <Card
                    key={subject.id}
                    onClick={() => handleOpenSubjectLevels(subject)}
                    className={cn(
                      'group p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-150 cursor-pointer flex flex-col justify-between rounded-xl',
                      isActive ? 'ring-1 ring-sky-500/10 dark:ring-sky-500/20' : 'opacity-90'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                          {icon}
                        </div>
                        {isActive ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Đang mở đề
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Sắp ra mắt
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed min-h-[2.2rem]">
                        {subject.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 dark:text-slate-500">
                        {isActive
                          ? `${(subject.totalQuestions || subject.totalExams * 50).toLocaleString('vi-VN')}+ câu hỏi`
                          : 'Đang số hóa'}
                      </span>
                      <span
                        className={cn(
                          'font-semibold flex items-center gap-0.5',
                          isActive ? 'text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300' : 'text-slate-400 dark:text-slate-500'
                        )}
                      >
                        {isActive ? 'Làm bài' : 'Xem thêm'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. BỐN MỨC ĐỘ BÀI TẬP                                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Mức độ bài tập phù hợp từng học sinh
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Bạn có thể bắt đầu với mức độ vừa sức, sau đó nâng dần độ khó khi đã tự tin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRACTICE_LEVELS_LIST.map((lvl) => (
              <Card
                key={lvl.level}
                onClick={() => handleLevelCardClick(lvl)}
                className="p-5 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-150 rounded-xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {lvl.level}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                        lvl.isFree
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      )}
                    >
                      {lvl.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{lvl.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{lvl.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    {isLoggedIn ? 'Sẵn sàng tạo đề' : 'Yêu cầu đăng nhập'}
                  </span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                    {isLoggedIn ? 'Tạo đề ngay' : 'Đăng nhập'} →
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. CÁCH THỨC LÀM BÀI 3 BƯỚC                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-50/40 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Quy trình làm bài dễ hiểu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Chỉ 3 bước đơn giản để rèn luyện và tiến bộ mỗi ngày
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-bold flex items-center justify-center text-sm border border-transparent dark:border-sky-800">
                      {item.step}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. BẢNG XẾP HẠNG & HỖ TRỢ HỌC SINH                           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Cột trái: Bảng xếp hạng tuần */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Bảng thi đua tuần này
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Cập nhật mỗi tuần</span>
              </div>

              <div className="space-y-2">
                {LEADERBOARD_PREVIEW.map((item) => (
                  <div
                    key={item.rank}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-extrabold text-slate-700 dark:text-slate-300 w-5 text-center">
                        #{item.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.school}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
                      {item.points} điểm
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLeaderboardClick}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold cursor-pointer"
                >
                  Đăng nhập để xem vị trí của bạn trên bảng xếp hạng →
                </button>
              </div>
            </div>

            {/* Cột phải: Form hỏi đáp & hỗ trợ */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Cần hỗ trợ hoặc góp ý đề thi?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Thầy cô luôn sẵn sàng giải đáp thắc mắc về lời giải và bài tập.
                </p>
              </div>

              {contactSubmitted ? (
                <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Cảm ơn bạn! Thầy cô đã nhận được thông tin và sẽ phản hồi sớm.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Họ và tên hoặc tên lớp
                    </label>
                    <Input
                      required
                      placeholder="Ví dụ: Hoàng Long - Lớp 11A"
                      className="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-xs dark:text-white dark:placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Số điện thoại hoặc Zalo
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="0912 345 678"
                      className="bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-xs dark:text-white dark:placeholder-slate-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs rounded-xl py-2.5 min-h-[44px]"
                  >
                    Gửi yêu cầu hỗ trợ
                  </Button>
                </form>
              )}

              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-4">
                <span>Hotline: <strong className="text-slate-800 dark:text-slate-200">028 7300 8888</strong></span>
                <span>Email: <strong className="text-slate-800 dark:text-slate-200">hotro@schoolify.edu.vn</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* CÁC CỬA SỔ MODAL (CHỌN CHẾ ĐỘ & CẤP ĐỘ, PENDING, ĐĂNG NHẬP) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <LevelSelectionModal
        isOpen={isLevelModalOpen}
        onClose={() => {
          setIsLevelModalOpen(false);
          setLevelModalInitialMode(undefined);
        }}
        subject={selectedSubject}
        isLoggedIn={isLoggedIn}
        initialMode={levelModalInitialMode}
      />

      <GradeOnboardingModal
        isOpen={guestOnboardingOpen}
        mode="GUEST_TRIAL"
        subjectName={pendingSubjectAfterOnboarding?.name}
        onClose={() => {
          setGuestOnboardingOpen(false);
          setPendingSubjectAfterOnboarding(null);
        }}
        onCompleted={(result) => {
          setGuestOnboardingOpen(false);
          setGuestState(getGuestOnboarding());
          if (pendingSubjectAfterOnboarding) {
            const targetHref = buildTopicRoadmapHref(
              pendingSubjectAfterOnboarding.slug,
              { grade: result.grade },
            );
            setPendingSubjectAfterOnboarding(null);
            router.push(targetHref);
          }
        }}
      />

      <PendingSubjectModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        subjectName={pendingSubjectName}
        onSelectSubject={handlePendingModalSelect}
      />

      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason={loginReason}
        targetLevelName={targetLevelName}
        onContinueGuest={() => {
          setRequireLoginOpen(false);
          const el = document.getElementById('kho-mon-hoc');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
