'use client';

import * as React from 'react';
import { Package, Plus, Edit, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_PACKAGES } from '@/services/mock/data';
import { SubscriptionPackage } from '@/types';

export default function AdminPackagesPage() {
  const [packages, setPackages] = React.useState<SubscriptionPackage[]>(MOCK_PACKAGES);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [maxStudents, setMaxStudents] = React.useState('500');

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newPkg: SubscriptionPackage = {
      id: `pkg-${Date.now()}`,
      name,
      price: parseInt(price) || 2000000,
      billing_cycle: 'MONTHLY',
      max_teachers: 10,
      max_students_total: parseInt(maxStudents) || 500,
      max_classes: 20,
      max_students_per_class: 40,
      storage_limit_gb: 50,
      can_sell_courses: true,
      is_active: true,
      features: ['Quản lý toàn diện', 'Hỗ trợ 24/7'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPackages([...packages, newPkg]);
    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cấu Hình Gói Cước SaaS</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tạo các gói bản quyền B2B bán cho các trường học và trung tâm</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Tạo Gói Cước Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="primary" className="text-xs">{pkg.billing_cycle}</Badge>
                <Badge variant={pkg.is_active ? 'success' : 'secondary'}>
                  {pkg.is_active ? 'ĐANG BÁN' : 'TẠM ẨN'}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{pkg.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-4">
                {formatMoney(pkg.price)} <span className="text-xs text-slate-400 font-normal">/tháng</span>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Giới hạn học sinh:</span>
                <span className="font-bold text-slate-900 dark:text-white">{pkg.max_students_total} em</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giáo viên:</span>
                <span className="font-bold text-slate-900 dark:text-white">{pkg.max_teachers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cloud Storage:</span>
                <span className="font-bold text-slate-900 dark:text-white">{pkg.storage_limit_gb} GB</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full justify-center">
              Chỉnh Sửa Gói
            </Button>
          </Card>
        ))}
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Gói Bản Quyền SaaS Mới"
        description="Cấu hình mức giá và các giới hạn Quotas."
      >
        <form onSubmit={handleCreate} className="space-y-4 py-2">
          <Input label="Tên gói cước *" placeholder="VD: Gói Mầm Non & Tiểu Học" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Giá tiền (VNĐ/tháng) *" type="number" placeholder="2500000" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <Input label="Hạn mức số lượng học sinh tối đa" type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu Gói Cước</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
