'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Package,
  CreditCard,
  Users,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  ShoppingBag,
  FileSpreadsheet,
  CheckSquare,
  DollarSign,
  Gift,
  Briefcase,
  HelpCircle,
  FileCheck2,
  BookCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { SchoolRole, SystemRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  roles: (SchoolRole | SystemRole)[];
}

const NAV_ITEMS: NavItem[] = [
  // SUPER ADMIN
  {
    label: 'Tổng quan SaaS',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Quản lý Trường học',
    href: '/admin/schools',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Gói Cước SaaS',
    href: '/admin/packages',
    icon: <Package className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Tài Chính & Đối Soát',
    href: '/admin/orders',
    icon: <CreditCard className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Quản lý Users Toàn Cầu',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },

  // SCHOOL ADMIN (Principal, HOD, Staff)
  {
    label: 'Tổng quan Trường',
    href: '/school/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_OF_DEPARTMENT', 'STAFF'],
  },
  {
    label: 'Gói Cước & Quotas',
    href: '/school/subscription',
    icon: <Package className="w-5 h-5" />,
    badge: '85%',
    roles: ['PRINCIPAL', 'VICE_PRINCIPAL'],
  },
  {
    label: 'Tổ Bộ Môn (Departments)',
    href: '/school/departments',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_OF_DEPARTMENT'],
  },
  {
    label: 'Đội Ngũ Giáo Viên',
    href: '/school/teachers',
    icon: <Users className="w-5 h-5" />,
    roles: ['PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_OF_DEPARTMENT'],
  },
  {
    label: 'Thẩm Định Giáo Án',
    href: '/school/curriculum-approval',
    icon: <BookCheck className="w-5 h-5" />,
    badge: '3 mới',
    roles: ['HEAD_OF_DEPARTMENT'],
  },
  {
    label: 'Tuyển Sinh & Import Excel',
    href: '/school/admissions',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    roles: ['STAFF', 'PRINCIPAL'],
  },
  {
    label: 'Xếp Lớp & Học Vụ',
    href: '/school/classes',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['STAFF', 'PRINCIPAL'],
  },
  {
    label: 'Thu Ngân & In Biên Lai',
    href: '/school/cashier',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['STAFF', 'PRINCIPAL'],
  },

  // TEACHER & CREATOR
  {
    label: 'Bàn Làm Việc Giáo Viên',
    href: '/teacher/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['TEACHER'],
  },
  {
    label: 'Soạn Khóa Học (Builder)',
    href: '/teacher/courses',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['TEACHER'],
  },
  {
    label: 'Lớp Học & Lịch Dạy',
    href: '/teacher/classes',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['TEACHER'],
  },
  {
    label: 'Chấm Bài & Lời Phê',
    href: '/teacher/grading',
    icon: <FileCheck2 className="w-5 h-5" />,
    badge: '5 bài',
    roles: ['TEACHER'],
  },
  {
    label: 'Doanh Thu Khóa Học',
    href: '/teacher/revenue',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['TEACHER'],
  },
  {
    label: 'Kho Quà Tặng Đổi Thưởng',
    href: '/teacher/rewards',
    icon: <Gift className="w-5 h-5" />,
    roles: ['TEACHER'],
  },

  // STUDENT
  {
    label: 'Góc Học Tập',
    href: '/student/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Khóa Học Của Tôi',
    href: '/student/my-courses',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Thời Khóa Biểu Tuần',
    href: '/student/timetable',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Bài Thi & Điểm Số',
    href: '/student/exams',
    icon: <Award className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Cửa Hàng Đổi Quà',
    href: '/student/rewards',
    icon: <ShoppingBag className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Túi Đồ Của Tôi',
    href: '/student/inventory',
    icon: <Gift className="w-5 h-5" />,
    roles: ['STUDENT'],
  },

  // PARENT
  {
    label: 'Tổng Quan Con Cái',
    href: '/parent/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['PARENT'],
  },
  {
    label: 'Sổ Liên Lạc & Lời Phê',
    href: '/parent/academic',
    icon: <BookCheck className="w-5 h-5" />,
    badge: 'Điểm mới',
    roles: ['PARENT'],
  },
  {
    label: 'Thời Khóa Biểu Của Con',
    href: '/parent/timetable',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['PARENT'],
  },
  {
    label: 'Đóng Học Phí (VietQR)',
    href: '/parent/tuition',
    icon: <CreditCard className="w-5 h-5" />,
    badge: '1 phiếu',
    roles: ['PARENT'],
  },
];

export function AppSidebar({ isMobileOpen, onMobileClose }: { isMobileOpen?: boolean; onMobileClose?: () => void }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { currentRole, currentSchool } = useAuthStore();

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  const sidebarContent = (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          {collapsed ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-1">
              <img src="/logo-icon.png" alt="Schoolify" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="flex items-center">
              <img
                src="/schoolify-logo.png"
                alt="Schoolify"
                className="h-8 w-auto object-contain dark:hidden"
              />
              <img
                src="/am-ban.png"
                alt="Schoolify"
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Phân hệ đang xem:</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80">
            {currentRole}
          </span>
        </div>
      )}

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <span className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200')}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-bold shrink-0',
                        isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer info / Public link */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          {!collapsed && <span>Về Trang Chủ Public</span>}
        </Link>
      </div>
    </aside>
  );

  // Responsive Drawer for Mobile
  return (
    <>
      <div className="hidden md:block">{sidebarContent}</div>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onMobileClose} />
          <div className="relative z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-950 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
