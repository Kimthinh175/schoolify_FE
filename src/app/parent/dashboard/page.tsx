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
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs } from '@/components/ui/tabs';
import { useParentStore } from '@/store/parent.store';
import { MOCK_SUBMISSIONS, MOCK_TIMETABLE, MOCK_ORDERS } from '@/services/mock/data';

export default function ParentDashboardPage() {
  const { children, activeChildId, setActiveChild } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  const childSubmissions = MOCK_SUBMISSIONS.filter(sub => sub.student_id === activeChild.id);
  const submission = childSubmissions.length > 0 ? childSubmissions[0] : null;

  const childTimetable = MOCK_TIMETABLE.filter(session => session.class_id === activeChild.classId);
  const pendingTuition = MOCK_ORDERS[0];

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const childTabs = children.map(c => ({
    id: c.id,
    label: c.name,
    icon: <Baby className="w-4 h-4" />
  }));

  const averageScore = childSubmissions.length > 0
    ? (childSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / childSubmissions.length).toFixed(1)
    : (activeChild.id === 'child-01' ? 8.9 : 7.5);

  const attendanceRate = activeChild.id === 'child-01' ? 9.5 : 8.8;

  const mockNotifications = [
    { id: 1, title: 'Thông báo nghỉ học ngày Giỗ tổ Hùng Vương', date: '10/04/2026' },
    { id: 2, title: 'Nhắc nhở: Hạn chót đóng học phí học kỳ I', date: '05/04/2026' },
    { id: 3, title: 'Kết quả thi giữa kỳ môn Toán', date: '01/04/2026' },
  ];

  return (
    <div className="space-y-8">
      {/* Tabs Chuyển Đổi Hồ Sơ Con Cái */}
      {children.length > 1 && (
        <div className="flex justify-center sm:justify-start">
          <Tabs
            tabs={childTabs}
            activeTab={activeChildId}
            onChange={setActiveChild}
            variant="pill"
          />
        </div>
      )}

      {/* Header Nổi Bật Thông Tin Con */}
      <div className="p-6 rounded-3xl bg-[#00B8DD] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeChild.avatar}
            alt={activeChild.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-white/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-white/20 text-white font-bold backdrop-blur-xs border-none">
                {activeChild.grade}
              </Badge>
              <span className="text-xs text-cyan-50">{activeChild.schoolName}</span>
            </div>
            <h1 className="text-2xl font-black mt-1">
              Sổ Liên Lạc Của Con: {activeChild.name}
            </h1>
            <p className="text-xs text-cyan-100">
              Lớp: {activeChild.className} • Giáo viên chủ nhiệm: ThS. Nguyễn Văn Hùng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/parent/tuition">
            <Button variant="secondary" className="bg-white text-[#00B8DD] hover:bg-slate-50 shadow-md" leftIcon={<CreditCard className="w-4 h-4" />}>
              Đóng Học Phí Trực Tuyến
            </Button>
          </Link>
        </div>
      </div>

      {/* Các Thẻ Thống Kê (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Điểm Số Trung Bình</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {averageScore} / 10
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Xếp loại {Number(averageScore) >= 8 ? 'Giỏi' : 'Khá'}</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-500">Tổng Quan Chuyên Cần</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{attendanceRate}%</p>
          <div className="mt-2">
            <Progress value={attendanceRate} showLabel={false} />
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

      {/* Ba cột: Lời phê của giáo viên, Lịch học, Thông báo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lời Phê Mới Nhất Từ Giáo Viên */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Lời Phê Từ Thầy Cô
            </h3>
            <Link href="/parent/report">
              <Button size="sm" variant="ghost">Chi tiết</Button>
            </Link>
          </div>

          {submission ? (
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
                Chấm ngày: {submission.graded_at ? new Date(submission.graded_at).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-2xl">
              Chưa có nhận xét nào mới.
            </div>
          )}
        </Card>

        {/* Widget Lịch Học */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Lịch Học Tuần Này
            </h3>
            <Link href="/parent/timetable">
              <Button size="sm" variant="ghost">Xem lịch</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {childTimetable.length > 0 ? childTimetable.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.teacher_name} • {item.room || 'Học Online'}</p>
                </div>
                <Badge variant="default" className="text-[10px] ml-2 shrink-0">
                  08:00
                </Badge>
              </div>
            )) : (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-2xl text-sm">
                Không có lịch học.
              </div>
            )}
          </div>
        </Card>

        {/* Widget Thông Báo */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Thông Báo Từ Trường
            </h3>
          </div>
          <div className="space-y-3">
            {mockNotifications.map((note) => (
              <div key={note.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{note.title}</p>
                <p className="text-xs text-slate-500 mt-1">{note.date}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
