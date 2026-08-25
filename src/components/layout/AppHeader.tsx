'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  UserCheck,
  Building2,
  Users2,
  LogOut,
  Sparkles,
  Baby,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { useParentStore } from '@/store/parent.store';
import { SchoolRole, SystemRole } from '@/types';
import { MOCK_SCHOOLS } from '@/services/mock/data';

const AVAILABLE_ROLES: { role: SchoolRole | SystemRole; label: string; path: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin (Nền tảng)', path: '/admin/dashboard' },
  { role: 'PRINCIPAL', label: 'Hiệu Trưởng (School Admin)', path: '/school/dashboard' },
  { role: 'HEAD_OF_DEPARTMENT', label: 'Trưởng Bộ Môn (HOD)', path: '/school/curriculum-approval' },
  { role: 'STAFF', label: 'Giáo Vụ / Thu Ngân', path: '/school/admissions' },
  { role: 'TEACHER', label: 'Giáo Viên / Creator', path: '/teacher/dashboard' },
  { role: 'STUDENT', label: 'Học Sinh', path: '/student/dashboard' },
  { role: 'PARENT', label: 'Phụ Huynh Học Sinh', path: '/parent/dashboard' },
];

export function AppHeader({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  const router = useRouter();
  const { user, currentRole, setRole, currentSchool, setSchool, logout } = useAuthStore();
  const { children, activeChildId, setActiveChild } = useParentStore();

  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  const handleRoleSwitch = (item: (typeof AVAILABLE_ROLES)[0]) => {
    setRole(item.role);
    router.push(item.path);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
      {/* Left: Mobile hamburger & School Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Tenant/School Selector Dropdown */}
        <DropdownMenu
          align="left"
          trigger={
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 transition-colors">
              <Building2 className="w-4 h-4 text-[#00B8DD] shrink-0" />
              <span className="max-w-[150px] sm:max-w-[220px] truncate">
                {currentSchool?.name || 'Chọn Cơ Sở Trường'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          }
        >
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chuyển Đổi Trường Học (Tenants)
          </div>
          {MOCK_SCHOOLS.map((school) => (
            <DropdownMenuItem
              key={school.id}
              onClick={() => setSchool(school.id, school.name)}
              icon={<Building2 className="w-4 h-4 text-[#00B8DD]" />}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-xs">{school.name}</span>
                <span className="text-[10px] text-slate-400">{school.code}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenu>

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

      {/* Right Controls: Role Simulator + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Dynamic Role Switcher Simulator */}
        <DropdownMenu
          align="right"
          trigger={
            <div className="flex items-center gap-1.5 rounded-xl border border-[#00B8DD]/30 bg-[#E6F8FC] px-2.5 py-1.5 text-xs font-bold text-[#007D99] hover:bg-[#E6F8FC]/80 dark:border-[#00B8DD]/30 dark:bg-[#00B8DD]/20 dark:text-[#00B8DD] transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <span className="hidden sm:inline">Đóng vai:</span>
              <span>{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-[#00B8DD]" />
            </div>
          }
        >
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chuyển Đổi Phân Hệ (Role Simulator)
          </div>
          {AVAILABLE_ROLES.map((item) => (
            <DropdownMenuItem
              key={item.role}
              onClick={() => handleRoleSwitch(item)}
              icon={<UserCheck className="w-4 h-4 text-[#00B8DD]" />}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold">{item.label}</span>
                {currentRole === item.role && (
                  <Badge variant="primary" className="text-[10px] py-0 px-1.5 bg-[#00B8DD] text-white">
                    Đang xem
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenu>

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
          <DropdownMenuItem icon={<LogOut className="w-4 h-4 text-rose-500" />} destructive onClick={logout}>
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
