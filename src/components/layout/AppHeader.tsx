'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  User,
  LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/store/auth.store';

export function AppHeader({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchMe, currentRole } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchMe().catch(() => {});
    }
  }, [isAuthenticated, fetchMe]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 min-h-[64px] shrink-0 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Controls: Theme Toggle + Notifications + Profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
          </span>
        </button>

        <DropdownMenu
          align="right"
          trigger={
            <div className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors">
              <Avatar src={user?.avatar_url} alt={user?.fullname} size="sm" />
              <div className="hidden lg:flex flex-col text-left leading-snug">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {user?.fullname || 'Tài khoản'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email}
                </span>
              </div>
            </div>
          }
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullname}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <DropdownMenuItem
            icon={<User className="w-4 h-4 text-[#00B8DD]" />}
            onClick={() => {
              if (currentRole === 'STUDENT') {
                router.push('/student');
              } else {
                router.push('/profile');
              }
            }}
          >
            Tài khoản cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<LogOut className="w-4 h-4 text-rose-500" />}
            destructive
            onClick={handleLogout}
          >
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
