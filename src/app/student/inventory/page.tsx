'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, ShoppingBag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { catalogService } from '@/services/catalog.service';
import { toast } from 'sonner';

export default function StudentInventoryPage() {
  const { user } = useAuthStore();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [inventoryItems, setInventoryItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    setIsLoading(true);
    catalogService.getInventory(user?.id).then((items) => {
      if (Array.isArray(items)) {
        setInventoryItems(items);
      }
    }).catch(() => {
      setInventoryItems([]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [user?.id]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Túi Đồ &amp; Phần Thưởng Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý các mã voucher giảm giá, huy hiệu thành tích và quà tặng đã đổi từ Ngọc Tri Thức.
          </p>
        </div>
        <Link href="/student/rewards">
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3.5 text-xs font-semibold gap-1.5"
            leftIcon={<ShoppingBag className="w-3.5 h-3.5 text-primary" />}
          >
            Quay lại Cửa hàng đổi quà
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4 animate-pulse"
            >
              <div className="h-20 w-20 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : inventoryItems.length === 0 ? (
        <Card className="p-10 text-center space-y-3 border border-slate-200/80 dark:border-slate-800">
          <Gift className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">Bạn chưa đổi phần thưởng nào.</p>
          <Link href="/student/rewards">
            <Button size="sm" className="text-xs">
              Đến Cửa hàng đổi quà ngay
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventoryItems.map((item) => (
            <Card
              key={item.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4"
            >
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700">
                <img src={item.image || ''} alt={item.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={item.is_used ? 'secondary' : 'success'} className="text-[10px]">
                    {item.is_used ? 'ĐÃ SỬ DỤNG' : 'SẴN SÀNG DÙNG'}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {item.acquired_at
                      ? new Date(item.acquired_at).toLocaleDateString('vi-VN')
                      : ''}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </h4>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                    {item.code}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleCopy(item.code, item.id)}
                    leftIcon={
                      copiedId === item.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {copiedId === item.id ? 'Đã chép' : 'Sao chép'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
