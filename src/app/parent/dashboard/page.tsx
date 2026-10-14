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
  GraduationCap,
  Award,
  Clock,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs } from '@/components/ui/tabs';
import { useParentStore } from '@/store/parent.store';
import { MOCK_GDPT_REPORTS, MOCK_GDPT_TIMETABLE, MOCK_GDPT_TUITIONS } from '@/services/mock/parent-flow-data';

export default function ParentDashboardPage() {
  const { children, activeChildId, setActiveChild } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  // Lấy dữ liệu đồng bộ theo con
  const report = MOCK_GDPT_REPORTS[activeChild.id] || MOCK_GDPT_REPORTS['child-01'];
  const timetableSlots = MOCK_GDPT_TIMETABLE[activeChild.id] || MOCK_GDPT_TIMETABLE['child-01'];
  const tuitions = MOCK_GDPT_TUITIONS[activeChild.id] || MOCK_GDPT_TUITIONS['child-01'];

  const pendingTuitions = tuitions.filter((t) => t.status === 'PENDING');
  const paidTuitions = tuitions.filter((t) => t.status === 'PAID');

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const childTabs = children.map((c) => ({
    id: c.id,
    label: c.name,
    icon: <Baby className="w-4 h-4" />,
  }));

  const mockNotifications = [
    { id: 1, title: 'Thông báo họp phụ huynh sơ kết giữa Học kỳ I', date: '20/10/2026' },
    { id: 2, title: 'Nhắc nhở: Hạn hoàn tất BHYT học sinh & Quỹ cơ sở vật chất', date: '18/10/2026' },
    { id: 3, title: 'Kết quả bài kiểm tra định kỳ môn Toán & Tin học', date: '14/10/2026' },
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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#00B8DD] to-indigo-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeChild.avatar}
            alt={activeChild.name}
            className="h-20 w-20 rounded-2xl object-cover border-2 border-white/60 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="bg-white/20 text-white font-bold backdrop-blur-xs border-none text-xs">
                {activeChild.grade}
              </Badge>
              <Badge className="bg-emerald-400/20 text-emerald-100 border-none text-xs">
                Học kỳ I ({report.academicYear})
              </Badge>
              <span className="text-xs text-cyan-100">{activeChild.schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1.5">
              Sổ Liên Lạc Điện Tử: {activeChild.name}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 mt-0.5">
              Lớp: <b>{activeChild.className}</b> • Giáo viên chủ nhiệm: <b>{report.homeroomTeacher.name}</b>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/parent/report">
            <Button variant="secondary" className="bg-white/90 text-indigo-700 hover:bg-white shadow-md font-bold text-xs" leftIcon={<GraduationCap className="w-4 h-4" />}>
              Báo Cáo GDPT 2018
            </Button>
          </Link>
          <Link href="/parent/tuition">
            <Button variant="secondary" className="bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md font-black text-xs" leftIcon={<CreditCard className="w-4 h-4" />}>
              Đóng Học Phí ({pendingTuitions.length} khoản)
            </Button>
          </Link>
        </div>
      </div>

      {/* Các Thẻ Thống Kê (KPI Cards) chuẩn GDPT 2018 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học Lực (GDPT 2018)</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            Mức: {report.learningResult}
          </p>
          <div className="flex items-center justify-between text-xs mt-1 text-slate-600 dark:text-slate-400">
            <span>ĐTB Môn: <b>{report.overallScore}/10</b></span>
            <span className="text-emerald-600 font-semibold">{report.awardTitle}</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyên Cần Đi Học</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {report.attendanceRate}%
          </p>
          <div className="mt-2">
            <Progress value={report.attendanceRate} showLabel={false} />
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-cyan-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thời Khóa Biểu Tuần</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {timetableSlots.length} Tiết Học
          </p>
          <p className="text-xs text-slate-500 mt-1">Từ Thứ 2 đến Thứ 7 hàng tuần</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tình Trạng Học Phí</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pendingTuitions.length > 0 ? formatMoney(pendingTuitions[0].amount) : '0 ₫'}
          </p>
          <div className="mt-1">
            {pendingTuitions.length > 0 ? (
              <Badge variant="warning" className="text-[10px]">
                {pendingTuitions.length} khoản chờ thanh toán
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px]">
                Đã hoàn tất 100% học phí
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Ba cột: Lời phê của giáo viên, Lịch học tuần này, Thông báo từ trường */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lời Phê Mới Nhất Từ Giáo Viên */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Lời Phê Của Thầy Cô
            </h3>
            <Link href="/parent/report?tab=FEEDBACK">
              <Button size="sm" variant="ghost">Chi tiết</Button>
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                GVCN: {report.homeroomTeacher.name}
              </span>
              <span className="text-xs font-bold text-emerald-600">Xếp loại: {report.learningResult}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
              "{report.homeroomTeacher.comment}"
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-indigo-100 dark:border-indigo-900">
              Kỳ đánh giá: {report.semester} ({report.academicYear})
            </p>
          </div>
        </Card>

        {/* Widget Lịch Học */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Thời Khóa Biểu Hôm Nay
            </h3>
            <Link href="/parent/timetable">
              <Button size="sm" variant="ghost">Xem ma trận</Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {timetableSlots.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.subjectName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.teacherName} • {item.room}
                  </p>
                </div>
                <Badge variant="primary" className="text-[10px] shrink-0 font-mono">
                  {item.timeRange.split(' - ')[0]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Widget Thông Báo */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Thông Báo Nhà Trường
            </h3>
            <Link href="/parent/report?tab=NOTIFICATIONS">
              <Button size="sm" variant="ghost">Xem tất cả</Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {mockNotifications.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-center"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {note.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{note.date}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
