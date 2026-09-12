'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Globe,
  UserX,
  ChevronDown,
  CheckCircle2,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import { resolveTeacherId, teacherService } from '@/services/teacher.service';
import { courseService } from '@/services/course.service';
import { Course, CourseChapter, Lesson } from '@/types';
import { CourseSettingsPanel } from './CourseSettingsPanel';
import { CurriculumTree } from './CurriculumTree';
import { LessonEditorPanel } from './LessonEditorPanel';

const STATUS_VARIANT: Record<Course['status'], React.ComponentProps<typeof Badge>['variant']> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  PUBLISHED: 'success',
  REJECTED: 'danger',
  HIDDEN: 'outline',
};

const STATUS_LABEL: Record<Course['status'], string> = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ duyệt',
  PUBLISHED: 'Đã xuất bản',
  REJECTED: 'Bị từ chối',
  HIDDEN: 'Đang ẩn',
};

export function CourseBuilderView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const teacherId = React.useMemo(() => resolveTeacherId(user), [user]);
  const courseIdParam = searchParams.get('courseId');

  const [course, setCourse] = React.useState<Course | null>(null);
  const [myCourses, setMyCourses] = React.useState<Course[]>([]);
  const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!teacherId) return;
    let active = true;
    (async () => {
      const list = await teacherService.getMyCourses(teacherId);
      const activeId = courseIdParam || list[0]?.id;
      const data = activeId ? await courseService.getCourseForBuilder(activeId) : undefined;
      if (!active) return;
      setMyCourses(list);
      setCourse(data || null);
      setSelectedLessonId(data?.chapters?.[0]?.lessons?.[0]?.id ?? null);
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [teacherId, courseIdParam]);

  const selectedLesson = React.useMemo(() => {
    if (!course || !selectedLessonId) return undefined;
    for (const ch of course.chapters || []) {
      const found = ch.lessons.find((l) => l.id === selectedLessonId);
      if (found) return found;
    }
    return undefined;
  }, [course, selectedLessonId]);

  const patchCourse = (patch: Partial<Course>) =>
    setCourse((prev) => (prev ? { ...prev, ...patch } : prev));

  const setChapters = (chapters: CourseChapter[]) =>
    setCourse((prev) => (prev ? { ...prev, chapters } : prev));

  const patchLesson = (patch: Partial<Lesson>) => {
    if (!selectedLessonId) return;
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: (prev.chapters || []).map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) => (l.id === selectedLessonId ? { ...l, ...patch } : l)),
        })),
      };
    });
  };

  const deleteLesson = () => {
    if (!course || !selectedLessonId) return;
    const nextChapters = (course.chapters || []).map((ch) => ({
      ...ch,
      lessons: ch.lessons.filter((l) => l.id !== selectedLessonId),
    }));
    setCourse({ ...course, chapters: nextChapters });
    setSelectedLessonId(nextChapters[0]?.lessons?.[0]?.id ?? null);
  };

  const handleSave = async (status?: Course['status']) => {
    if (!course) return;
    setIsSaving(true);
    const toSave: Course = status ? { ...course, status } : course;
    const saved = await courseService.saveCourseDraft(toSave);
    setCourse(saved);
    setIsSaving(false);
    setNotice(
      status === 'PENDING'
        ? 'Đã gửi duyệt khóa học.'
        : status === 'PUBLISHED'
          ? 'Đã xuất bản khóa học lên Marketplace.'
          : 'Đã lưu bản nháp.'
    );
    setTimeout(() => setNotice(null), 3000);
  };

  if (!user || (teacherId && isLoading)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-5 h-[480px]" />
          <Skeleton className="lg:col-span-4 h-[480px]" />
          <Skeleton className="lg:col-span-3 h-[480px]" />
        </div>
      </div>
    );
  }

  if (!teacherId) {
    return (
      <Card className="p-10 flex flex-col items-center text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <UserX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Chưa Tìm Thấy Hồ Sơ Giáo Viên</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Vui lòng đăng nhập bằng cổng Giáo viên để sử dụng Course Builder.
        </p>
        <Link href="/login/teacher">
          <Button className="mt-2">Đăng Nhập Cổng Giáo Viên</Button>
        </Link>
      </Card>
    );
  }

  if (!course) {
    return (
      <Card className="p-10 flex flex-col items-center text-center space-y-3">
        <BookOpen className="w-10 h-10 text-slate-300" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Chưa Có Khóa Học Để Soạn</h3>
        <p className="text-sm text-slate-500 max-w-md">Tạo khóa học mới trước khi mở trình soạn thảo.</p>
        <Link href="/teacher/courses">
          <Button className="mt-2">Về Danh Sách Khóa Học</Button>
        </Link>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 xl:flex-1">
          <Link
            href="/teacher/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách khóa học
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="purple">Course Builder</Badge>
            <Badge variant={STATUS_VARIANT[course.status]}>{STATUS_LABEL[course.status]}</Badge>
          </div>
          <h1
            className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5 truncate"
            title={course.title}
          >
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap xl:shrink-0">
          <DropdownMenu
            align="right"
            trigger={
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Layers className="w-3.5 h-3.5" /> Đổi khóa học
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            }
          >
            {myCourses.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => router.push(`/teacher/courses/builder?courseId=${c.id}`)}
              >
                <span className="text-xs block max-w-[240px] truncate">{c.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>

          <Button variant="outline" onClick={() => handleSave()} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Lưu nháp
          </Button>
          <Button variant="secondary" onClick={() => handleSave('PENDING')} leftIcon={<Send className="w-4 h-4" />}>
            Gửi duyệt
          </Button>
          <Button onClick={() => handleSave('PUBLISHED')} leftIcon={<Globe className="w-4 h-4" />}>
            Xuất bản
          </Button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cây bài học */}
        <div className="lg:col-span-5">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cây Bài Học</h2>
              <span className="text-[10px] text-slate-400 ml-auto">Kéo thả để đổi thứ tự</span>
            </div>
            <CurriculumTree
              chapters={course.chapters || []}
              selectedLessonId={selectedLessonId}
              onSelectLesson={setSelectedLessonId}
              onChange={setChapters}
            />
          </Card>
        </div>

        {/* Soạn bài học */}
        <div className="lg:col-span-4">
          <Card className="p-4">
            <LessonEditorPanel lesson={selectedLesson} onChange={patchLesson} onDelete={deleteLesson} />
          </Card>
        </div>

        {/* Cài đặt khóa học */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <CourseSettingsPanel course={course} onChange={patchCourse} />
          </Card>
        </div>
      </div>
    </div>
  );
}
