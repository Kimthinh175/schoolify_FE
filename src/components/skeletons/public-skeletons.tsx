import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonRoot, SkeletonSurface } from './SkeletonFrame';

/** Skeleton chuẩn layout thật trang /luyen-thi */
export function LuyenThiPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải cổng luyện thi Schoolify" className="min-h-screen bg-slate-50/40 dark:bg-slate-950">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <Skeleton variant="brand" className="h-7 w-56 rounded-full mx-auto" />
            <div className="space-y-3">
              <Skeleton className="h-10 sm:h-12 w-full max-w-2xl rounded-2xl mx-auto" />
              <Skeleton variant="brand" className="h-10 sm:h-12 w-3/4 max-w-lg rounded-2xl mx-auto" />
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full max-w-xl mx-auto rounded-md" />
              <Skeleton className="h-4 w-4/5 max-w-md mx-auto rounded-md" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Skeleton variant="brand" className="h-12 w-48 rounded-2xl" />
              <Skeleton className="h-12 w-44 rounded-2xl" />
            </div>
            <div className="pt-2 flex justify-center">
              <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
            </div>
          </div>

          {/* 2 Khối nổi bật: Toán Học & Tin Học */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            {[0, 1].map((idx) => (
              <SkeletonSurface key={idx} className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton variant="brand" className="w-11 h-11 rounded-xl" />
                  <Skeleton className="h-6 w-36 rounded-full" />
                </div>
                <Skeleton className="h-6 w-44 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton variant="brand" className="h-5 w-32 rounded-lg" />
                </div>
              </SkeletonSurface>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 3 Thẻ Cấp Độ */}
      <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64 rounded-xl" />
            <Skeleton className="h-4 w-80 max-w-full rounded" />
          </div>
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <SkeletonSurface key={i} className="p-6 space-y-4 flex flex-col justify-between min-h-[210px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton variant={i === 1 ? 'brand' : 'default'} className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton variant="brand" className="h-4 w-24 rounded" />
              </div>
            </SkeletonSurface>
          ))}
        </div>
      </section>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /luyen-thi/chuyen-de/[subject] */
