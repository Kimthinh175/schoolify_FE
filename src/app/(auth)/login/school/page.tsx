'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  School,
  Phone,
  ArrowRight,
  Building2,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { initAuthPopupSession, notifyAuthSuccessAndKillPopup } from '@/lib/auth-popup';

export default function SchoolLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [schoolCode, setSchoolCode] = React.useState('THPT-CN');
  const [phone, setPhone] = React.useState('0912345678');
  const [otpCode, setOtpCode] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    initAuthPopupSession();
  }, []);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = () => {
    if (!phone) return;
    setOtpSent(true);
    setOtpCode('998877');
    setCountdown(60);
  };

  const handleOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const principalUser = {
        id: 'usr-principal-01',
        fullname: 'Ban Giám Hiệu (THPT-CN)',
        email: 'principal@schoolify.edu.vn',
        phone: phone,
        role: 'USER' as const,
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        school_memberships: [
          {
            id: 'mem-01',
            user_id: 'usr-principal-01',
            school_id: 'sch-01',
            school_name: 'THPT Chuyên Công Nghệ Schoolify',
            role: 'PRINCIPAL' as const,
            joined_at: new Date().toISOString(),
          },
        ],
      };
      login(
        principalUser,
        'mock-school-token',
        'PRINCIPAL',
        'sch-01'
      );

      const killed = notifyAuthSuccessAndKillPopup({
        user: principalUser,
        token: 'mock-school-token',
        role: 'PRINCIPAL',
      });
      if (killed) return;

      router.push('/teacher/dashboard');
    }, 400);
  };

  return (
    <div className="max-w-md w-full my-auto">
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30 text-[#007D99] dark:text-[#00B8DD] items-center justify-center shadow-xs">
            <School className="w-6 h-6" />
          </div>
          <div>
            <Badge className="mb-2 bg-[#E6F8FC] text-[#007D99] dark:bg-[#00B8DD]/20 dark:text-[#00B8DD] border border-[#00B8DD]/30 text-[10px] font-bold">
              CỔNG VẬN HÀNH TRƯỜNG HỌC
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Nhập Nhà Trường
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Đăng nhập an toàn không cần mật khẩu qua Google Workspace hoặc mã OTP
            </p>
          </div>
        </div>

        {/* Primary Action 1: Google Workspace */}
        <div className="space-y-3">
          <GoogleLoginButton
            role="PRINCIPAL"
            returnUrl="/teacher/dashboard"
            label="Đăng nhập với Google Workspace for Education"
          />

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Hoặc xác thực bằng mã OTP
            </span>
          </div>
        </div>

        {/* Primary Action 2: Tenant Code + OTP Form */}
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Mã Cơ Sở Trường Học (Tenant Code)</span>
            </label>
            <Input
              type="text"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              placeholder="VD: THPT-CN"
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Số Điện Thoại Cán Bộ / BGH</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono flex-1"
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || !phone}
                className="px-4 py-2 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] active:bg-[#007D99] text-white font-bold text-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
              >
                {countdown > 0 ? `${countdown}s` : otpSent ? 'Gửi lại' : 'Gửi OTP'}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Nhập Mã OTP (6 Số)
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã gửi (Mã mẫu: 998877)
                </span>
              </div>
              <Input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="998877"
                leftIcon={<ShieldCheck className="w-4 h-4 text-[#00B8DD]" />}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-center tracking-widest text-base font-bold"
                required
                autoFocus
              />
            </div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!otpSent}
            className="w-full justify-center h-11 bg-[#00B8DD] hover:bg-[#009bbd] active:bg-[#007D99] text-white font-black text-sm shadow-md shadow-[#00B8DD]/25 transition-all cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Xác Thực OTP &amp; Vào Dashboard
          </Button>
        </form>

        {/* Switch Role Footer */}
        <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <p>
            Bạn thuộc phân hệ khác?{' '}
            <Link href="/login" className="text-[#00B8DD] font-bold hover:underline">
              Đổi vai trò đăng nhập
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
