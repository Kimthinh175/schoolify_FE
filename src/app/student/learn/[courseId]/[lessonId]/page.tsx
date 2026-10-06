'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  FileText,
  MessageSquare,
  ArrowLeft,
  BrainCircuit,
  Clapperboard,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_COURSES, MOCK_QUESTION_BANKS } from '@/services/mock/data';
import { QuizPracticePanel } from '@/components/features/student/QuizPracticePanel';
import { EssayPracticePanel } from '@/components/features/student/EssayPracticePanel';
import { Navbar } from '@/components/layout/Navbar';

export default function FocusLearningPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];
  const currentLesson = course.chapters?.[0]?.lessons.find(l => l.id === params.lessonId) || course.chapters?.[0]?.lessons?.[0];
  const [completedLessons, setCompletedLessons] = React.useState<string[]>(['ls-01']);
  const [activeTab, setActiveTab] = React.useState<'video' | 'quiz' | 'essay'>('video');

  // Sử dụng ngân hàng đề đầu tiên có chứa câu hỏi TỰ LUẬN để dễ test
  const quizQuestions = React.useMemo(
    () => {
      const bankWithEssay = MOCK_QUESTION_BANKS.find((bank) => 
        bank.questions && bank.questions.some(q => q.type === 'ESSAY')
      );
      return bankWithEssay?.questions ?? MOCK_QUESTION_BANKS[0]?.questions ?? [];
    },
    []
  );

  const toggleComplete = (id: string) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pt-20">
      {/* ── HEADER GIỐNG TRANG CHỦ ── */}
      <Navbar />

      {/* Top Focus Sub-bar */}
      <div className="sticky top-20 z-20 px-4 sm:px-6 py-2.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rời Không Gian Học</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs sm:text-sm font-bold truncate max-w-md text-slate-200">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="primary" className="text-[10px] bg-[#00B8DD] text-slate-950 font-bold">
            {completedLessons.length}/{course.total_lessons} bài hoàn thành
          </Badge>
        </div>
      </div>

      {/* Main Focus Area (Không sidebar) */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto">
        {/* Left: Main Content Panel */}
        <div className="flex-1 flex flex-col bg-slate-900">

          {/* ── Tab Switcher ── */}
          <div className="sticky top-[125px] z-10 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex gap-0">
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === 'video'
                    ? 'border-[#00B8DD] text-[#00B8DD]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Clapperboard className="h-4 w-4" />
                Bài Giảng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-[#00B8DD] text-[#00B8DD]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <BrainCircuit className="h-4 w-4" />
                Luyện Tập
                {quizQuestions.length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === 'quiz'
                      ? 'bg-[#00B8DD]/20 text-[#00B8DD]'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {quizQuestions.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('essay')}
                className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === 'essay'
                    ? 'border-[#00B8DD] text-[#00B8DD]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <PenTool className="h-4 w-4" />
                Tự Luận
                {quizQuestions.filter(q => q.type === 'ESSAY').length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === 'essay'
                      ? 'bg-[#00B8DD]/20 text-[#00B8DD]'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {quizQuestions.filter(q => q.type === 'ESSAY').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Tab 1: Video Bài Giảng ── */}
          {activeTab === 'video' && (
            <div className="flex-1 space-y-6 bg-black p-4 sm:p-6">
              {/* Video Container */}
              <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
                <video
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Lesson Content & Actions */}
              <div className="max-w-5xl mx-auto w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {currentLesson?.title || 'Chưa có tên bài học'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Giảng dạy bởi: {course.teacher_name}</p>
                  </div>

                  <Button
                    onClick={() => toggleComplete(currentLesson?.id || '')}
                    variant={completedLessons.includes(currentLesson?.id || '') ? 'success' : 'outline'}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {completedLessons.includes(currentLesson?.id || '') ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học'}
                  </Button>
                </div>

                {/* Document Material Downloads */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Tài Liệu Đính Kèm Của Bài Học
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">PDF</Badge>
                      <span className="text-xs font-semibold">Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf (2.4 MB)</span>
                    </div>
                    <Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>
                      Tải Xuống
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 2: Luyện Tập Quiz ── */}
          {activeTab === 'quiz' && (
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
              <QuizPracticePanel
                questions={quizQuestions}
                title="Luyện Tập: Hàm Số Lượng Giác"
              />
            </div>
          )}

          {/* ── Tab 3: Tự Luận ── */}
          {activeTab === 'essay' && (
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
              <EssayPracticePanel
                questions={quizQuestions}
                title="Tự Luận Chuyên Sâu: Hàm Số Lượng Giác"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