export function ChuyenDeRoadmapSkeleton() {
  return (
    <SkeletonRoot label="Đang tải bản đồ chuyên đề" className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton variant="brand" className="h-4 w-32 rounded" />
        </div>

        <SkeletonSurface className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2">
              <Skeleton variant="brand" className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-9 w-80 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-2xl rounded" />
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Skeleton variant="brand" className="h-12 w-44 rounded-2xl" />
            <Skeleton className="h-12 w-36 rounded-2xl" />
          </div>
        </SkeletonSurface>

        <div className="space-y-5">
          {[0, 1, 2, 3].map((idx) => (
            <SkeletonSurface key={idx} className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="brand" className="w-11 h-11 rounded-2xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-64 max-w-full rounded-lg" />
                    <Skeleton className="h-3.5 w-80 max-w-full rounded" />
                  </div>
                </div>
                <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} variant="subtle" className="h-14 rounded-2xl" />
                ))}
              </div>
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /courses */
export function CoursesPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải danh sách khóa học" className="min-h-screen bg-slate-50/40 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Skeleton variant="brand" className="h-6 w-40 rounded-full mx-auto" />
          <Skeleton className="h-10 sm:h-11 w-96 max-w-full rounded-2xl mx-auto" />
          <Skeleton className="h-4 w-full max-w-lg rounded mx-auto" />
        </div>

        {/* Search + Filter bar */}
        <SkeletonSurface className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-11 w-28 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
            <Skeleton variant="brand" className="h-11 w-28 rounded-xl" />
          </div>
        </SkeletonSurface>

        {/* Course Grid 3 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonSurface key={idx} className="overflow-hidden flex flex-col">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton variant="brand" className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <Skeleton className="h-5 w-5/6 rounded-lg" />
                  <Skeleton className="h-3.5 w-full rounded" />
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                  <Skeleton variant="brand" className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /courses/[id] */
export function CourseDetailSkeleton() {
  return (
    <SkeletonRoot label="Đang tải chi tiết khóa học" className="min-h-screen bg-slate-50/40 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton variant="brand" className="h-4 w-48 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cột trái: Thông tin & Đề cương */}
          <div className="lg:col-span-2 space-y-6">
            <SkeletonSurface className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Skeleton variant="brand" className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-9 w-11/12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Skeleton className="h-8 w-36 rounded-xl" />
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            </SkeletonSurface>

            <SkeletonSurface className="p-6 space-y-4">
              <Skeleton className="h-6 w-52 rounded-xl" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="subtle" className="h-14 w-full rounded-2xl" />
              ))}
            </SkeletonSurface>
          </div>

          {/* Cột phải: Thẻ đăng ký */}
          <SkeletonSurface className="overflow-hidden p-5 space-y-5">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="flex items-baseline justify-between">
              <Skeleton variant="brand" className="h-9 w-36 rounded-xl" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
            <Skeleton variant="brand" className="h-12 w-full rounded-2xl" />
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                </div>
              ))}
            </div>
          </SkeletonSurface>
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /news */
export function NewsPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải tin tức giáo dục" className="min-h-screen bg-slate-50/40 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="max-w-3xl space-y-3">
          <Skeleton variant="brand" className="h-6 w-36 rounded-full" />
          <Skeleton className="h-10 w-80 max-w-full rounded-2xl" />
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>

        {/* Featured Article 12-col */}
        <SkeletonSurface className="overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <Skeleton className="lg:col-span-7 min-h-[260px] sm:min-h-[340px] rounded-none" />
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center space-y-4">
            <Skeleton variant="brand" className="h-6 w-28 rounded-full" />
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl mt-2" />
          </div>
        </SkeletonSurface>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {[96, 120, 112, 136, 104].map((w, idx) => (
            <Skeleton key={idx} variant={idx === 0 ? 'brand' : 'default'} className="h-9 rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonSurface key={idx} className="overflow-hidden flex flex-col">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton variant="brand" className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /about */
export function AboutPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải giới thiệu Schoolify" className="min-h-screen bg-slate-50/40 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Skeleton variant="brand" className="h-6 w-40 rounded-full mx-auto" />
          <Skeleton className="h-11 w-full max-w-2xl rounded-2xl mx-auto" />
          <Skeleton className="h-4 w-full max-w-xl rounded mx-auto" />
          <Skeleton className="h-4 w-3/4 max-w-md rounded mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonSurface key={i} className="p-6 text-center space-y-2">
              <Skeleton variant="brand" className="h-9 w-24 rounded-xl mx-auto" />
              <Skeleton className="h-4 w-28 rounded mx-auto" />
            </SkeletonSurface>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <SkeletonSurface key={i} className="p-7 space-y-4">
              <Skeleton variant="brand" className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-7 w-48 rounded-xl" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </SkeletonSurface>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonSurface key={i} className="p-5 space-y-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /forum */
export function ForumPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải diễn đàn học tập" className="min-h-screen bg-slate-50/40 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton variant="brand" className="h-6 w-36 rounded-full" />
            <Skeleton className="h-9 w-64 rounded-2xl" />
          </div>
          <Skeleton variant="brand" className="h-11 w-44 rounded-2xl shrink-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main feed */}
          <div className="lg:col-span-8 space-y-4">
            <SkeletonSurface className="p-4 flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 w-32 rounded-xl" />
            </SkeletonSurface>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonSurface key={i} className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <Skeleton variant="brand" className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <div className="flex flex-wrap gap-3 pt-1">
                  <Skeleton className="h-7 w-16 rounded-lg" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </SkeletonSurface>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <SkeletonSurface className="p-5 space-y-3">
              <Skeleton className="h-5 w-36 rounded-lg" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="subtle" className="h-11 w-full rounded-xl" />
              ))}
            </SkeletonSurface>
            <SkeletonSurface className="p-5 space-y-3">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </SkeletonSurface>
          </div>
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /leaderboard */
export function LeaderboardPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải bảng xếp hạng" className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="amber" className="h-6 w-40 rounded-full mx-auto" />
          <Skeleton className="h-10 w-80 max-w-full rounded-2xl mx-auto" />
          <Skeleton className="h-4 w-full max-w-md rounded mx-auto" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[120, 132, 116, 128].map((w, i) => (
            <Skeleton key={i} variant={i === 0 ? 'brand' : 'default'} className="h-10 rounded-xl" style={{ width: w }} />
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end max-w-5xl mx-auto pt-4">
          {[
            { order: 'order-2 md:order-1', h: 'md:h-[250px]', variant: 'default' as const },
            { order: 'order-1 md:order-2', h: 'md:h-[296px]', variant: 'amber' as const },
            { order: 'order-3 md:order-3', h: 'md:h-[232px]', variant: 'default' as const },
          ].map((col, idx) => (
            <SkeletonSurface key={idx} className={`p-6 text-center space-y-3 flex flex-col justify-end ${col.order} ${col.h}`}>
              <Skeleton variant={col.variant} className="w-20 h-20 rounded-full mx-auto" />
              <Skeleton className="h-5 w-36 rounded-lg mx-auto" />
              <Skeleton className="h-4 w-24 rounded mx-auto" />
              <Skeleton variant="brand" className="h-8 w-28 rounded-full mx-auto" />
            </SkeletonSurface>
          ))}
        </div>

        {/* Full Table Top 4-10 */}
        <SkeletonSurface className="p-4 sm:p-6 space-y-3 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Skeleton variant="brand" className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </SkeletonSurface>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /pricing */
export function PricingPageSkeleton() {
  return (
    <SkeletonRoot label="Đang tải bảng giá gói học" className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="brand" className="h-6 w-36 rounded-full mx-auto" />
          <Skeleton className="h-10 sm:h-11 w-96 max-w-full rounded-2xl mx-auto" />
          <Skeleton className="h-4 w-full max-w-md rounded mx-auto" />
          <div className="pt-2 flex justify-center">
            <Skeleton className="h-11 w-64 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {[0, 1, 2].map((i) => (
            <SkeletonSurface key={i} className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton variant={i === 1 ? 'brand' : 'default'} className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton variant={i === 1 ? 'brand' : 'default'} className="h-10 w-40 rounded-xl" />
                <Skeleton className="h-4 w-full rounded" />
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="h-3.5 w-4/5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton variant={i === 1 ? 'brand' : 'default'} className="h-12 w-full rounded-2xl" />
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Skeleton chuẩn cho /(auth)/login* và /register */
export function AuthCardSkeleton() {
  return (
    <SkeletonRoot label="Đang tải màn hình đăng nhập" className="w-full max-w-md mx-auto">
      <SkeletonSurface className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <Skeleton variant="brand" className="w-12 h-12 rounded-2xl mx-auto" />
          <Skeleton className="h-7 w-48 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-64 max-w-full rounded mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton variant="brand" className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
        <Skeleton variant="brand" className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-4 w-44 rounded mx-auto" />
      </SkeletonSurface>
    </SkeletonRoot>
  );
}
