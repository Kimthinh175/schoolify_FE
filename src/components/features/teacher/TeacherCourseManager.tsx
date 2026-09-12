'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Eye, Pencil, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { teacherService, CourseStatusFilter } from '@/services/teacher.service';
import { Course, CourseStatus } from '@/types';

const STATUS_META: Record<
  CourseStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  DRAFT: { label: 'Bản nháp', variant: 'secondary' },
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  REJECTED: { label: 'Bị từ chối', variant: 'danger' },
  HIDDEN: { label: 'Đang ẩn', variant: 'outline' },
};

// Chỉ khóa đã xuất bản (hoặc đang ẩn) mới có thể bật/tắt bán trên Marketplace
const canToggleMarketplace = (status: CourseStatus) => status === 'PUBLISHED' || status === 'HIDDEN';

export function TeacherCourseManager({
  teacherId,
  initialCourses,
}: {
  teacherId: string;
  initialCourses: Course[];
}) {
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [activeStatus, setActiveStatus] = React.useState<CourseStatusFilter>('ALL');
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const formatMoney = (amount: number) =>
    amount === 0
      ? 'Miễn phí'
      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { DRAFT: 0, PENDING: 0, PUBLISHED: 0, HIDDEN: 0 };
    courses.forEach((c) => {
      base[c.status] = (base[c.status] || 0) + 1;
    });
    return base;
  }, [courses]);

  const tabs: TabItem[] = [
    { id: 'ALL', label: 'Tất cả', badge: courses.length },
    { id: 'DRAFT', label: 'Bản nháp', badge: counts.DRAFT },
    { id: 'PENDING', label: 'Chờ duyệt', badge: counts.PENDING },
    { id: 'PUBLISHED', label: 'Đã xuất bản', badge: counts.PUBLISHED },
    { id: 'HIDDEN', label: 'Đang ẩn', badge: counts.HIDDEN },
  ];

  const filteredCourses =
    activeStatus === 'ALL' ? courses : courses.filter((c) => c.status === activeStatus);

  const handleToggleMarketplace = async (course: Course, value: boolean) => {
    setTogglingId(course.id);
    await teacherService.toggleMarketplace(teacherId, course.id, value);
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, is_marketplace: value } : c))
    );
    setTogglingId(null);
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Quản Lý Khóa Học</h3>
        </div>
        <div className="overflow-x-auto w-full sm:w-auto no-scrollbar">
          <Tabs
            tabs={tabs}
            activeTab={activeStatus}
            onChange={(id) => setActiveStatus(id as CourseStatusFilter)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[240px]">Khóa Học</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Giá Bán</TableHead>
            <TableHead>Học Viên</TableHead>
            <TableHead>Bán Marketplace</TableHead>
            <TableHead className="text-right">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-500">
                Không có khóa học nào ở trạng thái này.
              </TableCell>
            </TableRow>
          ) : (
            filteredCourses.map((course) => {
              const meta = STATUS_META[course.status];
              const canToggle = canToggleMarketplace(course.status);
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.thumbnail_url || ''}
                        alt=""
                        className="h-11 w-16 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-500">{course.department_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        course.price > 0
                          ? 'text-sm font-bold text-slate-900 dark:text-white'
                          : 'text-sm font-semibold text-slate-500'
                      }
                    >
                      {formatMoney(course.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200">
                      <Users className="w-4 h-4 text-slate-400" />
                      {(course.total_students || 0).toLocaleString('vi-VN')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={course.is_marketplace}
                        disabled={!canToggle || togglingId === course.id}
                        onCheckedChange={(value) => handleToggleMarketplace(course, value)}
                        aria-label={`Bán khóa học ${course.title} trên Marketplace`}
                      />
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {canToggle ? (course.is_marketplace ? 'Đang bán' : 'Đã tắt') : 'Cần xuất bản'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href="/teacher/courses">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs"
                          leftIcon={<Pencil className="w-3.5 h-3.5" />}
                        >
                          Chỉnh Sửa
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
