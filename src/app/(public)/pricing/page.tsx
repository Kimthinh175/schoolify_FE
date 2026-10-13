'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Sparkles,
  Zap,
  Building2,
  HelpCircle,
  QrCode,
  CheckCircle2,
  Gem,
  Bot,
  Flame,
  Crown,
  FileCheck2,
  TrendingUp,
  BrainCircuit,
  Gift,
  ArrowRight,
  ShieldCheck,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Users,
  Copy,
  Target,
  Compass,
  Award,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_PACKAGES } from '@/services/mock/data';
import { SubscriptionPackage } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Gói cước dành riêng cho học sinh
interface StudentPackage {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number; // Giá tương đương / tháng khi đóng cả năm
  dailyPoints: number; // Số điểm thưởng cộng mỗi ngày
  yearlyBonusTokens?: number; // Quà tặng Kim cương khi kích hoạt gói năm
  isPopular?: boolean;
  isVip?: boolean;
  features: {
    text: string;
    isAi?: boolean;
    isPoints?: boolean;
    highlight?: boolean;
  }[];
  ctaText: string;
}

const STUDENT_PACKAGES: StudentPackage[] = [
  {
    id: 'student-free',
    name: 'Tân Binh',
    badge: 'Khởi Động Miễn Phí',
    tagline: 'Khảo sát năng lực ban đầu, làm quen với phương pháp luyện thi thông minh.',
    priceMonthly: 0,
    priceYearly: 0,
    dailyPoints: 5,
    features: [
      { text: '+5 💎 Điểm thưởng mỗi ngày khi điểm danh', isPoints: true },
      { text: '10 lượt hỏi Gia Sư AI / tháng (Giải thích câu hỏi)', isAi: true },
      { text: '3 đề thi thử chuẩn cấu trúc GDPT 2018 / tháng' },
      { text: 'Luyện tập trắc nghiệm 4 lựa chọn cơ bản' },
      { text: 'Xem lại kết quả & lịch sử thi khảo sát' },
      { text: 'Đua top Bảng xếp hạng tuần cùng cộng đồng' },
    ],
    ctaText: 'Đang Sử Dụng Miễn Phí',
  },
  {
    id: 'student-pro',
    name: 'Chiến Binh Pro',
    badge: '🔥 Phổ Biến Nhất • Bứt Phá 8+',
    tagline: 'Luyện thi chuyên sâu toàn diện, bứt phá từ 6-7 lên 8-9 điểm vững chắc.',
    priceMonthly: 99000,
    priceYearly: 79000,
    dailyPoints: 50,
    yearlyBonusTokens: 500,
    isPopular: true,
    features: [
      { text: '+50 💎 Điểm thưởng MỖI NGÀY tự động vào ví (1.500 💎/tháng)', isPoints: true, highlight: true },
      { text: 'Gia Sư AI Giải Đề 24/7 Không Giới Hạn (Hướng dẫn từng bước & gỡ bẫy)', isAi: true, highlight: true },
      { text: 'Sinh Đề Thi AI Chuẩn Ma Trận 2025 Không Giới Hạn (4 Danh mục Bộ GD&ĐT)', isAi: true, highlight: true },
      { text: 'Radar AI Quét Lỗ Hổng Kiến Thức & Gợi ý bài tập khắc phục tức thì', isAi: true },
      { text: 'Luyện đề đủ 4 phần: Trắc nghiệm, Đúng/Sai, Điền số & Tự luận' },
      { text: 'x2 Tốc độ nhận EXP & Điểm thưởng đua top Schoolify Store', isPoints: true },
      { text: 'Tải PDF Đề thi & Lời giải chi tiết KaTeX chuẩn đẹp' },
      { text: '100% Không quảng cáo & Phòng thi tập trung chuyên sâu' },
    ],
    ctaText: 'Nâng Cấp Gói Pro Ngay',
  },
  {
    id: 'student-vip',
    name: 'Thủ Khoa VIP',
    badge: '👑 Mục Tiêu 9+ • Top 1% Thủ Khoa',
    tagline: 'Chinh phục Top 1% Thủ khoa, ĐGNL ĐHQG, ĐGTD Bách Khoa và giải HSG.',
    priceMonthly: 189000,
    priceYearly: 149000,
    dailyPoints: 150,
    yearlyBonusTokens: 1000,
    isVip: true,
    features: [
      { text: '+150 💎 Điểm thưởng MỖI NGÀY (4.500 💎/tháng) + Tặng ngay 1.000 💎', isPoints: true, highlight: true },
      { text: 'AI Suy Luận Sâu (Deep-Reasoning AI): Giải câu Vận Dụng Cao & mẹo Casio', isAi: true, highlight: true },
      { text: 'Kho Đề Độc Quyền VIP: ĐGNL ĐHQG Hà Nội/HCM, ĐGTD Bách Khoa & HSG', highlight: true },
      { text: 'Lộ Trình AI Tự Động Cá Nhân Hóa Ôn Nước Rút Từng Ngày', isAi: true },
      { text: 'Chấm Tự Luận Bằng AI & Barem Bảng Điểm 4 Phần Chuẩn Bộ', isAi: true },
      { text: 'Server AI Ưu Tiên VIP (Băng thông riêng, phản hồi < 1 giây)', isAi: true },
      { text: 'Đặc quyền đổi quà hiện vật độc quyền trong Schoolify Store', isPoints: true },
      { text: 'Hỗ trợ học thuật 1-1 chuyên sâu từ Ban chuyên môn' },
    ],
    ctaText: 'Trở Thành Thủ Khoa VIP',
  },
];

