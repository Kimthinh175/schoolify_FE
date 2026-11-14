'use client';

import * as React from 'react';
import {
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  CreditCard,
  Check,
  AlertCircle,
  QrCode,
  ArrowUpRight,
  User,
  Filter,
  XCircle,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { catalogService, OrderItem } from '@/services/catalog.service';
import { toast } from 'sonner';

const ORDERS_PER_PAGE = 10;

const parseLocalDateBoundary = (dateStr: string, boundary: 'start' | 'end') => {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return NaN;
  return boundary === 'start'
    ? new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
    : new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'PAID' | 'CANCELLED'>('ALL');
  const [timeRange, setTimeRange] = React.useState<
    'ALL' | 'TODAY' | '7_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM_DATE' | 'CUSTOM_RANGE'
  >('ALL');
  const [customDate, setCustomDate] = React.useState('');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [packageFilter, setPackageFilter] = React.useState<string>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderItem | null>(null);
  const [cancellingOrder, setCancellingOrder] = React.useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);

  const loadOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await catalogService.getOrders();
      if (data.length > 0) {
        setOrders(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmOrder = async (order: OrderItem) => {
    const res = await catalogService.confirmOrderPayment(order.id);
    if (res?.order) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.order : o)));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(res.order);
      }
      toast.success(
        `Đã xác nhận thanh toán đơn #${order.code} và kích hoạt gói + cộng ${res.bonusPointsAwarded ?? 0} Điểm thưởng!`
      );
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'PAID' } : o))
      );
      toast.success(`Đã xác nhận thanh toán đơn #${order.code}!`);
    }
  };

  const handleOpenCancelModal = (order: OrderItem) => {
    setCancellingOrder(order);
    setCancelReason('');
  };

  const handleConfirmCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder || isCancelling) return;
    setIsCancelling(true);
    try {
      const res = await catalogService.cancelOrder(cancellingOrder.id, cancelReason);
      const updatedOrder =
        res?.order ||
        ({
          ...cancellingOrder,
          status: 'CANCELLED',
          cancel_reason: cancelReason.trim() || null,
        } as OrderItem);

      setOrders((prev) => prev.map((o) => (o.id === cancellingOrder.id ? updatedOrder : o)));
      if (selectedOrder?.id === cancellingOrder.id) {
        setSelectedOrder(updatedOrder);
      }
      toast.success(`Đã hủy đơn #${cancellingOrder.code}.`);
      setCancellingOrder(null);
      setCancelReason('');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy đơn hàng này.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Danh sách tên gói/khóa học duy nhất để lọc nhanh
  const packageOptions = React.useMemo(() => {
    const names = new Set<string>();
    orders.forEach((o) => {
      if (o.item_name_snapshot) names.add(String(o.item_name_snapshot));
    });
    return Array.from(names);
  }, [orders]);

  // Reset trang về 1 mỗi khi đổi bộ lọc / từ khóa
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, timeRange, customDate, customStartDate, customEndDate, packageFilter]);

  const filteredOrders = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    return orders.filter((order) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        String(order.code || '').toLowerCase().includes(q) ||
        String(order.buyer_name || '').toLowerCase().includes(q) ||
        String(order.buyer_email || '').toLowerCase().includes(q) ||
        String(order.item_name_snapshot || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchPackage =
        packageFilter === 'ALL' || String(order.item_name_snapshot || '') === packageFilter;

      let matchTime = true;
      if (timeRange !== 'ALL') {
        const ts = new Date(order.created_at).getTime();
        if (isNaN(ts)) {
          matchTime = false;
        } else if (timeRange === 'TODAY') {
          matchTime = ts >= startOfToday;
        } else if (timeRange === '7_DAYS') {
          matchTime = ts >= sevenDaysAgo;
        } else if (timeRange === 'THIS_MONTH') {
          matchTime = ts >= startOfThisMonth;
        } else if (timeRange === 'LAST_MONTH') {
          matchTime = ts >= startOfLastMonth && ts < startOfThisMonth;
        } else if (timeRange === 'CUSTOM_DATE' && customDate) {
          const dayStart = parseLocalDateBoundary(customDate, 'start');
          const dayEnd = parseLocalDateBoundary(customDate, 'end');
          matchTime = !isNaN(dayStart) && ts >= dayStart && ts <= dayEnd;
        } else if (timeRange === 'CUSTOM_RANGE') {
          const rangeStart = customStartDate ? parseLocalDateBoundary(customStartDate, 'start') : null;
          const rangeEnd = customEndDate ? parseLocalDateBoundary(customEndDate, 'end') : null;
          if (rangeStart !== null && !isNaN(rangeStart) && ts < rangeStart) matchTime = false;
          if (rangeEnd !== null && !isNaN(rangeEnd) && ts > rangeEnd) matchTime = false;
        }
      }

      return matchSearch && matchStatus && matchPackage && matchTime;
    });
  }, [orders, search, statusFilter, packageFilter, timeRange, customDate, customStartDate, customEndDate]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE
  );

  const isFiltered =
    search !== '' ||
    statusFilter !== 'ALL' ||
    timeRange !== 'ALL' ||
    customDate !== '' ||
    customStartDate !== '' ||
    customEndDate !== '' ||
    packageFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTimeRange('ALL');
    setCustomDate('');
    setCustomStartDate('');
    setCustomEndDate('');
    setPackageFilter('ALL');
    setCurrentPage(1);
  };

  // Số liệu tổng hợp
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');
  const totalRevenuePaid = paidOrders.reduce((sum, o) => sum + Number(o.item_price_snapshot || 0), 0);
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + Number(o.item_price_snapshot || 0), 0);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quản Lý Hóa Đơn & Doanh Thu
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {orders.length} giao dịch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi dòng tiền nạp gói luyện thi, trạng thái thanh toán VietQR / PayOS và duyệt đơn tự động.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={isLoading}
            className="h-8 px-3 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 2. Thẻ KPI Tóm Tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng Thu Thực Tế (PAID)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatVND(totalRevenuePaid)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {paidOrders.length} đơn hàng đã hoàn tất
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đơn Hàng Chờ Xác Nhận</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {pendingOrders.length}{' '}
            <span className="text-xs font-normal text-slate-400">({formatVND(pendingAmount)})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Chờ quét VietQR hoặc chờ Admin duyệt thủ công
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tỷ Lệ Chuyển Đổi Thành Công</div>
          <div className="text-2xl font-bold text-[#00B8DD] mt-1">
            {orders.length ? Math.round((paidOrders.length / orders.length) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tự động kích hoạt gói và cấp điểm ngay khi khớp giao dịch
          </p>
        </Card>
      </div>

      {/* 3. Bộ Lọc Tìm Kiếm & Tabs Trạng Thái */}
      <Card className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs trạng thái */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs w-fit">
            {[
              { id: 'ALL', label: `Tất cả (${orders.length})` },
              { id: 'PENDING', label: `Chờ duyệt (${pendingOrders.length})` },
              { id: 'PAID', label: `Đã thu (${paidOrders.length})` },
              { id: 'CANCELLED', label: `Đã hủy (${cancelledOrders.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ô tìm kiếm + Lọc thời gian + Lọc gói */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Tìm mã đơn, tên, email khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <select
              aria-label="Lọc theo thời gian"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] cursor-pointer"
            >
              <option value="ALL">Tất cả thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="7_DAYS">7 ngày qua</option>
              <option value="THIS_MONTH">Tháng này</option>
              <option value="LAST_MONTH">Tháng trước</option>
              <option value="CUSTOM_DATE">Chọn ngày cụ thể...</option>
              <option value="CUSTOM_RANGE">Khoảng ngày...</option>
            </select>

            <select
              aria-label="Lọc theo gói dịch vụ"
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] max-w-[190px] truncate cursor-pointer"
            >
              <option value="ALL">Tất cả gói dịch vụ</option>
              {packageOptions.map((pkgName) => (
                <option key={pkgName} value={pkgName}>
                  {pkgName}
                </option>
              ))}
            </select>

            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </Button>
            )}
          </div>
        </div>

        {(timeRange === 'CUSTOM_DATE' || timeRange === 'CUSTOM_RANGE') && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-[#00B8DD]" />
              {timeRange === 'CUSTOM_DATE' ? 'Chọn ngày:' : 'Khoảng thời gian:'}
            </span>

            {timeRange === 'CUSTOM_DATE' ? (
              <Input
                type="date"
                aria-label="Chọn ngày cụ thể"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-8 w-44 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Từ</span>
                  <Input
                    type="date"
                    aria-label="Từ ngày"
                    value={customStartDate}
                    max={customEndDate || undefined}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-8 w-40 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">đến</span>
                  <Input
                    type="date"
                    aria-label="Đến ngày"
                    value={customEndDate}
                    min={customStartDate || undefined}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-8 w-40 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 4. Bảng Danh Sách Hóa Đơn */}
      <Card className="p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Mobile & Tablet Card Stack (< 1024px) — Zero Horizontal Scroll */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const isPaid = order.status === 'PAID';
              const isCancelled = order.status === 'CANCELLED';
              const isPending = order.status === 'PENDING';
              return (
                <div key={order.id} className="p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      #{order.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : isCancelled
                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isCancelled ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {isPaid ? 'ĐÃ THU TIỀN' : isCancelled ? 'ĐÃ HỦY' : 'CHỜ XÁC NHẬN'}
                    </span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white break-words">
                      {order.buyer_name || 'Học sinh'}
                    </p>
                    {order.buyer_email && (
                      <p className="text-[11px] text-slate-400 break-all">{order.buyer_email}</p>
                    )}
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 break-words pt-0.5">
                      {order.item_name_snapshot || 'Gói SaaS'} •{' '}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatVND(Number(order.item_price_snapshot || 0))}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">{formatDate(order.created_at)}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedOrder(order)}
                      className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 cursor-pointer"
                    >
                      Chi tiết
                    </Button>
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCancelModal(order)}
                          className="h-8 px-2.5 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/70 dark:text-slate-300 dark:hover:text-rose-400 cursor-pointer"
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmOrder(order)}
                          className="h-8 px-3 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white cursor-pointer"
                        >
                          <Check className="w-3 h-3 mr-1" /> Duyệt
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center text-xs text-slate-400">
              Không tìm thấy hóa đơn nào phù hợp với bộ lọc.
            </div>
          )}
        </div>

        {/* Desktop Table (lg+) */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <TableRow className="border-b border-slate-200/70 dark:border-slate-800">
                <TableHead className="py-3 px-4">Mã Hóa Đơn</TableHead>
                <TableHead className="py-3 px-4">Khách Hàng</TableHead>
                <TableHead className="py-3 px-4">Gói Dịch Vụ</TableHead>
                <TableHead className="py-3 px-4">Số Tiền</TableHead>
                <TableHead className="py-3 px-4">Thời Gian</TableHead>
                <TableHead className="py-3 px-4 text-center">Trạng Thái</TableHead>
                <TableHead className="py-3 px-4 text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isCancelled = order.status === 'CANCELLED';
                  const isPending = order.status === 'PENDING';
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Mã đơn */}
                      <TableCell className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        #{order.code}
                      </TableCell>

                      {/* Khách hàng */}
                      <TableCell className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.buyer_name || 'Học sinh'}
                        </div>
                        {order.buyer_email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {order.buyer_email}
                          </div>
                        )}
                      </TableCell>

                      {/* Tên gói */}
                      <TableCell className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[220px]">
                          {order.item_name_snapshot || 'Gói SaaS'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.payment_method === 'BANK' ? 'Chuyển khoản VietQR' : 'Trực tiếp'}
                        </span>
                      </TableCell>

                      {/* Số tiền */}
                      <TableCell className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatVND(Number(order.item_price_snapshot || 0))}
                      </TableCell>

                      {/* Ngày tạo */}
                      <TableCell className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 lg:whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : isCancelled
                                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isCancelled ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {isPaid ? 'ĐÃ THU TIỀN' : isCancelled ? 'ĐÃ HỦY' : 'CHỜ XÁC NHẬN'}
                        </span>
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedOrder(order)}
                            className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 cursor-pointer"
                          >
                            Chi tiết
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenCancelModal(order)}
                                className="h-7 px-2 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/70 dark:text-slate-300 dark:hover:text-rose-400 cursor-pointer"
                              >
                                Hủy
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmOrder(order)}
                                className="h-7 px-2.5 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white cursor-pointer"
                              >
                                <Check className="w-3 h-3 mr-1" /> Duyệt
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy hóa đơn nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          itemsPerPage={ORDERS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="px-4 py-3"
        />
      </Card>

      {/* 5. Modal Xem Chi Tiết Hóa Đơn */}
      <Dialog
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="xl"
        title={
          selectedOrder ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Hóa Đơn #{selectedOrder.code}
              </span>
              <Badge
                variant={
                  selectedOrder.status === 'PAID'
                    ? 'success'
                    : selectedOrder.status === 'CANCELLED'
                      ? 'secondary'
                      : 'warning'
                }
                className="text-[11px] font-semibold uppercase px-2 py-0.5"
              >
                {selectedOrder.status === 'PAID'
                  ? 'Đã Thanh Toán'
                  : selectedOrder.status === 'CANCELLED'
                    ? 'Đã Hủy'
                    : 'Chờ Xác Nhận'}
              </Badge>
            </div>
          ) : undefined
        }
        description={selectedOrder ? `Thời gian tạo: ${formatDate(selectedOrder.created_at)}` : undefined}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs font-sans pt-1">
            {/* Thông tin khách hàng & Giao dịch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] block">Khách hàng</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedOrder.buyer_name || 'Học sinh'}
                </p>
                {selectedOrder.buyer_email && (
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {selectedOrder.buyer_email}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/60 dark:sm:border-slate-700/60 sm:pl-3">
                <span className="text-slate-400 text-[11px] block">Hình thức thanh toán</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <CreditCard className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <span>Chuyển khoản VietQR / PayOS</span>
                </div>
                <p className="text-[11px] text-slate-400">Tự động kích hoạt gói khi khớp lệnh</p>
              </div>
            </div>

            {/* Chi tiết gói mua & Tổng tiền */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Nội dung gói ôn thi</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedOrder.item_name_snapshot}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Tổng tiền thanh toán
                  </span>
                  <span className="text-[11px] text-slate-400">Đã bao gồm đầy đủ quyền lợi</span>
                </div>
                <span className="font-extrabold text-xl text-[#00B8DD]">
                  {formatVND(Number(selectedOrder.item_price_snapshot || 0))}
                </span>
              </div>

              {selectedOrder.status === 'CANCELLED' && selectedOrder.cancel_reason && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Lý do hủy: </span>
                  {selectedOrder.cancel_reason}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="h-9 px-4 text-xs font-semibold"
              >
                Đóng
              </Button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCancelModal(selectedOrder)}
                    className="h-9 px-4 text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Hủy đơn
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleConfirmOrder(selectedOrder)}
                    className="h-9 px-4 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Xác nhận thanh toán & Kích hoạt gói
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* 6. Modal Xác Nhận Hủy Đơn Chờ Thanh Toán */}
      <Dialog
        isOpen={Boolean(cancellingOrder)}
        onClose={() => {
          if (!isCancelling) {
            setCancellingOrder(null);
            setCancelReason('');
          }
        }}
        maxWidth="md"
        title={
          cancellingOrder ? (
            <span className="text-base font-bold text-slate-900 dark:text-white">
              Hủy Hóa Đơn #{cancellingOrder.code}
            </span>
          ) : undefined
        }
        description="Chỉ áp dụng cho đơn chưa thanh toán (PENDING). Đơn đã thu tiền (PAID) sẽ được giữ làm chứng từ cố định."
      >
        {cancellingOrder && (
          <form onSubmit={handleConfirmCancelOrder} className="space-y-4 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {cancellingOrder.item_name_snapshot}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Khách hàng: {cancellingOrder.buyer_name} • Số tiền:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {formatVND(Number(cancellingOrder.item_price_snapshot || 0))}
                </strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Lý do hủy đơn (không bắt buộc):
              </label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Học sinh tạo nhầm đơn / Quá hạn chuyển khoản VietQR..."
                className="h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={() => {
                  setCancellingOrder(null);
                  setCancelReason('');
                }}
                className="h-8.5 px-3.5 text-xs font-semibold"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isCancelling}
                className="h-8.5 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Xác nhận hủy đơn
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
