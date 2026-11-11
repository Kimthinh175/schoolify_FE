'use client';

import * as React from 'react';
import {
  Search,
  Ban,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Users,
  GraduationCap,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usersService, AdminUserItem } from '@/services/users.service';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { toast } from 'sonner';

const USERS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'ALL' | 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT'>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Modal Tạo / Sửa người dùng
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUserItem | null>(null);
  const [fullname, setFullname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('123456');
  const [selectedRole, setSelectedRole] = React.useState<'SUPER_ADMIN' | 'TEACHER' | 'STUDENT'>('STUDENT');

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
    const nextStatus = !user.status;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    await usersService.updateUser(user.id, { status: nextStatus });
    toast.success(
      nextStatus
        ? `Đã mở khóa tài khoản ${user.name || user.fullname}!`
        : `Đã khóa tài khoản ${user.name || user.fullname}!`
    );
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFullname('');
    setEmail('');
    setPhone('');
    setPassword('123456');
    setSelectedRole('STUDENT');
    setIsModalOpen(true);
  };

  const openEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setFullname(u.name || u.fullname || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setSelectedRole(u.appRole || 'STUDENT');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !email.trim()) {
      toast.error('Vui lòng nhập đầy đủ Họ tên và Email!');
      return;
    }

    if (editingUser) {
      const updated = await usersService.updateUser(editingUser.id, {
        fullname: fullname.trim(),
        phone: phone.trim() || undefined,
        role: selectedRole,
      });
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
        toast.success('Đã cập nhật thông tin người dùng!');
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  fullname: fullname.trim(),
                  name: fullname.trim(),
                  phone: phone.trim(),
                  appRole: selectedRole,
                }
              : u
          )
        );
        toast.success('Đã cập nhật thông tin người dùng!');
      }
    } else {
      const created = await usersService.createUser({
        fullname: fullname.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password || '123456',
        role: selectedRole,
      });
      if (created) {
        setUsers((prev) => [created, ...prev]);
        toast.success(`Đã tạo tài khoản "${fullname.trim()}" thành công!`);
      } else {
        toast.error('Không thể tạo tài khoản (Email có thể đã được sử dụng).');
        return;
      }
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.name || user.fullname} khỏi cơ sở dữ liệu?`)) return;
    const ok = await usersService.deleteUser(user.id);
    if (ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Đã xóa tài khoản ${user.name || user.fullname} thành công!`);
    } else {
      toast.error('Không thể xóa tài khoản.');
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || u.fullname || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.appRole === roleFilter;
    return matchSearch && matchRole;
  });

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

        <div className="flex items-center gap-2">
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
            size="sm"
            onClick={openCreateModal}
            className="h-8 px-3 text-xs font-semibold bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Thêm tài khoản
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
      <Card className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs vai trò */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs w-fit">
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

          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Tìm tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      </Card>

      {/* 4. Bảng Danh Sách Người Dùng */}
      <Card className="p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
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
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
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
                            {/* Tia Sáng */}
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
                              title="Tia Sáng: Năng lượng luyện đề hàng ngày"
                            >
                              <TiaSangIcon className="w-3.5 h-3.5" flat />
                              <span>{u.examPoints ?? 9}</span>
                            </span>

                            {/* Ngọc Tri Thức */}
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60"
                              title="Ngọc Tri Thức: Điểm tích lũy đổi quà"
                            >
                              <NgocIcon className="w-3.5 h-3.5" flat />
                              <span>{new Intl.NumberFormat('vi-VN').format(u.points ?? 100)}</span>
                            </span>
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
                            onClick={() => openEditModal(u)}
                            className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u)}
                            className="h-7 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* 5. Modal Tạo / Sửa Người Dùng */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingUser ? 'Chỉnh Sửa Thông Tin' : 'Tạo Tài Khoản Mới'}
        description="Nhập thông tin tài khoản để lưu vào hệ thống."
      >
        <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs pt-1">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Họ và Tên *
              </label>
              <Input
                required
                placeholder="Ví dụ: Nguyễn Văn An"
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
                disabled={Boolean(editingUser)}
                placeholder="student@schoolify.edu.vn"
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
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vai Trò Hệ Thống
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-[#00B8DD]"
                >
                  <option value="STUDENT">Học sinh (Student)</option>
                  <option value="TEACHER">Giảng viên (Teacher)</option>
                  <option value="SUPER_ADMIN">Quản trị (Admin)</option>
                </select>
              </div>
            </div>

            {!editingUser && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mật Khẩu Ban Đầu
                </label>
                <Input
                  type="password"
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

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
                {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
              </Button>
            </div>
          </form>
      </Dialog>
    </div>
  );
}
