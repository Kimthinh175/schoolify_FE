'use client';

import * as React from 'react';
import { Gift, Plus, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { MOCK_STORE_ITEMS } from '@/services/mock/data';
import { StoreItem } from '@/types';

export default function TeacherRewardsPage() {
  const [items, setItems] = React.useState<StoreItem[]>(MOCK_STORE_ITEMS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [points, setPoints] = React.useState('500');
  const [desc, setDesc] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newItem: StoreItem = {
      id: `item-${Date.now()}`,
      name,
      points_required: parseInt(points) || 500,
      description: desc,
      type: 'VOUCHER',
      quantity_available: 50,
      status: 'ACTIVE',
      image_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };
    setItems([...items, newItem]);
    setIsModalOpen(false);
    setName('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Gamification Management</Badge>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Kho Quà Tặng & Huy Hiệu Khen Thưởng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo các phần thưởng (Voucher, Huy hiệu học tập) để học sinh đổi bằng điểm chuyên cần.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm Phần Thưởng Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="p-0 overflow-hidden flex flex-col justify-between">
            <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
              <img src={item.image_url || ''} alt="" className="h-full w-full object-cover" />
              <div className="absolute top-3 right-3">
                <Badge variant="primary" className="bg-amber-500 font-bold">
                  💎 {item.points_required} Điểm
                </Badge>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo Vật Phẩm Đổi Thưởng Mới" description="Cài đặt số điểm tích lũy cần để đổi phần thưởng.">
        <form onSubmit={handleCreate} className="space-y-4 py-2">
          <Input label="Tên phần thưởng *" placeholder="VD: Voucher Giảm 30% Học Phí" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Số điểm quy đổi (Points) *" type="number" value={points} onChange={(e) => setPoints(e.target.value)} required />
          <Textarea label="Mô tả chi tiết" placeholder="Điều kiện áp dụng..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu Vật Phẩm</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
