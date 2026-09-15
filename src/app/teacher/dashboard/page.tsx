'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Wallet, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TeacherKpiStats } from '@/components/features/teacher/TeacherKpiStats';
import { TeacherCourseManager } from '@/components/features/teacher/TeacherCourseManager';
import { teacherService, resolveTeacherId, TeacherDashboardStats } from '@/services/teacher.service';
import { useAuthStore } from '@/store/auth.store';
import { Course } from '@/types';

export default function TeacherDashboardPage() {
  const { user } = useAuthStore();
  // teacher_id suy trực tiếp từ user đang đăng nhập (ERD: User.teacher_profile)
  const teacherId = React.useMemo(() => resolveTeacherId(user), [user]);
  const [stats, setStats] = React.useState<TeacherDashboardStats | null>(null);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loadedTeacherId, setLoadedTeacherId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!teacherId) return;
    let isMounted = true;
    (async () => {
      const [statsData, coursesData] = await Promise.all([
        teacherService.getDashboardStats(teacherId),
        teacherService.getMyCourses(teacherId),
      ]);
      if (!isMounted) return;
      setStats(statsData);
      setCourses(coursesData);
      setLoadedTeacherId(teacherId);
    })();
    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  const isReady = !!teacherId && loadedTeacherId === teacherId;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Phân Hệ Giáo Viên & Creator</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard Giáo Viên & Kinh Doanh Khóa Học
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi thu nhập bán khóa học, số học viên, lớp giảng dạy và quản lý trạng thái mở bán khóa học trên Marketplace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/teacher/revenue">
            <Button variant="outline" leftIcon={<Wallet className="w-4 h-4" />}>
              Doanh Thu
            </Button>
          </Link>
          <Link href="/teacher/courses">
            <Button leftIcon={<Plus className="w-4 h-4" />}>Tạo Khóa Học Mới</Button>
          </Link>
        </div>
      </div>

      {!user || (!!teacherId && !isReady) ? (
        <>
          {/* Đang tải hồ sơ giáo viên / dữ liệu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </>
      ) : !teacherId || !stats ? (
        /* Không có hồ sơ giáo viên -> chặn rò dữ liệu của giáo viên khác */
        <Card className="p-10 flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <UserX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Chưa Tìm Thấy Hồ Sơ Giáo Viên
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Tài khoản hiện tại chưa được liên kết với hồ sơ giáo viên (TeacherProfile). Vui lòng đăng nhập bằng cổng Giáo viên để xem dữ liệu.
          </p>
          <Link href="/login/teacher">
            <Button className="mt-2">Đăng Nhập Cổng Giáo Viên</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* KPI Stats: Thu nhập (TEACHER_INCOME), Học viên, Lớp, Khóa học */}
          <TeacherKpiStats stats={stats} />

          {/* Course Management: Bộ lọc CourseStatus + Switch Marketplace + Giá */}
          <TeacherCourseManager teacherId={teacherId} initialCourses={courses} />
        </>
      )}
    </div>
  );
}
