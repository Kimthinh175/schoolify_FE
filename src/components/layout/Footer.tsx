import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  PlayCircle,
  Shield,
  CheckCircle2,
} from 'lucide-react';

const FOOTER_COLUMNS = {
  practice: [
    { label: 'Luyện Đề Trắc Nghiệm 2025', href: '/luyen-thi' },
    { label: 'Gia Sư AI Step-by-Step', href: '/luyen-thi' },
    { label: 'Lộ Trình Học Tập Cá Nhân Hóa', href: '/student/roadmap' },
    { label: 'Bảng Vàng Thi Đua K-12', href: '/leaderboard' },
    { label: 'Tin Tức & Mẹo Ôn Thi', href: '/news' },
  ],
  courses: [
    { label: 'Luyện Đề Toán Học', href: '/student/practice/toan-hoc/basic' },
    { label: 'Luyện Lập Trình Tin Học', href: '/student/practice/tin-hoc/basic' },
    { label: 'Diễn Đàn Hỏi Đáp', href: '/forum' },
    { label: 'Gói Nâng Cấp Hội Viên', href: '/pricing' },
  ],
  portals: [
    { label: 'Cổng Luyện Thi K-12', href: '/luyen-thi' },
    { label: 'Học Sinh & Hồ Sơ Luyện Tập', href: '/student' },
    { label: 'Cửa Hàng Đổi Thưởng', href: '/student/rewards' },
    { label: 'Đăng Nhập / Đăng Ký', href: '/login' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Main Footer Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 py-16">

          {/* ── Brand Column (Spans 2 cols on lg) ── */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group w-fit">
              <img
                src="/am-ban.png"
                alt="Schoolify"
                className="h-11 w-auto object-contain group-hover:scale-102 transition-transform"
              />
              <span className="text-xs font-semibold text-[#00B8DD] mt-2 block">
                Luyện thi thông minh, Chinh phục điểm cao.
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              <strong className="text-slate-200">&ldquo;Nền tảng luyện thi trực tuyến K-12 tích hợp Gia sư AI.&rdquo;</strong> Đề thi chuẩn cấu trúc GDPT 2018-2025, phân tích lỗ hổng kiến thức và lộ trình ôn tập cá nhân hóa cho học sinh.
            </p>

            {/* Contact Details */}
            <div className="space-y-2.5 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tổng đài tư vấn: <strong className="text-white font-bold">1900 6868</strong> (8:00 - 21:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00B8DD] shrink-0" />
                <span>Email hỗ trợ: <strong className="text-slate-200">contact@schoolify.edu.vn</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Trụ sở: Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Globe, href: '#', label: 'Website' },
                { Icon: PlayCircle, href: '#', label: 'YouTube' },
                { Icon: MessageCircle, href: '#', label: 'Cộng đồng' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9 rounded-xl flex items-center justify-center border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white hover:border-[#00B8DD] hover:bg-[#00B8DD]/20 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Luyện Thi & AI ── */}
          <div>
            <h4 className="text-xs font-bold text-[#00B8DD] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />
              Luyện Thi Thông Minh
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_COLUMNS.practice.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Khóa Học & Cộng Đồng ── */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Khóa Học &amp; Cộng Đồng
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_COLUMNS.courses.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Phân Hệ Học Tập ── */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Không Gian Học Tập
            </h4>
            <ul className="space-y-2 text-xs">
              {FOOTER_COLUMNS.portals.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-300">Schoolify Inc.</strong> — Số hóa trường học, Khai phóng tri thức. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Hệ Thống Sẵn Sàng (Uptime 99.9%)
            </span>
            <span>Bảo mật SSL 256-bit</span>
            <span>Chuẩn Giáo Dục K-12</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
