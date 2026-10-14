'use client';

import * as React from 'react';
import {
  Calendar,
  User,
  MapPin,
  Video,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Baby,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  ListFilter,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { useParentStore } from '@/store/parent.store';
import { MOCK_GDPT_TIMETABLE, TimetableSlot } from '@/services/mock/parent-flow-data';

const DAYS_OF_WEEK = [
  { day: 2, label: 'Thứ Hai', short: 'T2' },
  { day: 3, label: 'Thứ Ba', short: 'T3' },
  { day: 4, label: 'Thứ Tư', short: 'T4' },
  { day: 5, label: 'Thứ Năm', short: 'T5' },
  { day: 6, label: 'Thứ Sáu', short: 'T6' },
  { day: 7, label: 'Thứ Bảy', short: 'T7' },
];

const MORNING_PERIODS = [
  { period: 1, time: '07:15 - 08:00' },
  { period: 2, time: '08:05 - 08:50' },
  { period: 3, time: '09:05 - 09:50' },
  { period: 4, time: '09:55 - 10:40' },
  { period: 5, time: '10:45 - 11:30' },
];

const AFTERNOON_PERIODS = [
  { period: 6, time: '13:30 - 14:15' },
  { period: 7, time: '14:25 - 15:10' },
  { period: 8, time: '15:20 - 16:05' },
];

export default function ParentTimetablePage() {
  const { children, activeChildId, setActiveChild } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  const [viewMode, setViewMode] = React.useState<'GRID' | 'LIST'>('GRID');
  const [selectedDay, setSelectedDay] = React.useState<number>(2); // Mặc định Thứ 2
  const [currentWeek, setCurrentWeek] = React.useState<number>(8); // Tuần 8

  // Dữ liệu thời khóa biểu GDPT 2018 theo con
  const slots: TimetableSlot[] = MOCK_GDPT_TIMETABLE[activeChild.id] || MOCK_GDPT_TIMETABLE['child-01'];

  const childTabs = children.map((c) => ({
    id: c.id,
    label: c.name,
    icon: <Baby className="w-4 h-4" />,
  }));

  const getSubjectColorClass = (subjectName: string) => {
    if (subjectName.includes('Toán') || subjectName.includes('Tin')) {
      return 'border-l-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200';
    }
    if (subjectName.includes('Vật lí') || subjectName.includes('Hóa') || subjectName.includes('Sinh') || subjectName.includes('KHTN')) {
      return 'border-l-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-200';
    }
    if (subjectName.includes('Văn') || subjectName.includes('Lịch sử') || subjectName.includes('Địa lí')) {
      return 'border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200';
    }
    if (subjectName.includes('Anh')) {
      return 'border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200';
    }
    return 'border-l-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200';
  };

  const getAttendanceBadge = (status: TimetableSlot['attendanceStatus']) => {
    switch (status) {
      case 'PRESENT':
        return (
          <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">
            Có mặt
          </Badge>
        );
      case 'LATE':
        return (
          <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-bold">
            Đi muộn
          </Badge>
        );
      case 'EXCUSED_ABSENCE':
        return (
          <Badge variant="danger" className="text-[10px] py-0 px-1.5 font-bold">
            Nghỉ phép
          </Badge>
        );
      case 'UPCOMING':
      default:
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-slate-400">
            Sắp tới
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Thanh Chọn Con Cái */}
      {children.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn học sinh:</span>
            <Tabs
              tabs={childTabs}
              activeTab={activeChildId}
              onChange={setActiveChild}
              variant="pill"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              {activeChild.grade} • {activeChild.className}
            </Badge>
          </div>
        </div>
      )}

      {/* Header Điều Khiển & Bộ Chuyển Chế Độ Xem */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple">Kế Hoạch Giáo Dục Nhà Trường</Badge>
            <Badge className="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200">
              Chương Trình GDPT 2018
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Thời Khóa Biểu: {activeChild.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lớp {activeChild.className} • Trường {activeChild.schoolName}
          </p>
        </div>

        {/* Nút Chuyển Tuần & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs">
            <button
              onClick={() => setCurrentWeek((prev) => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              Tuần {currentWeek} (Học kỳ I)
            </span>
            <button
              onClick={() => setCurrentWeek((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Lịch Tuần
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Danh Sách
            </button>
          </div>

          <Button
            variant="outline"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            In Lịch Học
          </Button>
        </div>
      </div>

      {/* CHẾ ĐỘ 1: MA TRẬN LỊCH TUẦN (WEEKLY GRID) CHUẨN TRƯỜNG PHỔ THÔNG */}
      {viewMode === 'GRID' && (
        <Card className="overflow-x-auto shadow-xs border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="min-w-[850px]">
            {/* Header các ngày trong tuần */}
            <div className="grid grid-cols-7 gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-center font-bold text-xs">
              <div className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                Tiết / Giờ
              </div>
              {DAYS_OF_WEEK.map((d) => (
                <div
                  key={d.day}
                  className="py-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                >
                  {d.label}
                </div>
              ))}
            </div>

            {/* Buổi Sáng */}
            <div className="py-2.5 px-2 text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/30 rounded-lg my-2 flex items-center justify-between">
              <span>Buổi Sáng: Tiết 1 - Tiết 5 (07:15 - 11:30)</span>
              <span className="text-[11px] font-normal text-slate-500">Chính khóa GDPT 2018</span>
            </div>

            <div className="space-y-2">
              {MORNING_PERIODS.map((periodInfo) => (
                <div key={periodInfo.period} className="grid grid-cols-7 gap-2 items-stretch">
                  {/* Cột số tiết */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tiết {periodInfo.period}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{periodInfo.time}</span>
                  </div>

                  {/* 6 ngày từ Thứ 2 đến Thứ 7 */}
                  {DAYS_OF_WEEK.map((d) => {
                    const slot = slots.find(
                      (s) => s.dayOfWeek === d.day && s.period === periodInfo.period
                    );

                    if (!slot) {
                      return (
                        <div
                          key={d.day}
                          className="p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-700"
                        >
                          —
                        </div>
                      );
                    }

                    return (
                      <div
                        key={d.day}
                        className={`p-2.5 rounded-xl border-l-4 border shadow-2xs space-y-1 transition-all hover:scale-[1.01] ${getSubjectColorClass(
                          slot.subjectName
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs line-clamp-1">{slot.subjectName}</span>
                          {getAttendanceBadge(slot.attendanceStatus)}
                        </div>
                        <p className="text-[11px] opacity-80 line-clamp-1">GV: {slot.teacherName}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/5 dark:border-white/5">
                          <span className="flex items-center gap-1 opacity-75">
                            {slot.isOnline ? (
                              <Video className="w-3 h-3 text-cyan-600 shrink-0" />
                            ) : (
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[85px]">{slot.room}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Buổi Chiều */}
            <div className="py-2.5 px-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg my-3 flex items-center justify-between">
              <span>Buổi Chiều: Tiết 6 - Tiết 8 (13:30 - 16:05)</span>
              <span className="text-[11px] font-normal text-slate-500">Chuyên đề, Bồi dưỡng & Thể thao</span>
            </div>

            <div className="space-y-2">
              {AFTERNOON_PERIODS.map((periodInfo) => (
                <div key={periodInfo.period} className="grid grid-cols-7 gap-2 items-stretch">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tiết {periodInfo.period}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{periodInfo.time}</span>
                  </div>

                  {DAYS_OF_WEEK.map((d) => {
                    const slot = slots.find(
                      (s) => s.dayOfWeek === d.day && s.period === periodInfo.period
                    );

                    if (!slot) {
                      return (
                        <div
                          key={d.day}
                          className="p-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-700"
                        >
                          —
                        </div>
                      );
                    }

                    return (
                      <div
                        key={d.day}
                        className={`p-2.5 rounded-xl border-l-4 border shadow-2xs space-y-1 transition-all hover:scale-[1.01] ${getSubjectColorClass(
                          slot.subjectName
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs line-clamp-1">{slot.subjectName}</span>
                          {getAttendanceBadge(slot.attendanceStatus)}
                        </div>
                        <p className="text-[11px] opacity-80 line-clamp-1">GV: {slot.teacherName}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/5 dark:border-white/5">
                          <span className="flex items-center gap-1 opacity-75">
                            {slot.isOnline ? (
                              <Video className="w-3 h-3 text-cyan-600 shrink-0" />
                            ) : (
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[85px]">{slot.room}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* CHẾ ĐỘ 2: DANH SÁCH CHI TIẾT THEO NGÀY (LIST VIEW) */}
      {viewMode === 'LIST' && (
        <div className="space-y-4">
          {/* Bộ lọc chọn thứ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {DAYS_OF_WEEK.map((d) => (
              <Button
                key={d.day}
                size="sm"
                variant={selectedDay === d.day ? 'primary' : 'outline'}
                onClick={() => setSelectedDay(d.day)}
                className={selectedDay === d.day ? 'bg-cyan-600 hover:bg-cyan-500 font-bold' : ''}
              >
                {d.label}
              </Button>
            ))}
          </div>

          {/* Danh sách các tiết của ngày đã chọn */}
          <div className="space-y-3">
            {slots
              .filter((s) => s.dayOfWeek === selectedDay)
              .sort((a, b) => a.period - b.period)
              .map((session) => (
                <Card
                  key={session.id}
                  className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 shadow-xs ${getSubjectColorClass(
                    session.subjectName
                  )}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" className="bg-indigo-600 text-white font-bold text-xs">
                        Tiết {session.period} ({session.timeRange})
                      </Badge>
                      {getAttendanceBadge(session.attendanceStatus)}
                      {session.isOnline && (
                        <Badge variant="purple" className="flex items-center gap-1 text-[10px]">
                          <Video className="w-3 h-3" /> Trực Tuyến
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {session.subjectName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        Giáo viên: <b>{session.teacherName}</b>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Địa điểm: <b>{session.room}</b>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {session.meetingUrl && (
                      <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="primary" leftIcon={<Video className="w-3.5 h-3.5" />}>
                          Vào Lớp Học Online
                        </Button>
                      </a>
                    )}
                    <Badge variant={session.room.includes('Phòng') ? 'secondary' : 'default'}>
                      {session.period <= 5 ? 'Chính khóa Sáng' : 'Tự chọn Chiều'}
                    </Badge>
                  </div>
                </Card>
              ))}

            {slots.filter((s) => s.dayOfWeek === selectedDay).length === 0 && (
              <Card className="p-8 text-center text-slate-500">
                Không có tiết học nào trong ngày này.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Chú giải màu sắc các tổ bộ môn */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-500">Quy ước màu tổ bộ môn:</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500" /> Toán & Tin học
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-cyan-500" /> Khoa học tự nhiên (Lý - Hóa - Sinh)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500" /> Ngữ văn & Khoa học xã hội
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" /> Ngoại ngữ (Tiếng Anh)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-purple-500" /> Thể chất, QP-AN & Trải nghiệm
          </span>
        </div>
      </div>
    </div>
  );
}
