'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Phone,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { toast } from 'sonner';
import { initAuthPopupSession, notifyAuthSuccessAndKillPopup } from '@/lib/auth-popup';

function TeacherLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const isPopup = searchParams.get('popup') === '1';
  const { login } = useAuthStore();

  // OTP state
  const [phone, setPhone] = React.useState('0902000001');
  const [otpCode, setOtpCode] = React.useState('');
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null);
  const [otpSent, setOtpSent] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    initAuthPopupSession();
  }, []);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại giảng viên.');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || 'Không thể gửi mã OTP.';
        setErrorMsg(msg);
        toast.error('Gửi OTP thất bại', { description: msg });
        return;
      }
      setOtpSent(true);
      setCountdown(60);
      if (data?.devOtp) {
        setDevOtpHint(data.devOtp);
        setOtpCode(data.devOtp);
      }
      toast.success('Đã gửi mã OTP!', {
        description: data?.devOtp
          ? `Mã OTP xác thực của bạn là: ${data.devOtp}`
          : 'Vui lòng kiểm tra tin nhắn điện thoại.',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi kết nối khi gửi OTP.');
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.user) {
        const msg = data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
        setErrorMsg(msg);
        toast.error('Xác thực OTP thất bại', { description: msg });
        return;
      }

      login(data.user, data.accessToken || '', 'TEACHER');

      // Nếu đang trong subtab/popup: phát tín hiệu về tab cha và KILL ngay lập tức!
      const killed = notifyAuthSuccessAndKillPopup({
        user: data.user,
        token: data.accessToken,
        role: 'TEACHER',
      });
      if (killed) return;

      toast.success('Đăng nhập thành công!', {
        id: 'schoolify-auth-success',
        description: `Chào mừng Giảng viên ${data.user.fullname}!`,
      });

      router.push('/teacher/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full my-auto">
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 items-center justify-center shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <Badge className="mb-2 bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
              CỔNG DÀNH CHO GIẢNG VIÊN &amp; CREATOR
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Nhập Người Bán Khóa Học
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Đăng nhập an toàn không cần mật khẩu qua Google hoặc mã OTP
            </p>
          </div>
        </div>

        {/* Primary Action 1: Google Login */}
        <div className="space-y-3">
          <GoogleLoginButton
            role="TEACHER"
            returnUrl="/teacher/dashboard"
            label="Tiếp tục bằng tài khoản Google (Gmail)"
          />

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Hoặc đăng nhập bằng mã OTP
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action 2: Phone OTP Form */}
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Số Điện Thoại Giảng Viên</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0902000001"
                leftIcon={<Phone className="w-4 h-4 text-amber-500" />}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono flex-1"
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || !phone.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
              >
                {countdown > 0 ? `${countdown}s` : otpSent ? 'Gửi lại' : 'Gửi mã OTP'}
              </button>
            </div>
          </div>

          {otpSent ? (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Nhập Mã OTP (6 Số)
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {devOtpHint ? `Mã OTP: ${devOtpHint}` : 'Đã gửi qua tin nhắn'}
                </span>
              </div>
              <Input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Nhập 6 chữ số OTP"
                leftIcon={<ShieldCheck className="w-4 h-4 text-amber-500" />}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-center tracking-widest text-base font-bold"
                required
                autoFocus
              />
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              * Bấm &quot;Gửi mã OTP&quot; để nhận mã số đăng nhập bảo mật gửi tới số điện thoại của bạn.
            </p>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!otpSent}
            className="w-full justify-center h-11 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Xác Thực OTP &amp; Đăng Nhập
          </Button>
        </form>

        {/* Switch Role Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
          <p>
            Bạn là Người Luyện Thi?{' '}
            <Link
              href={
                isPopup
                  ? returnUrl
                    ? `/login/student?returnUrl=${encodeURIComponent(returnUrl)}&popup=1`
                    : '/login/student?popup=1'
                  : returnUrl
                    ? `/login/student?returnUrl=${encodeURIComponent(returnUrl)}`
                    : '/login/student'
              }
              className="text-[#00B8DD] font-bold hover:underline"
            >
              Sang cổng Học sinh
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-md w-full my-auto p-8 text-center text-slate-400 text-xs">
          Đang tải cổng đăng nhập giảng viên...
        </div>
      }
    >
      <TeacherLoginForm />
    </React.Suspense>
  );
}
