'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Paperclip,
  Lock,
  Unlock,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CourseChapter, Lesson } from '@/types';

const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

const renumber = (chapters: CourseChapter[]): CourseChapter[] =>
  chapters.map((ch, chIdx) => ({
    ...ch,
    order_index: chIdx + 1,
    lessons: ch.lessons.map((l, lIdx) => ({ ...l, chapter_id: ch.id, order_index: lIdx + 1 })),
  }));

/** Cây bài học đa cấp (Chương → Bài), hỗ trợ thu gọn/mở rộng & kéo thả order_index */
export function CurriculumTree({
  chapters,
  selectedLessonId,
  onSelectLesson,
  onChange,
}: {
  chapters: CourseChapter[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  onChange: (chapters: CourseChapter[]) => void;
}) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const toggleChapter = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const next = chapters.map((ch) => ({ ...ch, lessons: [...ch.lessons] }));
    const src = next.find((c) => c.id === source.droppableId);
    const dst = next.find((c) => c.id === destination.droppableId);
    if (!src || !dst) return;
    const [moved] = src.lessons.splice(source.index, 1);
    if (!moved) return;
    dst.lessons.splice(destination.index, 0, moved);
    onChange(renumber(next));
  };

  const addChapter = () => {
    const id = makeId('ch');
    const newChapters = renumber([
      ...chapters,
      {
        id,
        course_id: chapters[0]?.course_id || '',
        title: `Chương ${chapters.length + 1}: Tiêu đề chương mới`,
        order_index: chapters.length + 1,
        lessons: [],
      },
    ]);
    onChange(newChapters);
  };

  const updateChapter = (id: string, patch: Partial<CourseChapter>) =>
    onChange(chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const removeChapter = (id: string) => onChange(renumber(chapters.filter((c) => c.id !== id)));

  const moveChapter = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= chapters.length) return;
    const next = [...chapters];
    const [it] = next.splice(index, 1);
    next.splice(target, 0, it);
    onChange(renumber(next));
  };

  const addLesson = (chapterId: string) => {
    const id = makeId('ls');
    const newLesson: Lesson = {
      id,
      chapter_id: chapterId,
      title: 'Bài học mới (chưa đặt tên)',
      content: '',
      video_url: '',
      duration_mins: 15,
      is_free_preview: false,
      order_index: 0,
      materials: [],
    };
    onChange(chapters.map((c) => (c.id === chapterId ? { ...c, lessons: [...c.lessons, newLesson] } : c)));
    onSelectLesson(id);
    setCollapsed((prev) => ({ ...prev, [chapterId]: false }));
  };

  const removeLesson = (chapterId: string, lessonId: string) =>
    onChange(
      renumber(
        chapters.map((c) =>
          c.id === chapterId ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) } : c
        )
      )
    );

  return (
    <div className="space-y-3">
      {chapters.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">Chưa có chương học nào</p>
            <p className="text-xs text-slate-500 mt-0.5">Hãy tạo chương đầu tiên để bắt đầu thêm bài giảng.</p>
          </div>
          <Button size="sm" onClick={addChapter} leftIcon={<Plus className="w-4 h-4" />}>
            Tạo chương 1
          </Button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {chapters.map((chapter, chIdx) => {
          const isCollapsed = !!collapsed[chapter.id];
          const totalDuration = chapter.lessons.reduce((sum, l) => sum + (l.duration_mins || 0), 0);

          return (
            <div
              key={chapter.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 overflow-hidden transition-all"
            >
              {/* Header của Chương */}
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isCollapsed ? 'Mở rộng chương' : 'Thu gọn chương'}
                  >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />

                  <input
                    value={chapter.title}
                    onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                    placeholder="Tên chương..."
                    className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-900 dark:text-white px-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
                    {chapter.lessons.length} bài • {totalDuration}p
                  </Badge>

                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => moveChapter(chIdx, -1)}
                      disabled={chIdx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Chuyển lên"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveChapter(chIdx, 1)}
                      disabled={chIdx === chapters.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Chuyển xuống"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Nút Xoá Chương - Nổi bật màu Đỏ/Rose */}
                  <button
                    type="button"
                    onClick={() => removeChapter(chapter.id)}
                    className="p-1.5 rounded-lg text-rose-600 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/80 transition-colors cursor-pointer"
                    title="Xóa chương"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Danh sách bài học của Chương */}
              {!isCollapsed && (
                <Droppable droppableId={chapter.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'p-2 space-y-1.5 min-h-[44px] transition-colors',
                        snapshot.isDraggingOver && 'bg-indigo-50/50 dark:bg-indigo-950/20'
                      )}
                    >
                      {chapter.lessons.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400 italic">
                          Chương này chưa có bài học.
                        </div>
                      ) : (
                        chapter.lessons.map((lesson, idx) => (
                          <Draggable draggableId={lesson.id} index={idx} key={lesson.id}>
                            {(p, s) => {
                              const isSelected = selectedLessonId === lesson.id;
                              return (
                                <div
                                  ref={p.innerRef}
                                  {...p.draggableProps}
                                  onClick={() => onSelectLesson(lesson.id)}
                                  className={cn(
                                    'flex items-center gap-2 rounded-xl border bg-white dark:bg-slate-900 px-2.5 py-2 cursor-pointer transition-all group',
                                    isSelected
                                      ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/30 dark:ring-indigo-400/40 bg-indigo-50/30 dark:bg-indigo-950/30'
                                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                                    s.isDragging && 'shadow-xl ring-2 ring-indigo-500/50 opacity-90'
                                  )}
                                >
                                  <span
                                    {...p.dragHandleProps}
                                    className="text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-grab active:cursor-grabbing shrink-0"
                                    title="Kéo để đổi thứ tự"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </span>

                                  <span className="h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={cn(
                                        'text-xs font-semibold truncate',
                                        isSelected
                                          ? 'text-indigo-600 dark:text-indigo-400'
                                          : 'text-slate-800 dark:text-slate-100'
                                      )}
                                    >
                                      {lesson.title || 'Bài học chưa đặt tên'}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      <span className="inline-flex items-center gap-1 font-medium">
                                        {lesson.is_free_preview ? (
                                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                            <Unlock className="w-3 h-3" /> Học thử
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 text-slate-400">
                                            <Lock className="w-3 h-3" /> Trả phí
                                          </span>
                                        )}
                                      </span>
                                      {lesson.duration_mins ? (
                                        <span className="inline-flex items-center gap-1">
                                          <PlayCircle className="w-3 h-3 text-slate-400" /> {lesson.duration_mins} phút
                                        </span>
                                      ) : null}
                                      {(lesson.materials?.length || 0) > 0 && (
                                        <span className="inline-flex items-center gap-1 text-indigo-500 font-medium">
                                          <Paperclip className="w-3 h-3" /> {lesson.materials?.length} tài liệu
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Nút Xoá Bài Học - Nổi bật màu Đỏ/Rose */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLesson(chapter.id, lesson.id);
                                    }}
                                    className="rounded-lg p-1.5 text-rose-600 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/80 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                                    title="Xoá bài học"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            }}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}

                      <button
                        type="button"
                        onClick={() => addLesson(chapter.id)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm bài học mới
                      </button>
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          );
        })}
      </DragDropContext>

      {chapters.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          onClick={addChapter}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Thêm chương học mới
        </Button>
      )}
    </div>
  );
}
