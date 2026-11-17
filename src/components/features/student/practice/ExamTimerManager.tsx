'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { examOfflineStorage } from '@/services/exam-offline-storage.service';

export interface ExamTimerManager {
  subscribe: (fn: (remaining: number, elapsed: number) => void) => () => void;
  getRemaining: () => number;
  getElapsed: () => number;
  destroy: () => void;
}

export function formatExamTimer(totalSecs: number): string {
  const mins = Math.floor(Math.max(0, totalSecs) / 60);
  const secs = Math.max(0, totalSecs) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function createExamTimerManager(
  totalLimitSeconds: number,
  onTimeUp: () => void
): ExamTimerManager {
  let remaining = totalLimitSeconds;
  let elapsed = 0;
  const listeners = new Set<(rem: number, el: number) => void>();

  // Kiểm tra thời gian lưu từ offline session lock nếu có
  if (typeof window !== 'undefined') {
    const initialLock = examOfflineStorage.getFastSyncActiveLock();
    if (initialLock && initialLock.targetEndTime) {
      remaining = Math.max(0, Math.round((initialLock.targetEndTime - Date.now()) / 1000));
      elapsed = Math.max(0, totalLimitSeconds - remaining);
    }
  }

  const interval = setInterval(() => {
    const lock = examOfflineStorage.getFastSyncActiveLock();
    if (lock && lock.targetEndTime) {
      remaining = Math.max(0, Math.round((lock.targetEndTime - Date.now()) / 1000));
      elapsed = Math.max(0, totalLimitSeconds - remaining);
      listeners.forEach((fn) => fn(remaining, elapsed));

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    } else {
      elapsed += 1;
      remaining = Math.max(0, remaining - 1);
      listeners.forEach((fn) => fn(remaining, elapsed));

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }
  }, 1000);

  return {
    subscribe: (fn) => {
      listeners.add(fn);
      fn(remaining, elapsed);
      return () => {
        listeners.delete(fn);
      };
    },
    getRemaining: () => remaining,
    getElapsed: () => elapsed,
    destroy: () => {
      clearInterval(interval);
      listeners.clear();
    },
  };
}

export const ExamTopBarTimerBadge: React.FC<{
  timerManager: ExamTimerManager | null;
  totalLimitSeconds: number;
}> = React.memo(({ timerManager, totalLimitSeconds }) => {
  const [times, setTimes] = React.useState({
    remaining: timerManager ? timerManager.getRemaining() : totalLimitSeconds,
    elapsed: timerManager ? timerManager.getElapsed() : 0,
  });

  React.useEffect(() => {
    if (!timerManager) return;
    return timerManager.subscribe((remaining, elapsed) => {
      setTimes({ remaining, elapsed });
    });
  }, [timerManager]);

  const isLow = times.remaining < 300;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm border shadow-xs transition-colors shrink-0',
        isLow
          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700 animate-pulse'
          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
      )}
      title={`Thời gian còn lại: ${formatExamTimer(times.remaining)} (Đã làm: ${formatExamTimer(times.elapsed)} / ${formatExamTimer(totalLimitSeconds)})`}
    >
      <Clock className={cn('w-3.5 h-3.5 shrink-0', isLow ? 'text-rose-600 dark:text-rose-400' : 'text-[#007D99] dark:text-[#00B8DD]')} />
      <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
        {formatExamTimer(times.remaining)}
      </span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
        / {formatExamTimer(totalLimitSeconds)}
      </span>
    </div>
  );
});
ExamTopBarTimerBadge.displayName = 'ExamTopBarTimerBadge';

export const ExamSideBarTimerCard: React.FC<{
  timerManager: ExamTimerManager | null;
  totalLimitSeconds: number;
}> = React.memo(({ timerManager, totalLimitSeconds }) => {
  const [times, setTimes] = React.useState({
    remaining: timerManager ? timerManager.getRemaining() : totalLimitSeconds,
    elapsed: timerManager ? timerManager.getElapsed() : 0,
  });

  React.useEffect(() => {
    if (!timerManager) return;
    return timerManager.subscribe((remaining, elapsed) => {
      setTimes({ remaining, elapsed });
    });
  }, [timerManager]);

  const isLow = times.remaining < 300;

  return (
    <div
      className={cn(
        'mt-3 px-3 py-2 rounded-xl border flex items-center justify-between transition-colors shadow-xs',
        isLow
          ? 'bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 animate-pulse'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
      )}
      title="Thời gian làm bài còn lại"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Clock className={cn('w-4 h-4 shrink-0', isLow ? 'text-rose-600 dark:text-rose-400' : 'text-[#007D99] dark:text-[#00B8DD]')} />
        <span>Thời gian còn lại:</span>
      </div>
      <div className="flex items-baseline gap-1 font-mono">
        <span className={cn('font-black text-sm', isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white')}>
          {formatExamTimer(times.remaining)}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
          / {formatExamTimer(totalLimitSeconds)}
        </span>
      </div>
    </div>
  );
});
ExamSideBarTimerCard.displayName = 'ExamSideBarTimerCard';
