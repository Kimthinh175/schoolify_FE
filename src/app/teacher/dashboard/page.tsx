'use client';

import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  FileCheck2,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_COURSES, MOCK_TIMETABLE, MOCK_SUBMISSIONS } from '@/services/mock/data';

export default function TeacherDashboardPage() {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Phân Hệ Giáo Viên & Creator</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Bàn Làm Việc Giảng Dạy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý bài giảng, lịch đứng lớp, chấm bài kiểm tra và theo dõi thu nhập bán khóa học.
          </p>
        </div>
        <Link href="/teacher/courses">
          <Button leftIcon={<Plus className="w-4 h-4" />}>Tạo Khóa Học Mới</Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Khóa Học Đang Dạy</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">6 Khóa</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">2 khóa trên Marketplace</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Tổng Học Viên Theo Học</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">1,240 em</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">+85 học viên tháng này</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Bài Tập Chờ Chấm</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">5 Bài</p>
          <Link href="/teacher/grading" className="text-xs text-rose-500 font-semibold mt-1 hover:underline">
            Chấm ngay →
          </Link>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Thu Nhập Bán Khóa Học</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{formatMoney(24500000)}</p>
          <Link href="/teacher/revenue" className="text-xs text-indigo-600 font-semibold mt-1 hover:underline">
            Yêu cầu rút tiền →
          </Link>
        </Card>
      </div>

      {/* Two cols: Teaching Schedule & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Lịch Dạy Sắp Tới
            </h3>
            <Badge variant="outline">Hôm nay & Ngày mai</Badge>
          </div>
          <div className="space-y-3">
            {MOCK_TIMETABLE.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.class_name} • {item.room || 'Phòng Học Online'}</p>
                </div>
                <Button size="sm" variant="outline">Vào Lớp</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Submissions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              Bài Kiểm Tra Cần Chấm Điểm
            </h3>
            <Link href="/teacher/grading">
              <Button size="sm" variant="ghost">Xem tất cả</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_SUBMISSIONS.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{sub.student_name}</p>
                  <p className="text-xs text-slate-500">{sub.exam_title}</p>
                </div>
                <Link href={`/teacher/grading/${sub.id}`}>
                  <Button size="sm" variant="primary">
                    Mở Chấm Bài
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
