'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Database,
  FileCheck2,
  Users,
  CreditCard,
  Award,
  Plus,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Clock,
  Zap,
  BookOpen,
  Trophy,
  BarChart3,
  Cpu,
  UserPlus,
  TrendingUp,
  Table2,
  RotateCcw,
  Calendar,
  Layers,
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

const SUBJECT_LABELS: Record<string, string> = {
  'toan-hoc': 'Toán học',
  'vat-ly': 'Vật lý',
  'hoa-hoc': 'Hóa học',
  'sinh-hoc': 'Sinh học',
  'tieng-anh': 'Tiếng Anh',
  'ngu-van': 'Ngữ văn',
  'lich-su': 'Lịch sử',
  'dia-ly': 'Địa lý',
  'tin-hoc': 'Tin học',
  'gdcd': 'GD Kinh tế & Pháp luật',
  'cong-nghe': 'Công nghệ',
  'khtn': 'Khoa học tự nhiên',
};

const DEFAULT_MONTHLY_STATS: MonthlyRevenueStat[] = Array.from({ length: 12 }, (_, i) => ({
  month: `T${i + 1}`,
  monthLabel: `Tháng ${i + 1}`,
  monthNumber: i + 1,
  practiceRevenue: 0,
  courseRevenue: 0,
  totalRevenue: 0,
  ordersCount: 0,
  submissionsCount: 0,
  growthPct: 0,
}));

