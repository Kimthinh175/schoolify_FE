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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Simplified Role Login Options for Right Drawer
const LOGIN_ROLES = [
  {
    id: 'teacher',
    icon: BookOpen,
    label: 'Giáo Viên',
    badge: 'Dạy học',
    href: '/login/teacher',
    theme: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400 border-amber-500/20 bg-amber-500/10',
    badgeTheme: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    id: 'student',
    icon: GraduationCap,
    label: 'Học Sinh',
    badge: 'Học tập',
    href: '/login/student',
    theme: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    badgeTheme: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'parent',
    icon: Baby,
    label: 'Phụ Huynh',
    badge: 'Sổ liên lạc',
    href: '/login/parent',
    theme: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 border-rose-500/20 bg-rose-500/10',
    badgeTheme: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  {
    id: 'school',
    icon: School,
    label: 'Nhà Trường',
    badge: 'Quản trị',
    href: '/login/school',
    theme: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
    badgeTheme: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [loginDrawerOpen, setLoginDrawerOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  React.useEffect(() => {
    setLoginDrawerOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // ESC key closes drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLoginDrawerOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Khám Phá Khóa Học', href: '/courses' },
    { label: 'Bảng Giá SaaS', href: '/pricing' },
  ];

  return (
    <>
      {/* ── MAIN NAVBAR HEADER ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/98 backdrop-blur-xl border-b border-slate-200/90 shadow-md shadow-slate-900/5'
            : 'bg-white border-b border-slate-200/80 shadow-xs'
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ── Brand Logo ── */}
          <Link href="/" className="flex items-center group shrink-0">
            <img
              src="/schoolify-logo.png"
              alt="Schoolify"
              className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* ── Desktop Navigation Links ── */}
          <nav className="hidden md:flex items-center gap-2.5">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-xs',
                    isActive
                      ? 'bg-[#00B8DD] text-white shadow-md shadow-[#00B8DD]/25 border border-[#009bbd]'
                      : 'bg-[#E6F8FC] text-[#007D99] hover:bg-[#00B8DD] hover:text-white border border-[#00B8DD]/30'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop Right CTAs ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Login button → Opens right drawer */}
            <button
              onClick={() => setLoginDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#00B8DD]" />
              <span>Đăng Nhập</span>
            </button>
          </div>

          {/* ── Mobile Hamburger ── */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Login icon button */}
            <button
              onClick={() => setLoginDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Đăng nhập"
            >
              <LogIn className="w-4 h-4 text-[#00B8DD]" />
              <span className="sr-only sm:not-sr-only">Đăng nhập</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors"
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
              className="border-b border-slate-200 bg-white px-4 pt-4 pb-6 md:hidden shadow-lg"
            >
              <div className="flex flex-col space-y-4">
                {/* Navigation Links */}
                <div className="space-y-2">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors text-center shadow-xs',
                        pathname === item.href
                          ? 'bg-[#00B8DD] text-white border border-[#009bbd]'
                          : 'bg-[#E6F8FC] text-[#007D99] hover:bg-[#00B8DD] hover:text-white border border-[#00B8DD]/30'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLoginDrawerOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
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

                  {LOGIN_ROLES.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link
                        key={role.id}
                        href={role.href}
                        onClick={() => setLoginDrawerOpen(false)}
                        className={cn(
                          'group flex items-center justify-between p-3.5 rounded-xl border bg-slate-900/60 transition-all duration-150 hover:scale-[1.01] block cursor-pointer',
                          role.theme
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-current">
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white group-hover:text-white truncate">
                              {role.label}
                            </p>
                          </div>
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
                        Liên hệ Hotline hỗ trợ <strong className="text-white">1900 6868</strong> hoặc đăng ký dùng thử bên dưới.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-5 border-t border-slate-800 bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Chưa có tài khoản trường?</span>
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
                      Dùng Thử Miễn Phí 14 Ngày
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Shield className="w-3 h-3" /> Chuẩn K-12
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1 text-[#00B8DD]">
                      <UserCheck className="w-3 h-3" /> Phân quyền RBAC
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
