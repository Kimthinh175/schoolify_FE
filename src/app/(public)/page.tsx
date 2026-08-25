'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Building2,
  Users2,
  BookOpen,
  Award,
  CreditCard,
  CheckCircle2,
  Play,
  Shield,
  Globe,
  Star,
  MessageSquare,
  ChevronRight,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

const STATS = [
  { value: '500+', label: 'Trường học & Trung tâm', icon: Building2, iconBg: 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20', iconColor: 'text-[#00B8DD]' },
  { value: '120K+', label: 'Học sinh từ Lớp 1 - 12', icon: Users, iconBg: 'bg-emerald-50 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { value: '99.9%', label: 'Uptime Khảo Thí & LMS', icon: Shield, iconBg: 'bg-amber-50 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
  { value: '4.9/5', label: 'Mức độ hài lòng phụ huynh', icon: Star, iconBg: 'bg-rose-50 dark:bg-rose-950', iconColor: 'text-rose-500 dark:text-rose-400' },
];

const FEATURES = [
  {
    icon: BookOpen,
    color: 'from-blue-600 to-indigo-600',
    glow: 'shadow-blue-500/25',
    label: 'LMS & Soạn Bài Giảng Đa Phương Tiện',
    desc: 'Course Builder trực quan, lưu trữ video chất lượng cao, chia chương mục, tài liệu đính kèm và kiểm tra tương tác.',
  },
  {
    icon: Award,
    color: 'from-purple-600 to-indigo-600',
    glow: 'shadow-purple-500/25',
    label: 'Khảo Thí & Chấm Bài Tự Luận Kèm Lời Phê',
    desc: 'Hệ thống thi trắc nghiệm tự động, công cụ chấm tự luận chuyên sâu cho phép giáo viên để lại lời phê và điểm thành phần.',
  },
  {
    icon: MessageSquare,
    color: 'from-emerald-600 to-teal-600',
    glow: 'shadow-emerald-500/25',
    label: 'Sổ Liên Lạc Điện Tử Thời Gian Thực',
    desc: 'Phụ huynh theo sát bảng điểm, % hoàn thành khóa học và từng lời nhận xét của thầy cô giáo chỉ với 1 chạm trên điện thoại.',
  },
  {
    icon: CreditCard,
    color: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/25',
    label: 'Thu Học Phí Tự Động Qua VietQR',
    desc: 'Tích hợp cổng thanh toán VietQR động. Hệ thống tự động gạch nợ sau 30 giây, xuất biên lai điện tử và đối soát tức thì.',
  },
  {
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/25',
    label: 'Gamification & Đổi Quà Tích Điểm',
    desc: 'Học sinh làm bài, chuyên cần nhận điểm thưởng để đổi voucher học phí, huy hiệu và quà tặng tại Cửa hàng tích điểm.',
  },
  {
    icon: Globe,
    color: 'from-sky-500 to-blue-600',
    glow: 'shadow-sky-500/25',
    label: 'Kiến Trúc Multi-Tenant SaaS An Toàn',
    desc: 'Mỗi trường học, trung tâm có cơ sở dữ liệu riêng biệt, kiểm soát Quotas dung lượng, giáo viên và học sinh độc lập.',
  },
];

const ROLES = [
  { icon: Building2, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400', label: 'Super Admin', sub: 'Quản trị SaaS & Doanh thu' },
  { icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400', label: 'Hiệu Trưởng', sub: 'Quản trị trường & Quotas' },
  { icon: Award, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400', label: 'Trưởng Bộ Môn (HOD)', sub: 'Kiểm duyệt học thuật' },
  { icon: BookOpen, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400', label: 'Giáo Viên & Creator', sub: 'Giảng dạy & Bán khóa học' },
  { icon: CreditCard, color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400', label: 'Giáo Vụ & Thu Ngân', sub: 'Tuyển sinh & Quản lý thu' },
  { icon: Star, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400', label: 'Học Sinh (Lớp 1 - 12)', sub: 'Focus Mode & Đổi quà' },
  { icon: MessageSquare, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400', label: 'Phụ Huynh', sub: 'Sổ liên lạc & VietQR' },
];

const TESTIMONIALS = [
  {
    name: 'ThS. Nguyễn Văn Hùng',
    role: 'Trưởng Bộ Môn Toán, THPT Chuyên Công Nghệ',
    initials: 'NH',
    avatarColor: 'bg-amber-500',
    content: 'Schoolify giúp tổ bộ môn kiểm duyệt bài giảng và đề thi rất khoa học. Công cụ chấm tự luận kèm lời phê giúp giáo viên tiết kiệm hơn 60% thời gian so với chấm tay.',
    stars: 5,
  },
  {
    name: 'Cô Sarah Trần',
    role: 'Giáo viên IELTS & Content Creator',
    initials: 'ST',
    avatarColor: 'bg-[#00B8DD]',
    content: 'Tôi vừa quản lý học sinh theo lớp, vừa đóng gói khóa học tự chọn bán trên Marketplace. Doanh thu minh bạch và rút tiền về ngân hàng rất nhanh. Chỉ tiếc giao diện mobile chưa có app riêng.',
    stars: 4,
  },
  {
    name: 'Anh Nguyễn Văn Tuấn',
    role: 'Phụ huynh học sinh Nguyễn Hoàng Minh (11A1)',
    initials: 'NT',
    avatarColor: 'bg-emerald-500',
    content: 'Sổ liên lạc điện tử rất tiện. Nhận thông báo ngay khi con có điểm kiểm tra, xem lời phê của thầy cô và đóng học phí bằng VietQR trong chưa đầy 1 phút.',
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">

      {/* ══════════════════════════════════════════════════════════════════
          1. FULL WIDTH HERO BANNER — DIRECTLY BELOW HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-slate-950">
        <div className="relative w-full max-w-[1920px] mx-auto">
          <img
            src="/banner.png"
            alt="Schoolify — Số hóa trường học, Khai phóng tri thức"
            className="w-full h-auto object-cover max-h-[720px] min-h-[260px] sm:min-h-[380px]"
          />
          {/* Seamless bottom fade gradient into content */}
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-28 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. SLOGAN HEADLINE & ACTION CALLOUTS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-6 pb-16 sm:pt-10 sm:pb-24 overflow-hidden">
        {/* Ambient background light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B8DD]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F8FC] dark:bg-[#00B8DD]/15 border border-[#00B8DD]/30 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Nền Tảng Vận Hành & Kinh Doanh Giáo Dục Toàn Diện</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </motion.div>

          {/* Main Slogan Headline */}
          <motion.h1
            {...fadeUp(0.08)}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]"
          >
            Trường Học Hiện Đại{' '}
            <span className="bg-gradient-to-r from-[#00B8DD] via-cyan-500 to-[#009BBD] bg-clip-text text-transparent">
              Chạy Trên Một Nền Tảng.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.16)}
            className="mt-5 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            Quản lý học vụ K-12, tổ chức thi trực tuyến, sổ liên lạc điện tử và mở rộng kinh doanh khóa học — tất cả trong một hệ sinh thái duy nhất.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            {...fadeUp(0.24)}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold text-base shadow-xl shadow-[#00B8DD]/25 px-8"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Dùng Thử Miễn Phí 14 Ngày
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base font-semibold border-slate-300 dark:border-slate-700 px-7"
                leftIcon={<Play className="w-4 h-4 fill-current text-[#00B8DD]" />}
              >
                Khám Phá Các Phân Hệ
              </Button>
            </Link>
          </motion.div>

          {/* 2 Target Persona Value Props */}
          <motion.div {...fadeUp(0.3)} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/30 flex items-start gap-3.5 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-[#00B8DD] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                👨‍🏫
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#007D99] dark:text-[#00B8DD]">
                  Dành Cho Giáo Viên
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  "Sở hữu trường học số của riêng bạn với Schoolify. Tạo khóa học, đóng gói tri thức và gia tăng thu nhập thụ động chỉ trên một nền tảng."
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 flex items-start gap-3.5 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                👨‍👩‍👧
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  Dành Cho Phụ Huynh & Học Sinh
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  "Một tài khoản duy nhất cho mọi môn học từ Lớp 1 đến Lớp 12. Theo sát tiến trình, học tập linh hoạt cùng những giáo viên giỏi nhất."
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── STATS BAR ── */}
        <motion.div
          {...fadeUp(0.36)}
          className="mx-auto max-w-5xl px-4 sm:px-6 mt-14"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col sm:flex-row items-center gap-3.5 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xs shadow-xs"
                >
                  <div className={`h-10 w-10 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. CORE FEATURES GRID
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div {...fadeUp(0)}>
              <Badge variant="primary" className="bg-[#00B8DD] text-white mb-3">TÍNH NĂNG ĐỘT PHÁ</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                Mọi Công Cụ Cần Thiết Trong Một Nền Tảng
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Tối ưu hóa quy trình từ giảng dạy, khảo thí, quản lý học phí đến kết nối gia đình & nhà trường.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.label} {...fadeUp(i * 0.06)}>
                  <div className="h-full p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} shadow-lg ${f.glow} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. 7 ROLES SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            {/* Left text */}
            <div className="lg:w-2/5 shrink-0">
              <motion.div {...fadeUp(0)}>
                <Badge variant="purple" className="mb-3">PHÂN HỆ NGƯỜI DÙNG</Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                  Một Nền Tảng.{' '}
                  <span className="text-[#00B8DD]">7 Vai Trò</span>{' '}
                  Chuyên Biệt.
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Schoolify phân định rõ ranh giới quyền hạn, giao diện và công cụ tác nghiệp phù hợp cho từng vị trí trong bộ máy trường học.
                </p>

                <div className="space-y-2.5 mb-8">
                  {[
                    'Bảo mật phân quyền RBAC 7 tầng',
                    'Không gian làm việc & Dashboard chuyên biệt',
                    'Sổ liên lạc điện tử kết nối trực tiếp phụ huynh',
                    'Thẩm định giáo án chuyên môn đa cấp',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <Link href="/login">
                  <Button className="bg-[#00B8DD] hover:bg-[#009BBD] text-white" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Khám Phá Các Phân Hệ
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right: roles grid */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {ROLES.map((role, i) => {
                  const Icon = role.icon;
                  return (
                    <motion.div key={role.label} {...fadeUp(i * 0.06)}>
                      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#00B8DD]/40 hover:shadow-md transition-all group cursor-pointer">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${role.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{role.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{role.sub}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. TESTIMONIALS SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="success" className="mb-3">ĐÁNH GIÁ TỪ NGƯỜI DÙNG</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Cộng Đồng Nói Gì Về Schoolify?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.08)}>
                <div className="h-full p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400 mb-3.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-4 h-4 ${j < t.stars ? 'fill-current' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`}
                        />
                      ))}
                      {t.stars < 5 && (
                        <span className="ml-1.5 text-[11px] font-semibold text-slate-500">{t.stars}/5</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic mb-5">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-2 ring-[#00B8DD]/30 text-white font-black text-sm shrink-0 ${t.avatarColor}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. FINAL CALL TO ACTION BANNER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00B8DD] via-[#009BBD] to-[#0A1E38] p-10 sm:p-16 text-center shadow-2xl shadow-[#00B8DD]/25">
              <div className="relative z-10">
                <Badge className="mb-4 bg-white/20 text-white border-0 font-bold backdrop-blur-sm">
                  <Zap className="w-3.5 h-3.5 mr-1 text-amber-300 fill-amber-300" />
                  Khởi Tạo Trường Học Số Chỉ Trong 5 Phút
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  Sẵn Sàng Số Hóa Trường Học Của Bạn?
                </h2>
                <p className="text-cyan-50 text-sm sm:text-base max-w-xl mx-auto mb-8">
                  Tham gia cùng hơn 500 trường học và hàng nghìn giáo viên đang nâng tầm trải nghiệm giáo dục K-12 với Schoolify.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 shadow-xl"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Đăng Ký Dùng Thử Miễn Phí
                    </Button>
                  </Link>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-full sm:w-auto text-white hover:bg-white/10 border border-white/25 px-8 font-bold"
                    >
                      Xem Bảng Giá SaaS
                    </Button>
                  </Link>
                </div>
                <p className="mt-6 text-xs text-cyan-100">
                  ✓ Miễn phí 14 ngày &nbsp;·&nbsp; ✓ Không cần thẻ tín dụng &nbsp;·&nbsp; ✓ Hỗ trợ triển khai 24/7
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
