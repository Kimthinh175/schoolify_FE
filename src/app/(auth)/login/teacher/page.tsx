'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { MOCK_TEACHER_PROFILE } from '@/services/mock/data';

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

export default function TeacherLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = React.useState('teacher.nguyen@schoolify.edu.vn');
  const [password, setPassword] = React.useState('123456');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(
        {
          id: 'usr-teacher-01',
          fullname: 'ThS. Nguyễn Văn Hùng',
          email: email || 'teacher@schoolify.edu.vn',
          role: 'USER',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          teacher_profile: MOCK_TEACHER_PROFILE,
          school_memberships: [
            {
              id: 'mem-01',
              user_id: 'usr-teacher-01',
              school_id: 'sch-01',
              school_name: 'THPT Chuyên Công Nghệ Schoolify',
              role: 'TEACHER',
              joined_at: new Date().toISOString(),
            },
          ],
        },
        'mock-teacher-token',
        'TEACHER',
        'sch-01'
      );
      router.push('/teacher/dashboard');
    }, 400);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      login(
        {
          id: 'usr-teacher-google',
          fullname: 'ThS. Trần Thị Mai (Google)',
          email: 'mai.tran@gmail.com',
          role: 'USER',
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_memberships: [
            {
              id: 'mem-01',
              user_id: 'usr-teacher-google',
              school_id: 'sch-01',
              school_name: 'THPT Chuyên Công Nghệ Schoolify',
              role: 'TEACHER',
              joined_at: new Date().toISOString(),
            },
          ],
        },
        'mock-google-token',
        'TEACHER',
        'sch-01'
      );
      router.push('/teacher/dashboard');
    }, 500);
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
              CỔNG GIẢNG DẠY & SÁNG TẠO
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Nhập Giáo Viên
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Quản lý lớp học, soạn khóa học số & chấm bài trực tuyến
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Giáo Viên / Số Điện Thoại
            </label>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@schoolify.edu.vn"
              leftIcon={<Mail className="w-4 h-4 text-amber-500" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật Khẩu
              </label>
              <a href="#" className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-amber-500" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="rounded accent-amber-500" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full justify-center h-11 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Vào Không Gian Giảng Dạy
          </Button>
        </form>

        {/* Alternate Logins (Google) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <GoogleIcon />
            <span>{isGoogleLoading ? 'Đang xác thực Google...' : 'Đăng nhập bằng tài khoản Google'}</span>
          </button>
        </div>

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
