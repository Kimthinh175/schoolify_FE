'use client';

import * as React from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Dynamic Role-Based Sidebar */}
      <AppSidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
