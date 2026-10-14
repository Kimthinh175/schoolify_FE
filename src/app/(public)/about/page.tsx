'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Award,
  Users,
  School,
  ShieldCheck,
  Target,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Heart,
  Globe,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

export default function AboutPage() {
  const CORE_VALUES = [
    {
      icon: Target,
      title: 'Học Tập Phân Hóa Năng Lực',
      desc: 'Mỗi học sinh sở hữu lộ trình cá nhân hóa từ Cơ bản, Trung bình đến Nâng cao và HSG, xóa bỏ định kiến học vẹt hay quá tải.',
      color: 'text-[#00B8DD] bg-[#E6F8FC] dark:bg-cyan-950/40 border-[#00B8DD]/30',
    },
    {
      icon: Compass,
      title: 'Chuẩn GDPT 2018 Bộ GD&ĐT',
      desc: 'Toàn bộ ngân hàng câu hỏi, bài giảng và ma trận đề thi bám sát cấu trúc đề thi Tốt nghiệp THPT và kỳ thi Đánh giá năng lực mới nhất.',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800',
    },
    {
      icon: Rocket,
      title: 'Khảo Thí Thích Ứng & AI',
      desc: 'Công nghệ phân bổ câu hỏi thông minh giúp đánh giá đúng lỗ hổng kiến thức và đề xuất ôn tập ngắt quãng (Spaced Repetition).',
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800',
    },
    {
      icon: Heart,
      title: 'Động Lực Từ Gamification',
      desc: 'Hệ thống tích lũy Kim Cương 💎, Bảng Vàng danh dự thi đua và đổi quà học tập thực tế giúp học sinh chủ động say mê học bài.',
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800',
    },
  ];

  const STATS = [
    { value: '50,000+', label: 'Học sinh đang luyện tập', icon: Users },
    { value: '1,200+', label: 'Thầy cô & Chuyên gia biên soạn', icon: BookOpen },
    { value: '120+', label: 'Trường học & Trung tâm tin dùng', icon: School },
    { value: '98.5%', label: 'Đạt điểm trên trung bình thi THPT', icon: Award },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
      {/* ── HERO SECTION ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.div {...fadeUp(0)}>
          <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-3">
            VỀ CHÚNG TÔI • SCHOOLIFY VIỆT NAM
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Số Hóa Không Gian Giảng Dạy, <br className="hidden sm:inline" />
            <span className="text-[#007D99] dark:text-[#00B8DD]">Khai Phóng Tri Thức K-12</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Schoolify là hệ sinh thái giáo dục số kết nối toàn diện giữa <strong>Nhà trường - Giáo viên - Học sinh - Phụ huynh</strong>. Chúng tôi mang đến công cụ tự động hóa khảo thí, phân hóa lộ trình học tập và tạo dựng thói quen tự học bền vững cho thế hệ học sinh Việt Nam.
          </p>
        </motion.div>
      </div>

      {/* ── STATS SECTION ── */}
      <motion.div
        {...fadeUp(0.1)}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-50 via-[#E6F8FC]/60 to-indigo-50/60 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
      >
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="text-center space-y-2 p-3">
              <div className="mx-auto w-10 h-10 rounded-xl bg-[#00B8DD]/15 flex items-center justify-center text-[#007D99] dark:text-[#00B8DD]">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {stat.label}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* ── MISSION & VISION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div {...fadeUp(0.1)} className="space-y-5">
          <Badge variant="outline" className="border-[#00B8DD] text-[#007D99] dark:text-[#00B8DD] font-bold">
            SỨ MỆNH & TẦM NHÌN
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Mọi Học Sinh Đều Xứng Đáng Có Một Người Bạn Đồng Hành Đúng Trình Độ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Chúng tôi tin rằng không có học sinh kém, chỉ có phương pháp tiếp cận chưa tương thích với tốc độ tiếp thu của từng em. Schoolify ứng dụng ma trận tạo đề chuẩn và phương pháp lặp lại ngắt quãng để mỗi buổi học trở thành một bước tiến vững chắc.
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% ngân hàng câu hỏi được biên soạn và thẩm định theo SGK mới (Kết Nối Tri Thức, Cánh Diều, Chân Trời Sáng Tạo).',
              'Đầy đủ các cấp độ từ Cơ bản SGK, Trung bình học kỳ đến Nâng cao và Bồi dưỡng Học sinh Giỏi.',
              'Tự động tổng hợp sổ liên lạc trực tuyến giúp phụ huynh đồng hành cùng con mọi lúc, mọi nơi.',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)}>
          <Card className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B8DD]/20 blur-3xl rounded-full pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#00B8DD] flex items-center justify-center text-slate-950 font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Cam Kết Chất Lượng Sư Phạm</h3>
                <span className="text-xs text-slate-400">Được cố vấn bởi các thầy cô trường THPT Chuyên</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              &ldquo;Mục tiêu của Schoolify không chỉ là cung cấp bài tập, mà là trao công cụ rèn luyện tư duy tự chủ, khả năng phân tích logic và sự tự tin đối diện các kỳ thi lớn cho học sinh Việt Nam.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Hội Đồng Cố Vấn Sư Phạm K-12</span>
              <span className="text-[#00B8DD] font-bold">Schoolify Education</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── 4 CORE PILLARS ── */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold">
            TRỤ CỘT CÔNG NGHỆ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            4 Nền Tảng Giá Trị Tạo Nên Schoolify
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div key={idx} {...fadeUp(idx * 0.08)}>
                <Card className="p-6 h-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between hover:shadow-lg hover:border-[#00B8DD] transition-all">
                  <div>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${val.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CALL TO ACTION STRIP ── */}
      <motion.div
        {...fadeUp(0.1)}
        className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0A1E38] to-slate-900 text-white text-center space-y-5 border border-slate-800 shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#00B8DD]/10 blur-2xl pointer-events-none" />
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
          Sẵn Sàng Trải Nghiệm Học Tập Số Hóa Ngay Hôm Nay?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Bắt đầu luyện tập miễn phí với cấp độ Cơ Bản SGK hoặc đăng ký tài khoản để đồng bộ kết quả và nhận kim cương thưởng!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/#kho-mon-hoc">
            <Button className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-black rounded-xl px-6" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Bắt Đầu Luyện Đề Miễn Phí
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:text-white rounded-xl">
              Xem Gói Đăng Ký
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
