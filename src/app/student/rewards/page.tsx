'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Gift,
  Award,
  CalendarCheck,
  History,
  Gem,
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

const STORE_ITEMS_PER_PAGE = 6;
const HISTORY_ITEMS_PER_PAGE = 8;

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  VOUCHER: {
    label: 'Voucher Ưu Đãi',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  BADGE: {
    label: 'Huy Hiệu Vinh Danh',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  THEME: {
    label: 'Học Liệu & Giao Diện',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  },
  OTHER: {
    label: 'Quà Tặng Hiện Vật',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
};

const ACTION_TYPE_LABELS: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'primary' | 'secondary' }> = {
  DAILY_CHECKIN: { label: 'Điểm danh hàng ngày', variant: 'success' },
  DAILY_GRANT: { label: 'Cấp 9đ đầu ngày', variant: 'primary' },
  START_EXAM: { label: 'Mở đề luyện thi', variant: 'warning' },
  SCORE_REWARD_8_5_TO_9_9: { label: 'Thưởng đạt 8.5+ (+1đ)', variant: 'success' },
  SCORE_REWARD_10: { label: 'Thưởng đạt 10đ (+2đ)', variant: 'success' },
  SCORE_NEUTRAL: { label: 'Hoàn thành đề (0đ)', variant: 'secondary' },
  SCORE_PENALTY_UNDER_5: { label: 'Phạt dưới 5.0đ (-1đ)', variant: 'danger' },
  REDEEM_REWARD: { label: 'Đổi quà cửa hàng', variant: 'primary' },
};

export default function StudentRewardsStorePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<'STORE' | 'HISTORY' | 'QUOTA'>('STORE');

  // Số dư điểm & trạng thái điểm danh
  const [balanceData, setBalanceData] = React.useState<ExamPointsBalanceResponse | null>(null);
  const [points, setPoints] = React.useState<number>(9);
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
      const [bal, hist, items] = await Promise.all([
        examPointsService.getBalance(user?.id),
        examPointsService.getHistory({ userId: user?.id, page: 1, limit: 100 }),
        catalogService.getStoreItems(),
      ]);

      if (bal) {
        setBalanceData(bal);
        setPoints(bal.currentPoints);
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
            'Mỗi ngày hệ thống chỉ cấp 9 Kim Cương (💎) 1 lần. Vui lòng quay lại vào ngày mai nhé!',
        });
        return;
      }

      if (res?.success && res?.data) {
        setPoints(res.data.currentPoints);
        setAlreadyClaimedToday(true);
        toast.success('Điểm danh nhận 9 Kim Cương thành công!', {
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

  // Đổi quà tặng trực tiếp trên PostgreSQL
  const handleRedeemItem = async (item: StoreItem) => {
    if (points < item.points_required) {
      toast.error(`Bạn cần ${item.points_required} điểm để đổi quà này (hiện có ${points} điểm).`);
      return;
    }

    setRedeemingId(item.id);
    try {
      const res = await catalogService.redeemStoreItem(item.id, user?.id);
      if (res?.ok && res?.success && res?.data) {
        const newPts = Number(res.data.currentPoints ?? points - item.points_required);
        setPoints(newPts);
        notifyExamPointsUpdated(newPts);
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
      if (selectedPriceFilter === 'AFFORDABLE' && reqPts > points) return false;
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
  }, [storeItems, storeSearch, selectedCategory, selectedPriceFilter, storeSort, points]);

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
    () => storeItems.filter((i) => i.points_required <= points && i.quantity_available > 0).length,
    [storeItems, points]
  );

  const basicQuota = balanceData?.quotaByLevel?.BASIC?.maxExamsAvailable ?? Math.floor(points / 3);
  const mediumQuota = balanceData?.quotaByLevel?.MEDIUM?.maxExamsAvailable ?? Math.floor(points / 4);
  const advQuota = balanceData?.quotaByLevel?.ADVANCED?.maxExamsAvailable ?? Math.floor(points / 9);

  return (
    <div className="space-y-6 pb-10">
      {/* Header gọn gàng trên 1 hàng ngang (đồng bộ style /admin/questions) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cửa Hàng Đổi Quà &amp; Kim Cương
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mỗi ngày điểm danh nhận 9 Kim Cương (💎), làm bài đạt 8.5+ tích lũy thêm để đổi Voucher, Huy hiệu và Quà tặng.
          </p>
        </div>

        {/* Cụm nút hành động bên phải */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/student/inventory">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
              Túi đồ của tôi
            </Button>
          </Link>

          <Button
            size="sm"
            variant="primary"
            onClick={handleDailyClaim}
            isLoading={isClaiming}
            className="h-9 px-3.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
            leftIcon={
              alreadyClaimedToday ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <CalendarCheck className="w-3.5 h-3.5" />
              )
            }
          >
            {alreadyClaimedToday ? 'Đã điểm danh hôm nay (9đ)' : 'Điểm danh nhận 9đ hôm nay'}
          </Button>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan Gọn Nhẹ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-primary dark:text-[#00B8DD]">
            Số dư Kim Cương hiện tại
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <span>{isLoading ? '...' : `${points}`}</span>
            <Gem className="w-5 h-5 text-primary fill-primary/20" />
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {alreadyClaimedToday ? 'Đã điểm danh nhận 9 💎 hôm nay' : 'Cấp cố định 9 💎 / ngày'}
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Quà đủ điểm đổi ngay
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {affordableCount}{' '}
            <span className="text-xs font-medium text-slate-400">/ {storeItems.length} phần quà</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Voucher, Huy hiệu &amp; Học liệu PDF
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            Số lượt làm đề khả dụng
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {basicQuota} đề{' '}
            <span className="text-xs font-medium text-slate-400">(Cơ bản)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Hoặc {mediumQuota} đề TB (-4đ) • {advQuota} đề Giỏi (-9đ)
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Cơ chế thưởng điểm thi
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            +1đ / +2đ
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Đạt 8.5–9.9đ (+1đ) • Đạt 10đ (+2đ) • &lt;5đ (-1đ)
          </div>
        </Card>
      </div>

      {/* Thanh Chuyển Đổi Tab (Cửa hàng đổi quà / Lịch sử biến động điểm / Quy tắc hạn mức) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('STORE')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'STORE'
                ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
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
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'HISTORY'
                ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <History className="w-3.5 h-3.5" />
            Lịch Sử Điểm Danh &amp; Giao Dịch ({historyItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUOTA')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'QUOTA'
                ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Hạn Mức Làm Đề Theo Cấp Độ
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CỬA HÀNG ĐỔI QUÀ (CÓ BỘ LỌC, TÌM KIẾM, SẮP XẾP & PHÂN TRANG) */}
      {/* ===================================================================== */}
      {activeTab === 'STORE' && (
        <div className="space-y-4">
          {/* Thanh Bộ Lọc Đa Tiêu Chí (1 hàng ngang trên Desktop) */}
          <Card className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
              {/* Ô tìm kiếm quà tặng */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên quà tặng, voucher, huy hiệu, tài liệu..."
                  value={storeSearch}
                  onChange={(e) => {
                    setStoreSearch(e.target.value);
                    setStorePage(1);
                  }}
                  className="pl-9 h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900"
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
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium"
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
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="ALL">Mức điểm: Tất cả</option>
                  <option value="AFFORDABLE">Đủ điểm đổi ngay (≤ {points}đ)</option>
                  <option value="LE_5">Từ 1 - 5 điểm</option>
                  <option value="6_TO_12">Từ 6 - 12 điểm</option>
                  <option value="GT_12">Trên 12 điểm</option>
                </select>

                <select
                  value={storeSort}
                  onChange={(e) => {
                    setStoreSort(e.target.value as any);
                    setStorePage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="POINTS_ASC">Sắp xếp: Điểm thấp → cao</option>
                  <option value="POINTS_DESC">Sắp xếp: Điểm cao → thấp</option>
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
                    className="h-9 px-2.5 text-xs text-slate-500 hover:text-rose-600 gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Đặt lại
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Danh sách Card Quà Tặng Gọn Đẹp */}
          {paginatedStoreItems.length === 0 ? (
            <Card className="p-10 text-center text-xs text-slate-400 border border-slate-200/80 dark:border-slate-800">
              Không tìm thấy phần thưởng nào phù hợp với bộ lọc hiện tại.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedStoreItems.map((item) => {
                const canAfford = points >= item.points_required && item.quantity_available > 0;
                const catInfo = CATEGORY_LABELS[item.type] || CATEGORY_LABELS.VOUCHER;
                return (
                  <Card
                    key={item.id}
                    className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group"
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
                              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs',
                              catInfo.color
                            )}
                          >
                            {catInfo.label}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/85 text-cyan-300 font-bold text-xs shadow-sm backdrop-blur-xs">
                            <Gem className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30" />
                            {item.points_required} 💎
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
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
                        className="h-8 px-3 text-xs font-semibold cursor-pointer"
                      >
                        {item.quantity_available <= 0
                          ? 'Hết quà'
                          : canAfford
                            ? `Đổi ngay (-${item.points_required}đ)`
                            : `Thiếu ${item.points_required - points}đ`}
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
          <Card className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo nội dung ghi chú, tên đề thi hoặc mã quà tặng..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="pl-9 h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <select
                value={selectedActionType}
                onChange={(e) => {
                  setSelectedActionType(e.target.value);
                  setHistoryPage(1);
                }}
                className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium"
              >
                <option value="ALL">Loại giao dịch: Tất cả ({historyItems.length})</option>
                <option value="DAILY_CHECKIN">Điểm danh hàng ngày</option>
                <option value="DAILY_GRANT">Cấp 9 điểm đầu ngày</option>
                <option value="START_EXAM">Mở đề thi (-3đ / -4đ / -9đ)</option>
                <option value="SCORE_REWARD_8_5_TO_9_9">Thưởng đạt 8.5 - 9.9đ (+1đ)</option>
                <option value="SCORE_REWARD_10">Thưởng đạt 10đ (+2đ)</option>
                <option value="SCORE_PENALTY_UNDER_5">Phạt dưới 5.0đ (-1đ)</option>
                <option value="REDEEM_REWARD">Đổi quà tặng cửa hàng</option>
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
                  className="h-9 px-2.5 text-xs text-slate-500 hover:text-rose-600 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt lại
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {paginatedHistoryItems.length === 0 ? (
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
                            {log.note || log.examTitle || 'Giao dịch điểm năng lượng'}
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
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lvl.title}
                    </h3>
                    <Badge variant={lvl.canStart ? 'success' : 'danger'} className="text-[10px]">
                      -{lvl.cost} điểm / đề
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{lvl.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Làm được ngay:{' '}
                    <strong className="text-slate-900 dark:text-white">{lvl.available} đề</strong>
                  </span>
                  <Link href={`/luyen-thi`}>
                    <Button size="sm" disabled={!lvl.canStart} className="h-8 text-xs">
                      {lvl.canStart ? 'Vào luyện đề' : 'Chưa đủ điểm'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
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
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center border border-emerald-200">
            <Gift className="w-7 h-7" />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 w-full text-xs space-y-2">
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              Mã Quà Tặng / Voucher Của Bạn:
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-base font-bold text-primary tracking-wider">
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
                className="h-7 px-2 text-xs"
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
              className="flex-1 justify-center text-xs"
              onClick={() => setRedeemedResult(null)}
            >
              Tiếp tục đổi quà
            </Button>
            <Link href="/student/inventory" className="flex-1">
              <Button className="w-full justify-center text-xs">Mở Túi Đồ</Button>
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
