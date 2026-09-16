'use client';

import * as React from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle,
  User,
  Calendar,
  GraduationCap,
  Wallet,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { useParentStore } from '@/store/parent.store';
import { MOCK_ORDERS } from '@/services/mock/data';
import { Order } from '@/types';

export default function ParentTuitionPage() {
  const { children, activeChildId } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  const [tuitionOrders, setTuitionOrders] = React.useState<Order[]>([
    ...MOCK_ORDERS.filter((o) => o.reference_type === 'TUITION'),
    {
      id: 'ord-pending-02',
      code: 'ORD-20260901-011',
      buyer_id: 'usr-parent-01',
      buyer_name: 'Nguyễn Văn Tuấn',
      reference_type: 'TUITION',
      reference_id: 'cls-11a1-hk2',
      item_name_snapshot: 'Tiền Quỹ Cơ Sở Vật Chất & BHYT Học Sinh 2026',
      item_price_snapshot: 850000,
      payment_method: 'BANK',
      status: 'PENDING',
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR-TUITION-011',
      created_at: '2026-08-24T08:00:00Z',
    },
  ]);

  const [payingOrder, setPayingOrder] = React.useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = React.useState<Order | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleConfirmPaid = () => {
    if (!payingOrder) return;
    setTuitionOrders((prev) =>
      prev.map((o) => (o.id === payingOrder.id ? { ...o, status: 'PAID' } : o))
    );
    setIsSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge variant="purple" className="mb-2">Cổng Thanh Toán Học Phí Trực Tuyến</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Phiếu Thu Học Phí Của Con: {activeChild.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quét mã VietQR chuyển khoản nhanh từ mọi ứng dụng ngân hàng. Hệ thống tự động gạch nợ sau 30 giây.
        </p>
      </div>

      {/* Tuition Bills List */}
      <div className="space-y-4">
        {tuitionOrders.map((order) => (
          <Card
            key={order.id}
            className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${order.status === 'PENDING'
              ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md'
              : ''
              }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">{order.code}</span>
                <Badge variant={order.status === 'PAID' ? 'success' : 'warning'}>
                  {order.status === 'PAID' ? 'ĐÃ HOÀN TẤT' : 'CHƯA THANH TOÁN'}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{order.item_name_snapshot}</h3>
              <p className="text-xs text-slate-500">
                Học sinh: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeChild.name}</span> ({activeChild.className})
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {formatMoney(order.item_price_snapshot)}
              </span>

              {order.status === 'PENDING' ? (
                <Button
                  onClick={() => {
                    setPayingOrder(order);
                    setIsSuccess(false);
                  }}
                  variant="primary"
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  Quét Mã VietQR Đóng Tiền
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Receipt className="w-3.5 h-3.5" />}
                  onClick={() => setReceiptOrder(order)}
                >
                  Xem Biên Lai
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* VietQR Payment Modal */}
      <Dialog
        isOpen={!!payingOrder}
        onClose={() => setPayingOrder(null)}
        title={`Thanh Toán Học Phí: ${payingOrder?.item_name_snapshot}`}
        description="Mở ứng dụng Mobile Banking bất kỳ để quét mã QR chuyển khoản."
      >
        {payingOrder && (
          <div className="py-2 flex flex-col items-center text-center space-y-4">
            {!isSuccess ? (
              <>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-md">
                  <img
                    src={`https://img.vietqr.io/image/970422-123456789-compact2.png?amount=${payingOrder.item_price_snapshot}&addInfo=${payingOrder.code}&accountName=SCHOOLIFY`}
                    alt="VietQR"
                    className="w-52 h-52 rounded-xl object-contain"
                  />
                </div>

                <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-bold text-indigo-600 text-sm">{formatMoney(payingOrder.item_price_snapshot)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nội dung CK:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{payingOrder.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người thụ hưởng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">THPT Chuyên Công Nghệ Schoolify</span>
                  </div>
                </div>

                <Button onClick={handleConfirmPaid} className="w-full justify-center" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Tôi Đã Hoàn Tất Chuyển Khoản
                </Button>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thanh Toán Học Phí Thành Công!</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Biên lai điện tử đã được xuất và đồng bộ sang hệ thống kế toán nhà trường.
                </p>
                <Button onClick={() => setPayingOrder(null)} className="mt-2">
                  Đóng Hộp Thoại
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Custom Mockup Receipt Modal */}
      <Dialog
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        className="!shadow-none"
      >
        {receiptOrder && (
          <div className="relative bg-[#f4f7fb] dark:bg-slate-900 rounded-3xl overflow-hidden p-4 sm:p-8 space-y-6 sm:space-y-8 font-sans border border-slate-100 dark:border-slate-800 w-full max-w-[500px] mx-auto">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 dark:opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 dark:opacity-10 translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-[14px] bg-[#5c59e6] flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-white font-bold text-3xl leading-none">S</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-black tracking-tight text-[#1e1b4b] dark:text-white leading-none mb-0.5">Schoolify</span>
                    <span className="text-[11px] text-slate-500 font-medium">Hệ thống quản lý giáo dục toàn diện</span>
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-center gap-4 mb-5">
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700 max-w-[40px]"></div>
                <h2 className="text-xl sm:text-[22px] font-black text-[#1e1b4b] dark:text-white uppercase tracking-wider text-center shrink-0">Biên Lai Thanh Toán</h2>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700 max-w-[40px]"></div>
              </div>

              <div className="bg-[#dcfce7] dark:bg-emerald-900/50 text-[#166534] dark:text-emerald-400 px-4 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider shrink-0">Đã thanh toán</span>
              </div>
            </div>

            {/* Top Cards Info */}
            <div className="relative z-10 flex flex-row w-full mb-2">
              {/* Left Col */}
              <div className="flex-1 py-4 pr-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100/50 dark:bg-slate-700 flex items-center justify-center text-blue-500 shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Thông tin thanh toán</span>
                </div>
                <p className="text-[15px] sm:text-[17px] font-bold text-[#1e1b4b] dark:text-white mb-1.5 leading-tight">{receiptOrder.buyer_name || 'Phụ huynh'}</p>
                <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Phương thức: VietQR</p>
              </div>

              {/* Right Col */}
              <div className="flex-1 py-4 pl-4 sm:pl-5 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100/50 dark:bg-slate-700 flex items-center justify-center text-blue-500 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chi tiết hóa đơn</span>
                </div>
                <div>
                  <div className="flex flex-col text-[12px] sm:text-[13px] mb-2">
                    <span className="text-slate-500 mb-0.5">Mã tham chiếu:</span>
                    <span className="font-semibold text-[#1e1b4b] dark:text-slate-200 break-all leading-tight">{receiptOrder.code}</span>
                  </div>
                  <div className="flex flex-row text-[12px] sm:text-[13px] gap-1.5 mb-1.5">
                    <span className="text-slate-500 whitespace-nowrap">Ngày lập:</span>
                    <span className="font-semibold text-[#1e1b4b] dark:text-slate-200">{receiptOrder.created_at ? new Date(receiptOrder.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex flex-row text-[12px] sm:text-[13px] gap-1.5">
                    <span className="text-slate-500 whitespace-nowrap">Ngày thu:</span>
                    <span className="font-semibold text-[#1e1b4b] dark:text-slate-200">{receiptOrder.paid_at ? new Date(receiptOrder.paid_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Table Card */}
            <div className="relative z-10 w-full">
              <div className="py-3.5 flex justify-between items-center border-t border-b border-slate-200 dark:border-slate-700">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nội dung khoản thu</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Thành tiền</span>
              </div>

              <div className="py-5 border-b border-slate-200 dark:border-slate-700 border-dashed">
                <div className="flex flex-row items-start justify-between gap-2 sm:gap-4">
                  <div className="flex items-start gap-2.5 sm:gap-3 w-full">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100/50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-[13px] sm:text-[14px] font-semibold text-[#1e1b4b] dark:text-slate-200 flex-1 leading-snug pt-0.5">{receiptOrder.item_name_snapshot}</p>
                  </div>
                  <p className="text-[14px] sm:text-[15px] font-bold text-[#1e1b4b] dark:text-slate-200 whitespace-nowrap shrink-0 pt-0.5">{formatMoney(receiptOrder.item_price_snapshot)}</p>
                </div>
              </div>

              <div className="py-5 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2.5 w-full">
                <div className="flex justify-between items-center text-[12px] sm:text-[13px] w-full">
                  <span className="text-slate-500 font-medium whitespace-nowrap">Tạm tính</span>
                  <span className="text-[#1e1b4b] dark:text-slate-300 font-semibold text-right whitespace-nowrap">{formatMoney(receiptOrder.item_price_snapshot)}</span>
                </div>
                <div className="flex justify-between items-center text-[12px] sm:text-[13px] w-full">
                  <span className="text-slate-500 font-medium whitespace-nowrap">Thuế (0%)</span>
                  <span className="text-[#1e1b4b] dark:text-slate-300 font-semibold text-right whitespace-nowrap">0 ₫</span>
                </div>
              </div>

              <div className="py-4 sm:py-5 flex flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100/50 dark:bg-slate-700 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-bold text-[#1e1b4b] dark:text-white uppercase tracking-wider">Tổng cộng</span>
                </div>
                <span className="text-[20px] sm:text-[24px] font-black text-[#5c59e6] dark:text-indigo-400 tracking-tight whitespace-nowrap ml-auto">{formatMoney(receiptOrder.item_price_snapshot)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 pt-4 pb-2 space-y-8 w-full">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" className="w-full sm:w-36 h-12 border-slate-300 dark:border-slate-600 font-bold rounded-xl bg-white dark:bg-slate-800 text-[#1e1b4b] dark:text-slate-200" leftIcon={<Download className="w-4 h-4" />}>
                  Tải PDF
                </Button>
                <Button variant="primary" className="w-full sm:w-36 h-12 bg-[#12b2d6] hover:bg-[#0f9fbf] border-none text-white font-bold shadow-md rounded-xl" onClick={() => setReceiptOrder(null)}>
                  Đóng
                </Button>
              </div>
              <div className="flex flex-row items-start justify-center gap-3 mx-auto max-w-sm">
                <div className="w-6 h-6 rounded-full border-2 border-blue-200 dark:border-slate-600 flex items-center justify-center text-blue-400 dark:text-slate-400 shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4 py-0.5 font-medium leading-relaxed">
                  <p>Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ Schoolify.</p>
                  {/* <p>Cảm ơn quý phụ huynh đã đồng hành cùng Schoolify.</p> */}
                </div>
              </div>
            </div>

          </div>
        )}
      </Dialog>
    </div>
  );
}
