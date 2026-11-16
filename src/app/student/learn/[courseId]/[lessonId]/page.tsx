'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Gem,
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  Star,
  Video,
  Eye,
  Bookmark,
  ThumbsUp,
  BrainCircuit,
  PenTool,
  Trophy,
  ChevronRight,
  Lightbulb,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MOCK_COURSES, MOCK_QUESTION_BANKS } from '@/services/mock/data';
import { QuizPracticePanel } from '@/components/features/student/QuizPracticePanel';
import { EssayPracticePanel } from '@/components/features/student/EssayPracticePanel';

// Mock câu hỏi cho Tab 4: Đề thi kiểm tra 15 phút
interface MiniExamQuestion {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

const MOCK_MINI_EXAM_QUESTIONS: MiniExamQuestion[] = [
  {
    id: 1,
    question: 'Cho sin x = 3/5 với 0 < x < π/2. Giá trị của cos x bằng:',
    options: [
      { key: 'A', text: 'cos x = 4/5' },
      { key: 'B', text: 'cos x = -4/5' },
      { key: 'C', text: 'cos x = 16/25' },
      { key: 'D', text: 'cos x = 2/5' },
    ],
    correctAnswer: 'A',
    explanation: 'Vì 0 < x < π/2 (góc phần tư thứ I) nên cos x > 0. Áp dụng cos x = √(1 - sin²x) = √(1 - 9/25) = 4/5.',
  },
  {
    id: 2,
    question: 'Công thức biến đổi tổng thành tích nào sau đây là ĐÚNG?',
    options: [
      { key: 'A', text: 'cos a + cos b = 2 cos((a+b)/2) cos((a-b)/2)' },
      { key: 'B', text: 'cos a - cos b = 2 sin((a+b)/2) sin((a-b)/2)' },
      { key: 'C', text: 'sin a + sin b = 2 cos((a+b)/2) sin((a-b)/2)' },
      { key: 'D', text: 'sin a - sin b = 2 sin((a+b)/2) cos((a-b)/2)' },
    ],
    correctAnswer: 'A',
    explanation: 'Hệ thức đúng: cos a + cos b = 2 cos((a+b)/2) cos((a-b)/2).',
  },
  {
    id: 3,
    question: 'Tập xác định D của hàm số y = cot x là:',
    options: [
      { key: 'A', text: 'D = ℝ \\ {kπ, k ∈ ℤ}' },
      { key: 'B', text: 'D = ℝ \\ {π/2 + kπ, k ∈ ℤ}' },
      { key: 'C', text: 'D = ℝ \\ {k2π, k ∈ ℤ}' },
      { key: 'D', text: 'D = ℝ' },
    ],
    correctAnswer: 'A',
    explanation: 'Hàm số cot x = cos x / sin x xác định khi sin x ≠ 0 ⇔ x ≠ kπ (k ∈ ℤ).',
  },
];

export default function FocusLearningPlayerPage() {
  const params = useParams();
  const router = useRouter();

  // Dữ liệu Khóa học & Bài học hiện tại
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];
  const currentChapter = course.chapters?.[0];
  const allLessonsInChapter = currentChapter?.lessons || [];
  const currentLesson =
    allLessonsInChapter.find((l) => l.id === params.lessonId) ||
    allLessonsInChapter[0];

  // Trạng thái hoàn thành bài học
  const [completedLessons, setCompletedLessons] = React.useState<string[]>(['ls-01']);
  const isCurrentLessonCompleted = completedLessons.includes(currentLesson?.id || '');

  // Tab điều hướng 4 bước: 'theory' | 'quiz' | 'essay' | 'exam'
  const [activeTab, setActiveTab] = React.useState<string>('theory');

  // Gamification & Tương tác
  const [diamondBalance, setDiamondBalance] = React.useState<number>(150);
  const [claimedReward, setClaimedReward] = React.useState<boolean>(false);
  const [liked, setLiked] = React.useState<boolean>(false);
  const [saved, setSaved] = React.useState<boolean>(false);

