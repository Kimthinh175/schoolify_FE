'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  BookOpen,
  Sparkles,
  ArrowRight,
  Shield,
  ShieldCheck,
  LogIn,
  UserCheck,
  Lock,
  LogOut,
  LayoutDashboard,
  User,
  Award,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFrame, useActiveAvatarFrame } from '@/components/ui/avatar-frame';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { examPointsService } from '@/services/exam-points.service';
import { AdminPointsEditModal } from '@/components/features/admin/AdminPointsEditModal';
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

export function Navbar({ onOpenMobileSidebar }: { onOpenMobileSidebar?: () => void } = {}) {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchMe, currentRole } = useAuthStore();
  const isTeacher = currentRole === 'TEACHER' || !!user?.teacher_profile;
  const isAdmin =
    (currentRole as string) === 'ADMIN' ||
    currentRole === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';
  const [adminPointsModalOpen, setAdminPointsModalOpen] = React.useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = React.useState(false);
  const subWindowRef = React.useRef<Window | null>(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [pointsMenuOpen, setPointsMenuOpen] = React.useState(false);
  const pointsMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [checkedInToday, setCheckedInToday] = React.useState(false);

  const headerRef = React.useRef<HTMLElement | null>(null);
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

  const [isMounted, setIsMounted] = React.useState(false);
  const [isPointsLoading, setIsPointsLoading] = React.useState(true);
  const [tokenBalance, setTokenBalance] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 9;
    try {
      const stored = window.localStorage.getItem('schoolify_user_tokens');
      if (stored !== null && stored !== '') {
        const parsed = Number(stored);
        if (Number.isFinite(parsed)) return parsed;
      }
    } catch {}
    return 9;
  });
  const [diamondsBalance, setDiamondsBalance] = React.useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = window.localStorage.getItem('schoolify_user_diamonds');
      if (stored !== null && stored !== '') {
        const parsed = Number(stored);
        if (Number.isFinite(parsed)) return parsed;
      }
    } catch {}
    return 0;
  });
  const [dailyAllowance, setDailyAllowance] = React.useState<number>(9);
  const [activePackage, setActivePackage] = React.useState<string>('FREE');
  const { frameTier } = useActiveAvatarFrame(activePackage);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchMe().catch(() => { });
    }
  }, [isAuthenticated, fetchMe]);

  const loadPointsFromBackend = React.useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsPointsLoading(false);
      return;
    }
    setIsPointsLoading(true);
    try {
      const balanceData = await examPointsService.getBalance(user.id);
      if (balanceData) {
        if (typeof balanceData.currentPoints === 'number') {
          setTokenBalance(balanceData.currentPoints);
        }
        if (typeof balanceData.diamonds === 'number') {
          setDiamondsBalance(balanceData.diamonds);
        }
        if (typeof balanceData.dailyAllowance === 'number') {
          setDailyAllowance(balanceData.dailyAllowance);
        }
        if (balanceData.activePackage) {
          setActivePackage(balanceData.activePackage);
        }
        const todayKey = new Date().toISOString().slice(0, 10);
        const claimedManualKey = `schoolify_checkin_${user.id}_${todayKey}`;
        if (typeof window !== 'undefined' && localStorage.getItem(claimedManualKey) === '1') {
          setCheckedInToday(true);
        } else {
          setCheckedInToday(Boolean(balanceData.alreadyClaimedToday));
        }
      }
    } finally {
      setIsPointsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  React.useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsPointsLoading(false);
      return;
    }
    loadPointsFromBackend();

    const handleTokensUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<{ points?: number; diamonds?: number; refreshFromBackend?: boolean }>;
      if (typeof customEvt?.detail?.points === 'number') {
        setTokenBalance(customEvt.detail.points);
      } else if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('schoolify_user_tokens');
        if (stored !== null && stored !== '') {
          const parsed = Number(stored);
          if (Number.isFinite(parsed)) {
            setTokenBalance(parsed);
          }
        }
      }
      if (typeof customEvt?.detail?.diamonds === 'number') {
        setDiamondsBalance(customEvt.detail.diamonds);
      } else if (typeof window !== 'undefined') {
        const storedDiamonds = window.localStorage.getItem('schoolify_user_diamonds');
        if (storedDiamonds !== null && storedDiamonds !== '') {
          const parsedDiamonds = Number(storedDiamonds);
          if (Number.isFinite(parsedDiamonds)) {
            setDiamondsBalance(parsedDiamonds);
          }
        }
      }
      if (customEvt?.detail?.refreshFromBackend) {
        loadPointsFromBackend();
      }
    };

    window.addEventListener('tokens-updated', handleTokensUpdated);
    return () => {
      window.removeEventListener('tokens-updated', handleTokensUpdated);
    };
  }, [isAuthenticated, user?.id, loadPointsFromBackend]);

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
          description: res.message || `Số dư Tia Sáng: ${res.data.currentPoints} tia.`,
        });
        loadPointsFromBackend();
      }
    } catch {
      toast.error('Không thể điểm danh lúc này. Vui lòng thử lại.');
    }
  };

  React.useEffect(() => {
    let ticking = false;
    let lastState: boolean | null = null;
    const scrolledClasses = ['bg-white/98', 'dark:bg-slate-950/90', 'backdrop-blur-md', 'border-slate-200/90', 'shadow-md', 'shadow-slate-900/5'];
    const defaultClasses = ['bg-white', 'dark:bg-slate-950', 'border-slate-200/80', 'shadow-xs'];

    const applyHeaderScroll = () => {
      ticking = false;
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== lastState) {
        lastState = isScrolled;
        const el = headerRef.current;
        if (el) {
          if (isScrolled) {
            el.classList.remove(...defaultClasses);
            el.classList.add(...scrolledClasses);
          } else {
            el.classList.remove(...scrolledClasses);
            el.classList.add(...defaultClasses);
          }
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyHeaderScroll);
      }
    };

    applyHeaderScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
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
  }, []);

  // Lắng nghe sự kiện đăng nhập thành công từ tab con / popup window
  React.useEffect(() => {
    const killSubWindow = () => {
      if (subWindowRef.current && !subWindowRef.current.closed) {
        try {
          subWindowRef.current.close();
        } catch (e) {}
        subWindowRef.current = null;
      }
    };

    const applyAuth = (user: any, token: string, role?: any) => {
      if (!user || !token) return;
      killSubWindow();

      // Chốt chặn toàn cục trên window: chỉ xử lý 1 lần duy nhất cho mỗi phiên đăng nhập
      const now = Date.now();
      const lastAt = (window as any).__schoolifyLastAuthAt || 0;
      if (now - lastAt < 4000) return;
      (window as any).__schoolifyLastAuthAt = now;

      useAuthStore.getState().login(user, token, role);
      setLoginDrawerOpen(false);
      toast.success('Đăng nhập thành công!', {
        id: 'schoolify-auth-success',
        description: `Chào mừng ${user.fullname || 'bạn'} đến với Schoolify!`,
      });
      try {
        useAuthStore.getState().fetchMe();
      } catch (e) {}
      try {
        router.refresh();
      } catch (e) {}
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('schoolify_auth_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'LOGIN_SUCCESS') {
          const { user, token, role } = event.data;
          applyAuth(user, token, role);
        }
      };
    } catch (e) {}

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'schoolify_auth_event' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data?.user && data?.token) {
            applyAuth(data.user, data.token, data.role);
          }
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorage);

    const handleFocus = () => {
      if (useAuthStore.getState().isAuthenticated) {
        killSubWindow();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      channel?.close();
    };
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
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b dark:border-slate-800 bg-white dark:bg-slate-950 border-slate-200/80 shadow-xs"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ── Brand Logo & Mobile Sidebar Trigger ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenMobileSidebar && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="p-1.5 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
                aria-label="Mở danh mục học sinh"
                title="Danh mục học sinh"
              >
                <Menu className="w-5 h-5 text-[#00B8DD]" />
              </button>
            )}

            <Link href="/" className="flex items-center group">
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
          </div>

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

            {!isMounted ? (
              <div
                className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-pulse shrink-0"
                aria-busy="true"
                aria-label="Đang tải thông tin tài khoản..."
              />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* Diamond / Exam Energy Points Badge (Chỉ hiển thị cho học sinh đã đăng nhập) */}
                {isPointsLoading ? (
                  <div
                    className="inline-flex h-9 items-center gap-2 px-3 rounded-full bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 animate-pulse select-none shrink-0"
                    aria-busy="true"
                    aria-label="Đang tải điểm..."
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400/40 dark:bg-amber-400/30" />
                      <div className="w-7 h-3 rounded-md bg-slate-200 dark:bg-slate-700/80" />
                    </div>
                    <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/40 dark:bg-cyan-400/30" />
                      <div className="w-9 h-3 rounded-md bg-slate-200 dark:bg-slate-700/80" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative"
                    onMouseEnter={handlePointsMenuEnter}
                    onMouseLeave={handlePointsMenuLeave}
                  >
                    <Link
                      href="/student/rewards"
                      onClick={(e) => {
                        if (isAdmin) {
                          e.preventDefault();
                          setPointsMenuOpen((prev) => !prev);
                        }
                      }}
                      onDoubleClick={(e) => {
                        if (isAdmin) {
                          e.preventDefault();
                          e.stopPropagation();
                          setPointsMenuOpen(false);
                          setAdminPointsModalOpen(true);
                        }
                      }}
                      className={cn(
                        "inline-flex h-9 items-center gap-2 px-3 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs select-none",
                        isAdmin && "hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20"
                      )}
                      title={
                        isAdmin
                          ? "⚡ Quản trị viên: Nhấn đúp (2 lần) để chỉnh sửa điểm trực tiếp | ✨ Tia Sáng & 💎 Ngọc Tri Thức"
                          : "✨ Tia Sáng tạo đề hôm nay | 💎 Ngọc Tri Thức tích lũy vĩnh viễn"
                      }
                      data-testid="navbar-points-badge"
                    >
                      <div
                        onClick={(e) => {
                          if (isAdmin) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        onDoubleClick={(e) => {
                          if (isAdmin) {
                            e.preventDefault();
                            e.stopPropagation();
                            setPointsMenuOpen(false);
                            setAdminPointsModalOpen(true);
                          }
                        }}
                        className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold cursor-pointer"
                        data-testid="navbar-tiasang-badge"
                      >
                        <TiaSangIcon className="w-4 h-4" />
                        <span className="tabular-nums">{tokenBalance}/{dailyAllowance}</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-700 font-light">|</span>
                      <div
                        onClick={(e) => {
                          if (isAdmin) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        onDoubleClick={(e) => {
                          if (isAdmin) {
                            e.preventDefault();
                            e.stopPropagation();
                            setPointsMenuOpen(false);
                            setAdminPointsModalOpen(true);
                          }
                        }}
                        className="flex items-center gap-1 text-[#00B8DD] font-bold cursor-pointer"
                        data-testid="navbar-ngoc-badge"
                      >
                        <NgocIcon className="w-4 h-4" />
                        <span className="tabular-nums text-slate-800 dark:text-slate-100">{diamondsBalance}</span>
                      </div>
                    </Link>

                    {/* Submenu: Điểm thưởng & Lịch sử */}
                    <AnimatePresence>
                      {pointsMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 p-4 z-50 text-slate-800 dark:text-slate-100"
                        >
                          {/* Số dư 2 loại điểm */}
                          <div className="grid grid-cols-2 gap-2">
                            <div
                              onDoubleClick={(e) => {
                                if (isAdmin) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPointsMenuOpen(false);
                                  setAdminPointsModalOpen(true);
                                }
                              }}
                              className={cn(
                                "p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 select-none",
                                isAdmin && "cursor-pointer hover:border-amber-400 hover:ring-1 hover:ring-amber-400/40"
                              )}
                              title={isAdmin ? "⚡ Nhấn đúp 2 lần để chỉnh điểm Tia Sáng" : undefined}
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                <TiaSangIcon className="w-4 h-4" flat />
                                <span>Tia Sáng</span>
                              </div>
                              <div className="mt-1 flex items-baseline gap-0.5 tabular-nums">
                                <span className="text-2xl font-black text-amber-900 dark:text-amber-200">{tokenBalance}</span>
                                <span className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80">/{dailyAllowance}</span>
                              </div>
                              <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70">Làm mới 00:00</p>
                            </div>

                            <div
                              onDoubleClick={(e) => {
                                if (isAdmin) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPointsMenuOpen(false);
                                  setAdminPointsModalOpen(true);
                                }
                              }}
                              className={cn(
                                "p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 select-none",
                                isAdmin && "cursor-pointer hover:border-cyan-400 hover:ring-1 hover:ring-cyan-400/40"
                              )}
                              title={isAdmin ? "⚡ Nhấn đúp 2 lần để chỉnh điểm Ngọc Tri Thức" : undefined}
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                                <NgocIcon className="w-4 h-4" flat />
                                <span>Ngọc Tri Thức</span>
                              </div>
                              <div className="mt-1 tabular-nums">
                                <span className="text-2xl font-black text-cyan-900 dark:text-cyan-200">{diamondsBalance}</span>
                              </div>
                              <p className="text-[10px] text-cyan-700/70 dark:text-cyan-400/70">Tích lũy vĩnh viễn</p>
                            </div>
                          </div>

                          {/* Điểm danh */}
                          <div className="mt-2 flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Điểm danh hôm nay</span>
                            <button
                              onClick={handleCheckin}
                              disabled={checkedInToday}
                              className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all',
                                checkedInToday
                                  ? 'bg-transparent text-slate-400 dark:text-slate-500 cursor-default'
                                  : 'bg-[#00B8DD] hover:bg-[#009bbd] text-white cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2'
                              )}
                            >
                              {checkedInToday ? (
                                '✓ Đã nhận'
                              ) : (
                                <>
                                  +9 <TiaSangIcon className="w-3.5 h-3.5" flat />
                                </>
                              )}
                            </button>
                          </div>

                          {/* Footer: gói hiện tại & liên kết */}
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                            <Link
                              href="/pricing"
                              onClick={() => setPointsMenuOpen(false)}
                              className="text-slate-500 dark:text-slate-400 hover:text-[#00B8DD] transition-colors truncate"
                              title="Xem & nâng cấp gói"
                            >
                              {activePackage === 'STUDENT_100K'
                                ? '👑 Thủ Khoa VIP'
                                : activePackage === 'STUDENT_50K'
                                  ? '🔥 Bứt Phá'
                                  : '🌱 Tân Binh'}
                              <span className="text-[#00B8DD] font-semibold"> · Nâng cấp</span>
                            </Link>
                            <Link
                              href="/student/rewards"
                              onClick={() => setPointsMenuOpen(false)}
                              className="text-[#00B8DD] hover:underline font-bold flex items-center gap-1 shrink-0"
                            >
                              Lịch sử & Đổi quà <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* User Avatar with Hover Submenu */}
                <div
                  className="relative"
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-[#00B8DD] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]"
                    aria-label="Quản lý trang cá nhân"
                    title={user.fullname || 'Trang cá nhân'}
                  >
                    <AvatarFrame tier={frameTier} size="sm" showBadge={false}>
                      <Avatar
                        src={user.avatar_url || (user as any).avatarUrl || (user as any).avatar}
                        alt={user.fullname}
                        fallback={user.fullname?.charAt(0).toUpperCase() || 'U'}
                        size="sm"
                        className="w-9 h-9 border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                    </AvatarFrame>
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
                        {/* Header Profile Info (Bấm vào để vào trang cá nhân) */}
                        <Link
                          href={
                            user.role === 'SUPER_ADMIN'
                              ? '/admin/dashboard'
                              : isTeacher
                                ? '/profile'
                                : '/student'
                          }
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                          title="Xem trang thông tin cá nhân"
                        >
                          <AvatarFrame tier={frameTier} size="md">
                            <Avatar
                              src={user.avatar_url || (user as any).avatarUrl || (user as any).avatar}
                              alt={user.fullname}
                              fallback={user.fullname?.charAt(0).toUpperCase() || 'U'}
                              size="md"
                              className="w-10 h-10 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                            />
                          </AvatarFrame>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00B8DD] transition-colors">
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
                        </Link>

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
                              <TiaSangIcon className="w-4 h-4" />
                              <span>Tia Sáng làm đề</span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                              {tokenBalance}
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
            {isAuthenticated && user && (
              (!isMounted || isPointsLoading) ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-full bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 animate-pulse select-none shrink-0"
                  aria-busy="true"
                  aria-label="Đang tải điểm..."
                >
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-amber-400/40 dark:bg-amber-400/30" />
                    <div className="w-4 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 select-none">|</span>
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-400/40 dark:bg-cyan-400/30" />
                    <div className="w-6 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ) : (
                <Link
                  href="/student/rewards"
                  onClick={(e) => {
                    if (isAdmin) {
                      e.preventDefault();
                      setAdminPointsModalOpen(true);
                    }
                  }}
                  onDoubleClick={(e) => {
                    if (isAdmin) {
                      e.preventDefault();
                      e.stopPropagation();
                      setAdminPointsModalOpen(true);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 select-none",
                    isAdmin && "hover:border-amber-400"
                  )}
                  title={isAdmin ? "⚡ Quản trị viên: Chạm hoặc nhấn đúp để chỉnh sửa điểm" : "✨ Tia Sáng tạo đề | 💎 Ngọc Tri Thức"}
                  data-testid="mobile-navbar-points-badge"
                >
                  <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                    <TiaSangIcon className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{tokenBalance}</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-0.5 text-[#00B8DD] font-bold">
                    <NgocIcon className="w-3.5 h-3.5" />
                    <span className="tabular-nums text-slate-800 dark:text-slate-100">{diamondsBalance}</span>
                  </div>
                </Link>
              )
            )}

            {!isMounted ? (
              <div
                className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-pulse shrink-0"
                aria-busy="true"
              />
            ) : isAuthenticated && user ? (
              <Link
                href={
                  user.role === 'SUPER_ADMIN'
                    ? '/admin/dashboard'
                    : isTeacher
                      ? '/teacher/dashboard'
                      : '/student'
                }
                className="flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-[#00B8DD] transition-all shrink-0"
                title={user.fullname || 'Trang cá nhân'}
              >
                <AvatarFrame tier={frameTier} size="xs" showBadge={false}>
                  <Avatar
                    src={user.avatar_url || (user as any).avatarUrl || (user as any).avatar}
                    alt={user.fullname}
                    fallback={user.fullname?.charAt(0).toUpperCase() || 'U'}
                    size="sm"
                    className="w-8 h-8 border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                </AvatarFrame>
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
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Chọn cổng đăng nhập
                    </span>
                  </div>

                  {LOGIN_ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <a
                        key={role.id}
                        href={role.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setLoginDrawerOpen(false);
                          if (typeof window !== 'undefined') {
                            const width = 500;
                            const height = 720;
                            const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
                            const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
                            const popupUrl = `${role.href}${role.href.includes('?') ? '&' : '?'}popup=1`;
                            const sub = window.open(
                              popupUrl,
                              `SchoolifyAuth_${role.id}`,
                              `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
                            );
                            subWindowRef.current = sub;
                          }
                        }}
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
                      </a>
                    );
                  })}

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Đăng nhập nhanh không cần mật khẩu</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Xác thực tức thì bằng tài khoản Google (Gmail) hoặc nhận mã OTP gửi qua số điện thoại.
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

      {/* Admin Points Edit Modal (Nhấn đúp 2 lần vào số điểm để mở) */}
      {isAdmin && (
        <AdminPointsEditModal
          isOpen={adminPointsModalOpen}
          onClose={() => setAdminPointsModalOpen(false)}
          currentTokenBalance={tokenBalance}
          currentDiamondsBalance={diamondsBalance}
          userId={user?.id}
          onUpdated={(newPoints, newDiamonds) => {
            setTokenBalance(newPoints);
            setDiamondsBalance(newDiamonds);
          }}
        />
      )}
    </>
  );
}
