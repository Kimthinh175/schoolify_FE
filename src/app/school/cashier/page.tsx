'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Search,
  Printer,
  CheckCircle2,
  QrCode,
  CreditCard,
  Receipt,
  Wallet,
  Clock,
  XCircle,
  Plus,
  Filter,
  FileText,
  User as UserIcon,
  ShieldCheck,
  Ban,
  Database,
  Building2,
  Sparkles,
  Eye,
  Info,
  ArrowRight,
  Hash,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_ORDERS } from '@/services/mock/data';
import { Order, OrderStatus, PaymentMethod, Transaction } from '@/types';

// Helper to safely render item_name_snapshot (which can be an Object or String per ERD)
const getItemNameString = (
  snapshot?: string | { title?: string; name?: string;[key: string]: any },
  fallback?: string
): string => {
  if (!snapshot) return fallback || 'Khoản thu';
  if (typeof snapshot === 'string') return snapshot;
  return snapshot.title || snapshot.name || JSON.stringify(snapshot);
};

export default function CashierPage() {
  const [orders, setOrders] = React.useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [methodFilter, setMethodFilter] = React.useState<string>('ALL');

  // Modals state
  const [selectedReceipt, setSelectedReceipt] = React.useState<Order | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = React.useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isErdModalOpen, setIsErdModalOpen] = React.useState(false);

  // New order form state
  const [newOrderForm, setNewOrderForm] = React.useState({
    student_name: '',
    student_code: '',
    student_class: '',
    buyer_phone: '',
    item_name_snapshot: '',
    item_price_snapshot: '',
    payment_method: 'COD' as PaymentMethod,
    status: 'PAID' as OrderStatus,
    reference_type: 'COURSE' as 'SUBSCRIPTION' | 'COURSE',
  });

  // Calculate 4 Financial Stats
  const totalRevenue = React.useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.item_price_snapshot ?? o.total_amount ?? 0), 0);
  }, [orders]);

  const paidOrders = React.useMemo(() => {
    return orders.filter((o) => o.status === 'PAID');
  }, [orders]);

  const paidAmount = React.useMemo(() => {
    return paidOrders.reduce((sum, o) => sum + (o.item_price_snapshot ?? o.total_amount ?? 0), 0);
  }, [orders, paidOrders]);

  const pendingOrders = React.useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING');
  }, [orders]);

  const pendingAmount = React.useMemo(() => {
    return pendingOrders.reduce((sum, o) => sum + (o.item_price_snapshot ?? o.total_amount ?? 0), 0);
  }, [orders, pendingOrders]);

  const cancelledOrders = React.useMemo(() => {
    return orders.filter((o) => o.status === 'CANCELLED');
  }, [orders]);

  const cancelledAmount = React.useMemo(() => {
    return cancelledOrders.reduce((sum, o) => sum + (o.item_price_snapshot ?? o.total_amount ?? 0), 0);
  }, [orders, cancelledOrders]);

  // Filter logic
  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const studentName = o.student_name ?? o.user?.fullname ?? o.buyer_name ?? '';
      const itemName = getItemNameString(o.item_name_snapshot, o.item_title);
      const code = o.code ?? '';
      const phone = o.buyer_phone ?? o.user?.phone ?? '';

      const matchesSearch =
        studentName.toLowerCase().includes(search.toLowerCase()) ||
        itemName.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase()) ||
        phone.includes(search);

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesMethod = methodFilter === 'ALL' || o.payment_method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [orders, search, statusFilter, methodFilter]);

  // Actions
  const handleConfirmPaid = (id: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const amount = o.item_price_snapshot ?? o.total_amount ?? 0;
          const newTransaction: Transaction = {
            id: `trx-${Date.now()}`,
            order_id: o.id,
            amount: amount,
            transaction_type: 'PAYMENT_TO_ADMIN',
            type: 'PAYMENT_TO_ADMIN',
            recipient_id: 'admin-schoolify',
            description: `Xác nhận thanh toán ${o.payment_method === 'BANK' ? 'chuyển khoản VietQR' : 'tiền mặt tại quầy'} bởi Staff`,
            payment_method: o.payment_method,
            reference_code: `CASHIER-${Math.floor(100000 + Math.random() * 900000)}`,
            created_at: now,
          };

          return {
            ...o,
            status: 'PAID',
            paid_at: now,
            transactions: [...(o.transactions || []), newTransaction],
          };
        }
        return o;
      })
    );

    // If modal is open for this order, update selectedDetailOrder state as well
    if (selectedDetailOrder && selectedDetailOrder.id === id) {
      setSelectedDetailOrder((prev) =>
        prev
          ? {
            ...prev,
            status: 'PAID',
            paid_at: now,
          }
          : null
      );
    }
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' } : o))
    );
    if (selectedDetailOrder && selectedDetailOrder.id === id) {
      setSelectedDetailOrder((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.student_name || !newOrderForm.item_name_snapshot || !newOrderForm.item_price_snapshot) {
      alert('Vui lòng nhập đầy đủ Tên học sinh, Khoản thu và Số tiền!');
      return;
    }

    const price = parseFloat(newOrderForm.item_price_snapshot);
    const now = new Date().toISOString();
    const newId = `ord-${Date.now()}`;
    const code = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    const initialTransactions: Transaction[] =
      newOrderForm.status === 'PAID'
        ? [
          {
            id: `trx-${Date.now()}`,
            order_id: newId,
            amount: price,
            transaction_type: 'PAYMENT_TO_ADMIN',
            type: 'PAYMENT_TO_ADMIN',
            recipient_id: 'admin-schoolify',
            description: `Thu tiền trực tiếp tại quầy giáo vụ (${newOrderForm.payment_method})`,
            payment_method: newOrderForm.payment_method,
            reference_code: `CASHIER-${Math.floor(100000 + Math.random() * 900000)}`,
            created_at: now,
          },
        ]
        : [];

    const newOrderRecord: Order = {
      id: newId,
      code: code,
      user_id: `usr-${Date.now()}`,
      buyer_id: `usr-${Date.now()}`,
      buyer_name: newOrderForm.student_name,
      student_name: newOrderForm.student_name,
      student_code: newOrderForm.student_code || `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      student_class: newOrderForm.student_class || 'Lớp 11A1',
      buyer_phone: newOrderForm.buyer_phone || '0912345678',
      reference_type: newOrderForm.reference_type,
      reference_id: 'ref-counter-101',
      subscription_id: newOrderForm.reference_type === 'SUBSCRIPTION' ? 101 : null,
      course_id: newOrderForm.reference_type === 'COURSE' ? 202 : null,
      item_title: newOrderForm.item_name_snapshot,
      item_name_snapshot: newOrderForm.item_name_snapshot,
      total_amount: price,
      item_price_snapshot: price,
      payment_method: newOrderForm.payment_method,
      status: newOrderForm.status,
      seller_id: 1,
      created_at: now,
      paid_at: newOrderForm.status === 'PAID' ? now : null,
      user: {
        id: `usr-${Date.now()}`,
        fullname: newOrderForm.student_name,
        email: `${newOrderForm.student_name.toLowerCase().replace(/\s+/g, '')}@schoolify.edu.vn`,
        phone: newOrderForm.buyer_phone,
        role: 'student',
        code: newOrderForm.student_code,
        class_name: newOrderForm.student_class,
      },
      transactions: initialTransactions,
    };

    setOrders((prev) => [newOrderRecord, ...prev]);
    setIsCreateModalOpen(false);
    setNewOrderForm({
      student_name: '',
      student_code: '',
      student_class: '',
      buyer_phone: '',
      item_name_snapshot: '',
      item_price_snapshot: '',
      payment_method: 'COD',
      status: 'PAID',
      reference_type: 'COURSE',
    });
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2 bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/30 whitespace-nowrap">
            Phân Hệ Thu Ngân & Kế Toán
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
            Thu Ngân & Quản Lý Học Phí Tại Quầy
          </h1>
        </div>
      </div>

      {/* 4 Financial Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Thu */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Card className="p-5 border border-[#00B8DD]/20 bg-gradient-to-br from-[#00B8DD]/10 via-slate-50/50 to-white dark:from-[#00B8DD]/20 dark:via-slate-900/60 dark:to-slate-900 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                  Tổng Doanh Thu Phí
                </p>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 whitespace-nowrap truncate">
                  {formatMoney(totalRevenue)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 whitespace-nowrap truncate">
                  <FileText className="w-3 h-3 text-[#00B8DD] shrink-0" />
                  <span>Tổng <strong>{orders.length}</strong> đơn phát sinh</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#00B8DD]/15 text-[#00B8DD] flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00B8DD]" />
          </Card>
        </motion.div>

        {/* Card 2: Đã Thanh Toán (PAID) */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Card className="p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-50/50 to-white dark:from-emerald-900/20 dark:via-slate-900/60 dark:to-slate-900 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 whitespace-nowrap truncate">
                  Đã Thanh Toán
                </p>
                <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 whitespace-nowrap truncate">
                  {formatMoney(paidAmount)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 whitespace-nowrap truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span><strong>{paidOrders.length}</strong> đơn đã thu tiền</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          </Card>
        </motion.div>

        {/* Card 3: Chưa Nộp (PENDING) */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Card className="p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-50/50 to-white dark:from-amber-900/20 dark:via-slate-900/60 dark:to-slate-900 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 whitespace-nowrap truncate">
                  Chưa Nộp
                </p>
                <h3 className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1 whitespace-nowrap truncate">
                  {formatMoney(pendingAmount)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 whitespace-nowrap truncate">
                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                  <span><strong>{pendingOrders.length}</strong> đơn chờ thu tại quầy</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          </Card>
        </motion.div>

        {/* Card 4: Đơn Hủy (CANCELLED) */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Card className="p-5 border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-slate-50/50 to-white dark:from-rose-900/20 dark:via-slate-900/60 dark:to-slate-900 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 whitespace-nowrap truncate">
                  Đơn Hủy
                </p>
                <h3 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-1 whitespace-nowrap truncate">
                  {formatMoney(cancelledAmount)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 whitespace-nowrap truncate">
                  <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                  <span><strong>{cancelledOrders.length}</strong> đơn bị hủy bỏ</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
          </Card>
        </motion.div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Tìm theo tên học sinh, mã đơn, tên khoản thu, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <span className="text-[11px] text-slate-500 font-semibold px-2 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3 h-3" /> Trạng thái:
              </span>
              {(['ALL', 'PAID', 'PENDING', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-[#00B8DD] shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {st === 'ALL'
                    ? 'Tất cả'
                    : st === 'PAID'
                      ? 'Đã Thu'
                      : st === 'PENDING'
                        ? 'Chờ Thu'
                        : 'Đã Hủy'}
                </button>
              ))}
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <span className="text-[11px] text-slate-500 font-semibold px-2 whitespace-nowrap">Phương thức:</span>
              {(['ALL', 'BANK', 'COD'] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setMethodFilter(pm)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${methodFilter === pm
                    ? 'bg-white dark:bg-slate-700 text-[#00B8DD] shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {pm === 'ALL' ? 'Tất cả' : pm === 'BANK' ? 'BANK (VietQR)' : 'COD (Tiền mặt)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table: Simplified to User, Amount, Status, and Print Receipt / Actions */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
              <TableRow>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap py-3.5 px-4">User</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap py-3.5 px-4 text-right">Số Tiền</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap py-3.5 px-4 text-center">Trạng Thái</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap py-3.5 px-4 text-right">Thao Tác & In Biên Lai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <p className="font-medium text-sm">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('ALL');
                          setMethodFilter('ALL');
                        }}
                        className="whitespace-nowrap"
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const studentName = order.student_name ?? order.user?.fullname ?? order.buyer_name ?? 'Học sinh';
                  const studentCode = order.student_code ?? order.user?.code ?? 'HS-1101';
                  const studentClass = order.student_class ?? order.user?.class_name ?? 'Lớp 11A1';
                  const itemPrice = order.item_price_snapshot ?? order.total_amount ?? 0;
                  const userRole = order.user?.role ?? 'student';

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedDetailOrder(order)}
                    >
                      {/* User Column: Name, Code, Class, Role */}
                      <TableCell className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#00B8DD]/15 text-[#00B8DD] flex items-center justify-center font-bold text-sm shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                              <span className="whitespace-nowrap">{studentName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{studentCode}</span>
                              <span>•</span>
                              <span>{studentClass}</span>
                              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {userRole}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Số Tiền Column */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap text-right font-black text-base text-indigo-600 dark:text-indigo-400">
                        {formatMoney(itemPrice)}
                      </TableCell>

                      {/* Trạng Thái Column */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap text-center">
                        {order.status === 'PAID' && (
                          <Badge variant="success" className="text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap">
                            ĐÃ THU
                          </Badge>
                        )}
                        {order.status === 'PENDING' && (
                          <Badge variant="warning" className="text-[11px] font-bold px-2.5 py-0.5 animate-pulse whitespace-nowrap">
                            CHỜ THU
                          </Badge>
                        )}
                        {order.status === 'CANCELLED' && (
                          <Badge variant="danger" className="text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap">
                            ĐÃ HỦY
                          </Badge>
                        )}
                      </TableCell>

                      {/* Thao Tác & In Biên Lai Column */}
                      <TableCell className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          {/* Nút Xem Chi Tiết Đơn Hàng (Pops up full detail modal) */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDetailOrder(order)}
                            leftIcon={<Eye className="w-3.5 h-3.5 shrink-0 text-[#00B8DD]" />}
                            className="text-xs h-8 px-2.5 text-slate-700 dark:text-slate-200 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 font-semibold"
                          >
                            Xem Chi Tiết
                          </Button>

                          {/* Nút In Biên Lai */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReceipt(order)}
                            leftIcon={<Printer className="w-3.5 h-3.5 shrink-0" />}
                            className="text-xs h-8 px-2.5 border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0 font-semibold"
                          >
                            In Biên Lai
                          </Button>

                          {/* Nút Thu Tiền Thần Tốc if PENDING */}
                          {order.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleConfirmPaid(order.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 whitespace-nowrap shrink-0 font-bold"
                            >
                              Thu Tiền
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* FULL DETAILS MODAL: Hiển Thị Đầy Đủ Chi Tiết Đơn Hàng Khi Bấm Vào */}
      <Dialog
        isOpen={!!selectedDetailOrder}
        onClose={() => setSelectedDetailOrder(null)}
        title="Chi Tiết Đầy Đủ Đơn Hàng"
        description="Thông tin toàn diện gồm Mã đơn, Tên học sinh, Khoản thu, Số tiền, Phương thức thanh toán & Lịch sử Transaction."
        maxWidth="2xl"
      >
        {selectedDetailOrder && (
          <div className="space-y-5 text-sm">
            {/* Quick Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <Hash className="w-5 h-5 text-[#00B8DD]" />
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {selectedDetailOrder.code}
                </span>
              </div>
              <div>
                {selectedDetailOrder.status === 'PAID' && (
                  <Badge variant="success" className="font-bold text-xs px-3 py-1">ĐÃ THU</Badge>
                )}
                {selectedDetailOrder.status === 'PENDING' && (
                  <Badge variant="warning" className="font-bold text-xs px-3 py-1 animate-pulse">CHỜ THU</Badge>
                )}
                {selectedDetailOrder.status === 'CANCELLED' && (
                  <Badge variant="danger" className="font-bold text-xs px-3 py-1">ĐÃ HỦY</Badge>
                )}
              </div>
            </div>

            {/* Grid display of all required fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Tên học sinh / User Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <p className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-[#00B8DD]" /> Tên Học Sinh
                </p>
                <p className="font-extrabold text-slate-900 dark:text-white text-base">
                  {selectedDetailOrder.student_name ?? selectedDetailOrder.user?.fullname ?? selectedDetailOrder.buyer_name}
                </p>
                <p className="text-slate-500 text-xs">
                  Mã: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{selectedDetailOrder.student_code ?? 'HS-1101'}</strong> • Lớp: <strong className="font-semibold">{selectedDetailOrder.student_class ?? '11A1'}</strong>
                </p>
                <p className="text-slate-500 text-xs">
                  SĐT: {selectedDetailOrder.buyer_phone ?? selectedDetailOrder.user?.phone ?? '0912345678'}
                </p>
              </div>

              {/* 2. Phương thức thanh toán (BANK / COD) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <p className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#00B8DD]" /> Phương Thức Thanh Toán
                </p>
                <div className="pt-1">
                  {selectedDetailOrder.payment_method === 'BANK' ? (
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold px-3 py-1 text-xs">
                      <QrCode className="w-4 h-4 mr-1.5 text-blue-600" />
                      Chuyển Khoản Ngân Hàng (BANK)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-3 py-1 text-xs">
                      <CreditCard className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Tiền Mặt Tại Quầy (COD)
                    </Badge>
                  )}
                </div>
                <p className="text-slate-500 text-xs pt-1">
                  Loại đơn: <strong>{selectedDetailOrder.reference_type === 'SUBSCRIPTION' ? 'Gói SaaS Subscription' : 'Khóa Học Course'}</strong>
                </p>
              </div>
            </div>

            {/* 3. Tên khoản thu */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <p className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#00B8DD]" /> Tên Khoản Thu
              </p>
              <p className="font-extrabold text-slate-900 dark:text-white text-base">
                {getItemNameString(selectedDetailOrder.item_name_snapshot, selectedDetailOrder.item_title)}
              </p>
            </div>

            {/* 4. Số tiền */}
            <div className="p-4.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/70 dark:border-indigo-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400">
                  Số Tiền Thu
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Bao gồm VAT và phí xử lý tài chính</p>
              </div>
              <p className="font-black text-2xl text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                {formatMoney(selectedDetailOrder.item_price_snapshot ?? selectedDetailOrder.total_amount ?? 0)}
              </p>
            </div>

            {/* 5. Lịch sử Transactions */}
            <div className="space-y-2.5 pt-1">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <Database className="w-4.5 h-4.5 text-[#00B8DD]" />
                Lịch Sử Giao Dịch Tài Chính:
              </h4>

              {(!selectedDetailOrder.transactions || selectedDetailOrder.transactions.length === 0) ? (
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center text-slate-400 text-xs">
                  Chưa phát sinh bản ghi giao dịch (Đơn chưa được thu tiền).
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDetailOrder.transactions.map((trx) => (
                    <div key={trx.id} className="p-3.5 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl space-y-1 text-xs">
                      <div className="flex justify-between font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                        <span>Transaction ID: {trx.id}</span>
                        <span>Ref: {trx.reference_code ?? 'CASHIER-88192'}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{trx.description}</p>
                      <div className="flex justify-between text-xs text-slate-500 pt-1.5 border-t border-emerald-200/50 dark:border-emerald-800/30">
                        <span>loại: <strong>{trx.transaction_type ?? trx.type ?? 'PAYMENT_TO_ADMIN'}</strong></span>
                        <span>Số tiền: <strong className="text-emerald-600 dark:text-emerald-400">{formatMoney(trx.amount)}</strong></span>
                        <span>Thời gian: {formatDate(trx.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {selectedDetailOrder.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleConfirmPaid(selectedDetailOrder.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-3.5"
                  >
                    Xác Nhận Thu Tiền Ngay
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedReceipt(selectedDetailOrder);
                  }}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="h-9 px-3.5"
                >
                  In Biên Lai
                </Button>
              </div>

              <Button variant="ghost" onClick={() => setSelectedDetailOrder(null)} className="h-9 px-4">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* MODAL 2: Printable Electronic Receipt */}
      <Dialog
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Biên Lai Thu Học Phí Điện Tử"
        description="Chứng từ thu tiền hợp lệ phát hành bởi Hệ Thống Schoolify Hub."
      >
        {selectedReceipt && (
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-slate-900/80 space-y-4 text-xs">
            {/* Header Biên lai */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="inline-flex items-center gap-1.5 mb-1">
                <Building2 className="w-4 h-4 text-[#00B8DD]" />
                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">
                  THPT CHUYÊN CÔNG NGHỆ SCHOOLIFY
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400">Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
              <p className="text-slate-500 dark:text-slate-400">Hotline: 028 7300 8888 | Website: schoolify.edu.vn</p>
              <div className="mt-2 inline-block px-3 py-1 bg-[#00B8DD]/10 text-[#00B8DD] rounded-full font-mono font-bold">
                MÃ BIÊN LAI: {selectedReceipt.code}
              </div>
            </div>

            {/* Chi tiết người nộp & Khoản thu */}
            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 whitespace-nowrap">Họ và tên học sinh:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedReceipt.student_name ?? selectedReceipt.user?.fullname ?? selectedReceipt.buyer_name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 whitespace-nowrap">Mã số học sinh / Lớp:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedReceipt.student_code ?? 'HS-1101'} - {selectedReceipt.student_class ?? 'Lớp 11A1'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 whitespace-nowrap">Khoản thu:</span>
                <span className="font-semibold text-slate-900 dark:text-white max-w-[240px] text-right">
                  {getItemNameString(selectedReceipt.item_name_snapshot, selectedReceipt.item_title)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 whitespace-nowrap">Phương thức thanh toán:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedReceipt.payment_method === 'BANK' ? 'Chuyển Khoản Ngân Hàng' : 'Tiền Mặt Tại Quầy'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 whitespace-nowrap">Thời gian tạo phiếu:</span>
                <span>{formatDate(selectedReceipt.created_at)}</span>
              </div>
              {selectedReceipt.paid_at && (
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 whitespace-nowrap">Thời gian xác nhận thu:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatDate(selectedReceipt.paid_at)}</span>
                </div>
              )}

              {/* Tổng tiền */}
              <div className="flex justify-between pt-3 text-sm font-extrabold">
                <span className="text-slate-900 dark:text-white uppercase whitespace-nowrap">TỔNG THỰC THU:</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-base">
                  {formatMoney(selectedReceipt.item_price_snapshot ?? selectedReceipt.total_amount ?? 0)}
                </span>
              </div>
            </div>

            {/* Chữ ký & Dấu mộc */}
            <div className="pt-4 grid grid-cols-2 text-center text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Người Nộp Tiền</p>
                <p className="text-[10px] italic text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
                <div className="h-12" />
                <p className="font-medium text-slate-700 dark:text-slate-300">{selectedReceipt.buyer_name}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Thu Ngân / Thủ Quỹ</p>
                <p className="text-[10px] italic text-slate-400 mt-0.5">(Xác nhận đã thu tiền)</p>
                <div className="h-12 flex items-center justify-center">
                  <span className="text-[10px] font-mono border border-emerald-500 text-emerald-600 px-2 py-0.5 rounded rotate-[-6deg] whitespace-nowrap">
                    SCHOOLIFY PAID
                  </span>
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Ban Kế Toán - Schoolify</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedReceipt(null)} className="whitespace-nowrap">
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4 shrink-0" />}
                className="bg-[#00B8DD] hover:bg-[#009BBD] text-white whitespace-nowrap"
              >
                In Ra Máy In / Xuất PDF
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* MODAL 3: Create New Receipt at Counter */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Lập Phiếu Thu Học Phí Mới Tại Quầy"
        description="Tạo phiếu thu học phí trực tiếp cho học sinh tại phòng thu ngân giáo vụ."
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Tên Học Sinh <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="VD: Nguyễn Văn Anh"
                value={newOrderForm.student_name}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, student_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mã Số Học Sinh</label>
              <Input
                placeholder="VD: HS-1108"
                value={newOrderForm.student_code}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, student_code: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lớp Học</label>
              <Input
                placeholder="VD: 11A1 - Chuyên Toán"
                value={newOrderForm.student_class}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, student_class: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Số Điện Thoại Liên Hệ</label>
              <Input
                placeholder="VD: 0987654321"
                value={newOrderForm.buyer_phone}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, buyer_phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Tên Khoản Thu <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="VD: Học phí Học kỳ I + Tiền cơ sở vật chất"
              value={newOrderForm.item_name_snapshot}
              onChange={(e) => setNewOrderForm({ ...newOrderForm, item_name_snapshot: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Số Tiền Thu (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="VD: 3500000"
                value={newOrderForm.item_price_snapshot}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, item_price_snapshot: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Loại Tham Chiếu</label>
              <select
                value={newOrderForm.reference_type}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, reference_type: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="COURSE">Khóa Học</option>
                <option value="SUBSCRIPTION">Gói Cước SaaS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phương Thức Thanh Toán</label>
              <select
                value={newOrderForm.payment_method}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, payment_method: e.target.value as PaymentMethod })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="COD">Tiền mặt tại quầy</option>
                <option value="BANK">Chuyển khoản VietQR</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Trạng Thái Thu</label>
              <select
                value={newOrderForm.status}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, status: e.target.value as OrderStatus })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="PAID">Đã Thu Tiền</option>
                <option value="PENDING">Chờ Thu Tiền</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="whitespace-nowrap">
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="bg-[#00B8DD] hover:bg-[#009BBD] text-white whitespace-nowrap">
              Tạo Phiếu Thu
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 4: Exact Visual ERD Schema from User's Diagrams */}
      <Dialog
        isOpen={isErdModalOpen}
        onClose={() => setIsErdModalOpen(false)}
        title="Mô Hình CSDL Chuẩn ERD: order ── transactions ── users"
        description="Chi tiết các bảng và khóa ngoại FK bám sát 100% hình ảnh ERD của hệ thống."
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Table: order */}
            <div className="p-3 border border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl space-y-1.5">
              <div className="font-black text-indigo-900 dark:text-indigo-200 text-sm border-b border-indigo-200 dark:border-indigo-800 pb-1 flex items-center justify-between">
                <span>order</span>
                <Badge variant="purple" className="text-[9px]">Table</Badge>
              </div>
              <div className="font-mono text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                <p className="font-bold text-indigo-700 dark:text-indigo-400">PK: id ObjectId</p>
                <p className="text-amber-700 dark:text-amber-400">FK1: user_id ObjectId</p>
                <p>reference_type: ENUM ['SUBSCRIPTION', 'COURSE']</p>
                <p className="text-amber-700 dark:text-amber-400">FK2: subscription_id number</p>
                <p className="text-amber-700 dark:text-amber-400">FK3: course_id number</p>
                <p className="font-semibold text-slate-900 dark:text-white">item_name_snapshot: object</p>
                <p className="font-semibold text-slate-900 dark:text-white">item_price_snapshot: decimal</p>
                <p>status: ENUM ['PENDING', 'PAID', 'CANCELLED']</p>
                <p>payment_method: ENUM ['COD', 'BANK']</p>
                <p>seller_id: number</p>
                <p>created_at: date</p>
              </div>
            </div>

            {/* Table: users */}
            <div className="p-3 border border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl space-y-1.5">
              <div className="font-black text-blue-900 dark:text-blue-200 text-sm border-b border-blue-200 dark:border-blue-800 pb-1 flex items-center justify-between">
                <span>users</span>
                <Badge variant="outline" className="text-[9px]">Table</Badge>
              </div>
              <div className="font-mono text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                <p className="font-bold text-blue-700 dark:text-blue-400">PK: id ObjectId</p>
                <p>role: enum ['admin', 'manager', 'teacher', 'student']</p>
                <p>fullname: string</p>
                <p>avatar_url: string</p>
                <p>email: string</p>
                <p>phone: String</p>
                <p>password_hash: string</p>
                <p>status: boolean</p>
                <p>last_login_at: date</p>
                <p>create_at: date</p>
                <p>update_at: date</p>
              </div>
            </div>

            {/* Table: transactions */}
            <div className="p-3 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl space-y-1.5">
              <div className="font-black text-emerald-900 dark:text-emerald-200 text-sm border-b border-emerald-200 dark:border-emerald-800 pb-1 flex items-center justify-between">
                <span>transactions</span>
                <Badge variant="success" className="text-[9px]">Table</Badge>
              </div>
              <div className="font-mono text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">PK: id ObjectId</p>
                <p className="text-amber-700 dark:text-amber-400">FK: order_id ObjectId</p>
                <p>transaction_type: enum ['PAYMENT_TO_ADMIN', 'COMMISSION_FEE', 'TEACHER_INCOME']</p>
                <p>amount: decimal</p>
                <p>recipient_id: string</p>
                <p>created_at: date</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Liên kết CSDL Thực tế:
            </p>
            <p className="text-[11px] leading-relaxed">
              • <strong>users (1) ── (N) order</strong>: Mỗi đơn hàng <code>order</code> thuộc về một người dùng qua khóa ngoại <code>user_id</code>.<br />
              • <strong>order (1) ── (N) transactions</strong>: Mỗi đơn hàng khi thanh toán phát sinh 1 hoặc nhiều bản ghi giao dịch dòng tiền <code>transactions</code> qua khóa ngoại <code>order_id</code>.<br />
              • <strong>item_name_snapshot (object) & item_price_snapshot (decimal)</strong>: Lưu dữ liệu bất biến tại thời điểm phát sinh hóa đơn để phòng ngừa trường hợp thông tin khóa học/gói cước bị thay đổi sau này.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" onClick={() => setIsErdModalOpen(false)} className="whitespace-nowrap">
              Đã Hiểu
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
