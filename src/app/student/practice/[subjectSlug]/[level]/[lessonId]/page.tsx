'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Gem,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Download,
  Play,
  Send,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  UploadCloud,
  FileCheck,
  Star,
  MessageSquare,
  UserCheck,
  Video,
  Eye,
  Share2,
  Bookmark,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { getCurriculum, SubjectCurriculum } from '@/services/mock/curriculumData';

// Helper function to turn slug to human friendly title
function formatSlug(slug: string | string[] | undefined): string {
  if (!slug) return 'Toán Học';
  const str = Array.isArray(slug) ? slug[0] : slug;
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Mock Questions for Trắc Nghiệm Tab
interface MultipleChoiceQuestion {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

const MOCK_QUIZ_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 1,
    question: 'Cho sin x = 4/5 với π/2 < x < π. Giá trị cos x bằng:',
    options: [
      { key: 'A', text: 'cos x = 3/5' },
      { key: 'B', text: 'cos x = -3/5' },
      { key: 'C', text: 'cos x = 9/25' },
      { key: 'D', text: 'cos x = -4/5' },
    ],
    correctAnswer: 'B',
    explanation:
      'Vì π/2 < x < π (góc thuộc phần tư thứ II) nên cos x < 0. Ta có: cos x = -√(1 - sin²x) = -√(1 - 16/25) = -3/5.',
  },
  {
    id: 2,
    question: 'Phương trình sin x = sin α có họ nghiệm là:',
    options: [
      { key: 'A', text: 'x = α + k2π và x = -α + k2π (k ∈ ℤ)' },
      { key: 'B', text: 'x = α + k2π và x = π - α + k2π (k ∈ ℤ)' },
      { key: 'C', text: 'x = α + kπ và x = π - α + kπ (k ∈ ℤ)' },
      { key: 'D', text: 'x = α + k2π (k ∈ ℤ)' },
    ],
    correctAnswer: 'B',
    explanation:
      'Phương trình lượng giác cơ bản sin x = sin α có 2 họ nghiệm: x = α + k2π và x = π - α + k2π với k ∈ ℤ.',
  },
  {
    id: 3,
    question: 'Điều kiện xác định của hàm số y = tan x là:',
    options: [
      { key: 'A', text: 'x ≠ kπ (k ∈ ℤ)' },
      { key: 'B', text: 'x ≠ π/2 + k2π (k ∈ ℤ)' },
      { key: 'C', text: 'x ≠ π/2 + kπ (k ∈ ℤ)' },
      { key: 'D', text: 'x ≠ k2π (k ∈ ℤ)' },
    ],
    correctAnswer: 'C',
    explanation:
      'Hàm số y = tan x = sin x / cos x xác định khi mẫu cos x ≠ 0 ⇔ x ≠ π/2 + kπ (k ∈ ℤ).',
  },
];

