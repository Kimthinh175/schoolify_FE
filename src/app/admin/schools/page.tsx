'use client';

import * as React from 'react';
import {
  Building2,
  Search,
  Plus,
  CheckCircle2,
  Ban,
  Eye,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Users,
  UserRound,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { QuotaBar } from '@/components/features/admin/QuotaBar';
import { cn } from '@/lib/utils';
import { MOCK_SCHOOLS, MOCK_PACKAGES } from '@/services/mock/data';
import { School, SchoolSubscription, SubscriptionStatus, SchoolStatus } from '@/types';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';

// ---------- Helpers ----------
function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getPackageById(packageId?: string | null) {
  return MOCK_PACKAGES.find((pkg) => pkg.id === packageId);
}

const LICENSE_META: Record<SubscriptionStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Giấy phép hợp lệ', variant: 'success' },
  TRIALING: { label: 'Đang dùng thử', variant: 'warning' },
  EXPIRED: { label: 'Đã hết hạn', variant: 'danger' },
  CANCELED: { label: 'Đã hủy', variant: 'secondary' },
  UPGRADED: { label: 'Đã nâng cấp', variant: 'default' },
};

const SCHOOL_STATUS_META: Record<SchoolStatus, { label: string; variant: BadgeVariant }> = {
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  INACTIVE: { label: 'Ngừng hoạt động', variant: 'secondary' },
  SUSPENDED: { label: 'Bị đình chỉ', variant: 'danger' },
};

