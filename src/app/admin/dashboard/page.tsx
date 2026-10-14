'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  DollarSign,
  Users,
  FileCheck2,
  Globe,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  ArrowRight,
  Building2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Search,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS } from '@/services/mock/data';

// Các loại khoảng thời gian lọc
type TimeframeType = 'day' | 'month' | 'year';

interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface MetricSubtabConfig {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  valueFormatter: (val: number) => string;
  unit: string;
  color: string;
  chartColorHex: string;
  gradientFrom: string;
  gradientTo: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  };
  // Dữ liệu theo từng chế độ lọc
  data: {
    day: {
      points: ChartPoint[];
      total: number;
      change: string;
      isPositive: boolean;
      peak: string;
      avg: string;
    };
    month: {
      points: ChartPoint[];
      total: number;
      change: string;
      isPositive: boolean;
      peak: string;
      avg: string;
    };
    year: {
      points: ChartPoint[];
      total: number;
      change: string;
      isPositive: boolean;
      peak: string;
      avg: string;
    };
  };
}

export default function AdminDashboardPage() {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('vi-VN').format(num);

  // Bộ lọc thời gian (Ngày / Tháng / Năm)
  const [timeframe, setTimeframe] = React.useState<TimeframeType>('day');
  const [selectedQuickPreset, setSelectedQuickPreset] = React.useState<string>('7d');
  const [selectedDate, setSelectedDate] = React.useState<string>('2026-10-07');
  const [selectedMonth, setSelectedMonth] = React.useState<string>('10');
  const [selectedYear, setSelectedYear] = React.useState<string>('2026');

  // Subtab đang chọn (1 trong 6 mục cốt lõi)
  const [activeTabId, setActiveTabId] = React.useState<string>('practice-revenue');
  // Chế độ hiển thị biểu đồ: diện tích (area) hoặc cột (bar)
  const [chartType, setChartType] = React.useState<'area' | 'bar'>('area');
  // Điểm đang hover trên biểu đồ
  const [hoveredPointIndex, setHoveredPointIndex] = React.useState<number | null>(null);

  // Cấu hình & Dữ liệu chi tiết cho 6 mục chỉ số
  const metricConfigs: MetricSubtabConfig[] = [
    {
      id: 'practice-revenue',
      title: 'Doanh thu từ người luyện thi',
      shortTitle: 'Doanh thu luyện thi',
      icon: GraduationCap,
      valueFormatter: (val) => formatMoney(val),
      unit: 'VNĐ',
      color: 'text-emerald-500',
      chartColorHex: '#10b981',
      gradientFrom: 'rgba(16, 185, 129, 0.4)',
      gradientTo: 'rgba(16, 185, 129, 0.0)',
      colorScheme: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
      },
      data: {
        day: {
          points: [
            { label: '01/10', value: 8500000 },
            { label: '02/10', value: 9800000 },
            { label: '03/10', value: 11200000 },
            { label: '04/10', value: 10400000 },
            { label: '05/10', value: 13900000 },
            { label: '06/10', value: 14800000 },
            { label: '07/10', value: 15900000 },
          ],
          total: 84500000,
          change: '+24.5%',
          isPositive: true,
          peak: '15.900.000 ₫ (07/10)',
          avg: '12.071.428 ₫/ngày',
        },
        month: {
          points: [
            { label: 'T1', value: 38000000 },
            { label: 'T2', value: 42000000 },
            { label: 'T3', value: 49000000 },
            { label: 'T4', value: 55000000 },
            { label: 'T5', value: 64000000 },
            { label: 'T6', value: 71000000 },
            { label: 'T7', value: 76000000 },
            { label: 'T8', value: 79000000 },
            { label: 'T9', value: 81000000 },
            { label: 'T10', value: 84500000 },
            { label: 'T11', value: 0 },
            { label: 'T12', value: 0 },
          ],
          total: 640500000,
          change: '+31.8%',
          isPositive: true,
          peak: '84.500.000 ₫ (Tháng 10)',
          avg: '64.050.000 ₫/tháng',
        },
        year: {
          points: [
            { label: '2023', value: 240000000 },
            { label: '2024', value: 480000000 },
            { label: '2025', value: 720000000 },
            { label: '2026', value: 980000000 },
          ],
          total: 980000000,
          change: '+36.1%',
          isPositive: true,
          peak: '980.000.000 ₫ (2026)',
          avg: '605.000.000 ₫/năm',
        },
      },
    },
    {
      id: 'course-revenue',
      title: 'Doanh thu từ người bán khóa học',
      shortTitle: 'Doanh thu bán khóa học',
      icon: DollarSign,
      valueFormatter: (val) => formatMoney(val),
      unit: 'VNĐ',
      color: 'text-amber-500',
      chartColorHex: '#f59e0b',
      gradientFrom: 'rgba(245, 158, 11, 0.4)',
      gradientTo: 'rgba(245, 158, 11, 0.0)',
      colorScheme: {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-900/50',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
        badgeText: 'text-amber-700 dark:text-amber-300',
      },
      data: {
        day: {
          points: [
            { label: '01/10', value: 4800000 },
            { label: '02/10', value: 5200000 },
            { label: '03/10', value: 6100000 },
            { label: '04/10', value: 5900000 },
            { label: '05/10', value: 6800000 },
            { label: '06/10', value: 6600000 },
            { label: '07/10', value: 7200000 },
          ],
          total: 42600000,
          change: '+18.2%',
          isPositive: true,
          peak: '7.200.000 ₫ (07/10)',
          avg: '6.085.714 ₫/ngày',
        },
        month: {
          points: [
            { label: 'T1', value: 19000000 },
            { label: 'T2', value: 23000000 },
            { label: 'T3', value: 27000000 },
            { label: 'T4', value: 29000000 },
            { label: 'T5', value: 32000000 },
            { label: 'T6', value: 35000000 },
            { label: 'T7', value: 39000000 },
            { label: 'T8', value: 40500000 },
            { label: 'T9', value: 41200000 },
            { label: 'T10', value: 42600000 },
            { label: 'T11', value: 0 },
            { label: 'T12', value: 0 },
          ],
          total: 328300000,
          change: '+22.4%',
          isPositive: true,
          peak: '42.600.000 ₫ (Tháng 10)',
          avg: '32.830.000 ₫/tháng',
        },
        year: {
          points: [
            { label: '2023', value: 110000000 },
            { label: '2024', value: 230000000 },
            { label: '2025', value: 380000000 },
            { label: '2026', value: 510000000 },
          ],
          total: 510000000,
          change: '+34.2%',
          isPositive: true,
          peak: '510.000.000 ₫ (2026)',
          avg: '307.500.000 ₫/năm',
        },
      },
    },
    {
      id: 'total-users',
      title: 'Tổng user',
      shortTitle: 'Tổng user',
      icon: Users,
      valueFormatter: (val) => `${formatNumber(val)} user`,
      unit: 'User',
      color: 'text-blue-500',
      chartColorHex: '#3b82f6',
      gradientFrom: 'rgba(59, 130, 246, 0.4)',
      gradientTo: 'rgba(59, 130, 246, 0.0)',
      colorScheme: {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-900/50',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
        badgeText: 'text-blue-700 dark:text-blue-300',
      },
      data: {
        day: {
          points: [
            { label: '01/10', value: 23650 },
            { label: '02/10', value: 23890 },
            { label: '03/10', value: 24120 },
            { label: '04/10', value: 24340 },
            { label: '05/10', value: 24510 },
            { label: '06/10', value: 24690 },
            { label: '07/10', value: 24850 },
          ],
          total: 24850,
          change: '+1,420 user mới',
          isPositive: true,
          peak: '+230 user/ngày (05/10)',
          avg: '202 user mới/ngày',
        },
        month: {
          points: [
            { label: 'T1', value: 9200 },
            { label: 'T2', value: 11400 },
            { label: 'T3', value: 13500 },
            { label: 'T4', value: 15600 },
            { label: 'T5', value: 17400 },
            { label: 'T6', value: 19100 },
            { label: 'T7', value: 20800 },
            { label: 'T8', value: 22100 },
            { label: 'T9', value: 23430 },
            { label: 'T10', value: 24850 },
            { label: 'T11', value: 0 },
            { label: 'T12', value: 0 },
          ],
          total: 24850,
          change: '+170% từ đầu năm',
          isPositive: true,
          peak: '24.850 user (Hiện tại)',
          avg: '1.565 user mới/tháng',
        },
        year: {
          points: [
            { label: '2023', value: 3200 },
            { label: '2024', value: 9500 },
            { label: '2025', value: 17200 },
            { label: '2026', value: 24850 },
          ],
          total: 24850,
          change: '+144.5%',
          isPositive: true,
          peak: '24.850 user (2026)',
          avg: '13.687 user/năm',
        },
      },
    },
    {
      id: 'exam-attempts',
      title: 'Số lượt làm đề thi',
      shortTitle: 'Số lượt làm đề',
      icon: FileCheck2,
      valueFormatter: (val) => `${formatNumber(val)} lượt`,
      unit: 'Lượt thi',
      color: 'text-purple-500',
      chartColorHex: '#a855f7',
      gradientFrom: 'rgba(168, 85, 247, 0.4)',
      gradientTo: 'rgba(168, 85, 247, 0.0)',
      colorScheme: {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-900/50',
        badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
        badgeText: 'text-purple-700 dark:text-purple-300',
      },
      data: {
        day: {
          points: [
            { label: '01/10', value: 5200 },
            { label: '02/10', value: 5900 },
            { label: '03/10', value: 6800 },
            { label: '04/10', value: 6400 },
            { label: '05/10', value: 7600 },
            { label: '06/10', value: 8100 },
            { label: '07/10', value: 8650 },
          ],
          total: 186420,
          change: '+15.8%',
          isPositive: true,
          peak: '8.650 lượt (07/10)',
          avg: '6.950 lượt/ngày',
        },
        month: {
          points: [
            { label: 'T1', value: 48000 },
            { label: 'T2', value: 65000 },
            { label: 'T3', value: 89000 },
            { label: 'T4', value: 112000 },
            { label: 'T5', value: 138000 },
            { label: 'T6', value: 149000 },
            { label: 'T7', value: 159000 },
            { label: 'T8', value: 171000 },
            { label: 'T9', value: 179000 },
            { label: 'T10', value: 186420 },
            { label: 'T11', value: 0 },
            { label: 'T12', value: 0 },
          ],
          total: 186420,
          change: '+28.4%',
          isPositive: true,
          peak: '186.420 lượt (Tháng 10)',
          avg: '129.642 lượt/tháng',
        },
        year: {
          points: [
            { label: '2023', value: 18000 },
            { label: '2024', value: 54000 },
            { label: '2025', value: 118000 },
            { label: '2026', value: 186420 },
          ],
          total: 186420,
          change: '+58.0%',
          isPositive: true,
          peak: '186.420 lượt (2026)',
          avg: '94.105 lượt/năm',
        },
      },
    },
    {
      id: 'web-visits',
      title: 'Số lượt truy cập trang web',
      shortTitle: 'Lượt truy cập web',
      icon: Globe,
      valueFormatter: (val) => `${formatNumber(val)} lượt`,
      unit: 'Truy cập',
      color: 'text-[#00B8DD]',
      chartColorHex: '#00B8DD',
      gradientFrom: 'rgba(0, 184, 221, 0.4)',
      gradientTo: 'rgba(0, 184, 221, 0.0)',
      colorScheme: {
        bg: 'bg-[#E6F8FC] dark:bg-[#00B8DD]/15',
        text: 'text-[#007D99] dark:text-[#00B8DD]',
        border: 'border-[#00B8DD]/30',
        badgeBg: 'bg-[#00B8DD]/10 dark:bg-[#00B8DD]/20',
        badgeText: 'text-[#007D99] dark:text-[#00B8DD]',
      },
      data: {
        day: {
          points: [
            { label: '01/10', value: 19800 },
            { label: '02/10', value: 22400 },
            { label: '03/10', value: 25600 },
            { label: '04/10', value: 24800 },
            { label: '05/10', value: 29500 },
            { label: '06/10', value: 31800 },
            { label: '07/10', value: 33400 },
          ],
          total: 542800,
          change: '+32.4%',
          isPositive: true,
          peak: '33.400 lượt (07/10)',
          avg: '26.757 lượt/ngày',
        },
        month: {
          points: [
            { label: 'T1', value: 130000 },
            { label: 'T2', value: 175000 },
            { label: 'T3', value: 235000 },
            { label: 'T4', value: 305000 },
            { label: 'T5', value: 375000 },
            { label: 'T6', value: 425000 },
            { label: 'T7', value: 460000 },
            { label: 'T8', value: 495000 },
            { label: 'T9', value: 520000 },
            { label: 'T10', value: 542800 },
            { label: 'T11', value: 0 },
            { label: 'T12', value: 0 },
          ],
          total: 542800,
          change: '+45.1%',
          isPositive: true,
          peak: '542.800 lượt (Tháng 10)',
          avg: '386.280 lượt/tháng',
        },
        year: {
          points: [
            { label: '2023', value: 95000 },
            { label: '2024', value: 240000 },
            { label: '2025', value: 410000 },
            { label: '2026', value: 542800 },
          ],
          total: 542800,
          change: '+32.4%',
          isPositive: true,
          peak: '542.800 lượt (2026)',
          avg: '321.950 lượt/năm',
        },
      },
    },
    {
      id: 'unread-contacts',
      title: 'Số lượt liên hệ chưa đọc',
      shortTitle: 'Liên hệ chưa đọc',
      icon: Mail,
      valueFormatter: (val) => `${formatNumber(val)} liên hệ`,
      unit: 'Liên hệ',
      color: 'text-rose-500',
      chartColorHex: '#f43f5e',
      gradientFrom: 'rgba(244, 63, 94, 0.4)',
      gradientTo: 'rgba(244, 63, 94, 0.0)',
      colorScheme: {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-900/50',
        badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
        badgeText: 'text-rose-700 dark:text-rose-300',
      },
      data: {
        day: {
          points: [
            { label: '01/10', value: 2 },
            { label: '02/10', value: 3 },
            { label: '03/10', value: 1 },
            { label: '04/10', value: 4 },
            { label: '05/10', value: 2 },
            { label: '06/10', value: 3 },
            { label: '07/10', value: 3 },
          ],
          total: 18,
          change: 'Cần phản hồi',
          isPositive: false,
          peak: '4 liên hệ (04/10)',
          avg: '2.5 liên hệ mới/ngày',
        },
        month: {
          points: [
            { label: 'T1', value: 9 },
            { label: 'T2', value: 13 },
            { label: 'T3', value: 16 },
            { label: 'T4', value: 15 },
            { label: 'T5', value: 21 },
            { label: 'T6', value: 17 },
            { label: 'T7', value: 19 },
            { label: 'T8', value: 22 },
            { label: 'T9', value: 18 },
            { label: 'T10', value: 18 },
            { label: 'T11', value: 0 },
            { label: 'T12', value: 0 },
          ],
          total: 18,
          change: '-10% tồn đọng',
          isPositive: true,
          peak: '22 liên hệ (Tháng 8)',
          avg: '16.8 liên hệ/tháng',
        },
        year: {
          points: [
            { label: '2023', value: 48 },
            { label: '2024', value: 115 },
            { label: '2025', value: 190 },
            { label: '2026', value: 245 },
          ],
          total: 18,
          change: '+28.9%',
          isPositive: false,
          peak: '245 liên hệ (2026)',
          avg: '149.5 liên hệ/năm',
        },
      },
    },
  ];

  const currentTab = metricConfigs.find((m) => m.id === activeTabId) || metricConfigs[0];
  const currentDataset = currentTab.data[timeframe];

  // Helper render Area & Bar Chart SVG
  const renderChart = () => {
    const points = currentDataset.points;
    if (!points || points.length === 0) return null;

    const maxVal = Math.max(...points.map((p) => p.value), 1);
    const minVal = 0;
    const chartHeight = 220;
    const chartWidth = 760;
    const paddingX = 40;
    const paddingY = 20;

    const innerWidth = chartWidth - paddingX * 2;
    const innerHeight = chartHeight - paddingY * 2;

    const coords = points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * innerWidth;
      const y = paddingY + innerHeight - (p.value / maxVal) * innerHeight;
      return { ...p, x, y };
    });

    // Tạo SVG Path dạng Smooth Curve
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${paddingY + innerHeight} L ${coords[0].x} ${paddingY + innerHeight} Z`;

    return (
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`gradient-${currentTab.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentTab.chartColorHex} stopOpacity="0.38" />
              <stop offset="90%" stopColor={currentTab.chartColorHex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines ngang */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + innerHeight * (1 - ratio);
            const val = maxVal * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {currentTab.id.includes('revenue') ? `${Math.round(val / 1000000)}M` : Math.round(val)}
                </text>
              </g>
            );
          })}

          {chartType === 'area' ? (
            <>
              {/* Fill Gradient Area */}
              <path d={areaD} fill={`url(#gradient-${currentTab.id})`} />

              {/* Stroke Line */}
              <path
                d={pathD}
                fill="none"
                stroke={currentTab.chartColorHex}
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Data Points */}
              {coords.map((pt, idx) => {
                const isHovered = hoveredPointIndex === idx;
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="cursor-pointer transition-all"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : 4.5}
                      fill={currentTab.chartColorHex}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-all filter drop-shadow-sm"
                    />
                    {/* Đường chỉ báo khi hover */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={paddingY + innerHeight}
                        stroke={currentTab.chartColorHex}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                    )}
                  </g>
                );
              })}
            </>
          ) : (
            /* Bar Chart Mode */
            coords.map((pt, idx) => {
              const barWidth = Math.min(innerWidth / (points.length * 1.8), 32);
              const barHeight = (pt.value / maxVal) * innerHeight;
              const isHovered = hoveredPointIndex === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x={pt.x - barWidth / 2}
                    y={paddingY + innerHeight - barHeight}
                    width={barWidth}
                    height={Math.max(barHeight, 3)}
                    rx="4"
                    fill={currentTab.chartColorHex}
                    opacity={isHovered ? 1 : 0.82}
                    className="transition-all hover:opacity-100"
                  />
                </g>
              );
            })
          )}

          {/* X Axis Labels */}
          {coords.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={chartHeight - 3}
              textAnchor="middle"
              className={cn(
                'text-[10px] font-mono transition-colors',
                hoveredPointIndex === idx
                  ? 'fill-slate-900 dark:fill-white font-bold'
                  : 'fill-slate-400'
              )}
            >
              {pt.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredPointIndex !== null && coords[hoveredPointIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-mono backdrop-blur-md border border-slate-700 shadow-xl pointer-events-none flex items-center gap-2"
          >
            <span className="text-slate-400 font-semibold">{coords[hoveredPointIndex].label}:</span>
            <span className="font-bold text-white">
              {currentTab.valueFormatter(coords[hoveredPointIndex].value)}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Danh sách liên hệ mới nhận gần đây
  const mockContacts = [
    {
      id: 'ct-01',
      name: 'Thầy Nguyễn Văn Nam (Hiệu trưởng)',
      organization: 'THPT Chuyên Chu Văn An',
      email: 'nam.nv@chuvanan.edu.vn',
      phone: '0912 345 678',
      topic: 'Tư vấn triển khai gói Schoolify Enterprise cho 2.400 học sinh',
      time: '15 phút trước',
      isUnread: true,
    },
    {
      id: 'ct-02',
      name: 'Cô Lê Hoàng Mai (Tổ trưởng Toán)',
      organization: 'Trường Liên cấp Vinschool',
      email: 'mai.lh@vinschool.net',
      phone: '0988 123 456',
      topic: 'Hỏi về tính năng import đề thi từ Word sang ma trận ngân hàng câu hỏi',
      time: '1 giờ trước',
      isUnread: true,
    },
    {
      id: 'ct-03',
      name: 'Trần Minh Quân (Tác giả khóa học)',
      organization: 'Creator Độc lập',
      email: 'quan.tm@edupreneur.vn',
      phone: '0903 888 999',
      topic: 'Thắc mắc về chính sách thanh toán rút tiền hoa hồng đợt 1 tháng 10',
      time: '3 giờ trước',
      isUnread: true,
    },
    {
      id: 'ct-04',
      name: 'Bác Phạm Hồng Phúc (Phụ huynh)',
      organization: 'Phụ huynh lớp 12A1',
      email: 'phuc.pham@gmail.com',
      phone: '0934 567 890',
      topic: 'Hỗ trợ kích hoạt gói Luyện thi Đánh giá Năng lực ĐHQG TP.HCM',
      time: 'Hôm qua',
      isUnread: false,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B8DD]/10 border border-[#00B8DD]/30 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Nền Tảng Quản Trị Hệ Thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Tổng Quan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Báo cáo tổng hợp doanh thu luyện thi, hoa hồng khóa học, tăng trưởng người dùng và vận hành hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/questions">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
              <FileCheck2 className="w-4 h-4 text-[#00B8DD]" />
              <span>Ngân Hàng Đề</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm" className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl text-xs gap-1.5 cursor-pointer">
              <Users className="w-4 h-4" />
              <span>Quản Lý User</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* BỘ LỌC THEO NGÀY, THÁNG, NĂM (Date, Month, Year Filter Bar - Sticky Follows Scroll) */}
      <Card className="sticky top-[4.15rem] sm:top-[4.25rem] z-20 p-3 sm:py-3.5 sm:px-5 rounded-2xl border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md dark:shadow-slate-950/40 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Mode Switcher: Theo Ngày | Theo Tháng | Theo Năm */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              <Filter className="w-4 h-4 text-[#00B8DD]" />
              <span>Lọc theo:</span>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  setTimeframe('day');
                  setSelectedQuickPreset('7d');
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  timeframe === 'day'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Theo Ngày
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe('month');
                  setSelectedQuickPreset('month');
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  timeframe === 'month'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Theo Tháng
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe('year');
                  setSelectedQuickPreset('year');
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  timeframe === 'year'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Theo Năm
              </button>
            </div>
          </div>

          {/* Controls chọn chi tiết tương ứng với Ngày / Tháng / Năm */}
          <div className="flex flex-wrap items-center gap-2.5">
            {timeframe === 'day' && (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedQuickPreset('today')}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                      selectedQuickPreset === 'today'
                        ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuickPreset('7d')}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                      selectedQuickPreset === '7d'
                        ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    7 ngày qua
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuickPreset('30d')}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                      selectedQuickPreset === '30d'
                        ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    30 ngày qua
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedQuickPreset('custom');
                    }}
                    className="bg-transparent border-none text-xs focus:outline-none font-mono cursor-pointer"
                  />
                </div>
              </>
            )}

            {timeframe === 'month' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m.toString()} className="dark:bg-slate-900">
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="2026" className="dark:bg-slate-900">2026</option>
                    <option value="2025" className="dark:bg-slate-900">2025</option>
                    <option value="2024" className="dark:bg-slate-900">2024</option>
                  </select>
                </div>
              </div>
            )}

            {timeframe === 'year' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="2026" className="dark:bg-slate-900">Năm 2026</option>
                    <option value="2025" className="dark:bg-slate-900">Năm 2025</option>
                    <option value="2024" className="dark:bg-slate-900">Năm 2024</option>
                    <option value="2023" className="dark:bg-slate-900">Năm 2023</option>
                  </select>
                </div>
              </div>
            )}

            <Badge variant="outline" className="text-[11px] font-mono text-slate-500 py-1 hidden sm:inline-flex">
              {timeframe === 'day' && 'Khoảng: 01/10/2026 – 07/10/2026'}
              {timeframe === 'month' && `Toàn bộ Tháng ${selectedMonth}/${selectedYear}`}
              {timeframe === 'year' && `Toàn bộ Năm ${selectedYear}`}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 6 KHỐI THÔNG TIN CHỈ SỐ (Đã xóa các dòng ghi chú rườm rà theo ảnh yêu cầu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {metricConfigs.map((config) => {
          const Icon = config.icon;
          const currentConfigData = config.data[timeframe];

          return (
            <Card
              key={config.id}
              onClick={() => setActiveTabId(config.id)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {config.title}
                </span>
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0',
                    config.colorScheme.bg,
                    config.colorScheme.text
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {config.valueFormatter(currentConfigData.total)}
                </p>

                {/* Phần dưới hiển thị gọn gàng tỷ lệ tăng trưởng, đã xóa note chữ dài dòng */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                      currentConfigData.isPositive
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                    )}
                  >
                    {currentConfigData.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {currentConfigData.change}
                  </span>

                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 hover:text-[#00B8DD] transition-colors">
                    <span>Xem biểu đồ</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KHU VỰC BIỂU ĐỒ CHO TỪNG MỤC (SUBTABS & CHART) */}
      <Card className="p-5 sm:p-7 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        {/* SUBTAB BAR (6 TABS TƯƠNG ỨNG 6 MỤC) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00B8DD]" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Biểu Đồ Phân Tích Chi Tiết
              </h2>
            </div>

            {/* Toggle Area vs Bar */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  chartType === 'area'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
                title="Biểu đồ diện tích / đường"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dạng Đường</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  chartType === 'bar'
                    ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}
                title="Biểu đồ cột"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dạng Cột</span>
              </button>
            </div>
          </div>

          {/* Subtab Segmented Navigation Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 no-scrollbar">
            {metricConfigs.map((config) => {
              const TabIcon = config.icon;
              const isActive = activeTabId === config.id;
              return (
                <button
                  key={config.id}
                  onClick={() => {
                    setActiveTabId(config.id);
                    setHoveredPointIndex(null);
                  }}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 border',
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <TabIcon className={cn('w-4 h-4', isActive ? 'text-[#00B8DD]' : config.color)} />
                  <span>{config.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Header thông tin chi tiết của Tab đang chọn */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentTab.title}
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentTab.valueFormatter(currentDataset.total)}
              </span>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                  currentDataset.isPositive
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                )}
              >
                {currentDataset.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {currentDataset.change}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar: Đỉnh điểm & Trung bình */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Đỉnh điểm:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentDataset.peak}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Trung bình:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentDataset.avg}</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ SVG Tương Tác */}
        <div className="pt-2">
          {renderChart()}
        </div>

        {/* Phân tích sâu theo từng Tab (Deep Dive Section) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {activeTabId === 'practice-revenue' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Gói Luyện Thi THPTQG VIP</p>
                <p className="text-slate-500">Doanh thu: <span className="font-bold text-emerald-600 dark:text-emerald-400">48.200.000 ₫</span> (57%)</p>
                <p className="text-[11px] text-slate-400">120 lượt đăng ký trong kỳ</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Gói Đánh Giá Năng Lực (ĐHQG)</p>
                <p className="text-slate-500">Doanh thu: <span className="font-bold text-emerald-600 dark:text-emerald-400">24.500.000 ₫</span> (29%)</p>
                <p className="text-[11px] text-slate-400">85 lượt đăng ký trong kỳ</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Mua Đề Thi Lẻ &amp; Đề Dự Đoán</p>
                <p className="text-slate-500">Doanh thu: <span className="font-bold text-emerald-600 dark:text-emerald-400">11.800.000 ₫</span> (14%)</p>
                <p className="text-[11px] text-slate-400">236 lượt tải mã đề</p>
              </div>
            </div>
          )}

          {activeTabId === 'course-revenue' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Khối Tự Nhiên (Toán - Lý - Hóa)</p>
                <p className="text-slate-500">Hoa hồng sàn: <span className="font-bold text-amber-600 dark:text-amber-400">22.800.000 ₫</span></p>
                <p className="text-[11px] text-slate-400">54 khóa học đang bán tích cực</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Tiếng Anh &amp; Luyện Thi IELTS</p>
                <p className="text-slate-500">Hoa hồng sàn: <span className="font-bold text-amber-600 dark:text-amber-400">14.600.000 ₫</span></p>
                <p className="text-[11px] text-slate-400">28 khóa học chất lượng cao</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Lập Trình &amp; Tin Học Ứng Dụng</p>
                <p className="text-slate-500">Hoa hồng sàn: <span className="font-bold text-amber-600 dark:text-amber-400">5.200.000 ₫</span></p>
                <p className="text-[11px] text-slate-400">12 khóa học trực tuyến</p>
              </div>
            </div>
          )}

          {activeTabId === 'total-users' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Học Sinh (Toàn Quốc)</p>
                <p className="text-slate-500">Tổng số: <span className="font-bold text-blue-600 dark:text-blue-400">17.892 em</span> (72%)</p>
                <p className="text-[11px] text-slate-400">Tỷ lệ active hàng tuần: 84%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Giáo Viên &amp; Tác Giả Đề</p>
                <p className="text-slate-500">Tổng số: <span className="font-bold text-blue-600 dark:text-blue-400">4.473 thầy cô</span> (18%)</p>
                <p className="text-[11px] text-slate-400">Tạo đề &amp; xuất bản khóa học</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Phụ Huynh Theo Dõi</p>
                <p className="text-slate-500">Tổng số: <span className="font-bold text-blue-600 dark:text-blue-400">2.485 phụ huynh</span> (10%)</p>
                <p className="text-[11px] text-slate-400">Nhận báo cáo điểm &amp; tiến độ</p>
              </div>
            </div>
          )}

          {activeTabId === 'exam-attempts' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Môn Toán Học 12</p>
                <p className="text-slate-500">Lượt làm bài: <span className="font-bold text-purple-600 dark:text-purple-400">68.400 lượt</span> (36.7%)</p>
                <p className="text-[11px] text-slate-400">Điểm trung bình: 7.2 / 10</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Môn Tiếng Anh &amp; Ngữ Pháp</p>
                <p className="text-slate-500">Lượt làm bài: <span className="font-bold text-purple-600 dark:text-purple-400">52.100 lượt</span> (27.9%)</p>
                <p className="text-[11px] text-slate-400">Điểm trung bình: 6.8 / 10</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Tổ Hợp Khoa Học Tự Nhiên</p>
                <p className="text-slate-500">Lượt làm bài: <span className="font-bold text-purple-600 dark:text-purple-400">45.920 lượt</span> (24.6%)</p>
                <p className="text-[11px] text-slate-400">Lý, Hóa, Sinh học kết hợp</p>
              </div>
            </div>
          )}

          {activeTabId === 'web-visits' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Nguồn Tìm Kiếm (Google Search)</p>
                <p className="text-slate-500">Lưu lượng: <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">293.100 lượt</span> (54%)</p>
                <p className="text-[11px] text-slate-400">Từ khóa: đề thi thử, luyện thi online</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Truy Cập Trực Tiếp (Direct)</p>
                <p className="text-slate-500">Lưu lượng: <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">151.980 lượt</span> (28%)</p>
                <p className="text-[11px] text-slate-400">User quay lại học tập hàng ngày</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Mạng Xã Hội &amp; Giới Thiệu</p>
                <p className="text-slate-500">Lưu lượng: <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">97.720 lượt</span> (18%)</p>
                <p className="text-[11px] text-slate-400">TikTok, Facebook Group học tập</p>
              </div>
            </div>
          )}

          {activeTabId === 'unread-contacts' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Yêu Cầu Hợp Tác Trường Học</p>
                <p className="text-slate-500">Chưa xử lý: <span className="font-bold text-rose-600 dark:text-rose-400">12 trường</span></p>
                <p className="text-[11px] text-slate-400">Thời gian chờ TB: 2.4 giờ</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Hỗ Trợ Kỹ Thuật &amp; Tài Khoản</p>
                <p className="text-slate-500">Chưa xử lý: <span className="font-bold text-rose-600 dark:text-rose-400">6 yêu cầu</span></p>
                <p className="text-[11px] text-slate-400">Đăng nhập, reset mật khẩu, thanh toán</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Hiệu Suất Phản Hồi SLA</p>
                <p className="text-slate-500">Tỷ lệ đạt chuẩn: <span className="font-bold text-emerald-600 dark:text-emerald-400">96.8%</span></p>
                <p className="text-[11px] text-slate-400">Phản hồi trong vòng 4 giờ làm việc</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* DANH SÁCH LIÊN HỆ CẦN XỬ LÝ & DÒNG TIỀN GIAO DỊCH MỚI NHẤT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Danh Sách Liên Hệ Chưa Đọc / Mới Nhất */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Liên Hệ &amp; Yêu Cầu Hỗ Trợ
              </h3>
            </div>
            <Badge variant="danger" className="text-xs font-bold">
              18 Chưa Đọc
            </Badge>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockContacts.map((contact) => (
              <div key={contact.id} className="py-3.5 space-y-1.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {contact.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {contact.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                    <Clock className="w-3 h-3" />
                    {contact.time}
                  </span>
                </div>

                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {contact.organization} • <span className="text-slate-500 font-normal">{contact.phone}</span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {contact.topic}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="ghost" size="sm" className="text-xs text-[#007D99] dark:text-[#00B8DD] font-bold gap-1 cursor-pointer">
              <span>Xem toàn bộ 18 liên hệ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>

        {/* Giao Dịch Doanh Thu Toàn Hệ Thống */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dòng Tiền Giao Dịch Mới Nhất
              </h3>
            </div>
            <Link href="/admin/orders">
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                Xem tất cả đơn
              </Badge>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {MOCK_ORDERS.slice(0, 5).map((order) => {
              const isExam = order.item_name_snapshot.toLowerCase().includes('đề') || order.item_name_snapshot.toLowerCase().includes('luyện thi');
              return (
                <div key={order.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                      isExam
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    )}>
                      {isExam ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {order.item_name_snapshot}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {order.buyer_name} • {order.payment_method}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {formatMoney(order.item_price_snapshot)}
                    </p>
                    <Badge variant="success" className="text-[10px] py-0 px-1.5">
                      Thành Công
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Đối soát tự động qua VietQR Pro</span>
            <Link href="/admin/orders" className="text-[#007D99] dark:text-[#00B8DD] font-bold hover:underline flex items-center gap-1">
              <span>Báo cáo tài chính chi tiết</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
