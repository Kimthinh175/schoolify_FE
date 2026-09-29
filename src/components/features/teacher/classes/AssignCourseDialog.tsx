'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Course } from '@/types';
import { assignCoursesSchema, AssignCoursesValues } from './class.schema';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ duyệt',
  PUBLISHED: 'Đã xuất bản',
  REJECTED: 'Bị từ chối',
  HIDDEN: 'Đang ẩn',
};

export function AssignCourseDialog({
  isOpen,
  onClose,
  classLabel,
  courses,
  assignedCourseIds,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  classLabel: string;
  courses: Course[];
  assignedCourseIds: string[];
  onSave: (courseIds: string[]) => void;
}) {
  const { register, handleSubmit, reset } = useForm<AssignCoursesValues>({
    resolver: zodResolver(assignCoursesSchema),
    defaultValues: { course_ids: assignedCourseIds },
  });

  React.useEffect(() => {
    if (isOpen) reset({ course_ids: assignedCourseIds });
  }, [isOpen, assignedCourseIds, reset]);

  const submit = (values: AssignCoursesValues) => {
    onSave(values.course_ids);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Phân Công Khóa Học Vào Lớp"
      description={classLabel}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4 py-2">
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {courses.length === 0 && (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có khóa học nào để phân công.</p>
          )}
          {courses.map((c) => (
            <label
              key={c.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <input
                type="checkbox"
                value={c.id}
                className="mt-0.5 rounded accent-[#00B8DD] cursor-pointer"
                {...register('course_ids')}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {STATUS_LABEL[c.status] || c.status}
                  </Badge>
                  <span className="text-[11px] text-slate-500">
                    {c.price === 0 ? 'Miễn phí' : `${c.price.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>

        <Button type="submit" className="w-full justify-center" leftIcon={<Save className="w-4 h-4" />}>
          Lưu Phân Công
        </Button>
      </form>
    </Dialog>
  );
}
