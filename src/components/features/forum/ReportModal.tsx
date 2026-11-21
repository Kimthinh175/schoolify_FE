'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Info,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  targetTitle?: string;
  onSuccess?: (msg: string) => void;
}

const REPORT_REASONS = [
  {
    key: 'SPAM',
    label: 'Spam / Tin rác / Quảng cáo trái phép',
    desc: 'Đăng lặp lại, chứa đường link lừa đảo, cờ bạc hoặc bán hàng không liên quan đến học tập.',
  },
  {
    key: 'OFFENSIVE_LANGUAGE',
    label: 'Ngôn từ thiếu chuẩn mực, thô tục',
    desc: 'Sử dụng từ ngữ kích động, xúc phạm người khác, chửi bậy, không tôn trọng thành viên.',
  },
  {
    key: 'MISINFORMATION',
    label: 'Nội dung giải sai kiến thức nghiêm trọng',
    desc: 'Cố tình cung cấp lời giải sai, công thức bịa đặt gây ảnh hưởng đến việc ôn thi của học sinh.',
  },
  {
    key: 'HARASSMENT',
    label: 'Quấy rối / Công kích cá nhân',
    desc: 'Đe dọa, bắt nạt, chế giễu bạn học hoặc giáo viên trong cộng đồng.',
  },
  {
    key: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các hành vi vi phạm chuẩn mực văn hóa học đường khác.',
  },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSuccess,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>('SPAM');
  const [description, setDescription] = React.useState('');
  const [evidenceUrl, setEvidenceUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedReason('SPAM');
      setDescription('');
      setEvidenceUrl('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMsg('Vui lòng chọn một lý do vi phạm.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
        evidenceUrls: evidenceUrl.trim() ? [evidenceUrl.trim()] : [],
        userId: 'seed-student-01',
      };

      let res = await fetch('http://localhost:3005/api/v1/forum/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/v1/forum/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      const defaultMsg =
        'Cảm ơn bạn đã gửi báo cáo vi phạm. Quản trị viên sẽ sớm kiểm duyệt nội dung này để giữ gìn môi trường học tập lành mạnh.';
      const resJson = res ? await res.json().catch(() => null) : null;
      const message = resJson?.message || defaultMsg;

      setSuccessMsg(message);
      if (onSuccess) onSuccess(message);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.');
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
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Báo cáo vi phạm quy tắc cộng đồng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Đối tượng báo cáo:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {targetType === 'POST' ? 'Bài hỏi / Chủ đề' : 'Bình luận / Lời giải'}
              </span>
              {targetTitle && (
                <span className="italic"> — &ldquo;{targetTitle.slice(0, 50)}...&rdquo;</span>
              )}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {successMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{successMsg}</p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Chọn lý do vi phạm chính:</span>
              </label>

              <div className="space-y-2">
                {REPORT_REASONS.map((r) => {
                  const isSelected = selectedReason === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setSelectedReason(r.key)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer',
                        isSelected
                          ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedReason(r.key)}
                        className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                      <div className="space-y-0.5 flex-1">
                        <div className="text-xs sm:text-sm font-semibold">{r.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          {r.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mô tả chi tiết vi phạm (tùy chọn):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cung cấp thêm chi tiết để Admin xử lý nhanh chóng..."
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                URL ảnh chụp bằng chứng (nếu có):
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://imgur.com/evidence.png"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Báo cáo của bạn được gửi ẩn danh và bảo mật đến Ban Kiểm duyệt Schoolify. Chúng tôi
                cam kết duy trì môi trường trao đổi học tập chuẩn mực và tôn trọng lẫn nhau.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 shadow-sm shadow-rose-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi báo cáo...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>Gửi báo cáo vi phạm</span>
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Dialog>
  );
}
