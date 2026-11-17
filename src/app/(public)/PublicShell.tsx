'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const hideFooter = pathname?.startsWith('/luyen-thi/chuyen-de');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthSubtab =
        window.name?.includes('SchoolifyAuth') ||
        sessionStorage.getItem('is_schoolify_popup') === '1' ||
        window.location.search.includes('popup=1');

      if (isAuthSubtab) {
        try {
          window.close();
        } catch (e) {}
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {}
        }, 100);
      }
    }
  }, []);

  if (isHome) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* pt-20 để bù cho fixed global header cao 80px cho các trang con */}
      <main className="flex-1 pt-20">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