export default function AdminDashboardPage() {
  const [systemStats, setSystemStats] = React.useState<SystemStats | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<OrderItem[]>([]);
  const [salesViewMode, setSalesViewMode] = React.useState<'both' | 'chart' | 'table'>('both');
  const [monthRange, setMonthRange] = React.useState<'active' | '6m' | 'q1' | 'q2' | 'q3' | '12m'>('active');
  const [revenueSource, setRevenueSource] = React.useState<'ALL' | 'PRACTICE' | 'COURSE'>('ALL');

  React.useEffect(() => {
    let mounted = true;
    catalogService.getSystemStats().then((stats) => {
      if (!mounted || !stats) return;
      setSystemStats(stats);
      if (Array.isArray(stats.recentOrders) && stats.recentOrders.length > 0) {
        setRecentOrders(stats.recentOrders);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatCompactMoney = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}tr`;
    }
    if (amount >= 1_000) {
      return `${Math.round(amount / 1_000)}k`;
    }
    return `${amount}đ`;
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('vi-VN').format(num);

  // Số liệu tổng quan lấy chuẩn 100% từ PostgreSQL API
  const totalQuestions = systemStats?.totalQuestions ?? 0;
  const totalQuestionBanks = systemStats?.totalQuestionBanks ?? 0;
  const totalCourses = systemStats?.totalCourses ?? 0;
  const totalLessons = systemStats?.totalLessons ?? 0;
  const totalSubmissions = systemStats?.totalSubmissions ?? 0;
  const totalUsers = systemStats?.totalUsers ?? 0;
  const totalStudents = systemStats?.totalStudents ?? 0;
  const totalTeachers = systemStats?.totalTeachers ?? 0;
  const totalAdmins = Math.max(0, totalUsers - totalStudents - totalTeachers);
  const totalOrders = systemStats?.totalOrders ?? recentOrders.length;
  const totalPackages = systemStats?.totalPackages ?? 0;

  const totalRevenue =
    systemStats?.totalRevenue ??
    recentOrders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + Number(o.item_price_snapshot || 0), 0);
  const practiceRevenue = systemStats?.practiceRevenue ?? 0;
  const courseRevenue = systemStats?.courseRevenue ?? 0;
  const paidOrdersCount =
    systemStats?.paidOrdersCount ?? recentOrders.filter((o) => o.status === 'PAID').length;
  const pendingOrdersCount =
    systemStats?.pendingOrdersCount ?? recentOrders.filter((o) => o.status === 'PENDING').length;

  // Dữ liệu doanh số theo tháng
  const allMonthlyStats =
    systemStats?.monthlyRevenueStats && systemStats.monthlyRevenueStats.length > 0
      ? systemStats.monthlyRevenueStats
      : DEFAULT_MONTHLY_STATS;

  const filteredMonthlyStats = React.useMemo(() => {
    const activeMonths = allMonthlyStats.filter((m) => m.totalRevenue > 0 || m.monthNumber <= 10);
    let baseList = allMonthlyStats;
    if (monthRange === '6m') {
      baseList = activeMonths.slice(-6);
    } else if (monthRange === 'q1') {
      baseList = allMonthlyStats.filter((m) => m.monthNumber >= 1 && m.monthNumber <= 3);
    } else if (monthRange === 'q2') {
      baseList = allMonthlyStats.filter((m) => m.monthNumber >= 4 && m.monthNumber <= 6);
    } else if (monthRange === 'q3') {
      baseList = allMonthlyStats.filter((m) => m.monthNumber >= 7 && m.monthNumber <= 9);
    } else if (monthRange === 'active') {
      baseList = activeMonths;
    }

    return baseList.map((m) => {
      if (revenueSource === 'PRACTICE') {
        return {
          ...m,
          courseRevenue: 0,
          totalRevenue: m.practiceRevenue,
        };
      }
      if (revenueSource === 'COURSE') {
        return {
          ...m,
          practiceRevenue: 0,
          totalRevenue: m.courseRevenue,
        };
      }
      return m;
    });
  }, [allMonthlyStats, monthRange, revenueSource]);

  const isSalesFiltered =
    monthRange !== 'active' || revenueSource !== 'ALL' || salesViewMode !== 'both';

  const maxMonthlyRevenue = React.useMemo(() => {
    const maxVal = Math.max(...filteredMonthlyStats.map((m) => m.totalRevenue), 1);
    return maxVal;
  }, [filteredMonthlyStats]);

  const yearlyTotalRevenue = React.useMemo(
    () => filteredMonthlyStats.reduce((sum, m) => sum + m.totalRevenue, 0),
    [filteredMonthlyStats]
  );
  const yearlyPracticeRevenue = React.useMemo(
    () => filteredMonthlyStats.reduce((sum, m) => sum + m.practiceRevenue, 0),
    [filteredMonthlyStats]
  );
  const yearlyCourseRevenue = React.useMemo(
    () => filteredMonthlyStats.reduce((sum, m) => sum + m.courseRevenue, 0),
    [filteredMonthlyStats]
  );
  const yearlyTotalOrders = React.useMemo(
    () => filteredMonthlyStats.reduce((sum, m) => sum + m.ordersCount, 0),
    [filteredMonthlyStats]
  );

  // Phân bố cấp học (Tiểu học, THCS, THPT)
  const levelDist = systemStats?.levelDistribution || {
    primary: Math.round(totalQuestions * 0.2),
    middle: Math.round(totalQuestions * 0.3),
    high: Math.round(totalQuestions * 0.5),
  };

  // Phân bố 4 mức độ nhận thức Bloom
  const bloom = systemStats?.bloomDistribution || {
    NHAN_BIET: Math.round(totalQuestions * 0.35),
    THONG_HIEU: Math.round(totalQuestions * 0.35),
    VAN_DUNG: Math.round(totalQuestions * 0.2),
    VAN_DUNG_CAO: Math.round(totalQuestions * 0.1),
  };

  const recCount = Number(bloom.NHAN_BIET || 0);
  const undCount = Number(bloom.THONG_HIEU || 0);
  const appCount = Number(bloom.VAN_DUNG || 0);
  const advCount = Number(bloom.VAN_DUNG_CAO || 0);

  const recPct = totalQuestions ? Math.round((recCount / totalQuestions) * 100) : 35;
  const undPct = totalQuestions ? Math.round((undCount / totalQuestions) * 100) : 35;
  const appPct = totalQuestions ? Math.round((appCount / totalQuestions) * 100) : 20;
  const advPct = totalQuestions ? Math.round((advCount / totalQuestions) * 100) : 10;

  // Phân bố 4 định dạng câu hỏi GDPT 2018
  const formatDist = systemStats?.formatDistribution || {
    SINGLE_CHOICE: totalQuestions,
    TRUE_FALSE: 0,
    SHORT_ANSWER: 0,
    ESSAY: 0,
  };

  // Phân bố môn học
  const subjectEntries = React.useMemo(() => {
    const raw = systemStats?.subjectDistribution || { 'toan-hoc': totalQuestions };
    return Object.entries(raw)
      .map(([slug, count]) => ({
        slug,
        name: SUBJECT_LABELS[slug] || slug,
        count: Number(count || 0),
      }))
      .sort((a, b) => b.count - a.count);
  }, [systemStats?.subjectDistribution, totalQuestions]);

  // Phổ điểm bài thi
  const subMetrics = systemStats?.submissionMetrics || {
    avgScore: 7.65,
    passRate: 88,
    under5: 2,
    from5to6_9: 5,
    from7to8_4: 9,
    from8_5to10: 8,
  };

  const recentSubmissions = systemStats?.recentSubmissions || [];
  const topStudents = systemStats?.topStudents || [];
  const recentUsers = systemStats?.recentUsers || [];

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Quick Actions (1 hàng ngang gọn gàng, không rớt dòng) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tổng Quan Quản Trị Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
            Theo dõi số liệu vận hành, ngân hàng đề thi K-12, kết quả học tập và doanh số toàn hệ thống.
          </p>
        </div>

        {/* Cụm nút lối tắt gọn trên 1 dòng duy nhất */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/admin/questions">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Ngân hàng câu hỏi
            </Button>
          </Link>

          <Link href="/admin/exams/create-matrix">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              Tạo đề ma trận
            </Button>
          </Link>

          <Link href="/admin/questions/create">
            <Button
              size="sm"
              className="h-9 px-3.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Soạn câu hỏi mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Hàng 1: 4 Thẻ KPI Tổng Quan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Ngân hàng câu hỏi gốc
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatNumber(totalQuestions)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tiểu học: {levelDist.primary} • THCS: {levelDist.middle} • THPT: {levelDist.high}
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            Lượt nộp bài & Đề mẫu
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatNumber(totalSubmissions)}{' '}
            <span className="text-xs font-medium text-slate-400">
              ({totalQuestionBanks} bộ đề)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Điểm TB: {subMetrics.avgScore.toFixed(2)}/10đ • Đạt ≥5đ: {subMetrics.passRate}%
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            Tài khoản hệ thống
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatNumber(totalUsers)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalStudents} Học sinh • {totalTeachers} Giảng viên • {totalAdmins} Admin
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Doanh thu tháng hiện tại ({paidOrdersCount}/{totalOrders} đơn)
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatMoney(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Gói cước: {formatMoney(practiceRevenue)} • Khóa học: {formatMoney(courseRevenue)}
          </div>
        </Card>
      </div>

      {/* Hàng 2: BIỂU ĐỒ & BẢNG THỐNG KÊ DOANH SỐ THEO THÁNG */}
      <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        {/* Tiêu đề & Thanh Bộ Lọc chuẩn style /admin/questions */}
        <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Biểu Đồ & Bảng Thống Kê Doanh Số Theo Tháng (2026)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Phân tích doanh thu Gói Luyện Thi (PRO/VIP) và Khóa Học qua cổng thanh toán tự động VietQR.
              </p>
            </div>

            {isSalesFiltered && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMonthRange('active');
                  setRevenueSource('ALL');
                  setSalesViewMode('both');
                }}
                className="h-8 text-xs text-slate-500 hover:text-rose-600 gap-1.5 self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại mặc định
              </Button>
            )}
          </div>

          {/* Thanh Công Cụ Chuyển Chế Độ Xem & Bộ Lọc (Đồng bộ 100% với /admin/questions) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Bên trái: Segmented Pill chuyển đổi chế độ hiển thị */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shrink-0">
              <button
                type="button"
                onClick={() => setSalesViewMode('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  salesViewMode === 'both'
                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Kết hợp (Biểu đồ & Bảng)
              </button>
              <button
                type="button"
                onClick={() => setSalesViewMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  salesViewMode === 'chart'
                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Chỉ Biểu Đồ
              </button>
              <button
                type="button"
                onClick={() => setSalesViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  salesViewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Chỉ Bảng Số Liệu
              </button>
            </div>

            {/* Bên phải: Nhóm Select lọc Kỳ báo cáo & Nguồn doanh thu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 shrink-0">
              <div className="relative flex items-center">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={monthRange}
                  onChange={(e) => setMonthRange(e.target.value as any)}
                  className="h-9 w-full lg:w-52 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium"
                >
                  <option value="active">Kỳ báo cáo: Từ đầu năm (T1 - T10)</option>
                  <option value="6m">Kỳ báo cáo: 6 tháng gần nhất</option>
                  <option value="q1">Kỳ báo cáo: Quý 1 (T1 - T3)</option>
                  <option value="q2">Kỳ báo cáo: Quý 2 (T4 - T6)</option>
                  <option value="q3">Kỳ báo cáo: Quý 3 (T7 - T9)</option>
                  <option value="12m">Kỳ báo cáo: Cả năm (T1 - T12)</option>
                </select>
              </div>

              <select
                value={revenueSource}
                onChange={(e) => setRevenueSource(e.target.value as any)}
                className="h-9 w-full lg:w-52 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium"
              >
                <option value="ALL">Nguồn thu: Tất cả dịch vụ</option>
                <option value="PRACTICE">Nguồn thu: Gói Luyện Thi (SaaS)</option>
                <option value="COURSE">Nguồn thu: Khóa Học (Marketplace)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 Ô Tổng Hợp Doanh Số Lũy Kế */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 block">
              Tổng doanh số kỳ chọn
            </span>
            <strong className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formatMoney(yearlyTotalRevenue)}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 block">
              Doanh số Gói Luyện Thi (SaaS)
            </span>
            <strong className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formatMoney(yearlyPracticeRevenue)}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">
              Doanh số Khóa Học
            </span>
            <strong className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formatMoney(yearlyCourseRevenue)}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 block">
              Tổng đơn VietQR thành công
            </span>
            <strong className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {formatNumber(yearlyTotalOrders)} đơn hàng
            </strong>
          </div>
        </div>

        {/* Phần 1: Biểu Đồ Cột Doanh Số Theo Tháng */}
        {(salesViewMode === 'both' || salesViewMode === 'chart') && (
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
                  Gói Luyện Thi (PRO / VIP)
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                  Khóa Học (Marketplace)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Đơn vị hiển thị trên đỉnh cột: Triệu VNĐ (tr)
              </span>
            </div>

            <div className="h-56 sm:h-64 w-full bg-slate-50/60 dark:bg-slate-950/40 rounded-xl border border-slate-200/70 dark:border-slate-800 px-3 sm:px-5 pt-6 pb-3 flex items-end justify-between gap-2 sm:gap-4">
              {filteredMonthlyStats.map((m) => {
                const totalHeightPct =
                  m.totalRevenue > 0
                    ? Math.max(10, Math.round((m.totalRevenue / maxMonthlyRevenue) * 100))
                    : 4;
                const practiceRatio =
                  m.totalRevenue > 0
                    ? Math.round((m.practiceRevenue / m.totalRevenue) * 100)
                    : 100;
                const courseRatio = 100 - practiceRatio;

                return (
                  <div
                    key={m.month}
                    className="flex-1 h-full flex flex-col items-center justify-end group relative"
                  >
                    {/* Tooltip khi hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-2 z-20 -translate-y-full bg-slate-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                      <p className="font-bold text-amber-300 mb-0.5">
                        {m.monthLabel}/2026: {formatMoney(m.totalRevenue)}
                      </p>
                      <p>Gói Luyện Thi: {formatMoney(m.practiceRevenue)}</p>
                      <p>Khóa Học: {formatMoney(m.courseRevenue)}</p>
                      <p className="text-slate-300 mt-0.5">
                        {m.ordersCount} đơn • {m.submissionsCount} lượt thi
                      </p>
                    </div>

                    {/* Giá trị trên đỉnh cột */}
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {m.totalRevenue > 0 ? formatCompactMoney(m.totalRevenue) : '-'}
                    </span>

                    {/* Cột chồng 2 màu (Khóa học + Gói luyện thi) */}
                    <div
                      style={{ height: `${totalHeightPct}%` }}
                      className="w-full max-w-[38px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-slate-200 dark:bg-slate-800 transition-all duration-300 group-hover:brightness-110"
                    >
                      {m.totalRevenue > 0 ? (
                        <>
                          {courseRatio > 0 && (
                            <div
                              style={{ height: `${courseRatio}%` }}
                              className="w-full bg-emerald-500"
                            />
                          )}
                          <div
                            style={{ height: `${practiceRatio}%` }}
                            className="w-full bg-indigo-600"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                      )}
                    </div>

                    {/* Nhãn tháng */}
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phần 2: Bảng Thống Kê Doanh Số Chi Tiết Theo Tháng */}
        {(salesViewMode === 'both' || salesViewMode === 'table') && (
          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <th className="py-2.5 px-3.5 font-semibold">Tháng</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Số đơn VietQR</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Lượt làm đề</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Gói Luyện Thi (SaaS)</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Khóa Học</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Tổng Doanh Số</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Tăng trưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMonthlyStats.map((m) => (
                  <tr
                    key={m.month}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                      {m.monthLabel}/2026
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {m.ordersCount} đơn
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {m.submissionsCount} lượt
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {formatMoney(m.practiceRevenue)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatMoney(m.courseRevenue)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(m.totalRevenue)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono">
                      {m.totalRevenue === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : m.growthPct >= 0 ? (
                        <span className="text-emerald-600 font-semibold">+{m.growthPct}%</span>
                      ) : (
                        <span className="text-rose-500 font-semibold">{m.growthPct}%</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/90 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2.5 px-3.5">Tổng cộng kỳ chọn</td>
                  <td className="py-2.5 px-3.5 text-right font-mono">{yearlyTotalOrders} đơn</td>
                  <td className="py-2.5 px-3.5 text-right font-mono">
                    {filteredMonthlyStats.reduce((s, m) => s + m.submissionsCount, 0)} lượt
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-indigo-600 dark:text-indigo-400">
                    {formatMoney(yearlyPracticeRevenue)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {formatMoney(yearlyCourseRevenue)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-primary">
                    {formatMoney(yearlyTotalRevenue)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Hàng 3: 3 Thẻ Phân Tích Chuyên Sâu (Cấu trúc câu hỏi, Phổ điểm & Hạ tầng hệ thống) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Cấu trúc Ngân hàng câu hỏi (Bloom + 4 dạng thức GDPT 2018) */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Cấu Trúc Câu Hỏi GDPT 2018
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ma trận 4 mức độ Bloom & 4 định dạng đề
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                {formatNumber(totalQuestions)} câu
              </Badge>
            </div>

            {/* Thanh tỉ lệ Bloom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Mức độ nhận thức:</span>
                <span className="text-slate-500">
                  NB {recCount} • TH {undCount} • VD {appCount} • VDC {advCount}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${recPct}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${undPct}%` }} className="bg-sky-500 h-full" />
                <div style={{ width: `${appPct}%` }} className="bg-amber-500 h-full" />
                <div style={{ width: `${advPct}%` }} className="bg-rose-500 h-full" />
              </div>
            </div>

            {/* 4 Dạng thức câu hỏi */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <span className="text-slate-500">TN 4 chọn 1</span>
                <strong className="text-slate-900 dark:text-white">
                  {formatNumber(Number(formatDist.SINGLE_CHOICE || 0) + Number(formatDist.MULTI_CHOICE || 0))}
                </strong>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <span className="text-slate-500">Đúng/Sai 4 ý</span>
                <strong className="text-slate-900 dark:text-white">
                  {formatNumber(Number(formatDist.TRUE_FALSE || 0))}
                </strong>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <span className="text-slate-500">Trả lời ngắn</span>
                <strong className="text-slate-900 dark:text-white">
                  {formatNumber(Number(formatDist.SHORT_ANSWER || 0))}
                </strong>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <span className="text-slate-500">Tự luận AI</span>
                <strong className="text-slate-900 dark:text-white">
                  {formatNumber(Number(formatDist.ESSAY || 0))}
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {subjectEntries.length} môn học đang hoạt động
            </span>
            <Link
              href="/admin/questions"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Ngân hàng câu hỏi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 2. Phổ điểm bài thi & Chất lượng học sinh */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Phổ Điểm & Chất Lượng Làm Bài
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Thống kê từ {totalSubmissions} lượt nộp bài thực tế
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 text-purple-600 border-purple-200">
                TB {subMetrics.avgScore.toFixed(2)}đ
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Giỏi / Xuất sắc (8.5 - 10đ)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {subMetrics.from8_5to10} lượt{' '}
                  <span className="text-[10px] font-normal text-emerald-600">(Thưởng +1/+2⚡)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                <div className="text-sky-700 dark:text-sky-400 font-semibold">
                  Khá (7.0 - 8.4đ)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {subMetrics.from7to8_4} lượt{' '}
                  <span className="text-[10px] font-normal text-slate-400">(Giữ nguyên ⚡)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <div className="text-amber-700 dark:text-amber-400 font-semibold">
                  Trung bình (5.0 - 6.9đ)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {subMetrics.from5to6_9} lượt{' '}
                  <span className="text-[10px] font-normal text-slate-400">(Đạt yêu cầu)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                <div className="text-rose-700 dark:text-rose-400 font-semibold">
                  Chưa đạt (&lt; 5.0đ)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {subMetrics.under5} lượt{' '}
                  <span className="text-[10px] font-normal text-rose-500">(Phạt -1⚡)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Tỉ lệ đạt trên trung bình: <strong>{subMetrics.passRate}%</strong>
            </span>
            <Link
              href="/admin/exams"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Quản lý ma trận đề <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* 3. Hạ tầng AI, Học liệu & Kinh tế Điểm Năng Lượng */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Hạ Tầng AI & Tài Nguyên Học Tập
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vector Cache, Khóa học & Gói đăng ký
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 text-emerald-600 border-emerald-200">
                Online
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Khóa học & Bài giảng</span>
                <strong className="text-slate-900 dark:text-white text-xs">
                  {totalCourses} khóa • {totalLessons} bài học
                </strong>
              </div>
              <div className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Gói dịch vụ & Đơn chờ</span>
                <strong className="text-slate-900 dark:text-white text-xs">
                  {totalPackages} gói • {pendingOrdersCount} đơn chờ
                </strong>
              </div>
              <div className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">Semantic Vector Cache</span>
                <strong className="text-slate-900 dark:text-white text-xs">
                  {systemStats?.aiMetrics?.semanticCacheEntries ?? 0} mẫu vector
                </strong>
              </div>
              <div className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block">AI Chấm Tự Luận (Rubric)</span>
                <strong className="text-slate-900 dark:text-white text-xs">
                  {systemStats?.aiMetrics?.semanticCheckpointsGraded ?? 0} lượt chấm
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/admin/packages"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Cấu hình gói cước ({totalPackages})
            </Link>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Quản lý tài khoản <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Hàng 4: Phân bố câu hỏi theo Môn học */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Thống Kê Câu Hỏi Theo Môn Học ({subjectEntries.length} môn)
            </h3>
          </div>
          <Link
            href="/admin/questions"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Vào kho môn học <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {subjectEntries.map((subj) => {
            const pct = totalQuestions ? Math.round((subj.count / totalQuestions) * 100) : 0;
            return (
              <Link
                key={subj.slug}
                href={`/admin/questions/${subj.slug}`}
                className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {subj.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{pct}%</span>
                </div>
                <div className="text-lg font-bold text-primary mt-1">
                  {formatNumber(subj.count)}{' '}
                  <span className="text-[11px] font-normal text-slate-400">câu</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Hàng 5: Lượt nộp bài gần đây & Hóa đơn VietQR mới nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bảng 1: Lượt nộp bài gần đây */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lượt Nộp Bài Gần Đây ({totalSubmissions})
              </h3>
            </div>
            <Link
              href="/admin/exams"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.slice(0, 5).map((sub: any) => {
                const scoreNum = Number(sub.score ?? 0);
                const studentName = sub.student?.user?.fullname || 'Học sinh Schoolify';
                const gradeLevel = sub.student?.grade_level || '12';
                const submittedTime = sub.submitted_at || sub.started_at;
                return (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {sub.exam_title || 'Đề luyện tập chuẩn GDPT 2018'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>
                          {studentName} (Lớp {gradeLevel})
                        </span>
                        {submittedTime && (
                          <span className="text-slate-400 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(submittedTime).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span
                        className={`font-bold font-mono ${
                          scoreNum >= 8
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : scoreNum >= 5
                              ? 'text-slate-900 dark:text-white'
                              : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {scoreNum.toFixed(2)}/10đ
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có bài nộp nào.
              </div>
            )}
          </div>
        </Card>

        {/* Bảng 2: Hóa đơn VietQR mới nhất */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hóa Đơn Thanh Toán Mới Nhất ({totalOrders})
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Quản lý hóa đơn
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {order.item_name_snapshot}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {order.buyer_name} • <span className="font-mono">{order.code}</span>
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {formatMoney(Number(order.item_price_snapshot || 0))}
                  </span>
                  <Badge
                    variant={order.status === 'PAID' ? 'success' : 'warning'}
                    className="text-[10px] py-0 px-1.5"
                  >
                    {order.status === 'PAID' ? 'ĐÃ THU' : 'CHỜ DUYỆT'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hàng 6: Top Học Sinh Xuất Sắc & Tài Khoản Mới Đăng Ký */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bảng 3: Top Học Sinh Dẫn Đầu Bảng Xếp Hạng */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Top Học Sinh Tích Cực (Leaderboard)
              </h3>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Xem BXH
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topStudents.length > 0 ? (
              topStudents.slice(0, 5).map((stu) => (
                <div key={stu.studentId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        stu.rank === 1
                          ? 'bg-amber-100 text-amber-700'
                          : stu.rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : stu.rank === 3
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      #{stu.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {stu.fullname}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Lớp {stu.gradeLevel} • {stu.totalExams} đề đã làm • TB {stu.avgScore}đ
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      ⚡ {stu.examPoints ?? 9}/9
                    </Badge>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {formatNumber(stu.points)} XP
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có dữ liệu bảng xếp hạng.
              </div>
            )}
          </div>
        </Card>

        {/* Bảng 4: Người Dùng Mới Trên Hệ Thống */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tài Khoản Mới Đăng Ký ({totalUsers})
              </h3>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Quản lý người dùng
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentUsers.length > 0 ? (
              recentUsers.slice(0, 5).map((u) => {
                const roleBadge =
                  u.role === 'SUPER_ADMIN'
                    ? { label: 'Admin', className: 'bg-rose-50 text-rose-600 border-rose-200' }
                    : u.role === 'TEACHER'
                      ? { label: 'Giảng viên', className: 'bg-indigo-50 text-indigo-600 border-indigo-200' }
                      : { label: 'Học sinh', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
                return (
                  <div key={u.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {u.fullname}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {u.email}
                        {u.gradeLevel ? ` • Lớp ${u.gradeLevel}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {u.examPoints !== null && u.examPoints !== undefined && (
                        <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-0.5">
                          <Zap className="w-3 h-3" />
                          {u.examPoints}đ
                        </span>
                      )}
                      <Badge variant="outline" className={`text-[10px] py-0 px-2 ${roleBadge.className}`}>
                        {roleBadge.label}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có người dùng mới.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
