'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Baby,
  Lock,
  Phone,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';

export default function ParentLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loginMethod, setLoginMethod] = React.useState<'OTP' | 'PASSWORD'>('OTP');
  const [phone, setPhone] = React.useState('0909123456');
  const [password, setPassword] = React.useState('123456');
  const [otpCode, setOtpCode] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  // Countdown timer for OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = () => {
    if (!phone) return;
    setOtpSent(true);
    setOtpCode('889966');
    setCountdown(60);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(
        {
          id: 'usr-parent-01',
          fullname: 'Nguyễn Văn Tuấn (Phụ huynh)',
          email: 'parent.tuan@schoolify.edu.vn',
          phone: phone,
          role: 'USER',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_memberships: [
            {
              id: 'mem-01',
              user_id: 'usr-parent-01',
              school_id: 'sch-01',
              school_name: 'THPT Chuyên Công Nghệ Schoolify',
              role: 'PARENT',
              joined_at: new Date().toISOString(),
            },
          ],
        },
        'mock-parent-token',
        'PARENT',
        'sch-01'
      );
      router.push('/parent/dashboard');
    }, 400);
  };

  return (
    <div className="max-w-md w-full my-auto">
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl space-y-5">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 items-center justify-center shadow-xs">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <Badge className="mb-2 bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold">
              SỔ LIÊN LẠC ĐIỆN TỬ
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Nhập Phụ Huynh
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Theo dõi kết quả học tập của con & nhận thông báo từ trường
            </p>
          </div>
        </div>

        {/* Method Switcher Tabs (OTP / Password) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginMethod('OTP')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'OTP'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mã OTP (SMS / Zalo)</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('PASSWORD')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'PASSWORD'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Mật Khẩu</span>
          </button>
        </div>

        {/* OTP Mode Form */}
        {loginMethod === 'OTP' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số Điện Thoại Đã Đăng Ký Với Trường
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0909123456"
                  leftIcon={<Phone className="w-4 h-4 text-rose-500" />}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || !phone}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? 'Gửi lại' : 'Gửi mã OTP'}
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
                    <CheckCircle2 className="w-3 h-3" /> Đã gửi (Mã mẫu: 889966)
                  </span>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="889966"
                  leftIcon={<ShieldCheck className="w-4 h-4 text-rose-500" />}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-center tracking-widest text-base font-bold"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center h-11 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-black text-sm shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Xác Nhận & Vào Sổ Liên Lạc
            </Button>
          </form>
        ) : (
          /* Password Mode Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số Điện Thoại Phụ Huynh
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0909123456"
                leftIcon={<Phone className="w-4 h-4 text-rose-500" />}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mật Khẩu
                </label>
                <a href="#" className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-rose-500" />}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full justify-center h-11 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-black text-sm shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Vào Sổ Liên Lạc Của Con
            </Button>
          </form>
        )}



        {/* Switch Role Footer */}
        <div className="text-center text-xs text-slate-500 pt-1">
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
