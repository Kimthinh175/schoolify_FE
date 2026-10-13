'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  BookOpen,
  Sparkles,
  ArrowRight,
  Shield,
  LogIn,
  Baby,
  UserCheck,
  School,
  Lock,
  Gem,
  LogOut,
  LayoutDashboard,
  User,
  Award,
  CreditCard,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

// 2 vai trò đăng nhập chính của nền tảng: Người Luyện Thi & Người Bán Khóa Học
const LOGIN_ROLES = [
  {
    id: 'student',
    icon: GraduationCap,
    label: 'Người Luyện Thi',
    badge: 'Học sinh & Thí sinh',
    desc: 'Luyện đề thông minh theo ma trận, thi thử K-12, tốt nghiệp THPT, ĐGNL & HSG',
    href: '/login/student',
    theme: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    badgeTheme: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'teacher',
    icon: BookOpen,
    label: 'Người Bán Khóa Học',
    badge: 'Giáo viên & Giảng viên',
    desc: 'Tạo khóa học số, xuất bản đề thi theo ma trận, kinh doanh tài liệu & quản lý học viên',
    href: '/login/teacher',
    theme: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400 border-amber-500/20 bg-amber-500/10',
    badgeTheme: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

export function Navbar() {
  const { user, isAuthenticated, login, logout, currentRole } = useAuthStore();
  const isTeacher = currentRole === 'TEACHER' || !!user?.teacher_profile;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [pointsMenuOpen, setPointsMenuOpen] = React.useState(false);
  const pointsMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [checkedInToday, setCheckedInToday] = React.useState(false);

  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  const handleUserMenuEnter = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    setUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 200);
  };

  const handlePointsMenuEnter = () => {
    if (pointsMenuTimeoutRef.current) clearTimeout(pointsMenuTimeoutRef.current);
    setPointsMenuOpen(true);
  };

  const handlePointsMenuLeave = () => {
    pointsMenuTimeoutRef.current = setTimeout(() => {
      setPointsMenuOpen(false);
    }, 200);
  };

  const [tokenBalance, setTokenBalance] = React.useState<number>(250);

  React.useEffect(() => {
    const updateBalance = () => {
      try {
        const stored = localStorage.getItem('schoolify_user_tokens');
        if (stored) {
          setTokenBalance(Number(stored));
        } else {
          localStorage.setItem('schoolify_user_tokens', '250');
        }
      } catch {}
    };

    updateBalance();
    window.addEventListener('tokens-updated', updateBalance);
    window.addEventListener('storage', updateBalance);
    return () => {
      window.removeEventListener('tokens-updated', updateBalance);
      window.removeEventListener('storage', updateBalance);
    };
  }, []);

  React.useEffect(() => {
    try {
      const lastCheckin = localStorage.getItem('schoolify_last_checkin');
      const today = new Date().toDateString();
      if (lastCheckin === today) {
        setCheckedInToday(true);
      }
    } catch {}
  }, []);

  const handleCheckin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (checkedInToday) return;
    try {
      const today = new Date().toDateString();
      localStorage.setItem('schoolify_last_checkin', today);
      setCheckedInToday(true);
      const newBalance = tokenBalance + 10;
      setTokenBalance(newBalance);
      localStorage.setItem('schoolify_user_tokens', String(newBalance));
      window.dispatchEvent(new Event('tokens-updated'));
    } catch {}
  };

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setLoginDrawerOpen(false);
      setMobileMenuOpen(false);
      setUserMenuOpen(false);
      setPointsMenuOpen(false);
    }
  }, [pathname]);

  // ESC key closes drawer & menus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLoginDrawerOpen(false);
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
        setPointsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Luyện Thi', href: '/luyen-thi' },
    { label: 'Bảng Xếp Hạng', href: '/leaderboard' },
    { label: 'Diễn Đàn', href: '/forum' },
    { label: 'Gói Đăng Ký', href: '/pricing' },
    { label: 'Khám Phá Khóa Học', href: '/courses' },
    { label: 'Tin Tức', href: '/news' },
    { label: 'Giới Thiệu', href: '/about' },
  ];

  return (
    <>
      {/* ── MAIN NAVBAR HEADER ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/98 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-900/5'
            : 'bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 shadow-xs'
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ── Brand Logo ── */}
          <Link href="/" className="flex items-center group shrink-0">
            <img
              src="/schoolify-logo.png"
              alt="Schoolify"
              className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105 dark:hidden"
            />
            <img
              src="/am-ban.png"
              alt="Schoolify"
              className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105 hidden dark:block"
            />
          </Link>

          {/* ── Desktop Navigation Links (Không viền, gạch dưới tab đang chọn) ── */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2 h-full">
            {navLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative py-2.5 px-2 lg:px-3 text-xs lg:text-sm transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-[#007D99] dark:text-[#00B8DD] font-bold'
                      : 'text-slate-600 hover:text-[#007D99] dark:text-slate-300 dark:hover:text-[#00B8DD] font-semibold'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-underline"
                      className="absolute bottom-0 inset-x-1.5 h-[2.5px] bg-[#00B8DD] rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop Right CTAs ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* Diamond / Token Badge with Hover Submenu */}
                <div
                  className="relative"
                  onMouseEnter={handlePointsMenuEnter}
                  onMouseLeave={handlePointsMenuLeave}
                >
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 text-[#007D99] dark:text-[#00B8DD] font-black text-xs border border-cyan-200 dark:border-cyan-800 shadow-xs hover:scale-102 transition-all cursor-pointer"
                    title="Số dư Kim Cương / Token Luyện Thi (Rê chuột xem cách nhận điểm)"
                  >
                    <Gem className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400 animate-pulse" />
                    <span>{tokenBalance} 💎</span>
                  </Link>

                  {/* Submenu: Các cách có điểm */}
                  <AnimatePresence>
                    {pointsMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-[420px] max-w-[calc(100vw-24px)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 p-4 z-50 text-slate-800 dark:text-slate-100"
                      >
                        {/* Header: Số dư hiện tại */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-3.5">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Ví Điểm Schoolify
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{tokenBalance}</span>
                              <span className="text-sm font-bold text-[#00B8DD]">Kim Cương</span>
                              <Gem className="w-4 h-4 text-cyan-500 fill-cyan-400 shrink-0" />
                            </div>
                          </div>
                          <Link
                            href="/pricing"
                            onClick={() => setPointsMenuOpen(false)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0"
                          >
                            Nạp Thêm
                          </Link>
                        </div>

                        {/* Title: Cách có điểm */}
                        <div className="px-1 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Các Cách Có Điểm
                          </span>
                        </div>

                        {/* 3 Cách có điểm */}
                        <div className="space-y-1">
                          {/* 1. Điểm danh */}
                          <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/10 text-[#00B8DD] flex items-center justify-center shrink-0">
                                <CalendarCheck className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">
                                    Điểm danh mỗi ngày
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] whitespace-nowrap">
                                    +10 💎
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                                  Vào app học tập nhận ngay điểm thưởng
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleCheckin}
                              disabled={checkedInToday}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap',
                                checkedInToday
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                                  : 'bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 shadow-xs active:scale-95'
                              )}
                            >
                              {checkedInToday ? '✓ Đã nhận' : 'Điểm danh'}
                            </button>
                          </div>

                          {/* 2. Làm đề thi */}
                          <Link
                            href="/luyen-thi"
                            onClick={() => setPointsMenuOpen(false)}
                            className="group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 block"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#00B8DD] group-hover:bg-[#00B8DD]/10 flex items-center justify-center shrink-0 transition-colors">
                                <Award className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#00B8DD] transition-colors whitespace-nowrap">
                                    Làm đề thi thử ma trận
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                    +20 ~ 50 💎
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                                  Đạt điểm cao trong các đề thi phân tầng
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>

                          {/* 3. Mua thêm điểm */}
                          <Link
                            href="/pricing"
                            onClick={() => setPointsMenuOpen(false)}
                            className="group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 block"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#00B8DD] group-hover:bg-[#00B8DD]/10 flex items-center justify-center shrink-0 transition-colors">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#00B8DD] transition-colors whitespace-nowrap">
                                    Mua thêm Kim Cương
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                                    Gói từ 50K
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                                  Nạp nhanh qua VietQR, nhận lượt thi VIP
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        </div>

                        {/* Footer: Cửa hàng đổi quà */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs px-1">
                          <span className="text-slate-400">Muốn dùng điểm đổi quà?</span>
                          <Link
                            href="/student/rewards"
                            onClick={() => setPointsMenuOpen(false)}
                            className="text-[#00B8DD] hover:underline font-bold flex items-center gap-1 transition-colors"
                          >
                            Cửa hàng đổi quà <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Avatar with Hover Submenu */}
                <div
                  className="relative"
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#00B8DD] to-[#007D99] text-white font-black text-sm shadow-md shadow-[#00B8DD]/20 border-2 border-white dark:border-slate-800 ring-2 ring-[#00B8DD]/30 hover:ring-[#00B8DD] hover:scale-105 transition-all cursor-pointer focus:outline-none"
                    aria-label="Quản lý trang cá nhân"
                    title={user.fullname || 'Trang cá nhân'}
                  >
                    <span>{user.fullname?.charAt(0).toUpperCase() || 'U'}</span>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </button>

                  {/* Submenu Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 p-2.5 z-50 text-slate-800 dark:text-slate-100"
                      >
                        {/* Header Profile Info */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B8DD] to-[#007D99] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                            {user.fullname?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {user.fullname || 'Người dùng'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {user.email || 'user@schoolify.edu.vn'}
                            </p>
                            <div className="mt-1">
                              <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]">
                                {user.role === 'SUPER_ADMIN'
                                  ? 'Super Admin'
                                  : isTeacher
                                  ? 'Người Bán Khóa Học'
                                  : 'Người Luyện Thi'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="space-y-0.5 text-xs">
                          {isTeacher ? (
                            <>
                              <Link
                                href="/teacher/dashboard"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                                <span>Bàn Làm Việc Giảng Viên</span>
                              </Link>
                              <Link
                                href="/profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <User className="w-4 h-4 text-primary" />
                                <span>Tài Khoản Giảng Viên</span>
                              </Link>
                              <Link
                                href="/teacher/courses"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <BookOpen className="w-4 h-4 text-amber-500" />
                                <span>Khóa Học & Bộ Đề Của Tôi</span>
                              </Link>
                              <Link
                                href="/teacher/revenue"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                <span>Doanh Thu & Ví Tiền</span>
                              </Link>
                            </>
                          ) : user.role === 'SUPER_ADMIN' ? (
                            <>
                              <Link
                                href="/admin/dashboard"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                                <span>Quản Trị Hệ Thống</span>
                              </Link>
                              <Link
                                href="/luyen-thi"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <Sparkles className="w-4 h-4 text-[#00B8DD]" />
                                <span>Cổng Luyện Thi K-12</span>
                              </Link>
                              <Link
                                href="/profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <User className="w-4 h-4 text-primary" />
                                <span>Thông Tin Cá Nhân</span>
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/luyen-thi"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-[#007D99] dark:text-[#00B8DD] hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors font-bold mb-1"
                              >
                                <Sparkles className="w-4 h-4 text-[#00B8DD]" />
                                <span>Vào Luyện Thi Ngay 🚀</span>
                              </Link>
                              <Link
                                href="/student"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <User className="w-4 h-4 text-primary" />
                                <span>Quản Lý Tài Khoản Cá Nhân</span>
                              </Link>
                              <Link
                                href="/student/my-courses"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                <span>Khóa Học Đã Đăng Ký</span>
                              </Link>
                              <Link
                                href="/student/exams"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>Lịch Sử Luyện Thi & Điểm Số</span>
                              </Link>
                            </>
                          )}

                          <Link
                            href="/pricing"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium pt-1.5 border-t border-slate-100 dark:border-slate-800/80"
                          >
                            <div className="flex items-center gap-2.5">
                              <Gem className="w-4 h-4 text-amber-500" />
                              <span>Số dư Kim Cương</span>
                            </div>
                            <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                              {tokenBalance} 💎
                            </span>
                          </Link>
                        </div>

                        {/* Divider & Logout */}
                        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs w-full transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Login button → Opens right drawer */
              <button
                onClick={() => setLoginDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#00B8DD]" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>

          {/* ── Mobile Hamburger & Theme ── */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#007D99] dark:text-[#00B8DD] font-black text-[11px] border border-cyan-200 dark:border-cyan-800"
                >
                  <Gem className="w-3 h-3 text-cyan-500 fill-cyan-400" />
                  <span>{tokenBalance} 💎</span>
                </Link>
                <Link
                  href={
                    user.role === 'SUPER_ADMIN'
                      ? '/admin/dashboard'
                      : isTeacher
                      ? '/teacher/dashboard'
                      : '/student'
                  }
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B8DD] to-[#007D99] text-white flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {user.fullname?.charAt(0).toUpperCase() || 'U'}
                </Link>
              </div>
            ) : (
              /* Mobile Login icon button */
              <button
                onClick={() => setLoginDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                aria-label="Đăng nhập"
              >
                <LogIn className="w-4 h-4 text-[#00B8DD]" />
                <span className="sr-only sm:not-sr-only">Đăng nhập</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU DRAWER ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' as const }}
              className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-4 pb-6 md:hidden shadow-lg"
            >
              <div className="flex flex-col space-y-4">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((item) => {
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                          isActive
                            ? 'text-[#007D99] dark:text-[#00B8DD] font-bold bg-[#E6F8FC]/60 dark:bg-slate-800 border-l-4 border-[#00B8DD]'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginDrawerOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-[#00B8DD]" />
                    <span>Đăng Nhập</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── LOGIN ROLE DRAWER (RIGHT SIDEBAR) ── */}
      <AnimatePresence>
        {loginDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLoginDrawerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Right Drawer Panel */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-screen max-w-md bg-slate-950 border-l border-slate-800/90 shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00B8DD] to-[#009bbd] flex items-center justify-center shadow-lg shadow-[#00B8DD]/30 border border-white/20">
                        <LogIn className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white leading-tight">
                          Đăng Nhập Schoolify
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Chọn phân hệ của bạn để tiếp tục
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setLoginDrawerOpen(false)}
                      className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Đóng"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body - Role Login Cards */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#00B8DD] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Chọn Cổng Đăng Nhập
                    </span>
                  </div>

                  {/* Quick 1-Click Demo Login */}
                  <button
                    type="button"
                    onClick={() => {
                      login(
                        {
                          id: 'usr-student-01',
                          fullname: 'Nguyễn Hoàng Minh',
                          email: 'student.minh@schoolify.edu.vn',
                          role: 'USER',
                          status: true,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          school_memberships: [
                            {
                              id: 'mem-01',
                              user_id: 'usr-student-01',
                              school_id: 'sch-01',
                              school_name: 'THPT Chuyên Công Nghệ Schoolify',
                              role: 'STUDENT',
                              joined_at: new Date().toISOString(),
                            },
                          ],
                        },
                        'mock-student-token',
                        'STUDENT',
                        'sch-01'
                      );
                      toast.success('Đăng nhập thành công!', {
                        description: 'Chào mừng Nguyễn Hoàng Minh (HS-2026)',
                      });
                      setLoginDrawerOpen(false);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-[#00B8DD]/20 border border-emerald-500/40 hover:border-emerald-500/80 text-left transition-all hover:scale-[1.01] flex items-center justify-between cursor-pointer mb-3 shadow-md shadow-emerald-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white flex items-center gap-1.5">
                          ⚡ Đăng Nhập Nhanh 1-Click
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Học sinh mẫu: Nguyễn Hoàng Minh
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>

                  {LOGIN_ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link
                        key={role.id}
                        href={role.href}
                        onClick={() => setLoginDrawerOpen(false)}
                        className={cn(
                          'group flex items-center justify-between p-4 rounded-2xl border bg-slate-900/60 transition-all duration-200 hover:scale-[1.01] block cursor-pointer',
                          role.theme
                        )}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border border-current shadow-sm">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-white group-hover:text-white truncate">
                                {role.label}
                              </p>
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', role.badgeTheme)}>
                                {role.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                              {role.desc}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-3" />
                        </div>
                      </Link>
                    );
                  })}

                  {/* Help tip */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mt-4 text-xs text-slate-400 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300">Bạn quên mật khẩu hoặc chưa có tài khoản?</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Liên hệ Hotline hỗ trợ <strong className="text-white">1900 6868</strong> hoặc đăng ký tài khoản bên dưới.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-5 border-t border-slate-800 bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Chưa có tài khoản Schoolify?</span>
                    <Link
                      href="/register"
                      onClick={() => setLoginDrawerOpen(false)}
                      className="font-bold text-[#00B8DD] hover:underline flex items-center gap-1"
                    >
                      Đăng ký ngay <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <Link href="/register" onClick={() => setLoginDrawerOpen(false)}>
                    <Button
                      className="w-full justify-center bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold shadow-lg shadow-[#00B8DD]/30 py-2.5 rounded-xl"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Đăng Ký Tài Khoản Miễn Phí
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Shield className="w-3 h-3" /> Chuẩn K-12 GDPT 2018
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1 text-[#00B8DD]">
                      <UserCheck className="w-3 h-3" /> Bảo Mật An Toàn
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
