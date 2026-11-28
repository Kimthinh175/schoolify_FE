'use client';

import * as React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Globe, PlayCircle, MessageCircle } from 'lucide-react';

const FOOTER_NAV = {
  exam: {
    title: 'Khảo Thí & Luyện Đề',
    links: [
      { label: 'Đề thi Toán THPT (10–12)', href: '/luyen-thi' },
      { label: 'Đề thi Tin học THPT', href: '/luyen-thi' },
      { label: '3 Dạng thức trắc nghiệm 2025', href: '/luyen-thi' },
      { label: 'Sinh đề ma trận tự động', href: '/luyen-thi' },
      { label: 'Chuyên đề & Chữa lỗi sai', href: '/luyen-thi' },
    ],
  },
  community: {
    title: 'Đấu Trường & Học Viên',
    links: [
      { label: 'Bảng Xếp Hạng Toàn Quốc', href: '/leaderboard' },
      { label: 'Diễn Đàn Học Thuật', href: '/forum' },
      { label: 'Gói Năng Lượng Tia Sáng', href: '/pricing' },
      { label: 'Hồ Sơ & Thành Tựu', href: '/student/achievements' },
      { label: 'Cửa Hàng Ngọc Tri Thức', href: '/student/rewards' },
    ],
  },
  about: {
    title: 'Về Schoolify',
    links: [
      { label: 'Giới thiệu nền tảng', href: '/about' },
      { label: 'Tin tức & Cẩm nang ôn thi', href: '/news' },
      { label: 'Hỗ trợ & Góp ý học thuật', href: '/about' },
      { label: 'Điều khoản sử dụng', href: '/about' },
      { label: 'Chính sách bảo mật', href: '/about' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14">
          {/* Brand Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group w-fit">
              <img
                src="/am-ban.png"
                alt="Schoolify"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-102"
              />
              <span className="text-xs font-semibold text-[#00B8DD] mt-2 block tracking-wide">
                Nền tảng khảo thí &amp; luyện thi Toán, Tin học THPT thế hệ mới.
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Hệ thống khảo thí thông minh chuẩn cấu trúc đề thi 2025 của Bộ GD&amp;ĐT. Tích hợp Gia Sư AI 24/7 phân tích lỗi sai tức thì, cấp 9 Tia Sáng mỗi ngày và đấu trường đua top học tập sôi động.
            </p>

            {/* Quick Contact Info */}
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                <span>
                  Tổng đài hỗ trợ:{' '}
                  <strong className="text-slate-200 font-semibold">1900 6868</strong> (08:00 – 21:00)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                <span>
                  Email học thuật:{' '}
                  <strong className="text-slate-200 font-semibold">hotro@schoolify.vn</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                <span>Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
            </div>

            {/* Social channels */}
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { Icon: Globe, href: '#', label: 'Cổng thông tin' },
                { Icon: PlayCircle, href: '#', label: 'Kênh bài giảng' },
                { Icon: MessageCircle, href: '/forum', label: 'Cộng đồng học thuật' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white hover:border-[#00B8DD] hover:bg-[#00B8DD]/15 transition-all cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Khảo Thí & Luyện Đề */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />
              {FOOTER_NAV.exam.title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAV.exam.links.map((item) => (
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

          {/* Column 2: Đấu Trường & Học Viên */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />
              {FOOTER_NAV.community.title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAV.community.links.map((item) => (
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

          {/* Column 3: Về Schoolify */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />
              {FOOTER_NAV.about.title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAV.about.links.map((item) => (
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

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-300">Schoolify</strong> — Khảo thí &amp; Luyện thi Toán, Tin THPT chuẩn ma trận 2025. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#00B8DD] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B8DD] animate-pulse" />
              Chuẩn Ma Trận 2025
            </span>
            <span>•</span>
            <span>Gia Sư AI 24/7</span>
            <span>•</span>
            <span>Bảo mật SSL 256-bit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
