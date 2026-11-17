import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonRoot, SkeletonSurface } from './SkeletonFrame';

/** Skeleton chuẩn cho /teacher và /teacher/dashboard */
export function TeacherDashboardSkeleton() {
  return (
    <SkeletonRoot label="Đang tải bảng điều khiển giáo viên" className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton variant="brand" className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton variant="brand" className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded" />
          </SkeletonSurface>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SkeletonSurface className="lg:col-span-8 p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </SkeletonSurface>
        <SkeletonSurface className="lg:col-span-4 p-6 space-y-3">
          <Skeleton className="h-6 w-40 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="subtle" className="h-12 w-full rounded-xl" />
          ))}
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /teacher/courses */
export function TeacherCoursesSkeleton() {
  return (
    <SkeletonRoot label="Đang tải quản lý khóa học" className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <Skeleton variant="brand" className="h-11 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSurface key={i} className="overflow-hidden flex flex-col">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton variant="brand" className="h-6 w-24 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /teacher/courses/builder (khớp 3 cột 5/4/3) */
export function CourseBuilderSkeleton() {
  return (
    <SkeletonRoot label="Đang tải trình biên soạn khóa học" className="space-y-6 pb-10">
      <SkeletonSurface className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
          <Skeleton className="h-7 w-72 max-w-full rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton variant="brand" className="h-10 w-36 rounded-xl" />
        </div>
      </SkeletonSurface>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <SkeletonSurface className="lg:col-span-5 p-5 space-y-3 min-h-[480px]">
          <Skeleton className="h-6 w-40 rounded-lg" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="subtle" className="h-14 w-full rounded-xl" />
          ))}
        </SkeletonSurface>
        <SkeletonSurface className="lg:col-span-4 p-5 space-y-4 min-h-[480px]">
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </SkeletonSurface>
        <SkeletonSurface className="lg:col-span-3 p-5 space-y-3 min-h-[480px]">
          <Skeleton className="h-6 w-36 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="subtle" className="h-11 w-full rounded-xl" />
          ))}
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /teacher/grading/[submissionId] */
export function GradingDetailSkeleton() {
  return (
    <SkeletonRoot label="Đang tải chi tiết chấm bài" className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <Skeleton variant="brand" className="h-11 w-36 rounded-xl" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-6 space-y-3">
            <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /teacher/revenue và /teacher/rewards */
export function TeacherAnalyticsSkeleton() {
  return (
    <SkeletonRoot label="Đang tải thống kê giảng viên" className="space-y-6 pb-10">
      <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-60 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton variant={i === 0 ? 'brand' : 'default'} className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-3.5 w-36 rounded" />
          </SkeletonSurface>
        ))}
      </div>
      <SkeletonSurface className="p-6 space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </SkeletonSurface>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /admin/dashboard */
export function AdminDashboardSkeleton() {
  return (
    <SkeletonRoot label="Đang tải tổng quan quản trị hệ thống" className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton variant="brand" className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded" />
          </SkeletonSurface>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonSurface className="p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </SkeletonSurface>
        <SkeletonSurface className="p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </SkeletonSurface>
      </div>

      <SkeletonSurface className="p-6 space-y-3">
        <Skeleton className="h-6 w-44 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="subtle" className="h-12 w-full rounded-xl" />
        ))}
      </SkeletonSurface>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho các trang quản trị dạng bảng & bộ lọc (/admin/users, exams, orders, schools, questions, packages, teacher/classes, questions, grading) */
export function AdminManagementTableSkeleton({ label = 'Đang tải danh sách dữ liệu' }: { label?: string }) {
  return (
    <SkeletonRoot label={label} className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton variant="brand" className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-4 space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton variant="brand" className="h-7 w-16 rounded-lg" />
          </SkeletonSurface>
        ))}
      </div>

      <SkeletonSurface className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-full sm:w-40 rounded-xl" />
          <Skeleton className="h-11 w-full sm:w-40 rounded-xl" />
        </div>
        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="subtle" className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </SkeletonSurface>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /admin/behavior */
export function AdminBehaviorSkeleton() {
  return (
    <SkeletonRoot label="Đang tải phân tích hành vi người dùng" className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-36 rounded-full" />
          <Skeleton className="h-8 w-72 max-w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton variant="brand" className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-3 w-36 rounded" />
          </SkeletonSurface>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SkeletonSurface className="lg:col-span-7 p-6 space-y-4">
          <Skeleton className="h-6 w-52 rounded-lg" />
          <div className="grid grid-cols-7 gap-2 pt-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} variant={i % 5 === 0 ? 'brand' : 'subtle'} className="h-8 rounded-lg" />
            ))}
          </div>
        </SkeletonSurface>
        <SkeletonSurface className="lg:col-span-5 p-6 space-y-3">
          <Skeleton className="h-6 w-44 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="subtle" className="h-12 w-full rounded-xl" />
          ))}
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /admin/exams/create-matrix, /admin/questions/create, /admin/questions/import */
export function AdminFormBuilderSkeleton() {
  return (
    <SkeletonRoot label="Đang tải trình tạo nội dung" className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <Skeleton variant="brand" className="h-11 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SkeletonSurface className="lg:col-span-7 p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
        </SkeletonSurface>
        <SkeletonSurface className="lg:col-span-5 p-6 space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton variant="brand" className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton variant="brand" className="h-12 w-full rounded-2xl" />
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}
