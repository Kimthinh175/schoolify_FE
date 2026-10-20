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
  UserCheck,
  Lock,
  Gem,
  LogOut,
  LayoutDashboard,
  User,
  Award,
  CreditCard,
  CalendarCheck,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { examPointsService, ExamPointLogItem } from '@/services/exam-points.service';
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
  },
  {
    id: 'teacher',
    icon: BookOpen,
    label: 'Người Bán Khóa Học',
    badge: 'Giáo viên & Giảng viên',
    desc: 'Tạo khóa học số, xuất bản đề thi theo ma trận, kinh doanh tài liệu & quản lý học viên',
    href: '/login/teacher',
  },
];

export function Navbar() {
  const { user, isAuthenticated, logout, fetchMe, currentRole } = useAuthStore();
  const isTeacher = currentRole === 'TEACHER' || !!user?.teacher_profile;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [pointsMenuOpen, setPointsMenuOpen] = React.useState(false);
  const pointsMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [checkedInToday, setCheckedInToday] = React.useState(false);
  const [recentPointLogs, setRecentPointLogs] = React.useState<ExamPointLogItem[]>([]);

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

  const [tokenBalance, setTokenBalance] = React.useState<number>(9);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchMe().catch(() => { });
    }
  }, [isAuthenticated, fetchMe]);

  const loadPointsFromBackend = React.useCallback(async () => {
    const balanceData = await examPointsService.getBalance(user?.id);
    if (balanceData && typeof balanceData.currentPoints === 'number') {
      setTokenBalance(balanceData.currentPoints);
      setRecentPointLogs(balanceData.recentLogs || []);
      const todayKey = new Date().toISOString().slice(0, 10);
      const claimedManualKey = `schoolify_checkin_${user?.id || 'guest'}_${todayKey}`;
      if (typeof window !== 'undefined' && localStorage.getItem(claimedManualKey) === '1') {
        setCheckedInToday(true);
      } else {
        setCheckedInToday(false);
      }
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadPointsFromBackend();

    const handleTokensUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<{ points?: number }>;
      if (typeof customEvt?.detail?.points === 'number') {
        setTokenBalance(customEvt.detail.points);
      }
      loadPointsFromBackend();
    };

    window.addEventListener('tokens-updated', handleTokensUpdated);
    return () => {
      window.removeEventListener('tokens-updated', handleTokensUpdated);
    };
  }, [loadPointsFromBackend]);

  const handleCheckin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (checkedInToday) return;
    try {
      const res = await examPointsService.claimDailyPoints({
        userId: user?.id,
        forceReset: true,
      });
      if (res?.success && res?.data) {
        setCheckedInToday(true);
        setTokenBalance(res.data.currentPoints);
        const todayKey = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`schoolify_checkin_${user?.id || 'guest'}_${todayKey}`, '1');
        toast.success('Điểm danh thành công!', {
          description: res.message || `Số dư điểm năng lượng làm đề: ${res.data.currentPoints} điểm.`,
        });
        loadPointsFromBackend();
      }
    } catch {
      toast.error('Không thể điểm danh lúc này. Vui lòng thử lại.');
    }
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

          {/* ── Desktop Navigation Links ── */}
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
            <ThemeToggle />

            {/* Diamond / Exam Energy Points Badge (Luôn hiển thị cho cả Học sinh & Khách) */}
            <div
              className="relative"
              onMouseEnter={handlePointsMenuEnter}
              onMouseLeave={handlePointsMenuLeave}
            >
              <Link
                href="/student/rewards"
                className="inline-flex h-9 items-center gap-1.5 px-3 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Số dư điểm năng lượng làm đề"
              >
                <Gem className="w-4 h-4 text-[#00B8DD] shrink-0" />
                <span className="tabular-nums font-bold text-slate-800 dark:text-slate-100">{tokenBalance}</span>
              </Link>

              {/* Submenu: Điểm thưởng & Lịch sử */}
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
                          Số dư điểm làm đề hôm nay (PostgreSQL)
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{tokenBalance}</span>
                          <Gem className="w-4 h-4 text-[#00B8DD] shrink-0" />
                          <span className="text-[10px] text-slate-400 font-semibold">/ 9đ mỗi ngày</span>
                        </div>
                      </div>
                      <Link
                        href="/pricing"
                        onClick={() => setPointsMenuOpen(false)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                      >
                        Nâng Cấp PRO
                      </Link>
                    </div>

                    {/* Quy tắc tiêu điểm & nhận điểm */}
                    <div className="px-1 mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Điểm Danh &amp; Quy Tắc Điểm Làm Đề
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* 1. Điểm danh nhận 9 điểm/ngày */}
                      <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/10 text-[#00B8DD] flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">
                                Điểm danh nhận 9đ hôm nay
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] whitespace-nowrap">
                                9 điểm/ngày
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                              Đủ làm 3 đề Cơ bản (-3đ), 2 Trung bình (-4đ), 1 Giỏi (-9đ)
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
                              : 'bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-xs active:scale-95'
                          )}
                        >
                          {checkedInToday ? '✓ Đã nhận' : 'Nhận 9đ'}
                        </button>
                      </div>

                      {/* 2. Làm đề thi đạt điểm cao */}
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
                                Thưởng điểm khi đạt 8.5+
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                +1đ ~ +2đ
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                              &lt;5đ: -1đ | 5-8.5đ: 0đ | 8.5-9.9đ: +1đ | 10đ: +2đ
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    </div>

                    {/* Lịch sử biến động điểm gần nhất */}
                    {recentPointLogs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
                          Lịch sử biến động gần nhất
                        </span>
                        <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                          {recentPointLogs.slice(0, 3).map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                            >
                              <span className="truncate text-slate-600 dark:text-slate-300 pr-2">
                                {log.note || log.examTitle || log.actionType}
                              </span>
                              <span
                                className={cn(
                                  'font-mono font-bold shrink-0',
                                  log.pointsDelta > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : log.pointsDelta < 0
                                      ? 'text-rose-600 dark:text-rose-400'
                                      : 'text-slate-500'
                                )}
                              >
                                {log.pointsDelta > 0 ? `+${log.pointsDelta}` : log.pointsDelta}đ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer: Xem lịch sử & Cửa hàng đổi quà */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs px-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <History className="w-3.5 h-3.5" /> Chi tiết điểm &amp; lịch sử
                      </span>
                      <Link
                        href="/student/rewards"
                        onClick={() => setPointsMenuOpen(false)}
                        className="text-[#00B8DD] hover:underline font-bold flex items-center gap-1 transition-colors"
                      >
                        Xem lịch sử &amp; Đổi quà <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* User Avatar with Hover Submenu */}
                <div
                  className="relative"
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold text-sm border border-[#00B8DD] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    aria-label="Quản lý trang cá nhân"
                    title={user.fullname || 'Trang cá nhân'}
                  >
                    <span>{user.fullname?.charAt(0).toUpperCase() || 'U'}</span>
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
                                <span>Khóa Học &amp; Bộ Đề Của Tôi</span>
                              </Link>
                              <Link
                                href="/teacher/revenue"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                              >
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                <span>Doanh Thu &amp; Ví Tiền</span>
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
                                <span>Lịch Sử Luyện Thi &amp; Điểm Số</span>
                              </Link>
                            </>
                          )}

                          <Link
                            href="/student/rewards"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium pt-1.5 border-t border-slate-100 dark:border-slate-800/80"
                          >
                            <div className="flex items-center gap-2.5">
                              <Gem className="w-4 h-4 text-[#00B8DD]" />
                              <span>Điểm năng lượng làm đề</span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                              {tokenBalance}đ
                            </span>
                          </Link>
                        </div>

                        {/* Divider & Logout */}
                        <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                              toast.success('Đã đăng xuất khỏi hệ thống.');
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
            <Link
              href="/student/rewards"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80"
            >
              <Gem className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
              <span className="tabular-nums font-bold">{tokenBalance}</span>
            </Link>
            {isAuthenticated && user ? (
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
            ) : (
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

                {!isAuthenticated && (
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
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── LOGIN ROLE DRAWER (RIGHT SIDEBAR) ── */}
      <AnimatePresence>
        {loginDrawerOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLoginDrawerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-screen max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
              >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                          Đăng Nhập Schoolify
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Chọn phân hệ của bạn để tiếp tục
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setLoginDrawerOpen(false)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Đóng"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body - Role Login Cards */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5">
                  <div className="flex items-center justify-between mb-2.5 px-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Chọn cổng đăng nhập
                    </span>
                  </div>

                  {LOGIN_ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link
                        key={role.id}
                        href={role.href}
                        onClick={() => setLoginDrawerOpen(false)}
                        className="group flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#00B8DD]/40 hover:bg-slate-50/70 dark:hover:bg-slate-850/80 transition-all duration-150 cursor-pointer block"
                      >
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 group-hover:text-[#00B8DD] group-hover:border-[#00B8DD]/30 group-hover:bg-[#00B8DD]/5 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#00B8DD] transition-colors truncate">
                              {role.label}
                            </p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {role.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {role.desc}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-3" />
                      </Link>
                    );
                  })}

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Bạn quên mật khẩu hoặc chưa có tài khoản?</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Liên hệ Hotline hỗ trợ <strong className="text-slate-800 dark:text-slate-200 font-semibold">1900 6868</strong> hoặc đăng ký tài khoản bên dưới.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Chưa có tài khoản Schoolify?</span>
                    <Link
                      href="/register"
                      onClick={() => setLoginDrawerOpen(false)}
                      className="font-semibold text-[#00B8DD] hover:underline flex items-center gap-1"
                    >
                      Đăng ký ngay <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <Link href="/register" onClick={() => setLoginDrawerOpen(false)} className="block">
                    <Button
                      className="w-full justify-center bg-[#00B8DD] hover:bg-[#009bbd] text-white font-medium py-2 rounded-lg transition-colors cursor-pointer"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Đăng Ký Tài Khoản Miễn Phí
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-3 pt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Chuẩn K-12 GDPT 2018
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Bảo Mật An Toàn
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
