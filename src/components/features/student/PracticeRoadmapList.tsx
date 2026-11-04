'use client';

import * as React from 'react';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { PendingSubjectModal } from '@/components/features/student/practice/PendingSubjectModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { NgocIcon } from '@/components/ui/point-icons';

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
    description: 'Điều kiện a² + b² ≥ c² và phương pháp chia cả 2 tế cho √(a² + b²).',
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

import { PracticeRoadmapSkeleton } from '@/components/skeletons/page-skeletons';

export function PracticeRoadmapList({
  currentSubjectSlug = 'toan-hoc',
  currentLevelSlug = 'lop-11',
}: PracticeRoadmapListProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState(currentSubjectSlug);
  const [selectedLevel, setSelectedLevel] = React.useState(currentLevelSlug);
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [gatedLevelName, setGatedLevelName] = React.useState('');
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);
  const [pendingSubjectName, setPendingSubjectName] = React.useState('Môn học');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <PracticeRoadmapSkeleton />;
  }

  const subjectInfo =
    MOCK_SUBJECTS.find((s) => s.slug === selectedSubject) || MOCK_SUBJECTS[0];
  const levelInfo =
    MOCK_LEVELS.find((l) => l.slug === selectedLevel) || MOCK_LEVELS[1];

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

  return (
    <div className="space-y-6">
      {/* GUEST TRIAL BANNER */}
      {selectedLevel === 'basic' && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              <strong>Chế độ xem thử:</strong> Đang làm thử cấp độ Cơ bản. Đăng nhập để lưu tiến độ và xem lại kết quả.
            </span>
          </div>
          <Link href="/login/student" className="shrink-0">
            <Button size="sm" variant="outline" className="text-xs font-semibold rounded-lg h-8">
              Đăng nhập ngay
            </Button>
          </Link>
        </div>
      )}

      {/* 1. FILTER & HEADER SECTION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{subjectInfo.icon}</span> Lộ trình bài luyện {subjectInfo.name} - {levelInfo.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Làm lần lượt từng bài tập từ cơ bản đến nâng cao để rèn luyện kỹ năng giải đề.
            </p>
          </div>

          {/* Overall Progress Stats */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Tiến độ bài học</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{overallProgress}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({completedLessonsCount}/{totalLessons} bài)</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-xs">
              <span className="text-[11px] text-slate-400 block">Tích lũy</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">+{completedLessonsCount * 50} điểm</span>
            </div>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Subject Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              Môn học:
            </span>
            {MOCK_SUBJECTS.map((subj) => {
              const isSelected = selectedSubject === subj.slug;
              const isPending = subj.status === 'PENDING';
              return (
                <button
                  key={subj.slug}
                  onClick={() => handleSubjectClick(subj)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* 2. ROADMAP TIMELINE LIST (BÀI 01 -> BÀI N) */}
      <section className="relative space-y-4">
        <div className="space-y-4 relative z-10">
          {currentLessons.map((lesson, index) => {
            const isLocked = lesson.status === 'LOCKED';
            const isCompleted = lesson.status === 'COMPLETED';
            const targetUrl = `/student/practice/${selectedSubject}/${selectedLevel}/${lesson.id}`;

            return (
              <Card
                key={lesson.id}
                className={`p-5 sm:p-6 rounded-2xl transition-all border ${
                  isCompleted
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    : isLocked
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-800/60 ring-1 ring-sky-500/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Lesson Info & Timeline Node */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Node Icon Circle */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : isLocked
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                          : 'bg-sky-600 text-white shadow-xs'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-lg">
                          {lesson.number}
                        </span>
                        {isCompleted && (
                          <Badge variant="success" className="text-[10px]">
                            Đã Hoàn Thành
                          </Badge>
                        )}
                        {!isCompleted && !isLocked && (
                          <Badge variant="primary" className="text-[10px]">
                            Đang Học
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="secondary" className="text-[10px] text-slate-500 dark:text-slate-400">
                            Chưa Mở Khóa
                          </Badge>
                        )}
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 ml-auto sm:ml-0">
                          <NgocIcon className="w-3.5 h-3.5" /> +{lesson.rewardDiamonds}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                        {lesson.description}
                      </p>

                      {/* Lesson Progress Bar */}
                      <div className="pt-2 max-w-md space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ bài học</span>
                          <span
                            className={`font-bold ${
                              isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-300'
                            }`}
                          >
                            {lesson.progressPercent}%
                          </span>
                        </div>
                        <Progress value={lesson.progressPercent} className="h-2 bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </div>
                  </div>

                  {/* Right: 4 Mini-Badges & Action Button */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                    {/* 4 Mini-Badges Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-xs w-full sm:w-auto">
                      {/* Mini-badge 1: Lý thuyết */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
                          lesson.badges.theory.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Lý thuyết"
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold text-[11px]">
                          Lý thuyết: {lesson.badges.theory.label}
                        </span>
                      </div>

                      {/* Mini-badge 2: Trắc nghiệm */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
                          lesson.badges.quiz.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Trắc nghiệm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold text-[11px]">
                          Trắc nghiệm: {lesson.badges.quiz.score}
                        </span>
                      </div>

                      {/* Mini-badge 3: Tự luận */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
                          lesson.badges.essay.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Tự luận"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold text-[11px]">
                          Tự luận: {lesson.badges.essay.label}
                        </span>
                      </div>

                      {/* Mini-badge 4: Bài thi */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
                          lesson.badges.exam.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                            : lesson.badges.exam.locked
                            ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300'
                        }`}
                        title="Bài thi"
                      >
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold text-[11px]">
                          Bài thi:{' '}
                          {lesson.badges.exam.completed
                            ? lesson.badges.exam.score
                            : lesson.badges.exam.locked
                            ? 'Khóa'
                            : 'Chưa làm'}
                        </span>
                      </div>
                    </div>

                    {/* Action Link Button */}
                    <Link href={isLocked ? '#' : targetUrl} className="w-full sm:w-auto">
                      <Button
                        variant={isCompleted ? 'outline' : isLocked ? 'secondary' : 'primary'}
                        disabled={isLocked}
                        rightIcon={isLocked ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        className="w-full sm:w-auto px-5"
                      >
                        {isCompleted ? 'Ôn Tập Lại' : isLocked ? 'Chưa Mở Khóa' : 'Vào Luyện Tập'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={gatedLevelName}
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
