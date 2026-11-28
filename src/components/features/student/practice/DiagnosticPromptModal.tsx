'use client';

import * as React from 'react';
import { Compass, Sparkles, ArrowRight, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TiaSangIcon } from '@/components/ui/point-icons';

export interface DiagnosticPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'FIRST_TIME' | 'INACTIVE_30_DAYS';
  daysSinceLastPractice?: number | null;
  subjectName?: string;
  grade?: number;
  onStartDiagnostic: () => void;
  onSkipAndContinue: () => void;
}

export function DiagnosticPromptModal({
  isOpen,
  onClose,
  reason,
  daysSinceLastPractice,
  subjectName = 'Toán học',
  grade = 12,
  onStartDiagnostic,
  onSkipAndContinue,
}: DiagnosticPromptModalProps) {
  const isInactiveReturn = reason === 'INACTIVE_30_DAYS';
  const safeDays = Math.max(30, Number(daysSinceLastPractice || 30));

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="pt-1 pb-1" data-testid="diagnostic-prompt-modal">
        {/* Header Badge & Icon */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md border ${
              isInactiveReturn
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-500'
                : 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-[#00B8DD]'
            }`}
          >
            {isInactiveReturn ? (
              <Sparkles className="w-8 h-8" />
            ) : (
              <Compass className="w-8 h-8" />
            )}
          </div>

          <Badge
            variant={isInactiveReturn ? 'warning' : 'default'}
            className="text-[11px] font-bold mb-2"
          >
            {isInactiveReturn
              ? `Chào mừng quay trở lại sau ${safeDays} ngày!`
              : 'Gợi ý tạo đề lần đầu tiên'}
          </Badge>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isInactiveReturn
              ? 'Làm Lại Bài Test Đánh Giá Phong Độ?'
              : 'Kiểm Tra Năng Lực Hiện Tại Của Bạn?'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
            {isInactiveReturn ? (
              <>
                Đã <strong>{safeDays} ngày</strong> bạn chưa luyện đề trên Schoolify. Làm nhanh 1 bài test ngắn giúp hệ thống đo lại phong độ môn{' '}
                <strong>
                  {subjectName} Lớp {grade}
                </strong>{' '}
                và điều chỉnh câu hỏi sát nhất với bạn!
              </>
            ) : (
              <>
                Trước khi bắt đầu tạo đề môn{' '}
                <strong>
                  {subjectName} Lớp {grade}
                </strong>
                , bạn có muốn làm 1 bài test ngắn để đánh giá năng lực hiện tại và mở khóa lộ trình cá nhân hóa không?
              </>
            )}
          </p>
        </div>

        {/* Info Chips */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Số lượng</span>
            </div>
            <div className="mt-1 text-sm sm:text-base font-black text-slate-900 dark:text-white">
              10 câu hỏi
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Thời gian</span>
            </div>
            <div className="mt-1 text-sm sm:text-base font-black text-slate-900 dark:text-white">
              15 phút
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chi phí</span>
            </div>
            <div className="mt-1 text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <span>Miễn phí (0</span>
              <TiaSangIcon className="w-4 h-4" flat />
              <span>)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2.5">
          <Button
            type="button"
            size="lg"
            data-testid="btn-start-diagnostic-test"
            onClick={onStartDiagnostic}
            className="w-full justify-center text-sm font-bold bg-gradient-to-r from-[#00B8DD] to-cyan-600 hover:from-[#009dbd] hover:to-cyan-700 text-white rounded-xl py-3 shadow-md shadow-cyan-500/20 cursor-pointer min-h-[46px]"
            leftIcon={<Compass className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isInactiveReturn
              ? 'Làm Lại Bài Đánh Giá Năng Lực Ngay (15 phút)'
              : 'Làm Bài Đánh Giá Năng Lực Ngay (Khuyên dùng)'}
          </Button>

          <button
            type="button"
            data-testid="btn-skip-diagnostic-test"
            onClick={onSkipAndContinue}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Bỏ qua, vào tạo đề luôn (Skip) →
          </button>
        </div>
      </div>
    </Dialog>
  );
}
