'use client';

import * as React from 'react';
import { Search, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { catalogService, OrderItem } from '@/services/catalog.service';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleConfirmOrder = async (order: OrderItem) => {
    const res = await catalogService.confirmOrderPayment(order.id);
    if (res?.order) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.order : o)));
      toast.success(
        `Đã xác nhận thanh toán đơn ${order.code} và cộng +${res.bonusPointsAwarded} điểm thưởng!`
      );
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'PAID' } : o))
      );
      toast.success(`Đã xác nhận thanh toán đơn ${order.code}!`);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      String(order.code || '').toLowerCase().includes(q) ||
      String(order.buyer_name || '').toLowerCase().includes(q) ||
      String(order.item_name_snapshot || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Hóa Đơn</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm soát đơn hàng, hóa đơn thanh toán VietQR và dòng tiền dịch vụ từ PostgreSQL
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Làm mới đơn hàng
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Tìm theo mã đơn, tên khách hàng hoặc gói đăng ký..."
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
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-bold">{order.code}</TableCell>
                <TableCell>
                  <Badge
                    variant={order.reference_type === 'SUBSCRIPTION' ? 'primary' : 'default'}
                    className="text-[10px]"
                  >
                    {order.reference_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-semibold">{order.buyer_name}</TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {order.item_name_snapshot}
                </TableCell>
                <TableCell className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {formatMoney(Number(order.item_price_snapshot || 0))}
                </TableCell>
                <TableCell className="text-xs font-semibold text-emerald-600">
                  {order.reference_type === 'COURSE'
                    ? formatMoney(Number(order.item_price_snapshot || 0) * 0.15)
                    : '100% Thu Admin'}
                </TableCell>
                <TableCell className="text-right">
                  {order.status === 'PAID' ? (
                    <Badge variant="success" className="text-[10px]">
                      ĐÃ THU TIỀN
                    </Badge>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <Badge variant="warning" className="text-[10px]">
                        CHỜ THANH TOÁN
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirmOrder(order)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Duyệt
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
