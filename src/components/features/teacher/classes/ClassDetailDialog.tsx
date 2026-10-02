'use client';

import * as React from 'react';
import {
  GraduationCap,
  Users,
  MapPin,
  CalendarRange,
  BookOpen,
  Clock,
  Video,
  Plus,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Class, ClassCourse, ClassSession, Course } from '@/types';
import { CLASS_STATUS_META } from './class.meta';

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const fmtDayTime = (iso: string) =>
  `${new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })} • ${fmtTime(iso)}`;

export function ClassDetailDialog({
  isOpen,
  onClose,
  cls,
  classCourses,
  courses,
  sessions,
  onAssign,
}: {
  isOpen: boolean;
  onClose: () => void;
  cls: Class | null;
  classCourses: ClassCourse[];
  courses: Course[];
  sessions: ClassSession[];
  onAssign: (cls: Class) => void;
}) {
  const meta = cls ? CLASS_STATUS_META[cls.status] || CLASS_STATUS_META.ACTIVE : null;

  const assignedCourses = cls
    ? classCourses
        .filter((cc) => cc.class_id === cls.id)
        .map((cc) => courses.find((c) => c.id === cc.course_id))
        .filter((c): c is Course => Boolean(c))
    : [];

  const classSessions = cls
    ? sessions
        .filter((s) => s.class_id === cls.id)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    : [];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={cls?.class_name || 'Chi Tiết Lớp Học'}
      description="Thông tin lớp, khóa học đã phân công và các buổi học."
      maxWidth="2xl"
    >
      {cls && meta && (
        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Thông tin lớp
                </span>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {cls.student_count ?? 0} học sinh
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="min-w-0">
                    {cls.room || 'Chưa xếp phòng'}
                    {cls.code ? ` • ${cls.code}` : ''}
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {fmtDate(cls.start_date)} → {fmtDate(cls.end_date)}
                </li>
                {cls.teacher_name && (
                  <li className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {cls.teacher_name}
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Khóa học đã phân công (
                {assignedCourses.length})
              </span>
              {assignedCourses.length === 0 ? (
                <p className="text-[11px] text-slate-400">Chưa phân công khóa học nào.</p>
              ) : (
                <ul className="space-y-1.5">
                  {assignedCourses.map((c) => (
                    <li key={c.id} className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{c.title}</span>
                      <span className="shrink-0 text-slate-400">
                        {c.price === 0 ? 'Miễn phí' : `${c.price.toLocaleString('vi-VN')}đ`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Buổi học (
              {classSessions.length})
            </span>
            {classSessions.length === 0 ? (
              <p className="text-[11px] text-slate-400">Chưa có buổi học nào cho lớp này.</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {classSessions.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-1.5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {s.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {fmtDayTime(s.start_time)} – {fmtTime(s.end_time)}
                      </p>
                    </div>
                    {s.meeting_url ? (
                      <a
                        href={s.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px]"
                          leftIcon={<Video className="w-3 h-3" />}
                        >
                          Vào
                        </Button>
                      </a>
                    ) : (
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {s.room || 'Tại phòng'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1 justify-center" onClick={onClose}>
              Đóng
            </Button>
            <Button
              className="flex-1 justify-center"
              onClick={() => onAssign(cls)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Phân Công Khóa Học
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
