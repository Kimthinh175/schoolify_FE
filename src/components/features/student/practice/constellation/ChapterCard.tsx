'use client';

import * as React from 'react';
import { ArrowRight, Check, Clock, Loader2, Lock, Unlock } from 'lucide-react';
import type {
  ChapterRoadmapNode,
  RoadmapDifficultyLevel,
} from '@/services/chapter-roadmap.service';
import { TiaSangIcon } from '@/components/ui/point-icons';
import { cn } from '@/lib/utils';

export interface LevelMeta {
  code: RoadmapDifficultyLevel;
  title: string;
  prevLevelCode: RoadmapDifficultyLevel | null;
  prevLevelTitle: string | null;
}

interface ChapterCardProps {
  node: ChapterRoadmapNode;
  level: LevelMeta;
  isJumping: boolean;
  onStart: () => void;
  onGoPrevLevel: (code: RoadmapDifficultyLevel) => void;
  onJump: () => void;
}

const btnBase =
  'min-h-[44px] px-4 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/60 disabled:opacity-60 disabled:cursor-not-allowed';

/** Thẻ kính mờ mô tả chương đang chọn — hành vi giữ nguyên bản cũ (bắt đầu / luyện lại / qua mức trước / nhảy tới chương). */
export function ChapterCard({
  node,
  level,
  isJumping,
  onStart,
  onGoPrevLevel,
  onJump,
}: ChapterCardProps) {
  const status = node.levels[level.code];
  const isEntry = node.trackOrder === 1;
  const showPrev = isEntry && level.prevLevelCode && level.prevLevelTitle;

  return (
    <div
      key={`${node.id}-${level.code}`}
      className="rounded-[20px] border border-white/15 bg-slate-900/70 p-[18px] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
    >
      <p
        className={cn(
          'text-[11px] font-bold uppercase tracking-[0.12em]',
          status.unlocked ? 'text-[#5CE1FF]' : 'text-slate-400',
        )}
      >
        Chương {node.trackOrder}
      </p>
      <h2 className="mt-1 break-words text-[17px] font-bold leading-snug text-white">{node.name}</h2>

      {status.unlocked ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={onStart}
            className={cn(
              btnBase,
              status.completed
                ? 'border border-white/20 bg-transparent text-white hover:border-[#10B981] hover:bg-[#10B981]/15'
                : 'bg-[#00B8DD] text-white hover:bg-[#009BBD]',
            )}
          >
            <span>{status.completed ? 'Luyện lại' : 'Bắt đầu'} · {level.title}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            15 phút · 10 câu ·
            <TiaSangIcon className="h-3.5 w-3.5" />
            {status.costPoints}
          </span>
          {status.bestScore !== null && status.bestScore > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D399]">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Cao nhất {status.bestScore.toFixed(1)}đ
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-300">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              {showPrev
                ? `Vượt qua Chương 1 mức ${level.prevLevelTitle} (từ 5.0đ) để mở cổng mức ${level.title}.`
                : `Hoàn thành chương liền trước ở mức ${level.title} (từ 5.0đ) để mở chương này.`}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {showPrev && (
              <button
                type="button"
                onClick={() => onGoPrevLevel(level.prevLevelCode!)}
                className={cn(btnBase, 'bg-[#00B8DD] text-white hover:bg-[#009BBD]')}
              >
                <span>Qua Chương 1 · {level.prevLevelTitle}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              disabled={isJumping}
              onClick={onJump}
              className={cn(
                btnBase,
                'border border-white/20 bg-transparent text-slate-200 hover:border-[#00B8DD] hover:bg-[#00B8DD]/12',
              )}
            >
              {isJumping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Đang mở khóa...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
                  Nhảy tới chương này
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
