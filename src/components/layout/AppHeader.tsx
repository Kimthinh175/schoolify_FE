'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Baby,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import { useParentStore } from '@/store/parent.store';

export function AppHeader({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  const router = useRouter();
  const { user, currentRole, logout } = useAuthStore();
  const { children, activeChildId, setActiveChild } = useParentStore();

  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
      {/* Left: Mobile hamburger & Child Selector (if Parent) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* PARENT ROLE: Quick Child Switcher */}
        {currentRole === 'PARENT' && (
          <DropdownMenu
            align="left"
            trigger={
              <div className="flex items-center gap-2 rounded-xl bg-[#E6F8FC] dark:bg-[#00B8DD]/15 border border-[#00B8DD]/30 px-3 py-1.5 text-xs font-semibold text-[#007D99] dark:text-[#00B8DD] hover:bg-[#E6F8FC]/80 transition-colors">
                <Baby className="w-4 h-4 text-[#00B8DD] shrink-0" />
                <span className="truncate">Con: {activeChild?.name}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            }
          >
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Chọn Hồ Sơ Con Để Theo Dõi
            </div>
            {children.map((child) => (
              <DropdownMenuItem
                key={child.id}
                onClick={() => setActiveChild(child.id)}
                icon={<Avatar src={child.avatar} alt={child.name} size="sm" />}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">{child.name}</span>
                  <span className="text-[10px] text-slate-500">{child.grade} • {child.className}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        )}
      </div>

      {/* Right Controls: Notifications + Profile */}
      <div className="flex items-center gap-3">

        {/* Notifications Icon */}
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
          </span>
        </button>

        {/* User Profile Dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <div className="flex items-center gap-2">
              <Avatar src={user?.avatar_url} alt={user?.fullname} size="sm" />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.fullname}
                </span>
                <span className="text-[10px] text-slate-500">{user?.email}</span>
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
            onClick={() => router.push('/profile')}
          >
            Chỉnh sửa hồ sơ
          </DropdownMenuItem>
          <DropdownMenuItem icon={<LogOut className="w-4 h-4 text-rose-500" />} destructive onClick={logout}>
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