function SchoolNameCell({ school, onView }: { school: School; onView: (s: School) => void }) {
  return (
    <button
      type="button"
      onClick={() => onView(school)}
      className="group flex items-center gap-2.5 text-left"
      title="Xem chi tiết trường"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F8FC] text-[#00B8DD] transition-colors group-hover:bg-[#00B8DD] group-hover:text-white dark:bg-[#00B8DD]/15">
        <Building2 className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-bold text-slate-900 transition-colors group-hover:text-[#00B8DD] dark:text-white">
          {school.name}
        </span>
        <span className="mt-0.5 inline-block font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {school.code}
        </span>
      </span>
    </button>
  );
}

function LicenseCell({ subscription }: { subscription: SchoolSubscription | null | undefined }) {
  if (!subscription) {
    return <Badge variant="secondary">Chưa có gói</Badge>;
  }

  const meta = LICENSE_META[subscription.status];
  if (!meta) return null;

  const pkg = getPackageById(subscription.package_id);

  return (
    <div className="space-y-1">
      <Badge variant={meta.variant}>{meta.label}</Badge>
      {pkg && <p className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">{pkg.name}</p>}
      {subscription.end_date && (
        <p className="flex items-center gap-1 text-[10px] text-slate-400">
          <CalendarDays className="h-3 w-3" />
          Hết hạn: {formatDate(subscription.end_date)}
        </p>
      )}
    </div>
  );
}

function QuotaCell({ subscription }: { subscription: SchoolSubscription | null | undefined }) {
  if (!subscription) {
    return <span className="text-xs text-slate-300 dark:text-slate-600">—</span>;
  }

  const pkg = getPackageById(subscription.package_id);
  if (!pkg) {
    return <span className="text-xs text-slate-400">Chưa nối gói cước</span>;
  }

  return (
    <div className="w-[200px] space-y-2">
      <QuotaBar
        label="Học sinh"
        used={subscription.used_students_count ?? 0}
        max={pkg.max_students_total}
        icon={<Users className="h-3.5 w-3.5" />}
        size="sm"
      />
      <QuotaBar
        label="Giáo viên"
        used={subscription.used_teachers_count ?? 0}
        max={pkg.max_teachers}
        icon={<UserRound className="h-3.5 w-3.5" />}
        size="sm"
      />
      <QuotaBar
        label="Lưu trữ"
        used={subscription.used_storage_gb ?? 0}
        max={pkg.storage_limit_gb}
        suffix="GB"
        icon={<Database className="h-3.5 w-3.5" />}
        size="sm"
      />
    </div>
  );
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = React.useState<School[]>(MOCK_SCHOOLS);
  const [search, setSearch] = React.useState('');
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.owner?.fullname ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setSelectedSchool((prev) =>
      prev && prev.id === id ? { ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : prev
    );
    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : s))
    );
  };

  const ownerName = selectedSchool?.owner?.fullname ?? selectedSchool?.owner?.email ?? '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Trường Học (Tenants)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Duyệt cấp phép, giám sát hạn mức gói cước và quản lý cơ sở trường học
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Thêm Cơ Sở Mới</Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <Input
          placeholder="Tìm kiếm theo tên, mã code hoặc chủ sở hữu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Table - 6 columns */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[240px]">Tên Trường / Cơ Sở</TableHead>
                <TableHead className="min-w-[170px]">Trạng Thái Giấy Phép</TableHead>
                <TableHead className="min-w-[210px]">Mức Sử Dụng (Quota)</TableHead>
                <TableHead className="min-w-[160px]">Liên Hệ</TableHead>
                <TableHead className="min-w-[150px]">Trạng Thái</TableHead>
                <TableHead className="text-right min-w-[130px]">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => {
                const sub = school.current_subscription;
                const pkg = sub ? getPackageById(sub.package_id) : undefined;
                const statusMeta = SCHOOL_STATUS_META[school.status];
                return (
                  <TableRow key={school.id}>
                    <TableCell>
                      <SchoolNameCell school={school} onView={setSelectedSchool} />
                    </TableCell>
                    <TableCell>
                      <LicenseCell subscription={sub} />
                    </TableCell>
                    <TableCell>
                      {pkg ? (
                        <QuotaCell subscription={sub} />
                      ) : (
                        <span className="text-xs text-slate-400">Chưa có gói cước</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0 text-slate-300" />
                        {school.phone ?? '—'}
                      </p>
                      <p className="flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0 text-slate-300" />
                        {school.email ?? '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1.5 whitespace-nowrap border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-transparent dark:text-slate-200"
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            school.status === 'ACTIVE' && 'bg-emerald-500',
                            school.status === 'SUSPENDED' && 'bg-rose-500',
                            school.status === 'INACTIVE' && 'bg-slate-400'
                          )}
                        />
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex w-[120px] flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedSchool(school)}
                        >
                          Chi Tiết
                        </Button>
                        <Button
                          size="sm"
                          variant={school.status === 'ACTIVE' ? 'outline' : 'success'}
                          className="w-full"
                          onClick={() => toggleStatus(school.id)}
                          leftIcon={
                            school.status === 'ACTIVE' ? (
                              <Ban className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {school.status === 'ACTIVE' ? 'Đình Chỉ' : 'Kích Hoạt'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog chi tiết trường */}
      <Dialog
        isOpen={!!selectedSchool}
        onClose={() => setSelectedSchool(null)}
        title="Chi Tiết Trường Học / Cơ Sở"
        description={selectedSchool ? `${selectedSchool.code} • Tham gia ${formatDate(selectedSchool.created_at)}` : ''}
        maxWidth="4xl"
        footer={
          selectedSchool && (
            <>
              <Button variant="outline" onClick={() => setSelectedSchool(null)}>
                Đóng
              </Button>
              {selectedSchool.status === 'ACTIVE' ? (
                <Button
                  variant="destructive"
                  leftIcon={<Ban className="w-4 h-4" />}
                  onClick={() => toggleStatus(selectedSchool.id)}
                >
                  Đình Chỉ Trường
                </Button>
              ) : (
                <Button
                  variant="success"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => toggleStatus(selectedSchool.id)}
                >
                  Kích Hoạt Trường
                </Button>
              )}
            </>
          )
        }
      >
        {selectedSchool && (
          <div className="space-y-5">
            {/* Top: thông tin chung */}
            <div className="rounded-2xl border border-[#00B8DD]/20 bg-[#E6F8FC] p-4 dark:bg-[#00B8DD]/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00B8DD] text-white">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedSchool.name}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-mono bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {selectedSchool.code}
                      </span>
                      {selectedSchool.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedSchool.address}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant={SCHOOL_STATUS_META[selectedSchool.status].variant}>
                  {SCHOOL_STATUS_META[selectedSchool.status].label}
                </Badge>
              </div>

              {/* Liên hệ + Owner + Quy mô */}
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#00B8DD]/15 pt-3 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-[#00B8DD]" />
                  {selectedSchool.students_count} học sinh • {selectedSchool.teachers_count} giáo viên •{' '}
                  {selectedSchool.departments_count} tổ bộ môn
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 shrink-0 text-[#00B8DD]" />
                  Chủ sở hữu: {ownerName}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#00B8DD]" />
                  {selectedSchool.phone ?? '—'}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#00B8DD]" />
                  {selectedSchool.email ?? '—'}
                </div>
              </div>
            </div>

            {/* Gói cước hiện tại */}
            {selectedSchool.current_subscription ? (
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">🎫 Gói cước hiện tại</h4>
                {(() => {
                  const sub = selectedSchool.current_subscription!;
                  const pkg = getPackageById(sub.package_id);
                  const lMeta = LICENSE_META[sub.status];
                  return (
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {pkg?.name ?? 'Gói không xác định'}
                      </span>
                      {pkg && <span>{pkg.price.toLocaleString('vi-VN')}₫ / {pkg.billing_cycle.toLowerCase()}</span>}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(sub.start_date)} → {formatDate(sub.end_date)}
                      </span>
                      {lMeta && <Badge variant={lMeta.variant}>{lMeta.label}</Badge>}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400 dark:border-slate-700">
                Trường chưa đăng ký gói cước nào.
              </div>
            )}

            {/* Mức sử dụng quotas chi tiết */}
            {selectedSchool.current_subscription && (
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">📊 Mức sử dụng hạn mức (Quotas)</h4>
                <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-3">
                  {(() => {
                    const sub = selectedSchool.current_subscription!;
                    const pkg = getPackageById(sub.package_id);
                    if (!pkg) {
                      return <p className="text-sm text-slate-400 md:col-span-3">Chưa nối gói cước để xem hạn mức.</p>;
                    }
                    return (
                      <>
                        <QuotaBar
                          label="Học sinh"
                          used={sub.used_students_count ?? 0}
                          max={pkg.max_students_total}
                          icon={<Users className="h-4 w-4" />}
                        />
                        <QuotaBar
                          label="Giáo viên"
                          used={sub.used_teachers_count ?? 0}
                          max={pkg.max_teachers}
                          icon={<UserRound className="h-4 w-4" />}
                        />
                        <QuotaBar
                          label="Dung lượng lưu trữ"
                          used={sub.used_storage_gb ?? 0}
                          max={pkg.storage_limit_gb}
                          suffix="GB"
                          icon={<Database className="h-4 w-4" />}
                        />
                        {pkg.max_classes > 0 && (
                          <QuotaBar
                            label="Lớp học tối đa"
                            used={0}
                            max={pkg.max_classes}
                            icon={<Building2 className="h-4 w-4" />}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}