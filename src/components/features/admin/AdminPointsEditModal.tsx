'use client';

import * as React from 'react';
import { Check, ShieldAlert, ShieldCheck, Sliders } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { examPointsService } from '@/services/exam-points.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminPointsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTokenBalance: number;
  currentDiamondsBalance: number;
  userId?: string;
  userName?: string;
  onUpdated?: (newPoints: number, newDiamonds: number, auditNote?: string) => void;
}

const MAX_TIA_DELTA = 50;
const MAX_NGOC_DELTA = 500;

const TIA_DELTA_PRESETS = [
  { delta: -3, label: '-3 Tia' },
  { delta: 3, label: '+3 Tia (1 đề CB)' },
  { delta: 4, label: '+4 Tia (1 đề TB)' },
  { delta: 9, label: '+9 Tia (1 đề NC)' },
];

const NGOC_DELTA_PRESETS = [
  { delta: -20, label: '-20 Ngọc' },
  { delta: 10, label: '+10 Ngọc' },
  { delta: 25, label: '+25 Ngọc' },
  { delta: 50, label: '+50 Ngọc' },
];

const CSKH_REASON_TEMPLATES = [
  'Hoàn Tia Sáng do câu hỏi/đề thi bị lỗi',
  'Bù Tia Sáng do sự cố mất kết nối phòng thi',
  'Hoàn Ngọc Tri Thức do lỗi đổi quà cửa hàng',
  'Thưởng đóng góp báo lỗi câu hỏi hợp lệ',
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
  const { user, currentRole } = useAuthStore();
  const isSuperAdmin =
    currentRole === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN';

  const [tiaDelta, setTiaDelta] = React.useState<number>(0);
  const [ngocDelta, setNgocDelta] = React.useState<number>(0);
  const [reasonInput, setReasonInput] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Reset form mỗi lần mở modal
  React.useEffect(() => {
    if (isOpen) {
      setTiaDelta(0);
      setNgocDelta(0);
      setReasonInput('');
    }
  }, [isOpen, currentTokenBalance, currentDiamondsBalance]);

  const nextTokenBalance = Math.max(0, currentTokenBalance + tiaDelta);
  const nextDiamondsBalance = Math.max(0, currentDiamondsBalance + ngocDelta);
  const effectiveTiaDelta = nextTokenBalance - currentTokenBalance;
  const effectiveNgocDelta = nextDiamondsBalance - currentDiamondsBalance;
  const hasChange = effectiveTiaDelta !== 0 || effectiveNgocDelta !== 0;
  const trimmedReason = reasonInput.trim();
  const isReasonValid = trimmedReason.length >= 5;

  const clampTiaDelta = (val: number) =>
    Math.max(-MAX_TIA_DELTA, Math.min(MAX_TIA_DELTA, Number.isFinite(val) ? Math.trunc(val) : 0));

  const clampNgocDelta = (val: number) =>
    Math.max(-MAX_NGOC_DELTA, Math.min(MAX_NGOC_DELTA, Number.isFinite(val) ? Math.trunc(val) : 0));

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isSuperAdmin) {
      toast.error('Chỉ Quản trị viên cấp cao (SUPER_ADMIN) mới có quyền bù/hoàn điểm CSKH.');
      return;
    }

    if (!hasChange) {
      toast.warning('Chưa có thay đổi số dư', {
        description: 'Vui lòng nhập mức bù/hoàn Tia Sáng hoặc Ngọc khác 0.',
      });
      return;
    }

    if (!isReasonValid) {
      toast.error('Bắt buộc nhập lý do điều chỉnh', {
        description: 'Vui lòng ghi rõ lý do CSKH (tối thiểu 5 ký tự) để lưu nhật ký kiểm toán.',
      });
      return;
    }

    const adminTag = user?.fullname || user?.email || 'SUPER_ADMIN';
    const auditNote = `[CSKH - ${adminTag}] ${trimmedReason}`;

    setIsSubmitting(true);
    try {
      const res = await examPointsService.adminAdjustPoints({
        userId,
        examPoints: nextTokenBalance,
        diamonds: nextDiamondsBalance,
        note: auditNote,
      });

      if (res?.ok) {
        const deltaParts: string[] = [];
        if (effectiveTiaDelta !== 0) {
          deltaParts.push(`Tia Sáng ${effectiveTiaDelta > 0 ? '+' : ''}${effectiveTiaDelta}`);
        }
        if (effectiveNgocDelta !== 0) {
          deltaParts.push(`Ngọc ${effectiveNgocDelta > 0 ? '+' : ''}${effectiveNgocDelta}`);
        }
        toast.success('Đã ghi nhận bù/hoàn điểm CSKH!', {
          description: `${deltaParts.join(' • ')} — Đã lưu nhật ký kiểm toán.`,
        });
        if (onUpdated) {
          onUpdated(nextTokenBalance, nextDiamondsBalance, auditNote);
        }
        onClose();
      } else {
        toast.error('Không thể cập nhật số dư', {
          description: res?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
        });
      }
    } catch (err: any) {
      toast.error('Không thể thực hiện điều chỉnh CSKH', {
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
          <div className="w-8 h-8 rounded-xl bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/25 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {userName ? `Hỗ Trợ Bù / Hoàn Điểm: ${userName}` : 'Hỗ Trợ Bù / Hoàn Điểm (CSKH)'}
            </h3>
          </div>
        </div>
      }
      description="Chỉ dùng cho hỗ trợ CSKH (hoàn điểm đề lỗi, sự cố giao dịch). Mọi thao tác bắt buộc ghi lý do và lưu vào nhật ký hệ thống."
    >
      {!isSuperAdmin ? (
        <div className="py-4 space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Không đủ quyền thao tác</p>
              <p className="mt-0.5">
                Chỉ tài khoản <strong>SUPER_ADMIN</strong> mới được phép thực hiện bù hoặc hoàn số dư Tia Sáng / Ngọc Tri Thức.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 rounded-xl text-xs">
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 pt-1 text-xs">
          {/* Phần 1: Bù / Hoàn Tia Sáng */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="admin-tia-delta-input"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white"
              >
                <TiaSangIcon className="w-4 h-4" flat />
                <span>Bù / Hoàn Tia Sáng</span>
                <span className="text-[10px] font-medium text-slate-400">(Tối đa ±{MAX_TIA_DELTA} Tia/lần)</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                Hiện có: <strong className="text-slate-800 dark:text-slate-200">{currentTokenBalance}</strong>
                {effectiveTiaDelta !== 0 && (
                  <>
                    {' → '}
                    <strong className="text-[#007D99] dark:text-[#00B8DD]">
                      {nextTokenBalance} ({effectiveTiaDelta > 0 ? '+' : ''}{effectiveTiaDelta})
                    </strong>
                  </>
                )}
              </span>
            </div>

            <div className="relative">
              <input
                id="admin-tia-delta-input"
                type="number"
                min={-MAX_TIA_DELTA}
                max={MAX_TIA_DELTA}
                value={tiaDelta}
                onChange={(e) => setTiaDelta(clampTiaDelta(parseInt(e.target.value, 10)))}
                className="w-full h-10 px-3 pr-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-bold tabular-nums focus:outline-hidden focus:border-[#00B8DD] shadow-2xs"
                placeholder="Nhập mức bù (+) hoặc trừ (-)"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                ± Tia
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {TIA_DELTA_PRESETS.map((preset) => (
                <button
                  key={preset.delta}
                  type="button"
                  onClick={() => setTiaDelta(preset.delta)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer',
                    tiaDelta === preset.delta
                      ? 'bg-[#00B8DD] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/60'
                  )}
                >
                  {preset.label}
                </button>
              ))}
              {tiaDelta !== 0 && (
                <button
                  type="button"
                  onClick={() => setTiaDelta(0)}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-[#00B8DD] cursor-pointer"
                >
                  Về 0
                </button>
              )}
            </div>
          </div>

          {/* Phần 2: Bù / Hoàn Ngọc Tri Thức */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="admin-ngoc-delta-input"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white"
              >
                <NgocIcon className="w-4 h-4" flat />
                <span>Bù / Hoàn Ngọc Tri Thức</span>
                <span className="text-[10px] font-medium text-slate-400">(Tối đa ±{MAX_NGOC_DELTA} Ngọc/lần)</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                Hiện có:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {new Intl.NumberFormat('vi-VN').format(currentDiamondsBalance)}
                </strong>
                {effectiveNgocDelta !== 0 && (
                  <>
                    {' → '}
                    <strong className="text-[#007D99] dark:text-[#00B8DD]">
                      {new Intl.NumberFormat('vi-VN').format(nextDiamondsBalance)} ({effectiveNgocDelta > 0 ? '+' : ''}
                      {effectiveNgocDelta})
                    </strong>
                  </>
                )}
              </span>
            </div>

            <div className="relative">
              <input
                id="admin-ngoc-delta-input"
                type="number"
                min={-MAX_NGOC_DELTA}
                max={MAX_NGOC_DELTA}
                value={ngocDelta}
                onChange={(e) => setNgocDelta(clampNgocDelta(parseInt(e.target.value, 10)))}
                className="w-full h-10 px-3 pr-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-bold tabular-nums focus:outline-hidden focus:border-[#00B8DD] shadow-2xs"
                placeholder="Nhập mức hoàn (+) hoặc thu hồi (-)"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                ± Ngọc
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {NGOC_DELTA_PRESETS.map((preset) => (
                <button
                  key={preset.delta}
                  type="button"
                  onClick={() => setNgocDelta(preset.delta)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer',
                    ngocDelta === preset.delta
                      ? 'bg-[#00B8DD] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/60'
                  )}
                >
                  {preset.label}
                </button>
              ))}
              {ngocDelta !== 0 && (
                <button
                  type="button"
                  onClick={() => setNgocDelta(0)}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-[#00B8DD] cursor-pointer"
                >
                  Về 0
                </button>
              )}
            </div>
          </div>

          {/* Phần 3: Lý do CSKH (Bắt buộc ghi Audit Log) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-points-note"
                className="block text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Lý do bù / hoàn điểm (Bắt buộc) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {trimmedReason.length < 5 ? 'Tối thiểu 5 ký tự' : 'Hợp lệ'}
              </span>
            </div>
            <input
              id="admin-points-note"
              type="text"
              required
              minLength={5}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:border-[#00B8DD] shadow-2xs"
              placeholder="Ví dụ: Hoàn 3 Tia Sáng do đề Toán 12 câu #14 bị lỗi đáp án..."
            />
            <div className="flex flex-wrap gap-1.5">
              {CSKH_REASON_TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setReasonInput(tpl)}
                  className={cn(
                    'px-2 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer',
                    reasonInput === tpl
                      ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/40 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/50'
                  )}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Thông báo Audit Log minh bạch */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#00B8DD]/5 border border-[#00B8DD]/20 text-[11px] text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#00B8DD] shrink-0 mt-0.5" />
            <span>
              Mọi thay đổi đều tự động ghi nhật ký kiểm toán (<strong>exam_point_logs</strong>) kèm tài khoản{' '}
              <strong>SUPER_ADMIN</strong> thực hiện và lý do CSKH để đảm bảo minh bạch.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !hasChange || !isReasonValid}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-xs shadow-[#00B8DD]/25 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Xác nhận bù / hoàn điểm
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
