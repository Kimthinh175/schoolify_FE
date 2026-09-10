'use client';

import * as React from 'react';
import { FileQuestion, Trash2, Video, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Lesson, LessonMaterial } from '@/types';
import { LessonMaterialUploader } from './LessonMaterialUploader';

export function LessonEditorPanel({
  lesson,
  onChange,
  onDelete,
}: {
  lesson: Lesson | undefined;
  onChange: (patch: Partial<Lesson>) => void;
  onDelete: () => void;
}) {
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-3">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chưa chọn bài học</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Chọn một bài học trong Cây bài học bên trái để soạn nội dung, video và tài liệu đính kèm.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Soạn Nội Dung Bài Học</h3>
          <p className="text-[11px] text-slate-500">Cập nhật tiêu đề, nội dung, video và tài liệu đính kèm.</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 shrink-0"
          onClick={onDelete}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Xoá bài
        </Button>
      </div>

      <Input
        label="Tiêu đề bài học *"
        placeholder="VD: Bài 1: Tính đơn điệu & Cực trị của hàm số"
        value={lesson.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />

      <Textarea
        label="Nội dung / Mô tả bài học"
        placeholder="Tóm tắt kiến thức, mục tiêu bài học..."
        value={lesson.content || ''}
        onChange={(e) => onChange({ content: e.target.value })}
        className="min-h-[120px]"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Video URL"
          placeholder="https://..."
          value={lesson.video_url || ''}
          onChange={(e) => onChange({ video_url: e.target.value })}
          leftIcon={<Video className="w-4 h-4" />}
        />
        <Input
          label="Thời lượng (phút)"
          type="number"
          min={0}
          value={lesson.duration_mins ?? ''}
          onChange={(e) => onChange({ duration_mins: e.target.value === '' ? undefined : Number(e.target.value) })}
        />
      </div>

      {lesson.video_url ? (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">
          <PlayCircle className="w-4 h-4 text-[#007D99] dark:text-[#00B8DD] shrink-0" />
          <span className="truncate">Xem trước: {lesson.video_url}</span>
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-3">
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Cho học thử miễn phí</p>
          <p className="text-[11px] text-slate-500">Bật để học sinh xem trước bài này khi chưa mua khóa học.</p>
        </div>
        <Switch
          checked={lesson.is_free_preview}
          onCheckedChange={(v) => onChange({ is_free_preview: v })}
          aria-label="Cho học thử miễn phí"
        />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Tài Liệu Đính Kèm (LessonMaterial)</p>
        <LessonMaterialUploader
          lessonId={lesson.id}
          materials={lesson.materials || []}
          onChange={(materials: LessonMaterial[]) => onChange({ materials })}
        />
      </div>
    </div>
  );
}
