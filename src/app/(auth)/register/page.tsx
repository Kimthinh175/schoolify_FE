'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<'STUDENT' | 'TEACHER'>('STUDENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          profile_type: role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.user) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || 'Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin.';
        setErrorMsg(msg);
        toast.error('Đăng ký không thành công', { description: msg });
        return;
      }

      login(data.user, data.accessToken || '', role);
      toast.success('Đăng ký tài khoản thành công!', {
        description: `Chào mừng ${data.user.fullname} đến với Schoolify!`,
      });

      if (role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/luyen-thi');
      }
    } catch (err: any) {
      const msg = err?.message || 'Không thể kết nối đến máy chủ xác thực.';
      setErrorMsg(msg);
      toast.error('Lỗi kết nối', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full my-auto space-y-6">
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30 text-[#007D99] dark:text-[#00B8DD] items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6 text-[#00B8DD]" />
          </div>
          <div>
            <Badge className="mb-2 bg-[#E6F8FC] text-[#007D99] dark:bg-[#00B8DD]/20 dark:text-[#00B8DD] border border-[#00B8DD]/30 text-[10px] font-bold">
              TẠO TÀI KHOẢN MỚI
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Ký Schoolify
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Nền tảng luyện thi ma trận thông minh & khóa học số
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector buttons (Chỉ còn Người Luyện Thi & Người Bán Khóa Học) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Bạn đăng ký với vai trò nào?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'STUDENT', label: '🎒 Người Luyện Thi' },
                { id: 'TEACHER', label: '👨‍🏫 Người Bán Khóa Học' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as 'STUDENT' | 'TEACHER')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    role === item.id
                      ? 'border-[#00B8DD] bg-[#E6F8FC] text-[#007D99] dark:bg-[#00B8DD]/20 dark:text-[#00B8DD] font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Họ và tên *
            </label>
            <Input
              placeholder="VD: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4 text-[#00B8DD]" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Địa chỉ Email *
            </label>
            <Input
              type="email"
              placeholder="an.nguyen@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4 text-[#00B8DD]" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Số điện thoại *
            </label>
            <Input
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu (tối thiểu 6 ký tự) *
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              leftIcon={<Lock className="w-4 h-4 text-[#00B8DD]" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full justify-center h-11 bg-[#00B8DD] hover:bg-[#009bbd] active:bg-[#007D99] text-white font-black text-sm shadow-md shadow-[#00B8DD]/25 transition-all mt-2 cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Hoàn Tất Đăng Ký
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <GoogleLoginButton
            role={role}
            label="Đăng ký nhanh bằng tài khoản Google"
          />
          <div className="text-center text-xs text-slate-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-[#00B8DD] font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
