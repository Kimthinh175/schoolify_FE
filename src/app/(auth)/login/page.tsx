'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Baby,
  School,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LOGIN_PORTALS = [
  {
    id: 'teacher',
    icon: BookOpen,
    title: 'Giáo Viên & Creator',
    desc: 'Soạn giáo án, tạo khóa học số, chấm bài tự luận và rút doanh thu.',
    href: '/login/teacher',
    badge: 'Dạy học',
    theme: {
      border: 'border-amber-500/30 hover:border-amber-500',
      bg: 'bg-amber-500/5 hover:bg-amber-500/10',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    },
  },
  {
    id: 'student',
    icon: GraduationCap,
    title: 'Học Sinh (Lớp 1 – 12)',
    desc: 'Vào phòng học Focus Mode, làm bài kiểm tra và tích điểm đổi quà.',
    href: '/login/student',
    badge: 'Học tập',
    theme: {
      border: 'border-emerald-500/30 hover:border-emerald-500',
      bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    },
  },
  {
    id: 'parent',
    icon: Baby,
    title: 'Phụ Huynh Học Sinh',
    desc: 'Sổ liên lạc điện tử, theo dõi tiến độ & thanh toán học phí VietQR.',
    href: '/login/parent',
    badge: 'Sổ liên lạc',
    theme: {
      border: 'border-rose-500/30 hover:border-rose-500',
      bg: 'bg-rose-500/5 hover:bg-rose-500/10',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      hoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    },
  },
  {
    id: 'school',
    icon: School,
    title: 'Ban Giám Hiệu & Nhà Trường',
    desc: 'Hiệu trưởng, tổ trưởng bộ môn, giáo vụ và quản trị cơ sở đào tạo.',
    href: '/login/school',
    badge: 'Quản trị',
    theme: {
      border: 'border-[#00B8DD]/30 hover:border-[#00B8DD]',
      bg: 'bg-[#00B8DD]/5 hover:bg-[#00B8DD]/10',
      iconBg: 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30',
      badgeClass: 'bg-[#E6F8FC] text-[#007D99] dark:bg-[#00B8DD]/20 dark:text-[#00B8DD] border border-[#00B8DD]/30',
      hoverText: 'group-hover:text-[#00B8DD]',
    },
  },
];

export default function CentralLoginPage() {
  return (
    <div className="max-w-2xl w-full my-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F8FC] dark:bg-[#00B8DD]/15 border border-[#00B8DD]/30 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Cổng Đăng Nhập Phân Hệ Chuyên Biệt</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Chọn Vai Trò Để Đăng Nhập
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Mỗi vai trò sở hữu giao diện làm việc và công cụ tác nghiệp riêng biệt.
        </p>
      </div>

      {/* 4 Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LOGIN_PORTALS.map((portal) => {
          const Icon = portal.icon;
          return (
            <Link
              key={portal.id}
              href={portal.href}
              className={cn(
                'group p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl bg-white dark:bg-slate-900 cursor-pointer shadow-xs',
                portal.theme.border,
                portal.theme.bg
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs', portal.theme.iconBg)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', portal.theme.badgeClass)}>
                    {portal.badge}
                  </span>
                </div>

                <h3 className={cn('text-sm font-black text-slate-900 dark:text-white transition-colors mb-1', portal.theme.hoverText)}>
                  {portal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {portal.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <span>Vào cổng đăng nhập</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Chưa có tài khoản trường?{' '}
          <Link href="/register" className="text-[#00B8DD] font-bold hover:underline">
            Đăng ký dùng thử 14 ngày
          </Link>
        </p>
      </div>
    </div>
  );
}
