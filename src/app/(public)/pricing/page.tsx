'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Zap,
  Building2,
  HelpCircle,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_PACKAGES } from '@/services/mock/data';
import { SubscriptionPackage } from '@/types';

export default function PricingPage() {
  const [isYearly, setIsYearly] = React.useState(false);
  const [selectedPkg, setSelectedPkg] = React.useState<SubscriptionPackage | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = React.useState(false);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="purple" className="mb-3">Bảng Giá SaaS Doanh Nghiệp 2026</Badge>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Chi Phí Minh Bạch. <br />
          Quy Mô Linh Hoạt Cho Mọi Trường Học.
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
          Chọn gói bản quyền phù hợp cho trung tâm hoặc trường học của bạn. Nâng cấp hoặc hạ cấp bất kỳ lúc nào mà không gián đoạn dịch vụ.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              !isYearly
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Thanh toán theo Tháng
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isYearly
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <span>Thanh toán theo Năm</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
              Tiết kiệm 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {MOCK_PACKAGES.map((pkg, idx) => {
          const isPopular = pkg.id === 'pkg-growth';
          const calculatedPrice = isYearly ? pkg.price * 12 * 0.8 : pkg.price;

          return (
            <Card
              key={pkg.id}
              className={`relative flex flex-col p-8 transition-all ${
                isPopular
                  ? 'border-2 border-[#00B8DD] shadow-xl scale-100 lg:scale-105 z-10 bg-white dark:bg-slate-900'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="py-1 px-3 text-xs uppercase tracking-wider font-bold shadow-md bg-[#00B8DD] text-white">
                    Phổ Biến Nhất
                  </Badge>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{pkg.description}</p>
              </div>

              <div className="mt-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {formatMoney(calculatedPrice)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/{isYearly ? 'năm' : 'tháng'}</span>
                </div>
              </div>

              {/* Quotas Box */}
              <div className="mb-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giới hạn học sinh:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pkg.max_students_total.toLocaleString()} em</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số lượng giáo viên:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pkg.max_teachers} thầy cô</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dung lượng video:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pkg.storage_limit_gb} GB Cloud</span>
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3 flex-1 mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tính Năng Bao Gồm:</p>
                {pkg.features?.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setSelectedPkg(pkg)}
                variant={isPopular ? 'primary' : 'outline'}
                className="w-full justify-center h-12 text-sm font-bold"
              >
                Đăng Ký Gói Ngay
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Checkout QR Modal */}
      <Dialog
        isOpen={!!selectedPkg}
        onClose={() => {
          setSelectedPkg(null);
          setIsPaidSuccess(false);
        }}
        title={`Thanh Toán Bản Quyền SaaS: ${selectedPkg?.name}`}
        description="Quét mã QR VietQR để kích hoạt ngay lập tức gói cước của trường."
      >
        {selectedPkg && (
          <div className="py-2 flex flex-col items-center text-center space-y-4">
            {!isPaidSuccess ? (
              <>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR-SCHOOLIFY-SAAS-DEMO"
                    alt="VietQR"
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                </div>
                <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-xs space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-bold text-indigo-600 text-sm">{formatMoney(isYearly ? selectedPkg.price * 12 * 0.8 : selectedPkg.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nội dung chuyển khoản:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">SCHOOLIFY SAAS {selectedPkg.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                    <span className="font-medium text-slate-900 dark:text-white">MB Bank (Schoolify Corp)</span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsPaidSuccess(true)}
                  className="w-full justify-center"
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  Xác Nhận Đã Chuyển Khoản
                </Button>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kích Hoạt Thành Công!</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Gói cước đã được cập nhật vào Tenant của bạn. Tất cả hạn mức Quotas học sinh và tính năng đã sẵn sàng.
                </p>
                <Button onClick={() => setSelectedPkg(null)} className="mt-2">
                  Đóng Hộp Thoại
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
