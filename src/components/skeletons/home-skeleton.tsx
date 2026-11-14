import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Khối "xương" có hiệu ứng shimmer quét ngang (nhẹ hơn animate-pulse, đồng bộ nhịp giữa các khối).
 * Tự tắt animation khi người dùng bật `prefers-reduced-motion`.
 */
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={style} className={cn('sk-bone rounded-xl', className)} />;
}

const SKELETON_CSS = `
.sk-bone{position:relative;overflow:hidden;background:rgba(148,163,184,.22)}
.sk-bone::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);
  animation:sk-shimmer 1.6s ease-in-out infinite}
:is(html.dark,html[data-theme="dark"]) .sk-bone{background:rgba(51,65,85,.55)}
:is(html.dark,html[data-theme="dark"]) .sk-bone::after{
  background:linear-gradient(90deg,transparent,rgba(148,163,184,.22),transparent)}
.sk-bone--brand{background:rgba(0,184,221,.16)}
:is(html.dark,html[data-theme="dark"]) .sk-bone--brand{background:rgba(0,184,221,.18)}
@keyframes sk-shimmer{100%{transform:translateX(100%)}}
@keyframes sk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.sk-float{animation:sk-float 4.2s ease-in-out infinite}
.sk-float-2{animation:sk-float 5s ease-in-out .8s infinite}
@media (prefers-reduced-motion:reduce){
  .sk-bone::after,.sk-float,.sk-float-2{animation:none}
}
`;

/** Khung skeleton nội dung trang chủ (không gồm Navbar/Footer — đã có sẵn trong PublicShell). */
export function HomePageSkeletonContent() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải trang chủ Schoolify"
      className="w-full overflow-x-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: SKELETON_CSS }} />

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden">
        {/* Hào quang nền thương hiệu */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-8%] h-[420px] w-[420px] rounded-full bg-[#00B8DD]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[-6%] h-[320px] w-[320px] rounded-full bg-amber-400/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-20">
          {/* Cột chữ */}
          <div className="space-y-6 lg:col-span-7">
            <Bone className="sk-bone--brand h-8 w-64 max-w-full rounded-full" />

            <div className="space-y-3">
              <Bone className="h-10 w-[92%] sm:h-14 lg:h-16" />
              <Bone className="h-10 w-[78%] sm:h-14 lg:h-16" />
              <Bone className="sk-bone--brand h-10 w-[56%] sm:h-14 lg:h-16" />
            </div>

            <div className="space-y-2.5 pt-1">
              <Bone className="h-4 w-full max-w-xl" />
              <Bone className="h-4 w-[88%] max-w-xl" />
              <Bone className="h-4 w-[64%] max-w-xl" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Bone className="sk-bone--brand h-12 w-52 rounded-2xl" />
              <Bone className="h-12 w-40 rounded-2xl" />
            </div>

            {/* Chip niềm tin */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[132, 112, 148].map((w, i) => (
                <Bone key={i} className="h-7 rounded-full" style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* Cột trực quan: “khung máy bay giấy / thẻ đề thi” */}
          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[460px] rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-xl shadow-[#00B8DD]/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <Bone className="h-4 w-28" />
                <Bone className="sk-bone--brand h-6 w-16 rounded-full" />
              </div>
              <Bone className="sk-bone--brand mt-4 h-[46%] w-full rounded-2xl" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Bone className="h-10 w-full" />
                <Bone className="h-10 w-full" />
                <Bone className="h-10 w-full" />
                <Bone className="h-10 w-full" />
              </div>
            </div>

            {/* Thẻ nổi */}
            <div className="sk-float absolute -left-2 top-6 hidden w-36 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900/90 sm:block">
              <Bone className="h-3 w-16" />
              <Bone className="mt-2 h-6 w-20" />
            </div>
            <div className="sk-float-2 absolute -right-2 bottom-8 hidden w-40 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900/90 sm:block">
              <div className="flex items-center gap-2">
                <Bone className="sk-bone--brand h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-3 w-full" />
                  <Bone className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── THANH SỐ LIỆU ───────── */}
      <section className="border-y border-slate-100 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center md:text-left">
              <Bone className="mx-auto h-9 w-24 md:mx-0" />
              <Bone className="mx-auto h-3.5 w-32 md:mx-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ───────── TÍNH NĂNG ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
          <Bone className="sk-bone--brand mx-auto h-6 w-32 rounded-full" />
          <Bone className="mx-auto h-9 w-[80%]" />
          <Bone className="mx-auto h-4 w-[60%]" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <Bone className={cn('h-12 w-12 rounded-2xl', i % 3 === 0 && 'sk-bone--brand')} />
              <Bone className="h-5 w-3/5" />
              <div className="space-y-2">
                <Bone className="h-3.5 w-full" />
                <Bone className="h-3.5 w-[85%]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── CATALOG K-12 ───────── */}
      <section className="bg-slate-50/70 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-14 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Bone className="h-8 w-72 max-w-full" />
            <Bone className="h-4 w-96 max-w-full" />
          </div>
          {/* Hết hàng thì xuống dòng — không scroll ngang */}
          <div className="flex flex-wrap gap-2">
            {[56, 72, 64, 80, 60, 68, 76, 58, 70].map((w, i) => (
              <Bone key={i} className="h-9 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <Bone className="h-24 w-full rounded-xl" />
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA CUỐI TRANG ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-[2rem] border border-[#00B8DD]/20 bg-[#00B8DD]/5 px-6 py-12 text-center dark:bg-[#00B8DD]/10">
          <Bone className="sk-bone--brand mx-auto h-7 w-56 rounded-full" />
          <Bone className="mx-auto h-9 w-[70%] max-w-xl" />
          <Bone className="mx-auto h-4 w-[50%] max-w-md" />
          <Bone className="sk-bone--brand mx-auto mt-2 h-12 w-64 max-w-full rounded-2xl" />
        </div>
      </section>

      <span className="sr-only">Đang tải…</span>
    </div>
  );
}

/**
 * Overlay phủ trang chủ trong lúc CSS/GSAP/Lenis chưa nạp xong.
 * Đặt dưới Navbar (fixed, cao 80px, z-50) để thanh điều hướng luôn hiển thị.
 */
export function HomePageSkeletonOverlay({ leaving }: { leaving?: boolean }) {
  return (
    <div
      data-testid="home-skeleton-overlay"
      className={cn(
        'fixed inset-x-0 bottom-0 top-20 z-[45] overflow-y-auto overflow-x-hidden bg-white transition-opacity duration-500 dark:bg-slate-950',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <HomePageSkeletonContent />
    </div>
  );
}

/** Dùng cho `loading.tsx` khi chuyển route về trang chủ (không overlay). */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white pt-20 dark:bg-slate-950">
      <HomePageSkeletonContent />
    </div>
  );
}
