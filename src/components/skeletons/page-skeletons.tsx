import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonRoot, SkeletonSurface } from './SkeletonFrame';

export * from './public-skeletons';
export * from './student-skeletons';
export * from './dashboard-skeletons';

/**
 * Fallback skeleton toàn màn hình (dùng cho app/loading.tsx hoặc các route chưa có shell riêng).
 * Khớp chuẩn khung Navbar + vùng nội dung max-w-7xl thay vì khung nhỏ lửng lơ.
 */
export function AppFallbackSkeleton() {
  return (
    <SkeletonRoot
      label="Đang tải trang Schoolify"
      className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950 flex flex-col pt-20"
    >
      {/* Vùng nội dung chính */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <SkeletonSurface className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <Skeleton variant="brand" className="h-6 w-36 rounded-full" />
            <Skeleton className="h-9 sm:h-11 w-96 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-2xl rounded" />
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Skeleton variant="brand" className="h-11 w-40 rounded-2xl" />
            <Skeleton className="h-11 w-32 rounded-2xl" />
          </div>
        </SkeletonSurface>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonSurface key={i} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton variant={i % 2 === 0 ? 'brand' : 'default'} className="w-11 h-11 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
              <Skeleton variant="subtle" className="h-10 w-full rounded-xl mt-2" />
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}

/** Alias cho nội dung bên trong layout đã có sẵn Navbar (ví dụ (public) fallback) */
export function GenericPageSkeleton() {
  return (
    <SkeletonRoot
      label="Đang tải nội dung trang"
      className="min-h-[calc(100vh-5rem)] w-full bg-slate-50/40 dark:bg-slate-950"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <SkeletonSurface className="p-6 sm:p-8 space-y-3">
          <Skeleton variant="brand" className="h-6 w-36 rounded-full" />
          <Skeleton className="h-9 sm:h-10 w-80 max-w-full rounded-2xl" />
          <Skeleton className="h-4 w-full max-w-2xl rounded" />
        </SkeletonSurface>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonSurface key={i} className="p-5 sm:p-6 space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton variant="brand" className="h-10 w-full rounded-xl mt-2" />
            </SkeletonSurface>
          ))}
        </div>
      </div>
    </SkeletonRoot>
  );
}
