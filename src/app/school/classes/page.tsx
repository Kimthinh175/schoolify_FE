'use client';

import * as React from 'react';
import { GraduationCap, Plus, Users, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SchoolClassesPage() {
  const classes = [
    { id: 'c1', name: '11A1 - Chuyên Toán Tin', code: 'CLS-11A1', teacher: 'ThS. Nguyễn Văn Hùng', students: 38, room: 'Phòng A302' },
    { id: 'c2', name: '11A2 - Chuyên Ngoại Ngữ', code: 'CLS-11A2', teacher: 'Cô Sarah Trần', students: 36, room: 'Phòng B101' },
    { id: 'c3', name: '10B1 - Tự Nhiên Cơ Bản', code: 'CLS-10B1', teacher: 'Cô Hoàng Mai Lan', students: 40, room: 'Phòng C205' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Xếp Lớp & Điều Phối Học Vụ</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý danh sách lớp học, sĩ số và giáo viên chủ nhiệm</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Mở Lớp Học Mới</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Lớp</TableHead>
              <TableHead>Mã Lớp</TableHead>
              <TableHead>Giáo Viên Chủ Nhiệm</TableHead>
              <TableHead>Sĩ Số</TableHead>
              <TableHead>Phòng Học</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</TableCell>
                <TableCell><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{c.code}</span></TableCell>
                <TableCell className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{c.teacher}</TableCell>
                <TableCell className="text-xs text-slate-500">{c.students} học sinh</TableCell>
                <TableCell className="text-xs text-slate-500">{c.room}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">Danh Sách Học Sinh</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
