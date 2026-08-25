'use client';

import * as React from 'react';
import { Users, UserPlus, Search, Mail, Phone, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SchoolTeachersPage() {
  const teachers = [
    { id: 't1', name: 'ThS. Nguyễn Văn Hùng', email: 'hung.nguyen@schoolify.edu.vn', phone: '0901234567', dept: 'Tổ Toán & Tin Học', role: 'Trưởng Bộ Môn', exp: '12 năm' },
    { id: 't2', name: 'Cô Sarah Trần', email: 'sarah.tran@schoolify.edu.vn', phone: '0912345678', dept: 'Tổ Ngoại Ngữ', role: 'Giáo Viên', exp: '8 năm' },
    { id: 't3', name: 'Thầy Lê Quốc Dũng', email: 'dung.le@schoolify.edu.vn', phone: '0987654321', dept: 'Tổ Toán & Tin Học', role: 'Giáo Viên', exp: '6 năm' },
    { id: 't4', name: 'Cô Hoàng Mai Lan', email: 'lan.hoang@schoolify.edu.vn', phone: '0933445566', dept: 'Tổ Khoa Học Tự Nhiên', role: 'Giáo Viên', exp: '10 năm' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đội Ngũ Giáo Viên & Nhân Sự</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý phân công bộ môn, hợp đồng và khối lượng giảng dạy</p>
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />}>Thêm Giáo Viên</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Giáo Viên</TableHead>
              <TableHead>Tổ Bộ Môn</TableHead>
              <TableHead>Chức Vụ</TableHead>
              <TableHead>Kinh Nghiệm</TableHead>
              <TableHead>Liên Hệ</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar alt={t.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="primary" className="text-[10px]">{t.dept}</Badge>
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.role}</TableCell>
                <TableCell className="text-xs text-slate-500">{t.exp}</TableCell>
                <TableCell className="text-xs font-mono text-slate-500">{t.phone}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">Phân Công</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
