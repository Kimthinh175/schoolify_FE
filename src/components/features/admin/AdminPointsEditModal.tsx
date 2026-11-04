'use client';

import * as React from 'react';
import { Sparkles, Check, X, ShieldAlert, Sliders, RefreshCw } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  onUpdated?: (newPoints: number, newDiamonds: number) => void;
}

const TIA_SANG_PRESETS = [
  { value: 0, label: '0 ✨ (Hết)', tip: 'Test chặn tạo đề & gạ mua gói' },
  { value: 2, label: '2 ✨ (Thiếu)', tip: 'Thiếu điểm đề Cơ bản (cần 3đ)' },
  { value: 3, label: '3 ✨ (Cơ bản)', tip: 'Đủ 1 đề Cơ bản' },
  { value: 4, label: '4 ✨ (TB)', tip: 'Đủ 1 đề Trung bình' },
  { value: 9, label: '9 ✨ (Chuẩn)', tip: 'Hạn mức Free mặc định 1 ngày' },
  { value: 27, label: '27 ✨ (VIP)', tip: 'Hạn mức Gói Thủ Khoa' },
  { value: 99, label: '99 ✨ (Max)', tip: 'Thả ga test không giới hạn' },
];

const NGOC_PRESETS = [
  { value: 0, label: '0 💎' },
  { value: 50, label: '50 💎' },
  { value: 100, label: '100 💎' },
  { value: 500, label: '500 💎' },
  { value: 999, label: '999 💎' },
];

export function AdminPointsEditModal({
  isOpen,
  onClose,
  currentTokenBalance,
  currentDiamondsBalance,
  userId,
  onUpdated,
}: AdminPointsEditModalProps) {
  const [examPointsInput, setExamPointsInput] = React.useState<number>(currentTokenBalance);
  const [diamondsInput, setDiamondsInput] = React.useState<number>(currentDiamondsBalance);
  const [noteInput, setNoteInput] = React.useState<string>('Admin điều chỉnh điểm thủ công');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Đồng bộ giá trị khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      setExamPointsInput(currentTokenBalance);
      setDiamondsInput(currentDiamondsBalance);
      setNoteInput('Admin điều chỉnh điểm thủ công');
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
        toast.success('Cập nhật điểm thành công!', {
          description: `Tia Sáng: ${examPointsInput} ✨ | Ngọc Tri Thức: ${diamondsInput} 💎`,
        });
        if (onUpdated) {
          onUpdated(examPointsInput, diamondsInput);
        }
        onClose();
      } else {
        toast.error('Không thể cập nhật điểm', {
          description: res?.message || 'Có lỗi xảy ra từ máy chủ.',
        });
      }
    } catch (err: any) {
      toast.error('Lỗi khi điều chỉnh điểm', {
        description: err?.message || 'Vui lòng kiểm tra lại quyền Admin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="pt-2 pb-1" data-testid="admin-points-edit-modal">
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Chỉnh Điểm Quản Trị Viên
              </h3>
              <Badge variant="warning" className="text-[10px] font-extrabold px-1.5 py-0.5">
                ADMIN
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Điều chỉnh số dư Tia Sáng & Ngọc Tri Thức trực tiếp ngoài client
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-left">
          {/* Section 1: Tia Sáng làm đề (exam_points) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-exam-points-input"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300"
              >
                <TiaSangIcon className="w-4 h-4" flat />
                <span>Tia Sáng làm đề thi (exam_points)</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Hiện tại: <strong className="text-amber-600 dark:text-amber-400">{currentTokenBalance}</strong>
              </span>
            </div>

            <div className="relative">
              <input
                id="admin-exam-points-input"
                data-testid="input-admin-exam-points"
                type="number"
                min="0"
                max="9999"
                value={examPointsInput}
                onChange={(e) => setExamPointsInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full h-11 px-3.5 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base font-bold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 shadow-xs"
                placeholder="Nhập số điểm Tia Sáng (0, 3, 9, ...)"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                Tia
              </div>
            </div>

            {/* Quick Presets Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Chọn nhanh để test:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {TIA_SANG_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    title={preset.tip}
                    data-testid={`preset-exam-points-${preset.value}`}
                    onClick={() => setExamPointsInput(preset.value)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer',
                      examPointsInput === preset.value
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Ngọc Tri Thức (points) */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-diamonds-input"
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-900 dark:text-cyan-300"
              >
                <NgocIcon className="w-4 h-4" flat />
                <span>Ngọc Tri Thức / Kim Cương (points)</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Hiện tại: <strong className="text-[#00B8DD]">{currentDiamondsBalance}</strong>
              </span>
            </div>

            <div className="relative">
              <input
                id="admin-diamonds-input"
                data-testid="input-admin-diamonds"
                type="number"
                min="0"
                max="99999"
                value={diamondsInput}
                onChange={(e) => setDiamondsInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full h-11 px-3.5 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base font-bold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 shadow-xs"
                placeholder="Nhập số Ngọc Tri Thức"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                Ngọc
              </div>
            </div>

            {/* Quick Presets Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Chọn nhanh:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {NGOC_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    data-testid={`preset-diamonds-${preset.value}`}
                    onClick={() => setDiamondsInput(preset.value)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer',
                      diamondsInput === preset.value
                        ? 'bg-[#00B8DD] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Ghi chú */}
          <div>
            <label
              htmlFor="admin-points-note"
              className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Ghi chú điều chỉnh (tùy chọn)
            </label>
            <input
              id="admin-points-note"
              data-testid="input-admin-note"
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 shadow-xs"
              placeholder="VD: Test kịch bản 0 điểm chặn đề thi"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <Button
              type="submit"
              data-testid="btn-save-admin-points"
              isLoading={isSubmitting}
              className="text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-md shadow-amber-500/20"
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Lưu & Cập Nhật Điểm
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