// So sánh chi tiết từng tính năng
const COMPARISON_ROWS = [
  {
    category: '💎 Điểm & Phần Thưởng Hàng Ngày',
    items: [
      { title: 'Điểm thưởng mỗi ngày khi đăng nhập', free: '+5 💎/ngày', pro: '+50 💎/ngày', vip: '+150 💎/ngày' },
      { title: 'Tổng điểm nhận được / tháng', free: '150 💎', pro: '1.500 💎', vip: '4.500 💎' },
      { title: 'Thưởng nạp gói năm', free: '—', pro: '+500 💎 ngay', vip: '+1.000 💎 ngay' },
      { title: 'Hệ số EXP Bảng xếp hạng', free: 'x1.0', pro: 'x2.0 (Nhân đôi)', vip: 'x3.0 (Nhân ba)' },
      { title: 'Đổi quà vật phẩm Schoolify Store', free: 'Giới hạn', pro: 'Mở khóa 80%', vip: 'Toàn bộ 100%' },
    ],
  },
  {
    category: '🤖 Công Nghệ & Gia Sư AI 2026',
    items: [
      { title: 'Gia Sư AI Giải Đề 24/7', free: '10 lượt/tháng', pro: 'Không giới hạn', vip: 'Không giới hạn (Ưu tiên)' },
      { title: 'Mô hình AI Suy Luận Sâu (VDC)', free: '—', pro: 'Tiêu chuẩn', vip: 'Deep Reasoning VIP' },
      { title: 'Phân tích lỗi sai từng bước', free: 'Vắn tắt', pro: 'Chi tiết từng bước', vip: 'Chi tiết + Bẫy trắc nghiệm' },
      { title: 'Radar AI Quét Lỗ Hổng Kiến Thức', free: '—', pro: '✓ Đầy đủ', vip: '✓ Dự đoán điểm ĐGNL' },
      { title: 'Tốc độ phản hồi AI Server', free: 'Bình thường', pro: 'Nhanh (2s)', vip: 'Siêu tốc (< 1s)' },
    ],
  },
  {
    category: '📝 Đề Thi & Ma Trận Bộ GD&ĐT 2025',
    items: [
      { title: 'Số lượt thi thử / tháng', free: '3 đề/tháng', pro: 'Không giới hạn', vip: 'Không giới hạn' },
      { title: 'Sinh đề AI theo ma trận GDPT 2018', free: '—', pro: '✓ Tự do tạo đề', vip: '✓ Tự do tạo đề VIP' },
      { title: 'Bộ câu hỏi Đúng/Sai & Điền số', free: 'Cơ bản', pro: 'Toàn bộ ngân hàng', vip: 'Toàn bộ + Chuyên sâu' },
      { title: 'Đề thi ĐGNL & ĐGTD Bách Khoa', free: '—', pro: '—', vip: '✓ Kho Độc Quyền VIP' },
      { title: 'Tải PDF Đề & Lời giải KaTeX', free: '—', pro: '✓ Đầy đủ', vip: '✓ Bản In Nét Cao Cấp' },
    ],
  },
];

const FAQS = [
  {
    q: 'Điểm thưởng (Kim Cương 💎) mỗi ngày dùng để làm gì?',
    a: 'Điểm thưởng được tự động cộng vào ví của bạn mỗi ngày khi đăng nhập vào Schoolify. Bạn có thể sử dụng điểm để mở khóa các bộ đề thi VIP độc quyền, mua thêm lượt tạo đề ma trận nâng cao, hoặc đổi lấy các phần quà hiện vật thực tế (balo chống gù, áo thun Thủ khoa, sổ tay công thức GDPT 2018) trong Kho Thưởng Schoolify Store.',
  },
  {
    q: 'Gia sư AI Schoolify có thể giải đáp những môn học nào?',
    a: 'Gia sư AI được đào tạo chuyên sâu theo chương trình GDPT 2018 của Bộ GD&ĐT cho các môn: Toán học, Vật lí, Hóa học, Sinh học, Tiếng Anh, Lịch sử, Địa lí, GDKT & Pháp Luật và Tin học từ Lớp 10 đến Lớp 12.',
  },
  {
    q: 'Tôi có thể chuyển đổi giữa thanh toán theo Tháng và theo Năm không?',
    a: 'Hoàn toàn được! Khi chọn thanh toán theo Năm, bạn được tiết kiệm lên tới 25% chi phí kèm quà tặng từ 500 đến 1.000 Kim Cương lập tức vào ví.',
  },
  {
    q: 'Mô hình AI Deep-Reasoning trên gói Thủ Khoa VIP có gì đặc biệt?',
    a: 'Mô hình AI Deep-Reasoning được tinh chỉnh riêng để giải quyết các câu hỏi Vận Dụng Cao (mục tiêu 9 - 10 điểm), các đề thi Đánh Giá Năng Lực (ĐHQG HN, ĐHQG HCM) và Đánh Giá Tư Duy Bách Khoa. AI chỉ rõ 4 bước tư duy bản chất, mẹo bấm máy tính Casio fx-880 và các cạm bẫy tâm lý thường gặp trong đề thi.',
  },
  {
    q: 'Trường học hoặc Trung tâm gia sư muốn mua tài khoản số lượng lớn thì thế nào?',
    a: 'Bạn chỉ cần chuyển sang tab "Dành Cho Trường Học" để xem các gói SaaS chuyên dụng cho trường học với quản lý giáo viên, học sinh, điểm danh và thư viện bài giảng riêng.',
  },
];

