'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Sliders,
  BarChart3,
  GraduationCap,
  Users,
  HeartHandshake,
  BookOpen,
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  Target,
  Layers,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { HeroBackground } from '@/components/features/home/HeroBackground';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-[#00B8DD]/20 selection:text-slate-900 dark:selection:text-white transition-colors duration-200">
      {/* ------------------------------------------------------------ */}
      {/* 1. HERO SECTION: GIỚI THIỆU SÚC TÍCH & NÚT DẪN VÀO LUYỆN THI */}
      {/* ------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden min-h-[calc(100svh-4rem)] flex items-start pt-10 sm:pt-20 pb-36 sm:pb-52 text-slate-900 dark:text-white">
        {/* Background động: hành trình học tập thân thiện */}
        <HeroBackground />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold text-[#007D99] dark:text-cyan-200 bg-white/90 dark:bg-white/10 ring-1 ring-cyan-200 dark:ring-cyan-300/30 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#00B8DD] opacity-75 animate-ping motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00B8DD]" />
              </span>
              Nền Tảng Khảo Thí &amp; Luyện Thi Thông Minh Thế Hệ Mới
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-3xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]"
          >
            Bứt Phá Điểm Số Với{' '}
            <motion.span
              className="bg-gradient-to-r from-[#007D99] via-[#00A3C4] to-[#007D99] dark:from-[#00B8DD] dark:via-cyan-200 dark:to-[#00B8DD] bg-[length:200%_auto] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              Ma Trận Đề Thi Thông Minh
            </motion.span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.15)}
            className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
          >
            Schoolify chuẩn hóa câu hỏi theo <strong className="text-slate-900 dark:text-white">4 mức độ nhận thức (Bloom)</strong> và từng <strong className="text-slate-900 dark:text-white">chương học SGK GDPT 2018</strong>. Giúp học sinh học đúng trọng tâm, lấp đúng lỗ hổng và nâng điểm vững vàng từ Cơ bản đến Học sinh giỏi.
          </motion.p>

          {/* Call to Actions */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/luyen-thi" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-black text-sm sm:text-base px-7 py-5 sm:py-6 rounded-2xl shadow-lg shadow-cyan-500/25 transition-all group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2"
              >
                <span>Vào Cổng Luyện Thi Ngay</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a href="#van-de" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-slate-700 dark:text-white bg-white/90 dark:bg-white/5 border-slate-200 dark:border-white/20 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md font-semibold text-sm sm:text-base px-6 py-5 sm:py-6 rounded-2xl shadow-sm cursor-pointer"
              >
                Tìm Hiểu Giải Pháp &amp; Lợi Ích
              </Button>
            </a>
          </motion.div>

          {/* Quick Metrics Bar - Compact on Mobile */}
          <motion.div
            {...fadeUp(0.25)}
            className="pt-4 sm:pt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto text-left"
          >
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm">
              <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">12+</div>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Môn học K-12 toàn diện</div>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm">
              <div className="text-base sm:text-2xl font-black text-[#007D99] dark:text-[#00B8DD]">4 Cấp Độ</div>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Chuẩn Bloom GDPT 2018</div>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm">
              <div className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Free</div>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Cấp độ Cơ bản SGK</div>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm">
              <div className="text-base sm:text-2xl font-black text-amber-600 dark:text-amber-400">+1.5 - 3đ</div>
              <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Tiến bộ sau 4 tuần</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 2. PHẦN 1: VẤN ĐỀ (THE PROBLEM)                              */}
      {/* ------------------------------------------------------------ */}
      <section id="van-de" className="py-16 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="danger" className="text-xs font-semibold uppercase tracking-wider">
              VẤN ĐỀ HIỆN TẠI
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Tại Sao Học Sinh Luyện Thi Cật Lực Nhưng Điểm Vẫn Không Tăng?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Phương pháp ôn luyện truyền thống và các ngân hàng đề đại trà trên mạng đang bộc lộ 3 rào cản nghiêm trọng:
            </p>
          </div>

          {/* 3 Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vấn đề 1 */}
            <motion.div {...fadeUp(0)}>
              <Card className="p-6 h-full border-rose-100 dark:border-rose-950/40 bg-gradient-to-b from-rose-50/40 to-white dark:from-rose-950/10 dark:to-slate-900 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Ngân hàng đề trôi nổi, sai lệch ma trận
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Đề thi tràn lan trên mạng không bám sát cấu trúc mới của Bộ GD&amp;ĐT. Câu hỏi chắp vá, không rõ tỉ lệ Nhận biết – Thông hiểu – Vận dụng, khiến học sinh mất phương hướng và ôn lệch tủ.
                  </p>
                </div>
                <div className="pt-4 border-t border-rose-100 dark:border-rose-950/30 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Hậu quả: Làm nhiều đề nhưng đi thi điểm vẫn thấp.
                </div>
              </Card>
            </motion.div>

            {/* Vấn đề 2 */}
            <motion.div {...fadeUp(0.1)}>
              <Card className="p-6 h-full border-amber-100 dark:border-amber-950/40 bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/10 dark:to-slate-900 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Bị &quot;ngợp&quot; &amp; thiếu lộ trình cá nhân hóa
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Học sinh không biết mình đang hổng kiến thức ở chương nào, cấp độ nào. Làm bài quá dễ thì lãng phí thời gian, gặp bài quá khó thì chán nản và mất động lực học tập.
                  </p>
                </div>
                <div className="pt-4 border-t border-amber-100 dark:border-amber-950/30 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Hậu quả: Tốn thời gian dàn trải, không lấp trúng chỗ hổng.
                </div>
              </Card>
            </motion.div>

            {/* Vấn đề 3 */}
            <motion.div {...fadeUp(0.2)}>
              <Card className="p-6 h-full border-purple-100 dark:border-purple-950/40 bg-gradient-to-b from-purple-50/40 to-white dark:from-purple-950/10 dark:to-slate-900 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Thầy cô &amp; phụ huynh thiếu công cụ đo lường
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Giáo viên mất hàng giờ để soạn và chia tỉ lệ câu hỏi thủ công. Phụ huynh mơ hồ về năng lực thực chất của con, chỉ biết điểm số cuối kỳ mà không rõ con cần hỗ trợ cụ thể ở đâu.
                  </p>
                </div>
                <div className="pt-4 border-t border-purple-100 dark:border-purple-950/30 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  Hậu quả: Quá tải cho giáo viên, tốn kém chi phí học thêm.
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 3. PHẦN 2: GIẢI PHÁP (THE SOLUTION)                          */}
      {/* ------------------------------------------------------------ */}
      <section id="giai-phap" className="py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="default" className="text-xs font-semibold uppercase tracking-wider">
              GIẢI PHÁP TỪ SCHOOLIFY
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Công Nghệ Ma Trận Đề Tự Động Hóa Toàn Diện
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Schoolify biến việc luyện thi thành một lộ trình khoa học, chuẩn xác và hiệu quả vượt bậc:
            </p>
          </div>

          {/* 3 Pillars Solution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Giải pháp 1 */}
            <motion.div {...fadeUp(0)}>
              <Card className="p-6 h-full border-cyan-100 dark:border-cyan-950/50 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center font-bold">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Ma Trận Đề Tự Động Phân Bổ 4 Cấp Độ Bloom
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hệ thống tự động phối trộn câu hỏi theo chuẩn tỉ lệ: <strong>Nhận biết (40%) • Thông hiểu (30%) • Vận dụng (20%) • Vận dụng cao (10%)</strong> gắn liền với từng chương học SGK GDPT 2018.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chuẩn cấu trúc Bộ GD&amp;ĐT 2025
                </div>
              </Card>
            </motion.div>

            {/* Giải pháp 2 */}
            <motion.div {...fadeUp(0.1)}>
              <Card className="p-6 h-full border-emerald-100 dark:border-emerald-950/50 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Thang Phân Tầng Năng Lực Linh Hoạt (Từ Cơ Bản Đến HSG)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    6 cấp độ luyện thi được thiết kế khoa học: <strong>Cơ bản</strong> (SGK) → <strong>Trung bình</strong> (học kỳ/tốt nghiệp) → <strong>Nâng cao</strong> (9-10đ) → <strong>ĐGNL</strong> → <strong>HSG Tỉnh &amp; Quốc Gia</strong>. Học sinh ở mức nào cũng có bài luyện vừa sức.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Không lo quá dễ hoặc quá khó
                </div>
              </Card>
            </motion.div>

            {/* Giải pháp 3 */}
            <motion.div {...fadeUp(0.2)}>
              <Card className="p-6 h-full border-purple-100 dark:border-purple-950/50 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Báo Cáo Chẩn Đoán &amp; Lấp Lỗ Hổng Tức Thì
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Chấm điểm và phân tích câu sai ngay sau khi nộp bài. Hệ thống chỉ rõ học sinh hổng ở chương nào, gợi ý phương pháp giải chi tiết và câu hỏi tương tự để sửa sai triệt để.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tiến bộ rõ rệt sau từng đề
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 4. PHẦN 3: LỢI ÍCH KHI XÀI WEB NÀY (THE BENEFITS)            */}
      {/* ------------------------------------------------------------ */}
      <section id="loi-ich" className="py-16 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="success" className="text-xs font-semibold uppercase tracking-wider">
              LỢI ÍCH THỰC TẾ
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Giá Trị Thiết Thực Cho Từng Đối Tượng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Dù bạn là học sinh, thầy cô hay phụ huynh, Schoolify mang đến giải pháp tối ưu nhất:
            </p>
          </div>

          {/* 3 Audience Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Dành cho Học sinh */}
            <motion.div {...fadeUp(0)}>
              <Card className="p-6 h-full border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-primary">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Dành Cho Học Sinh</h3>
                      <span className="text-xs text-slate-500">Tự tin bứt phá điểm số</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Tăng 1.5 - 3 điểm</strong> sau 4 tuần ôn luyện đúng trọng tâm.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Rèn phản xạ phòng thi</strong> với đồng hồ đếm ngược và barem điểm chuẩn.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Tích kim cương 💎 đổi quà</strong> thực tế sau mỗi bài kiểm tra hoàn thành.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Hoàn toàn miễn phí</strong> cấp độ Cơ bản, không ép buộc nâng cấp gói.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <Link href="/luyen-thi" className="w-full">
                    <Button size="sm" className="w-full bg-[#00B8DD] hover:bg-[#009fb0] text-white rounded-xl text-xs font-bold">
                      Vào Luyện Thi Ngay
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* 2. Dành cho Giáo viên & Nhà trường */}
            <motion.div {...fadeUp(0.1)}>
              <Card className="p-6 h-full border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Dành Cho Giáo Viên</h3>
                      <span className="text-xs text-slate-500">Giảm tải áp lực biên soạn đề</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Tiết kiệm 90% thời gian</strong> biên soạn ma trận và trộn mã đề thi.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Ngân hàng câu hỏi chuẩn hóa</strong> thẩm định bởi hội đồng chuyên môn.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Giám sát phổ điểm lớp học</strong> theo thời gian thực chỉ với 1 click.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Xuất đề thi chuẩn barem</strong> định dạng khảo thí của Bộ GD&amp;ĐT.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <Link href="/login/teacher" className="w-full">
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold">
                      Cổng Dành Cho Giáo Viên
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* 3. Dành cho Phụ huynh */}
            <motion.div {...fadeUp(0.2)}>
              <Card className="p-6 h-full border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Dành Cho Phụ Huynh</h3>
                      <span className="text-xs text-slate-500">Đồng hành cùng con nhẹ nhàng</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Báo cáo tiến bộ minh bạch</strong>, nắm rõ năng lực thực tế của con.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Không còn áp lực đôn đốc</strong> nhờ lộ trình tự học hứng khởi có thưởng.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Tiết kiệm chi phí học thêm</strong> tràn lan không mang lại hiệu quả.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>An tâm con học đúng chuẩn</strong> chương trình Giáo dục Phổ thông 2018.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <Link href="/login/parent" className="w-full">
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold">
                      Sổ Liên Lạc Điện Tử
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 5. CALL TO ACTION BANNER (CHUYỂN HƯỚNG VÀO /LUYEN-THI)        */}
      {/* ------------------------------------------------------------ */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#0A1E38] via-slate-950 to-[#0A1E38] text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#00B8DD]/20 blur-3xl pointer-events-none rounded-full" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold px-3 py-1">
            BẮT ĐẦU NGAY HÔM NAY
          </Badge>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Sẵn Sàng Chinh Phục Điểm Số Mơ Ước Cùng Schoolify?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm lg:text-base max-w-xl mx-auto leading-relaxed">
            Hàng ngàn bài luyện tập và đề thi chuẩn ma trận theo từng khối lớp đang chờ đón bạn tại cổng luyện thi. Miễn phí trải nghiệm cấp độ Cơ bản ngay bây giờ!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/luyen-thi" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#00B8DD] hover:bg-[#009fb0] text-slate-950 font-black text-sm sm:text-base px-8 py-6 rounded-2xl shadow-xl shadow-[#00B8DD]/30 transition-all group"
              >
                <span>Bắt Đầu Luyện Thi Miễn Phí (schoolify.top/luyen-thi)</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Chuẩn SGK 2018
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Không cần thẻ tín dụng
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Luyện thử tức thì
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
