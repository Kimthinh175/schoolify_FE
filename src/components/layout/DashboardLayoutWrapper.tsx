'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Bỏ sidebar và header dashboard cho cổng login admin hoặc các trang thi / phòng học tập trung
  const isFocusOrPractice =
    pathname === '/admin' ||
    pathname === '/admin/login' ||
    pathname?.startsWith('/student/practice/exam-room') ||
    pathname?.startsWith('/student/practice') ||
    pathname?.startsWith('/student/learn') ||
    pathname?.startsWith('/student/exam/'); // chỉ phòng thi /student/exam/:id, KHÔNG gồm /student/exams

  if (isFocusOrPractice) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Dynamic Role-Based Sidebar */}
      <AppSidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AppHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
