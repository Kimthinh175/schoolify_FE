'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Database,
  Users,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Calculator,
  Cpu,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  catalogService,
  SystemStats,
  OrderItem,
  MonthlyRevenueStat,
} from '@/services/catalog.service';
import { NgocIcon } from '@/components/ui/point-icons';

const DEFAULT_MONTHLY_STATS: MonthlyRevenueStat[] = [
  { month: 'T1', monthLabel: 'Tháng 1', monthNumber: 1, practiceRevenue: 3200000, courseRevenue: 1500000, totalRevenue: 4700000, ordersCount: 12, submissionsCount: 45, growthPct: 15 },
  { month: 'T2', monthLabel: 'Tháng 2', monthNumber: 2, practiceRevenue: 3800000, courseRevenue: 1800000, totalRevenue: 5600000, ordersCount: 15, submissionsCount: 68, growthPct: 19 },
  { month: 'T3', monthLabel: 'Tháng 3', monthNumber: 3, practiceRevenue: 4500000, courseRevenue: 2200000, totalRevenue: 6700000, ordersCount: 18, submissionsCount: 92, growthPct: 20 },
  { month: 'T4', monthLabel: 'Tháng 4', monthNumber: 4, practiceRevenue: 4900000, courseRevenue: 2400000, totalRevenue: 7300000, ordersCount: 20, submissionsCount: 110, growthPct: 9 },
  { month: 'T5', monthLabel: 'Tháng 5', monthNumber: 5, practiceRevenue: 5600000, courseRevenue: 2700000, totalRevenue: 8300000, ordersCount: 24, submissionsCount: 145, growthPct: 14 },
  { month: 'T6', monthLabel: 'Tháng 6', monthNumber: 6, practiceRevenue: 6800000, courseRevenue: 3100000, totalRevenue: 9900000, ordersCount: 29, submissionsCount: 190, growthPct: 19 },
  { month: 'T7', monthLabel: 'Tháng 7', monthNumber: 7, practiceRevenue: 7200000, courseRevenue: 3300000, totalRevenue: 10500000, ordersCount: 31, submissionsCount: 215, growthPct: 6 },
  { month: 'T8', monthLabel: 'Tháng 8', monthNumber: 8, practiceRevenue: 8100000, courseRevenue: 3600000, totalRevenue: 11700000, ordersCount: 35, submissionsCount: 260, growthPct: 11 },
  { month: 'T9', monthLabel: 'Tháng 9', monthNumber: 9, practiceRevenue: 9400000, courseRevenue: 4200000, totalRevenue: 13600000, ordersCount: 41, submissionsCount: 320, growthPct: 16 },
  { month: 'T10', monthLabel: 'Tháng 10', monthNumber: 10, practiceRevenue: 10800000, courseRevenue: 4900000, totalRevenue: 15700000, ordersCount: 48, submissionsCount: 390, growthPct: 15 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [allOrders, setAllOrders] = React.useState<OrderItem[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<number>(2026);
  const [chartPeriod, setChartPeriod] = React.useState<'6m' | 'year' | 'quarter'>('6m');
  const [revenueSource, setRevenueSource] = React.useState<'ALL' | 'SUBSCRIPTION' | 'COURSE'>('ALL');
  const [hoveredBarIndex, setHoveredBarIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([catalogService.getSystemStats(), catalogService.getOrders()])
      .then(([statsData, ordersData]) => {
        if (!mounted) return;
        if (statsData) setStats(statsData);
        if (ordersData) setAllOrders(ordersData);
      })
      .catch((err) => {
        console.warn('[AdminDashboard] Lỗi tải dữ liệu:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const formatVND = (num: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  // Dữ liệu cơ bản
  const totalRevenue = stats?.totalRevenue ?? 15700000;
  const practiceRevenue = stats?.practiceRevenue ?? 10800000;
  const courseRevenue = stats?.courseRevenue ?? 4900000;
  const totalStudents = stats?.totalStudents ?? 10;
  const totalQuestions = stats?.totalQuestions ?? 580;
  const totalSubmissions = stats?.totalSubmissions ?? 145;
  const avgScore = stats?.submissionMetrics?.avgScore ?? 7.4;
  const passRate = stats?.submissionMetrics?.passRate ?? 82.5;

  // Dữ liệu môn học từ PostgreSQL
  const subjectDist = stats?.subjectDistribution || {};
  const mathCount = subjectDist['toan-hoc'] ?? 60;
  const csCount = subjectDist['tin-hoc'] ?? 40;

  // Tính toán dữ liệu Biểu đồ theo Bộ Lọc (Năm, Kỳ xem, Nguồn thu)
  const chartItems = React.useMemo(() => {
    // 1. Lọc đơn đã thanh toán theo Năm được chọn
    const yearOrders = allOrders.filter((o) => {
      if (o.status !== 'PAID') return false;
      const d = new Date(o.created_at);
      return d.getFullYear() === selectedYear;
    });

    // 2. Tính dữ liệu 12 tháng của năm được chọn
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const mOrders = yearOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() + 1 === monthNum;
      });

      let practice = mOrders
        .filter((o) => o.reference_type === 'SUBSCRIPTION')
        .reduce((sum, o) => sum + Number(o.item_price_snapshot || 0), 0);

      let course = mOrders
        .filter((o) => o.reference_type === 'COURSE')
        .reduce((sum, o) => sum + Number(o.item_price_snapshot || 0), 0);

      let count = mOrders.length;

      // Fallback nếu năm 2026 và allOrders đang tải hoặc trống
      if (selectedYear === 2026 && yearOrders.length === 0 && stats?.monthlyRevenueStats) {
        const sMonth = stats.monthlyRevenueStats.find((s) => s.monthNumber === monthNum);
        if (sMonth) {
          practice = sMonth.practiceRevenue;
          course = sMonth.courseRevenue;
          count = sMonth.ordersCount;
        }
      }

      let activeAmount = practice + course;
      if (revenueSource === 'SUBSCRIPTION') activeAmount = practice;
      if (revenueSource === 'COURSE') activeAmount = course;

      return {
        key: `m-${monthNum}`,
        label: `T${monthNum}`,
        fullLabel: `Tháng ${monthNum}/${selectedYear}`,
        monthNumber: monthNum,
        practiceRevenue: practice,
        courseRevenue: course,
        totalRevenue: practice + course,
        filteredRevenue: activeAmount,
        ordersCount: count,
      };
    });

    // 3. Phân chia theo Kỳ: 'quarter' | '6m' | 'year'
    if (chartPeriod === 'quarter') {
      const quarters = [
        { quarter: 1, label: 'Quý 1', months: monthlyData.slice(0, 3) },
        { quarter: 2, label: 'Quý 2', months: monthlyData.slice(3, 6) },
        { quarter: 3, label: 'Quý 3', months: monthlyData.slice(6, 9) },
        { quarter: 4, label: 'Quý 4', months: monthlyData.slice(9, 12) },
      ];

      return quarters.map((q) => {
        const pRev = q.months.reduce((s, m) => s + m.practiceRevenue, 0);
        const cRev = q.months.reduce((s, m) => s + m.courseRevenue, 0);
        const count = q.months.reduce((s, m) => s + m.ordersCount, 0);

        let activeAmount = pRev + cRev;
        if (revenueSource === 'SUBSCRIPTION') activeAmount = pRev;
        if (revenueSource === 'COURSE') activeAmount = cRev;

        return {
          key: `q-${q.quarter}`,
          label: q.label,
          fullLabel: `${q.label} (Năm ${selectedYear})`,
          practiceRevenue: pRev,
          courseRevenue: cRev,
          totalRevenue: pRev + cRev,
          filteredRevenue: activeAmount,
          ordersCount: count,
        };
      });
    }

    if (chartPeriod === '6m') {
      return monthlyData.slice(6, 12); // T7 - T12
    }

    return monthlyData; // T1 - T12
  }, [allOrders, stats, selectedYear, chartPeriod, revenueSource]);

  const selectedPeriodRevenue = React.useMemo(
    () => chartItems.reduce((sum, item) => sum + item.filteredRevenue, 0),
    [chartItems]
  );
  const selectedPracticeRevenue = React.useMemo(
    () => chartItems.reduce((sum, item) => sum + item.practiceRevenue, 0),
    [chartItems]
  );
  const selectedCourseRevenue = React.useMemo(
    () => chartItems.reduce((sum, item) => sum + item.courseRevenue, 0),
    [chartItems]
  );
  // Tổng doanh thu thực tế của cả 2 nguồn trong kỳ được chọn (luôn là mẫu số chuẩn để tính %)
  const totalAllPeriodRevenue = React.useMemo(
    () => selectedPracticeRevenue + selectedCourseRevenue,
    [selectedPracticeRevenue, selectedCourseRevenue]
  );

  // Mốc tối đa trên trục Y làm tròn trực quan (nice scale: 500k, 1 tr, 2 tr, 5 tr, v.v.)
  const niceMaxRevenue = React.useMemo(() => {
    const rawMax = Math.max(...chartItems.map((m) => m.filteredRevenue), 0);
    if (rawMax <= 0) return 1000000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const normalized = rawMax / magnitude;
    let factor = 10;
    if (normalized <= 1) factor = 1;
    else if (normalized <= 2) factor = 2;
    else if (normalized <= 5) factor = 5;
    return factor * magnitude;
  }, [chartItems]);

  const formatVNDShort = (num: number) => {
    if (num >= 1000000) {
      const val = (num / 1000000).toFixed(1).replace('.0', '');
      return `${val} tr`;
    }
    if (num >= 1000) {
      return `${Math.round(num / 1000)}k`;
    }
    return `${num} đ`;
  };

  // Đơn hàng và bài thi gần đây
  const recentOrders = stats?.recentOrders?.slice(0, 4) || [];
  const recentSubmissions = stats?.recentSubmissions?.slice(0, 4) || [];
  const topStudents = stats?.topStudents?.slice(0, 3) || [];

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-slate-100 font-sans max-w-7xl mx-auto">
      {/* 1. Header Tối Giản & Lối Tắt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tổng Quan Quản Trị
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống trực tuyến
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Số liệu vận hành thực tế • Trọng tâm Ngân hàng đề THPT Cấp 3 (Toán học & Tin học).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/questions">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200"
            >
              <Database className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Kho câu hỏi
            </Button>
          </Link>

          <Link href="/admin/questions/create">
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Soạn câu hỏi
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. 4 Thẻ KPI Cốt Lõi (Modern Flat Metric Cards - Phong cách Stripe / shadcn) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Doanh thu */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs transition-hover hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Doanh thu toàn hệ thống</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatVND(totalRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.2%
              </span>
              <span className="text-slate-400">so với tháng trước</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Học sinh hoạt động */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs transition-hover hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Học sinh hoạt động</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatNumber(totalStudents)}{' '}
              <span className="text-xs font-normal text-slate-400">tài khoản</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">{totalSubmissions}</span>
              <span>lượt làm bài hoàn thành</span>
            </div>
          </div>
        </Card>

        {/* Metric 3: Ngân hàng câu hỏi gốc */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs transition-hover hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Ngân hàng câu hỏi gốc</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatNumber(mathCount + csCount)}{' '}
              <span className="text-xs font-normal text-slate-400">câu hỏi THPT</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
              <span className="text-[#00B8DD] font-semibold">Toán học: {mathCount}</span>
              <span>•</span>
              <span className="text-[#00B8DD] font-semibold">Tin học: {csCount}</span>
            </div>
          </div>
        </Card>

        {/* Metric 4: Tỷ lệ đạt & Điểm TB */}
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs transition-hover hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Điểm trung bình toàn kho</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {avgScore.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">/ 10 điểm</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{passRate}%</span>
              <span>đạt yêu cầu (≥ 5.0đ)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Phân Khu Nội Dung Chính: Chia tỉ lệ vàng 65% / 35% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* CỘT TRÁI (65% = 8 cột): Biểu đồ Doanh số & Kho Môn Trọng Tâm */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card A: Biểu Đồ Doanh Số Chuẩn UI/UX Dashboard */}
          <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            {/* 1. Header + Thanh Bộ Lọc Đồng Bộ (Năm, Nguồn thu, Chu kỳ) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00B8DD]/10 flex items-center justify-center text-[#00B8DD]">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Xu Hướng Tăng Trưởng Doanh Thu
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Doanh số thực tế ghi nhận qua cổng thanh toán tự động VietQR & PayOS.
                </p>
              </div>

              {/* Nhóm bộ lọc linh hoạt & ngay ngắn */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Phân kỳ (6 tháng / 12 tháng / Theo Quý) */}
                <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/70 dark:border-slate-700/70 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartPeriod('6m')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${chartPeriod === '6m'
                        ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    6 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriod('year')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${chartPeriod === 'year'
                        ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    12 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartPeriod('quarter')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${chartPeriod === 'quarter'
                        ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Theo Quý
                  </button>
                </div>

                {/* 2. Chọn Năm */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    aria-label="Chọn năm xem doanh thu"
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-8 pl-2.5 pr-7 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 transition-colors focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value={2026}>Năm 2026 (Hiện tại)</option>
                    <option value={2025}>Năm 2025</option>
                    <option value={2024}>Năm 2024</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* 3. Chọn Nguồn Thu */}
                <div className="relative">
                  <select
                    value={revenueSource}
                    aria-label="Chọn nguồn doanh thu"
                    onChange={(e) => setRevenueSource(e.target.value as any)}
                    className="h-8 pl-2.5 pr-7 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 transition-colors focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="ALL">Tất cả nguồn</option>
                    <option value="SUBSCRIPTION">Gói Luyện Thi SaaS</option>
                    <option value="COURSE">Khóa Học</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 2. Thẻ Tóm Tắt Chỉ Số - Logic % Chuẩn Xác Theo Tổng Doanh Thu Kỳ Chọn */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 pb-2 text-xs">
              {/* Thẻ 1: Doanh thu theo bộ lọc */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00B8DD]" />
                    <span>Doanh thu kỳ chọn</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-200 text-slate-500 font-normal">
                    {revenueSource === 'ALL' ? 'Toàn bộ' : revenueSource === 'SUBSCRIPTION' ? 'Gói SaaS' : 'Khóa Học'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {formatVND(selectedPeriodRevenue)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {totalAllPeriodRevenue > 0
                    ? `${Math.round((selectedPeriodRevenue / totalAllPeriodRevenue) * 100)}% tổng doanh thu năm ${selectedYear}`
                    : 'Chưa phát sinh doanh thu'}
                </p>
              </div>

              {/* Thẻ 2: Gói Luyện Thi SaaS */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${revenueSource === 'SUBSCRIPTION'
                    ? 'bg-[#00B8DD]/5 border-[#00B8DD]/40'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  <span>Gói Luyện Thi (SaaS)</span>
                  {totalAllPeriodRevenue > 0 && (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {Math.round((selectedPracticeRevenue / totalAllPeriodRevenue) * 100)}%
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {formatVND(selectedPracticeRevenue)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Lũy kế từ đăng ký gói luyện đề
                </p>
              </div>

              {/* Thẻ 3: Khóa Học Trực Tuyến */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${revenueSource === 'COURSE'
                    ? 'bg-[#00B8DD]/5 border-[#00B8DD]/40'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  <span>Khóa Học Trực Tuyến</span>
                  {totalAllPeriodRevenue > 0 && (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {Math.round((selectedCourseRevenue / totalAllPeriodRevenue) * 100)}%
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {formatVND(selectedCourseRevenue)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Lũy kế từ chuyên đề ôn thi
                </p>
              </div>
            </div>

            {/* Thông báo nếu năm được chọn không có đơn */}
            {selectedPeriodRevenue === 0 && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 text-center">
                Không ghi nhận giao dịch thanh toán trong kỳ lọc của năm {selectedYear}.
              </div>
            )}

            {/* 3. Vùng Biểu Đồ Chuẩn UI/UX: Có Trục Y, Gridlines Ngang & Phân Bố Cột Cân Đối */}
            <div className="relative pt-6 pb-2">
              {/* Lớp Trục Y và Gridlines đứt nét nền */}
              <div className="absolute inset-0 pt-6 pb-7 pointer-events-none flex">
                {/* Nhãn trục Y bên trái */}
                <div className="w-12 h-full flex flex-col justify-between text-[10px] text-slate-400 font-medium select-none pr-2.5 text-right">
                  <span>{formatVNDShort(niceMaxRevenue)}</span>
                  <span>{formatVNDShort(niceMaxRevenue / 2)}</span>
                  <span>0 đ</span>
                </div>

                {/* Các đường gridlines ngang */}
                <div className="flex-1 h-full flex flex-col justify-between">
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
                  <div className="border-b border-slate-200/80 dark:border-slate-700 w-full" />
                </div>
              </div>

              {/* Lớp hiển thị các cột (Thụt lề w-12 để nhường chỗ cho trục Y) */}
              <div className="h-44 pl-12 pr-2 flex items-end">
                <div
                  className={`w-full h-full flex items-end ${chartPeriod === 'quarter'
                      ? 'justify-around px-4 sm:px-10'
                      : chartPeriod === '6m'
                        ? 'justify-around px-2 sm:px-4'
                        : 'justify-between gap-1 sm:gap-2'
                    }`}
                >
                  {chartItems.map((item, idx) => {
                    const hasRevenue = Number(item.filteredRevenue || 0) > 0;
                    const heightPct = hasRevenue
                      ? Math.min(100, Math.max(10, Math.round((item.filteredRevenue / niceMaxRevenue) * 100)))
                      : 0;
                    const isHovered = hoveredBarIndex === idx;

                    // Chiều rộng cột theo loại kỳ xem
                    const columnWidthClass =
                      chartPeriod === 'quarter'
                        ? 'w-14 sm:w-16'
                        : chartPeriod === '6m'
                          ? 'w-10 sm:w-12'
                          : 'w-6 sm:w-8';

                    return (
                      <div
                        key={item.key}
                        className={`flex flex-col items-center justify-end h-full group relative cursor-pointer ${columnWidthClass}`}
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Tooltip khi rê chuột */}
                        {isHovered && (
                          <div className="absolute -top-16 z-30 px-3 py-2 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xs text-white text-xs whitespace-nowrap shadow-xl border border-slate-700/60 pointer-events-none transition-all">
                            <p className="font-semibold flex items-center gap-1.5 text-slate-300">
                              <span>{item.fullLabel}</span>
                              {hasRevenue && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00B8DD]/20 text-[#00B8DD] font-bold">
                                  {item.ordersCount} đơn
                                </span>
                              )}
                            </p>
                            <p className="text-[#00B8DD] font-bold text-sm mt-0.5">
                              {formatVND(item.filteredRevenue)}
                            </p>
                          </div>
                        )}

                        {/* Rãnh Cột (Slot Track) - Giúp biểu đồ đầy đặn, không bị trống trải */}
                        <div className="w-full h-full flex flex-col justify-end items-center rounded-t-lg bg-slate-50/80 dark:bg-slate-800/30 group-hover:bg-slate-100/70 dark:group-hover:bg-slate-800/60 transition-colors p-1 relative">
                          {hasRevenue ? (
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full rounded-t-md bg-[#00B8DD] group-hover:bg-[#00A1C2] transition-all duration-300 shadow-xs"
                            />
                          ) : (
                            <div className="w-full h-1 bg-slate-200/90 dark:bg-slate-700/60 rounded-full" />
                          )}
                        </div>

                        {/* Nhãn Tháng / Quý bên dưới */}
                        <span
                          className={`mt-2 text-[11px] font-medium transition-colors ${hasRevenue
                              ? 'text-[#00B8DD] font-bold'
                              : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                            }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Card B: KHO MÔN HỌC TRỌNG TÂM (TOÁN HỌC & TIN HỌC) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00B8DD]" />
                  Kho Môn Học Trọng Tâm THPT (Toán & Tin)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tập trung chuyên sâu 2 môn Toán học & Tin học cấp 3 (Lớp 10, 11, 12) chuẩn cấu trúc 2025.
                </p>
              </div>

              <Link
                href="/admin/questions"
                className="text-xs font-semibold text-[#00B8DD] hover:underline inline-flex items-center"
              >
                Vào kho ngân hàng <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* 2 Card Lớn Nổi Bật Cho TOÁN và TIN (Chuẩn hóa màu thương hiệu #00B8DD) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MÔN 1: TOÁN HỌC */}
              <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-[#00B8DD]">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Toán Học</h3>
                          <Badge className="bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/20 text-[10px] px-2 py-0 font-semibold">
                            Môn mũi nhọn
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Khảo sát hàm số, Hình không gian, Tích phân</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{mathCount}</span>
                      <span className="text-xs font-medium text-slate-400">câu hỏi trong kho</span>
                    </div>

                    {/* Thanh phân bổ mức nhận thức (Monochrome Brand) */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                      <div style={{ width: '35%' }} className="bg-[#00B8DD]/25 h-full" title="Nhận biết: 35%" />
                      <div style={{ width: '35%' }} className="bg-[#00B8DD]/55 h-full border-l border-white/60 dark:border-slate-900/60" title="Thông hiểu: 35%" />
                      <div style={{ width: '20%' }} className="bg-[#00B8DD] h-full border-l border-white/60 dark:border-slate-900/60" title="Vận dụng: 20%" />
                      <div style={{ width: '10%' }} className="bg-[#007491] h-full border-l border-white/60 dark:border-slate-900/60" title="Vận dụng cao: 10%" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]/25" />NB: 35%</span>
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]/55" />TH: 35%</span>
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />VD: 20%</span>
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#007491]" />VDC: 10%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Chuẩn cấu trúc Bộ GD 2025</span>
                  <Link href="/admin/questions?subject=toan-hoc">
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-[#00B8DD] hover:bg-[#00B8DD]/10 p-0 cursor-pointer">
                      Xem câu hỏi Toán →
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* MÔN 2: TIN HỌC */}
              <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-[#00B8DD]">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Tin Học</h3>
                          <Badge className="bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/20 text-[10px] px-2 py-0 font-semibold">
                            Môn mũi nhọn
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Thuật toán Python, CSDL SQL, Mạng máy tính</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{csCount}</span>
                      <span className="text-xs font-medium text-slate-400">câu hỏi trong kho</span>
                    </div>

                    {/* Thanh phân bổ mức nhận thức (Monochrome Brand) */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                      <div style={{ width: '30%' }} className="bg-[#00B8DD]/25 h-full" title="Nhận biết: 30%" />
                      <div style={{ width: '40%' }} className="bg-[#00B8DD]/55 h-full border-l border-white/60 dark:border-slate-900/60" title="Thông hiểu: 40%" />
                      <div style={{ width: '20%' }} className="bg-[#00B8DD] h-full border-l border-white/60 dark:border-slate-900/60" title="Vận dụng: 20%" />
                      <div style={{ width: '10%' }} className="bg-[#007491] h-full border-l border-white/60 dark:border-slate-900/60" title="Vận dụng cao: 10%" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]/25" />NB: 30%</span>
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]/55" />TH: 40%</span>
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />VD: 20%</span>
                      <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#007491]" />VDC: 10%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Định dạng trắc nghiệm & Code</span>
                  <Link href="/admin/questions?subject=tin-hoc">
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-[#00B8DD] hover:bg-[#00B8DD]/10 p-0 cursor-pointer">
                      Xem câu hỏi Tin →
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CỘT PHẢI (35% = 4 cột): Cần Xử Lý, Giao Dịch & Nộp Bài Mới Nhất */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Hóa Đơn & Giao Dịch VietQR Cần Chú Ý */}
          <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Giao Dịch VietQR Mới
                </h3>
              </div>
              <Link href="/admin/orders" className="text-xs font-semibold text-[#00B8DD] hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const isPaid = order.status === 'PAID';
                  return (
                    <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {order.buyer_name || 'Khách hàng'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {order.item_name_snapshot || 'Gói SaaS'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {formatVND(Number(order.item_price_snapshot || 0))}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md inline-block ${isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}
                        >
                          {isPaid ? 'Đã thanh toán' : 'Chờ xác nhận'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">Chưa có giao dịch gần đây</div>
              )}
            </div>
          </Card>

          {/* Card 2: Lượt Nộp Bài Gần Đây (Focus Toán - Tin) */}
          <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Lượt Nộp Bài Gần Đây
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">{totalSubmissions} lượt</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-1">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((sub: any) => {
                  const score = Number(sub.score ?? 0);
                  const isHigh = score >= 8.0;
                  return (
                    <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {sub.student?.user?.fullname || 'Học sinh'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {sub.exam?.title || 'Bài luyện thi Toán 12'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${isHigh
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          {score.toFixed(1)} đ
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">Chưa có lượt nộp bài hôm nay</div>
              )}
            </div>
          </Card>

          {/* Card 3: Top Học Sinh Xuất Sắc Bảng Vàng */}
          <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Top Bảng Vàng Thi Đua
                </h3>
              </div>
              <span className="text-[11px] text-amber-500 font-semibold">Tuần này</span>
            </div>

            <div className="space-y-2.5 pt-2">
              {topStudents.length > 0 ? (
                topStudents.map((st: any, idx: number) => (
                  <div
                    key={st.studentId || idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-bold text-amber-500 text-sm">#{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{st.fullname}</p>
                        <p className="text-[10px] text-slate-400 truncate">{st.gradeLevel || 'Lớp 12'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 text-xs shrink-0 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-200/50">
                      <NgocIcon className="w-3.5 h-3.5" flat />
                      <span>{new Intl.NumberFormat('vi-VN').format(st.points ?? 0)}</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">Đang cập nhật xếp hạng</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
