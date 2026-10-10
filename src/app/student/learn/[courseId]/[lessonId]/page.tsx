'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  FileText,
  MessageSquare,
  ArrowLeft,
  HelpCircle,
  Layers,
  BrainCircuit,
  Clapperboard,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_COURSES, MOCK_QUESTION_BANKS } from '@/services/mock/data';
import { LessonTheoryTab } from '@/components/features/student/learn/LessonTheoryTab';
import { QuizPracticePanel } from '@/components/features/student/QuizPracticePanel';
import { EssayPracticePanel } from '@/components/features/student/EssayPracticePanel';
import { Navbar } from '@/components/layout/Navbar';

export default function FocusLearningPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];

  const allLessons = React.useMemo(() => {
    return (course.chapters || []).flatMap((ch) => ch.lessons);
  }, [course]);

  const [selectedLessonId, setSelectedLessonId] = React.useState<string>(
    (params.lessonId as string) || allLessons[0]?.id || 'ls-01'
  );

  const currentChapter = React.useMemo(() => {
    return (
      (course.chapters || []).find((ch) =>
        ch.lessons.some((l) => l.id === selectedLessonId)
      ) || course.chapters?.[0]
    );
  }, [course, selectedLessonId]);

  const currentLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];
  const lessonContent = currentLesson?.content_sections;

  // Quản lý trạng thái đóng/mở từng Chương
  const [expandedChapters, setExpandedChapters] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (course.chapters || []).forEach((ch, idx) => {
      // Mặc định mở chương chứa bài học đang chọn hoặc chương đầu tiên
      const hasSelected = ch.lessons.some((l) => l.id === ((params.lessonId as string) || 'ls-01'));
      initial[ch.id] = hasSelected || idx === 0;
    });
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const parentCh = course.chapters?.find((ch) => ch.lessons.some((l) => l.id === lessonId));
    if (parentCh) {
      setExpandedChapters((prev) => ({ ...prev, [parentCh.id]: true }));
    }
  };

  const [completedLessons, setCompletedLessons] = React.useState<string[]>(['ls-01']);
  const [activeTab, setActiveTab] = React.useState<'video' | 'quiz' | 'essay'>('video');

  // Ngân hàng câu hỏi cho QuizPracticePanel & EssayPracticePanel
  const quizQuestions = React.useMemo(() => {
    const bankWithEssay = MOCK_QUESTION_BANKS.find((bank) =>
      bank.questions && bank.questions.some((q) => q.type === 'ESSAY')
    );
    return bankWithEssay?.questions ?? MOCK_QUESTION_BANKS[0]?.questions ?? [];
  }, []);

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
            {completedLessons.length}/{course.total_lessons || allLessons.length} bài hoàn thành
          </Badge>
        </div>
      </div>

      {/* Main Focus Area: Content Panel & Right Curriculum Sidebar */}
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
                Bài Giảng & Lý Thuyết
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
                Luyện Tập Trắc Nghiệm
                {quizQuestions.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === 'quiz'
                        ? 'bg-[#00B8DD]/20 text-[#00B8DD]'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
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
                {quizQuestions.filter((q) => q.type === 'ESSAY').length > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === 'essay'
                        ? 'bg-[#00B8DD]/20 text-[#00B8DD]'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {quizQuestions.filter((q) => q.type === 'ESSAY').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Tab 1: Video Bài Giảng & Lý Thuyết ── */}
          {activeTab === 'video' && (
            <div className="flex-1 space-y-6 bg-slate-900 p-4 sm:p-6">
              {/* Video Container */}
              <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
                <video
                  src={currentLesson?.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Lesson Content & Actions */}
              <div className="max-w-5xl mx-auto w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    {currentChapter && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-800/80">
                          <Layers className="w-3 h-3 text-indigo-400" />
                          {currentChapter.title}
                        </span>
                      </div>
                    )}
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      {currentLesson?.title || 'Chưa có tên bài học'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Giảng dạy bởi: {course.teacher_name}</p>
                  </div>

                  <Button
                    onClick={() => toggleComplete(currentLesson?.id || 'ls-01')}
                    variant={completedLessons.includes(currentLesson?.id || 'ls-01') ? 'success' : 'outline'}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {completedLessons.includes(currentLesson?.id || 'ls-01') ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học'}
                  </Button>
                </div>

                {/* Theory Section if available */}
                {lessonContent?.theory && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-200">
                      <BookOpen className="w-4 h-4 text-[#00B8DD]" />
                      Tóm Tắt Lý Thuyết Cốt Lõi
                    </h3>
                    <LessonTheoryTab
                      definitions={lessonContent.theory.definitions}
                      formulas={lessonContent.theory.formulas}
                      examples={lessonContent.theory.examples}
                      onNavigateToQuiz={() => setActiveTab('quiz')}
                    />
                  </div>
                )}

                {/* Document Material Downloads */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-200">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Tài Liệu Đính Kèm Của Bài Học
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px] bg-red-950/80 text-red-300 border-0">
                        PDF
                      </Badge>
                      <span className="text-xs font-semibold text-slate-300">
                        Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf (2.4 MB)
                      </span>
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
            <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 space-y-6">
              {lessonContent?.exam?.examConfig && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50">
                  <div>
                    <h4 className="text-sm font-bold text-white">Đề kiểm tra nhanh 10 phút</h4>
                    <p className="text-xs text-slate-400">Kiểm tra mức độ nắm kiến thức bài này có chấm điểm và lưu kỷ lục.</p>
                  </div>
                  <Link href={`/student/exam/${lessonContent.exam.examConfig.examId}`}>
                    <Button size="sm" className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold">
                      Vào Thi Ngay
                    </Button>
                  </Link>
                </div>
              )}
              <QuizPracticePanel
                questions={quizQuestions}
                title={`Luyện Tập: ${currentLesson?.title || 'Hàm Số Lượng Giác'}`}
              />
            </div>
          )}

          {/* ── Tab 3: Tự Luận ── */}
          {activeTab === 'essay' && (
            <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
              <EssayPracticePanel
                questions={quizQuestions}
                title={`Tự Luận Chuyên Sâu: ${currentLesson?.title || 'Hàm Số Lượng Giác'}`}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar: Playlist / Curriculum Grouped by Chapters */}
        <div className="w-full lg:w-84 xl:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-[calc(100vh-8.5rem)] overflow-hidden shadow-xs shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div>
              <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00B8DD]" />
                Nội Dung Khóa Học
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {course.chapters?.length || 0} Chương • {course.total_lessons || allLessons.length} Bài học
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              {completedLessons.length}/{allLessons.length} đã xong
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {(course.chapters || []).map((chapter, chIdx) => {
              const isExpanded = !!expandedChapters[chapter.id];
              const completedInChapter = chapter.lessons.filter((l) => completedLessons.includes(l.id)).length;
              const isCurrentChapter = currentChapter?.id === chapter.id;
              const cleanChapterTitle =
                chapter.title.replace(/^Chương\s*\d+\s*[:.-]\s*/i, '').trim() || chapter.title;
              const totalChapterMins = chapter.lessons.reduce((sum, l) => sum + (l.duration_mins || 0), 0);

              return (
                <div key={chapter.id} className="border-b border-slate-800/60 last:border-b-0">
                  {/* Chapter Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                      isCurrentChapter
                        ? 'bg-slate-900'
                        : 'bg-slate-950 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-200 line-clamp-1">
                        Chương {chIdx + 1}: {cleanChapterTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{completedInChapter}/{chapter.lessons.length} bài</span>
                        {totalChapterMins > 0 && (
                          <>
                            <span>•</span>
                            <span>{totalChapterMins} phút</span>
                          </>
                        )}
                        {completedInChapter === chapter.lessons.length && chapter.lessons.length > 0 && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            • Đã hoàn thành
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400 hover:text-slate-200 transition-transform">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Chapter Lessons List */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-800/40 bg-slate-950">
                      {chapter.lessons.map((lesson, lessonIdx) => {
                        const isSelected = selectedLessonId === lesson.id;
                        const isDone = completedLessons.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson.id)}
                            className={`p-3.5 pl-5 flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-950/50 border-l-4 border-[#00B8DD]'
                                : 'hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span
                                className={`text-xs font-semibold shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'text-[#00B8DD] font-bold'
                                    : 'text-slate-500'
                                }`}
                              >
                                {lessonIdx + 1}.
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={`text-xs line-clamp-2 ${
                                    isSelected
                                      ? 'font-bold text-white'
                                      : 'font-medium text-slate-300'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-400">
                                    {lesson.duration_mins} phút
                                  </span>
                                  {lesson.is_free_preview && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800">
                                      Học thử
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 ml-2">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : isSelected ? (
                                <span className="w-2 h-2 rounded-full bg-[#00B8DD] animate-pulse" />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
