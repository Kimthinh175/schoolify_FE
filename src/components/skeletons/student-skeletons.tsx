import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonRoot, SkeletonSurface } from './SkeletonFrame';

/** Skeleton chuẩn cho /profile, /student và /student/dashboard */
export function StudentAccountSkeleton() {
  return (
    <SkeletonRoot label="Đang tải hồ sơ và tổng quan học tập" className="space-y-6 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800 space-y-2">
        <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
        <Skeleton className="h-8 w-64 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* 4 KPI cards tổng quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonSurface key={idx} className="p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton variant={idx === 0 ? 'amber' : 'brand'} className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-3 w-32 rounded" />
          </SkeletonSurface>
        ))}
      </div>

      {/* Thẻ Profile & Khung Avatar */}
      <SkeletonSurface className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton variant="brand" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton variant="brand" className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 max-w-full rounded mx-auto sm:mx-0" />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <Skeleton className="h-4 w-44 rounded" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton variant="brand" className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>
      </SkeletonSurface>

      {/* Grid Form 12 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SkeletonSurface className="lg:col-span-7 p-5 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton variant="brand" className="h-11 w-40 rounded-xl mt-2" />
        </SkeletonSurface>

        <SkeletonSurface className="lg:col-span-5 p-5 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <div className="space-y-3.5 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton variant="brand" className="h-11 w-40 rounded-xl mt-2" />
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/practice và /student/practice/[subjectSlug]/[level] */
export function PracticeRoadmapSkeleton() {
  return (
    <SkeletonRoot label="Đang tải lộ trình luyện tập" className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant={i === 0 ? 'brand' : 'default'} className="h-10 w-28 rounded-xl" />
          ))}
        </div>
        <Skeleton variant="brand" className="h-10 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-4 flex items-center gap-3">
            <Skeleton variant="brand" className="w-11 h-11 rounded-2xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>
          </SkeletonSurface>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="brand" className="w-11 h-11 rounded-2xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-60 max-w-full rounded-lg" />
                  <Skeleton className="h-3.5 w-80 max-w-full rounded" />
                </div>
              </div>
              <Skeleton variant="brand" className="h-9 w-28 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} variant="subtle" className="h-12 rounded-xl" />
              ))}
            </div>
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/practice/exam-room và /student/exam/[examId] (Full-screen Focus Layout) */
export function ExamRoomSkeleton() {
  return (
    <SkeletonRoot label="Đang tải phòng làm bài thi" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top sticky header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-9 w-20 rounded-xl shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-56 max-w-full rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton variant="amber" className="h-10 w-24 rounded-xl" />
          <Skeleton variant="brand" className="h-10 w-28 rounded-xl" />
        </div>
      </header>

      {/* Main 2 columns */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột câu hỏi */}
        <div className="lg:col-span-8 space-y-5">
          <SkeletonSurface className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Skeleton variant="brand" className="h-7 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-11/12 rounded-lg" />
              <Skeleton className="h-5 w-2/3 rounded-lg" />
            </div>
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="subtle" className="h-14 w-full rounded-2xl" />
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton variant="brand" className="h-11 w-32 rounded-xl" />
            </div>
          </SkeletonSurface>
        </div>

        {/* Cột bảng điều hướng câu hỏi */}
        <div className="lg:col-span-4 space-y-4">
          <SkeletonSurface className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton variant="brand" className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 pt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} variant={i === 0 ? 'brand' : 'default'} className="h-10 rounded-xl" />
              ))}
            </div>
          </SkeletonSurface>
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/practice/remediation */
export function RemediationSkeleton() {
  return (
    <SkeletonRoot label="Đang tải phòng phục thù câu sai" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton variant="brand" className="h-5 w-48 rounded-lg" />
        </div>
        <Skeleton variant="brand" className="h-9 w-32 rounded-full" />
      </header>
      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <SkeletonSurface className="lg:col-span-7 p-6 space-y-4">
            <Skeleton variant="amber" className="h-6 w-36 rounded-full" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-5/6 rounded-lg" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="subtle" className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </SkeletonSurface>
          <SkeletonSurface className="lg:col-span-5 p-6 space-y-4">
            <Skeleton variant="brand" className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-11/12 rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton variant="brand" className="h-24 w-full rounded-2xl" />
          </SkeletonSurface>
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/learn/[courseId]/[lessonId] */
export function LessonPlayerSkeleton() {
  return (
    <SkeletonRoot label="Đang tải phòng học bài giảng" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-5 w-60 max-w-full rounded-lg" />
        </div>
        <Skeleton variant="brand" className="h-9 w-32 rounded-xl" />
      </header>
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <SkeletonSurface className="p-5 space-y-3">
            <Skeleton className="h-6 w-72 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </SkeletonSurface>
        </div>
        <SkeletonSurface className="lg:col-span-4 p-4 space-y-3">
          <Skeleton className="h-5 w-40 rounded-lg" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant={i === 1 ? 'brand' : 'subtle'} className="h-12 w-full rounded-xl" />
          ))}
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/exams */
export function ExamsHistorySkeleton() {
  return (
    <SkeletonRoot label="Đang tải lịch sử bài thi" className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <Skeleton variant="brand" className="h-11 w-44 rounded-xl" />
      </div>
      <div className="space-y-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Skeleton variant="brand" className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} variant="subtle" className="h-11 rounded-xl" />
              ))}
            </div>
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/store */
export function StorePageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải cửa hàng vật phẩm" className="space-y-6 pb-12">
      <SkeletonSurface className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton variant="brand" className="h-5 w-32 rounded-full mx-auto sm:mx-0" />
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="amber" className="h-12 w-32 rounded-2xl" />
          <Skeleton variant="brand" className="h-12 w-32 rounded-2xl" />
        </div>
      </SkeletonSurface>

      <div className="flex flex-wrap gap-2">
        {[120, 130, 110, 116].map((w, i) => (
          <Skeleton key={i} variant={i === 0 ? 'brand' : 'default'} className="h-10 rounded-xl" style={{ width: w }} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton variant="amber" className="h-7 w-24 rounded-full" />
              <Skeleton variant="brand" className="h-10 w-28 rounded-xl" />
            </div>
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/inventory */
export function InventoryPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải kho đồ cá nhân" className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton variant="brand" className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <Skeleton variant="brand" className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 flex items-start gap-4">
            <Skeleton variant="brand" className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-44 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton variant="brand" className="h-9 w-28 rounded-xl mt-2" />
            </div>
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /student/rewards */
export function RewardsPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải trung tâm điểm thưởng và nhiệm vụ" className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton variant={i === 1 ? 'amber' : 'brand'} className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-3.5 w-40 rounded" />
          </SkeletonSurface>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSurface key={i} className="p-5 space-y-3">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton variant="brand" className="h-10 w-full rounded-xl mt-2" />
          </SkeletonSurface>
        ))}
      </div>
    </SkeletonRoot>
  );
}
