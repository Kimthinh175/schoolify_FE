'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Gift,
  Award,
  CalendarCheck,
  History,
  TrendingUp,
  TrendingDown,
  Search,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  FileCheck2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_STORE_ITEMS } from '@/services/mock/data';
import { StoreItem } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import {
  examPointsService,
  ExamPointsBalanceResponse,
  ExamPointLogItem,
  notifyExamPointsUpdated,
} from '@/services/exam-points.service';
import { catalogService } from '@/services/catalog.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';

const STORE_ITEMS_PER_PAGE = 6;
const HISTORY_ITEMS_PER_PAGE = 8;

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  VOUCHER: {
    label: 'Voucher Ưu Đãi',
    color: 'bg-white/95 text-[#007D99] border-[#00B8DD]/30 dark:bg-slate-900/90 dark:text-[#00B8DD] dark:border-[#00B8DD]/40',
  },
  BADGE: {
    label: 'Huy Hiệu Vinh Danh',
    color: 'bg-white/95 text-slate-700 border-slate-200/90 dark:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700',
  },
  THEME: {
    label: 'Học Liệu & Giao Diện',
    color: 'bg-white/95 text-[#007D99] border-[#00B8DD]/30 dark:bg-slate-900/90 dark:text-[#00B8DD] dark:border-[#00B8DD]/40',
  },
  OTHER: {
    label: 'Quà Tặng Hiện Vật',
    color: 'bg-white/95 text-slate-700 border-slate-200/90 dark:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700',
  },
};

const ACTION_TYPE_LABELS: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'primary' | 'secondary' }> = {
  DAILY_CHECKIN: { label: 'Điểm danh (+9 Tia)', variant: 'primary' },
  DAILY_GRANT: { label: 'Cấp 9 Tia đầu ngày', variant: 'primary' },
  START_EXAM: { label: 'Mở đề luyện thi', variant: 'secondary' },
  SCORE_REWARD_8_5_TO_9_9: { label: 'Thưởng 8.5–9.9đ (+1 Tia)', variant: 'success' },
  SCORE_REWARD_10: { label: 'Thưởng 10đ (+2 Tia)', variant: 'success' },
  SCORE_NEUTRAL: { label: 'Hoàn thành đề (0 Tia)', variant: 'secondary' },
  SCORE_PENALTY_UNDER_5: { label: 'Phạt dưới 5.0đ (-1 Tia)', variant: 'danger' },
  REDEEM_REWARD: { label: 'Đổi quà bằng Ngọc', variant: 'primary' },
  ADMIN_CSKH_ADJUST: { label: 'Hỗ trợ CSKH (Admin)', variant: 'primary' },
};