// SVG VietQR Matrix Generator Component
function VietQRVector({ code }: { code: string }) {
  // Generate consistent pseudo-random pattern for QR data matrix based on code
  const size = 25;
  const cells: boolean[][] = React.useMemo(() => {
    const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed = (seed * 31 + code.charCodeAt(i)) % 1000000;
    }

    const nextRand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    // Mark finder patterns (7x7) at (0,0), (0, 18), (18, 0)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[startY + r][startX + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Fill other cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder areas
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= size - 8;
        const inBL = r >= size - 8 && c < 8;
        // Skip center logo area
        const inCenter = r >= 10 && r <= 14 && c >= 10 && c <= 14;

        if (!inTL && !inTR && !inBL && !inCenter && r !== 6 && c !== 6) {
          grid[r][c] = nextRand() > 0.45;
        }
      }
    }

    return grid;
  }, [code]);

  return (
    <div className="relative w-48 h-48 bg-white p-2.5 rounded-2xl shadow-inner border border-slate-200">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full shape-rendering-crispEdges">
        {cells.map((row, r) =>
          row.map((filled, c) =>
            filled ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#090D16" /> : null
          )
        )}
      </svg>
      {/* Center Schoolify Brand Gem Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#00B8DD] shadow-md flex items-center justify-center p-1">
          <Gem className="w-5 h-5 text-[#00B8DD] fill-[#00B8DD]" />
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  // Tab chính: 'STUDENT' (Học sinh) hoặc 'SCHOOL' (Trường học)
  const [audienceTab, setAudienceTab] = React.useState<'STUDENT' | 'SCHOOL'>('STUDENT');
  const [isYearly, setIsYearly] = React.useState(false);

  // State Modal thanh toán
  const [selectedStudentPkg, setSelectedStudentPkg] = React.useState<StudentPackage | null>(null);
  const [selectedSchoolPkg, setSelectedSchoolPkg] = React.useState<SubscriptionPackage | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = React.useState(false);
  const [awardedBonus, setAwardedBonus] = React.useState<number>(0);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  // State cho Máy Tính Tích Lũy Điểm (Calculator)
  const [calcDays, setCalcDays] = React.useState<number>(30);

  // State cho AI Showcase Tab
  const [aiShowcaseTab, setAiShowcaseTab] = React.useState<'REASONING' | 'TRAPS' | 'RADAR' | 'STREAK'>('REASONING');

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  // Xử lý xác nhận thanh toán thành công
  const handleConfirmPayment = () => {
    setIsPaidSuccess(true);

    // Tính toán số điểm thưởng được tặng ngay
    let bonusGems = 0;
    if (selectedStudentPkg) {
      if (selectedStudentPkg.id === 'student-pro') {
        bonusGems = isYearly ? 500 : 50;
      } else if (selectedStudentPkg.id === 'student-vip') {
        bonusGems = isYearly ? 1000 : 150;
      }

      // Cập nhật số dư Kim Cương trong ví ngay lập tức
      try {
        const currentBalance = Number(localStorage.getItem('schoolify_user_tokens') || '250');
        const newBalance = currentBalance + bonusGems;
        localStorage.setItem('schoolify_user_tokens', String(newBalance));
        localStorage.setItem('schoolify_active_package', selectedStudentPkg.id);
        window.dispatchEvent(new Event('tokens-updated'));
        setAwardedBonus(bonusGems);
      } catch (err) {
        console.error('Failed to update tokens:', err);
      }

      toast.success(
        `Chúc mừng! Bạn đã nâng cấp thành công gói ${selectedStudentPkg.name}. Đã cộng +${bonusGems} 💎 vào ví!`,
        { duration: 4500 }
      );
    } else if (selectedSchoolPkg) {
      toast.success(`Kích hoạt thành công gói bản quyền trường học ${selectedSchoolPkg.name}!`, { duration: 4000 });
    }
  };

  const handleCloseModal = () => {
    setSelectedStudentPkg(null);
    setSelectedSchoolPkg(null);
    setIsPaidSuccess(false);
    setAwardedBonus(0);
  };

  return (
    <div className="relative overflow-hidden py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glow Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-tr from-[#00B8DD]/15 via-purple-500/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-[#007D99] dark:text-[#00B8DD] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
          <span>Kỷ Nguyên Luyện Thi Thế Hệ Mới • GDPT 2018</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Bứt Phá Điểm Số Cùng <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#00B8DD] via-indigo-500 to-amber-500 bg-clip-text text-transparent">
            Gia Sư AI & Điểm Thưởng Hàng Ngày
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Đăng ký gói thành viên để nhận ngay <strong>+ Điểm thưởng tự động mỗi ngày</strong>, giải đề không giới hạn cùng <strong>Gia sư AI 24/7</strong> và kho đề chuẩn ma trận thi tốt nghiệp 2025.
        </p>

        {/* 1. Phân Loại Đối Tượng: Học Sinh vs Trường Học */}
        <div className="pt-4 flex justify-center">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setAudienceTab('STUDENT')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none',
                audienceTab === 'STUDENT'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md shadow-slate-900/5'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <GraduationCap className={cn('w-4 h-4', audienceTab === 'STUDENT' ? 'text-[#00B8DD]' : 'text-slate-400')} />
              <span>Dành Cho Học Sinh Luyện Thi</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-extrabold uppercase">
                Ưu Đãi Hot
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAudienceTab('SCHOOL')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none',
                audienceTab === 'SCHOOL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md shadow-slate-900/5'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <Building2 className={cn('w-4 h-4', audienceTab === 'SCHOOL' ? 'text-indigo-500' : 'text-slate-400')} />
              <span>Dành Cho Trường Học & Trung Tâm</span>
            </button>
          </div>
        </div>

        {/* 2. Monthly / Yearly Billing Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg transition-all cursor-pointer',
                !isYearly
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              Thanh toán theo Tháng
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer',
                isYearly
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <span>Thanh toán theo Năm</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlight Quick Pill for Daily Points & AI */}
      {audienceTab === 'STUDENT' && (
        <div className="mt-8 max-w-4xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-amber-500/10 border border-[#00B8DD]/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#00B8DD] flex items-center justify-center shrink-0 font-bold shadow-inner">
              <Gem className="w-5 h-5 text-cyan-500 fill-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white block text-sm">
                Cơ Chế Tích Điểm Tự Động Mỗi Ngày
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-xs">
                Đăng nhập mỗi ngày để nhận đến <strong>+150 💎/ngày</strong>. Điểm tích lũy dùng mở đề VIP và đổi quà thực tế tại Store!
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-[#007D99] dark:text-[#00B8DD] text-xs shadow-xs">
              Tích lũy đến 4.500 💎/tháng
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          A. GRID CÁC GÓI HỌC SINH (STUDENT PLANS)
      ======================================================== */}
      {audienceTab === 'STUDENT' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {STUDENT_PACKAGES.map((pkg) => {
            const isPopular = pkg.isPopular;
            const isVip = pkg.isVip;
            const price = isYearly ? pkg.priceYearly : pkg.priceMonthly;

            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <Card
                  className={cn(
                    'relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all w-full',
                    'bg-white dark:bg-slate-900/90 backdrop-blur-sm',
                    isPopular &&
                      'border-2 border-[#00B8DD] shadow-2xl shadow-cyan-500/20 ring-4 ring-[#00B8DD]/15 lg:-translate-y-2',
                    isVip &&
                      'border-2 border-amber-400/90 dark:border-amber-400/60 shadow-2xl shadow-amber-500/20 ring-4 ring-amber-400/15',
                    !isPopular && !isVip && 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  )}
                >
                  {/* Top Badge: Pure styled span for crisp white text */}
                  {pkg.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 py-1 px-4 text-xs font-black uppercase tracking-wider rounded-full shadow-lg border',
                          isPopular &&
                            'bg-gradient-to-r from-[#00B8DD] via-cyan-500 to-indigo-600 text-white border-cyan-300/40 shadow-cyan-500/30 ring-2 ring-white/20',
                          isVip &&
                            'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white border-amber-300/40 shadow-amber-500/30 ring-2 ring-white/20',
                          !isPopular &&
                            !isVip &&
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        )}
                      >
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header gói */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {isVip && <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />}
                        {isPopular && <Flame className="w-5 h-5 text-[#00B8DD] fill-[#00B8DD]" />}
                        <span>{pkg.name}</span>
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 min-h-[32px] leading-relaxed">
                      {pkg.tagline}
                    </p>

                    {/* Price Section */}
                    <div className="mt-5 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                          {price === 0 ? 'Miễn Phí' : formatMoney(price)}
                        </span>
                        {price > 0 && (
                          <span className="text-xs text-slate-500 font-medium">/tháng</span>
                        )}
                      </div>
                      {price > 0 && isYearly && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                          Thanh toán {formatMoney(price * 12)} / năm • Tặng thêm {pkg.yearlyBonusTokens} 💎
                        </p>
                      )}
                    </div>

                    {/* Quota & Daily Bonus Highlights Box */}
                    <div className="mb-6 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 p-4 space-y-2.5 text-xs border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Gem className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400 shrink-0" />
                          Điểm cộng mỗi ngày:
                        </span>
                        <span className="font-black text-[#007D99] dark:text-[#00B8DD] bg-cyan-100/70 dark:bg-cyan-950/80 px-2 py-0.5 rounded-md">
                          +{pkg.dailyPoints} 💎/ngày
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          Gia Sư AI 24/7:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pkg.id === 'student-free' ? '10 câu/tháng' : 'Không giới hạn'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          Sinh đề ma trận 2025:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {pkg.id === 'student-free' ? '3 đề/tháng' : 'Không giới hạn'}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Đặc Quyền Gói Bao Gồm:
                      </p>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                              feat.highlight
                                ? 'bg-emerald-500 text-white'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                          <span
                            className={cn(
                              'leading-snug',
                              feat.highlight && 'font-bold text-slate-900 dark:text-white'
                            )}
                          >
                            {feat.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => {
                      if (pkg.priceMonthly === 0) {
                        toast.info('Bạn đang sử dụng gói Tân Binh Miễn Phí của Schoolify!');
                      } else {
                        setSelectedStudentPkg(pkg);
                      }
                    }}
                    variant={isPopular ? 'primary' : 'outline'}
                    className={cn(
                      'w-full justify-center h-12 text-sm font-bold rounded-xl cursor-pointer shadow-md transition-all',
                      isPopular && 'bg-[#00B8DD] hover:bg-[#009fb0] text-white shadow-cyan-500/25',
                      isVip && 'bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white border-0 shadow-amber-500/25',
                      !isPopular && !isVip && 'border-slate-200 dark:border-slate-700 hover:border-primary'
                    )}
                  >
                    <span>{pkg.ctaText}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          B. MÁY TÍNH TÍCH LŨY ĐIỂM & GIÁ TRỊ AI (INTERACTIVE CALCULATOR)
      ======================================================== */}
      {audienceTab === 'STUDENT' && (
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-indigo-800/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/50 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-[#00B8DD] text-xs font-bold mb-2">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Mô Phỏng Lợi Ích & Điểm Thưởng</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Máy Tính Tích Lũy Điểm & Giá Trị Luyện Thi
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Kéo chọn thời gian bạn dự định đồng hành cùng Schoolify để xem lượng điểm thưởng và giá trị gia sư AI thu về.
                </p>
              </div>

              {/* Selector ngày */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                {[
                  { days: 30, label: '30 Ngày (1 Tháng)' },
                  { days: 90, label: '90 Ngày (Luyện Đề)' },
                  { days: 180, label: '180 Ngày (Học Kỳ)' },
                  { days: 365, label: '365 Ngày (Trọn Khóa)' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setCalcDays(item.days)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      calcDays === item.days
                        ? 'bg-[#00B8DD] text-white shadow-lg shadow-cyan-500/30'
                        : 'text-slate-300 hover:text-white'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Values Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Box 1: Điểm thưởng Pro */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all">
                <div className="flex items-center justify-between text-xs text-cyan-300 mb-2 font-semibold">
                  <span>Gói Chiến Binh Pro</span>
                  <Flame className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  +{(calcDays * 50 + (calcDays >= 365 ? 500 : 0)).toLocaleString()} 💎
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  Tích lũy tự động từ +50 💎/ngày {calcDays >= 365 ? '+ 500 💎 thưởng' : ''}.
                </p>
              </div>

              {/* Box 2: Điểm thưởng VIP */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-400/30 hover:border-amber-400/60 transition-all">
                <div className="flex items-center justify-between text-xs text-amber-300 mb-2 font-semibold">
                  <span>Gói Thủ Khoa VIP</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  +{(calcDays * 150 + (calcDays >= 365 ? 1000 : 0)).toLocaleString()} 💎
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  Tích lũy từ +150 💎/ngày {calcDays >= 365 ? '+ 1.000 💎 thưởng' : ''}.
                </p>
              </div>

              {/* Box 3: Quyền Đổi Quà Store */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-all">
                <div className="flex items-center justify-between text-xs text-indigo-300 mb-2 font-semibold">
                  <span>Đổi Quà Hiện Vật</span>
                  <Gift className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-base sm:text-lg font-black text-white leading-snug">
                  {calcDays <= 30
                    ? 'Sổ tay GDPT 2018 + 5 Đề VIP'
                    : calcDays <= 90
                    ? 'Balo Schoolify + Khóa ĐGNL'
                    : 'Combo Áo Thủ Khoa + Toàn bộ Quà Store'}
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  Gửi bưu điện miễn phí về tận nhà.
                </p>
              </div>

              {/* Box 4: Tiết Kiệm Chi Phí Gia Sư */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 transition-all">
                <div className="flex items-center justify-between text-xs text-emerald-300 mb-2 font-semibold">
                  <span>Tiết Kiệm Gia Sư</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                  ~{(Math.round((calcDays / 30) * 2500000)).toLocaleString()}đ
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  So với chi phí thuê gia sư 1-1 bên ngoài.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          C. AI 2026 INTERACTIVE SHOWCASE ("SỨC MẠNH GIA SƯ AI 2026")
      ======================================================== */}
      {audienceTab === 'STUDENT' && (
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-2">
              <Bot className="w-3.5 h-3.5" />
              <span>Công Nghệ Độc Quyền 2026</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Gia Sư AI Schoolify Có Gì Vượt Trội?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Không chỉ đưa ra đáp án, AI phân tích cặn kẽ bản chất sư phạm, phát hiện bẫy đề thi Bộ GD&ĐT 2025 và bù đắp lỗ hổng kiến thức.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {[
                { id: 'REASONING', label: '🧠 AI Suy Luận Sâu VDC', icon: BrainCircuit },
                { id: 'TRAPS', label: '🎯 Gỡ Bẫy Đúng/Sai 2025', icon: Target },
                { id: 'RADAR', label: '📡 Radar Quét Lỗ Hổng', icon: Compass },
                { id: 'STREAK', label: '💎 Tích Điểm Đổi Quà Thật', icon: Gift },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = aiShowcaseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAiShowcaseTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm shadow-slate-900/10'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-[#00B8DD]' : 'text-slate-400')} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Display */}
            <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
              <AnimatePresence mode="wait">
                {aiShowcaseTab === 'REASONING' && (
                  <motion.div
                    key="reasoning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Mô Hình Deep-Reasoning Phân Hóa Vận Dụng Cao (9 - 10 Điểm)
                      </span>
                      <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                        Đặc quyền gói VIP
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm space-y-2">
                      <p className="font-bold text-slate-900 dark:text-white">
                        Đề bài: Cho hàm số y = f(x) liên tục trên R có đạo hàm f'(x) = (x - 1)^2 (x^2 - 2x). Tìm tất cả giá trị thực của tham số m để hàm số g(x) = f(x^2 - 4x + m) có đúng 5 điểm cực trị.
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-800/40">
                        <span className="px-2 py-0.5 rounded bg-[#00B8DD] text-white font-black text-[10px] shrink-0">
                          BƯỚC 1
                        </span>
                        <span>
                          <strong>Nhận diện bản chất cực trị:</strong> Nghiệm kép (x - 1)^2 không làm đổi dấu đạo hàm. Cực trị chỉ sinh ra tại x = 0 và x = 2.
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[10px] shrink-0">
                          BƯỚC 2
                        </span>
                        <span>
                          <strong>Lập luận hàm hợp:</strong> g'(x) = (2x - 4).f'(x^2 - 4x + m). Đã có 1 cực trị x = 2. Cần thêm 4 nghiệm đơn phân biệt khác 2.
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[10px] shrink-0">
                          BƯỚC 3
                        </span>
                        <span>
                          <strong>Mẹo Casio & Chốt nhanh:</strong> Dùng đồ thị parabol u = x^2 - 4x + m có đỉnh tại (2, m - 4). Kết luận: <strong>m &lt; 4</strong>.
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiShowcaseTab === 'TRAPS' && (
                  <motion.div
                    key="traps"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-[#00B8DD] flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Gỡ Bẫy Đề Thi Định Dạng Mới (Trắc Nghiệm Đúng/Sai)
                      </span>
                      <span className="text-[11px] font-bold bg-cyan-100 dark:bg-cyan-950 text-[#007D99] dark:text-[#00B8DD] px-2.5 py-0.5 rounded-full">
                        Chuẩn Bộ GD&ĐT 2025
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                        <p className="font-bold text-amber-900 dark:text-amber-200">
                          Cảnh báo bẫy tâm lý ra đề:
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Ở format thi mới, làm đúng 1 ý được 0.1đ, nhưng đúng cả 4 ý được trọn vẹn 1.0đ. AI sẽ chỉ ra chính xác vị trí <strong>74% học sinh toàn quốc làm sai</strong> ở ý (c) và (d) để bạn không bao giờ mất điểm oan!
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-rose-500 block mb-1">❌ Sai lầm phổ biến:</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Học sinh vội vàng lấy logarit 2 vế mà quên đặt điều kiện nghiệm dương x &gt; 0, dẫn đến kết luận thừa nghiệm.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-emerald-500 block mb-1">✅ Lời khuyên Gia Sư AI:</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          Ghi nhớ quy tắc: "Đặt điều kiện xác định trước khi biến đổi tương đương". AI tự động tạo bài tập tương tự để rèn phản xạ.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiShowcaseTab === 'RADAR' && (
                  <motion.div
                    key="radar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" /> Radar AI Quét Lỗ Hổng & Cá Nhân Hóa Đề Luyện Cấp Tốc
                      </span>
                      <span className="text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                        Tiết kiệm 80% thời gian ôn
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Thay vì luyện đề tràn lan vô định, Radar AI liên tục theo dõi từng câu hỏi bạn làm sai để lập bản đồ tri thức:
                    </p>

                    <div className="space-y-2.5">
                      {[
                        { topic: 'Hàm số & Khảo sát đạo hàm', score: 94, status: 'Thành thạo (9+)', color: 'bg-emerald-500' },
                        { topic: 'Hình học Oxyz (Khoảng cách & Góc)', score: 58, status: '⚠️ Cần củng cố gấp', color: 'bg-rose-500' },
                        { topic: 'Nguyên hàm & Tích phân ứng dụng', score: 86, status: 'Vững chắc (8+)', color: 'bg-[#00B8DD]' },
                        { topic: 'Xác suất & Biến cố độc lập', score: 72, status: 'Khá', color: 'bg-amber-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-900 dark:text-white">{item.topic}</span>
                            <span className="text-slate-500 dark:text-slate-400">{item.status} ({item.score}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all duration-500', item.color)} style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-[#00B8DD]/30 text-xs flex items-center justify-between">
                      <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">
                        Gợi ý của AI: "Tự động sinh 1 đề 10 câu Oxyz để bù đắp điểm yếu ngay tối nay"
                      </span>
                      <Button size="sm" className="h-7 text-[11px] bg-[#00B8DD] hover:bg-[#009fb0] text-white">
                        Luyện Ngay
                      </Button>
                    </div>
                  </motion.div>
                )}

                {aiShowcaseTab === 'STREAK' && (
                  <motion.div
                    key="streak"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Gift className="w-4 h-4" /> Học Chăm Mỗi Ngày • Nhận Quà Hiện Vật Thật
                      </span>
                      <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                        Schoolify Store
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Điểm thưởng 💎 không phải là con số ảo! Khi đạt mốc tích lũy, bạn có thể vào <strong>Kho Quà Store</strong> để đổi các phần thưởng thực tế:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950 text-[#00B8DD] flex items-center justify-center mx-auto font-black text-sm">
                          🎒
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Balo Schoolify Pro</h4>
                        <span className="text-[11px] text-slate-500 block">Đổi với 1.200 💎</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto font-black text-sm">
                          👕
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Áo Thun Thủ Khoa VIP</h4>
                        <span className="text-[11px] text-slate-500 block">Đổi với 1.800 💎</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto font-black text-sm">
                          📚
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Sách Bộ Đề GDPT 2025</h4>
                        <span className="text-[11px] text-slate-500 block">Đổi với 950 💎</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          D. GRID CÁC GÓI TRƯỜNG HỌC & TỔ CHỨC (B2B SAAS)
      ======================================================== */}
      {audienceTab === 'SCHOOL' && (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {MOCK_PACKAGES.map((pkg) => {
            const isPopular = pkg.id === 'pkg-growth';
            const calculatedPrice = isYearly ? pkg.price * 12 * 0.8 : pkg.price;

            return (
              <Card
                key={pkg.id}
                className={cn(
                  'relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all',
                  isPopular
                    ? 'border-2 border-indigo-600 shadow-xl scale-100 lg:scale-102 z-10 bg-white dark:bg-slate-900'
                    : 'hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                    <span className="inline-flex items-center py-1 px-3.5 text-xs uppercase tracking-wider font-black shadow-md bg-indigo-600 text-white rounded-full">
                      Phổ Biến Cho Trung Tâm
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{pkg.description}</p>

                  <div className="mt-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        {formatMoney(calculatedPrice)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/{isYearly ? 'năm' : 'tháng'}</span>
                    </div>
                  </div>

                  {/* Quotas Box */}
                  <div className="mb-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs border border-slate-100 dark:border-slate-750">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giới hạn học sinh:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pkg.max_students_total.toLocaleString()} em</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số lượng giáo viên:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pkg.max_teachers} thầy cô</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dung lượng video:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pkg.storage_limit_gb} GB Cloud</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tính Năng Bao Gồm:</p>
                    {pkg.features?.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedSchoolPkg(pkg)}
                  variant={isPopular ? 'primary' : 'outline'}
                  className={cn(
                    'w-full justify-center h-12 text-sm font-bold rounded-xl cursor-pointer',
                    isPopular ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : ''
                  )}
                >
                  Đăng Ký Bản Quyền Trường
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================
          E. BẢNG SO SÁNH CHI TIẾT TÍNH NĂNG (FEATURE COMPARISON)
          Responsive for both Mobile (card stacked) & Desktop (table)
      ======================================================== */}
      {audienceTab === 'STUDENT' && (
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 mb-2">
              So Sánh Trực Quan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Bảng So Sánh Quyền Lợi Các Gói
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Xem rõ từng đặc quyền điểm thưởng, công nghệ AI và kho đề chuẩn GDPT 2018.
            </p>
          </div>

          {/* Desktop Table: Hidden on small screens to strictly prevent horizontal overflow */}
          <div className="hidden md:block rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
                  <th className="py-4 px-4 sm:px-6 font-bold text-slate-900 dark:text-white w-2/5">Tính Năng / Đặc Quyền</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-slate-600 dark:text-slate-300 text-center w-1/5">Tân Binh (Free)</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-[#007D99] dark:text-[#00B8DD] text-center w-1/5 bg-cyan-50/50 dark:bg-cyan-950/20">
                    Chiến Binh Pro 🔥
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-amber-600 dark:text-amber-400 text-center w-1/5">Thủ Khoa VIP 👑</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {COMPARISON_ROWS.map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <tr className="bg-slate-100/60 dark:bg-slate-800/40">
                      <td colSpan={4} className="py-2.5 px-4 sm:px-6 font-extrabold text-xs text-slate-700 dark:text-slate-200">
                        {section.category}
                      </td>
                    </tr>
                    {section.items.map((item, iIdx) => (
                      <tr key={iIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {item.title}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                          {item.free}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center font-bold text-[#007D99] dark:text-[#00B8DD] bg-cyan-50/30 dark:bg-cyan-950/10 text-xs sm:text-sm">
                          {item.pro}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center font-bold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                          {item.vip}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Breakdown: Strictly zero horizontal scroll, wraps naturally */}
          <div className="md:hidden space-y-4">
            {COMPARISON_ROWS.map((section, sIdx) => (
              <div key={sIdx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                <h4 className="font-black text-sm text-[#007D99] dark:text-[#00B8DD] border-b border-slate-100 dark:border-slate-800 pb-2">
                  {section.category}
                </h4>
                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="pt-2.5 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <span className="text-[10px] text-slate-400 block">Tân Binh</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.free}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/50 dark:border-cyan-800/50">
                          <span className="text-[10px] text-[#007D99] dark:text-[#00B8DD] font-bold block">Pro 🔥</span>
                          <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">{item.pro}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/50">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">VIP 👑</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{item.vip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          F. FAQ (CÂU HỎI THƯỜNG GẶP)
      ======================================================== */}
      <div className="mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mb-2">
            Hỗ Trợ & Thắc Mắc
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Câu Hỏi Thường Gặp
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          G. CHECKOUT MODAL (VIETQR CHUẨN & KÍCH HOẠT TỨC THÌ)
      ======================================================== */}
      <Dialog
        isOpen={!!selectedStudentPkg || !!selectedSchoolPkg}
        onClose={handleCloseModal}
        title={
          selectedStudentPkg
            ? `Nâng Cấp Gói Luyện Thi: ${selectedStudentPkg.name}`
            : `Đăng Ký Bản Quyền Trường Học: ${selectedSchoolPkg?.name}`
        }
        description={
          selectedStudentPkg
            ? 'Quét mã VietQR chuyển khoản để kích hoạt tức thì quyền lợi AI và điểm thưởng.'
            : 'Quét mã QR VietQR để kích hoạt ngay lập tức gói cước của trường.'
        }
      >
        <div className="py-2 flex flex-col items-center text-center space-y-4">
          {!isPaidSuccess ? (
            <>
              {/* Authentic VietQR Card Box */}
              <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-lg relative flex flex-col items-center max-w-[280px] w-full">
                {/* VietQR Header */}
                <div className="w-full flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-black tracking-tight text-blue-900">Viet</span>
                    <span className="text-base font-black tracking-tight text-red-600">QR</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-black text-blue-700">
                    NAPAS 247
                  </div>
                </div>

                {/* Vector SVG QR */}
                <VietQRVector
                  code={`VIETQR-SCHOOLIFY-${
                    selectedStudentPkg ? selectedStudentPkg.id.toUpperCase() : selectedSchoolPkg?.id.toUpperCase()
                  }`}
                />

                <span className="text-[10px] font-bold text-slate-500 mt-2">
                  Quét bằng App Ngân hàng hoặc Ví MoMo/ZaloPay
                </span>
              </div>

              {/* Thông tin chuyển khoản chi tiết */}
              <div className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 text-xs space-y-2.5 text-left border border-slate-200/80 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Gói cước:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedStudentPkg?.name || selectedSchoolPkg?.name} ({isYearly ? 'Gói 1 Năm' : 'Gói 1 Tháng'})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tiền thanh toán:</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-base font-mono">
                    {selectedStudentPkg
                      ? formatMoney(isYearly ? selectedStudentPkg.priceYearly * 12 : selectedStudentPkg.priceMonthly)
                      : selectedSchoolPkg
                      ? formatMoney(isYearly ? selectedSchoolPkg.price * 12 * 0.8 : selectedSchoolPkg.price)
                      : 0}
                  </span>
                </div>

                {selectedStudentPkg && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5 fill-current" /> Điểm thưởng nhận ngay:
                    </span>
                    <span>+{isYearly ? (selectedStudentPkg.yearlyBonusTokens || 500) : selectedStudentPkg.dailyPoints} 💎</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản MB Bank:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-slate-900 dark:text-white bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                      0903888899
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('0903888899', 'Số tài khoản')}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-medium text-slate-900 dark:text-white">CONG TY CO PHAN SCHOOLIFY</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-slate-900 dark:text-white bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                      SCHOOLIFY {selectedStudentPkg ? selectedStudentPkg.id.toUpperCase() : selectedSchoolPkg?.id.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `SCHOOLIFY ${
                            selectedStudentPkg ? selectedStudentPkg.id.toUpperCase() : selectedSchoolPkg?.id.toUpperCase()
                          }`,
                          'Nội dung chuyển khoản'
                        )
                      }
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút giả lập thanh toán / xác nhận */}
              <Button
                onClick={handleConfirmPayment}
                className="w-full justify-center h-12 bg-[#00B8DD] hover:bg-[#009fb0] text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
              </Button>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Kích Hoạt Thành Công!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Tài khoản của bạn đã được nâng cấp lên <strong>{selectedStudentPkg?.name || selectedSchoolPkg?.name}</strong>.
                {awardedBonus > 0 && (
                  <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    Đã cộng trực tiếp +{awardedBonus} 💎 vào Ví Điểm của bạn!
                  </span>
                )}
              </p>
              <div className="pt-2 flex gap-2">
                <Button onClick={handleCloseModal} className="px-6 font-bold">
                  Bắt Đầu Học Ngay
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
