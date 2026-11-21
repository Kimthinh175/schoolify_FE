'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Gem, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface RequireLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export function RequireLoginModal({
  isOpen,
  onClose,
  actionName = 'tham gia thảo luận và tương tác',
}: RequireLoginModalProps) {
  const router = useRouter();

  const handleNavigateLogin = () => {
    onClose();
    router.push('/auth/login');
  };

  const handleNavigateRegister = () => {
    onClose();
    router.push('/auth/register');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5 text-[#00B8DD]">
          <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#00B8DD]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Đăng nhập để tiếp tục
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Dành cho khách vãng lai và thành viên cộng đồng
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Bạn cần đăng nhập tài khoản Schoolify để{' '}
          <span className="font-bold text-slate-900 dark:text-white underline decoration-[#00B8DD] decoration-2">
            {actionName}
          </span>
          . Tham gia ngay hôm nay để nhận nhiều đặc quyền học tập hấp dẫn!
        </p>

        {/* Khung lợi ích khi đăng nhập */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#00B8DD]/5 via-sky-50/50 to-indigo-50/30 dark:from-[#00B8DD]/10 dark:via-slate-900 dark:to-indigo-950/20 border border-[#00B8DD]/20 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00B8DD]">
            <Gem className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Quyền lợi độc quyền của thành viên:</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Cộng thưởng <b className="text-emerald-600 dark:text-emerald-400">+10 đến +15 Ngọc Tri Thức</b> khi chia sẻ lời giải chuẩn xác.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Thả Hữu ích (ThumbsUp), bình luận trao đổi và theo dõi tiến độ giải đề.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Chốt &ldquo;Lời giải đúng nhất&rdquo; cho câu hỏi của chính bạn.</span>
            </div>
          </div>
        </div>

        {/* Buttons hành động */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            onClick={handleNavigateLogin}
            className="w-full bg-[#00B8DD] hover:bg-[#009bb8] text-white font-bold text-xs sm:text-sm py-2.5 gap-2 shadow-sm shadow-[#00B8DD]/30 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleNavigateRegister}
            className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs py-2 gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo tài khoản mới (Miễn phí)</span>
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Để sau, tôi muốn tiếp tục xem thêm
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
