'use client';

import * as React from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle,
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
      item_title: 'Tiền Quỹ Cơ Sở Vật Chất & BHYT Học Sinh 2026',
      total_amount: 850000,
      payment_method: 'BANK',
      status: 'PENDING',
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR-TUITION-011',
      created_at: '2026-08-24T08:00:00Z',
    },
  ]);

  const [payingOrder, setPayingOrder] = React.useState<Order | null>(null);
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
            className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
              order.status === 'PENDING'
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{order.item_title}</h3>
              <p className="text-xs text-slate-500">
                Học sinh: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeChild.name}</span> ({activeChild.className})
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {formatMoney(order.total_amount)}
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
                <Button size="sm" variant="outline" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
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
        title={`Thanh Toán Học Phí: ${payingOrder?.item_title}`}
        description="Mở ứng dụng Mobile Banking bất kỳ để quét mã QR chuyển khoản."
      >
        {payingOrder && (
          <div className="py-2 flex flex-col items-center text-center space-y-4">
            {!isSuccess ? (
              <>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-md">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=VIETQR-TUITION-PAYMENT-DEMO"
                    alt="VietQR"
                    className="w-52 h-52 rounded-xl object-contain"
                  />
                </div>

                <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-bold text-indigo-600 text-sm">{formatMoney(payingOrder.total_amount)}</span>
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
    </div>
  );
}
