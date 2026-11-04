'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Bỏ sidebar và header cho các phòng thi / phòng học tập trung
  const isFocusOrPractice =
    pathname?.startsWith('/student/practice/exam-room') ||
    pathname?.startsWith('/student/practice') ||
    pathname?.startsWith('/student/learn') ||
    pathname?.startsWith('/student/exam/');

  if (isFocusOrPractice) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ── 1. Header Giống Trang Chủ (Navbar) ── */}
      <Navbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

      {/* ── 2. Khu Vực Thân Trang Dưới Navbar (pt-20 cho navbar fixed 80px) ── */}
      <div className="flex-1 flex w-full pt-20">
        {/* Dynamic Student Sidebar (Sidebar Giữ Nguyên) */}
        <AppSidebar
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          withNavbar={true}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
