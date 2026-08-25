'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Gift,
  Award,
  CheckCircle2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_STORE_ITEMS } from '@/services/mock/data';
import { StoreItem } from '@/types';

export default function StudentRewardsStorePage() {
  const [points, setPoints] = React.useState(850);
  const [selectedItem, setSelectedItem] = React.useState<StoreItem | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);

  const handleRedeem = () => {
    if (!selectedItem || points < selectedItem.points_required) return;
    setPoints((prev) => prev - selectedItem.points_required);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header with Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl">
        <div>
          <Badge variant="primary" className="bg-white/20 text-white font-bold backdrop-blur-xs mb-2">
            Cửa Hàng Đổi Quà Tích Điểm
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black">
            Đổi Điểm Thưởng Lấy Quà Độc Quyền!
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Chăm chỉ làm bài kiểm tra, tham gia lớp học đúng giờ để tích lũy điểm thưởng.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
          <div className="h-10 w-10 rounded-xl bg-white text-amber-600 flex items-center justify-center font-bold text-lg">
            💎
          </div>
          <div>
            <span className="text-[11px] text-amber-100 uppercase font-bold">Số Dư Hiện Tại</span>
            <p className="text-xl font-black">{points} Điểm</p>
          </div>
        </div>
      </div>

      {/* Store Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_STORE_ITEMS.map((item) => {
          const canAfford = points >= item.points_required;
          return (
            <Card key={item.id} className="p-0 overflow-hidden flex flex-col group hover:shadow-xl transition-all">
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image_url || ''}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="primary" className="bg-amber-500 font-bold text-xs shadow-md">
                    💎 {item.points_required} Điểm
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <Badge variant="secondary" className="text-[10px] mb-1.5 font-bold">
                    {item.type}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Còn {item.quantity_available} phần</span>
                  <Button
                    size="sm"
                    variant={canAfford ? 'primary' : 'outline'}
                    disabled={!canAfford}
                    onClick={() => {
                      setSelectedItem(item);
                      handleRedeem();
                    }}
                  >
                    {canAfford ? 'Đổi Quà Ngay' : 'Chưa Đủ Điểm'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Success Modal */}
      <Dialog
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Đổi Quà Thành Công! 🎉"
        description={`Bạn đã đổi thành công: ${selectedItem?.name}`}
      >
        <div className="py-4 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Gift className="w-10 h-10" />
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 w-full text-xs space-y-2">
            <p className="font-bold text-sm text-slate-900 dark:text-white">Mã Voucher / Quà Tặng:</p>
            <p className="font-mono text-base font-black text-indigo-600 tracking-wider">
              SCHOOLIFY-GIFT-{Math.floor(100000 + Math.random() * 900000)}
            </p>
            <p className="text-slate-500">Vật phẩm đã được lưu vào <b>Túi Đồ Của Tôi</b>.</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 justify-center" onClick={() => setIsSuccessModalOpen(false)}>
              Tiếp Tục Đổi Quà
            </Button>
            <Link href="/student/inventory" className="flex-1">
              <Button className="w-full justify-center">Xem Túi Đồ</Button>
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
