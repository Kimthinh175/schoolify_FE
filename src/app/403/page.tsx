'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';

export default function Forbidden403Page() {
  const router = useRouter();
  const { user, currentRole, isAuthenticated, logout } = useAuthStore();

  const handleSwitchAccount = () => {
    logout();
    router.replace('/admin');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-block px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-extrabold tracking-wider">
            ERROR 403 • FORBIDDEN
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Không Có Quyền Truy Cập
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Khu vực này chỉ dành riêng cho Quản trị viên hệ thống (<b>ADMIN</b>). Tài khoản hiện tại của bạn không có quyền truy cập vào trang này.
          </p>
        </div>

        {isAuthenticated && user && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1 text-left">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-slate-500">Tài khoản đang đăng nhập:</span>
              <span className="font-bold text-white">{user.fullname || user.email}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-slate-500">Vai trò hiện tại (Role):</span>
              <span className="font-mono font-bold text-amber-400">
                {String(user.role || currentRole || 'STUDENT')}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <Link href="/">
            <Button className="w-full bg-[#00B8DD] hover:bg-[#009ec0] text-white font-bold rounded-xl h-10 gap-2 cursor-pointer">
              <Home className="w-4 h-4" />
              Về Trang Chủ
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleSwitchAccount}
            className="w-full border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl h-10 gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Đăng xuất &amp; Đăng nhập tài khoản Admin
          </Button>

          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center justify-center gap-1 pt-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
}
