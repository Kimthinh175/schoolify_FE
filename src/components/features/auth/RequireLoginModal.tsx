'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Sparkles,
  Trophy,
  Crown,
  Gift,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export type RequireLoginReason = 'ADVANCED_LEVEL' | 'LEADERBOARD' | 'STORE' | 'GENERAL';

interface RequireLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: RequireLoginReason;
  targetLevelName?: string;
  onContinueGuest?: () => void;
  returnUrl?: string;
  onSuccessLogin?: () => void;
}

export function RequireLoginModal({
  isOpen,
  onClose,
  reason = 'GENERAL',
  targetLevelName,
  onContinueGuest,
  returnUrl,
  onSuccessLogin,
}: RequireLoginModalProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isDemoLoggingIn, setIsDemoLoggingIn] = React.useState(false);

  const handleQuickDemoLogin = () => {
    setIsDemoLoggingIn(true);
    setTimeout(() => {
      login(
        {
          id: 'usr-student-01',
          fullname: 'Nguyễn Hoàng Minh',
          email: 'student.minh@schoolify.edu.vn',
          role: 'USER',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_memberships: [
            {
              id: 'mem-01',
              user_id: 'usr-student-01',
              school_id: 'sch-01',
              school_name: 'THPT Chuyên Công Nghệ Schoolify',
              role: 'STUDENT',
              joined_at: new Date().toISOString(),
            },
          ],
        },
        'mock-student-token',
        'STUDENT',
        'sch-01'
      );
      toast.success('Đăng nhập thành công!', {
        description: 'Chào mừng Nguyễn Hoàng Minh (THPT Chuyên Công Nghệ Schoolify)',
      });
      setIsDemoLoggingIn(false);
      onClose();
      if (onSuccessLogin) {
        onSuccessLogin();
      } else if (returnUrl) {
        router.push(returnUrl);
      }
    }, 300);
  };
  const getHeaderInfo = () => {
    switch (reason) {
      case 'ADVANCED_LEVEL':
        return {
          icon: <Crown className="w-7 h-7 text-amber-500" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
          badge: 'Yêu Cầu Đăng Nhập',
          badgeVariant: 'warning' as const,
          title: targetLevelName
            ? `Đăng Nhập Để Tạo Đề: ${targetLevelName}`
            : 'Đăng Nhập Để Tạo Đề & Luyện Thi',
          description:
            'Bạn cần đăng nhập tài khoản học sinh để tạo đề thi, kiểm tra số dư Tia Sáng và lưu trữ lịch sử làm bài cá nhân hóa.',
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
          title: 'Đổi Thưởng Ngọc Tri Thức 💎',
          description:
            'Đăng nhập để xem số ngọc tri thức tích lũy của bạn và đổi voucher học tập, sách tham khảo hoặc quà tặng hiện vật.',
        };
      default:
        return {
          icon: <Lock className="w-7 h-7 text-[#00B8DD]" />,
          iconBg: 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD]/30',
          badge: 'Yêu Cầu Đăng Nhập',
          badgeVariant: 'primary' as const,
          title: 'Đăng Nhập Để Tạo Đề Thi',
          description:
            'Vui lòng đăng nhập tài khoản học sinh để tạo đề thi mới, sử dụng Tia Sáng năng lượng và lưu tiến độ học tập K-12.',
        };
    }
  };

  const header = getHeaderInfo();

  const benefits = [
    {
      title: 'Tạo đề thi cá nhân hóa theo chương & cấp độ',
      desc: 'Tự động kiểm tra Tia Sáng năng lượng và sinh đề bám sát chương trình học phổ thông.',
    },
    {
      title: 'Lưu tiến độ & Phân tích lỗ hổng kiến thức',
      desc: 'Báo cáo chỉ rõ chuyên đề còn yếu để đề xuất lộ trình ôn tập cá nhân hóa.',
    },
    {
      title: 'Tích lũy Ngọc Tri Thức & Đua top toàn quốc',
      desc: 'Mỗi bài luyện thi hoàn thành đều được ghi nhận điểm số và xếp hạng thi đua.',
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
          {/* Standard Student Login Page Button */}
          <Link
            href={returnUrl ? `/login/student?returnUrl=${encodeURIComponent(returnUrl)}` : '/login/student'}
            className="block w-full"
          >
            <Button
              size="lg"
              className="w-full bg-[#00B8DD] hover:bg-[#009dbd] text-white font-bold text-sm rounded-xl shadow-md shadow-cyan-500/20 cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Đăng Nhập Tài Khoản Học Sinh Ngay
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
          >
            Đóng &amp; Quay lại
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
