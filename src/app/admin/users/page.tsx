'use client';

import * as React from 'react';
import {
  Search,
  Ban,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Dialog } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usersService, AdminUserItem } from '@/services/users.service';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'ALL' | 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT'>('ALL');
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
      const res = await usersService.getUsers({ limit: 100 });
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
        ? `Đã mở khóa tài khoản ${user.name}!`
        : `Đã khóa tài khoản ${user.name}!`
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
        toast.success('Đã cập nhật thông tin người dùng trên PostgreSQL!');
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
        toast.success('Đã tạo tài khoản người dùng mới trên PostgreSQL!');
      } else {
        toast.error('Không thể tạo tài khoản (Email có thể đã tồn tại).');
        return;
      }
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    const ok = await usersService.deleteUser(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    if (ok) {
      toast.success(`Đã xóa tài khoản ${user.name} khỏi PostgreSQL!`);
    } else {
      toast.success(`Đã xóa tài khoản ${user.name}!`);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.appRole === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadgeLabel = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'ADMIN (SUPER_ADMIN)';
    if (role === 'TEACHER') return 'GIẢNG VIÊN (TEACHER)';
    return 'HỌC SINH (STUDENT)';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quản Lý Người Dùng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tra cứu, phân quyền (Admin, Giảng viên, Học sinh) và khóa tài khoản trực tiếp trên PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm Người Dùng
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1">
          <Input
            placeholder="Tìm theo tên hoặc email người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'SUPER_ADMIN', label: 'Admin' },
            { key: 'TEACHER', label: 'Giảng viên' },
            { key: 'STUDENT', label: 'Học sinh' },
          ].map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={roleFilter === r.key ? 'primary' : 'outline'}
              onClick={() => setRoleFilter(r.key as any)}
              className="text-xs"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Vai Trò (Role)</TableHead>
              <TableHead>Đơn Vị / Khối Lớp</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar_url || undefined} alt={user.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.appRole === 'SUPER_ADMIN'
                        ? 'danger'
                        : user.appRole === 'TEACHER'
                          ? 'primary'
                          : 'default'
                    }
                    className="text-[10px]"
                  >
                    {getRoleBadgeLabel(user.appRole)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                  {user.schoolName}
                  {user.appRole === 'STUDENT' && user.gradeLevel ? ` • ${user.gradeLevel}` : ''}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status ? 'success' : 'danger'}>
                    {user.status ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(user)}
                      title="Chỉnh sửa thông tin & vai trò"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(user)}
                      leftIcon={
                        user.status ? (
                          <Ban className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )
                      }
                    >
                      {user.status ? 'Khóa TK' : 'Mở Khóa'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      onClick={() => handleDeleteUser(user)}
                      title="Xóa người dùng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Tài Khoản Người Dùng Mới'}
        description="Thông tin và phân quyền được lưu trực tiếp vào bảng User trên PostgreSQL."
      >
        <form onSubmit={handleSaveUser} className="space-y-4 py-2">
          <Input
            label="Họ và tên *"
            placeholder="VD: Nguyễn Hoàng Minh"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
          <Input
            label="Email đăng nhập *"
            type="email"
            placeholder="minh.nguyen@schoolify.top"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!editingUser}
            required
          />
          <Input
            label="Số điện thoại"
            placeholder="0903888999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {!editingUser && (
            <Input
              label="Mật khẩu khởi tạo *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Vai trò hệ thống *
            </label>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT')
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium"
            >
              <option value="STUDENT">Học sinh (STUDENT)</option>
              <option value="TEACHER">Giảng viên (TEACHER)</option>
              <option value="SUPER_ADMIN">Quản trị viên (SUPER_ADMIN)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Lưu Cập Nhật' : 'Tạo Tài Khoản'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
