import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentAccountSkeleton() {
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-pulse">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* 2. Thẻ Profile & Avatar */}
      <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Skeleton className="h-7 w-44 rounded-lg" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-60 rounded-md mx-auto sm:mx-0" />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Khung avatar selector placeholder */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <Skeleton className="h-4 w-40 rounded" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 3. Grid Form: Thông tin cá nhân & Đổi mật khẩu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form hồ sơ */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
          <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <div className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5"><Skeleton className="h-4 w-20 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
              <div className="space-y-1.5"><Skeleton className="h-4 w-20 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
              <div className="space-y-1.5"><Skeleton className="h-4 w-20 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
              <div className="space-y-1.5"><Skeleton className="h-4 w-28 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            </div>
            <Skeleton className="h-11 w-36 rounded-xl mt-4" />
          </div>
        </div>

        {/* Form mật khẩu */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
          <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <Skeleton className="h-3.5 w-52 rounded-md" />
          </div>
          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5"><Skeleton className="h-4 w-28 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            <div className="space-y-1.5"><Skeleton className="h-4 w-28 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            <div className="space-y-1.5"><Skeleton className="h-4 w-32 rounded" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            <Skeleton className="h-11 w-36 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LuyenThiPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-8">
        <Skeleton className="h-6 w-40 rounded-full mx-auto" />
        <Skeleton className="h-10 sm:h-12 w-3/4 max-w-lg rounded-2xl mx-auto" />
        <Skeleton className="h-4 w-4/5 max-w-md rounded-md mx-auto" />
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-28 sm:w-36 rounded-2xl" />
        ))}
      </div>

      {/* Grade Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-4xl mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 sm:w-20 rounded-xl" />
        ))}
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <Skeleton className="h-6 w-36 rounded-full mx-auto" />
        <Skeleton className="h-10 w-72 rounded-2xl mx-auto" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md mx-auto" />
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 items-end max-w-4xl mx-auto">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-center space-y-3 order-2 sm:order-1 sm:h-[260px] flex flex-col justify-end">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-5 w-32 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-24 rounded mx-auto" />
          <Skeleton className="h-8 w-20 rounded-full mx-auto" />
        </div>
        <div className="p-6 rounded-3xl border border-amber-300/40 dark:border-amber-500/30 bg-amber-500/5 text-center space-y-4 order-1 sm:order-2 sm:h-[300px] flex flex-col justify-end">
          <Skeleton className="w-20 h-20 rounded-full mx-auto ring-4 ring-amber-400/30" />
          <Skeleton className="h-6 w-36 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-28 rounded mx-auto" />
          <Skeleton className="h-9 w-24 rounded-full mx-auto" />
        </div>
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-center space-y-3 order-3 sm:order-3 sm:h-[240px] flex flex-col justify-end">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-5 w-32 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-24 rounded mx-auto" />
          <Skeleton className="h-8 w-20 rounded-full mx-auto" />
        </div>
      </div>

      {/* Top 4-10 List */}
      <div className="space-y-3 max-w-4xl mx-auto pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 pt-4 sm:pt-8 max-w-2xl mx-auto">
        <Skeleton className="h-6 w-32 rounded-full mx-auto" />
        <Skeleton className="h-10 w-80 max-w-full rounded-2xl mx-auto" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md mx-auto" />
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-4/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-2xl mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PracticeRoadmapSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-pulse">
      {/* Top filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Roadmap List */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-52 rounded" />
                  <Skeleton className="h-3.5 w-72 max-w-full rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-8 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExamsHistorySkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
      <div className="space-y-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-10 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RewardsPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto animate-pulse">
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-28 rounded-2xl" />
          <Skeleton className="h-12 w-28 rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-10 w-full rounded-xl mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse max-w-7xl mx-auto">
      <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-4">
        <Skeleton className="h-6 w-40 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div className="min-h-[60vh] p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 space-y-3">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-10 w-full rounded-xl mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
