'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Building2,
  Eye,
  Hash,
  Tag,
  Key,
  Lock,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_ORDERS } from '@/services/mock/data';
import { Order, OrderStatus, PaymentMethod, Transaction } from '@/types';

// Helper to safely render item_name_snapshot
const getItemNameString = (
  snapshot?: string | { title?: string; name?: string; [key: string]: any },
  fallback?: string
): string => {
  if (!snapshot) return fallback || 'Khoản thu học phí';
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
  const [reconcileOrder, setReconcileOrder] = React.useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Reconciliation Modal Form State
  const [reconcilePaymentMethod, setReconcilePaymentMethod] = React.useState<PaymentMethod>('COD');
  const [amountTendered, setAmountTendered] = React.useState<string>('');
  const [cashierNotes, setCashierNotes] = React.useState<string>('');
  const [cashierStaffName, setCashierStaffName] = React.useState<string>('Đặng Văn Kế Toán (Thủ quỹ)');
  const [bankRefCode, setBankRefCode] = React.useState<string>('');
  const [isDigitalSignatureOpen, setIsDigitalSignatureOpen] = React.useState(false);

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
    reference_type: 'COURSE' as 'SUBSCRIPTION' | 'COURSE' | 'TUITION',
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

  // Handle Opening Reconciliation Modal
  const handleOpenReconcileModal = (order: Order) => {
    setReconcileOrder(order);
    setReconcilePaymentMethod(order.payment_method || 'COD');
    const orderPrice = order.item_price_snapshot ?? order.total_amount ?? 0;
    setAmountTendered(orderPrice.toString());
    setCashierNotes(`Đã thu đủ ${orderPrice.toLocaleString('vi-VN')} VNĐ tại quầy thu ngân.`);
    setBankRefCode(`FT26${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  // Execute Reconcile & Confirm Payment
  const handleConfirmReconciliation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reconcileOrder) return;

    const now = new Date().toISOString();
    const targetId = reconcileOrder.id;
    const amount = reconcileOrder.item_price_snapshot ?? reconcileOrder.total_amount ?? 0;

    const referenceCode =
      reconcilePaymentMethod === 'BANK'
        ? bankRefCode || `BANK-${Math.floor(100000 + Math.random() * 900000)}`
        : `CASHIER-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      order_id: targetId,
      amount: amount,
      transaction_type: 'PAYMENT_TO_ADMIN',
      type: 'PAYMENT_TO_ADMIN',
      recipient_id: 'admin-schoolify',
      description: cashierNotes || `Thu tiền học phí tại quầy (${reconcilePaymentMethod === 'BANK' ? 'Chuyển khoản VietQR' : 'Tiền mặt'}) bởi ${cashierStaffName}`,
      payment_method: reconcilePaymentMethod,
      reference_code: referenceCode,
      created_at: now,
    };

    let updatedRecord: Order | null = null;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === targetId) {
          updatedRecord = {
            ...o,
            status: 'PAID',
            payment_method: reconcilePaymentMethod,
            paid_at: now,
            transactions: [...(o.transactions || []), newTransaction],
          };
          return updatedRecord;
        }
        return o;
      })
    );

    if (selectedDetailOrder && selectedDetailOrder.id === targetId) {
      setSelectedDetailOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'PAID',
              payment_method: reconcilePaymentMethod,
              paid_at: now,
              transactions: [...(prev.transactions || []), newTransaction],
            }
          : null
      );
    }

    setReconcileOrder(null);
    if (updatedRecord) {
      setSelectedReceipt(updatedRecord);
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

    if (newOrderRecord.status === 'PAID') {
      setSelectedReceipt(newOrderRecord);
    }
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

  // Calculation helpers for Cash Tendered
  const currentOrderAmount = reconcileOrder ? (reconcileOrder.item_price_snapshot ?? reconcileOrder.total_amount ?? 0) : 0;
  const parsedTendered = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, parsedTendered - currentOrderAmount);
  const isTenderedEnough = parsedTendered >= currentOrderAmount;

  return (
    <div className="space-y-5 pb-8 font-sans overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" className="bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/30 text-[11px] whitespace-nowrap">
              Phân Hệ Thu Ngân & Tài Chính Quầy
            </Badge>
            <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-mono">
              <ShieldCheck className="w-3 h-3 mr-1" /> Chữ Ký Số Hợp Lệ
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
            Thu Ngân & Đối Soát Học Phí Tại Quầy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xử lý hóa đơn thu tiền tại quầy giáo vụ, hạch toán giao dịch và cấp biên lai điện tử có chữ ký số.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold text-xs h-9 px-4 shadow-sm"
          >
            Lập Phiếu Thu Mới
          </Button>
        </div>
      </div>

      {/* 4 Financial Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tổng Thu */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card className="p-4 border border-[#00B8DD]/20 bg-gradient-to-br from-[#00B8DD]/10 via-slate-50/50 to-white dark:from-[#00B8DD]/20 dark:via-slate-900/60 dark:to-slate-900 shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  Tổng Doanh Thu Phí
                </p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {formatMoney(totalRevenue)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                  <FileText className="w-3 h-3 text-[#00B8DD] shrink-0" />
                  <span>Tổng <strong>{orders.length}</strong> đơn phát sinh</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/15 text-[#00B8DD] flex items-center justify-center shrink-0">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00B8DD]" />
          </Card>
        </motion.div>

        {/* Card 2: Đã Thanh Toán (PAID) */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card className="p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-50/50 to-white dark:from-emerald-900/20 dark:via-slate-900/60 dark:to-slate-900 shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                  Đã Thu Tiền (PAID)
                </p>
                <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {formatMoney(paidAmount)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span><strong>{paidOrders.length}</strong> đơn hoàn tất</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          </Card>
        </motion.div>

        {/* Card 3: Chưa Nộp (PENDING) */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card className="p-4 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-50/50 to-white dark:from-amber-900/20 dark:via-slate-900/60 dark:to-slate-900 shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                  Chờ Đối Soát (PENDING)
                </p>
                <h3 className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                  {formatMoney(pendingAmount)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                  <span><strong>{pendingOrders.length}</strong> đơn chờ thu</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
          </Card>
        </motion.div>

        {/* Card 4: Đơn Hủy (CANCELLED) */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card className="p-4 border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-slate-50/50 to-white dark:from-rose-900/20 dark:via-slate-900/60 dark:to-slate-900 shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
                  Đơn Hủy
                </p>
                <h3 className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                  {formatMoney(cancelledAmount)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                  <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                  <span><strong>{cancelledOrders.length}</strong> đơn hủy bỏ</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
          </Card>
        </motion.div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Tìm tên học sinh, mã đơn, khoản thu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[11px] text-slate-500 font-semibold px-1.5 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3 h-3" /> Trạng thái:
              </span>
              {(['ALL', 'PAID', 'PENDING', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    statusFilter === st
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
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-[11px] text-slate-500 font-semibold px-1.5 whitespace-nowrap">Hình thức:</span>
              {(['ALL', 'BANK', 'COD'] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setMethodFilter(pm)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    methodFilter === pm
                      ? 'bg-white dark:bg-slate-700 text-[#00B8DD] shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pm === 'ALL' ? 'Tất cả' : pm === 'BANK' ? 'Chuyển khoản' : 'Tiền mặt'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
              <TableRow>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-3 px-4">Học Sinh</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-3 px-4">Khoản Thu</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-3 px-4 text-right">Số Tiền</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-3 px-4 text-center">Trạng Thái</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-3 px-4 text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <p className="font-medium text-xs">Không tìm thấy đơn hàng nào phù hợp.</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('ALL');
                          setMethodFilter('ALL');
                        }}
                        className="text-xs h-7"
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
                  const itemName = getItemNameString(order.item_name_snapshot, order.item_title);

                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-xs"
                      onClick={() => setSelectedDetailOrder(order)}
                    >
                      {/* User Column */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#00B8DD]/15 text-[#00B8DD] flex items-center justify-center font-bold text-xs shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {studentName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              <span className="font-semibold">{studentCode}</span> • <span>{studentClass}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Khoản thu Column */}
                      <TableCell className="py-3 px-4 max-w-[240px]">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={itemName}>
                          {itemName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                            {order.code}
                          </span>
                          <span>•</span>
                          <span>{order.payment_method === 'BANK' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
                        </div>
                      </TableCell>

                      {/* Số Tiền Column */}
                      <TableCell className="py-3 px-4 text-right font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {formatMoney(itemPrice)}
                      </TableCell>

                      {/* Trạng Thái Column */}
                      <TableCell className="py-3 px-4 text-center">
                        {order.status === 'PAID' && (
                          <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                            ĐÃ THU
                          </Badge>
                        )}
                        {order.status === 'PENDING' && (
                          <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5 animate-pulse">
                            CHỜ THU
                          </Badge>
                        )}
                        {order.status === 'CANCELLED' && (
                          <Badge variant="danger" className="text-[10px] font-bold px-2 py-0.5">
                            ĐÃ HỦY
                          </Badge>
                        )}
                      </TableCell>

                      {/* Thao Tác Column */}
                      <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 shrink-0">
                          {/* Nút Chi Tiết */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDetailOrder(order)}
                            leftIcon={<Eye className="w-3.5 h-3.5 text-[#00B8DD]" />}
                            className="text-xs h-7 px-2 text-slate-700 dark:text-slate-200 hover:text-[#00B8DD]"
                          >
                            Chi Tiết
                          </Button>

                          {/* Nếu PENDING: Nút Đối Soát & Thu Tiền */}
                          {order.status === 'PENDING' ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenReconcileModal(order)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5 font-bold shadow-xs"
                            >
                              Thu Tiền
                            </Button>
                          ) : (
                            /* Nếu PAID: Nút In Biên Lai Số */
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReceipt(order)}
                              leftIcon={<Printer className="w-3.5 h-3.5 text-emerald-600" />}
                              className="text-xs h-7 px-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold"
                            >
                              In Biên Lai
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

      {/* MODAL 1: MODAL ĐỐI SOÁT THANH TOÁN TRỰC TIẾP TẠI QUẦY */}
      <Dialog
        isOpen={!!reconcileOrder}
        onClose={() => setReconcileOrder(null)}
        title="Đối Soát Thanh Toán Trực Tiếp Tại Quầy"
        description="Xác nhận số tiền thu, phương thức thanh toán và cấp biên lai điện tử."
        maxWidth="2xl"
      >
        {reconcileOrder && (
          <form onSubmit={handleConfirmReconciliation} className="space-y-3.5 text-xs">
            {/* Header Summary Box */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#00B8DD] font-bold uppercase">
                  Mã Hóa Đơn: {reconcileOrder.code}
                </span>
                <Badge variant="warning" className="text-[9px] font-bold">
                  CHỜ XÁC NHẬN THU
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400">Học sinh / Người nộp:</p>
                  <p className="font-bold text-xs text-white">
                    {reconcileOrder.student_name ?? reconcileOrder.buyer_name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Mã HS: <span className="text-slate-200">{reconcileOrder.student_code ?? 'HS-1101'}</span> • Lớp: <span className="text-slate-200">{reconcileOrder.student_class ?? '11A1'}</span>
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[10px] text-slate-400">Số tiền cần thu:</p>
                  <p className="font-black text-xl text-emerald-400">
                    {formatMoney(currentOrderAmount)}
                  </p>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400">Khoản thu:</p>
                <p className="font-semibold text-slate-200 text-xs">
                  {getItemNameString(reconcileOrder.item_name_snapshot, reconcileOrder.item_title)}
                </p>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Phương Thức Thu Tiền:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setReconcilePaymentMethod('COD')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                    reconcilePaymentMethod === 'COD'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${reconcilePaymentMethod === 'COD' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Tiền Mặt Tại Quầy</p>
                    <p className="text-[10px] opacity-80">Thu tiền mặt trực tiếp</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReconcilePaymentMethod('BANK')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                    reconcilePaymentMethod === 'BANK'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${reconcilePaymentMethod === 'BANK' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">Chuyển Khoản Ngân Hàng</p>
                    <p className="text-[10px] opacity-80">Quẹt VietQR đối soát</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Controls based on Method */}
            {reconcilePaymentMethod === 'COD' ? (
              /* COD CASH CALCULATOR */
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tính Tiền Thừa Trả Khách:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Số tiền khách đưa (VNĐ):
                    </label>
                    <Input
                      type="number"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="bg-white dark:bg-slate-900 border-emerald-300 font-black text-sm text-slate-900 dark:text-white h-9"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Tiền thừa trả lại:
                    </label>
                    <div className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 flex items-center justify-between">
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {formatMoney(changeDue)}
                      </span>
                      {isTenderedEnough ? (
                        <Badge variant="success" className="text-[9px] font-bold">Đủ tiền</Badge>
                      ) : (
                        <Badge variant="danger" className="text-[9px] font-bold">Còn thiếu</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fast Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-500 mr-1">Nút chọn nhanh:</span>
                  {[currentOrderAmount, currentOrderAmount + 50000, currentOrderAmount + 100000, 500000, 1000000, 5000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountTendered(preset.toString())}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      {preset === currentOrderAmount ? 'Đúng tiền' : `${(preset / 1000).toLocaleString()}k`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* BANK VIETQR CONTROL */
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1 text-xs">
                      <QrCode className="w-3.5 h-3.5 text-blue-600" /> Mã VietQR Đối Soát Chuyển Khoản:
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Nội dung chuyển khoản: <strong className="font-mono text-slate-900 dark:text-white">{reconcileOrder.code}</strong>
                    </p>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 mt-1">
                        Mã tham chiếu giao dịch ngân hàng:
                      </label>
                      <Input
                        value={bankRefCode}
                        onChange={(e) => setBankRefCode(e.target.value)}
                        placeholder="VD: FT262270912384"
                        className="bg-white dark:bg-slate-900 border-blue-300 font-mono text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="w-20 h-20 p-1 bg-white rounded-lg border border-blue-200 shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=VIETQR-SCHOOLIFY-${reconcileOrder.code}`}
                      alt="VietQR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Staff & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Thu Ngân Thực Hiện:
                </label>
                <Input
                  value={cashierStaffName}
                  onChange={(e) => setCashierStaffName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 h-8"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Ghi chú xác nhận thu:
                </label>
                <Input
                  value={cashierNotes}
                  onChange={(e) => setCashierNotes(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  className="bg-slate-50 dark:bg-slate-800 h-8"
                />
              </div>
            </div>

            {/* Notice Box */}
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-600 dark:text-slate-300">
              Sau khi bấm <strong>"Xác nhận thu tiền"</strong>, trạng thái đơn hàng sẽ cập nhật thành <strong>ĐÃ THU</strong> và tự động phát hành biên lai điện tử có chữ ký số.
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReconcileOrder(null)}
                className="whitespace-nowrap text-xs h-8"
              >
                Hủy
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={reconcilePaymentMethod === 'COD' && !isTenderedEnough}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-9 px-4 text-xs whitespace-nowrap"
              >
                Xác Nhận Thu Tiền
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* MODAL 2: PREVIEW BIÊN LAI THU TIỀN HỌC PHÍ CÓ CHỮ KÝ ĐIỆN TỬ */}
      <Dialog
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Biên Lai Thu Học Phí Điện Tử"
        description="Chứng từ thu tiền hợp pháp phát hành bởi Hệ Thống Trường THPT Chuyên Công Nghệ Schoolify."
        maxWidth="2xl"
      >
        {selectedReceipt && (
          <div className="space-y-3.5">
            {/* Receipt Container */}
            <div id="printable-receipt" className="p-5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-xs space-y-3.5 text-xs relative overflow-hidden">
              
              {/* Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
                <Building2 className="w-56 h-56 mx-auto" />
              </div>

              {/* Header Biên Lai */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b-2 border-slate-800 dark:border-slate-700">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#00B8DD] text-white flex items-center justify-center font-black text-xs">
                      S
                    </div>
                    <div>
                      <h2 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-tight">
                        THPT CHUYÊN CÔNG NGHỆ SCHOOLIFY
                      </h2>
                      <p className="text-[10px] text-slate-500">MST: 0317892341 - Sở Giáo Dục & Đào Tạo</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Địa chỉ: Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</p>
                </div>

                <div className="text-left sm:text-right space-y-0.5 shrink-0">
                  <Badge variant="purple" className="bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/30 text-[9px] font-mono font-bold">
                    BIÊN LAI ĐIỆN TỬ HỢP LỆ
                  </Badge>
                  <p className="font-mono font-extrabold text-xs text-slate-900 dark:text-white pt-0.5">
                    {selectedReceipt.code}
                  </p>
                  <p className="text-[10px] text-slate-500">Ngày lập: {formatDate(selectedReceipt.created_at)}</p>
                  {selectedReceipt.paid_at && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Đã thu: {formatDate(selectedReceipt.paid_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Payer & Student Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Người nộp & học sinh:</p>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {selectedReceipt.student_name ?? selectedReceipt.buyer_name}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Mã HS: <strong className="font-mono">{selectedReceipt.student_code ?? 'HS-1101'}</strong> • Lớp: <strong>{selectedReceipt.student_class ?? 'Lớp 11A1'}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    SĐT: {selectedReceipt.buyer_phone ?? selectedReceipt.user?.phone ?? '0912345678'}
                  </p>
                </div>

                <div className="space-y-0.5 sm:text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Hình thức thanh toán:</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    {selectedReceipt.payment_method === 'BANK' ? 'Chuyển Khoản Ngân Hàng' : 'Tiền Mặt Tại Quầy'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Mã đơn hàng: <span className="font-mono">{selectedReceipt.id}</span>
                  </p>
                </div>
              </div>

              {/* Item Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                    <tr>
                      <th className="p-2">STT</th>
                      <th className="p-2">Tên Khoản Thu / Nội Dung Nộp</th>
                      <th className="p-2 text-right">Số Tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                    <tr>
                      <td className="p-2 font-bold">01</td>
                      <td className="p-2">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {getItemNameString(selectedReceipt.item_name_snapshot, selectedReceipt.item_title)}
                        </p>
                      </td>
                      <td className="p-2 text-right font-black text-slate-900 dark:text-white">
                        {formatMoney(selectedReceipt.item_price_snapshot ?? selectedReceipt.total_amount ?? 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Amount Box */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div>
                  <p className="text-[11px] uppercase font-extrabold text-emerald-800 dark:text-emerald-300">
                    TỔNG CỘNG THỰC THU:
                  </p>
                </div>
                <p className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                  {formatMoney(selectedReceipt.item_price_snapshot ?? selectedReceipt.total_amount ?? 0)}
                </p>
              </div>

              {/* DIGITAL SIGNATURE BLOCK */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800">
                {/* Left: Payer */}
                <div className="text-center space-y-1 p-2.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Người Nộp Tiền</p>
                  <p className="text-[10px] italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-xs font-semibold italic text-slate-600 dark:text-slate-400">
                      {selectedReceipt.buyer_name}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{selectedReceipt.buyer_name}</p>
                </div>

                {/* Right: Digital Signature Verification Seal */}
                <div className="p-2.5 bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 rounded-lg border border-emerald-500/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" /> Chữ Ký Số Đã Xác Thực
                    </span>
                    <Badge variant="success" className="text-[8px] font-mono font-bold px-1.5 py-0">
                      SCHOOLIFY CA
                    </Badge>
                  </div>

                  <div className="py-0.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                        BAN TÀI CHÍNH - THỦ QUỸ
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">
                        Người ký: <strong>Đặng Văn Kế Toán</strong>
                      </p>
                      <p className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                        SHA256: 4F8A:9E2B:1C7D:3F5A:6B8C
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-full border-2 border-emerald-600 border-dashed flex flex-col items-center justify-center text-center rotate-[-8deg] bg-emerald-50 dark:bg-emerald-950 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-[6px] font-black text-emerald-700 uppercase tracking-tighter">VERIFIED</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <span>Chuẩn: RSA-2048 / SHA-256</span>
                    <button
                      type="button"
                      onClick={() => setIsDigitalSignatureOpen(!isDigitalSignatureOpen)}
                      className="text-[#00B8DD] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Key className="w-2.5 h-2.5" /> {isDigitalSignatureOpen ? 'Ẩn Certificate' : 'Xem Chứng Thư'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggle Digital Signature Audit Details */}
              <AnimatePresence>
                {isDigitalSignatureOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] space-y-0.5 border border-slate-800"
                  >
                    <p className="text-emerald-400 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> CHỨNG THƯ SỐ PKI HỢP LỆ:
                    </p>
                    <p>Issuer: CN=Schoolify Root CA, O=Schoolify Tech Ed, C=VN</p>
                    <p>Subject: CN=Dang Van Ke Toan (Cashier ID: CASHIER-101)</p>
                    <p className="text-amber-300">Digest SHA-256: 7F8A9E2B1C7D3F5A6B8C9D0E1F2A3B4C5D6E7F8A</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDigitalSignatureOpen(!isDigitalSignatureOpen)}
                  leftIcon={<Key className="w-3.5 h-3.5 text-[#00B8DD]" />}
                  className="text-xs h-8 px-2.5"
                >
                  {isDigitalSignatureOpen ? 'Ẩn Ký Số' : 'Kiểm Tra Ký Số'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setSelectedReceipt(null)} className="h-8 px-3 text-xs">
                  Đóng
                </Button>

                <Button
                  variant="primary"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5 shrink-0" />}
                  className="bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold h-8 px-3.5 text-xs whitespace-nowrap"
                >
                  In Biên Lai / PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* FULL DETAILS MODAL */}
      <Dialog
        isOpen={!!selectedDetailOrder}
        onClose={() => setSelectedDetailOrder(null)}
        title="Chi Tiết Đơn Hàng"
        description="Thông tin chi tiết gồm Mã đơn, Học sinh, Khoản thu và Lịch sử giao dịch."
        maxWidth="2xl"
      >
        {selectedDetailOrder && (
          <div className="space-y-4 text-xs">
            {/* Quick Status Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#00B8DD]" />
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {selectedDetailOrder.code}
                </span>
              </div>
              <div>
                {selectedDetailOrder.status === 'PAID' && (
                  <Badge variant="success" className="font-bold text-[10px] px-2.5 py-0.5">ĐÃ THU</Badge>
                )}
                {selectedDetailOrder.status === 'PENDING' && (
                  <Badge variant="warning" className="font-bold text-[10px] px-2.5 py-0.5 animate-pulse">CHỜ THU</Badge>
                )}
                {selectedDetailOrder.status === 'CANCELLED' && (
                  <Badge variant="danger" className="font-bold text-[10px] px-2.5 py-0.5">ĐÃ HỦY</Badge>
                )}
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Tên học sinh */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-[#00B8DD]" /> Học Sinh
                </p>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {selectedDetailOrder.student_name ?? selectedDetailOrder.user?.fullname ?? selectedDetailOrder.buyer_name}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Mã: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{selectedDetailOrder.student_code ?? 'HS-1101'}</strong> • Lớp: <strong className="font-semibold">{selectedDetailOrder.student_class ?? '11A1'}</strong>
                </p>
                <p className="text-slate-500 text-[11px]">
                  SĐT: {selectedDetailOrder.buyer_phone ?? selectedDetailOrder.user?.phone ?? '0912345678'}
                </p>
              </div>

              {/* 2. Phương thức thanh toán */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#00B8DD]" /> Hình Thức Thanh Toán
                </p>
                <div className="pt-0.5">
                  {selectedDetailOrder.payment_method === 'BANK' ? (
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold px-2.5 py-0.5 text-[10px]">
                      <QrCode className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Chuyển Khoản Ngân Hàng
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2.5 py-0.5 text-[10px]">
                      <CreditCard className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Tiền Mặt Tại Quầy
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Khoản thu */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#00B8DD]" /> Khoản Thu
              </p>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {getItemNameString(selectedDetailOrder.item_name_snapshot, selectedDetailOrder.item_title)}
              </p>
            </div>

            {/* 4. Số tiền */}
            <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/70 dark:border-indigo-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                  Số Tiền Thu
                </p>
              </div>
              <p className="font-black text-xl text-indigo-600 dark:text-indigo-400">
                {formatMoney(selectedDetailOrder.item_price_snapshot ?? selectedDetailOrder.total_amount ?? 0)}
              </p>
            </div>

            {/* 5. Lịch sử Transactions */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                Lịch Sử Giao Dịch Tài Chính:
              </h4>

              {(!selectedDetailOrder.transactions || selectedDetailOrder.transactions.length === 0) ? (
                <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-400 text-xs">
                  Chưa phát sinh bản ghi giao dịch (Đơn đang chờ thu).
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDetailOrder.transactions.map((trx) => (
                    <div key={trx.id} className="p-3 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between font-mono font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                        <span>Trx ID: {trx.id}</span>
                        <span>Ref: {trx.reference_code ?? 'CASHIER-88192'}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">{trx.description}</p>
                      <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/30">
                        <span>Số tiền: <strong className="text-emerald-600 dark:text-emerald-400">{formatMoney(trx.amount)}</strong></span>
                        <span>Thời gian: {formatDate(trx.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {selectedDetailOrder.status === 'PENDING' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      const target = selectedDetailOrder;
                      setSelectedDetailOrder(null);
                      handleOpenReconcileModal(target);
                    }}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 text-xs"
                  >
                    Thu Tiền Ngay
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const target = selectedDetailOrder;
                      setSelectedDetailOrder(null);
                      setSelectedReceipt(target);
                    }}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    className="h-8 px-3 text-xs font-bold border-emerald-300 text-emerald-700"
                  >
                    Xem Biên Lai Số
                  </Button>
                )}
              </div>

              <Button variant="ghost" onClick={() => setSelectedDetailOrder(null)} className="h-8 px-3 text-xs">
                Đóng
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
        <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Tên Học Sinh <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="VD: Nguyễn Văn Anh"
                value={newOrderForm.student_name}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, student_name: e.target.value })}
                required
                className="h-8"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mã Số Học Sinh</label>
              <Input
                placeholder="VD: HS-1108"
                value={newOrderForm.student_code}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, student_code: e.target.value })}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lớp Học</label>
              <Input
                placeholder="VD: 11A1 - Chuyên Toán"
                value={newOrderForm.student_class}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, student_class: e.target.value })}
                className="h-8"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Số Điện Thoại</label>
              <Input
                placeholder="VD: 0987654321"
                value={newOrderForm.buyer_phone}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, buyer_phone: e.target.value })}
                className="h-8"
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
              className="h-8"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                className="h-8"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Loại Thu</label>
              <select
                value={newOrderForm.reference_type}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, reference_type: e.target.value as any })}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="TUITION">Học Phí Trường</option>
                <option value="COURSE">Khóa Học</option>
                <option value="SUBSCRIPTION">Gói Cước SaaS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phương Thức Thanh Toán</label>
              <select
                value={newOrderForm.payment_method}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, payment_method: e.target.value as PaymentMethod })}
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="PAID">Đã Thu Tiền</option>
                <option value="PENDING">Chờ Đối Soát Tại Quầy</option>
              </select>
            </div>
          </div>

          <div className="pt-2.5 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="whitespace-nowrap h-8 text-xs">
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold whitespace-nowrap h-8 text-xs">
              Tạo Phiếu Thu
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
