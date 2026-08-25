'use client';

import * as React from 'react';
import { Users, Search, Ban, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName: string;
  status: boolean;
  avatar?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<MockUser[]>([
    { id: 'u1', name: 'Kim Thịnh', email: 'thinh@schoolify.edu.vn', role: 'SUPER_ADMIN', schoolName: 'Nền Tảng Gốc', status: true },
    { id: 'u2', name: 'ThS. Nguyễn Văn Hùng', email: 'hung.nguyen@tech.schoolify.edu.vn', role: 'TEACHER', schoolName: 'THPT Chuyên Công Nghệ', status: true },
    { id: 'u3', name: 'Cô Sarah Trần', email: 'sarah.tran@futurelang.edu.vn', role: 'TEACHER', schoolName: 'Học Viện FutureLang', status: true },
    { id: 'u4', name: 'Nguyễn Hoàng Minh', email: 'minh.nguyen@tech.schoolify.edu.vn', role: 'STUDENT', schoolName: 'THPT Chuyên Công Nghệ', status: true },
    { id: 'u5', name: 'Nguyễn Văn Tuấn', email: 'tuan.nguyen@gmail.com', role: 'PARENT', schoolName: 'THPT Chuyên Công Nghệ', status: true },
  ]);

  const [search, setSearch] = React.useState('');

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: !u.status } : u)));
  };

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Người Dùng Toàn Hệ Thống</h1>
        <p className="text-xs text-slate-500 mt-0.5">Tra cứu, phân quyền và khóa tài khoản khi có vi phạm</p>
      </div>

      <Card className="p-4">
        <Input placeholder="Tìm theo tên hoặc email người dùng..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Vai Trò (Role)</TableHead>
              <TableHead>Trường Học</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar alt={user.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="primary" className="text-[10px]">{user.role}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300">{user.schoolName}</TableCell>
                <TableCell>
                  <Badge variant={user.status ? 'success' : 'danger'}>{user.status ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(user.id)} leftIcon={user.status ? <Ban className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}>
                    {user.status ? 'Khóa TK' : 'Mở Khóa'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
