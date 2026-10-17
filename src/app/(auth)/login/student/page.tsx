'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { toast } from 'sonner';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/luyen-thi';
  const isRedirectedFromExam =
    returnUrl.includes('exam-room') ||
    returnUrl.includes('olympiad') ||
    returnUrl.includes('practice');

  const { login } = useAuthStore();
  const [studentCode, setStudentCode] = React.useState('HS-2026-8899');
  const [password, setPassword] = React.useState('123456');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const performLogin = (userData: any, token: string) => {
    login(userData, token, 'STUDENT', 'sch-01');
    toast.success('Đăng nhập thành công!', {
      description: `Chào mừng ${userData.fullname} đã đăng nhập hệ thống!`,
    });
    router.push(returnUrl);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      performLogin(
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
        'mock-student-token'
      );
    }, 300);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      performLogin(
        {
          id: 'usr-student-google',
          fullname: 'Lê Bảo Nam (Google Student)',
          email: 'nam.le.student@gmail.com',
          role: 'USER',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_memberships: [
            {
              id: 'mem-01',
              user_id: 'usr-student-google',
              school_id: 'sch-01',
              school_name: 'THPT Chuyên Công Nghệ Schoolify',
              role: 'STUDENT',
              joined_at: new Date().toISOString(),
            },
          ],
        },
        'mock-google-student-token'
      );
    }, 350);
  };

  return (
    <div className="max-w-md w-full my-auto">
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl space-y-5">
        {/* Banner thông báo nếu được chuyển hướng từ kỳ thi nâng cao / HSG */}
        {isRedirectedFromExam && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Yêu cầu đăng nhập để vào phòng thi!</p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                Kỳ thi Nâng cao & HSG yêu cầu tài khoản để ghi nhận kết quả và mở khóa đầy đủ tính năng.
              </p>
            </div>
          </div>
        )}

        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <Badge className="mb-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
              CỔNG DÀNH CHO NGƯỜI LUYỆN THI
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Nhập Người Luyện Thi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Luyện đề ma trận phân tầng Bloom, thi thử ĐGNL & THPT Quốc gia
            </p>
          </div>
        </div>

        {/* Quick 1-Click Demo Login Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-[#00B8DD]/10 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>⚡ Trải nghiệm nhanh 1-Click</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Học sinh: Nguyễn Hoàng Minh (HS-2026)
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => handleLogin()}
            isLoading={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
            leftIcon={<Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />}
          >
            Vào Luôn
          </Button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email / Số Điện Thoại / Mã Học Sinh
            </label>
            <Input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="VD: hocsinh@gmail.com hoặc HS-2026"
              leftIcon={<User className="w-4 h-4 text-emerald-500" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật Khẩu
              </label>
              <a href="#" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-emerald-500" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="rounded accent-emerald-500" />
              <span>Ghi nhớ trên thiết bị này</span>
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full justify-center h-11 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Đăng Nhập & Vào Luyện Thi Ngay
          </Button>
        </form>

        {/* Alternate Logins (Google) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <GoogleLoginButton
            role="STUDENT"
            returnUrl={returnUrl}
            label="Đăng nhập bằng tài khoản Google"
          />
        </div>

        {/* Switch Role Footer */}
        <div className="text-center text-xs text-slate-500 pt-1">
          <p>
            Bạn thuộc phân hệ khác?{' '}
            <Link
              href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
              className="text-[#00B8DD] font-bold hover:underline"
            >
              Đổi vai trò đăng nhập
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-md w-full my-auto p-8 text-center text-slate-400 text-xs">
          Đang tải cổng đăng nhập học sinh...
        </div>
      }
    >
      <StudentLoginForm />
    </React.Suspense>
  );
}
