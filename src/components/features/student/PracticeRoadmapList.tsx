'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  Gem,
  Sparkles,
  ChevronRight,
  Lock,
  Play,
  Award,
  Filter,
  BarChart3,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

export const MOCK_SUBJECTS = [
  { slug: 'toan-hoc', name: 'Toán Học', icon: '📐', count: 12 },
  { slug: 'vat-ly', name: 'Vật Lý', icon: '⚡', count: 10 },
  { slug: 'hoa-hoc', name: 'Hóa Học', icon: '🧪', count: 10 },
  { slug: 'tieng-anh', name: 'Tiếng Anh', icon: '🇬🇧', count: 15 },
  { slug: 'ngu-van', name: 'Ngữ Văn', icon: '📚', count: 8 },
];

export const MOCK_LEVELS = [
  { slug: 'lop-10', name: 'Lớp 10' },
  { slug: 'lop-11', name: 'Lớp 11' },
  { slug: 'lop-12', name: 'Lớp 12' },
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

export function PracticeRoadmapList({
  currentSubjectSlug = 'toan-hoc',
  currentLevelSlug = 'lop-11',
}: PracticeRoadmapListProps) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = React.useState(currentSubjectSlug);
  const [selectedLevel, setSelectedLevel] = React.useState(currentLevelSlug);

  const subjectInfo =
    MOCK_SUBJECTS.find((s) => s.slug === selectedSubject) || MOCK_SUBJECTS[0];
  const levelInfo =
    MOCK_LEVELS.find((l) => l.slug === selectedLevel) || MOCK_LEVELS[1];

  const handleSubjectChange = (slug: string) => {
    setSelectedSubject(slug);
    router.push(`/student/practice/${slug}/${selectedLevel}`);
  };

  const handleLevelChange = (slug: string) => {
    setSelectedLevel(slug);
    router.push(`/student/practice/${selectedSubject}/${slug}`);
  };

  const totalLessons = MOCK_ROADMAP_LESSONS.length;
  const completedLessonsCount = MOCK_ROADMAP_LESSONS.filter(
    (l) => l.status === 'COMPLETED'
  ).length;
  const overallProgress = Math.round(
    (MOCK_ROADMAP_LESSONS.reduce((acc, curr) => acc + curr.progressPercent, 0) /
      (totalLessons * 100)) *
      100
  );

  return (
    <div className="space-y-8">
      {/* 1. FILTER & HEADER SECTION */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#00B8DD] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" /> Lộ Trình Học Cá Nhân Hóa
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{subjectInfo.icon}</span> Lộ Trình Luyện Tập {subjectInfo.name} - {levelInfo.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Hoàn thành từng bài luyện theo thứ tự từ Bài 01 đến Bài N để mở khóa phần thưởng Kim Cương.
            </p>
          </div>

          {/* Overall Progress Stats */}
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Tiến độ lộ trình</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#00B8DD]">{overallProgress}%</span>
                <span className="text-xs text-slate-400">({completedLessonsCount}/{totalLessons} bài)</span>
              </div>
            </div>
            <div className="h-9 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/20">
              <Gem className="w-5 h-5 animate-bounce text-amber-400" />
              <div>
                <span className="text-[10px] text-amber-300/80 block leading-tight">Tích lũy</span>
                <span className="text-sm font-bold text-amber-300">+250 💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Subject Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#00B8DD]" /> Môn học:
            </span>
            {MOCK_SUBJECTS.map((subj) => (
              <button
                key={subj.slug}
                onClick={() => handleSubjectChange(subj.slug)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === subj.slug
                    ? 'bg-[#00B8DD] text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.name}</span>
              </button>
            ))}
          </div>

          {/* Level Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
            {MOCK_LEVELS.map((lvl) => (
              <button
                key={lvl.slug}
                onClick={() => handleLevelChange(lvl.slug)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedLevel === lvl.slug
                    ? 'bg-slate-800 text-[#00B8DD] font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ROADMAP TIMELINE LIST (BÀI 01 -> BÀI N) */}
      <section className="relative space-y-6">
        {/* Vertical Connecting Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 via-slate-700 to-slate-800 hidden sm:block z-0" />

        <div className="space-y-6 relative z-10">
          {MOCK_ROADMAP_LESSONS.map((lesson, index) => {
            const isLocked = lesson.status === 'LOCKED';
            const isCompleted = lesson.status === 'COMPLETED';
            const targetUrl = `/student/practice/${selectedSubject}/${selectedLevel}/${lesson.id}`;

            return (
              <Card
                key={lesson.id}
                className={`p-6 rounded-3xl transition-all border ${
                  isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/30 shadow-lg hover:border-emerald-500/50'
                    : isLocked
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-900 border-indigo-500/40 shadow-xl hover:border-indigo-500/70 ring-1 ring-indigo-500/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Lesson Info & Timeline Node */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Node Icon Circle */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm shadow-md ${
                        isCompleted
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                          : isLocked
                          ? 'bg-slate-800 border border-slate-700 text-slate-500'
                          : 'bg-indigo-600 border border-indigo-400 text-white shadow-indigo-500/30'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-emerald-400" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-slate-500" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg">
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
                          <Badge variant="secondary" className="text-[10px] text-slate-400">
                            Chưa Mở Khóa
                          </Badge>
                        )}
                        <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 ml-auto sm:ml-0">
                          <Gem className="w-3.5 h-3.5" /> +{lesson.rewardDiamonds} 💎
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                        {lesson.description}
                      </p>

                      {/* Lesson Progress Bar */}
                      <div className="pt-2 max-w-md space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Tiến độ bài học</span>
                          <span
                            className={`font-bold ${
                              isCompleted ? 'text-emerald-400' : 'text-indigo-300'
                            }`}
                          >
                            {lesson.progressPercent}%
                          </span>
                        </div>
                        <Progress value={lesson.progressPercent} className="h-2 bg-slate-800" />
                      </div>
                    </div>
                  </div>

                  {/* Right: 4 Mini-Badges & Action Button */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {/* 4 Mini-Badges Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-xs w-full sm:w-auto">
                      {/* Mini-badge 1: Lý thuyết */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
                          lesson.badges.theory.completed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
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
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
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
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
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
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : lesson.badges.exam.locked
                            ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                            : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
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
    </div>
  );
}
