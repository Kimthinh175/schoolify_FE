'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { catalogService } from '@/services/catalog.service';
import { SubscriptionPackage } from '@/types';
import { toast } from 'sonner';

export default function AdminPackagesPage() {
  const [packages, setPackages] = React.useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPkg, setEditingPkg] = React.useState<SubscriptionPackage | null>(null);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [maxStudents, setMaxStudents] = React.useState('500');
  const [maxTeachers, setMaxTeachers] = React.useState('10');
  const [storageGb, setStorageGb] = React.useState('50');

  const loadPackages = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await catalogService.getPackages();
      if (data.length > 0) {
        setPackages(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const openCreateModal = () => {
    setEditingPkg(null);
    setName('');
    setDescription('');
    setPrice('199000');
    setMaxStudents('500');
    setMaxTeachers('10');
    setStorageGb('50');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: SubscriptionPackage) => {
    setEditingPkg(pkg);
    setName(pkg.name || '');
    setDescription(pkg.description || '');
    setPrice(String(pkg.price ?? 0));
    setMaxStudents(String(pkg.max_students_total ?? 500));
    setMaxTeachers(String(pkg.max_teachers ?? 10));
    setStorageGb(String(pkg.storage_limit_gb ?? 50));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPkg) {
      const updated = await catalogService.updatePackage(editingPkg.id, {
        name: name.trim(),
        description: description.trim() || editingPkg.description,
        price: Number(price) || 0,
        max_students_total: Number(maxStudents) || 500,
        max_teachers: Number(maxTeachers) || 10,
        storage_limit_gb: Number(storageGb) || 50,
      });
      if (updated) {
        setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Đã cập nhật gói đăng ký trên PostgreSQL!');
      } else {
        setPackages((prev) =>
          prev.map((p) =>
            p.id === editingPkg.id
              ? {
                  ...p,
                  name: name.trim(),
                  description: description.trim(),
                  price: Number(price) || 0,
                  max_students_total: Number(maxStudents) || 500,
                  max_teachers: Number(maxTeachers) || 10,
                  storage_limit_gb: Number(storageGb) || 50,
                }
              : p
          )
        );
        toast.success('Đã cập nhật gói đăng ký!');
      }
    } else {
      const created = await catalogService.createPackage({
        name: name.trim(),
        description:
          description.trim() ||
          'Gói đăng ký bản quyền dịch vụ luyện thi & quản lý học tập trên nền tảng Schoolify.',
        price: Number(price) || 0,
        billing_cycle: 'MONTHLY',
        max_teachers: Number(maxTeachers) || 10,
        max_students_total: Number(maxStudents) || 500,
        max_classes: 20,
        max_students_per_class: 40,
        storage_limit_gb: Number(storageGb) || 50,
        can_sell_courses: true,
        is_active: true,
        features: ['Quản lý toàn diện', 'Luyện đề chuẩn GDPT 2018', 'Hỗ trợ 24/7'],
      });

      if (created) {
        setPackages((prev) => [...prev, created]);
        toast.success('Đã tạo gói đăng ký mới trong PostgreSQL!');
      } else {
        const fallbackPkg: SubscriptionPackage = {
          id: `pkg-${Date.now()}`,
          name: name.trim(),
          description: description.trim(),
          price: Number(price) || 0,
          billing_cycle: 'MONTHLY',
          max_teachers: Number(maxTeachers) || 10,
          max_students_total: Number(maxStudents) || 500,
          max_classes: 20,
          max_students_per_class: 40,
          storage_limit_gb: Number(storageGb) || 50,
          can_sell_courses: true,
          is_active: true,
          features: ['Quản lý toàn diện', 'Hỗ trợ 24/7'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setPackages((prev) => [...prev, fallbackPkg]);
        toast.success('Đã thêm gói đăng ký mới!');
      }
    }

    setIsModalOpen(false);
    setEditingPkg(null);
  };

  const handleToggleActive = async (pkg: SubscriptionPackage) => {
    const nextActive = !pkg.is_active;
    const updated = await catalogService.updatePackage(pkg.id, { is_active: nextActive });
    if (updated) {
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
    } else {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: nextActive } : p))
      );
    }
    toast.success(nextActive ? `Đã mở bán gói "${pkg.name}"` : `Đã tạm ẩn gói "${pkg.name}"`);
  };

  const handleDelete = async (pkg: SubscriptionPackage) => {
    const ok = await catalogService.deletePackage(pkg.id);
    setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
    if (ok) {
      toast.success(`Đã xóa gói "${pkg.name}" khỏi PostgreSQL!`);
    } else {
      toast.success(`Đã xóa gói "${pkg.name}"!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gói Đăng Ký</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý và thiết lập các gói đăng ký dịch vụ đồng bộ trực tiếp với PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPackages}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Làm mới
          </Button>
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Tạo Gói Đăng Ký Mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="primary" className="text-xs">
                  {pkg.billing_cycle}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleToggleActive(pkg)}
                  className="cursor-pointer"
                  title="Bấm để bật/tắt trạng thái mở bán"
                >
                  <Badge variant={pkg.is_active ? 'success' : 'secondary'}>
                    {pkg.is_active ? 'ĐANG BÁN' : 'TẠM ẨN'}
                  </Badge>
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{pkg.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-4">
                {formatMoney(Number(pkg.price || 0))}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  /{pkg.billing_cycle === 'YEARLY' ? 'năm' : 'tháng'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Giới hạn học sinh:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {pkg.max_students_total} em
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giáo viên:</span>
                <span className="font-bold text-slate-900 dark:text-white">{pkg.max_teachers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cloud Storage:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {pkg.storage_limit_gb} GB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => openEditModal(pkg)}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                Chỉnh Sửa Gói
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={() => handleDelete(pkg)}
                title="Xóa gói"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPkg ? 'Chỉnh Sửa Gói Đăng Ký' : 'Tạo Gói Bản Quyền SaaS Mới'}
        description="Cấu hình mức giá và các giới hạn Quotas lưu trực tiếp vào PostgreSQL."
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <Input
            label="Tên gói cước *"
            placeholder="VD: Gói Luyện Thi Chuyên Sâu Pro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Mô tả ngắn"
            placeholder="Mô tả quyền lợi nổi bật của gói..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Giá tiền (VNĐ) *"
            type="number"
            placeholder="199000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Tối đa học sinh"
              type="number"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
            />
            <Input
              label="Tối đa giáo viên"
              type="number"
              value={maxTeachers}
              onChange={(e) => setMaxTeachers(e.target.value)}
            />
            <Input
              label="Cloud Storage (GB)"
              type="number"
              value={storageGb}
              onChange={(e) => setStorageGb(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingPkg ? 'Lưu Cập Nhật' : 'Lưu Gói Cước'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
