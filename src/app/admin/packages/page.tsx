'use client';

import * as React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Package,
  CheckCircle2,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { catalogService } from '@/services/catalog.service';
import { SubscriptionPackage } from '@/types';
import { toast } from 'sonner';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';

export default function AdminPackagesPage() {
  const [packages, setPackages] = React.useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPkg, setEditingPkg] = React.useState<SubscriptionPackage | null>(null);

  // Form states
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('50000');
  const [billingCycle, setBillingCycle] = React.useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [featuresText, setFeaturesText] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

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

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

  const openCreateModal = () => {
    setEditingPkg(null);
    setName('');
    setDescription('');
    setPrice('50000');
    setBillingCycle('MONTHLY');
    setFeaturesText(
      '+5 Điểm Xịn (💎) mỗi ngày\n+9 Điểm Free (✨) mỗi ngày\nĐủ làm 6 đề Cơ bản hoặc 4 đề Trung bình\nĐổi quà hấp dẫn trong Store'
    );
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: SubscriptionPackage) => {
    setEditingPkg(pkg);
    setName(pkg.name || '');
    setDescription(pkg.description || '');
    setPrice(String(pkg.price ?? 0));
    setBillingCycle((pkg.billing_cycle as any) || 'MONTHLY');
    setFeaturesText(
      Array.isArray(pkg.features)
        ? pkg.features.join('\n')
        : typeof pkg.features === 'string'
        ? pkg.features
        : ''
    );
    setIsActive(pkg.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên gói đăng ký!');
      return;
    }

    const featureList = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload: Partial<SubscriptionPackage> = {
      name: name.trim(),
      description: description.trim(),
      price: Math.max(0, Number(price) || 0),
      billing_cycle: billingCycle,
      is_active: isActive,
      features: featureList,
    };

    if (editingPkg) {
      const updated = await catalogService.updatePackage(editingPkg.id, payload);
      if (updated) {
        setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success(`Đã cập nhật gói "${name}" thành công!`);
      } else {
        setPackages((prev) =>
          prev.map((p) => (p.id === editingPkg.id ? { ...p, ...payload } : p))
        );
        toast.success(`Đã cập nhật gói "${name}"!`);
      }
    } else {
      const created = await catalogService.createPackage(payload);
      if (created) {
        setPackages((prev) => [...prev, created]);
        toast.success(`Đã thêm gói mới "${name}" thành công!`);
      } else {
        toast.error('Không thể tạo gói mới. Vui lòng thử lại.');
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
    if (!confirm(`Bạn có chắc chắn muốn xóa gói "${pkg.name}" khỏi cơ sở dữ liệu?`)) return;
    const ok = await catalogService.deletePackage(pkg.id);
    if (ok) {
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      toast.success(`Đã xóa gói "${pkg.name}" thành công!`);
    } else {
      toast.error('Không thể xóa gói đăng ký.');
    }
  };


  const getPackageMeta = (pkg: SubscriptionPackage) => {
    const nameLower = String(pkg.name || '').toLowerCase();
    const price = Number(pkg.price || 0);

    if (price === 0) {
      return {
        tier: 'FREE',
        badge: 'Khởi đầu miễn phí',
        badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700',
        cardClass: 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700',
        sparks: '9 Tia Sáng/ngày',
        sparksSub: 'Luyện 3 đề thi cơ bản mỗi ngày',
        gems: null,
        extraTag: null,
      };
    }

    if (nameLower.includes('vip') || nameLower.includes('thủ khoa')) {
      return {
        tier: 'VIP',
        badge: 'Đặc quyền cao cấp',
        badgeClass: 'bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/20',
        cardClass: 'border-2 border-[#00B8DD] bg-white dark:bg-slate-900 shadow-xs hover:border-[#009BBD]',
        sparks: '29 Tia Sáng/ngày',
        sparksSub: 'Luyện đề không giới hạn & hướng dẫn giải chi tiết',
        gems: '+10 Ngọc/ngày',
        extraTag: 'AI Gia Sư -50%',
      };
    }

    return {
      tier: 'PRO',
      badge: 'Mục tiêu 8+ • Bán chạy',
      badgeClass: 'bg-[#00B8DD]/10 text-[#00B8DD] border border-[#00B8DD]/20',
      cardClass: 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700',
      sparks: '18 Tia Sáng/ngày',
      sparksSub: 'Gấp đôi lượt luyện đề & tích lũy đổi quà',
      gems: '+5 Ngọc/ngày',
      extraTag: null,
    };
  };

  const activeCount = packages.filter((p) => p.is_active).length;
  const freeCount = packages.filter((p) => Number(p.price) === 0).length;
  const paidCount = packages.filter((p) => Number(p.price) > 0).length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quản Lý Gói Dịch Vụ SaaS
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {packages.length} gói cước
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập các gói luyện thi (Free, Bứt Phá, Thủ Khoa VIP), quyền lợi làm bài và bảng giá.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPackages}
            disabled={isLoading}
            className="h-8 px-3 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-8 px-3 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Tạo gói mới
          </Button>
        </div>
      </div>

      {/* 2. Thẻ KPI Tóm Tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang Mở Bán Trực Tuyến</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {activeCount} <span className="text-xs font-normal text-slate-400">/ {packages.length} gói</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hiển thị công khai trên trang Bảng giá
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gói Trả Phí (PRO / VIP)</div>
          <div className="text-2xl font-bold text-[#00B8DD] mt-1">{paidCount} gói</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tích hợp thanh toán tự động qua VietQR & PayOS
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gói Mặc Định Miễn Phí</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{freeCount} gói</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tự động cấp 9 Tia Sáng ✨ mỗi ngày cho học sinh mới
          </p>
        </Card>
      </div>

      {/* 3. Lưới Các Gói Dịch Vụ - Thiết Kế Nổi Bật Phân Cấp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch">
        {packages.map((pkg) => {
          const isFree = Number(pkg.price) === 0;
          const meta = getPackageMeta(pkg);
          const isVip = meta.tier === 'VIP';
          const features: string[] = Array.isArray(pkg.features)
            ? pkg.features
            : typeof pkg.features === 'string'
            ? [pkg.features]
            : [];

          return (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${meta.cardClass} ${
                !pkg.is_active ? 'opacity-60 grayscale-[0.3]' : ''
              }`}
            >
              {/* Top Banner cho gói VIP */}
              {isVip && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00B8DD] text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>Gói Khuyên Dùng • Thủ Khoa 9+</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header card: Tag phân loại & Nút trạng thái */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.badgeClass}`}>
                    {meta.badge}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(pkg)}
                    className="cursor-pointer transition-transform active:scale-95"
                    title="Bấm để bật/tắt hiển thị gói"
                  >
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 transition-colors"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pkg.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {pkg.is_active ? 'Đang mở bán' : 'Tạm dừng'}
                    </span>
                  </button>
                </div>

                {/* Tên gói & Mô tả */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {pkg.description || 'Gói dịch vụ luyện thi chuẩn hóa GDPT 2018 trên Schoolify.'}
                  </p>
                </div>

                {/* Giá tiền nổi bật */}
                <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                      isVip ? 'text-[#00B8DD]' : 'text-slate-900 dark:text-white'
                    }`}>
                      {isFree ? 'Miễn phí' : formatVND(Number(pkg.price || 0))}
                    </span>
                    {!isFree && (
                      <span className="text-xs text-slate-400 font-medium">
                        /{pkg.billing_cycle === 'YEARLY' ? 'năm' : 'tháng'}
                      </span>
                    )}
                  </div>
                </div>

                {/* KHUNG QUYỀN LỢI CỐT LÕI (HIGHLIGHT BOX) */}
                <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white flex-wrap">
                    <span className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <TiaSangIcon className="w-3.5 h-3.5" flat />
                      {meta.sparks}
                    </span>
                    {meta.gems && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="inline-flex items-center gap-1 text-[#00B8DD]">
                          <NgocIcon className="w-3.5 h-3.5" flat />
                          {meta.gems}
                        </span>
                      </>
                    )}
                    {meta.extraTag && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[10px] bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.2 rounded font-semibold">
                          {meta.extraTag}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {meta.sparksSub}
                  </p>
                </div>

                {/* Danh sách quyền lợi chi tiết - ĐỒNG BỘ CHECKMARK #00B8DD TOÀN BỘ CÁC GÓI */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Toàn bộ quyền lợi:
                  </div>
                  {features.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#00B8DD]" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Chưa có quyền lợi cụ thể</p>
                  )}
                </div>
              </div>

              {/* Action buttons chân thẻ */}
              <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(pkg)}
                  className="flex-1 h-9 text-xs font-semibold rounded-xl border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Sửa thông tin
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(pkg)}
                  className="h-9 px-2.5 text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition-colors"
                  title="Xóa gói"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Modal Tạo / Sửa Gói Dịch Vụ */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingPkg ? 'Chỉnh Sửa Gói Dịch Vụ' : 'Tạo Gói Dịch Vụ Mới'}
        description="Cập nhật thông tin gói cước và quyền lợi ôn thi."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs pt-1">
            {/* Tên gói */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tên Gói Dịch Vụ *
              </label>
              <Input
                required
                placeholder="Ví dụ: Gói Bứt Phá (50k), Gói Thủ Khoa VIP..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Giá tiền & Chu kỳ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Giá Tiền (VNĐ) *
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="50000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chu Kỳ Tính Phí
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as any)}
                  className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#00B8DD]"
                >
                  <option value="MONTHLY">Hàng tháng (Monthly)</option>
                  <option value="YEARLY">Hàng năm (Yearly)</option>
                </select>
              </div>
            </div>

            {/* Mô tả ngắn */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mô Tả Ngắn
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: +5 Điểm Xịn mỗi ngày, +9 Điểm Free để tạo & luyện đề thả ga..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD]"
              />
            </div>

            {/* Danh sách tính năng */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Danh Sách Quyền Lợi & Hạn Mức (Mỗi dòng một quyền lợi)
              </label>
              <textarea
                rows={4}
                placeholder={`+5 Điểm Xịn (💎) mỗi ngày\n+9 Điểm Free (✨) mỗi ngày\nLuyện đề không giới hạn`}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD]"
              />
            </div>

            {/* Trạng thái mở bán */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#00B8DD] border-slate-300 focus:ring-[#00B8DD]"
              />
              <label htmlFor="is-active" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Kích hoạt mở bán ngay trên Cổng Thanh Toán & Trang Bảng Giá
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8 text-xs font-semibold"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
      </Dialog>
    </div>
  );
}
