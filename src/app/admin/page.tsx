'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function AdminEntryPage() {
  const router = useRouter();
  const { user, currentRole, isAuthenticated, login } = useAuthStore();
  const [authHydrated, setAuthHydrated] = React.useState(false);

  const [account, setAccount] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (useAuthStore.persist?.hasHydrated?.()) {
      setAuthHydrated(true);
    } else {
      const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
        setAuthHydrated(true);
      });
      const timer = setTimeout(() => setAuthHydrated(true), 150);
      return () => {
        unsub?.();
        clearTimeout(timer);
      };
    }
  }, []);

  const isAdminRole = React.useMemo(() => {
    if (!user) return false;
    const uRole = String(user.role || '').toUpperCase();
    const cRole = String(currentRole || '').toUpperCase();
    return uRole === 'SUPER_ADMIN' || uRole === 'ADMIN' || cRole === 'SUPER_ADMIN' || cRole === 'ADMIN';
  }, [user, currentRole]);

  React.useEffect(() => {
    if (!authHydrated) return;
    if (isAuthenticated && user) {
      if (isAdminRole) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/403');
      }
    }
  }, [authHydrated, isAuthenticated, user, isAdminRole, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!account.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const emailToLogin = account.includes('@')
        ? account.trim()
        : `${account.trim()}@schoolify.top`;

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
          : data?.message || 'Tài khoản hoặc mật khẩu không chính xác.';
        setErrorMessage(msg);
        return;
      }

      const loggedRole = String(data.user.role || '').toUpperCase();
      if (loggedRole !== 'SUPER_ADMIN' && loggedRole !== 'ADMIN') {
        login(data.user, data.accessToken || '');
        router.replace('/403');
        return;
      }

      login(data.user, data.accessToken || '', 'SUPER_ADMIN');
      toast.success('Đăng nhập Quản trị viên thành công!');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể kết nối máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  // Khi đang kiểm tra trạng thái đăng nhập hoặc đang redirect (đã login)
  if (!authHydrated || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-[#00B8DD]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Đăng Nhập Quản Trị
          </h1>
          <p className="text-xs text-slate-400">
            Nhập tài khoản và mật khẩu để truy cập Admin
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Tài khoản
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Nhập tài khoản hoặc email..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-[#00B8DD] focus:ring-2 focus:ring-[#00B8DD]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Mật khẩu
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-[#00B8DD] focus:ring-2 focus:ring-[#00B8DD]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00B8DD] hover:bg-[#009ec0] text-white font-bold py-2.5 rounded-xl h-11 text-sm cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng Nhập'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
