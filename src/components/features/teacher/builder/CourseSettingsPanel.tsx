'use client';

import * as React from 'react';
import { Store, AlertCircle, BookOpen, Users, ImageIcon, Clock, CheckCircle2 } from 'lucide-react';
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
  const totalDurationMins =
    course.chapters?.reduce(
      (sum, ch) => sum + ch.lessons.reduce((lSum, l) => lSum + (l.duration_mins || 0), 0),
      0
    ) || 0;

  const formatVND = (val: number) =>
    val === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cài Đặt Khóa Học</h3>
          <p className="text-[11px] text-slate-500">Cấu hình mở bán & thông tin chung.</p>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      {/* Xem trước Thumbnail */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900">
        {course.thumbnail_url ? (
          <div className="relative h-28 w-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnail_url}
              alt="Thumbnail"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
              Ảnh xem trước
            </div>
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-[11px]">Chưa có ảnh bìa</span>
          </div>
        )}
      </div>

      <Input
        label="Tên khóa học *"
        placeholder="VD: Toán 12: Chuyên Đề Hàm Số"
        value={course.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />

      <Textarea
        label="Mô tả tóm tắt"
        placeholder="Giới thiệu mục tiêu, đối tượng học viên..."
        value={course.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        className="min-h-[80px]"
      />

      <Input
        label="URL Ảnh bìa (Thumbnail)"
        placeholder="https://..."
        value={course.thumbnail_url || ''}
        onChange={(e) => onChange({ thumbnail_url: e.target.value })}
        leftIcon={<ImageIcon className="w-4 h-4" />}
      />

      {/* Thẻ Bán Marketplace */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 bg-indigo-50/30 dark:bg-indigo-950/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Store className="w-4 h-4 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Bán trên Marketplace</p>
              <p className="text-[11px] text-slate-500">Mở bán khóa học cho học sinh toàn nền tảng.</p>
            </div>
          </div>
          <Switch
            checked={course.is_marketplace}
            onCheckedChange={(v) => onChange({ is_marketplace: v })}
            aria-label="Bán trên Marketplace"
          />
        </div>

        <div>
          <Input
            label="Giá bán khóa học (VNĐ)"
            type="number"
            min={0}
            value={course.price}
            onChange={(e) => onChange({ price: e.target.value === '' ? 0 : Number(e.target.value) })}
            error={priceInvalid ? 'Giá phải lớn hơn 0đ khi mở bán Marketplace.' : undefined}
          />
          {course.price > 0 && (
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              Giá hiển thị: {formatVND(course.price)}
            </p>
          )}
        </div>

        {priceInvalid && (
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Chưa thể đăng bán Marketplace nếu giá = 0đ.
          </p>
        )}
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <BookOpen className="w-3 h-3" /> Bài học
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{lessonCount}</p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Tổng giờ
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {Math.round(totalDurationMins / 60)}h {totalDurationMins % 60}p
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Users className="w-3 h-3" /> Học viên
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {(course.total_students || 0).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}

