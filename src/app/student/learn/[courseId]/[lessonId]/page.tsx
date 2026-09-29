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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_COURSES } from '@/services/mock/data';
import { LessonTheoryTab } from '@/components/features/student/learn/LessonTheoryTab';

import { MathEditorToolbar } from '@/components/ui/math-editor-toolbar';
import { MathText, cleanOptionText } from '@/components/ui/math-text';

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
  const [activeTab, setActiveTab] = React.useState<'theory' | 'quiz' | 'materials'>('theory');
  const [essayAnswer, setEssayAnswer] = React.useState<string>(
    'Ta có: $\\tan(\\alpha) \\cdot \\cot(\\alpha) = 1 \\implies \\cot(\\alpha) = \\frac{1}{\\tan(\\alpha)} = -\\frac{4}{3}$.'
  );

  // Interactive Quiz & Essay States
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({});
  const [checkedQuiz, setCheckedQuiz] = React.useState<Record<string, boolean>>({});
  const [openHints, setOpenHints] = React.useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = React.useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
      {/* Top Focus Bar */}
      <header className="h-14 px-4 sm:px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời Không Gian Học</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
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
        {/* Left: Video Player & Lesson Details */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-100/70 dark:bg-black p-4 sm:p-6 space-y-6">
          {/* Video Container */}
          <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-slate-800">
            <video
              src={currentLesson?.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'}
              controls
              className="w-full h-full object-cover"
            />
          </div>

          {/* Lesson Content & Actions */}
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                {currentChapter && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
                      <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      {currentChapter.title}
                    </span>
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentLesson?.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Giảng dạy bởi: {course.teacher_name}</p>
              </div>

              <Button
                onClick={() => toggleComplete(currentLesson?.id || 'ls-01')}
                variant={completedLessons.includes(currentLesson?.id || 'ls-01') ? 'success' : 'outline'}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {completedLessons.includes(currentLesson?.id || 'ls-01') ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học'}
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('theory')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'theory'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Tab 1: Lý Thuyết</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Tab 2: Trắc Nghiệm & Tự Luận</span>
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'materials'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tab 3: Tài Liệu</span>
              </button>
            </div>

            {/* Tab Content Display */}
            {activeTab === 'theory' && (
              <LessonTheoryTab
                definitions={lessonContent?.theory?.definitions}
                formulas={lessonContent?.theory?.formulas}
                examples={lessonContent?.theory?.examples}
                onNavigateToQuiz={() => setActiveTab('quiz')}
              />
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-8">
                {/* 1. QUIZ SECTION */}
                {lessonContent?.quiz && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/40 shadow-xs">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          {lessonContent.quiz.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {lessonContent.quiz.description} ({lessonContent.quiz.totalQuestions} câu hỏi • Đạt: {lessonContent.quiz.passingScorePct}%)
                        </p>
                      </div>

                      {lessonContent?.exam?.examConfig && (
                        <Link href={`/student/exam/${lessonContent.exam.examConfig.examId}`}>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-md">
                            Vào Kiểm Tra 10 Phút Bài Này
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="space-y-4">
                      {lessonContent.quiz.questions.map((q) => {
                        const selectedOptId = quizAnswers[q.id];
                        const isChecked = Boolean(checkedQuiz[q.id]);
                        const correctOpt = q.options.find((o) => o.isCorrect);
                        const isCorrect = selectedOptId && correctOpt && selectedOptId === correctOpt.id;

                        return (
                          <div
                            key={q.id}
                            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                                  Câu {q.number}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">({q.points} điểm)</span>
                              </div>

                              {isChecked && (
                                <Badge
                                  variant={isCorrect ? 'success' : 'danger'}
                                  className="text-[11px] font-bold"
                                >
                                  {isCorrect ? 'Chính Xác! 🎉' : 'Chưa Chính Xác! ❌'}
                                </Badge>
                              )}
                            </div>

                            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                              <MathText text={q.content} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              {q.options.map((opt) => {
                                const isSelected = selectedOptId === opt.id;
                                let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50';

                                if (isChecked) {
                                  if (opt.isCorrect) {
                                    btnStyle = 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                                  } else if (isSelected && !opt.isCorrect) {
                                    btnStyle = 'border-rose-300 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
                                  }
                                } else if (isSelected) {
                                  btnStyle = 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/80 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-200 font-bold';
                                }

                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                      setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                                      setCheckedQuiz((prev) => ({ ...prev, [q.id]: false }));
                                    }}
                                    className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                                  >
                                    <div
                                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                                      }`}
                                    >
                                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                    </div>
                                    <span className="leading-snug">
                                      <MathText text={cleanOptionText(opt.content)} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <Button
                                size="sm"
                                disabled={!selectedOptId}
                                onClick={() => setCheckedQuiz((prev) => ({ ...prev, [q.id]: true }))}
                                className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs"
                              >
                                Kiểm Tra Đáp Án
                              </Button>

                              {isChecked && q.explain && (
                                <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 p-3 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 flex-1 ml-4">
                                  <span className="font-bold mr-1">💡 Hướng dẫn giải:</span>
                                  <MathText text={q.explain} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. ESSAY SECTION */}
                {lessonContent?.essay && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        {lessonContent.essay.title}
                      </h3>
                      <Badge variant="secondary" className="text-[10px]">
                        Tự Luận Rèn Luyện
                      </Badge>
                    </div>

                    {lessonContent.essay.problems.map((prob) => (
                      <div
                        key={prob.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            <MathText text={prob.title} />
                          </h4>
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {prob.maxPoints} điểm tối đa
                          </Badge>
                        </div>

                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <MathText text={prob.problemStatement} />
                        </div>

                        {/* Hints toggle */}
                        {prob.hints && prob.hints.length > 0 && (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setOpenHints((prev) => ({ ...prev, [prob.id]: !prev[prob.id] }))}
                              className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                            >
                              💡 {openHints[prob.id] ? 'Ẩn Gợi Ý Làm Bài' : 'Xem Gợi Ý Làm Bài'}
                            </button>

                            {openHints[prob.id] && (
                              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                                {prob.hints.map((h, hIdx) => (
                                  <p key={hIdx}>• <MathText text={h} /></p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Math Editor Assistant */}
                        <div className="pt-2">
                          <MathEditorToolbar
                            value={essayAnswer}
                            onChange={setEssayAnswer}
                            label="Bộ công cụ Soạn thảo Toán học (Math Editor Assistant):"
                            placeholder="Nhập hoặc chèn công thức trình bày bài giải của bạn..."
                          />
                        </div>

                        {/* Sample Solution Toggle */}
                        {prob.sampleSolution && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setOpenSolutions((prev) => ({ ...prev, [prob.id]: !prev[prob.id] }))}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                            >
                              ✨ {openSolutions[prob.id] ? 'Ẩn Lời Giải Mẫu' : 'Xem Lời Giải Mẫu Chi Tiết'}
                            </button>

                            {openSolutions[prob.id] && (
                              <div className="mt-2 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                                <span className="font-bold block text-emerald-800 dark:text-emerald-300">Lời giải chuẩn:</span>
                                <MathText text={prob.sampleSolution} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Tài Liệu Đính Kèm Của Bài Học
                </h4>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 font-bold border-0">
                      PDF
                    </Badge>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf (2.4 MB)
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs font-semibold" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Tải Xuống
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Playlist / Curriculum Grouped by Chapters */}
        <div className="w-full lg:w-84 xl:w-96 bg-white dark:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col h-auto lg:h-[calc(100vh-3.5rem)] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Nội Dung Khóa Học
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {course.chapters?.length || 0} Chương • {course.total_lessons || allLessons.length} Bài học
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {completedLessons.length}/{allLessons.length} đã xong
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {(course.chapters || []).map((chapter, chIdx) => {
              const isExpanded = !!expandedChapters[chapter.id];
              const completedInChapter = chapter.lessons.filter((l) => completedLessons.includes(l.id)).length;
              const isCurrentChapter = currentChapter?.id === chapter.id;
              const cleanChapterTitle =
                chapter.title.replace(/^Chương\s*\d+\s*[:.-]\s*/i, '').trim() || chapter.title;
              const totalChapterMins = chapter.lessons.reduce((sum, l) => sum + (l.duration_mins || 0), 0);

              return (
                <div key={chapter.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
                  {/* Chapter Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                      isCurrentChapter
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'bg-slate-50/70 dark:bg-slate-900/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        Chương {chIdx + 1}: {cleanChapterTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{completedInChapter}/{chapter.lessons.length} bài</span>
                        {totalChapterMins > 0 && (
                          <>
                            <span>•</span>
                            <span>{totalChapterMins} phút</span>
                          </>
                        )}
                        {completedInChapter === chapter.lessons.length && chapter.lessons.length > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            • Đã hoàn thành
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-transform">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Chapter Lessons List */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-slate-950">
                      {chapter.lessons.map((lesson, lessonIdx) => {
                        const isSelected = selectedLessonId === lesson.id;
                        const isDone = completedLessons.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson.id)}
                            className={`p-3.5 pl-5 flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-l-4 border-indigo-600 dark:border-indigo-500'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span
                                className={`text-xs font-semibold shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {lessonIdx + 1}.
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={`text-xs line-clamp-2 ${
                                    isSelected
                                      ? 'font-bold text-indigo-950 dark:text-white'
                                      : 'font-medium text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {lesson.duration_mins} phút
                                  </span>
                                  {lesson.is_free_preview && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
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
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
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
