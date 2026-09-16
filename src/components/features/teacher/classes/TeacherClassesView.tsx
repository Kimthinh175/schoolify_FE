'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Users,
  UserX,
  CheckCircle2,
  Plus,
  Video,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth.store';
import { resolveTeacherId, teacherService } from '@/services/teacher.service';
import { classService } from '@/services/class.service';
import { Class, ClassCourse, ClassSession, Course } from '@/types';
import { WeeklyTimetable } from './WeeklyTimetable';
import { ClassPanel } from './ClassPanel';
import { AssignCourseDialog } from './AssignCourseDialog';
import { ClassDetailDialog } from './ClassDetailDialog';
import { SessionFormDialog } from './SessionFormDialog';

type TabKey = 'TIMETABLE' | 'CLASSES';

export function TeacherClassesView() {
  const { user } = useAuthStore();
  const teacherId = React.useMemo(() => resolveTeacherId(user), [user]);

  const [classes, setClasses] = React.useState<Class[]>([]);
  const [sessions, setSessions] = React.useState<ClassSession[]>([]);
  const [classCourses, setClassCourses] = React.useState<ClassCourse[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [tab, setTab] = React.useState<TabKey>('TIMETABLE');
  const [notice, setNotice] = React.useState<string | null>(null);

  const [detailClass, setDetailClass] = React.useState<Class | null>(null);
  const [assignClass, setAssignClass] = React.useState<Class | null>(null);
  const [isSessionOpen, setIsSessionOpen] = React.useState(false);
  const [editingSession, setEditingSession] = React.useState<ClassSession | undefined>(undefined);
  const [quickAddDate, setQuickAddDate] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!teacherId) return;
    let active = true;
    (async () => {
      const [cls, ses, cc, crs] = await Promise.all([
        classService.getClasses(teacherId),
        classService.getSessions(teacherId),
        classService.getAllClassCourses(teacherId),
        teacherService.getMyCourses(teacherId),
      ]);
      if (!active) return;
      setClasses(cls);
      setSessions(ses);
      setClassCourses(cc);
      setCourses(crs);
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [teacherId]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const openCreateSession = (dateStr?: string) => {
    setEditingSession(undefined);
    setQuickAddDate(dateStr);
    setIsSessionOpen(true);
  };

  const openEditSession = (session: ClassSession) => {
    setEditingSession(session);
    setQuickAddDate(undefined);
    setIsSessionOpen(true);
  };

  const handleSaveSession = async (payload: Omit<ClassSession, 'id'>) => {
    if (editingSession) {
      const updated = await classService.updateSession(editingSession.id, payload);
      if (updated) setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      flash('Đã cập nhật buổi học thành công.');
    } else {
      const created = await classService.createSession(payload);
      setSessions((prev) => [...prev, created]);
      flash('Đã thêm buổi học mới vào thời khóa biểu.');
    }
    setEditingSession(undefined);
    setQuickAddDate(undefined);
  };

  const handleDeleteSession = async (session: ClassSession) => {
    await classService.deleteSession(session.id);
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    flash('Đã xóa buổi học khỏi hệ thống.');
  };

  const handleAssignSave = async (classId: string, courseIds: string[]) => {
    if (!teacherId) return;
    const current = classCourses.filter((cc) => cc.class_id === classId);
    const currentIds = current.map((cc) => cc.course_id);
    const toAdd = courseIds.filter((id) => !currentIds.includes(id));
    const toRemove = current.filter((cc) => !courseIds.includes(cc.course_id));

    for (const courseId of toAdd) {
      await classService.assignCourse({ class_id: classId, course_id: courseId, teacher_id: teacherId });
    }
    for (const cc of toRemove) {
      await classService.removeClassCourse(cc.id);
    }
    const fresh = await classService.getAllClassCourses(teacherId);
    setClassCourses(fresh);
    flash('Đã cập nhật phân công khóa học cho lớp.');
  };

  const onlineSessionsCount = React.useMemo(
    () => sessions.filter((s) => Boolean(s.meeting_url)).length,
    [sessions]
  );

  const totalStudentsCount = React.useMemo(
    () => classes.reduce((sum, c) => sum + (c.student_count || 0), 0),
    [classes]
  );

  const tabs: TabItem[] = [
    {
      id: 'TIMETABLE',
      label: 'Thời Khóa Biểu',
      badge: sessions.length,
      icon: <CalendarDays className="w-4 h-4 text-[#00B8DD]" />,
    },
    {
      id: 'CLASSES',
      label: 'Danh Sách Lớp Học',
      badge: classes.length,
      icon: <Users className="w-4 h-4 text-indigo-500" />,
    },
  ];

  const assignedCourseIds = React.useMemo(
    () =>
      assignClass
        ? classCourses.filter((cc) => cc.class_id === assignClass.id).map((cc) => cc.course_id)
        : [],
    [assignClass, classCourses]
  );

  if (!user || (teacherId && isLoading)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-[460px] rounded-3xl" />
      </div>
    );
  }

  if (!teacherId) {
    return (
      <Card className="p-12 flex flex-col items-center text-center space-y-4 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="h-16 w-16 rounded-3xl bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
          <UserX className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chưa Tìm Thấy Hồ Sơ Giáo Viên</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Vui lòng đăng nhập cổng Giáo viên để truy cập lịch giảng dạy & danh sách lớp học.
          </p>
        </div>
        <Link href="/login/teacher">
          <Button className="bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold rounded-2xl px-6">
            Đăng Nhập Cổng Giáo Viên
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0A1E38] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#00B8DD]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-300 backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quản Lý Lớp & Phòng Học Trực Tuyến</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Thời Khóa Biểu & Lớp Học
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Theo dõi lịch giảng dạy tuần, phòng học trực tiếp và link học trực tuyến Google Meet / Zoom tiện lợi.
            </p>
          </div>

          <Button
            onClick={() => openCreateSession()}
            className="bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold h-12 px-5 rounded-2xl shadow-lg shadow-[#00B8DD]/30 border border-cyan-400/30 shrink-0"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Thêm Buổi Học Mới
          </Button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Lớp Phụ Trách</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{classes.length} Lớp</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Tiết Dạy Tuần Này</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{sessions.length} Tiết</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Trực Tuyến (Meet/Zoom)</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{onlineSessionsCount} Tiết</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Tổng Số Học Sinh</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{totalStudentsCount} Học sinh</p>
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/60 px-4 py-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={tab} onChange={(id) => setTab(id as TabKey)} />

      {/* View Content */}
      {tab === 'TIMETABLE' ? (
        <Card className="p-3.5 sm:p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm">
          <WeeklyTimetable
            sessions={sessions}
            classes={classes}
            onEdit={openEditSession}
            onDelete={handleDeleteSession}
            onQuickAddDate={(dateStr) => openCreateSession(dateStr)}
          />
        </Card>
      ) : (
        <ClassPanel
          classes={classes}
          classCourses={classCourses}
          courses={courses}
          onAssign={setAssignClass}
          onView={setDetailClass}
        />
      )}

      {/* Modals */}
      <ClassDetailDialog
        isOpen={Boolean(detailClass)}
        onClose={() => setDetailClass(null)}
        cls={detailClass}
        classCourses={classCourses}
        courses={courses}
        sessions={sessions}
        onAssign={(cls) => {
          setDetailClass(null);
          setAssignClass(cls);
        }}
      />

      <AssignCourseDialog
        isOpen={Boolean(assignClass)}
        onClose={() => setAssignClass(null)}
        classLabel={assignClass?.class_name || ''}
        courses={courses}
        assignedCourseIds={assignedCourseIds}
        onSave={(ids) => assignClass && handleAssignSave(assignClass.id, ids)}
      />

      <SessionFormDialog
        isOpen={isSessionOpen}
        onClose={() => {
          setIsSessionOpen(false);
          setQuickAddDate(undefined);
        }}
        classes={classes}
        session={editingSession}
        teacherId={teacherId}
        teacherName={classes[0]?.teacher_name}
        initialDate={quickAddDate}
        onSave={handleSaveSession}
      />
    </div>
  );
}

