'use client';

import Link from 'next/link';
import {
  Baby,
  BookCheck,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useParentStore } from '@/store/parent.store';
import { MOCK_SUBMISSIONS, MOCK_TIMETABLE, MOCK_ORDERS } from '@/services/mock/data';

export default function ParentDashboardPage() {
  const { children, activeChildId } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];
  const submission = MOCK_SUBMISSIONS[0];
  const pendingTuition = MOCK_ORDERS[0];

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header with Child Profile Highlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeChild.avatar}
            alt={activeChild.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-indigo-400/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-indigo-500/40 text-indigo-200 font-bold backdrop-blur-xs">
                {activeChild.grade}
              </Badge>
              <span className="text-xs text-slate-300">{activeChild.schoolName}</span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              Sổ Liên Lạc Của Con: {activeChild.name}
            </h1>
            <p className="text-xs text-slate-300">
              Lớp: {activeChild.className} • Giáo viên chủ nhiệm: ThS. Nguyễn Văn Hùng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/parent/tuition">
            <Button className="shadow-md shadow-indigo-500/20" leftIcon={<CreditCard className="w-4 h-4" />}>
              Đóng Học Phí Trực Tuyến
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Điểm Kiểm Tra Gần Nhất</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {submission.score} / 10
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Toán Học 11 (Xếp loại Giỏi)</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Tiến Độ Khóa Học</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">65% Hoàn thành</p>
          <div className="mt-2">
            <Progress value={65} showLabel={false} />
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Buổi Học Tuần Này</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">3 Buổi</p>
          <p className="text-xs text-slate-500 mt-1">Đã tham gia 2/3 buổi</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Học Phí Học Kỳ I</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {formatMoney(pendingTuition.total_amount)}
          </p>
          <Badge variant="success" className="text-[10px] mt-1">
            Đã thanh toán (VietQR)
          </Badge>
        </Card>
      </div>

      {/* Two columns: Teacher Feedback on Recent Exam & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Teacher Feedback on Exam */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Lời Phê Mới Nhất Từ Thầy Cô
            </h3>
            <Link href="/parent/academic">
              <Button size="sm" variant="ghost">Xem sổ điểm chi tiết</Button>
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                Môn: {submission.course_title}
              </span>
              <span className="text-xs font-bold text-emerald-600">Điểm: {submission.score}/10</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
              "{submission.teacher_notes}"
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-indigo-100 dark:border-indigo-900">
              Chấm bởi: ThS. Nguyễn Văn Hùng • {new Date(submission.graded_at || '').toLocaleDateString('vi-VN')}
            </p>
          </div>
        </Card>

        {/* Timetable widget */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Thời Khóa Biểu Của Con
            </h3>
            <Link href="/parent/timetable">
              <Button size="sm" variant="ghost">Xem lịch tuần</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_TIMETABLE.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.teacher_name} • {item.room || 'Học Online'}</p>
                </div>
                <Badge variant="default" className="text-[10px]">
                  08:00 - 09:45
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
