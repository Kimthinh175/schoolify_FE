'use client';

import * as React from 'react';
import { DollarSign, Search, Printer, CheckCircle2, QrCode, CreditCard, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_ORDERS } from '@/services/mock/data';
import { Order } from '@/types';

export default function CashierPage() {
  const [orders, setOrders] = React.useState<Order[]>([
    ...MOCK_ORDERS,
    {
      id: 'ord-cash-01',
      code: 'ORD-20260824-099',
      buyer_id: 'usr-student-99',
      buyer_name: 'Trần Thảo My (Lớp 11A1)',
      buyer_email: 'thaomy@gmail.com',
      buyer_phone: '0987654321',
      reference_type: 'TUITION',
      reference_id: 'cls-11a1',
      item_title: 'Học phí Học kỳ I - Lớp 11A1',
      total_amount: 3500000,
      payment_method: 'COD',
      status: 'PENDING',
      created_at: '2026-08-24T08:00:00Z',
    },
  ]);

  const [search, setSearch] = React.useState('');
  const [selectedReceipt, setSelectedReceipt] = React.useState<Order | null>(null);

  const filteredOrders = orders.filter(
    (o) =>
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmPaid = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'PAID', paid_at: new Date().toISOString() } : o))
    );
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge variant="purple" className="mb-2">Phân Hệ Thu Ngân & Kế Toán (Staff)</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Thu Ngân & Quản Lý Học Phí Tại Quầy
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tra cứu phiếu thu học phí, xác nhận thanh toán tiền mặt/chuyển khoản và in biên lai điện tử.
        </p>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <Input
          placeholder="Tìm theo tên học sinh, số điện thoại hoặc mã đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Hóa Đơn</TableHead>
              <TableHead>Học Sinh / Phụ Huynh</TableHead>
              <TableHead>Nội Dung Thu</TableHead>
              <TableHead>Số Tiền</TableHead>
              <TableHead>Phương Thức</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {order.code}
                </TableCell>
                <TableCell>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.buyer_name}</p>
                  <p className="text-xs text-slate-500">{order.buyer_phone}</p>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                  {order.item_title}
                </TableCell>
                <TableCell className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {formatMoney(order.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {order.payment_method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={order.status === 'PAID' ? 'success' : 'warning'}>
                    {order.status === 'PAID' ? 'ĐÃ THU' : 'CHỜ THU'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleConfirmPaid(order.id)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Đã Nhận Tiền
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReceipt(order)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                    >
                      In Biên Lai
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Printable Receipt Modal */}
      <Dialog
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Biên Lai Thu Học Phí Điện Tử"
        description="Mã biên lai hợp lệ của hệ thống Schoolify Hub."
      >
        {selectedReceipt && (
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4 text-xs">
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">THPT CHUYÊN CÔNG NGHỆ SCHOOLIFY</h3>
              <p className="text-slate-500">Khu Công Nghệ Cao, TP. Thủ Đức, TP.HCM</p>
              <p className="font-mono text-indigo-600 font-bold mt-1">MÃ BIÊN LAI: {selectedReceipt.code}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Người nộp tiền:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khoản thu:</span>
                <span className="text-slate-900 dark:text-white">{selectedReceipt.item_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian giao dịch:</span>
                <span className="text-slate-900 dark:text-white">{new Date().toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                <span>TỔNG TIỀN ĐÃ THU:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatMoney(selectedReceipt.total_amount)}</span>
              </div>
            </div>

            <div className="pt-3 text-center">
              <Button onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                In Ra Máy In / Tải PDF
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
