'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Server,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Fingerprint,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, currentRole, isAuthenticated, login, logout } = useAuthStore();

  const [usernameOrEmail, setUsernameOrEmail] = React.useState('admin@schoolify.top');
  const [password, setPassword] = React.useState('123456');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  // Auto redirect countdown if already logged in as SUPER_ADMIN
  const isAlreadyAdmin = isAuthenticated && currentRole === 'SUPER_ADMIN';
  const [countdown, setCountdown] = React.useState(3);

  React.useEffect(() => {
    if (isAlreadyAdmin) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/admin/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAlreadyAdmin, router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email Quản trị và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const emailToLogin = usernameOrEmail.includes('@')
        ? usernameOrEmail.trim()
        : `${usernameOrEmail.trim()}@schoolify.top`;

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToLogin,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.user) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || 'Email hoặc mật khẩu quản trị không chính xác.';
        setErrorMessage(msg);
        return;
      }

      if (data.user.role !== 'SUPER_ADMIN') {
        setErrorMessage('Tài khoản này không có quyền Quản trị viên cấp cao (SUPER_ADMIN).');
        return;
      }

      login(data.user, data.accessToken || '', 'SUPER_ADMIN');
      toast.success('Xác thực Quản trị viên thành công!', {
        description: `Chào mừng ${data.user.fullname} trở lại hệ thống.`,
      });
      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể kết nối đến cổng xác thực Backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Dynamic Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[450px] bg-[#00B8DD]/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Security & System Status Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-[#00B8DD]" />
          <span className="font-mono font-bold tracking-wider text-slate-300">
            SCHOOLIFY ROOT ACCESS GATEWAY
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
            SEC-LEVEL 4
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] text-slate-400">
          <div className="hidden md:flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>PostgreSQL Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold">256-bit TLS Shield: ON</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Portal */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] space-y-5">
          {/* Logo & Portal Header */}
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-block group focus:outline-none transition-transform hover:scale-105"
              title="Về trang chủ Schoolify"
            >
              <div className="relative inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shadow-[#00B8DD]/10 group-hover:border-[#00B8DD]/50 transition-colors">
                <Image
                  src="/schoolify-logo.png"
                  alt="Schoolify Root Admin"
                  width={150}
                  height={42}
                  className="h-9 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(0,184,221,0.3)]"
                  priority
                />
              </div>
            </Link>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B8DD]/10 border border-[#00B8DD]/30 text-[11px] font-mono font-bold text-[#00B8DD]">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>SUPER ADMIN CONTROL PORTAL</span>
              </div>
            </div>
          </div>

          {isAlreadyAdmin ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 space-y-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Phiên Quản Trị Đang Hoạt Động</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Đăng nhập với tư cách: <span className="font-bold text-emerald-400">{user?.fullname}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">
                  Tự động chuyển tiếp sau {countdown} giây...
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => router.push('/admin/dashboard')}
                  className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Truy Cập Dashboard Ngay
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setCountdown(0);
                  }}
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Đăng Xuất Khỏi Phiên Này
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 shadow-[0_0_60px_-15px_rgba(0,184,221,0.2)] p-6 sm:p-8 space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Quản trị viên:
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="admin@schoolify.top"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#00B8DD] focus:ring-2 focus:ring-[#00B8DD]/20 transition-all font-mono placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Mật khẩu Quản trị cấp cao:
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#00B8DD] focus:ring-2 focus:ring-[#00B8DD]/20 transition-all font-mono placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#00B8DD] cursor-pointer"
                    />
                    <span>Ghi nhớ phiên (7 ngày)</span>
                  </label>

                  <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> JWT HTTP-Only
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#00B8DD] to-[#0089a8] hover:from-[#00cbf4] hover:to-[#009dc0] text-white font-black tracking-wide py-3 rounded-xl shadow-lg shadow-[#00B8DD]/25 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Đang Xác Thực Quản Trị...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập Quản Trị Viên</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          <div className="text-center space-y-2 text-xs text-slate-500">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quên mật khẩu quản trị?</span>
              </button>
              <span>•</span>
              <Link
                href="/"
                className="hover:text-slate-300 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Quay lại Schoolify</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-4 py-3 text-center text-[11px] font-mono text-slate-500 border-t border-slate-800/60 bg-slate-950/40">
        <span>Schoolify Core Engine v2.4.2 • Zero-Trust Security Protocol • All sessions logged &amp; encrypted</span>
      </footer>

      <Dialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Khôi Phục Quyền Truy Cập Super Admin"
        description="Quy trình bảo mật dành riêng cho Tài khoản Quản trị Nền tảng Schoolify."
        maxWidth="md"
      >
        <div className="space-y-4 py-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Chính sách bảo mật cấp cao:
            </div>
            <p>
              Tài khoản Super Admin nắm toàn quyền quản lý dữ liệu toàn trường, ngân hàng đề và hệ thống tài chính SaaS, do đó tính năng reset mật khẩu tự động qua email công khai bị vô hiệu hóa để chống tấn công brute-force.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setIsHelpOpen(false)} className="rounded-xl cursor-pointer">
              Đã hiểu
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
