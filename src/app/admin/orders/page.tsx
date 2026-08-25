'use client';

import * as React from 'react';
import { CreditCard, Search, DollarSign, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_ORDERS } from '@/services/mock/data';

export default function AdminOrdersPage() {
  const [search, setSearch] = React.useState('');
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tài Chính & Đối Soát Toàn Sàn</h1>
        <p className="text-xs text-slate-500 mt-0.5">Kiểm soát đơn hàng, phí hoa hồng nền tảng và dòng tiền SaaS</p>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Tìm theo mã đơn hoặc người thanh toán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Đơn</TableHead>
              <TableHead>Loại Giao Dịch</TableHead>
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Nội Dung</TableHead>
              <TableHead>Tổng Tiền</TableHead>
              <TableHead>Hoa Hồng Sàn</TableHead>
              <TableHead className="text-right">Trạng Thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-bold">{order.code}</TableCell>
                <TableCell>
                  <Badge variant={order.reference_type === 'SUBSCRIPTION' ? 'primary' : 'default'} className="text-[10px]">
                    {order.reference_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-semibold">{order.buyer_name}</TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">{order.item_title}</TableCell>
                <TableCell className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{formatMoney(order.total_amount)}</TableCell>
                <TableCell className="text-xs font-semibold text-emerald-600">
                  {order.reference_type === 'COURSE' ? formatMoney(order.total_amount * 0.15) : '100% Thu Admin'}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="success" className="text-[10px]">ĐÃ THU TIỀN</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
