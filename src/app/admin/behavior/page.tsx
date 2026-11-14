'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  Eye,
  FileCheck2,
  FileX2,
  Database,
  Package,
  Users,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Award,
  Clock,
  Search,
  Layers,
  Crown,
  Zap,
  MessageSquare,
  Brain,
  ArrowUpRight,
  Info,
  Globe,
  MapPin,
  Bot,
  Compass,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import {
  catalogService,
  BehaviorAnalyticsData,
} from '@/services/catalog.service';

type AttemptFilterType =
  | 'ALL'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'UNDER_5'
  | 'FROM_5_TO_6_5'
  | 'FROM_6_5_TO_8_5'
  | 'FROM_8_5_TO_10';

export default function AdminBehaviorAnalyticsPage() {
  const [data, setData] = React.useState<BehaviorAnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [visitHoverOpen, setVisitHoverOpen] = React.useState(false);
  const [questionHoverOpen, setQuestionHoverOpen] = React.useState(false);
  const [geoTab, setGeoTab] = React.useState<'LOCATIONS' | 'RECENT_LOGS'>('LOCATIONS');
  const [attemptFilter, setAttemptFilter] = React.useState<AttemptFilterType>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchAnalytics = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await catalogService.getBehaviorAnalytics();
      if (res) setData(res);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics(false);
  }, [fetchAnalytics]);

  const formatNumber = (n: number) =>
    new Intl.NumberFormat('vi-VN').format(Number(n || 0));

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      Number(amount || 0),
    );

  const formatDuration = (sec: number) => {
    const s = Math.max(0, Math.round(Number(sec || 0)));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m}p ${rem}s` : `${m} phút`;
  };

  const traffic = data?.webTraffic;
  const exams = data?.studentExams;
  const qBank = data?.questionBank;
  const pkgSales = data?.packageSales;
  const everything = data?.platformEverything;

  const filteredAttempts = React.useMemo(() => {
    const list = exams?.recentAttempts || [];
    return list.filter((item) => {
      if (attemptFilter === 'COMPLETED' && item.completionStatus !== 'COMPLETED') return false;
      if (attemptFilter === 'ABANDONED' && item.completionStatus === 'COMPLETED') return false;
      if (
        attemptFilter === 'UNDER_5' &&
        (item.completionStatus !== 'COMPLETED' || item.score >= 5.0)
      )
        return false;
      if (
        attemptFilter === 'FROM_5_TO_6_5' &&
        (item.completionStatus !== 'COMPLETED' || item.score < 5.0 || item.score >= 6.5)
      )
        return false;
      if (
        attemptFilter === 'FROM_6_5_TO_8_5' &&
        (item.completionStatus !== 'COMPLETED' || item.score < 6.5 || item.score >= 8.5)
      )
        return false;
      if (
        attemptFilter === 'FROM_8_5_TO_10' &&
        (item.completionStatus !== 'COMPLETED' || item.score < 8.5)
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchTitle = item.examTitle.toLowerCase().includes(q);
        const matchSubj = item.subjectName.toLowerCase().includes(q);
        return matchName || matchTitle || matchSubj;
      }
      return true;
    });
  }, [exams?.recentAttempts, attemptFilter, searchQuery]);

  if (loading && !data) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-16 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-80 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
          <div className="lg:col-span-7 h-80 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const maxDailyVisit = Math.max(
    1,
    ...(traffic?.dailyTrend?.map((d) => d.visits) || [1]),
  );

  return (
    <div className="space-y-6 pb-14">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#00B8DD]/15 text-[#0088A9] dark:text-[#00B8DD] border border-[#00B8DD]/30 font-bold text-xs px-2.5 py-0.5">
              <Activity className="w-3.5 h-3.5 mr-1 inline" />
              Real-time PostgreSQL Analytics
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs px-2.5 py-0.5">
              Số liệu thực tế tính từ:{' '}
              {data?.trackingSince
                ? new Date(data.trackingSince).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '09/11/2026'}
            </Badge>
            <span className="text-xs text-slate-400">
              Cập nhật lúc:{' '}
              {data?.generatedAt
                ? new Date(data.generatedAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '--:--'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
            Thống Kê Hành Vi & Toàn Diện Hệ Thống Web
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Giám sát trực tiếp lượt truy cập, số đề học sinh đã tạo (hoàn thành vs bỏ trống &lt; 3 câu, phổ điểm 4 mốc), ngân hàng câu hỏi và số gói đã bán.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#00B8DD]' : ''}`} />
            Làm mới số liệu
          </Button>
          <Link href="/admin/questions">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Ngân hàng đề
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 bg-[#00B8DD] hover:bg-[#009ec0] text-white"
            >
              <Package className="w-3.5 h-3.5" />
              Quản lý đơn gói
            </Button>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          HÀNG 1: 4 THẺ KPI TRỌNG TÂM THEO YÊU CẦU
          1. Lượt truy cập
          2. Số đề học sinh đã tạo (Hoàn thành vs Bỏ trống < 3 câu)
          3. Tổng số câu hỏi ngân hàng đề (HOVER ra chi tiết từng môn bao nhiêu câu)
          4. Số gói đăng ký đã bán (Gói 1, Gói 2)
      ====================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: LƯỢT TRUY CẬP WEB (KÈM THIẾT BỊ & VỊ TRÍ ĐỊA LÝ) */}
        <div
          className="relative"
          onMouseEnter={() => setVisitHoverOpen(true)}
          onMouseLeave={() => setVisitHoverOpen(false)}
        >
          <Card
            onClick={() => setVisitHoverOpen((prev) => !prev)}
            className="h-full p-5 bg-white dark:bg-slate-900 border-2 border-[#00B8DD]/30 hover:border-[#00B8DD] dark:border-[#00B8DD]/40 shadow-xs flex flex-col justify-between cursor-pointer transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0088A9] dark:text-[#00B8DD]">
                      1. Lượt Truy Cập Web
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-[#0088A9] dark:text-[#00B8DD] border border-sky-200 dark:border-sky-800">
                      <Info className="w-3 h-3" /> Thiết bị &amp; Vị trí
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {formatNumber(traffic?.totalVisits || 0)}
                    <span className="text-xs font-semibold text-slate-400 ml-1.5">lượt xem</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800 flex items-center justify-center text-[#00B8DD] shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              {/* Tóm tắt nhanh Thiết bị & Vị trí ngay trên thẻ */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <Monitor className="w-3 h-3 text-[#00B8DD]" />
                  PC: <b>{traffic?.deviceBreakdown?.desktop || 0}</b>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <Smartphone className="w-3 h-3 text-emerald-500" />
                  Mobile: <b>{traffic?.deviceBreakdown?.mobile || 0}</b>
                </span>
                {(traffic?.deviceBreakdown?.tablet || 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <Tablet className="w-3 h-3 text-indigo-500" />
                    Tablet: <b>{traffic?.deviceBreakdown?.tablet || 0}</b>
                  </span>
                )}
                {(() => {
                  const topRealLoc = (traffic?.byLocation || []).find(
                    (l) => l.countryCode !== 'LEGACY' && l.countryCode !== 'BOT',
                  );
                  const topHumanOs = (traffic?.byOs || []).find(
                    (o) => o.name !== 'Bot / Crawler',
                  );
                  if (topRealLoc) {
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#0088A9] dark:text-[#00B8DD] border border-sky-200/60 dark:border-sky-800/60 max-w-full break-words">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[160px]">{topRealLoc.city}</span>
                      </span>
                    );
                  }
                  if (topHumanOs) {
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#0088A9] dark:text-[#00B8DD] border border-sky-200/60 dark:border-sky-800/60">
                        {topHumanOs.name}: <b>{topHumanOs.visits}</b>
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-slate-500 dark:text-slate-400">Khách truy cập duy nhất:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatNumber(traffic?.uniqueVisitors || 0)} phiên
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-slate-500 dark:text-slate-400">7 ngày qua / Hôm nay:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNumber(traffic?.last7DaysVisits || 0)} / +{formatNumber(traffic?.todayVisits || 0)} hôm nay
                </span>
              </div>
            </div>
          </Card>

          {/* HOVER POPOVER CHI TIẾT THIẾT BỊ & VỊ TRÍ ĐỊA LÝ */}
          {visitHoverOpen && (
            <div className="absolute left-0 right-0 sm:right-auto sm:w-[460px] top-[calc(100%+8px)] z-50 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#00B8DD]/40 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#00B8DD]" />
                    Thiết Bị &amp; Vị Trí Địa Lý Truy Cập
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tổng {formatNumber(traffic?.totalVisits || 0)} lượt xem • {formatNumber(traffic?.uniqueVisitors || 0)} phiên duy nhất
                  </p>
                </div>
                <Badge className="bg-[#00B8DD] text-white font-bold text-xs">
                  {formatNumber(traffic?.uniqueVisitors || 0)} phiên
                </Badge>
              </div>

              <div className="max-h-80 overflow-y-auto pr-1 space-y-3.5">
                {/* Phân bổ Thiết bị & HĐH */}
                <div className="space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-[#00B8DD]" /> Thiết bị &amp; Hệ điều hành
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-500">Desktop</div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {traffic?.deviceBreakdown?.desktop || 0}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-500">Mobile</div>
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {traffic?.deviceBreakdown?.mobile || 0}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-500">Tablet</div>
                      <div className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {traffic?.deviceBreakdown?.tablet || 0}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-500">Bot / Khác</div>
                      <div className="font-extrabold text-amber-600 dark:text-amber-400">
                        {traffic?.deviceBreakdown?.bot || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {(traffic?.byOs || []).slice(0, 5).map((os) => (
                      <span
                        key={os.name}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                      >
                        {os.name}: <b>{os.visits}</b> ({os.percentage}%)
                      </span>
                    ))}
                    {(traffic?.byBrowser || []).slice(0, 4).map((br) => (
                      <span
                        key={br.name}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[11px] font-semibold text-[#0088A9] dark:text-[#00B8DD]"
                      >
                        {br.name}: <b>{br.visits}</b>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Phân bổ Vị trí địa lý */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Vị trí địa lý (Tỉnh/Thành &amp; Quốc gia)
                  </div>
                  {(traffic?.byLocation || []).length === 0 ? (
                    <p className="text-xs text-slate-400">Chưa có dữ liệu vị trí truy cập.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(traffic?.byLocation || []).slice(0, 6).map((loc) => (
                        <div
                          key={loc.locationKey}
                          className="p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                              <span className="break-words">{loc.city}</span>
                              {loc.countryCode !== 'LEGACY' && (
                                <span className="text-[10px] font-medium text-slate-400">
                                  ({loc.country})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {loc.visits} lượt
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({loc.uniqueVisitors} phiên • {loc.percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full rounded-full bg-[#00B8DD] transition-all duration-300"
                              style={{ width: `${Math.max(4, loc.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KPI 2: SỐ ĐỀ HỌC SINH ĐÃ TẠO */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Số Đề Học Sinh Đã Tạo
              </p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                {formatNumber(exams?.totalCreated || 0)}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">đề đã tạo</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành (≥ 3 câu):
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatNumber(exams?.completedCount || 0)} đề ({exams?.completionRate || 0}%)
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <FileX2 className="w-3.5 h-3.5" /> Bỏ trống (0 hoặc &lt; 3 câu):
              </span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {formatNumber(exams?.abandonedOrBlankCount || 0)} đề ({exams?.abandonRate || 0}%)
              </span>
            </div>
          </div>
        </Card>

        {/* KPI 3: TỔNG SỐ CÂU HỎI NGÂN HÀNG ĐỀ (HOVER RA CHI TIẾT TỪNG MÔN BAO NHIÊU CÂU) */}
        <div
          className="relative"
          onMouseEnter={() => setQuestionHoverOpen(true)}
          onMouseLeave={() => setQuestionHoverOpen(false)}
        >
          <Card
            onClick={() => setQuestionHoverOpen((prev) => !prev)}
            className="h-full p-5 bg-white dark:bg-slate-900 border-2 border-indigo-500/30 hover:border-indigo-500 dark:border-indigo-500/40 shadow-xs flex flex-col justify-between cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    3. Tổng Câu Hỏi Ngân Hàng
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Info className="w-3 h-3" /> Hover xem từng môn
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {formatNumber(qBank?.totalQuestions || 0)}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">câu hỏi</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-slate-500 dark:text-slate-400">Số môn học có đề:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {qBank?.totalSubjects || 0} môn học K-12
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Di chuột vào thẻ này để xem chi tiết từng môn →
                </span>
              </div>
            </div>
          </Card>

          {/* HOVER POPOVER CHI TIẾT TỪNG MÔN BAO NHIÊU CÂU */}
          {questionHoverOpen && (
            <div className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-[420px] top-[calc(100%+8px)] z-50 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Chi Tiết Câu Hỏi Theo Từng Môn
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tổng cộng {formatNumber(qBank?.totalQuestions || 0)} câu trên {qBank?.totalSubjects || 0} môn
                  </p>
                </div>
                <Badge className="bg-indigo-600 text-white font-bold text-xs">
                  {formatNumber(qBank?.totalQuestions || 0)} câu
                </Badge>
              </div>

              <div className="max-h-80 overflow-y-auto pr-1 space-y-2.5">
                {(qBank?.bySubject || []).map((subj) => (
                  <div
                    key={subj.slug}
                    className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: subj.color }}
                        />
                        <span>{subj.name}</span>
                        <span className="text-[10px] font-medium text-slate-400">
                          ({subj.group})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {formatNumber(subj.count)} câu
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          ({subj.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(4, subj.percentage)}%`,
                          backgroundColor: subj.color,
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>NB: <b>{subj.byBloom?.NHAN_BIET || 0}</b></span>
                      <span>•</span>
                      <span>TH: <b>{subj.byBloom?.THONG_HIEU || 0}</b></span>
                      <span>•</span>
                      <span>VD: <b>{subj.byBloom?.VAN_DUNG || 0}</b></span>
                      <span>•</span>
                      <span>VDC: <b>{subj.byBloom?.VAN_DUNG_CAO || 0}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KPI 4: SỐ GÓI ĐĂNG KÝ ĐÃ BÁN { GÓI 1, GÓI 2 } */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Số Gói Đăng Ký Đã Bán
              </p>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                {formatNumber(pkgSales?.totalSold || 0)}
                <span className="text-xs font-semibold text-slate-400 ml-1.5">gói đã bán</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center text-amber-500 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-sky-600 dark:text-sky-400 font-semibold">
                • Gói 1 (Bứt Phá 50k):
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatNumber(pkgSales?.package1?.soldCount || 0)} gói ({formatMoney(pkgSales?.package1?.revenue || 0)})
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                • Gói 2 (Thủ Khoa VIP 100k):
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatNumber(pkgSales?.package2?.soldCount || 0)} gói ({formatMoney(pkgSales?.package2?.revenue || 0)})
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* =====================================================================
          PHẦN 2: PHÂN TÍCH CHUYÊN SÂU SỐ ĐỀ HỌC SINH ĐÃ TẠO & PHỔ ĐIỂM 4 MỐC
          {số đề đã hoàn thành, số đề bị bỏ trống (không chọn hoặc chọn dưới 3 câu),
           số đề hoàn thành trên dưới 5đ, 5-6.5đ, 6.5-8.5đ, 8.5-10đ}
      ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (5 cols): ĐỀ ĐÃ HOÀN THÀNH VS ĐỀ BỊ BỎ TRỐNG (0 CÂU HOẶC < 3 CÂU) */}
        <Card className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#00B8DD]" />
                Tỷ Lệ Hoàn Thành vs Bỏ Trống Đề Thi
              </h2>
              <Badge variant="outline" className="font-bold text-xs">
                Tổng: {formatNumber(exams?.totalCreated || 0)} đề
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Đề bị bỏ trống được tính khi học sinh không chọn câu nào (0 câu) hoặc chỉ chọn dưới 3 câu (1 - 2 câu) rồi thoát/nộp.
            </p>
          </div>

          {/* Thanh tỷ lệ trực quan */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Hoàn thành: {exams?.completedCount || 0} đề ({exams?.completionRate || 0}%)
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                Bỏ trống (&lt; 3 câu): {exams?.abandonedOrBlankCount || 0} đề ({exams?.abandonRate || 0}%)
              </span>
            </div>
            <div className="w-full h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 overflow-hidden flex p-0.5">
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                style={{ width: `${Math.max(4, exams?.completionRate || 0)}%` }}
              />
              <div
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                style={{ width: `${Math.max(4, exams?.abandonRate || 0)}%` }}
              />
            </div>
          </div>

          {/* 2 Khối lớn: Đã hoàn thành vs Bỏ trống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Số Đề Đã Hoàn Thành
              </div>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
                {formatNumber(exams?.completedCount || 0)}
                <span className="text-xs font-semibold ml-1">đề</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                Đã làm và chọn từ 3 câu trở lên • Điểm TB: <b>{exams?.avgCompletedScore || 0}đ</b>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/60">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                <FileX2 className="w-4 h-4 shrink-0" />
                Số Đề Bị Bỏ Trống
              </div>
              <div className="text-3xl font-black text-rose-700 dark:text-rose-300 mt-2">
                {formatNumber(exams?.abandonedOrBlankCount || 0)}
                <span className="text-xs font-semibold ml-1">đề</span>
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-1">
                Không chọn hoặc chọn dưới 3 câu (&lt; 3 câu)
              </p>
            </div>
          </div>

          {/* Chi tiết bóc tách trong Số đề bị bỏ trống */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Chi tiết nhóm đề bị bỏ trống ({formatNumber(exams?.abandonedOrBlankCount || 0)} đề):
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pl-5">
              <span className="text-slate-600 dark:text-slate-400">
                • Không chọn câu nào (0 câu / thoát ngay):
              </span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {formatNumber(exams?.abandonedBreakdown?.zeroAnswersCount || 0)} đề
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pl-5">
              <span className="text-slate-600 dark:text-slate-400">
                • Chọn dưới 3 câu (chỉ chọn 1 hoặc 2 câu):
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                {formatNumber(exams?.abandonedBreakdown?.under3AnswersCount || 0)} đề
              </span>
            </div>
          </div>
        </Card>

        {/* CỘT PHẢI (7 cols): PHỔ ĐIỂM CỦA SỐ ĐỀ ĐÃ HOÀN THÀNH (TRÊN/DƯỚI 5Đ & 4 MỐC CHI TIẾT) */}
        <Card className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Phổ Điểm Của Số Đề Đã Hoàn Thành ({formatNumber(exams?.completedCount || 0)} Đề)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Phân loại số đề hoàn thành trên/dưới 5 điểm và bóc tách chính xác theo 4 khung điểm chuẩn.
              </p>
            </div>

            {/* Tổng quan Trên 5đ vs Dưới 5đ */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                Dưới 5đ: <span className="text-sm font-black">{exams?.completedOverview?.under5Count || 0}</span> đề
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Từ 5đ trở lên: <span className="text-sm font-black">{exams?.completedOverview?.aboveOrEqual5Count || 0}</span> đề
              </div>
            </div>
          </div>

          {/* 4 Mốc điểm chi tiết: Dưới 5đ | 5 - 6.5đ | 6.5 - 8.5đ | 8.5 - 10đ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Mốc 1: Dưới 5đ */}
            <div
              onClick={() => setAttemptFilter('UNDER_5')}
              className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-800/60 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-rose-500 text-white text-[10px] font-bold">
                  &lt; 5.0 điểm
                </Badge>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {exams?.scoreDistribution?.under5?.percentage || 0}%
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                {formatNumber(exams?.scoreDistribution?.under5?.count || 0)}
                <span className="text-xs font-semibold text-slate-400 ml-1">đề</span>
              </div>
              <div className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-1">
                Hoàn thành Dưới 5đ
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cần củng cố nền tảng (-1 Tia Sáng)
              </p>
            </div>

            {/* Mốc 2: 5 - 6.5đ */}
            <div
              onClick={() => setAttemptFilter('FROM_5_TO_6_5')}
              className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-white text-[10px] font-bold">
                  5.0 - 6.5đ
                </Badge>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {exams?.scoreDistribution?.from5to6_5?.percentage || 0}%
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                {formatNumber(exams?.scoreDistribution?.from5to6_5?.count || 0)}
                <span className="text-xs font-semibold text-slate-400 ml-1">đề</span>
              </div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-1">
                Mức Trung Bình (5 - 6.5đ)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Nắm được cơ bản, cần luyện thêm
              </p>
            </div>

            {/* Mốc 3: 6.5 - 8.5đ */}
            <div
              onClick={() => setAttemptFilter('FROM_6_5_TO_8_5')}
              className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/25 border border-sky-200/80 dark:border-sky-800/60 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-[#00B8DD] text-white text-[10px] font-bold">
                  6.5 - 8.5đ
                </Badge>
                <span className="text-xs font-bold text-[#0088A9] dark:text-[#00B8DD]">
                  {exams?.scoreDistribution?.from6_5to8_5?.percentage || 0}%
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                {formatNumber(exams?.scoreDistribution?.from6_5to8_5?.count || 0)}
                <span className="text-xs font-semibold text-slate-400 ml-1">đề</span>
              </div>
              <div className="text-xs font-bold text-[#0088A9] dark:text-[#00B8DD] mt-1">
                Mức Khá (6.5 - 8.5đ)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tư duy Thông hiểu & Vận dụng tốt
              </p>
            </div>

            {/* Mốc 4: 8.5 - 10đ */}
            <div
              onClick={() => setAttemptFilter('FROM_8_5_TO_10')}
              className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/60 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  8.5 - 10.0đ
                </Badge>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {exams?.scoreDistribution?.from8_5to10?.percentage || 0}%
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                {formatNumber(exams?.scoreDistribution?.from8_5to10?.count || 0)}
                <span className="text-xs font-semibold text-slate-400 ml-1">đề</span>
              </div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                Mức Giỏi / Xuất Sắc (8.5 - 10đ)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Đạt thưởng Ngọc Tri Thức (💎)
              </p>
            </div>
          </div>

          {/* Biểu đồ thanh ngang so sánh 4 mốc điểm */}
          <div className="space-y-2.5 pt-1">
            {[
              {
                label: 'Dưới 5.0đ (< 5đ)',
                count: exams?.scoreDistribution?.under5?.count || 0,
                pct: exams?.scoreDistribution?.under5?.percentage || 0,
                color: 'bg-rose-500',
              },
              {
                label: 'Từ 5.0đ đến 6.5đ',
                count: exams?.scoreDistribution?.from5to6_5?.count || 0,
                pct: exams?.scoreDistribution?.from5to6_5?.percentage || 0,
                color: 'bg-amber-500',
              },
              {
                label: 'Từ 6.5đ đến 8.5đ',
                count: exams?.scoreDistribution?.from6_5to8_5?.count || 0,
                pct: exams?.scoreDistribution?.from6_5to8_5?.percentage || 0,
                color: 'bg-[#00B8DD]',
              },
              {
                label: 'Từ 8.5đ đến 10.0đ',
                count: exams?.scoreDistribution?.from8_5to10?.count || 0,
                pct: exams?.scoreDistribution?.from8_5to10?.percentage || 0,
                color: 'bg-emerald-500',
              },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {row.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {row.count} đề ({row.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: `${Math.max(row.count > 0 ? 4 : 0, row.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* =====================================================================
          PHẦN 3: THỐNG KÊ SỐ GÓI ĐĂNG KÝ ĐÃ BÁN { GÓI 1, GÓI 2 }
      ====================================================================== */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Thống Kê Số Gói Đăng Ký Đã Bán (Gói 1 &amp; Gói 2)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bóc tách chi tiết số lượng đã bán, học sinh đang kích hoạt và doanh thu của Gói 1 (Bứt Phá 50k) và Gói 2 (Thủ Khoa VIP 100k).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1">
              Tổng đã bán: {formatNumber(pkgSales?.totalSold || 0)} gói
            </Badge>
            <Badge variant="outline" className="font-bold text-xs px-3 py-1">
              Tổng doanh thu gói: {formatMoney(pkgSales?.totalRevenue || 0)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* GÓI 1: GÓI BỨT PHÁ (50K) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/50 dark:from-sky-950/30 dark:via-slate-900 dark:to-indigo-950/20 border-2 border-sky-200/80 dark:border-sky-800/60 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge className="bg-[#00B8DD] text-white font-bold text-xs">
                  GÓI 1
                </Badge>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {pkgSales?.package1?.label || 'Gói 1: Gói Bứt Phá (50k)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Đơn giá niêm yết: <b>{formatMoney(pkgSales?.package1?.unitPrice || 50000)} / tháng</b>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-[#0088A9] dark:text-[#00B8DD]">
                  {formatNumber(pkgSales?.package1?.soldCount || 0)}
                  <span className="text-xs font-bold ml-1">gói đã bán</span>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Doanh thu: {formatMoney(pkgSales?.package1?.revenue || 0)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sky-200/60 dark:border-sky-800/50 text-center">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70">
                <div className="text-[11px] text-slate-500">Đã thanh toán</div>
                <div className="text-base font-extrabold text-emerald-600">
                  {pkgSales?.package1?.soldCount || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70">
                <div className="text-[11px] text-slate-500">Đang Active</div>
                <div className="text-base font-extrabold text-sky-600">
                  {pkgSales?.package1?.activeSubscribersCount || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70">
                <div className="text-[11px] text-slate-500">Chờ QR (Pending)</div>
                <div className="text-base font-extrabold text-amber-600">
                  {pkgSales?.package1?.pendingOrdersCount || 0}
                </div>
              </div>
            </div>

            {pkgSales?.package1?.buyers && pkgSales.package1.buyers.length > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
                <span className="font-bold">Học sinh đã mua Gói 1:</span>
                {pkgSales.package1.buyers.map((b) => (
                  <Badge key={b} variant="secondary" className="text-[11px]">
                    {b}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* GÓI 2: GÓI THỦ KHOA VIP (100K) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 border-2 border-amber-300/80 dark:border-amber-800/60 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge className="bg-amber-500 text-white font-bold text-xs">
                  GÓI 2 (VIP)
                </Badge>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {pkgSales?.package2?.label || 'Gói 2: Gói Thủ Khoa VIP (100k)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Đơn giá niêm yết: <b>{formatMoney(pkgSales?.package2?.unitPrice || 100000)} / tháng</b>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {formatNumber(pkgSales?.package2?.soldCount || 0)}
                  <span className="text-xs font-bold ml-1">gói đã bán</span>
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Doanh thu: {formatMoney(pkgSales?.package2?.revenue || 0)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/50 text-center">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70">
                <div className="text-[11px] text-slate-500">Đã bán / Kích hoạt</div>
                <div className="text-base font-extrabold text-emerald-600">
                  {pkgSales?.package2?.soldCount || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70">
                <div className="text-[11px] text-slate-500">Đang Active VIP</div>
                <div className="text-base font-extrabold text-amber-600">
                  {pkgSales?.package2?.activeSubscribersCount || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70">
                <div className="text-[11px] text-slate-500">Chờ QR (Pending)</div>
                <div className="text-base font-extrabold text-amber-600">
                  {pkgSales?.package2?.pendingOrdersCount || 0}
                </div>
              </div>
            </div>

            {pkgSales?.package2?.buyers && pkgSales.package2.buyers.length > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
                <span className="font-bold">Học sinh sở hữu Gói 2:</span>
                {pkgSales.package2.buyers.map((b) => (
                  <Badge key={b} variant="secondary" className="text-[11px]">
                    {b}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* =====================================================================
          PHẦN 3.5: THỐNG KÊ THIẾT BỊ, HỆ ĐIỀU HÀNH, TRÌNH DUYỆT & VỊ TRÍ ĐỊA LÝ
      ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (5 cols): THIẾT BỊ, HỆ ĐIỀU HÀNH & TRÌNH DUYỆT */}
        <Card className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[#00B8DD]" />
              Thiết Bị, Hệ Điều Hành &amp; Trình Duyệt
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phân tích nền tảng phần cứng và trình duyệt của khách truy cập thực tế.
            </p>
          </div>

          {/* 4 ô loại thiết bị */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0088A9] dark:text-[#00B8DD]">
                <Monitor className="w-3.5 h-3.5 shrink-0" /> Desktop
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(traffic?.deviceBreakdown?.desktop || 0)}
              </div>
              <div className="text-[10px] text-slate-500">Máy tính bàn / Laptop</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-3.5 h-3.5 shrink-0" /> Mobile
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(traffic?.deviceBreakdown?.mobile || 0)}
              </div>
              <div className="text-[10px] text-slate-500">Điện thoại di động</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Tablet className="w-3.5 h-3.5 shrink-0" /> Tablet
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(traffic?.deviceBreakdown?.tablet || 0)}
              </div>
              <div className="text-[10px] text-slate-500">iPad / Máy tính bảng</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Bot className="w-3.5 h-3.5 shrink-0" /> Bot
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(traffic?.deviceBreakdown?.bot || 0)}
              </div>
              <div className="text-[10px] text-slate-500">Crawler / Tự động</div>
            </div>
          </div>

          {/* Hệ điều hành (OS) */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00B8DD]" /> Hệ điều hành (OS)
            </div>
            {(traffic?.byOs || []).length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có dữ liệu hệ điều hành.</p>
            ) : (
              <div className="space-y-2">
                {(traffic?.byOs || []).map((os) => (
                  <div
                    key={os.name}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 break-words">
                        {os.name}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">
                        <b className="text-slate-900 dark:text-white">{formatNumber(os.visits)}</b> lượt •{' '}
                        {os.uniqueVisitors} phiên ({os.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full bg-[#00B8DD] transition-all duration-300"
                        style={{ width: `${Math.max(4, os.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trình duyệt (Browser) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-500" /> Trình duyệt (Browser)
            </div>
            {(traffic?.byBrowser || []).length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có dữ liệu trình duyệt.</p>
            ) : (
              <div className="space-y-2">
                {(traffic?.byBrowser || []).map((br) => (
                  <div
                    key={br.name}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 break-words">
                        {br.name}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">
                        <b className="text-slate-900 dark:text-white">{formatNumber(br.visits)}</b> lượt •{' '}
                        {br.uniqueVisitors} phiên ({br.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${Math.max(4, br.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* CỘT PHẢI (7 cols): VỊ TRÍ ĐỊA LÝ & NHẬT KÝ PHIÊN TRUY CẬP GẦN NHẤT */}
        <Card className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00B8DD]" />
                Vị Trí Địa Lý &amp; Nhật Ký Truy Cập Thực Tế
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thống kê Tỉnh/Thành phố, Quốc gia (qua Cloudflare &amp; GeoIP) và chi tiết từng phiên vào web.
              </p>
            </div>

            {/* Nút chuyển chế độ xem — flex-wrap chuẩn Zero Horizontal Scroll */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setGeoTab('LOCATIONS')}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  geoTab === 'LOCATIONS'
                    ? 'bg-[#00B8DD] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                Tỉnh/Thành &amp; Quốc gia ({traffic?.byLocation?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setGeoTab('RECENT_LOGS')}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  geoTab === 'RECENT_LOGS'
                    ? 'bg-[#00B8DD] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                Nhật ký từng phiên ({traffic?.recentVisits?.length || 0})
              </button>
            </div>
          </div>

          {geoTab === 'LOCATIONS' ? (
            <div className="space-y-4">
              {/* Tổng quan Quốc gia */}
              {(traffic?.byCountry || []).length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {(traffic?.byCountry || []).map((c) => (
                    <span
                      key={`${c.countryCode}-${c.country}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/70 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                      <span>{c.country}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-extrabold bg-white dark:bg-slate-800"
                      >
                        {c.visits} lượt ({c.percentage}%)
                      </Badge>
                    </span>
                  ))}
                </div>
              )}

              {/* Danh sách chi tiết theo Tỉnh/Thành phố */}
              {(traffic?.byLocation || []).length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Chưa có dữ liệu vị trí địa lý
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Các lượt truy cập mới từ trang khách sẽ tự động hiển thị Tỉnh/Thành phố và Quốc gia tại đây.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {(traffic?.byLocation || []).map((loc, idx) => (
                    <div
                      key={loc.locationKey}
                      className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-[#00B8DD]/60 transition-all"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00B8DD]/15 text-[#0088A9] dark:text-[#00B8DD] text-[11px] font-extrabold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white break-words">
                              {loc.city}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{loc.country}</span>
                            {loc.countryCode && loc.countryCode !== 'LEGACY' && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-[10px] font-mono font-bold">
                                {loc.countryCode}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatNumber(loc.visits)} lượt
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {formatNumber(loc.uniqueVisitors)} phiên ({loc.percentage}%)
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2.5">
                        <div
                          className="h-full rounded-full bg-[#00B8DD] transition-all duration-300"
                          style={{ width: `${Math.max(5, loc.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* NHẬT KÝ TỪNG PHIÊN TRUY CẬP GẦN NHẤT */
            <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
              {(traffic?.recentVisits || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chưa ghi nhận phiên truy cập nào.
                </p>
              ) : (
                (traffic?.recentVisits || []).map((rv) => (
                  <div
                    key={rv.id}
                    className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold ${
                            rv.deviceType === 'MOBILE'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : rv.deviceType === 'TABLET'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                : rv.deviceType === 'BOT'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-sky-100 text-[#0088A9] dark:bg-sky-950 dark:text-[#00B8DD]'
                          }`}
                        >
                          {rv.deviceType}
                        </Badge>
                        <span className="font-bold text-slate-900 dark:text-white break-words">
                          {rv.pageTitle}
                        </span>
                        <span className="font-mono text-[11px] text-[#0088A9] dark:text-[#00B8DD] break-all">
                          ({rv.path})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(rv.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Monitor className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                        {rv.deviceModel} • {rv.osName} • {rv.browserName}
                        {rv.screenResolution ? ` (${rv.screenResolution})` : ''}
                      </span>

                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {rv.locationLabel}
                      </span>

                      {rv.ipAddress && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 font-mono text-[10px]">
                          IP: {rv.ipAddress}
                        </span>
                      )}

                      {rv.ispName && (
                        <span className="text-slate-500 dark:text-slate-400">
                          ISP: {rv.ispName}
                        </span>
                      )}

                      <span className="text-slate-400">
                        {rv.userName ? `Học sinh: ${rv.userName}` : `Khách (${rv.sessionId.slice(0, 12)})`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* =====================================================================
          PHẦN 4: LƯỢT TRUY CẬP WEB CHI TIẾT & NGÂN HÀNG CÂU HỎI TỪNG MÔN
      ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (6 cols): BIỂU ĐỒ LƯỢT TRUY CẬP & TOP TRANG ĐƯỢC XEM */}
        <Card className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00B8DD]" />
                Lưu Lượng Truy Cập &amp; Trang Xem Nhiều Nhất
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thống kê xu hướng ngày và các đường dẫn được học sinh sử dụng nhiều nhất.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                <Monitor className="w-3.5 h-3.5 text-sky-500" /> Desktop: {traffic?.deviceBreakdown?.desktop || 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Mobile: {traffic?.deviceBreakdown?.mobile || 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                <Tablet className="w-3.5 h-3.5 text-indigo-500" /> Tablet: {traffic?.deviceBreakdown?.tablet || 0}
              </span>
              {(traffic?.deviceBreakdown?.bot || 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                  <Bot className="w-3.5 h-3.5 text-amber-500" /> Bot: {traffic?.deviceBreakdown?.bot || 0}
                </span>
              )}
            </div>
          </div>

          {/* Biểu đồ cột 14 ngày */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-500 mb-2">
              Xu hướng lượt truy cập 14 ngày gần nhất:
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 items-end h-32 pt-4 px-2 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              {(traffic?.dailyTrend || []).map((day) => {
                const heightPct = Math.max(8, Math.round((day.visits / maxDailyVisit) * 100));
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center justify-end h-full group relative"
                  >
                    <div className="text-[9px] font-bold text-slate-500 mb-1">
                      {day.visits > 0 ? day.visits : ''}
                    </div>
                    <div
                      className="w-full max-w-[20px] rounded-t-md bg-[#00B8DD] group-hover:bg-indigo-600 transition-all"
                      style={{ height: `${heightPct}%` }}
                      title={`${day.label}: ${day.visits} lượt truy cập, ${day.examsCreated} đề tạo`}
                    />
                    <span className="text-[9px] text-slate-400 mt-1">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danh sách Top Trang Truy Cập */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Top trang được truy cập nhiều nhất:
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(traffic?.topPages || []).map((pg) => (
                <div
                  key={pg.path}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {pg.pageTitle}
                    </div>
                    <div className="text-[11px] text-[#0088A9] dark:text-[#00B8DD] font-mono">
                      {pg.path}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {formatNumber(pg.visits)} lượt ({pg.percentage}%)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {pg.uniqueVisitors} khách duy nhất
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* CỘT PHẢI (6 cols): BẢNG CHI TIẾT CÂU HỎI TỪNG MÔN TRONG NGÂN HÀNG */}
        <Card className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Chi Tiết Ngân Hàng Câu Hỏi Theo Từng Môn ({formatNumber(qBank?.totalQuestions || 0)} Câu)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Phân bổ số lượng câu hỏi thực tế trong PostgreSQL của từng môn học &amp; mức độ nhận thức.
              </p>
            </div>
            <Link href="/admin/questions">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1">
                Quản lý câu hỏi <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {(qBank?.bySubject || []).map((subj) => (
              <div
                key={subj.slug}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-400 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {subj.name}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-extrabold text-xs text-slate-900 dark:text-white shrink-0"
                  >
                    {formatNumber(subj.count)} câu ({subj.percentage}%)
                  </Badge>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(5, subj.percentage)}%`,
                      backgroundColor: subj.color,
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Nhận biết: <b>{subj.byBloom?.NHAN_BIET || 0}</b></span>
                  <span>Thông hiểu: <b>{subj.byBloom?.THONG_HIEU || 0}</b></span>
                  <span>VD/VDC: <b>{(subj.byBloom?.VAN_DUNG || 0) + (subj.byBloom?.VAN_DUNG_CAO || 0)}</b></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* =====================================================================
          PHẦN 5: THỐNG KÊ MỌI THỨ KHÁC CỦA WEB (USERS, ĐIỂM TIA SÁNG/NGỌC, GIA SƯ AI, HÀNH VI LUYỆN 3 CÂU)
      ====================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ Hệ sinh thái Người dùng */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Người Dùng Thực Tế (Real)</span>
            <Users className="w-4 h-4 text-[#00B8DD]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatNumber(everything?.users?.studentsCount || 0)} học sinh
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="pl-3 py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">↳ Lớp 12:</span>
                <b className="text-emerald-600 dark:text-emerald-400">
                  {everything?.users?.grade12Count || 0} học sinh
                </b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">↳ Lớp 11:</span>
                <b className="text-[#0088A9] dark:text-[#00B8DD]">
                  {everything?.users?.grade11Count || 0} học sinh
                </b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">↳ Lớp 10:</span>
                <b className="text-indigo-600 dark:text-indigo-400">
                  {everything?.users?.grade10Count || 0} học sinh
                </b>
              </div>
              {(everything?.users?.otherGradesCount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">↳ Khối lớp khác:</span>
                  <b className="text-violet-600 dark:text-violet-400">
                    {everything?.users?.otherGradesCount || 0} học sinh
                  </b>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">↳ Chưa bổ sung thông tin:</span>
                <b className="text-amber-600 dark:text-amber-400">
                  {everything?.users?.incompleteProfileCount || 0} học sinh
                </b>
              </div>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>• Giáo viên &amp; Chuyên gia:</span>
              <b className="text-slate-900 dark:text-white">{everything?.users?.teachersCount || 0}</b>
            </div>
            <div className="flex justify-between">
              <span>• Quản trị viên (Admin):</span>
              <b className="text-slate-900 dark:text-white">{everything?.users?.adminsCount || 0}</b>
            </div>
          </div>
        </Card>

        {/* Thẻ Kinh tế Tia Sáng & Ngọc Tri Thức */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Kinh Tế Điểm &amp; Đổi Quà</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-lg font-black text-amber-600">
              <TiaSangIcon className="w-4 h-4" />
              {formatNumber(everything?.pointsAndEconomy?.totalTiaSangInCirculation || 0)}
            </div>
            <div className="flex items-center gap-1 text-lg font-black text-sky-600">
              <NgocIcon className="w-4 h-4" />
              {formatNumber(everything?.pointsAndEconomy?.totalDiamondsInCirculation || 0)}
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>• Lượt mở đề trừ Tia Sáng:</span>
              <b>{everything?.pointsAndEconomy?.totalExamStartsLogged || 0} lượt</b>
            </div>
            <div className="flex justify-between">
              <span>• Lượt thưởng ≥ 8.5đ / Phạt &lt; 5đ:</span>
              <b>+{everything?.pointsAndEconomy?.totalRewardsGranted || 0} / -{everything?.pointsAndEconomy?.totalPenalties || 0}</b>
            </div>
            <div className="flex justify-between">
              <span>• Điểm danh / Đổi quà Store:</span>
              <b>{everything?.pointsAndEconomy?.totalCheckins || 0} / {everything?.pointsAndEconomy?.storeRedemptionsCount || 0} quà</b>
            </div>
          </div>
        </Card>

        {/* Thẻ Gia sư AI Socratic */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Gia Sư AI Socratic</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatNumber(everything?.aiAndAdaptiveLearning?.totalAiChatMessages || 0)} tin nhắn
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>• Tổng phiên hội thoại AI:</span>
              <b>{everything?.aiAndAdaptiveLearning?.totalAiChatSessions || 0} phiên</b>
            </div>
            <div className="flex justify-between">
              <span>• Dùng giải mẫu AI trong bài:</span>
              <b>{everything?.aiAndAdaptiveLearning?.usedAiExampleCount || 0} lượt</b>
            </div>
            <div className="flex justify-between">
              <span>• Khóa học &amp; Bài giảng số:</span>
              <b>{everything?.contentAndCourses?.totalCourses || 0} khóa / {everything?.contentAndCourses?.totalLessons || 0} bài</b>
            </div>
          </div>
        </Card>

        {/* Thẻ Hành vi Luyện 3 câu cùng dạng & Lộ trình */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Hành Vi Luyện Thích Ứng</span>
            <Brain className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatNumber(everything?.aiAndAdaptiveLearning?.totalDrill3Sessions || 0)} phiên Drill-3
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>• Kiên trì cao / Chủ động:</span>
              <b className="text-emerald-600">
                {(everything?.aiAndAdaptiveLearning?.spiritBreakdown?.highGrit || 0) +
                  (everything?.aiAndAdaptiveLearning?.spiritBreakdown?.moderateInitiative || 0)}{' '}
                phiên
              </b>
            </div>
            <div className="flex justify-between">
              <span>• Bỏ cuộc / Skip câu:</span>
              <b className="text-rose-500">
                {(everything?.aiAndAdaptiveLearning?.spiritBreakdown?.lowPatience || 0) +
                  (everything?.aiAndAdaptiveLearning?.spiritBreakdown?.avoidanceSkipped || 0)}{' '}
                phiên
              </b>
            </div>
            <div className="flex justify-between">
              <span>• Chủ đề năng lực &amp; Lộ trình:</span>
              <b>{everything?.aiAndAdaptiveLearning?.topicMasteriesCount || 0} / {everything?.aiAndAdaptiveLearning?.roadmapStepsCount || 0}</b>
            </div>
          </div>
        </Card>
      </div>

      {/* =====================================================================
          PHẦN 6: BẢNG NHẬT KÝ CHI TIẾT CÁC ĐỀ HỌC SINH ĐÃ TẠO (CÓ LỌC THEO MỐC ĐIỂM & BỎ TRỐNG)
      ====================================================================== */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#00B8DD]" />
              Nhật Ký Chi Tiết Đề Học Sinh Đã Tạo &amp; Hành Vi Làm Bài
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kiểm tra từng đề thi học sinh đã tạo, số câu thực tế đã chọn, thời gian làm bài và phân nhóm điểm số.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên học sinh, môn, tên đề..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>
        </div>

        {/* Bộ lọc nút bấm tự động xuống dòng (flex-wrap, Zero Horizontal Scroll) */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `Tất cả (${exams?.totalCreated || 0})` },
            { id: 'COMPLETED', label: `Đã hoàn thành ≥ 3 câu (${exams?.completedCount || 0})` },
            { id: 'ABANDONED', label: `Bị bỏ trống < 3 câu (${exams?.abandonedOrBlankCount || 0})` },
            { id: 'UNDER_5', label: `Dưới 5đ (${exams?.scoreDistribution?.under5?.count || 0})` },
            { id: 'FROM_5_TO_6_5', label: `5 - 6.5đ (${exams?.scoreDistribution?.from5to6_5?.count || 0})` },
            { id: 'FROM_6_5_TO_8_5', label: `6.5 - 8.5đ (${exams?.scoreDistribution?.from6_5to8_5?.count || 0})` },
            { id: 'FROM_8_5_TO_10', label: `8.5 - 10đ (${exams?.scoreDistribution?.from8_5to10?.count || 0})` },
          ].map((tab) => {
            const active = attemptFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAttemptFilter(tab.id as AttemptFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#00B8DD] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Danh sách bài làm (Responsive: Card list trên mobile, Bảng đầy đủ trên Desktop) */}
        <div className="space-y-2.5">
          {filteredAttempts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              Không có bản ghi đề thi nào khớp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredAttempts.slice(0, 25).map((att) => {
              const isBlank = att.completionStatus !== 'COMPLETED';
              return (
                <div
                  key={att.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {att.studentName}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        Khối {att.grade} • {att.subjectName}
                      </Badge>
                      <Badge
                        className={`text-[10px] font-bold ${
                          isBlank
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {att.completionLabel}
                      </Badge>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 break-words">
                      {att.examTitle}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        Số câu đã chọn:{' '}
                        <b className={isBlank ? 'text-rose-600' : 'text-emerald-600'}>
                          {att.answeredCount}/{att.totalQuestions} câu
                        </b>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Thời gian: <b>{formatDuration(att.timeSpentSeconds)}</b>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(att.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                    <div
                      className={`text-xl font-black ${
                        isBlank
                          ? 'text-slate-400'
                          : att.score < 5
                            ? 'text-rose-600'
                            : att.score < 6.5
                              ? 'text-amber-600'
                              : att.score < 8.5
                                ? 'text-[#0088A9] dark:text-[#00B8DD]'
                                : 'text-emerald-600'
                      }`}
                    >
                      {att.score.toFixed(1)}đ
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {att.scoreBucket}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