export default function StudentPracticeWorkspacePage() {
  const params = useParams();
  const router = useRouter();

  const subjectSlug = (params.subjectSlug as string) || 'toan-hoc';
  const level = (params.level as string) || 'lop-11';
  const lessonId = (params.lessonId as string) || 'lesson-01';

  const subjectTitle = formatSlug(subjectSlug);
  const levelTitle = level.replace('-', ' ').toUpperCase();

  // Fetch Curriculum Data for active subject & level
  const curriculum: SubjectCurriculum = getCurriculum(subjectSlug, level);

  // Active Tab state: 'theory' | 'quiz' | 'essay' | 'exam'
  const [activeTab, setActiveTab] = React.useState<string>('theory');

  // Rewards & Progress State
  const [claimedReward, setClaimedReward] = React.useState<boolean>(false);
  const [diamondBalance, setDiamondBalance] = React.useState<number>(120);
  const [theoryCompleted, setTheoryCompleted] = React.useState<boolean>(false);

  // Trắc Nghiệm state
  const [userAnswers, setUserAnswers] = React.useState<Record<number, string>>({});
  const [submittedQuiz, setSubmittedQuiz] = React.useState<boolean>(false);

  // Tự Luận state
  const [essayAnswer, setEssayAnswer] = React.useState<string>('');
  const [essaySubmitted, setEssaySubmitted] = React.useState<boolean>(false);
  const [showEssaySolution, setShowEssaySolution] = React.useState<boolean>(false);

  // Bài Thi state
  const [examStarted, setExamStarted] = React.useState<boolean>(false);
  const [examTimeLeft, setExamTimeLeft] = React.useState<number>(900);
  const [examSubmitted, setExamSubmitted] = React.useState<boolean>(false);
  const [examAnswers, setExamAnswers] = React.useState<Record<number, string>>({});

  // Curriculum Accordion Collapsed State
  const [expandedChapters, setExpandedChapters] = React.useState<Record<string, boolean>>({
    'ch-01': true,
    'ch-02': false,
    'ch-03': false,
    'ch-vl-01': true,
    'ch-hh-01': true,
    'ch-ta-01': true,
    'ch-nv-01': true,
  });

  const toggleChapter = (chId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chId]: !prev[chId] }));
  };

  // Countdown timer for Exam Tab
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && !examSubmitted && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeLeft]);

  const handleClaimReward = () => {
    if (!claimedReward) {
      setClaimedReward(true);
      setDiamondBalance((prev) => prev + 50);
    }
  };

  const handleSelectQuizOption = (qId: number, key: string) => {
    if (submittedQuiz) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: key }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    MOCK_QUIZ_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const tabsList = [
    {
      id: 'theory',
      label: '1. Lý Thuyết & Dạng Bài Tập',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      label: '2. Bài Tập Trắc Nghiệm',
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: MOCK_QUIZ_QUESTIONS.length,
    },
    {
      id: 'essay',
      label: '3. Bài Tập Tự Luận',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'exam',
      label: '4. Đề Thi Kiểm Tra',
      icon: <Clock className="w-4 h-4" />,
      badge: '15Ph',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Back & Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/student/practice/${subjectSlug}/${level}`)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Quay lại Lộ trình"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/student/practice" className="hover:text-indigo-400 transition-colors">
                  Lộ trình luyện tập
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-slate-300 font-semibold">{curriculum.subjectName}</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                  {curriculum.levelName}
                </Badge>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
                Bài 1: Giá trị lượng giác của góc lượng giác & Công thức cốt lõi
              </h1>
            </div>
          </div>

          {/* Right: Diamond Reward Header Widget */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 shadow-inner">
              <Gem className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm font-bold text-cyan-200">{diamondBalance} 💎</span>
            </div>

            <button
              onClick={handleClaimReward}
              disabled={claimedReward}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg ${
                claimedReward
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-yellow-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {claimedReward ? 'Đã Nhận +50 💎' : 'Nhận Thưởng +50 💎'}
            </button>
          </div>
        </div>
      </header>

      {/* 2. TOP VIDEO PLAYER & NEXT LESSONS SIDEBAR (HOC247 / TUYENSINH247 STYLE) */}
      <section className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Video Player */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl group">
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-[11px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-semibold">
                <Video className="w-3.5 h-3.5" /> Bài Giảng HD Standard
              </div>
            </div>

            {/* Video Stats & Quick Actions */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> 12,450 Lượt xem
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.9 (128 Đánh giá)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" /> Thích (342)
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
                  <Bookmark className="w-3.5 h-3.5" /> Lưu bài
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Teacher Info & Next Lessons Playlist */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            {/* Teacher Info Card */}
            <Card className="bg-slate-800/80 border-slate-700 p-4 rounded-2xl flex items-center gap-3 shadow-md">
              <img
                src={curriculum.teacher.avatar}
                alt={curriculum.teacher.name}
                className="w-12 h-12 rounded-xl object-cover border border-indigo-500/40 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                  Giảng viên hướng dẫn
                </span>
                <h4 className="text-sm font-bold text-white truncate">{curriculum.teacher.name}</h4>
                <p className="text-xs text-slate-400 truncate">{curriculum.teacher.title}</p>
              </div>
            </Card>

            {/* Playlist Sidebar */}
            <Card className="bg-slate-800/60 border-slate-700 p-4 rounded-2xl flex-1 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" /> Danh Sách Bài Tiếp Theo
                </h4>
                <span className="text-[11px] font-semibold text-emerald-400">1/5 Hoàn thành</span>
              </div>

              {/* Playlist Items List */}
              <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1 no-scrollbar">
                {curriculum.chapters[0]?.lessons.slice(0, 4).map((l, idx) => {
                  const isActive = l.id === lessonId;
                  return (
                    <div
                      key={l.id}
                      onClick={() =>
                        router.push(`/student/practice/${subjectSlug}/${level}/${l.id}`)
                      }
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-950/80 border-indigo-500/60 text-white font-semibold ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate">{l.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {l.duration}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1">
                <Progress value={20} className="h-1.5 bg-slate-900" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. SUB-HEADER BAR WITH 4 TABS NAVIGATION */}
      <section className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-2.5 sticky top-[57px] z-20 backdrop-blur">
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

      {/* 4. MAIN WORKSPACE CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ================= TAB 1: LÝ THUYẾT & DẠNG BÀI TẬP ================= */}
        {activeTab === 'theory' && (
          <div className="space-y-8">
            {/* Header Theory Banner */}
            <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <Badge variant="primary" className="text-[10px]">
                    Nội Dung Bài Học Chi Tiết
                  </Badge>
                  <h2 className="text-xl font-bold text-white">
                    Bài 1: Giá Trị Lượng Giác Của Góc Lượng Giác & Các Công Thức Cốt Lõi
                  </h2>
                </div>
                <Button
                  variant={theoryCompleted ? 'success' : 'outline'}
                  onClick={() => setTheoryCompleted(!theoryCompleted)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {theoryCompleted ? 'Đã Hoàn Thành Lý Thuyết' : 'Đánh Dấu Đã Đọc'}
                </Button>
              </div>

              {/* PHẦN I: KIẾN THỨC CỐT LÕI */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
                  PHẦN I: KIẾN THỨC CỐT LÕI (LÝ THUYẾT)
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
                      <BookOpen className="w-4 h-4 text-purple-400" /> 2. Giá Trị Lượng Giác
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Điểm M(x, y) trên đường tròn lượng giác tương ứng với góc α:
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-emerald-400 space-y-0.5">
                      <div>sin α = y_M</div>
                      <div>cos α = x_M</div>
                      <div>tan α = y_M / x_M  (x_M ≠ 0)</div>
                      <div>cot α = x_M / y_M  (y_M ≠ 0)</div>
                    </div>
                  </div>
                </div>

                {/* Formula Highlight Box */}
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Các Công Thức Lượng Giác Cơ Bản Cần Nắm
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-cyan-300 pt-1">
                    <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                      sin²α + cos²α = 1
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                      1 + tan²α = 1 / cos²α
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                      1 + cot²α = 1 / sin²α
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                      tan α . cot α = 1
                    </div>
                  </div>
                </div>
              </div>

              {/* PHẦN II: CÁC DẠNG BÀI TẬP & PHƯƠNG PHÁP GIẢI */}
              <div className="space-y-6 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                    PHẦN II: CÁC DẠNG BÀI TẬP VÀ PHƯƠNG PHÁP GIẢI
                  </h3>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Đã tải xuống file Tài liệu tóm tắt công thức Lượng Giác.pdf');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải PDF Bài Giảng</span>
                  </a>
                </div>

                {/* DẠNG 1 */}
                <Card className="bg-slate-950/90 border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" className="text-[11px] bg-[#00B8DD] text-slate-950 font-bold">
                      DẠNG 1: Tính giá trị lượng giác khi biết một giá trị lượng giác cho trước
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Phương pháp giải:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      1. Áp dụng công thức sin²x + cos²x = 1 hoặc 1 + tan²x = 1/cos²x để tính bình phương giá trị còn lại. <br />
                      2. Căn cứ vào khoảng giá trị của góc x (phần tư I, II, III hay IV) để xác định dấu (+ hay -) của giá trị lượng giác.
                    </p>
                  </div>

                  {/* Ví dụ minh họa 1 */}
                  <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Ví dụ minh họa 1:
                    </h5>
                    <p className="text-xs text-slate-200 font-mono">
                      Cho cos x = -3/5 với π &lt; x &lt; 3π/2. Tính sin x và tan x.
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs font-mono text-emerald-300 space-y-1 border border-slate-800/80">
                      <div className="font-bold text-indigo-300">Lời giải chi tiết:</div>
                      <div>• Ta có: sin²x = 1 - cos²x = 1 - (-3/5)² = 16/25.</div>
                      <div>• Vì π &lt; x &lt; 3π/2 (góc thuộc phần tư thứ III) ⇒ sin x &lt; 0.</div>
                      <div>• Suy ra: sin x = -√(16/25) = -4/5.</div>
                      <div>• Tính tan x: tan x = sin x / cos x = (-4/5) / (-3/5) = 4/3.</div>
                    </div>
                  </div>
                </Card>

                {/* DẠNG 2 */}
                <Card className="bg-slate-950/90 border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" className="text-[11px] bg-[#00B8DD] text-slate-950 font-bold">
                      DẠNG 2: Rút gọn biểu thức lượng giác & Chứng minh đẳng thức
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Phương pháp giải:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Sử dụng biến đổi đại số kết hợp các hằng đẳng thức lượng giác, nhóm các giá trị đối nhau hoặc phụ nhau để đưa biểu thức về dạng tối giản.
                    </p>
                  </div>

                  {/* Ví dụ minh họa 2 */}
                  <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" /> Ví dụ minh họa 2:
                    </h5>
                    <p className="text-xs text-slate-200 font-mono">
                      Rút gọn biểu thức A = (sin²x - cos²x) / (sin x + cos x).
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs font-mono text-emerald-300 space-y-1 border border-slate-800/80">
                      <div className="font-bold text-indigo-300">Lời giải chi tiết:</div>
                      <div>• Áp dụng hằng đẳng thức a² - b² = (a - b)(a + b) ở tử số:</div>
                      <div>  sin²x - cos²x = (sin x - cos x)(sin x + cos x).</div>
                      <div>• Rút gọn với mẫu số (sin x + cos x) ≠ 0:</div>
                      <div>  ⇒ A = sin x - cos x.</div>
                    </div>
                  </div>
                </Card>

                {/* Ghi chú cá nhân của Học sinh */}
                <Card className="bg-slate-900 border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#00B8DD]" />
                      Ghi Chú Cá Nhân Cho Bài Học Này
                    </h4>
                    <span className="text-[10px] text-slate-400">Tự động lưu vào tài khoản</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Viết ghi chú cá nhân (vd: Cần nhớ góc phần tư thứ 3 sin và cos đều âm)..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00B8DD]"
                  />
                </Card>
              </div>
            </Card>
          </div>
        )}

        {/* ================= TAB 2: BÀI TẬP TRẮC NGHIỆM ================= */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  Luyện Tập Trắc Nghiệm ({MOCK_QUIZ_QUESTIONS.length} Câu)
                </h2>
                <p className="text-xs text-slate-400">
                  Chọn đáp án đúng cho từng câu hỏi và nhấn "Kiểm Tra Đáp Án" để nộp bài.
                </p>
              </div>

              {submittedQuiz && (
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-indigo-500/30">
                  <span className="text-xs text-slate-400">Kết quả:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {calculateQuizScore()} / {MOCK_QUIZ_QUESTIONS.length} Đúng
                  </span>
                </div>
              )}
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-6">
              {MOCK_QUIZ_QUESTIONS.map((q, idx) => {
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctAnswer;

                return (
                  <Card key={q.id} className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-lg">
                        Câu {idx + 1}
                      </span>
                      {submittedQuiz && (
                        <Badge variant={isCorrect ? 'success' : 'danger'}>
                          {isCorrect ? 'Chính Xác (+10 💎)' : 'Chưa Đúng'}
                        </Badge>
                      )}
                    </div>

                    <p className="text-base font-medium text-white">{q.question}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt) => {
                        const isSelected = selectedOpt === opt.key;
                        let optionStyle =
                          'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/60';

                        if (submittedQuiz) {
                          if (opt.key === q.correctAnswer) {
                            optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-indigo-950/80 border-indigo-500 text-indigo-100 font-semibold shadow-md';
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectQuizOption(q.id, opt.key)}
                            disabled={submittedQuiz}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm transition-all ${optionStyle}`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" /> Lời giải chi tiết:
                        </div>
                        <p className="text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setSubmittedQuiz(false);
                  setUserAnswers({});
                }}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Làm Lại Bài
              </Button>

              <Button
                variant="primary"
                disabled={Object.keys(userAnswers).length === 0 || submittedQuiz}
                onClick={() => {
                  setSubmittedQuiz(true);
                  handleClaimReward();
                }}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {submittedQuiz ? 'Đã Nộp Bài' : 'Nộp Bài & Kiểm Tra'}
              </Button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BÀI TẬP TỰ LUẬN ================= */}
        {activeTab === 'essay' && (
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <Badge variant="primary" className="mb-1 text-[10px]">
                    Bài Tập Tự Luận Nâng Cao
                  </Badge>
                  <h2 className="text-lg font-bold text-white">
                    Đề Bài: Trình Bày Biến Đổi & Giải Phương Trình Lượng Giác
                  </h2>
                </div>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                  Thưởng 30 💎
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed font-mono">
                Cho phương trình lượng giác: <br />
                <span className="text-indigo-300 font-bold">
                  2sin²(x) + 3cos(x) - 3 = 0
                </span>{' '}
                tìm các nghiệm x nằm trong khoảng <span className="text-amber-300">[0, 2π]</span>.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Nhập bài làm / Trình bày lời giải của bạn:
                </label>
                <textarea
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Ghi chi tiết các bước biến đổi, điều kiện nghiệm và họ nghiệm tìm được..."
                  rows={6}
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  Tải lên ảnh chụp bài làm (JPG, PNG) hoặc file PDF
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Dung lượng tối đa: 10MB</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEssaySolution(!showEssaySolution)}
                  leftIcon={<HelpCircle className="w-4 h-4" />}
                >
                  {showEssaySolution ? 'Ẩn Lời Giải Mẫu' : 'Xem Lời Giải Mẫu & Gợi Ý'}
                </Button>

                <Button
                  variant={essaySubmitted ? 'success' : 'primary'}
                  disabled={!essayAnswer.trim() && !essaySubmitted}
                  onClick={() => {
                    setEssaySubmitted(true);
                    handleClaimReward();
                  }}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {essaySubmitted ? 'Đã Nộp Bài Tự Luận' : 'Gửi Bài Làm'}
                </Button>
              </div>

              {showEssaySolution && (
                <div className="mt-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                  <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-400" />
                    Hướng Dẫn Giải Chi Tiết (Đáp Án Mẫu):
                  </h4>
                  <div className="text-xs text-slate-200 space-y-2 font-mono leading-relaxed">
                    <p>1. Ta có: sin²(x) = 1 - cos²(x).</p>
                    <p>2. Thay vào phương trình: 2(1 - cos²(x)) + 3cos(x) - 3 = 0</p>
                    <p>⇔ -2cos²(x) + 3cos(x) - 1 = 0</p>
                    <p>3. Đặt t = cos(x) với |t| ≤ 1. Ta được: -2t² + 3t - 1 = 0</p>
                    <p>⇒ t = 1 hoặc t = 1/2 (cả hai đều thỏa mãn).</p>
                    <p>4. Với cos(x) = 1 ⇒ x = 0 hoặc x = 2π trên [0, 2π].</p>
                    <p>5. Với cos(x) = 1/2 ⇒ x = π/3 hoặc x = 5π/3 trên [0, 2π].</p>
                    <div className="pt-2 font-bold text-emerald-400">
                      Kết luận: Tập nghiệm S = &#123;0, π/3, 5π/3, 2π&#125;.
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ================= TAB 4: ĐỀ THI KIỂM TRA ================= */}
        {activeTab === 'exam' && (
          <div className="space-y-6">
            {!examStarted ? (
              <Card className="bg-slate-900 border-slate-800 p-8 rounded-2xl text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <Badge variant="primary" className="text-xs">
                    Bài Kiểm Tra Định Kỳ Bài 1
                  </Badge>
                  <h2 className="text-2xl font-bold text-white">
                    Kiểm Tra Đánh Giá Kiến Thức (15 Phút)
                  </h2>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Bài thi gồm 10 câu trắc nghiệm tổng hợp nhằm đánh giá khả năng vận dụng công thức và tốc độ giải bài của bạn.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Thời gian</span>
                    <span className="font-bold text-white text-sm">15 Phút</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Số câu hỏi</span>
                    <span className="font-bold text-white text-sm">10 Câu</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phần thưởng</span>
                    <span className="font-bold text-yellow-400 text-sm">+100 💎</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setExamStarted(true)}
                  leftIcon={<Play className="w-5 h-5 fill-current" />}
                  className="px-8"
                >
                  Bắt Đầu Làm Bài Thi
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 sticky top-16 z-20 shadow-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                    <div>
                      <span className="text-xs text-slate-400 block">Thời gian còn lại</span>
                      <span className="text-lg font-mono font-bold text-amber-300">
                        {formatTimer(examTimeLeft)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={examSubmitted ? 'success' : 'destructive'}
                    onClick={() => {
                      setExamSubmitted(true);
                      handleClaimReward();
                    }}
                    disabled={examSubmitted}
                    leftIcon={<FileCheck className="w-4 h-4" />}
                  >
                    {examSubmitted ? 'Đã Nộp Bài Thi' : 'Nộp Bài Thi'}
                  </Button>
                </div>

                {examSubmitted && (
                  <Card className="bg-emerald-950/40 border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
                    <Badge variant="success" className="text-xs">
                      Đã Hoàn Thành Bài Thi!
                    </Badge>
                    <h3 className="text-xl font-bold text-white">
                      Chúc mừng! Bạn đạt 9/10 Điểm
                    </h3>
                    <p className="text-xs text-slate-300">
                      Bạn vừa nhận thành công <strong className="text-yellow-400">+100 Kim Cương 💎</strong> thưởng từ bài kiểm tra.
                    </p>
                  </Card>
                )}

                <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-lg inline-block">
                    Câu 1 / 10
                  </span>
                  <p className="text-base font-semibold text-white">
                    Phương trình cos 2x - 3cos x + 2 = 0 có tất cả bao nhiêu nghiệm trên [0, 4π]?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {['3 nghiệm', '4 nghiệm', '5 nghiệm', '6 nghiệm'].map((optText, index) => (
                      <button
                        key={index}
                        onClick={() => setExamAnswers({ ...examAnswers, 1: optText })}
                        disabled={examSubmitted}
                        className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                          examAnswers[1] === optText
                            ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {optText}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ================= 5. FULL CURRICULUM ACCORDION (TẤT CẢ CÁC CHƯƠNG & BÀI HỌC) ================= */}
        <section className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Danh Sách Bài Học / Chương Trình Học Đầy Đủ ({curriculum.subjectName} - {curriculum.levelName})
              </h3>
              <p className="text-xs text-slate-400">
                Toàn bộ các chương và bài học được chuẩn hóa theo bộ giáo dục. Click vào bài để chuyển tới bài luyện tương ứng.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {curriculum.chapters.map((ch) => {
              const isExpanded = expandedChapters[ch.id] ?? false;

              return (
                <Card key={ch.id} className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  {/* Chapter Header */}
                  <div
                    onClick={() => toggleChapter(ch.id)}
                    className="p-4 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                        C{ch.chapterNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                        <span className="text-xs text-slate-400">{ch.lessons.length} bài học</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] text-slate-400">
                        {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Lessons List Inside Chapter */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-2">
                      {ch.lessons.map((lesson) => {
                        const isCurrent = lesson.id === lessonId;

                        return (
                          <div
                            key={lesson.id}
                            onClick={() =>
                              router.push(
                                `/student/practice/${subjectSlug}/${level}/${lesson.id}`
                              )
                            }
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-4 cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-indigo-950/80 border-indigo-500/60 text-white font-semibold ring-1 ring-indigo-500/30'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Play
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isCurrent ? 'text-indigo-400 fill-current' : 'text-slate-500'
                                }`}
                              />
                              <span className="truncate">{lesson.title}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-2 shrink-0">
                              {lesson.hasTheory && (
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md hidden sm:inline">
                                  📖 Lý thuyết
                                </span>
                              )}
                              {lesson.hasQuiz && (
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md hidden sm:inline">
                                  📝 Trắc nghiệm
                                </span>
                              )}
                              {lesson.hasExam && (
                                <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                                  ⏱️ Đề thi
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-400">
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* ================= 6. COMMENTS & REVIEWS SECTION ================= */}
        <section className="pt-6 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Hỏi Đáp & Thảo Luận Bài Học (128 Bình luận)
            </h3>
            <span className="text-xs text-slate-400">Đánh giá trung bình: 4.9 ⭐</span>
          </div>

          <Card className="bg-slate-900 border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            {/* Input Comment Box */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 font-bold text-white flex items-center gap-2 justify-center text-xs shrink-0">
                HS
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  placeholder="Đặt câu hỏi hoặc thảo luận về bài học với giáo viên và các bạn..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <div className="flex justify-end">
                  <Button size="sm" variant="primary" leftIcon={<Send className="w-3.5 h-3.5" />}>
                    Gửi Bình Luận
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing Comments List */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Nguyễn Văn Hoàng</span>
                    <Badge variant="outline" className="text-[9px] text-indigo-400">
                      Học sinh Lớp 11A1
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-500">2 giờ trước</span>
                </div>
                <p className="text-slate-300">
                  Thầy ơi cho em hỏi câu Ví dụ 1 chỗ xét khoảng π &lt; x &lt; 3π/2 tại sao sin x lại âm ạ?
                </p>
                {/* Teacher Reply */}
                <div className="mt-2 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Thầy Nguyễn Quốc Tuấn (Giảng viên)
                  </div>
                  <p className="text-slate-200">
                    Chào Hoàng! Khoảng (π, 3π/2) ứng với Góc phần tư thứ III trên đường tròn lượng giác. Tại phần tư này cả trục tung (trục sin) đều nhận giá trị âm nhé em!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
