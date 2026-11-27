'use client';

import * as React from 'react';
import {
  Search,
  Ban,
  CheckCircle2,
  Plus,
  RefreshCw,
  Users,
  GraduationCap,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  Sliders,
  Crown,
  Bell,
  Eye,
  Send,
  Calendar,
  MapPin,
  Building,
  Clock,
  ChevronDown,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usersService, AdminUserItem, normalizeGradeLevelLabel } from '@/services/users.service';
import { useAuthStore } from '@/store/auth.store';
import {
  useNotificationsStore,
  type AppNotificationType,
  type NotificationCategory,
} from '@/store/notifications.store';
import { AdminPointsEditModal } from '@/components/features/admin/AdminPointsEditModal';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const USERS_PER_PAGE = 10;
const GRADE_OPTIONS = ['Lớp 12', 'Lớp 11', 'Lớp 10', 'Lớp 9', 'Lớp 8', 'Lớp 7', 'Lớp 6'];

function AdminFilterDropdown({
  value,
  options,
  onChange,
  align = 'left',
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  align?: 'left' | 'right';
}) {
  const current = options.find((o) => o.value === value) || options[0];
  return (
    <DropdownMenu
      align={align}
      className="min-w-[180px] rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800"
      trigger={
        <div className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-[#00B8DD]/60 text-xs text-slate-800 dark:text-slate-200 font-semibold inline-flex items-center justify-between gap-2 transition-all select-none">
          <span className="truncate">{current?.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      }
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'py-2 px-2.5 rounded-xl text-xs',
              selected && 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
            )}
            icon={
              selected ? (
                <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
              ) : (
                <span className="w-3.5 h-3.5 block" />
              )
            }
          >
            {opt.label}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenu>
  );
}

