'use client';

import {
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_SCHOOLS, MOCK_ORDERS } from '@/services/mock/data';

export default function AdminDashboardPage() {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Badge variant="purple" className="mb-2">Nền Tảng Quản Trị SaaS</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Bảng Điều Khiển Tổng Quan (Super Admin)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Giám sát hoạt động của các cơ sở giáo dục (Tenants), doanh thu định kỳ và dòng tiền toàn sàn.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Doanh Thu Tháng (MRR)</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(156800000)}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.5% so với tháng trước</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Trường Học (Tenants)</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center dark:bg-purple-950 dark:text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">24 Cơ sở</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+3 trường đăng ký mới</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng Người Dùng</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">18,450</p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+1,200 tài khoản mới</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hoa Hồng Nền Tảng (15%)</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(23500000)}</p>
            <span className="text-xs text-slate-500">Từ Marketplace khóa học</span>
          </div>
        </Card>
      </div>

      {/* Two columns: Schools Status & Recent Global Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schools List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Trường Học Đối Tác Gần Đây</h3>
            <Badge variant="outline">Xem tất cả ({MOCK_SCHOOLS.length})</Badge>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {MOCK_SCHOOLS.map((school) => (
              <div key={school.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {school.code.slice(0, 4)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{school.name}</p>
                    <p className="text-xs text-slate-500">{school.students_count} học sinh • {school.teachers_count} giáo viên</p>
                  </div>
                </div>
                <Badge variant={school.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {school.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Global Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Giao Dịch Toàn Sàn Mới Nhất</h3>
            <Badge variant="outline">Xem báo cáo</Badge>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{order.item_title}</p>
                  <p className="text-xs text-slate-500">{order.buyer_name} • {order.payment_method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(order.total_amount)}</p>
                  <Badge variant="success" className="text-[10px]">Đã Thanh Toán</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
