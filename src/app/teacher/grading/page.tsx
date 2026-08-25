'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileCheck2, Search, CheckCircle2, Clock, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_SUBMISSIONS } from '@/services/mock/data';

export default function TeacherGradingListPage() {
  const [search, setSearch] = React.useState('');

  const filtered = MOCK_SUBMISSIONS.filter(
    (s) =>
      s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.exam_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2">Công Cụ Khảo Thí & Chấm Thi</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Chấm Điểm & Gửi Lời Phê Tự Luận
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Xem bài làm của học sinh, chấm điểm câu hỏi tự luận và để lại lời nhận xét động viên hoặc góp ý.
        </p>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Tìm theo tên học sinh hoặc bài kiểm tra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học Sinh</TableHead>
              <TableHead>Bài Kiểm Tra</TableHead>
              <TableHead>Thời Gian Nộp</TableHead>
              <TableHead>Điểm Số</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-semibold text-slate-900 dark:text-white">
                  {sub.student_name}
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {sub.exam_title}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {new Date(sub.submitted_at || '').toLocaleString('vi-VN')}
                </TableCell>
                <TableCell className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {sub.score !== null ? `${sub.score} / 10` : 'Chưa chấm'}
                </TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'GRADED' ? 'success' : 'warning'}>
                    {sub.status === 'GRADED' ? 'ĐÃ CHẤM' : 'CHỜ CHẤM'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/teacher/grading/${sub.id}`}>
                    <Button size="sm" variant="primary" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                      Mở Chấm Bài
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
