'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question, QuestionChapterRef, QuestionDifficulty } from '@/types';

// ─────────────────────────────────────────────────────────────
// Difficulty config
// Tông màu dịu cho nền tối của phòng thi (bg 10% + ring 20%),
// tránh màu bão hòa gây chói khi học sinh tập trung làm bài lâu.
// ─────────────────────────────────────────────────────────────

interface DifficultyMeta {
  label: string;
  rank: number;
  badgeClass: string;
  dotClass: string;
}

const DIFFICULTY_META: Record<QuestionDifficulty, DifficultyMeta> = {
  BASIC: {
    label: 'Cơ bản',
    rank: 1,
    badgeClass: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/20',
    dotClass: 'bg-emerald-400',
  },
  MEDIUM: {
    label: 'Trung bình',
    rank: 2,
    badgeClass: 'bg-sky-500/10 text-sky-300 ring-sky-400/20',
    dotClass: 'bg-sky-400',
  },
  ADVANCED: {
    label: 'Nâng cao',
    rank: 3,
    badgeClass: 'bg-violet-500/10 text-violet-300 ring-violet-400/20',
    dotClass: 'bg-violet-400',
  },
  PROVINCIAL_EXCELLENT: {
    label: 'HSG Tỉnh',
    rank: 4,
    badgeClass: 'bg-amber-500/10 text-amber-300 ring-amber-400/20',
    dotClass: 'bg-amber-400',
  },
  NATIONAL_EXCELLENT: {
    label: 'HSG Quốc gia',
    rank: 5,
    badgeClass: 'bg-rose-500/10 text-rose-300 ring-rose-400/20',
    dotClass: 'bg-rose-400',
  },
};

const TOTAL_LEVELS = Object.keys(DIFFICULTY_META).length;

/**
 * Bảng alias để chịu được dữ liệu cũ / không đồng nhất từ BE:
 * key đã được chuẩn hóa (bỏ dấu, lowercase, khoảng trắng → "_").
 */
const DIFFICULTY_ALIASES: Record<string, QuestionDifficulty> = {
  basic: 'BASIC', co_ban: 'BASIC', easy: 'BASIC', '1': 'BASIC',
  medium: 'MEDIUM', trung_binh: 'MEDIUM', intermediate: 'MEDIUM', '2': 'MEDIUM',
  advanced: 'ADVANCED', nang_cao: 'ADVANCED', hard: 'ADVANCED', '3': 'ADVANCED',
  provincial_excellent: 'PROVINCIAL_EXCELLENT', hsg_tinh: 'PROVINCIAL_EXCELLENT', '4': 'PROVINCIAL_EXCELLENT',
  national_excellent: 'NATIONAL_EXCELLENT', hsg_quoc_gia: 'NATIONAL_EXCELLENT', olympic: 'NATIONAL_EXCELLENT', '5': 'NATIONAL_EXCELLENT',
};

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .trim()
    .toLowerCase()
    .replace(/^(\d+[\s._-]+)/, '') // Cắt bỏ "1.", "1 -", "1_" ở đầu chuỗi nếu có
    .replace(/[\s-]+/g, '_');
}

// ─────────────────────────────────────────────────────────────
// Resolvers (pure, an toàn với undefined / null / sai kiểu)
// ─────────────────────────────────────────────────────────────

export function resolveDifficulty(value: unknown): DifficultyMeta | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' && typeof value !== 'number') return null;

  const key = normalizeKey(String(value));
  if (!key) return null;

  const level = DIFFICULTY_ALIASES[key];
  return level ? DIFFICULTY_META[level] : null;
}

export function resolveChapter(value: unknown): QuestionChapterRef | null {
  if (typeof value === 'string') {
    const title = value.trim();
    return title ? { title } : null;
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const rawTitle = obj.title ?? obj.chapter_name ?? obj.name;
    if (typeof rawTitle !== 'string' || !rawTitle.trim()) return null;
    return {
      id: typeof obj.id === 'string' ? obj.id : null,
      title: rawTitle.trim(),
      href: typeof obj.href === 'string' && obj.href.trim() ? obj.href.trim() : null,
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// DifficultyBadge
// ─────────────────────────────────────────────────────────────

interface DifficultyBadgeProps {
  difficulty: Question['difficulty'] | string | number | undefined;
  className?: string;
}

export const DifficultyBadge = React.memo(function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps) {
  const meta = resolveDifficulty(difficulty);
  if (!meta) return null;

  return (
    <span
      title={`Độ khó: ${meta.label} (cấp ${meta.rank}/${TOTAL_LEVELS})`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-[11px] font-semibold leading-4 ring-1 ring-inset select-none',
        meta.badgeClass,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
      <span className="sr-only">Độ khó: </span>
      {meta.label}
    </span>
  );
});

// ─────────────────────────────────────────────────────────────
// ChapterLink
// Có target="_blank" để tránh mất bài thi khi học sinh click xem lại lý thuyết.
// ─────────────────────────────────────────────────────────────

interface ChapterLinkProps {
  chapter: Question['chapter'] | undefined;
  className?: string;
}

export const ChapterLink = React.memo(function ChapterLink({
  chapter,
  className,
}: ChapterLinkProps) {
  const resolved = resolveChapter(chapter);
  if (!resolved) return null;

  const baseClass = cn(
    'flex w-full min-w-0 max-w-full items-start gap-1.5 text-xs text-slate-400',
    className,
  );

  const isLink = Boolean(resolved.href);

  const content = (
    <>
      <BookOpen aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
      <span
        title={resolved.title}
        className={cn(
          'min-w-0 flex-1 truncate',
          isLink && 'underline-offset-4 decoration-[#00B8DD]/50 group-hover:underline',
        )}
      >
        {resolved.title}
      </span>
    </>
  );

  if (!resolved.href) {
    return (
      <span className={baseClass} title={resolved.title}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={resolved.href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Mở xem ${resolved.title} trong tab mới (không gián đoạn bài làm)`}
      className={cn(
        baseClass,
        'group rounded-sm transition-colors duration-200 hover:text-[#00B8DD]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/40',
      )}
    >
      {content}
    </Link>
  );
});
