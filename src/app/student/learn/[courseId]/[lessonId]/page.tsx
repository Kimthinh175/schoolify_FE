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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_COURSES, MOCK_QUESTION_BANKS } from '@/services/mock/data';
import { QuizPracticePanel } from '@/components/features/student/QuizPracticePanel';

export default function FocusLearningPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];
  const [completedLessons, setCompletedLessons] = React.useState<string[]>(['ls-01']);
  const [activeTab, setActiveTab] = React.useState<'video' | 'quiz'>('video');

  // Use first approved bank's questions as the lesson's practice set
  const quizQuestions = React.useMemo(
    () => MOCK_QUESTION_BANKS.find((bank) => bank.questions && bank.questions.length > 0)?.questions ?? [],
    []
  );

  const toggleComplete = (id: string) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Focus Bar */}
      <header className="h-14 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời Không Gian Học</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs sm:text-sm font-bold truncate max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-[10px]">
            {completedLessons.length}/{course.total_lessons} bài hoàn thành
          </Badge>
        </div>
      </header>

      {/* Main Focus Area: Video & Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Main Content Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">

          {/* ── Tab Switcher ── */}
          <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-sm sm:px-6">
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
                      Bài 1: Giá trị lượng giác của góc lượng giác & Công thức cốt lõi
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Giảng dạy bởi: {course.teacher_name}</p>
                  </div>

                  <Button
                    onClick={() => toggleComplete('ls-01')}
                    variant={completedLessons.includes('ls-01') ? 'success' : 'outline'}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {completedLessons.includes('ls-01') ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học'}
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
        </div>

        {/* Right Sidebar: Playlist / Curriculum */}
        <div className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-4 border-b border-slate-800 font-bold text-sm">
            Nội Dung Khóa Học ({course.total_lessons} Bài)
          </div>

          <div className="divide-y divide-slate-800/80">
            {course.chapters?.[0]?.lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  idx === 0 ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-slate-500 mt-0.5">{idx + 1}.</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2">{lesson.title}</p>
                    <span className="text-[10px] text-slate-500">{lesson.duration_mins} phút</span>
                  </div>
                </div>
                {completedLessons.includes(lesson.id) && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