export default function AdminUsersPage() {
  const { user: authUser, currentRole } = useAuthStore();
  const isSuperAdmin =
    currentRole === 'SUPER_ADMIN' ||
    authUser?.role === 'SUPER_ADMIN' ||
    (authUser?.role as string) === 'ADMIN';

  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'ALL' | 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT'>('ALL');
  const [gradeFilter, setGradeFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [packageFilter, setPackageFilter] = React.useState<'ALL' | 'VIP' | 'FREE'>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Modal Cấp tài khoản nội bộ (Giảng viên / Quản trị viên)
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [fullname, setFullname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('123456');
  const [selectedRole, setSelectedRole] = React.useState<'SUPER_ADMIN' | 'TEACHER'>('TEACHER');

  // Modal chỉnh sửa điểm Tia Sáng & Ngọc Tri Thức trực tiếp cho học sinh
  const [pointsEditTarget, setPointsEditTarget] = React.useState<AdminUserItem | null>(null);

  // Modal Xem Chi Tiết Hồ Sơ 360° (users + student_profile)
  const [detailUserTarget, setDetailUserTarget] = React.useState<AdminUserItem | null>(null);

  // Modal Phát / Gửi Thông Báo Hệ Thống (Kết nối Module 01 -> Module 03 notifications)
  const [notifModalOpen, setNotifModalOpen] = React.useState(false);
  const [notifTargetUser, setNotifTargetUser] = React.useState<AdminUserItem | null>(null);
  const [notifType, setNotifType] = React.useState<AppNotificationType>('info');
  const [notifCategory, setNotifCategory] = React.useState<NotificationCategory>('SYSTEM');
  const [notifTitle, setNotifTitle] = React.useState('');
  const [notifMessage, setNotifMessage] = React.useState('');
  const [notifLink, setNotifLink] = React.useState('/student');
  const [isSendingNotif, setIsSendingNotif] = React.useState(false);

  const openSendNotificationModal = (target?: AdminUserItem | null) => {
    setNotifTargetUser(target || null);
    setNotifType('info');
    setNotifCategory(target?.appRole === 'STUDENT' ? 'LEARNING' : 'SYSTEM');
    setNotifTitle(
      target
        ? `Thông báo dành cho ${target.name || target.fullname}`
        : 'Thông báo từ Quản trị viên Schoolify'
    );
    setNotifMessage('');
    setNotifLink(target?.appRole === 'STUDENT' ? '/student/practice' : '/student');
    setNotifModalOpen(true);
  };

  const handleSendSystemNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tiêu đề và Nội dung thông báo.');
      return;
    }
    setIsSendingNotif(true);
    try {
      await useNotificationsStore.getState().sendSystemNotification({
        userId: notifTargetUser ? notifTargetUser.id : 'ALL',
        type: notifType,
        category: notifCategory,
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        link: notifLink.trim() || undefined,
      });
      toast.success(
        notifTargetUser
          ? `Đã gửi thông báo tới ${notifTargetUser.name || notifTargetUser.fullname}!`
          : 'Đã phát thông báo tới toàn bộ người dùng trên hệ thống!'
      );
      setNotifModalOpen(false);
    } finally {
      setIsSendingNotif(false);
    }
  };

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersService.getUsers({ limit: 500 });
      if (res.items.length > 0) {
        setUsers(res.items);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleStatus = async (user: AdminUserItem) => {
    const currentAuthUserId = useAuthStore.getState().user?.id;
    if (currentAuthUserId && user.id === currentAuthUserId) {
      toast.error('Không thể tự khóa tài khoản quản trị đang đăng nhập!');
      return;
    }

    const nextStatus = !user.status;
    if (!nextStatus) {
      const confirmed = confirm(
        `Bạn có chắc chắn muốn KHÓA tài khoản "${user.name || user.fullname}"? Người dùng này sẽ không thể đăng nhập cho đến khi được mở khóa.`
      );
      if (!confirmed) return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    try {
      const updated = await usersService.updateUser(user.id, { status: nextStatus });
      if (!updated) {
        throw new Error('Không nhận được phản hồi cập nhật trạng thái.');
      }
      toast.success(
        nextStatus
          ? `Đã mở khóa tài khoản ${user.name || user.fullname}!`
          : `Đã khóa tài khoản ${user.name || user.fullname}!`
      );
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      toast.error('Không thể cập nhật trạng thái tài khoản. Đã hoàn tác lại.');
    }
  };

  const openCreateModal = () => {
    setFullname('');
    setEmail('');
    setPhone('');
    setPassword('123456');
    setSelectedRole('TEACHER');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !email.trim()) {
      toast.error('Vui lòng nhập đầy đủ Họ tên và Email!');
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^(0|\+84)[0-9]{8,10}$/.test(trimmedPhone.replace(/\s+/g, ''))) {
      toast.error('Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678).');
      return;
    }

    if (password.trim().length < 6) {
      toast.error('Mật khẩu ban đầu phải có ít nhất 6 ký tự.');
      return;
    }

    const created = await usersService.createUser({
      fullname: fullname.trim(),
      email: email.trim(),
      phone: trimmedPhone || undefined,
      password: password.trim(),
      role: selectedRole,
    });
    if (created) {
      setUsers((prev) => [
        {
          ...created,
          name: created.fullname || fullname.trim(),
          appRole: selectedRole,
          status: Boolean(created.status ?? true),
        },
        ...prev,
      ]);
      toast.success(`Đã cấp tài khoản nội bộ "${fullname.trim()}" thành công!`);
      setIsModalOpen(false);
    } else {
      toast.error('Không thể tạo tài khoản (Email có thể đã được sử dụng).');
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, gradeFilter, statusFilter, packageFilter]);

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || u.fullname || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.schoolName || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.appRole === roleFilter;
    const matchGrade =
      gradeFilter === 'ALL' ||
      (u.appRole === 'STUDENT' && normalizeGradeLevelLabel(u.gradeLevel) === gradeFilter);
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.status) ||
      (statusFilter === 'LOCKED' && !u.status);
    const isVip = Boolean(u.activePackage && u.activePackage !== 'FREE');
    const matchPackage =
      packageFilter === 'ALL' ||
      (packageFilter === 'VIP' && isVip) ||
      (packageFilter === 'FREE' && !isVip);

    return matchSearch && matchRole && matchGrade && matchStatus && matchPackage;
  });

  const isAdvancedFiltered =
    gradeFilter !== 'ALL' || statusFilter !== 'ALL' || packageFilter !== 'ALL' || search !== '';

  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filtered.slice(
    (safePage - 1) * USERS_PER_PAGE,
    safePage * USERS_PER_PAGE
  );

  // Số liệu tổng hợp
  const totalStudents = users.filter((u) => u.appRole === 'STUDENT').length;
  const totalTeachers = users.filter((u) => u.appRole === 'TEACHER').length;
  const totalAdmins = users.filter((u) => u.appRole === 'SUPER_ADMIN').length;
  const totalLocked = users.filter((u) => !u.status).length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quản Lý Tài Khoản & Người Dùng
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {users.length} tài khoản
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tra cứu, phân quyền (Quản trị viên, Giảng viên, Học sinh) và quản lý tài khoản người dùng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            className="h-8 px-3 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSendNotificationModal(null)}
            className="h-8 px-3 text-xs font-semibold border-[#00B8DD]/40 text-[#007D99] dark:text-[#00B8DD] hover:bg-[#00B8DD]/10 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 mr-1.5 text-[#00B8DD]" />
            Phát thông báo hệ thống
          </Button>
          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-8 px-3 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Cấp tài khoản nội bộ
          </Button>
        </div>
      </div>

      {/* 2. Thẻ KPI Tóm Tắt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Học Sinh (Student)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tài khoản luyện thi & nộp bài</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giảng Viên (Teacher)</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{totalTeachers}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Soạn đề & xuất bản bài tập</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quản Trị Viên (Admin)</div>
          <div className="text-2xl font-bold text-[#00B8DD] mt-1">{totalAdmins}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Toàn quyền hệ thống</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tài Khoản Bị Khóa</div>
          <div className={`text-2xl font-bold mt-1 ${totalLocked > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {totalLocked}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tạm dừng quyền truy cập</p>
        </Card>
      </div>

      {/* 3. Bộ Lọc Tìm Kiếm & Tabs Vai Trò */}
      <Card className="relative z-20 overflow-visible p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs vai trò */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs w-fit">
            {[
              { id: 'ALL', label: `Tất cả (${users.length})` },
              { id: 'STUDENT', label: `Học sinh (${totalStudents})` },
              { id: 'TEACHER', label: `Giảng viên (${totalTeachers})` },
              { id: 'SUPER_ADMIN', label: `Admin (${totalAdmins})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cụm bộ lọc nâng cao + Ô tìm kiếm */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc theo Khối Lớp (12, 11, 10) */}
            <AdminFilterDropdown
              value={gradeFilter}
              onChange={setGradeFilter}
              options={[
                { value: 'ALL', label: 'Tất cả khối lớp' },
                { value: 'Lớp 12', label: 'Lớp 12' },
                { value: 'Lớp 11', label: 'Lớp 11' },
                { value: 'Lớp 10', label: 'Lớp 10' },
              ]}
            />

            {/* Lọc theo Gói cước */}
            <AdminFilterDropdown
              value={packageFilter}
              onChange={(val) => setPackageFilter(val as any)}
              options={[
                { value: 'ALL', label: 'Tất cả gói cước' },
                { value: 'VIP', label: 'Đang dùng gói VIP' },
                { value: 'FREE', label: 'Gói Cơ bản (Free)' },
              ]}
            />

            {/* Lọc theo Trạng thái */}
            <AdminFilterDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              align="right"
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'LOCKED', label: 'Tài khoản bị khóa' },
              ]}
            />

            {/* Ô tìm kiếm */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Tìm tên, email, SĐT, trường..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            {isAdvancedFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setGradeFilter('ALL');
                  setPackageFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="h-9 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Bảng Danh Sách Người Dùng */}
      <Card className="relative z-10 p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Mobile & Tablet Card Stack (< 1024px) — Zero Horizontal Scroll */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((u) => {
              const initial = (u.name || u.fullname || 'U').charAt(0).toUpperCase();
              const isSuper = u.appRole === 'SUPER_ADMIN';
              const isTeacher = u.appRole === 'TEACHER';
              const isStudent = u.appRole === 'STUDENT';

              return (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSuper
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400'
                            : isTeacher
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
                          {u.name || u.fullname || 'Người dùng'}
                        </p>
                        <p className="text-xs text-slate-400 break-all">{u.email}</p>
                        {isStudent && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                            {u.schoolName ? `${u.schoolName} • ` : ''}
                            {u.gradeLevel || 'Chưa bổ sung thông tin'}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        isSuper
                          ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                          : isTeacher
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isSuper ? 'SUPER ADMIN' : isTeacher ? 'GIẢNG VIÊN' : 'HỌC SINH'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {u.phone && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mr-1">
                          {u.phone}
                        </span>
                      )}
                      {isStudent && (
                        <>
                          {u.activePackage && u.activePackage !== 'FREE' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                              <Crown className="w-3 h-3 text-amber-500" />
                              <span>{u.activePackage}</span>
                            </span>
                          )}
                          {isSuperAdmin ? (
                            <button
                              type="button"
                              onClick={() => setPointsEditTarget(u)}
                              className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                              title="Hỗ trợ CSKH: Bù / hoàn Tia Sáng & Ngọc (có ghi Audit Log)"
                            >
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                <TiaSangIcon className="w-3.5 h-3.5" flat />
                                <span>{u.examPoints ?? 9}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                                <NgocIcon className="w-3.5 h-3.5" flat />
                                <span>{new Intl.NumberFormat('vi-VN').format(u.points ?? 100)}</span>
                              </span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                <TiaSangIcon className="w-3.5 h-3.5" flat />
                                <span>{u.examPoints ?? 9}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                                <NgocIcon className="w-3.5 h-3.5" flat />
                                <span>{new Intl.NumberFormat('vi-VN').format(u.points ?? 100)}</span>
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        className="cursor-pointer transition-transform active:scale-95"
                      >
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.status
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {u.status ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {u.status ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                        </span>
                      </button>
                      {isStudent && isSuperAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPointsEditTarget(u)}
                          className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 dark:text-slate-300"
                          title="Hỗ trợ CSKH: Bù / hoàn Tia Sáng & Ngọc (có Audit Log)"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetailUserTarget(u)}
                        className="h-8 px-2.5 text-xs font-semibold text-[#00B8DD] hover:bg-[#00B8DD]/10"
                        title="Xem hồ sơ chi tiết 360°"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openSendNotificationModal(u)}
                        className="h-8 px-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                        title="Gửi thông báo tới người dùng này"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center text-xs text-slate-400">
              Không tìm thấy người dùng nào phù hợp.
            </div>
          )}
        </div>

        {/* Desktop Table (lg+) */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <TableRow className="border-b border-slate-200/70 dark:border-slate-800">
                <TableHead className="py-3 px-4">Người Dùng</TableHead>
                <TableHead className="py-3 px-4">Vai Trò</TableHead>
                <TableHead className="py-3 px-4">Số Điện Thoại</TableHead>
                <TableHead className="py-3 px-4">Số Dư Điểm</TableHead>
                <TableHead className="py-3 px-4 text-center">Trạng Thái</TableHead>
                <TableHead className="py-3 px-4 text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => {
                  const initial = (u.name || u.fullname || 'U').charAt(0).toUpperCase();
                  const isSuper = u.appRole === 'SUPER_ADMIN';
                  const isTeacher = u.appRole === 'TEACHER';
                  const isStudent = u.appRole === 'STUDENT';

                  return (
                    <TableRow
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Tên & Avatar */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSuper
                                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400'
                                : isTeacher
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {u.name || u.fullname || 'Người dùng'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {u.email}
                              {isStudent
                                ? ` • ${u.gradeLevel || 'Chưa bổ sung thông tin'}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Vai trò */}
                      <TableCell className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSuper
                              ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                              : isTeacher
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isSuper ? 'SUPER ADMIN' : isTeacher ? 'GIẢNG VIÊN' : 'HỌC SINH'}
                        </span>
                      </TableCell>

                      {/* Số điện thoại */}
                      <TableCell className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {u.phone || '—'}
                      </TableCell>

                      {/* Điểm tích lũy (Tia Sáng & Ngọc Tri Thức) */}
                      <TableCell className="py-3.5 px-4">
                        {isStudent ? (
                          <div className="inline-flex items-center gap-1.5 flex-wrap">
                            {isSuperAdmin ? (
                              <button
                                type="button"
                                onClick={() => setPointsEditTarget(u)}
                                className="inline-flex items-center gap-1.5 flex-wrap cursor-pointer hover:opacity-85 active:scale-95 transition-all"
                                title="Hỗ trợ CSKH: Bù / hoàn Tia Sáng & Ngọc (có ghi Audit Log)"
                              >
                                {/* Tia Sáng */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                  <TiaSangIcon className="w-3.5 h-3.5" flat />
                                  <span>{u.examPoints ?? 9}</span>
                                </span>

                                {/* Ngọc Tri Thức */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                                  <NgocIcon className="w-3.5 h-3.5" flat />
                                  <span>{new Intl.NumberFormat('vi-VN').format(u.points ?? 100)}</span>
                                </span>
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                                  <TiaSangIcon className="w-3.5 h-3.5" flat />
                                  <span>{u.examPoints ?? 9}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                                  <NgocIcon className="w-3.5 h-3.5" flat />
                                  <span>{new Intl.NumberFormat('vi-VN').format(u.points ?? 100)}</span>
                                </span>
                              </div>
                            )}
                            {u.activePackage && u.activePackage !== 'FREE' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                                <Crown className="w-3 h-3 text-amber-500" />
                                <span>{u.activePackage}</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Trạng thái Khóa / Mở */}
                      <TableCell className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(u)}
                          className="cursor-pointer transition-transform active:scale-95"
                          title="Bấm để Khóa / Mở khóa tài khoản"
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {u.status ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {u.status ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                          </span>
                        </button>
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailUserTarget(u)}
                            className="h-7 px-2 text-xs font-semibold text-[#00B8DD] hover:bg-[#00B8DD]/10"
                            title="Xem hồ sơ chi tiết 360° (users & student_profile)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openSendNotificationModal(u)}
                            className="h-7 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                            title="Gửi thông báo trực tiếp tới người dùng này"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </Button>
                          {isStudent && isSuperAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPointsEditTarget(u)}
                              className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 dark:text-slate-300"
                              title="Hỗ trợ CSKH: Bù / hoàn Tia Sáng & Ngọc (có Audit Log)"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={USERS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="px-4 py-3"
        />
      </Card>

      {/* 5. Modal Cấp Tài Khoản Nội Bộ (Giảng Viên / Quản Trị Viên) */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title="Cấp Tài Khoản Nội Bộ"
        description="Tạo tài khoản cho Giảng viên hoặc Quản trị viên. Học sinh tự đăng ký qua cổng công khai."
      >
        <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs pt-1">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Họ và Tên *
              </label>
              <Input
                required
                placeholder="Ví dụ: ThS. Nguyễn Văn An"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Đăng Nhập *
              </label>
              <Input
                required
                type="email"
                placeholder="teacher@schoolify.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Số Điện Thoại
                </label>
                <Input
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vai Trò Nội Bộ
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'SUPER_ADMIN' | 'TEACHER')}
                  className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#00B8DD]"
                >
                  <option value="TEACHER">Giảng viên (Teacher)</option>
                  <option value="SUPER_ADMIN">Quản trị (Admin)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mật Khẩu Ban Đầu *
              </label>
              <Input
                required
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
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
                Cấp tài khoản
              </Button>
            </div>
          </form>
      </Dialog>

      {/* 6. Modal Hỗ Trợ CSKH: Bù / Hoàn Tia Sáng & Ngọc (Bắt buộc Lý do + Audit Log) */}
      {isSuperAdmin && (
        <AdminPointsEditModal
          isOpen={Boolean(pointsEditTarget)}
          onClose={() => setPointsEditTarget(null)}
          currentTokenBalance={pointsEditTarget?.examPoints ?? 9}
          currentDiamondsBalance={pointsEditTarget?.points ?? 100}
          userId={pointsEditTarget?.id}
          userName={pointsEditTarget?.name || pointsEditTarget?.fullname}
          onUpdated={(newExamPoints, newDiamonds, auditNote) => {
            if (!pointsEditTarget) return;
            setUsers((prev) =>
              prev.map((u) =>
                u.id === pointsEditTarget.id
                  ? { ...u, examPoints: newExamPoints, points: newDiamonds }
                  : u
              )
            );
            useNotificationsStore.getState().addNotification({
              id: `admin-pts-${Date.now()}`,
              type: 'success',
              category: 'REWARD',
              title: `Hỗ trợ CSKH số dư cho ${pointsEditTarget.name || pointsEditTarget.fullname}`,
              message: `Tia Sáng: ${newExamPoints} tia • Ngọc: ${new Intl.NumberFormat('vi-VN').format(newDiamonds)} ngọc.${auditNote ? ` Lý do: ${auditNote}` : ''}`,
              link: '/student/rewards',
            });
          }}
        />
      )}

      {/* 7. Modal Xem Hồ Sơ Chi Tiết 360° (Đầy đủ các cột bảng users & student_profile) */}
      <Dialog
        isOpen={Boolean(detailUserTarget)}
        onClose={() => setDetailUserTarget(null)}
        maxWidth="lg"
        title="Hồ Sơ Người Dùng Chi Tiết 360°"
        description="Toàn bộ dữ liệu định danh (bảng users) và hồ sơ học tập (bảng student_profile)."
      >
        {detailUserTarget && (
          <div className="space-y-4 text-xs pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-black text-base flex items-center justify-center">
                  {(detailUserTarget.name || detailUserTarget.fullname || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {detailUserTarget.name || detailUserTarget.fullname}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500">{detailUserTarget.email}</p>
                </div>
              </div>
              <Badge
                className={
                  detailUserTarget.status
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold'
                }
              >
                {detailUserTarget.status ? 'Đang hoạt động' : 'Tài khoản đã khóa'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  Mã Định Danh (users.id)
                </span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                  {detailUserTarget.id}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  Số Điện Thoại & Vai Trò
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {detailUserTarget.phone || 'Chưa cập nhật'} • {detailUserTarget.appRole}
                </p>
              </div>

              {detailUserTarget.appRole === 'STUDENT' && (
                <>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Khối Lớp & Ngày Sinh (student_profile)
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00B8DD]" />
                      <span>
                        {detailUserTarget.gradeLevel || 'Lớp 12'} •{' '}
                        {detailUserTarget.dateOfBirth || '2008-05-15'}
                      </span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Trường THPT & Tỉnh/TP
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                      <span className="truncate">
                        {detailUserTarget.schoolName}{' '}
                        {detailUserTarget.province ? `(${detailUserTarget.province})` : ''}
                      </span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
                      Số Dư Tia Sáng & Cấp Hàng Ngày
                    </span>
                    <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <TiaSangIcon className="w-3.5 h-3.5" flat />
                      <span>
                        {detailUserTarget.examPoints ?? 9} Tia Sáng (Cấp gần nhất:{' '}
                        {detailUserTarget.lastDailyGrantDate ||
                          new Date().toISOString().slice(0, 10)}
                        )
                      </span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-cyan-200/70 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20 space-y-1">
                    <span className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-400 uppercase">
                      Ngọc Tri Thức & Gói Học Tập
                    </span>
                    <p className="font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                      <NgocIcon className="w-3.5 h-3.5" flat />
                      <span>
                        {new Intl.NumberFormat('vi-VN').format(detailUserTarget.points ?? 100)} Ngọc
                        • Gói: {detailUserTarget.activePackage || 'FREE'}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Ngày tạo:{' '}
                {detailUserTarget.created_at
                  ? new Date(detailUserTarget.created_at).toLocaleDateString('vi-VN')
                  : '2026'}
              </span>
              <div className="flex items-center gap-2">
                {detailUserTarget.appRole === 'STUDENT' && isSuperAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const target = detailUserTarget;
                      setDetailUserTarget(null);
                      setPointsEditTarget(target);
                    }}
                    className="h-8 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#00B8DD] hover:text-[#00B8DD] gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Bù / Hoàn điểm (CSKH)
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const target = detailUserTarget;
                    setDetailUserTarget(null);
                    openSendNotificationModal(target);
                  }}
                  className="h-8 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white gap-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Gửi Thông Báo
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* 8. Modal Phát / Gửi Thông Báo Hệ Thống (Liên kết trực tiếp Module 01 -> Module 03 notifications) */}
      <Dialog
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        maxWidth="lg"
        title={
          notifTargetUser
            ? `Gửi Thông Báo Tới: ${notifTargetUser.name || notifTargetUser.fullname}`
            : 'Phát Thông Báo Toàn Hệ Thống (Broadcast)'
        }
        description="Tạo bản ghi thông báo mới vào bảng notifications và đẩy trực tiếp tới chuông thông báo của người dùng."
      >
        <form onSubmit={handleSendSystemNotification} className="space-y-3.5 text-xs pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Loại Thông Báo (notifications.type)
              </label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as AppNotificationType)}
                className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs font-semibold"
              >
                <option value="info">Thông tin (Info)</option>
                <option value="success">Thành công / Thưởng (Success)</option>
                <option value="warning">Lưu ý / Nhắc nhở (Warning)</option>
                <option value="error">Cảnh báo quan trọng (Error)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nhóm Chuyên Mục
              </label>
              <select
                value={notifCategory}
                onChange={(e) => setNotifCategory(e.target.value as NotificationCategory)}
                className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 text-xs font-semibold"
              >
                <option value="LEARNING">Học tập & Lộ trình</option>
                <option value="REWARD">Điểm & Đổi thưởng</option>
                <option value="COMMUNITY">Diễn đàn & Hỏi đáp</option>
                <option value="SYSTEM">Hệ thống</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tiêu Đề Thông Báo (notifications.title) *
            </label>
            <Input
              required
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="Ví dụ: Đã cộng thưởng +10 Tia Sáng luyện đề..."
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nội Dung Chi Tiết (notifications.message) *
            </label>
            <textarea
              required
              rows={3}
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Nhập nội dung chi tiết thông báo gửi tới người dùng..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Đường Dẫn Điều Hướng Khi Bấm (notifications.link)
            </label>
            <Input
              value={notifLink}
              onChange={(e) => setNotifLink(e.target.value)}
              placeholder="/student/practice hoặc /student/rewards"
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNotifModalOpen(false)}
              className="h-8 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSendingNotif}
              className="h-8 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingNotif ? 'Đang gửi...' : 'Phát Thông Báo Ngay'}</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
