'use client';

import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_TIMETABLE, MOCK_SUBMISSIONS } from '@/services/mock/data';
import { useAuthStore } from '@/store/auth.store';

export default function SchoolDashboardPage() {
  const { currentSchool } = useAuthStore();

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header with Quota Quick Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Bàn Điều Hành Trung Tâm</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {currentSchool?.name || 'THPT Chuyên Công Nghệ Schoolify'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng quan vận hành cơ sở, tình hình tuyển sinh và tiến độ học tập toàn trường.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/60 p-3 max-w-xs text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span>Hạn Mức Quota (85%)</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
            Đã dùng 850/1000 học sinh. Sắp đạt giới hạn gói cước.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Tổng Sĩ Số Học Sinh</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">1,250 em</p>
          <div className="mt-2">
            <Progress value={85} showLabel={false} />
            <p className="text-[11px] text-slate-400 mt-1">85% hạn mức gói cước</p>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Giáo Viên Giảng Dạy</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">42 Thầy Cô</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">3 Tổ chuyên môn đang hoạt động</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Điểm Trung Bình Trường</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">8.2 / 10</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">+0.4 so với học kỳ trước</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Thu Học Phí Tháng Này</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{formatMoney(84500000)}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">94% học sinh đã hoàn tất</p>
        </Card>
      </div>

      {/* Two columns: Classes in session today & Recent exam submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Lịch Các Ca Học Hôm Nay
          </h3>
          <div className="space-y-3">
            {MOCK_TIMETABLE.map((session) => (
              <div key={session.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{session.title}</p>
                  <p className="text-xs text-slate-500">{session.class_name} • {session.teacher_name}</p>
                </div>
                <Badge variant="default" className="text-[10px]">
                  {session.room || 'Học Online'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Bài Kiểm Tra Mới Được Chấm
          </h3>
          <div className="space-y-3">
            {MOCK_SUBMISSIONS.map((sub) => (
              <div key={sub.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{sub.student_name}</p>
                  <p className="text-xs text-slate-500">{sub.exam_title}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{sub.score} / 10</span>
                  <p className="text-[10px] text-emerald-600 font-semibold">Đã có lời phê</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
