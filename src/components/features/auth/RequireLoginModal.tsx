'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Lock,
  Sparkles,
  Trophy,
  Crown,
  Gift,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type RequireLoginReason = 'ADVANCED_LEVEL' | 'LEADERBOARD' | 'STORE' | 'GENERAL';

interface RequireLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: RequireLoginReason;
  targetLevelName?: string;
  onContinueGuest?: () => void;
}

export function RequireLoginModal({
  isOpen,
  onClose,
  reason = 'GENERAL',
  targetLevelName,
  onContinueGuest,
}: RequireLoginModalProps) {
  const getHeaderInfo = () => {
    switch (reason) {
      case 'ADVANCED_LEVEL':
        return {
          icon: <Crown className="w-7 h-7 text-amber-500" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
          badge: 'Quyền Lợi Thành Viên',
          badgeVariant: 'warning' as const,
          title: targetLevelName
            ? `Mở Khóa Cấp Độ: ${targetLevelName}`
            : 'Mở Khóa Đề Nâng Cao & HSG',
          description:
            'Cấp độ Nâng cao, HSG Tỉnh và HSG Quốc gia yêu cầu tài khoản học sinh để ghi nhận điểm số và mở khóa trọn bộ ngân hàng câu hỏi chuyên sâu.',
        };
      case 'LEADERBOARD':
        return {
          icon: <Trophy className="w-7 h-7 text-[#00B8DD]" />,
          iconBg: 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD]/30',
          badge: 'Bảng Vàng Thi Đua',
          badgeVariant: 'primary' as const,
          title: 'Ghi Tên Lên Bảng Xếp Hạng',
          description:
            'Đăng nhập tài khoản học sinh để lưu lịch sử làm bài, tính điểm thi đua và tranh tài cùng học sinh toàn quốc.',
        };
      case 'STORE':
        return {
          icon: <Gift className="w-7 h-7 text-rose-500" />,
          iconBg: 'bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
          badge: 'Kho Quà Tặng 💎',
          badgeVariant: 'danger' as const,
          title: 'Đổi Thưởng Kim Cương 💎',
          description:
            'Đăng nhập để xem số kim cương tích lũy của bạn và đổi voucher học tập, sách tham khảo hoặc quà tặng hiện vật.',
        };
      default:
        return {
          icon: <Lock className="w-7 h-7 text-[#00B8DD]" />,
          iconBg: 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD]/30',
          badge: 'Đăng Nhập Học Sinh',
          badgeVariant: 'primary' as const,
          title: 'Trải Nghiệm Toàn Diện Schoolify',
          description:
            'Đăng nhập để mở khóa đầy đủ tính năng luyện thi, lưu tiến độ học tập và tham gia cộng đồng luyện thi K-12.',
        };
    }
  };

  const header = getHeaderInfo();

  const benefits = [
    {
      title: 'Mở khóa 100% ngân hàng đề chuyên sâu',
      desc: 'Hơn 50.000 câu hỏi vận dụng cao và đề thi chọn HSG Tỉnh, Quốc gia qua các năm.',
    },
    {
      title: 'Lưu tiến độ & Phân tích lỗ hổng kiến thức',
      desc: 'Báo cáo radar chỉ rõ chủ đề còn yếu để đề xuất bài tập bổ trợ cá nhân hóa.',
    },
    {
      title: 'Tích lũy kim cương 💎 & Đua top toàn quốc',
      desc: 'Mỗi bài luyện thi hoàn thành đều được cộng điểm và xếp hạng thi đua tuần.',
    },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center pt-2 pb-1">
        {/* Header Icon */}
        <div className="flex justify-center mb-3">
          <div
            className={`w-16 h-16 rounded-3xl border-2 flex items-center justify-center shadow-lg ${header.iconBg}`}
          >
            {header.icon}
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-2">
          <Badge variant={header.badgeVariant} className="text-[11px] font-bold">
            {header.badge}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {header.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
          {header.description}
        </p>

        {/* Benefits list */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {b.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 space-y-2.5">
          <Link href="/login/student" className="block w-full">
            <Button
              size="lg"
              className="w-full bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-[#00B8DD]/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Đăng Nhập Tài Khoản Học Sinh
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClose();
              if (onContinueGuest) onContinueGuest();
            }}
            className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            Tiếp Tục Luyện Thử Cấp Độ Cơ Bản (Miễn Phí)
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
