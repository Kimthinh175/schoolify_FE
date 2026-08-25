'use client';

import * as React from 'react';
import { Building2, Search, Plus, CheckCircle2, Ban, Eye, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_SCHOOLS } from '@/services/mock/data';
import { School } from '@/types';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = React.useState<School[]>(MOCK_SCHOOLS);
  const [search, setSearch] = React.useState('');
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Trường Học (Tenants)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Duyệt cấp phép, giám sát hạn mức và quản lý cơ sở trường học</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Thêm Cơ Sở Mới</Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <Input
          placeholder="Tìm kiếm theo tên trường học hoặc mã code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Trường / Cơ Sở</TableHead>
              <TableHead>Mã Code</TableHead>
              <TableHead>Quy Mô</TableHead>
              <TableHead>Liên Hệ</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-bold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>{school.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {school.code}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {school.students_count} học sinh • {school.teachers_count} giáo viên
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  <p>{school.phone}</p>
                  <p>{school.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={school.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {school.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(school.id)}
                      leftIcon={school.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      {school.status === 'ACTIVE' ? 'Đình Chỉ' : 'Kích Hoạt'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
