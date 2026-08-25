'use client';

import * as React from 'react';
import { DollarSign, ArrowUpRight, CreditCard, Download, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_ORDERS } from '@/services/mock/data';

export default function TeacherRevenuePage() {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = React.useState(false);
  const [isPayoutSuccess, setIsPayoutSuccess] = React.useState(false);
  const [payoutAmount, setPayoutAmount] = React.useState('15000000');

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Tài Chính Creator & Khóa Học</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Doanh Thu & Lịch Sử Rút Tiền
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi dòng tiền bán khóa học thương mại trên Marketplace và yêu cầu rút tiền về tài khoản ngân hàng.
          </p>
        </div>
        <Button onClick={() => setIsPayoutModalOpen(true)} leftIcon={<CreditCard className="w-4 h-4" />}>
          Yêu Cầu Rút Tiền
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-6">
          <span className="text-xs font-semibold text-slate-500">Số Dư Khả Dụng (Có Thể Rút)</span>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{formatMoney(24500000)}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Đã đối soát xong kỳ trước</p>
        </Card>

        <Card className="p-6">
          <span className="text-xs font-semibold text-slate-500">Tổng Doanh Thu Đã Bán</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{formatMoney(28823000)}</p>
          <p className="text-xs text-slate-500 mt-1">Từ 58 lượt mua khóa học</p>
        </Card>

        <Card className="p-6">
          <span className="text-xs font-semibold text-slate-500">Phí Sàn Nền Tảng (15%)</span>
          <p className="text-3xl font-black text-slate-500 mt-2">{formatMoney(4323000)}</p>
          <p className="text-xs text-slate-400 mt-1">Tự động trích trừ theo hợp đồng</p>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Lịch Sử Học Sinh Mua Khóa Học</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Đơn</TableHead>
              <TableHead>Học Viên</TableHead>
              <TableHead>Khóa Học</TableHead>
              <TableHead>Số Tiền</TableHead>
              <TableHead>Thu Nhập Thực Nhận (85%)</TableHead>
              <TableHead className="text-right">Trạng Thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ORDERS.filter((o) => o.reference_type === 'COURSE').map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-bold">{order.code}</TableCell>
                <TableCell className="font-semibold text-sm">{order.buyer_name}</TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300">{order.item_title}</TableCell>
                <TableCell className="text-xs">{formatMoney(order.total_amount)}</TableCell>
                <TableCell className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {formatMoney(order.total_amount * 0.85)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="success" className="text-[10px]">ĐÃ THANH TOÁN</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Payout Modal */}
      <Dialog
        isOpen={isPayoutModalOpen}
        onClose={() => {
          setIsPayoutModalOpen(false);
          setIsPayoutSuccess(false);
        }}
        title="Yêu Cầu Rút Tiền Về Tài Khoản Ngân Hàng"
        description="Số tiền sẽ được chuyển khoản trong vòng 24 giờ làm việc."
      >
        <div className="space-y-4 py-2">
          {!isPayoutSuccess ? (
            <>
              <Input
                label="Số tiền muốn rút (VNĐ)"
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
              <Input label="Số tài khoản ngân hàng" defaultValue="1029384756" />
              <Input label="Tên ngân hàng" defaultValue="Vietcombank (Chi nhánh Thủ Đức)" />
              <Input label="Tên chủ tài khoản" defaultValue="NGUYEN VAN HUNG" />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsPayoutModalOpen(false)}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={() => setIsPayoutSuccess(true)}>
                  Xác Nhận Rút Tiền
                </Button>
              </div>
            </>
          ) : (
            <div className="py-4 flex flex-col items-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Đã Gửi Yêu Cầu Rút Tiền Thành Công!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Ban quản trị Super Admin đã tiếp nhận và sẽ giải ngân vào tài khoản của bạn.
              </p>
              <Button onClick={() => setIsPayoutModalOpen(false)} className="mt-2">
                Đóng
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
