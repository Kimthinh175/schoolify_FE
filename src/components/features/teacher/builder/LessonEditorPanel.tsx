'use client';

import * as React from 'react';
import { FileQuestion, Trash2, Video, PlayCircle, Sparkles, Unlock, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-3">
        <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <FileQuestion className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Chưa chọn bài học</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Chọn một bài học trong cây bài học bên trái để chỉnh sửa thông tin, bài giảng video và tài liệu đính kèm.
          </p>
        </div>
      </div>
    );
  }

  // Tự động rút gọn hoặc xem trước video URL
  const isVideoUrlValid = lesson.video_url && lesson.video_url.startsWith('http');

  return (
    <div className="space-y-5">
      {/* Panel Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Soạn Bài Học
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cập nhật chi tiết nội dung, video bài giảng và tệp đính kèm.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 shrink-0 text-xs"
          onClick={onDelete}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Xoá bài
        </Button>
      </div>

      {/* Thông tin cơ bản */}
      <div className="space-y-3">
        <Input
          label="Tiêu đề bài học *"
          placeholder="VD: Bài 1: Tính đơn điệu & Cực trị của hàm số"
          value={lesson.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />

        <Textarea
          label="Nội dung / Tóm tắt bài học"
          placeholder="Ghi chú tóm tắt kiến thức cốt lõi, mục tiêu bài học..."
          value={lesson.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* Video Bài Giảng */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Video Bài Giảng
          </label>
          {isVideoUrlValid && (
            <Badge variant="success" className="text-[10px] py-0 px-2">
              Đã gắn Video
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="URL Video (YouTube, Vimeo, MP4 Cloud...)"
              value={lesson.video_url || ''}
              onChange={(e) => onChange({ video_url: e.target.value })}
            />
          </div>
          <div className="sm:col-span-4">
            <Input
              placeholder="Thời lượng (phút)"
              type="number"
              min={0}
              value={lesson.duration_mins ?? ''}
              onChange={(e) =>
                onChange({ duration_mins: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </div>
        </div>

        {isVideoUrlValid && (
          <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate font-mono text-[11px]">
                {lesson.video_url}
              </span>
            </div>
            <a
              href={lesson.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              Xem thử <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Cấu hình cho học thử */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mt-0.5">
            {lesson.is_free_preview ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Cho phép học thử miễn phí</p>
            <p className="text-[11px] text-slate-500">
              {lesson.is_free_preview
                ? 'Học sinh có thể xem video bài này trước khi mua khóa học.'
                : 'Yêu cầu học sinh mua khóa học mới có thể mở bài này.'}
            </p>
          </div>
        </div>
        <Switch
          checked={lesson.is_free_preview}
          onCheckedChange={(v) => onChange({ is_free_preview: v })}
          aria-label="Cho phép học thử miễn phí"
        />
      </div>

      {/* Tài liệu đính kèm LessonMaterial */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Tài Liệu Đính Kèm (LessonMaterial)
          </h4>
          <span className="text-[10px] text-slate-400">Hỗ trợ IMG, DOCX, EXCEL, PDF</span>
        </div>
        <LessonMaterialUploader
          lessonId={lesson.id}
          materials={lesson.materials || []}
          onChange={(materials: LessonMaterial[]) => onChange({ materials })}
        />
      </div>
    </div>
  );
}

