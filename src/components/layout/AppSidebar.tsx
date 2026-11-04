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
  FileQuestion,
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
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
    label: 'Tổng quan',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Ngân Hàng Câu Hỏi',
    href: '/admin/questions',
    icon: <Database className="w-5 h-5" />,
    badge: 'Mới',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Quản Lý Ma Trận Đề Thi',
    href: '/admin/exams',
    icon: <FileCheck2 className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Gói Đăng Ký',
    href: '/admin/packages',
    icon: <Package className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Hóa Đơn',
    href: '/admin/orders',
    icon: <CreditCard className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Người Dùng',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['SUPER_ADMIN'],
  },

  // TEACHER & CREATOR
  {
    label: 'Bàn Làm Việc Giáo Viên',
    href: '/teacher/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['TEACHER'],
  },
  {
    label: 'Hồ Sơ & Tài Khoản',
    href: '/profile',
    icon: <User className="w-5 h-5" />,
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
    label: 'Ngân Hàng Đề (Studio)',
    href: '/teacher/questions',
    icon: <HelpCircle className="w-5 h-5" />,
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

  // STUDENT (Người Luyện Thi & Quản Lý Cá Nhân)
  {
    label: 'Cổng Luyện Thi K-12',
    href: '/student/practice',
    icon: <Sparkles className="w-5 h-5 text-[#00B8DD]" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Tài Khoản Cá Nhân',
    href: '/student',
    icon: <User className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Lịch Sử Luyện Đề & Điểm',
    href: '/student/exams',
    icon: <Award className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Bảng Xếp Hạng',
    href: '/leaderboard',
    icon: <Award className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Khóa Học Của Tôi',
    href: '/student/my-courses',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Cửa Hàng Đổi Quà',
    href: '/student/rewards',
    icon: <ShoppingBag className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Túi Đồ & Phần Thưởng',
    href: '/student/inventory',
    icon: <Gift className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
];

export function AppSidebar({
  isMobileOpen,
  onMobileClose,
  withNavbar = false,
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  withNavbar?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { currentRole, currentSchool } = useAuthStore();

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  const renderSidebar = (isMobile = false) => (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 transition-all duration-300 select-none',
        isMobile
          ? 'h-full w-full'
          : cn(
              'fixed bottom-0 left-0 z-30',
              withNavbar ? 'top-20 h-[calc(100vh-5rem)]' : 'top-0 h-screen',
              collapsed ? 'w-20' : 'w-64'
            )
      )}
    >
      {/* Brand Header: chỉ hiển thị khi không có Navbar hoặc khi mở mobile drawer */}
      {(!withNavbar || isMobile) && (
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {!isMobile && collapsed ? (
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
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
        {filteredNavItems.map((item) => {
          const matches = (href: string) => pathname === href || pathname.startsWith(href + '/');
          // Chỉ active mục khớp cụ thể nhất (tránh /student và /student/exams cùng sáng)
          const isActive =
            matches(item.href) &&
            !filteredNavItems.some((other) => other.href.length > item.href.length && matches(other.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={!isMobile && collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white',
                !isMobile && collapsed && 'justify-center px-2'
              )}
            >
              <span className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200')}>
                {item.icon}
              </span>
              {(isMobile || !collapsed) && (
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

      {/* Footer info / Public link & Collapse toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-1">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-1 min-w-0',
            !isMobile && collapsed && 'justify-center px-0'
          )}
        >
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          {(isMobile || !collapsed) && <span className="truncate">Trang Chủ Public</span>}
        </Link>
        {withNavbar && !isMobile && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </aside>
  );

  // Responsive Drawer for Mobile
  return (
    <>
      <div
        className={cn(
          'hidden md:block shrink-0 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {renderSidebar(false)}
      </div>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onMobileClose} />
          <div className="relative z-50 w-72 max-w-[85vw] h-full bg-white dark:bg-slate-950 shadow-2xl">
            {renderSidebar(true)}
          </div>
        </div>
      )}
    </>
  );
}
