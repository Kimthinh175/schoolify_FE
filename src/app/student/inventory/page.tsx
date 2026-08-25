'use client';

import * as React from 'react';
import Link from 'next/link';
import { Gift, Tag, CheckCircle2, Copy, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_STORE_ITEMS } from '@/services/mock/data';

export default function StudentInventoryPage() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inventoryItems = [
    {
      id: 'inv-1',
      name: 'Voucher Giảm 50% Khóa Học IELTS / Ngoại Ngữ',
      type: 'VOUCHER',
      code: 'IELTS50-DISCOUNT-9921',
      image: MOCK_STORE_ITEMS[0].image_url,
      acquired_at: '20/08/2026',
      is_used: false,
    },
    {
      id: 'inv-2',
      name: 'Huy Hiệu "Thợ Săn Điểm 10 Lượng Giác"',
      type: 'BADGE',
      code: 'BADGE-MATH-10',
      image: MOCK_STORE_ITEMS[1].image_url,
      acquired_at: '15/08/2026',
      is_used: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Gamification</Badge>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Túi Đồ & Phần Thưởng Của Tôi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các mã voucher giảm giá, huy hiệu thành tích và quà tặng đã đổi từ điểm thưởng.
          </p>
        </div>
        <Link href="/student/rewards">
          <Button variant="outline" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Đến Cửa Hàng Đổi Quà
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventoryItems.map((item) => (
          <Card key={item.id} className="p-5 flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
              <img src={item.image || ''} alt="" className="h-full w-full object-cover" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={item.is_used ? 'secondary' : 'success'} className="text-[10px]">
                  {item.is_used ? 'ĐÃ SỬ DỤNG' : 'SẴN SÀNG DÙNG'}
                </Badge>
                <span className="text-[10px] text-slate-400">Nhận ngày {item.acquired_at}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>

              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg">
                  {item.code}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(item.code, item.id)}
                  leftIcon={copiedId === item.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedId === item.id ? 'Đã chép' : 'Sao chép'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
