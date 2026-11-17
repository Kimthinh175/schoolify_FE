'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Pencil,
  Lightbulb,
  Star,
  Calculator,
  Atom,
  Trophy,
  Bell,
  GraduationCap,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Hero background "Hành trình học tập" – sáng, nhẹ nhàng, thân thiện với học sinh & phụ huynh.
 *  - Nền trời sáng (dark mode: navy dịu), vài đám mây trôi chậm, lấp lánh nhỏ.
 *  - Sticker đồ dùng học tập bồng bềnh hai bên (chỉ hiện từ lg để không đè chữ).
 *  - 2 thẻ minh hoạ cho phụ huynh: thông báo kết quả & báo cáo tiến bộ (từ xl).
 *  - Con đường uốn lượn ở đáy với 4 cột mốc cấp độ, mũ tốt nghiệp đi dọc đường.
 * Chỉ dùng framer-motion + SVG + CSS. Tôn trọng prefers-reduced-motion (đứng yên).
 */

/* ---------------------------- Con đường cấp độ ---------------------------- */

// Đường cong trong hệ toạ độ 0..100 của khung đáy
const pathY = (x: number) => 60 + 13 * Math.sin((x / 100) * Math.PI * 2 * 1.1 + 0.9);

const PATH_SAMPLES = Array.from({ length: 61 }, (_, i) => {
  const x = (i / 60) * 100;
  return [x, pathY(x)] as const;
});
const PATH_D = PATH_SAMPLES.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
const HILL_D = `${PATH_SAMPLES.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${(y + 10).toFixed(2)}`).join(' ')} L100 100 L0 100 Z`;

const TRAVEL_X = Array.from({ length: 25 }, (_, i) => 3 + (i / 24) * 94);
const TRAVEL_LEFT = TRAVEL_X.map((x) => `${x}%`);
const TRAVEL_TOP = TRAVEL_X.map((x) => `${pathY(x)}%`);

const MILESTONES = [
  { x: 15, label: 'Cơ bản', dot: 'bg-emerald-500', chip: 'text-emerald-700 dark:text-emerald-300' },
  { x: 38, label: 'Trung bình', dot: 'bg-sky-500', chip: 'text-sky-700 dark:text-sky-300' },
  { x: 62, label: 'Nâng cao', dot: 'bg-violet-500', chip: 'text-violet-700 dark:text-violet-300' },
  { x: 85, label: 'Học sinh giỏi', dot: 'bg-amber-500', chip: 'text-amber-700 dark:text-amber-300' },
];

function LearningPath({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-28 sm:h-44">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={HILL_D} className="fill-cyan-100/70 dark:fill-cyan-950/40" />
        <path
          d={PATH_D}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth={10}
          strokeLinecap="round"
          className="stroke-white/90 dark:stroke-slate-800/90"
        />
        <path
          d={PATH_D}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth={2.5}
          strokeDasharray="2 10"
          strokeLinecap="round"
          className="stroke-[#00B8DD]"
        />
      </svg>

      {/* Cột mốc cấp độ */}
      {MILESTONES.map((m, i) => (
        <div
          key={m.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${pathY(m.x)}%` }}
        >
          <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4">
            {!reduced && (
              <span
                className={cn('absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping', m.dot)}
                style={{ animationDelay: `${i * 0.6}s`, animationDuration: '2.4s' }}
              />
            )}
            <span className={cn('relative inline-flex h-full w-full rounded-full ring-2 ring-white dark:ring-slate-900', m.dot)} />
          </span>
          <span
            className={cn(
              'absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 dark:bg-slate-800/95 px-2 py-0.5 text-[10px] sm:text-xs font-bold shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700',
              m.chip
            )}
          >
            {m.label}
          </span>
        </div>
      ))}

      {/* Học sinh (mũ tốt nghiệp) đi dọc con đường */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={reduced ? { left: '85%', top: `${pathY(85)}%` } : undefined}
        initial={reduced ? false : { left: TRAVEL_LEFT[0], top: TRAVEL_TOP[0] }}
        animate={reduced ? undefined : { left: TRAVEL_LEFT, top: TRAVEL_TOP }}
        transition={{ duration: 16, ease: 'linear', repeat: Infinity, repeatDelay: 1.2 }}
      >
        <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white dark:bg-slate-800 text-[#007D99] dark:text-[#00B8DD] shadow-lg shadow-cyan-900/10 ring-2 ring-[#00B8DD]">
          <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------- Sticker nổi ------------------------------- */

type StickerProps = {
  left: string;
  top: string;
  delay: number;
  rotate: number;
  tone: string;
  children: React.ReactNode;
  reduced: boolean;
};

function Sticker({ left, top, delay, rotate, tone, children, reduced }: StickerProps) {
  return (
    <motion.div
      className="absolute hidden lg:block"
      style={{ left, top }}
      initial={reduced ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + delay * 0.15, type: 'spring', stiffness: 160, damping: 14 }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -10, 0], rotate: [rotate, rotate + 5, rotate] }}
        transition={{ duration: 5 + delay * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotate }}
        className={cn(
          'grid h-14 w-14 place-items-center rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/80 dark:ring-slate-700 backdrop-blur',
          tone
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------- Thẻ minh hoạ cho phụ huynh ------------------------- */

function FloatingCard({
  className,
  delay,
  reduced,
  children,
}: {
  className: string;
  delay: number;
  reduced: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn('absolute hidden xl:block w-52', className)}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
        className="rounded-2xl bg-white/95 dark:bg-slate-800/95 p-3 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/80 dark:ring-slate-700 backdrop-blur"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const BAR_HEIGHTS = ['40%', '55%', '50%', '72%', '88%'];

function ParentCards({ reduced }: { reduced: boolean }) {
  return (
    <>
      <FloatingCard className="left-[2%] top-[50%]" delay={0.9} reduced={reduced}>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <Bell className="h-3 w-3" /> Thông báo cho phụ huynh
        </div>
        <div className="mt-2 flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Trophy className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white">Con vừa hoàn thành đề Toán</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Đúng 9/10 câu · đã sửa câu sai</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="right-[2%] top-[46%]" delay={1.1} reduced={reduced}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Báo cáo tiến bộ hằng tuần</p>
        <div className="mt-2 flex h-14 items-end gap-1.5">
          {BAR_HEIGHTS.map((h, i) => (
            <motion.div
              key={i}
              className={cn('flex-1 rounded-md', i === BAR_HEIGHTS.length - 1 ? 'bg-[#00B8DD]' : 'bg-cyan-100 dark:bg-cyan-950')}
              initial={reduced ? false : { height: '8%' }}
              animate={{ height: h }}
              transition={{ delay: 1.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">Tuần 1 → Tuần 5</p>
      </FloatingCard>
    </>
  );
}

/* --------------------------------- Mây & lấp lánh --------------------------------- */

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 50" className={cn('absolute fill-white dark:fill-slate-700/40', className)} style={style}>
      <path d="M20 45 Q2 45 4 32 Q6 20 20 22 Q24 6 42 8 Q56 0 66 14 Q82 6 92 20 Q116 18 114 34 Q112 45 98 45 Z" />
    </svg>
  );
}

const SPARKLES = [
  { left: '18%', top: '12%', size: 14, color: 'fill-amber-300', delay: 0 },
  { left: '80%', top: '10%', size: 12, color: 'fill-cyan-300', delay: 0.8 },
  { left: '27%', top: '40%', size: 10, color: 'fill-cyan-300', delay: 1.6 },
  { left: '72%', top: '36%', size: 14, color: 'fill-amber-300', delay: 0.4 },
  { left: '8%', top: '36%', size: 10, color: 'fill-violet-300', delay: 1.2 },
  { left: '92%', top: '30%', size: 10, color: 'fill-emerald-300', delay: 2 },
];

function Sparkle({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" />
    </svg>
  );
}

/* --------------------------------- Composition --------------------------------- */

export function HeroBackground() {
  const reduced = useReducedMotion() ?? false;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Nền trời */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-amber-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />
      <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-500/10" />
      <div className="absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/10" />

      {/* Lưới chấm mờ */}
      <div className="absolute inset-0 opacity-60 dark:opacity-30 [background-image:radial-gradient(rgba(0,184,221,0.18)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />

      {/* Mây trôi */}
      {[
        { top: '8%', w: 'w-28 sm:w-40', opacity: 'opacity-90', dur: '75s', delay: '-10s' },
        { top: '26%', w: 'w-20 sm:w-28', opacity: 'opacity-70', dur: '95s', delay: '-55s' },
        { top: '52%', w: 'w-24 sm:w-36', opacity: 'opacity-60', dur: '85s', delay: '-30s' },
      ].map((c, i) => (
        <Cloud
          key={i}
          className={cn(
            'left-0 drop-shadow-sm animate-[cloud-drift_linear_infinite] motion-reduce:animate-none',
            c.w,
            c.opacity
          )}
          style={{ top: c.top, animationDuration: c.dur, animationDelay: c.delay }}
        />
      ))}

      {/* Lấp lánh */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.left, top: s.top }}
          animate={reduced ? undefined : { scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          <Sparkle size={s.size} className={s.color} />
        </motion.div>
      ))}

      {/* Sticker đồ dùng học tập (lg+) */}
      <Sticker left="6%" top="16%" delay={0} rotate={-8} tone="text-emerald-500" reduced={reduced}>
        <BookOpen className="h-7 w-7" />
      </Sticker>
      <Sticker left="14%" top="34%" delay={2} rotate={10} tone="text-amber-500" reduced={reduced}>
        <Pencil className="h-6 w-6" />
      </Sticker>
      <Sticker left="10%" top="70%" delay={4} rotate={-6} tone="text-sky-500" reduced={reduced}>
        <Calculator className="h-6 w-6" />
      </Sticker>
      <Sticker left="88%" top="14%" delay={1} rotate={8} tone="text-amber-500" reduced={reduced}>
        <Lightbulb className="h-7 w-7" />
      </Sticker>
      <Sticker left="80%" top="32%" delay={3} rotate={-10} tone="text-violet-500" reduced={reduced}>
        <Atom className="h-6 w-6" />
      </Sticker>
      <Sticker left="86%" top="68%" delay={5} rotate={6} tone="text-rose-500" reduced={reduced}>
        <Globe className="h-6 w-6" />
      </Sticker>
      <Sticker left="22%" top="10%" delay={6} rotate={12} tone="text-amber-400" reduced={reduced}>
        <Star className="h-6 w-6 fill-amber-300" />
      </Sticker>

      {/* Thẻ minh hoạ cho phụ huynh (xl+) */}
      <ParentCards reduced={reduced} />

      {/* Con đường cấp độ */}
      <LearningPath reduced={reduced} />
    </div>
  );
}
