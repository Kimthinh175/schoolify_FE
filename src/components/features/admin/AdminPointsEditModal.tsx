'use client';

import * as React from 'react';
import { Check, Sliders, Zap } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { examPointsService } from '@/services/exam-points.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminPointsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTokenBalance: number;
  currentDiamondsBalance: number;
  userId?: string;
  userName?: string;
  onUpdated?: (newPoints: number, newDiamonds: number) => void;
}

const TIA_SANG_PRESETS = [
  { value: 0, label: '0 tia' },
  { value: 3, label: '3 tia (1 đề)' },
  { value: 9, label: '9 tia (chuẩn)' },
  { value: 27, label: '27 tia (VIP)' },
  { value: 50, label: '50 tia' },
  { value: 99, label: '99 tia' },
];

const NGOC_PRESETS = [
  { value: 0, label: '0 ngọc' },
  { value: 50, label: '50 ngọc' },
  { value: 100, label: '100 ngọc' },
  { value: 500, label: '500 ngọc' },
  { value: 1000, label: '1.000 ngọc' },
];

export function AdminPointsEditModal({
  isOpen,
  onClose,
  currentTokenBalance,
  currentDiamondsBalance,
  userId,
  userName,
  onUpdated,
}: AdminPointsEditModalProps) {
  const [examPointsInput, setExamPointsInput] = React.useState<number>(currentTokenBalance);
  const [diamondsInput, setDiamondsInput] = React.useState<number>(currentDiamondsBalance);
  const [noteInput, setNoteInput] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Đồng bộ giá trị khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      setExamPointsInput(currentTokenBalance);
      setDiamondsInput(currentDiamondsBalance);
      setNoteInput('');
    }
  }, [isOpen, currentTokenBalance, currentDiamondsBalance]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await examPointsService.adminAdjustPoints({
        userId,
        examPoints: Math.max(0, Number(examPointsInput || 0)),
        diamonds: Math.max(0, Number(diamondsInput || 0)),
        note: noteInput.trim() || undefined,
      });

      if (res?.ok) {
        toast.success('Đã cập nhật điểm thành công!', {
          description: `Tia Sáng: ${examPointsInput} • Ngọc Tri Thức: ${diamondsInput}`,
        });
        if (onUpdated) {
          onUpdated(examPointsInput, diamondsInput);
        }
        onClose();
      } else {
        toast.error('Không thể cập nhật điểm', {
          description: res?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
        });
      }
    } catch (err: any) {
      toast.error('Không thể điều chỉnh điểm', {
        description: err?.message || 'Vui lòng kiểm tra lại quyền Quản trị viên.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {userName ? `Nạp Điểm Cho Học Sinh: ${userName}` : 'Nạp & Điều Chỉnh Điểm Học Sinh'}
            </h3>
          </div>
        </div>
      }
      description="Cộng hoặc điều chỉnh số dư Tia Sáng và Ngọc Tri Thức cho tài khoản học sinh."
    >
      <form onSubmit={handleSave} className="space-y-4 pt-1 text-xs">
        {/* Phần 1: Tia Sáng làm đề */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="admin-exam-points-input"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300"
            >
              <TiaSangIcon className="w-4 h-4" flat />
              <span>Tia Sáng (Năng lượng làm bài thi hàng ngày)</span>
            </label>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Hiện có: <strong className="text-amber-600 dark:text-amber-400">{currentTokenBalance}</strong> tia
            </span>
          </div>

          <div className="relative">
            <input
              id="admin-exam-points-input"
              type="number"
              min="0"
              max="9999"
              value={examPointsInput}
              onChange={(e) => setExamPointsInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full h-10 px-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base font-bold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 shadow-xs"
              placeholder="Nhập số Tia Sáng"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
              Tia
            </div>
          </div>

          {/* Mức chọn nhanh */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Chọn nhanh số lượng:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {TIA_SANG_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setExamPointsInput(preset.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer',
                    examPointsInput === preset.value
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phần 2: Ngọc Tri Thức */}
        <div className="p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="admin-diamonds-input"
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-900 dark:text-cyan-300"
            >
              <NgocIcon className="w-4 h-4" flat />
              <span>Ngọc Tri Thức (Điểm tích lũy đổi quà & hỏi AI)</span>
            </label>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Hiện có: <strong className="text-[#00B8DD]">{new Intl.NumberFormat('vi-VN').format(currentDiamondsBalance)}</strong> ngọc
            </span>
          </div>

          <div className="relative">
            <input
              id="admin-diamonds-input"
              type="number"
              min="0"
              max="999999"
              value={diamondsInput}
              onChange={(e) => setDiamondsInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full h-10 px-3 pr-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base font-bold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 shadow-xs"
              placeholder="Nhập số Ngọc"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
              Ngọc
            </div>
          </div>

          {/* Mức chọn nhanh */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Chọn nhanh số lượng:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {NGOC_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDiamondsInput(preset.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer',
                    diamondsInput === preset.value
                      ? 'bg-[#00B8DD] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-400'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phần 3: Lý do điều chỉnh */}
        <div>
          <label
            htmlFor="admin-points-note"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Lý do điều chỉnh (tùy chọn)
          </label>
          <input
            id="admin-points-note"
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 shadow-xs"
            placeholder="Ví dụ: Thưởng hoàn thành bài thi xuất sắc, hỗ trợ học sinh..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