export default function StudentRewardsStorePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<'STORE' | 'HISTORY' | 'QUOTA'>('STORE');

  // Số dư điểm & trạng thái điểm danh (Tách bạch Tia Sáng ⚡ & Ngọc Tri Thức 💎)
  const [balanceData, setBalanceData] = React.useState<ExamPointsBalanceResponse | null>(null);
  const [points, setPoints] = React.useState<number>(9);
  const [diamonds, setDiamonds] = React.useState<number>(100);
  const [alreadyClaimedToday, setAlreadyClaimedToday] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isClaiming, setIsClaiming] = React.useState<boolean>(false);

  // Danh sách quà tặng từ PostgreSQL
  const [storeItems, setStoreItems] = React.useState<StoreItem[]>(MOCK_STORE_ITEMS);
  const [redeemingId, setRedeemingId] = React.useState<string | null>(null);
  const [redeemedResult, setRedeemedResult] = React.useState<{
    item: StoreItem;
    voucherCode: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

  // Bộ lọc & phân trang cho Cửa hàng đổi quà
  const [storeSearch, setStoreSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedPriceFilter, setSelectedPriceFilter] = React.useState<string>('ALL');
  const [storeSort, setStoreSort] = React.useState<'POINTS_ASC' | 'POINTS_DESC' | 'STOCK_DESC'>('POINTS_ASC');
  const [storePage, setStorePage] = React.useState(1);

  // Lịch sử giao dịch điểm & bộ lọc + phân trang
  const [historyItems, setHistoryItems] = React.useState<ExamPointLogItem[]>([]);
  const [historySearch, setHistorySearch] = React.useState('');
  const [selectedActionType, setSelectedActionType] = React.useState<string>('ALL');
  const [historyPage, setHistoryPage] = React.useState(1);

  const loadAllData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        setBalanceData(null);
        setPoints(0);
        setDiamonds(0);
        setAlreadyClaimedToday(false);
        setHistoryItems([]);
        const items = await catalogService.getStoreItems();
        if (Array.isArray(items) && items.length > 0) {
          setStoreItems(items);
        }
        return;
      }

      const [bal, hist, items] = await Promise.all([
        examPointsService.getBalance(user?.id),
        examPointsService.getHistory({ userId: user?.id, page: 1, limit: 100 }),
        catalogService.getStoreItems(),
      ]);

      if (bal) {
        setBalanceData(bal);
        setPoints(bal.currentPoints);
        setDiamonds(typeof bal.diamonds === 'number' ? bal.diamonds : bal.currentPoints);
        setAlreadyClaimedToday(Boolean(bal.alreadyClaimedToday));
      }
      if (hist?.items) {
        setHistoryItems(hist.items);
      } else if (bal?.recentLogs) {
        setHistoryItems(bal.recentLogs);
      }
      if (Array.isArray(items) && items.length > 0) {
        setStoreItems(items);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Điểm danh hàng ngày (Mỗi ngày chỉ nhận 1 lần duy nhất; bấm lần 2 báo đã điểm danh)
  const handleDailyClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await examPointsService.claimDailyPoints({
        userId: user?.id,
        forceReset: false,
      });

      if (res?.data?.alreadyClaimedToday && res?.data?.claimed === false) {
        setAlreadyClaimedToday(true);
        toast.warning('Hôm nay bạn đã điểm danh rồi!', {
          description:
            res.message ||
            'Mỗi ngày hệ thống chỉ cấp 9 Tia Sáng (⚡) 1 lần. Vui lòng quay lại vào ngày mai nhé!',
        });
        return;
      }

      if (res?.success && res?.data) {
        setPoints(res.data.currentPoints);
        notifyExamPointsUpdated(res.data.currentPoints);
        setAlreadyClaimedToday(true);
        toast.success('Điểm danh nhận 9 Tia Sáng (⚡) thành công!', {
          description: res.message,
        });
        await loadAllData();
      } else {
        toast.error(res?.message || 'Không thể điểm danh lúc này.');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ khi điểm danh.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Đổi quà tặng bằng Ngọc Tri Thức (💎)
  const handleRedeemItem = async (item: StoreItem) => {
    if (diamonds < item.points_required) {
      toast.error(
        `Bạn cần ${item.points_required} Ngọc Tri Thức (💎) để đổi quà này (hiện có ${diamonds} 💎).`
      );
      return;
    }

    setRedeemingId(item.id);
    try {
      const res = await catalogService.redeemStoreItem(item.id, user?.id);
      if (res?.ok && res?.success && res?.data) {
        const nextDiamonds = Number(
          res.data.diamonds ?? res.data.currentPoints ?? diamonds - item.points_required
        );
        setDiamonds(nextDiamonds);
        setRedeemedResult({
          item,
          voucherCode: res.data.voucherCode || `SCH-GIFT-${Date.now().toString().slice(-6)}`,
        });
        toast.success(`Đổi quà "${item.name}" thành công!`);
        await loadAllData();
      } else {
        toast.error(res?.message || 'Không thể đổi phần thưởng này.');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi đổi quà.');
    } finally {
      setRedeemingId(null);
    }
  };

  // Lọc & sắp xếp danh sách quà tặng
  const filteredStoreItems = React.useMemo(() => {
    const q = storeSearch.trim().toLowerCase();
    const list = storeItems.filter((item) => {
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      if (selectedCategory !== 'ALL' && item.type !== selectedCategory) {
        return false;
      }
      const reqPts = Number(item.points_required || 0);
      if (selectedPriceFilter === 'AFFORDABLE' && reqPts > diamonds) return false;
      if (selectedPriceFilter === 'LE_5' && reqPts > 5) return false;
      if (selectedPriceFilter === '6_TO_12' && (reqPts < 6 || reqPts > 12)) return false;
      if (selectedPriceFilter === 'GT_12' && reqPts <= 12) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (storeSort === 'POINTS_ASC') return a.points_required - b.points_required;
      if (storeSort === 'POINTS_DESC') return b.points_required - a.points_required;
      if (storeSort === 'STOCK_DESC') return b.quantity_available - a.quantity_available;
      return 0;
    });
  }, [storeItems, storeSearch, selectedCategory, selectedPriceFilter, storeSort, diamonds]);

  const totalStorePages = Math.max(1, Math.ceil(filteredStoreItems.length / STORE_ITEMS_PER_PAGE));
  const paginatedStoreItems = React.useMemo(() => {
    const start = (storePage - 1) * STORE_ITEMS_PER_PAGE;
    return filteredStoreItems.slice(start, start + STORE_ITEMS_PER_PAGE);
  }, [filteredStoreItems, storePage]);

  const isStoreFiltered =
    storeSearch !== '' ||
    selectedCategory !== 'ALL' ||
    selectedPriceFilter !== 'ALL' ||
    storeSort !== 'POINTS_ASC';

  // Lọc & phân trang Lịch sử biến động điểm
  const filteredHistoryItems = React.useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return historyItems.filter((log) => {
      if (selectedActionType !== 'ALL' && log.actionType !== selectedActionType) {
        return false;
      }
      if (q) {
        const noteText = (log.note || log.examTitle || '').toLowerCase();
        const actText = (log.actionType || '').toLowerCase();
        if (!noteText.includes(q) && !actText.includes(q)) return false;
      }
      return true;
    });
  }, [historyItems, historySearch, selectedActionType]);

  const totalHistoryPages = Math.max(
    1,
    Math.ceil(filteredHistoryItems.length / HISTORY_ITEMS_PER_PAGE)
  );
  const paginatedHistoryItems = React.useMemo(() => {
    const start = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
    return filteredHistoryItems.slice(start, start + HISTORY_ITEMS_PER_PAGE);
  }, [filteredHistoryItems, historyPage]);

  const affordableCount = React.useMemo(
    () => storeItems.filter((i) => i.points_required <= diamonds && i.quantity_available > 0).length,
    [storeItems, diamonds]
  );

  const basicQuota = balanceData?.quotaByLevel?.BASIC?.maxExamsAvailable ?? Math.floor(points / 3);
  const mediumQuota = balanceData?.quotaByLevel?.MEDIUM?.maxExamsAvailable ?? Math.floor(points / 4);
  const advQuota = balanceData?.quotaByLevel?.ADVANCED?.maxExamsAvailable ?? Math.floor(points / 9);

  return (
    <div className="space-y-5 pb-24">
      {/* Header + Tab Switcher (Đồng bộ hoàn toàn với Cổng Luyện Thi K-12 & Lịch Sử Luyện Đề) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#00B8DD]/10 text-[#00B8DD] text-xs font-semibold">
                <Gift className="w-3.5 h-3.5" />
                Đổi quà &amp; Quản lý điểm
              </span>
              {user?.fullname && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user.fullname}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 inline-flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-[#00B8DD]" />
              </span>
              <span>Cửa Hàng Đổi Quà &amp; Ví Điểm</span>
            </h1>
          </div>

          {/* Cụm nút hành động bên phải */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/student/inventory">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/60 text-slate-700 dark:text-slate-200 gap-1.5 whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#00B8DD]" />
                Túi đồ của tôi
              </Button>
            </Link>

            <Button
              size="sm"
              variant="primary"
              onClick={handleDailyClaim}
              isLoading={isClaiming}
              className="h-9 px-3.5 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] active:scale-[0.98] text-white text-xs font-semibold gap-1.5 whitespace-nowrap shadow-xs shadow-[#00B8DD]/25 transition-all cursor-pointer"
              leftIcon={
                alreadyClaimedToday ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <CalendarCheck className="w-3.5 h-3.5" />
                )
              }
            >
              {alreadyClaimedToday ? 'Đã điểm danh hôm nay (+9 Tia)' : 'Điểm danh nhận 9 Tia Sáng'}
            </Button>
          </div>
        </div>

        {/* Thanh Chuyển Đổi Tab đồng bộ màu chủ đạo */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('STORE')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'STORE'
                ? 'bg-[#00B8DD] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Gift className="w-3.5 h-3.5" />
            Cửa Hàng Đổi Quà ({storeItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'HISTORY'
                ? 'bg-[#00B8DD] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <History className="w-3.5 h-3.5" />
            Lịch Sử Giao Dịch ({historyItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUOTA')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'QUOTA'
                ? 'bg-[#00B8DD] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Hạn Mức Làm Đề
          </button>
        </div>
      </section>

      {/* 4 Thẻ Thống Kê Tổng Quan (Tông chủ đạo #00B8DD + Slate, giải thích rõ ràng dễ hiểu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
          data-testid="rewards-points-card"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Ví Ngọc &amp; Tia Sáng</span>
            <Sparkles className="w-4 h-4 text-[#00B8DD]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 flex-wrap">
            {isLoading ? (
              <Skeleton className="h-8 w-24 my-0.5 inline-block" />
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-[#007D99] dark:text-[#00B8DD] tabular-nums" title="Ngọc Tri Thức dùng đổi quà">
                  <span>{diamonds}</span>
                  <NgocIcon className="w-5 h-5" />
                </span>
                <span className="text-slate-300 dark:text-slate-700 text-base">|</span>
                <span
                  className="inline-flex items-center gap-1 text-slate-900 dark:text-white text-xl tabular-nums"
                  title="Tia Sáng dùng mở đề thi"
                >
                  <span>{points}</span>
                  <TiaSangIcon className="w-5 h-5" />
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {alreadyClaimedToday ? 'Đã điểm danh hôm nay (+9 Tia)' : 'Cấp miễn phí 9 Tia Sáng/ngày'}
          </div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Quà đủ Ngọc đổi ngay</span>
            <Gift className="w-4 h-4 text-[#00B8DD]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {isLoading ? (
              <Skeleton className="h-8 w-24 my-0.5 inline-block" />
            ) : (
              <>
                {affordableCount}{' '}
                <span className="text-xs font-medium text-slate-400">/ {storeItems.length} phần quà</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Đổi bằng Ngọc Tri Thức tích lũy
          </div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Lượt mở đề bằng Tia Sáng</span>
            <FileCheck2 className="w-4 h-4 text-[#00B8DD]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {isLoading ? (
              <Skeleton className="h-8 w-28 my-0.5 inline-block" />
            ) : (
              <>
                {basicQuota} đề{' '}
                <span className="text-xs font-medium text-slate-400">Cơ bản (3 Tia/đề)</span>
              </>
            )}
          </div>
          <div
            className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap truncate"
            title={`Trung bình: ${mediumQuota} đề (4 Tia/đề) • Nâng cao: ${advQuota} đề (9 Tia/đề)`}
          >
            TB: <strong className="text-slate-700 dark:text-slate-200">{mediumQuota} đề</strong> (4 Tia) • Nâng cao:{' '}
            <strong className="text-slate-700 dark:text-slate-200">{advQuota} đề</strong> (9 Tia)
          </div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Thưởng / Phạt khi nộp bài</span>
            <Award className="w-4 h-4 text-[#00B8DD]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tabular-nums">
            <span className="text-[#007D99] dark:text-[#00B8DD]">+1 đến +2</span>
            <TiaSangIcon className="w-5 h-5" />
          </div>
          <div
            className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap truncate"
            title="Đạt 8.5–9.9đ: +1 Tia • Đạt 10đ: +2 Tia • Dưới 5đ: -1 Tia"
          >
            8.5–9.9đ: <strong className="text-slate-700 dark:text-slate-200">+1</strong> • 10đ:{' '}
            <strong className="text-slate-700 dark:text-slate-200">+2</strong> • &lt;5đ:{' '}
            <strong className="text-slate-700 dark:text-slate-200">-1 Tia</strong>
          </div>
        </Card>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CỬA HÀNG ĐỔI QUÀ (CÓ BỘ LỌC, TÌM KIẾM, SẮP XẾP & PHÂN TRANG) */}
      {/* ===================================================================== */}
      {activeTab === 'STORE' && (
        <div className="space-y-4">
          {/* Thanh Bộ Lọc Đa Tiêu Chí (1 hàng ngang trên Desktop) */}
          <Card className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
              {/* Ô tìm kiếm quà tặng */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#00B8DD]" />
                <Input
                  placeholder="Tìm quà tặng, voucher, huy hiệu..."
                  value={storeSearch}
                  onChange={(e) => {
                    setStoreSearch(e.target.value);
                    setStorePage(1);
                  }}
                  className="pl-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#00B8DD]"
                />
              </div>

              {/* Nhóm Select lọc */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setStorePage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] font-medium"
                >
                  <option value="ALL">Danh mục: Tất cả quà tặng</option>
                  <option value="VOUCHER">Voucher ưu đãi học phí</option>
                  <option value="BADGE">Huy hiệu danh hiệu</option>
                  <option value="THEME">Học liệu PDF &amp; Giao diện</option>
                  <option value="OTHER">Quà tặng hiện vật</option>
                </select>

                <select
                  value={selectedPriceFilter}
                  onChange={(e) => {
                    setSelectedPriceFilter(e.target.value);
                    setStorePage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] font-medium"
                >
                  <option value="ALL">Mức Ngọc: Tất cả</option>
                  <option value="AFFORDABLE">Đủ Ngọc đổi ngay (≤ {diamonds} Ngọc)</option>
                  <option value="LE_5">Từ 1 - 5 Ngọc</option>
                  <option value="6_TO_12">Từ 6 - 12 Ngọc</option>
                  <option value="GT_12">Trên 12 Ngọc</option>
                </select>

                <select
                  value={storeSort}
                  onChange={(e) => {
                    setStoreSort(e.target.value as any);
                    setStorePage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] font-medium"
                >
                  <option value="POINTS_ASC">Sắp xếp: Ngọc thấp → cao</option>
                  <option value="POINTS_DESC">Sắp xếp: Ngọc cao → thấp</option>
                  <option value="STOCK_DESC">Sắp xếp: Còn nhiều suất nhất</option>
                </select>

                {isStoreFiltered && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setStoreSearch('');
                      setSelectedCategory('ALL');
                      setSelectedPriceFilter('ALL');
                      setStoreSort('POINTS_ASC');
                      setStorePage(1);
                    }}
                    className="h-9 px-2.5 rounded-xl text-xs text-slate-500 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Làm mới
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Danh sách Card Quà Tặng Gọn Đẹp */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
                >
                  <div className="h-36 w-full bg-slate-200 dark:bg-slate-800" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/40">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          ) : paginatedStoreItems.length === 0 ? (
            <Card className="p-10 text-center text-xs text-slate-400 border border-slate-200/80 dark:border-slate-800">
              Không tìm thấy phần thưởng nào phù hợp với bộ lọc hiện tại.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedStoreItems.map((item) => {
                const canAfford = diamonds >= item.points_required && item.quantity_available > 0;
                const catInfo = CATEGORY_LABELS[item.type] || CATEGORY_LABELS.VOUCHER;
                return (
                  <Card
                    key={item.id}
                    className="p-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/50 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border backdrop-blur-xs shadow-2xs',
                              catInfo.color
                            )}
                          >
                            {catInfo.label}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/85 text-[#00B8DD] font-bold text-xs shadow-sm backdrop-blur-xs tabular-nums">
                            <span>{item.points_required}</span>
                            <NgocIcon className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#00B8DD] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/40">
                      <span className="text-[11px] text-slate-500">
                        Còn lại:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {item.quantity_available} suất
                        </strong>
                      </span>

                      <Button
                        size="sm"
                        variant={canAfford ? 'primary' : 'outline'}
                        disabled={!canAfford || redeemingId === item.id}
                        isLoading={redeemingId === item.id}
                        onClick={() => handleRedeemItem(item)}
                        className={cn(
                          'h-8 px-3 rounded-xl text-xs font-semibold transition-all',
                          canAfford
                            ? 'bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-xs shadow-[#00B8DD]/25 cursor-pointer'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400'
                        )}
                      >
                        {item.quantity_available <= 0
                          ? 'Hết quà'
                          : canAfford
                            ? `Đổi ngay (-${item.points_required} Ngọc)`
                            : `Thiếu ${item.points_required - diamonds} Ngọc`}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Phân trang cho Cửa hàng đổi quà */}
          <Card className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <Pagination
              currentPage={storePage}
              totalPages={totalStorePages}
              totalItems={filteredStoreItems.length}
              itemsPerPage={STORE_ITEMS_PER_PAGE}
              onPageChange={(p) => setStorePage(p)}
            />
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: LỊCH SỬ ĐIỂM DANH & BIẾN ĐỘNG ĐIỂM (BỘ LỌC + PHÂN TRANG)       */}
      {/* ===================================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {/* Bộ lọc lịch sử điểm */}
          <Card className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#00B8DD]" />
                <Input
                  placeholder="Tìm theo nội dung ghi chú, tên đề thi hoặc mã quà tặng..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="pl-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs focus:border-[#00B8DD]"
                />
              </div>

              <select
                value={selectedActionType}
                onChange={(e) => {
                  setSelectedActionType(e.target.value);
                  setHistoryPage(1);
                }}
                className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] font-medium"
              >
                <option value="ALL">Loại giao dịch: Tất cả ({historyItems.length})</option>
                <option value="DAILY_CHECKIN">Điểm danh hàng ngày (+9 Tia)</option>
                <option value="DAILY_GRANT">Cấp 9 Tia đầu ngày</option>
                <option value="START_EXAM">Mở đề thi (-3 / -4 / -9 Tia)</option>
                <option value="SCORE_REWARD_8_5_TO_9_9">Thưởng đạt 8.5–9.9đ (+1 Tia)</option>
                <option value="SCORE_REWARD_10">Thưởng đạt 10đ (+2 Tia)</option>
                <option value="SCORE_PENALTY_UNDER_5">Phạt dưới 5.0đ (-1 Tia)</option>
                <option value="REDEEM_REWARD">Đổi quà tặng bằng Ngọc</option>
                <option value="ADMIN_CSKH_ADJUST">Hỗ trợ CSKH (Admin)</option>
              </select>

              {(historySearch !== '' || selectedActionType !== 'ALL') && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setHistorySearch('');
                    setSelectedActionType('ALL');
                    setHistoryPage(1);
                  }}
                  className="h-9 px-2.5 rounded-xl text-xs text-slate-500 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Làm mới
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 animate-pulse">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block" />
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : paginatedHistoryItems.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Không có bản ghi giao dịch điểm nào phù hợp.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Phân loại</th>
                      <th className="py-3 px-4">Chi tiết hoạt động</th>
                      <th className="py-3 px-4 text-center">Trước GD</th>
                      <th className="py-3 px-4 text-center">Biến động</th>
                      <th className="py-3 px-4 text-right">Số dư sau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedHistoryItems.map((log) => {
                      const actMeta = ACTION_TYPE_LABELS[log.actionType] || {
                        label: log.actionType,
                        variant: 'secondary' as const,
                      };
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant={actMeta.variant} className="text-[10px] font-semibold">
                              {actMeta.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-md">
                            {log.note || log.examTitle || 'Giao dịch Tia Sáng'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-500">
                            {log.pointsBefore}đ
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1',
                                log.pointsDelta > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : log.pointsDelta < 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-500'
                              )}
                            >
                              {log.pointsDelta > 0 ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : log.pointsDelta < 0 ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : null}
                              {log.pointsDelta > 0 ? `+${log.pointsDelta}đ` : `${log.pointsDelta}đ`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {log.pointsAfter}đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                currentPage={historyPage}
                totalPages={totalHistoryPages}
                totalItems={filteredHistoryItems.length}
                itemsPerPage={HISTORY_ITEMS_PER_PAGE}
                onPageChange={(p) => setHistoryPage(p)}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: HẠN MỨC LÀM ĐỀ THEO CẤP ĐỘ & QUY TẮC THƯỞNG PHẠT              */}
      {/* ===================================================================== */}
      {activeTab === 'QUOTA' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4"
                >
                  <div className="space-y-2">
                    <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: 'BASIC',
                  title: 'Đề Cấp Độ Cơ Bản',
                  desc: 'Ôn tập kiến thức nền tảng SGK (Nhận biết & Thông hiểu).',
                  cost: 3,
                  available: basicQuota,
                  canStart: points >= 3,
                },
              {
                key: 'MEDIUM',
                title: 'Đề Cấp Độ Trung Bình',
                desc: 'Rèn kỹ năng giải đề học kỳ và tốt nghiệp THPT.',
                cost: 4,
                available: mediumQuota,
                canStart: points >= 4,
              },
              {
                key: 'ADVANCED',
                title: 'Đề Cấp Độ Giỏi / VDC',
                desc: 'Chinh phục câu hỏi Vận dụng cao lấy điểm 9 - 10.',
                cost: 9,
                available: advQuota,
                canStart: points >= 9,
              },
            ].map((lvl) => (
              <Card
                key={lvl.key}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/50 transition-colors flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lvl.title}
                    </h3>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border whitespace-nowrap',
                        lvl.canStart
                          ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/25'
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      )}
                    >
                      -{lvl.cost} Tia / đề
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{lvl.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Mở được ngay:{' '}
                    <strong className="text-slate-900 dark:text-white">{lvl.available} đề</strong>
                  </span>
                  <Link href={`/luyen-thi`}>
                    <Button
                      size="sm"
                      disabled={!lvl.canStart}
                      className={cn(
                        'h-8 px-3 rounded-xl text-xs font-semibold transition-all',
                        lvl.canStart
                          ? 'bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-xs shadow-[#00B8DD]/25 cursor-pointer'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      )}
                    >
                      {lvl.canStart ? 'Vào luyện đề' : 'Chưa đủ Tia'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Modal xác nhận đổi quà thành công */}
      <Dialog
        isOpen={Boolean(redeemedResult)}
        onClose={() => setRedeemedResult(null)}
        title="Đổi Quà Tặng Thành Công!"
        description={`Bạn đã quy đổi thành công: ${redeemedResult?.item.name || ''}`}
      >
        <div className="py-3 flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-[#00B8DD]/10 text-[#00B8DD] flex items-center justify-center border border-[#00B8DD]/25">
            <Gift className="w-7 h-7" />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 w-full text-xs space-y-2">
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Mã Quà Tặng / Voucher Của Bạn:
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-base font-bold text-[#007D99] dark:text-[#00B8DD] tracking-wider">
                {redeemedResult?.voucherCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (redeemedResult?.voucherCode) {
                    navigator.clipboard.writeText(redeemedResult.voucherCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }
                }}
                className="h-7 px-2 text-xs hover:text-[#00B8DD]"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                {copiedCode ? 'Đã chép' : 'Sao chép'}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Phần thưởng đã được lưu trực tiếp vào <b>Túi Đồ Của Tôi</b> trên cơ sở dữ liệu.
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 justify-center rounded-xl text-xs"
              onClick={() => setRedeemedResult(null)}
            >
              Tiếp tục đổi quà
            </Button>
            <Link href="/student/inventory" className="flex-1">
              <Button className="w-full justify-center rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] text-white text-xs font-semibold">
                Mở Túi Đồ
              </Button>
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
