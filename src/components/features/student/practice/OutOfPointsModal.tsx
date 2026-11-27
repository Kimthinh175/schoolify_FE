'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ArrowRight, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { examOfflineStorage } from '@/services/exam-offline-storage.service';

interface OutOfPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  requiredPoints: number;
  currentDiamonds?: number;
  onUseDiamonds?: () => void;
  levelLabel?: string;
  onNavigatePricing?: () => void;
  secondaryLabel?: string;
}

export function OutOfPointsModal({
  isOpen,
  onClose,
  currentPoints,
  requiredPoints,
  currentDiamonds = 0,
  onUseDiamonds,
  levelLabel = 'Cơ bản',
  onNavigatePricing,
  secondaryLabel = 'Đóng & Quay lại',
}: OutOfPointsModalProps) {
  const router = useRouter();
  const safeCurrent = Math.max(0, Number(currentPoints || 0));
  const safeRequired = Math.max(3, Number(requiredPoints || 3));
  const safeDiamonds = Math.max(0, Number(currentDiamonds || 0));
  const shortfall = Math.max(1, safeRequired - safeCurrent);
  const canUnlockWithDiamonds = safeDiamonds >= safeRequired;

  // Giải phóng ngay lập tức mọi khóa chống thoát phòng thi khi Modal Hết Điểm xuất hiện
  React.useEffect(() => {
    if (isOpen) {
      examOfflineStorage.clearActiveExamSession().catch(() => {});
    }
  }, [isOpen]);

  const handleClose = () => {
    examOfflineStorage.clearActiveExamSession().catch(() => {});
    onClose();
  };

  const handleGoToPricing = () => {
    examOfflineStorage.clearActiveExamSession().catch(() => {});
    if (onNavigatePricing) {
      onNavigatePricing();
      return;
    }
    onClose();
    router.push('/pricing');
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} maxWidth="md">
      <div className="text-center pt-2 pb-1" data-testid="out-of-points-modal">
        {/* Header Icon */}
        <div className="flex justify-center mb-3">
          <div className="relative w-16 h-16 rounded-3xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shadow-lg">
            {canUnlockWithDiamonds ? (
              <NgocIcon className="w-8 h-8" />
            ) : (
              <TiaSangIcon className="w-8 h-8" />
            )}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-2">
          <Badge variant="warning" className="text-[11px] font-bold">
            {canUnlockWithDiamonds
              ? 'Có Thể Mở Đề Bằng Ngọc Tri Thức (1:1)'
              : 'Hết Tia Sáng Năng Lượng'}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {canUnlockWithDiamonds
            ? 'Mở Đề Bằng Ngọc Tri Thức Ngay!'
            : safeCurrent <= 0
              ? 'Bạn Đã Hết Tia Sáng Hôm Nay!'
              : 'Không Đủ Tia Sáng Tạo Đề Thi!'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
          Đề thi cấp độ <strong className="text-slate-800 dark:text-slate-200">{levelLabel}</strong> yêu cầu{' '}
          <strong className="text-amber-600 dark:text-amber-400">{safeRequired} Tia Sáng</strong> (hoặc{' '}
          <strong className="text-violet-600 dark:text-violet-400">{safeRequired} Ngọc Tri Thức</strong>). Bạn hiện có{' '}
          <strong className="text-rose-600 dark:text-rose-400">{safeCurrent} Tia Sáng</strong> và{' '}
          <strong className="text-violet-600 dark:text-violet-400">{safeDiamonds} Ngọc Tri Thức</strong>.
        </p>

        {/* Points Comparison Box */}
        <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/70">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Tia Sáng</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-base font-black text-rose-600 dark:text-rose-400">
              <span>{safeCurrent}</span>
              <TiaSangIcon className="w-4 h-4" flat />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-violet-200/80 dark:border-violet-800/70">
            <div className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase">Ngọc Tri Thức</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-base font-black text-violet-600 dark:text-violet-400">
              <span>{safeDiamonds}</span>
              <NgocIcon className="w-4 h-4" flat />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Cần mở đề</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-base font-black text-slate-900 dark:text-white">
              <span>{safeRequired}</span>
              <TiaSangIcon className="w-4 h-4" flat />
              <span className="text-xs font-normal text-slate-400">/</span>
              <NgocIcon className="w-4 h-4" flat />
            </div>
          </div>
        </div>

        {/* Benefits of Upgrading */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#007D99] dark:text-[#00B8DD] uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Đặc quyền khi nâng cấp gói Học Sinh</span>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
              Nhận ngay <strong>18 – 29 Tia Sáng</strong> <TiaSangIcon className="inline w-3.5 h-3.5 align-[-0.15em]" flat /> mỗi ngày để tạo & luyện đề liên tục không bị gián đoạn.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
              Tặng thêm <strong>+5 đến +10 Ngọc Tri Thức</strong> <NgocIcon className="inline w-3.5 h-3.5 align-[-0.15em]" flat /> tích lũy vĩnh viễn mỗi ngày (dùng mở đề tỷ lệ 1:1).
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
              Mở khóa trọn bộ đề Nâng Cao, HSG Tỉnh/Quốc Gia & ưu đãi 50% phí hỏi Gia Sư AI 24/7.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-5 space-y-2.5">
          {canUnlockWithDiamonds && onUseDiamonds && (
            <Button
              type="button"
              size="lg"
              data-testid="btn-use-diamonds-for-exam"
              onClick={() => {
                onClose();
                onUseDiamonds();
              }}
              className="w-full justify-center text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl py-3 shadow-md shadow-violet-500/25 cursor-pointer"
              leftIcon={<NgocIcon className="w-4 h-4" flat />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Dùng {safeRequired} Ngọc Tri Thức Mở Đề Ngay (Còn {Math.max(0, safeDiamonds - safeRequired)} Ngọc)
            </Button>
          )}

          <Button
            type="button"
            size="lg"
            data-testid="btn-go-to-pricing"
            onClick={handleGoToPricing}
            className={`w-full justify-center text-sm font-bold rounded-xl py-3 cursor-pointer ${
              canUnlockWithDiamonds && onUseDiamonds
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'
                : 'bg-gradient-to-r from-[#00B8DD] to-cyan-600 hover:from-[#009dbd] hover:to-cyan-700 text-white shadow-md shadow-cyan-500/20'
            }`}
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Đăng Ký Gói Nhận Tia Sáng Ngay
          </Button>

          <button
            type="button"
            data-testid="btn-close-out-of-points"
            onClick={handleClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
