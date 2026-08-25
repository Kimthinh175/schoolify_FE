'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'PARENT'>('STUDENT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      {
        id: `usr-${Date.now()}`,
        fullname: name || 'Người Dùng Mới',
        email: email || 'user@schoolify.edu.vn',
        phone: phone || '0901234567',
        role: 'USER',
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      'mock-jwt-token',
      role,
      'sch-01'
    );

    switch (role) {
      case 'PRINCIPAL':
        router.push('/school/dashboard');
        break;
      case 'TEACHER':
        router.push('/teacher/dashboard');
        break;
      case 'PARENT':
        router.push('/parent/dashboard');
        break;
      case 'STUDENT':
      default:
        router.push('/student/dashboard');
        break;
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
              TRẢI NGHIỆM MIỄN PHÍ 14 NGÀY
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Đăng Ký Schoolify
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Khởi tạo tài khoản trường học & học tập số thông minh
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Bạn là đối tượng nào?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'STUDENT', label: '🎒 Học Sinh' },
                { id: 'TEACHER', label: '👨‍🏫 Giáo Viên' },
                { id: 'PARENT', label: '👨‍👩‍👧 Phụ Huynh' },
                { id: 'PRINCIPAL', label: '🏫 Nhà Trường' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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
              Mật khẩu *
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4 text-[#00B8DD]" />}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <Button
            type="submit"
            className="w-full justify-center h-11 bg-[#00B8DD] hover:bg-[#009bbd] active:bg-[#007D99] text-white font-black text-sm shadow-md shadow-[#00B8DD]/25 transition-all mt-2 cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Hoàn Tất Đăng Ký
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#00B8DD] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
