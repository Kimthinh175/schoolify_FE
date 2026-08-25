'use client';

import * as React from 'react';
import Link from 'next/link';
import { Package, CheckCircle2, AlertTriangle, ArrowUpRight, HardDrive, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SchoolSubscriptionPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Gói Cước & Bản Quyền Trường Học</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Quản Lý Hạn Mức Quotas & Gia Hạn SaaS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi mức độ sử dụng tài nguyên trường học và nâng cấp gói cước để mở rộng quy mô đào tạo.
          </p>
        </div>
        <Link href="/pricing">
          <Button variant="primary" leftIcon={<ArrowUpRight className="w-4 h-4" />}>
            Nâng Cấp Gói Cước
          </Button>
        </Link>
      </div>

      {/* Current Plan Card */}
      <Card className="p-6 border-2 border-indigo-600 dark:border-indigo-500 bg-gradient-to-r from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="font-bold">GÓI ĐANG SỬ DỤNG</Badge>
              <Badge variant="success">ACTIVE</Badge>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              Gói Tiêu Chuẩn (Growth Academy)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hạn dùng: <span className="font-semibold text-slate-700 dark:text-slate-300">01/01/2026 - 31/12/2026</span> (Còn 128 ngày)
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">3,900,000 đ</span>
            <span className="text-xs text-slate-500">/tháng</span>
          </div>
        </div>
      </Card>

      {/* Quotas Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Học Sinh Toàn Trường</span>
            </div>
            <Badge variant="warning">85%</Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Đã dùng: <b>850</b></span>
              <span>Tối đa: <b>1,000 em</b></span>
            </div>
            <Progress value={85} showLabel={false} />
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            ⚠️ Sắp đạt giới hạn sĩ số. Hãy nâng cấp để tuyển sinh thêm.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Đội Ngũ Giáo Viên</span>
            </div>
            <Badge variant="success">42%</Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Đã dùng: <b>42</b></span>
              <span>Tối đa: <b>100 thầy cô</b></span>
            </div>
            <Progress value={42} showLabel={false} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            ✓ Dung lượng nhân sự còn dồi dào.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              <span>Dung Lượng Video Bài Giảng</span>
            </div>
            <Badge variant="success">38%</Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Đã dùng: <b>38 GB</b></span>
              <span>Tối đa: <b>100 GB Cloud</b></span>
            </div>
            <Progress value={38} showLabel={false} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            ✓ Tốc độ stream bài giảng mượt mà.
          </p>
        </Card>
      </div>
    </div>
  );
}
