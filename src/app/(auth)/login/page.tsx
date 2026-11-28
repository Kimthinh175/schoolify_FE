'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { AuthCardSkeleton } from '@/components/skeletons/page-skeletons';

const LOGIN_PORTALS = [
  {
    id: 'student',
    icon: GraduationCap,
    title: 'Người Luyện Thi',
    desc: 'Luyện đề thông minh theo ma trận Bloom, thi thử K-12, tốt nghiệp THPT, ĐGNL & HSG.',
    href: '/login/student',
    badge: 'Học tập & Luyện thi',
  },
];

import { useSearchParams } from 'next/navigation';

function CentralLoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  return (
    <div className="max-w-md w-full my-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          <span>Cổng Đăng Nhập Luyện Thi K-12</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Đăng Nhập Schoolify
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Luyện đề thông minh theo ma trận chuẩn GDPT 2018-2025 cùng Gia sư AI.
        </p>
      </div>

      {/* Portal Card */}
      <div className="grid grid-cols-1 gap-4">
        {LOGIN_PORTALS.map((portal) => {
          const Icon = portal.icon;
          const finalHref = returnUrl
            ? `${portal.href}?returnUrl=${encodeURIComponent(returnUrl)}`
            : portal.href;

          return (
            <Link
              key={portal.id}
              href={finalHref}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between hover:border-[#00B8DD]/50 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900 cursor-pointer shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:text-[#00B8DD] group-hover:border-[#00B8DD]/30 transition-colors shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                    {portal.badge}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors mb-1.5">
                  {portal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {portal.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#00B8DD] transition-colors">
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
          Chưa có tài khoản luyện thi?{' '}
          <Link href="/register" className="text-[#00B8DD] font-bold hover:underline">
            Đăng ký miễn phí ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CentralLoginPage() {
  return (
    <React.Suspense fallback={<AuthCardSkeleton />}>
      <CentralLoginForm />
    </React.Suspense>
  );
}
