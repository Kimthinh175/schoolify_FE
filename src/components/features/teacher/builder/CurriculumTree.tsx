'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  PlayCircle,
  Paperclip,
  Lock,
  Unlock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CourseChapter, Lesson } from '@/types';

// Sinh id (đặt ở module scope để không gọi hàm impure trong thân component)
const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

const renumber = (chapters: CourseChapter[]): CourseChapter[] =>
  chapters.map((ch, chIdx) => ({
    ...ch,
    order_index: chIdx + 1,
    lessons: ch.lessons.map((l, lIdx) => ({ ...l, chapter_id: ch.id, order_index: lIdx + 1 })),
  }));

/** Cây bài học đa cấp (Chương → Bài), kéo thả cập nhật order_index (ERD: CourseChapter, Lesson) */
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
    onChange(
      renumber([
        ...chapters,
        {
          id,
          course_id: chapters[0]?.course_id || '',
          title: `Chương ${chapters.length + 1}`,
          order_index: chapters.length + 1,
          lessons: [],
        },
      ])
    );
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
      duration_mins: 0,
      is_free_preview: false,
      order_index: 0,
      materials: [],
    };
    onChange(chapters.map((c) => (c.id === chapterId ? { ...c, lessons: [...c.lessons, newLesson] } : c)));
    onSelectLesson(id);
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
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-10 text-center">
          <Layers className="w-7 h-7 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Chưa có chương nào. Thêm chương đầu tiên để bắt đầu.</p>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {chapters.map((chapter, chIdx) => (
          <div
            key={chapter.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => moveChapter(chIdx, -1)}
                  disabled={chIdx === 0}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  aria-label="Đưa chương lên"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveChapter(chIdx, 1)}
                  disabled={chIdx === chapters.length - 1}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  aria-label="Đưa chương xuống"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={chapter.title}
                onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-900 dark:text-white px-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00B8DD]"
              />
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                {chapter.lessons.length} bài
              </span>
              <button
                type="button"
                onClick={() => removeChapter(chapter.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer"
                aria-label="Xoá chương"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Droppable droppableId={chapter.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'p-2 space-y-1.5 min-h-[44px] transition-colors',
                    snapshot.isDraggingOver && 'bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/10'
                  )}
                >
                  {chapter.lessons.map((lesson, idx) => (
                    <Draggable draggableId={lesson.id} index={idx} key={lesson.id}>
                      {(p, s) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          onClick={() => onSelectLesson(lesson.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border bg-white dark:bg-slate-900 px-2 py-2 cursor-pointer transition-all',
                            selectedLessonId === lesson.id
                              ? 'border-[#00B8DD] ring-1 ring-[#00B8DD]/40'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300',
                            s.isDragging && 'shadow-lg ring-2 ring-[#00B8DD]/40'
                          )}
                        >
                          <span
                            {...p.dragHandleProps}
                            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
                            aria-label="Kéo để sắp xếp"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <span className="h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {lesson.title || 'Bài học chưa đặt tên'}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="inline-flex items-center gap-1">
                                {lesson.is_free_preview ? (
                                  <><Unlock className="w-3 h-3 text-emerald-500" /> Học thử</>
                                ) : (
                                  <><Lock className="w-3 h-3" /> Trả phí</>
                                )}
                              </span>
                              {lesson.duration_mins ? (
                                <span className="inline-flex items-center gap-1">
                                  <PlayCircle className="w-3 h-3" /> {lesson.duration_mins}p
                                </span>
                              ) : null}
                              {(lesson.materials?.length || 0) > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" /> {lesson.materials?.length}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLesson(chapter.id, lesson.id);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                            aria-label="Xoá bài học"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button
                    type="button"
                    onClick={() => addLesson(chapter.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-2 text-[11px] font-semibold text-slate-500 hover:border-[#00B8DD] hover:text-[#007D99] dark:hover:text-[#00B8DD] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm bài học
                  </button>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>

      <Button
        size="sm"
        variant="outline"
        className="w-full justify-center"
        onClick={addChapter}
        leftIcon={<Plus className="w-4 h-4" />}
      >
        Thêm chương mới
      </Button>
    </div>
  );
}
