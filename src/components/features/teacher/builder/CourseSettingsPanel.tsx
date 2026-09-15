'use client';

import * as React from 'react';
import { Store, AlertCircle, BookOpen, Users, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Course } from '@/types';

const STATUS_META: Record<
  Course['status'],
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  DRAFT: { label: 'Bản nháp', variant: 'secondary' },
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  REJECTED: { label: 'Bị từ chối', variant: 'danger' },
  HIDDEN: { label: 'Đang ẩn', variant: 'outline' },
};

/** Panel cài đặt Course: thông tin + Switch is_marketplace + giá price (ERD: Course) */
export function CourseSettingsPanel({
  course,
  onChange,
}: {
  course: Course;
  onChange: (patch: Partial<Course>) => void;
}) {
  const meta = STATUS_META[course.status] || STATUS_META.DRAFT;
  const priceInvalid = course.is_marketplace && (!course.price || course.price <= 0);
  const lessonCount = course.chapters?.reduce((sum, ch) => sum + ch.lessons.length, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cài Đặt Khóa Học</h3>
          <p className="text-[11px] text-slate-500">Thông tin công khai & cấu hình mở bán.</p>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      <Input
        label="Tên khóa học *"
        placeholder="VD: Toán 12: Chuyên Đề Hàm Số"
        value={course.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />

      <Textarea
        label="Mô tả khóa học"
        placeholder="Giới thiệu mục tiêu, đối tượng học viên..."
        value={course.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
      />

      <Input
        label="Ảnh thumbnail (URL)"
        placeholder="https://..."
        value={course.thumbnail_url || ''}
        onChange={(e) => onChange({ thumbnail_url: e.target.value })}
        leftIcon={<ImageIcon className="w-4 h-4" />}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Store className="w-4 h-4 mt-0.5 text-[#007D99] dark:text-[#00B8DD] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Bán trên Marketplace</p>
              <p className="text-[11px] text-slate-500">Bật để công khai bán cho học sinh toàn nền tảng.</p>
            </div>
          </div>
          <Switch
            checked={course.is_marketplace}
            onCheckedChange={(v) => onChange({ is_marketplace: v })}
            aria-label="Bán trên Marketplace"
          />
        </div>

        <Input
          label="Giá bán (VNĐ)"
          type="number"
          min={0}
          value={course.price}
          onChange={(e) => onChange({ price: e.target.value === '' ? 0 : Number(e.target.value) })}
          error={priceInvalid ? 'Cần nhập giá > 0 khi mở bán trên Marketplace.' : undefined}
          helperText={!course.is_marketplace ? 'Nhập 0 nếu chỉ phát hành nội bộ (miễn phí).' : undefined}
        />

        {priceInvalid && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Khóa học chưa thể xuất bản Marketplace khi giá = 0.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
          <p className="text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Bài học
          </p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{lessonCount}</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
          <p className="text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Học viên
          </p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {(course.total_students || 0).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}
