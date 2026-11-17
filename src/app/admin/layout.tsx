'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper';
import { useAuthStore } from '@/store/auth.store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, currentRole, isAuthenticated, setRole } = useAuthStore();
  const [authHydrated, setAuthHydrated] = React.useState(false);

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

  const isRootOrLogin = pathname === '/admin' || pathname === '/admin/login';

  const isAdminRole = React.useMemo(() => {
    if (!user) return false;
    const uRole = String(user.role || '').toUpperCase();
    const cRole = String(currentRole || '').toUpperCase();
    return uRole === 'SUPER_ADMIN' || uRole === 'ADMIN' || cRole === 'SUPER_ADMIN' || cRole === 'ADMIN';
  }, [user, currentRole]);

  React.useEffect(() => {
    if (!authHydrated) return;

    // Nếu chưa đăng nhập mà vào trang con /admin/* -> đưa về /admin để hiện form login (acc + pass)
    if (!isAuthenticated || !user) {
      if (!isRootOrLogin) {
        router.replace('/admin');
      }
      return;
    }

    // Nếu đã đăng nhập nhưng role != admin -> đá thẳng ra trang 403
    if (!isAdminRole) {
      router.replace('/403');
      return;
    }

    // Đồng bộ currentRole = SUPER_ADMIN cho menu Sidebar Admin
    if (currentRole !== 'SUPER_ADMIN') {
      setRole('SUPER_ADMIN');
    }
  }, [authHydrated, isAuthenticated, user, isAdminRole, isRootOrLogin, currentRole, setRole, router]);

  if (isRootOrLogin) {
    return <>{children}</>;
  }

  if (!authHydrated || !isAuthenticated || !user || !isAdminRole) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-[#00B8DD]" />
      </div>
    );
  }

  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