  // Trạng thái Tab 4: Đề thi kiểm tra 15 phút
  const [examStarted, setExamStarted] = React.useState<boolean>(false);
  const [examTimeLeft, setExamTimeLeft] = React.useState<number>(900); // 15 phút = 900 giây
  const [examSubmitted, setExamSubmitted] = React.useState<boolean>(false);
  const [examAnswers, setExamAnswers] = React.useState<Record<number, string>>({});

  // Đọc query param ?tab= để hỗ trợ link trực tiếp (vd: ?tab=quiz hoặc ?tab=essay)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (p === 'quiz' || p === 'essay' || p === 'theory' || p === 'exam') {
        const timer = setTimeout(() => setActiveTab(p), 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Countdown timer cho Tab 4
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && !examSubmitted && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeLeft]);

  // Ngân hàng câu hỏi cho Quiz và Tự Luận
  const quizQuestions = React.useMemo(() => {
    const bankWithEssay = MOCK_QUESTION_BANKS.find(
      (bank) => bank.questions && bank.questions.some((q) => q.type === 'ESSAY')
    );
    return bankWithEssay?.questions ?? MOCK_QUESTION_BANKS[0]?.questions ?? [];
  }, []);

  // Xử lý hoàn thành bài
  const toggleCompleteCurrentLesson = () => {
    if (!currentLesson?.id) return;
    setCompletedLessons((prev) =>
      prev.includes(currentLesson.id)
        ? prev.filter((id) => id !== currentLesson.id)
        : [...prev, currentLesson.id]
    );
  };

  // Nhận thưởng kim cương
  const handleClaimReward = () => {
    if (!claimedReward) {
      setClaimedReward(true);
      setDiamondBalance((prev) => prev + 50);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateExamScore = () => {
    let correct = 0;
    MOCK_MINI_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  // Danh sách Tabs 4 bước sư phạm
  const tabsList = [
    {
      id: 'theory',
      label: '1. Lý Thuyết & Dạng Bài Tập',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      label: '2. Bài Tập Trắc Nghiệm',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: quizQuestions.filter((q) => q.type !== 'ESSAY').length,
    },
    {
      id: 'essay',
      label: '3. Bài Tập Tự Luận',
      icon: <PenTool className="w-4 h-4" />,
      badge: quizQuestions.filter((q) => q.type === 'ESSAY').length,
    },
    {
      id: 'exam',
      label: '4. Đề Thi Kiểm Tra',
      icon: <Clock className="w-4 h-4" />,
      badge: '15Ph',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#00B8DD]/30">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP FOCUS HEADER (Chuẩn Focus Mode EdTech, bỏ Navbar cồng kềnh)
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Trái: Nút Quay lại & Breadcrumb định vị */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/student/dashboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Rời không gian học về Trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/courses" className="hover:text-[#00B8DD] transition-colors truncate">
                  Khóa học
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="text-slate-300 font-semibold truncate max-w-[200px] sm:max-w-xs">
                  {course.title}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 hidden sm:inline" />
                <Badge
                  variant="outline"
                  className="text-[10px] text-[#00B8DD] border-[#00B8DD]/30 hidden sm:inline-flex"
                >
                  Lớp 11
                </Badge>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate max-w-xl">
                {currentLesson?.title || 'Bài học trực tuyến'}
              </h1>
            </div>
          </div>

          {/* Phải: Gamification Kim Cương & Nút Nhận Thưởng */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {/* Widget Kim Cương */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 shadow-inner">
              <Gem className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-cyan-200">{diamondBalance} 💎</span>
            </div>

            {/* Nút Nhận Thưởng +50💎 */}
            <button
              onClick={handleClaimReward}
              disabled={claimedReward}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md ${
                claimedReward
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-yellow-500/20 hover:scale-105 active:scale-95 cursor-pointer'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{claimedReward ? 'Đã Nhận +50 💎' : 'Nhận Thưởng +50 💎'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION: VIDEO PLAYER & PLAYLIST SIDEBAR (Grid 8:4)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái (8 phần): Video Player HD & Social Actions */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl group">
              <video
                src={currentLesson?.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                controls
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-[11px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-semibold select-none">
                <Video className="w-3.5 h-3.5" /> Bài Giảng HD Standard
              </div>
            </div>

            {/* Thống kê & Nút Tương tác nhanh dưới Video */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> 15,280 Lượt xem
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" /> {course.rating} ({course.total_reviews} Đánh giá)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    liked
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{liked ? 'Đã thích (343)' : 'Thích (342)'}</span>
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    saved
                      ? 'bg-[#00B8DD]/20 border-[#00B8DD]/40 text-[#00B8DD]'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{saved ? 'Đã lưu bài' : 'Lưu bài'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải (4 phần): Card Giảng Viên & Playlist Bài Học Tiếp Theo */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            {/* Card Giảng viên hướng dẫn */}
            <Card className="bg-slate-800/80 border-slate-700 p-4 rounded-2xl flex items-center gap-3 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.teacher_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={course.teacher_name}
                className="w-12 h-12 rounded-xl object-cover border border-[#00B8DD]/40 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-[#00B8DD] block tracking-wider">
                  Giảng viên phụ trách
                </span>
                <h4 className="text-sm font-bold text-white truncate">{course.teacher_name}</h4>
                <p className="text-xs text-slate-400 truncate">{course.department_name}</p>
              </div>
            </Card>

            {/* Playlist Sidebar */}
            <Card className="bg-slate-800/60 border-slate-700 p-4 rounded-2xl flex-1 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#00B8DD] fill-current" /> Danh Sách Bài Học Tiếp Theo
                </h4>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {completedLessons.length}/{allLessonsInChapter.length} hoàn thành
                </span>
              </div>

              {/* Danh sách các bài học */}
              <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                {allLessonsInChapter.map((lesson, idx) => {
                  const isActive = lesson.id === (currentLesson?.id || 'ls-01');
                  const isDone = completedLessons.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => router.push(`/student/learn/${course.id}/${lesson.id}`)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#00B8DD]/15 border-[#00B8DD]/60 text-white font-semibold ring-1 ring-[#00B8DD]/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isActive
                              ? 'bg-[#00B8DD] text-slate-950'
                              : isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {lesson.duration_mins}p
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Tiến độ chương */}
              <div className="pt-1">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Tiến độ chương 1</span>
                  <span>
                    {allLessonsInChapter.length > 0
                      ? Math.round((completedLessons.length / allLessonsInChapter.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    allLessonsInChapter.length > 0
                      ? (completedLessons.length / allLessonsInChapter.length) * 100
                      : 0
                  }
                  className="h-1.5 bg-slate-900"
                  indicatorClassName="bg-[#00B8DD]"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SUB-HEADER BAR WITH 4 TABS NAVIGATION (Sticky Pill Style)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 sticky top-[57px] z-20 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Tabs
            tabs={tabsList}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
            variant="pill"
            className="w-full sm:w-auto"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN WORKSPACE CONTENT AREA (Học 4 Bước)
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ================= TAB 1: LÝ THUYẾT & DẠNG BÀI TẬP ================= */}
        {activeTab === 'theory' && (
          <div className="space-y-8">
            {/* Header Theory Card */}
            <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <Badge variant="primary" className="text-[10px] bg-[#00B8DD] text-slate-950 font-bold">
                    Tóm Tắt Lý Thuyết Cốt Lõi
                  </Badge>
                  <h2 className="text-xl font-bold text-white">
                    {currentLesson?.title || 'Bài 1: Công Thức Lượng Giác Cơ Bản'}
                  </h2>
                </div>
                <Button
                  variant={isCurrentLessonCompleted ? 'success' : 'outline'}
                  onClick={toggleCompleteCurrentLesson}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isCurrentLessonCompleted ? 'Đã Hoàn Thành Bài Học' : 'Đánh Dấu Đã Học'}
                </Button>
              </div>

              {/* PHẦN I: KIẾN THỨC CỐT LÕI */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-[#00B8DD] flex items-center gap-2 border-l-4 border-[#00B8DD] pl-3">
                  PHẦN I: KIẾN THỨC CỐT LÕI (LÝ THUYẾT SGK)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" /> 1. Góc Lượng Giác & Đường Tròn Lượng Giác
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Đường tròn lượng giác là đường tròn định hướng bán kính R = 1 trong mặt phẳng tọa độ Oxy, tâm O(0,0), gốc A(1,0).
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      <li>Chiều dương: Ngược chiều kim đồng hồ (+).</li>
                      <li>Chiều âm: Cùng chiều kim đồng hồ (-).</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" /> 2. Bảng Giá Trị Lượng Giác
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Điểm M(x, y) trên đường tròn lượng giác tương ứng với góc α:
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-emerald-400 space-y-0.5">
                      <div>sin α = y_M</div>
                      <div>cos α = x_M</div>
                      <div>tan α = y_M / x_M (x_M ≠ 0)</div>
                      <div>cot α = x_M / y_M (y_M ≠ 0)</div>
                    </div>
                  </div>
                </div>

                {/* Hộp Công Thức Vàng (Formula Highlight Box) */}
                <div className="p-4 rounded-xl bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-2">
                  <h4 className="text-xs font-bold text-[#00B8DD] uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" /> HẰNG ĐẲNG THỨC LƯỢNG GIÁC CỐT LÕI (CẦN THUỘC LÒNG)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs text-slate-200">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      sin²α + cos²α = 1
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      1 + tan²α = 1 / cos²α (α ≠ π/2 + kπ)
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      tan α · cot α = 1 (α ≠ kπ/2)
                    </div>
                  </div>
                </div>
              </div>

              {/* PHẦN II: CÁC DẠNG BÀI TẬP VÀ PHƯƠNG PHÁP GIẢI */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2 border-l-4 border-purple-500 pl-3">
                  PHẦN II: PHÂN DẠNG BÀI TẬP THƯỜNG GẶP
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Dạng 1: Tính giá trị lượng giác còn lại khi biết một giá trị lượng giác</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                        Cơ bản
                      </Badge>
                    </h4>
                    <p className="text-xs text-slate-400">
                      <b>Phương pháp:</b> Sử dụng hằng đẳng thức sin²α + cos²α = 1. Chú ý xét dấu dựa vào góc phần tư của góc α.
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <b className="text-[#00B8DD]">Ví dụ:</b> Cho sin α = 3/5 với π/2 &lt; α &lt; π. Tính cos α và tan α.
                      <p className="text-slate-400 text-[11px] pt-1">
                        ➜ Vì π/2 &lt; α &lt; π (góc phần tư thứ II) nên cos α &lt; 0. Ta có: cos α = -√(1 - (3/5)²) = -4/5. Suy ra tan α = (3/5) / (-4/5) = -3/4.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tải tài liệu đính kèm */}
              {(() => {
                const currentAttachment = currentLesson?.materials?.[0] || {
                  id: 'mat-01',
                  title: 'Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf',
                  file_url: '/downloads/Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf',
                  file_type: 'PDF',
                  file_size_bytes: 2450000,
                };
                return (
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white">
                          Tài Liệu Đính Kèm: {currentAttachment.title}
                        </h5>
                        <p className="text-xs text-slate-400">
                          Dung lượng: 2.4 MB · Cập nhật theo chuẩn SGK mới
                        </p>
                      </div>
                    </div>
                    <a
                      href={currentAttachment.file_url}
                      download={currentAttachment.title}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Tải Xuống PDF
                      </Button>
                    </a>
                  </div>
                );
              })()}
            </Card>
          </div>
        )}

        {/* ================= TAB 2: BÀI TẬP TRẮC NGHIỆM ================= */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <QuizPracticePanel
              questions={quizQuestions}
              title={`Luyện Tập Trắc Nghiệm: ${currentLesson?.title || 'Hàm Số Lượng Giác'}`}
            />
          </div>
        )}

        {/* ================= TAB 3: BÀI TẬP TỰ LUẬN ================= */}
        {activeTab === 'essay' && (
          <div className="space-y-6">
            <EssayPracticePanel
              questions={quizQuestions}
              title={`Tự Luận Chuyên Sâu: ${currentLesson?.title || 'Hàm Số Lượng Giác'}`}
            />
          </div>
        )}

        {/* ================= TAB 4: ĐỀ THI KIỂM TRA 15 PHÚT ================= */}
        {activeTab === 'exam' && (
          <div className="space-y-6">
            {!examStarted ? (
              /* Màn hình trước khi bắt đầu thi */
              <Card className="bg-slate-900 border-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#00B8DD]/20 border border-[#00B8DD]/40 text-[#00B8DD] flex items-center justify-center mx-auto shadow-lg shadow-[#00B8DD]/10">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    Kiểm Tra Nhanh 15 Phút: Khảo Thí Bài Học
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Bài kiểm tra giúp đo lường mức độ tiếp thu kiến thức ngay sau bài giảng. Hệ thống sẽ bấm giờ thi thật và tự động chấm điểm xếp hạng.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-500 font-semibold block">Thời gian</span>
                    <strong className="text-sm text-white font-mono">15 Phút</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-500 font-semibold block">Số câu hỏi</span>
                    <strong className="text-sm text-white font-mono">{MOCK_MINI_EXAM_QUESTIONS.length} câu</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-500 font-semibold block">Thưởng</span>
                    <strong className="text-sm text-amber-300 font-mono">+100 💎</strong>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setExamStarted(true);
                    setExamTimeLeft(900);
                  }}
                  className="bg-[#00B8DD] text-slate-950 hover:bg-[#009bbd] font-bold px-8 py-3 text-sm rounded-xl shadow-lg shadow-[#00B8DD]/25 w-full sm:w-auto"
                >
                  Bắt Đầu Làm Bài Thi Ngay
                </Button>
              </Card>
            ) : !examSubmitted ? (
              /* Màn hình đang làm bài thi */
              <div className="space-y-6">
                {/* Thanh Timer đếm ngược sticky */}
                <div className="sticky top-[110px] z-20 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-md flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">Đề Thi 15 Phút Đang Diễn Ra</span>
                    <Badge variant="secondary" className="text-xs">
                      Đã chọn {Object.keys(examAnswers).length}/{MOCK_MINI_EXAM_QUESTIONS.length} câu
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 font-mono text-sm font-bold text-amber-400">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>{formatTimer(examTimeLeft)}</span>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => setExamSubmitted(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                    >
                      Nộp Bài Thi
                    </Button>
                  </div>
                </div>

                {/* Danh sách câu hỏi thi */}
                <div className="space-y-5">
                  {MOCK_MINI_EXAM_QUESTIONS.map((q, idx) => (
                    <Card key={q.id} className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-[#00B8DD] font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-100 leading-relaxed pt-0.5">
                          {q.question}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = examAnswers[q.id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#00B8DD]/20 border-[#00B8DD] text-white shadow-sm'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                  isSelected ? 'bg-[#00B8DD] text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Màn hình kết quả sau khi nộp bài */
              <Card className="bg-slate-900 border-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">Hoàn Thành Đề Kiểm Tra!</h3>
                  <p className="text-sm text-slate-400">
                    Kết quả của bạn đã được ghi nhận vào hệ thống đánh giá năng lực cá nhân.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around">
                  <div>
                    <span className="text-xs text-slate-500 block">Số câu đúng</span>
                    <strong className="text-2xl font-bold text-emerald-400 font-mono">
                      {calculateExamScore()}/{MOCK_MINI_EXAM_QUESTIONS.length}
                    </strong>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <span className="text-xs text-slate-500 block">Điểm số quy đổi</span>
                    <strong className="text-2xl font-bold text-[#00B8DD] font-mono">
                      {Math.round((calculateExamScore() / MOCK_MINI_EXAM_QUESTIONS.length) * 10 * 10) / 10}/10
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExamStarted(false);
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Làm Lại Đề Này
                  </Button>
                  <Button
                    onClick={() => setActiveTab('theory')}
                    className="bg-[#00B8DD] text-slate-950 hover:bg-[#009bbd] font-bold"
                  >
                    Quay Lại Bài Học
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
