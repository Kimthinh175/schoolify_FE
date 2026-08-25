'use client';

import * as React from 'react';
import { Building2, Plus, Users, BookOpen, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MOCK_DEPARTMENTS } from '@/services/mock/data';
import { Department } from '@/types';

export default function SchoolDepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>(MOCK_DEPARTMENTS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deptName, setDeptName] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;
    setDepartments([
      ...departments,
      {
        id: `dept-${Date.now()}`,
        school_id: 'sch-01',
        name: deptName,
        teachers_count: 5,
        courses_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    setIsModalOpen(false);
    setDeptName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cơ Cấu Tổ Bộ Môn (Departments)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Thiết lập các tổ chuyên môn, bổ nhiệm Trưởng bộ môn và phân bổ giáo viên</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm Tổ Bộ Môn
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <Badge variant="primary" className="text-[10px]">Đang hoạt động</Badge>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{dept.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Trưởng bộ môn: ThS. Nguyễn Văn Hùng</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {dept.teachers_count} giáo viên</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {dept.courses_count} khóa học</span>
            </div>
          </Card>
        ))}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Tổ Bộ Môn Mới" description="Nhập tên tổ bộ môn trực thuộc trường.">
        <form onSubmit={handleAdd} className="space-y-4 py-2">
          <Input label="Tên Tổ / Bộ Môn *" placeholder="VD: Tổ Ngữ Văn & Lịch Sử" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Lưu Bộ Môn</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
