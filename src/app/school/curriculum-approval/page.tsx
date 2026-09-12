'use client';

import * as React from 'react';
import { ArrowUpDown, BookCheck, CalendarDays, Check, CheckCircle2, ChevronDown, Clock, Eye, FileText, FileSpreadsheet, Filter, Image as ImageIcon, Layers3, MessageSquare, Paperclip, PlayCircle, RotateCcw, Search, Store, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Tabs } from '@/components/ui/tabs';
import { MOCK_COURSES, MOCK_DEPARTMENTS } from '@/services/mock/data';
import { Course, CourseStatus } from '@/types';

type ApprovalCourseResponse = Partial<Course> & {
  owner_id?: string | null;
  subject_id?: string | null;
  teacher?: { id?: string; name?: string; fullname?: string } | null;
  department?: { id?: string; name?: string } | null;
  teacher_profile?: { user?: { fullname?: string } } | null;
  review_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

type ApprovalAction = 'APPROVE' | 'REJECT';

interface ApprovalActionPayload {
  course_id: string;
  action: ApprovalAction;
  note: string;
  reviewed_at: string;
}

interface ReviewRecord {
  action: ApprovalAction;
  note: string;
  reviewed_by: string;
  reviewed_at: string;
}

const statusTabs: { id: CourseStatus; label: string }[] = [
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'PUBLISHED', label: 'Đã xuất bản' },
  { id: 'REJECTED', label: 'Từ chối' },
];

function normalizeApprovalCourse(course: ApprovalCourseResponse): Course {
  const status = String(course.status || 'PENDING').toUpperCase() as CourseStatus;
  const teacherName = course.teacher_name
    || course.teacher?.name
    || course.teacher?.fullname
    || course.teacher_profile?.user?.fullname
    || 'Chưa cập nhật';

  return {
    id: course.id || `course-${course.title || 'unknown'}`,
    school_id: course.school_id || null,
    teacher_id: course.teacher_id || course.teacher?.id || course.owner_id || 'unknown',
    department_id: course.department_id || course.department?.id || null,
    title: course.title || 'Chưa có tên giáo án',
    slug: course.slug || '',
    description: course.description || null,
    thumbnail_url: course.thumbnail_url || null,
    price: course.price || 0,
    is_marketplace: Boolean(course.is_marketplace),
    status: ['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN'].includes(status) ? status : 'PENDING',
    level: course.level,
    rating: course.rating,
    total_reviews: course.total_reviews,
    total_students: course.total_students,
    teacher_name: teacherName,
    teacher_avatar: course.teacher_avatar,
    department_name: course.department_name || course.department?.name || 'Chưa cập nhật',
    chapters: course.chapters || [],
    total_lessons: course.total_lessons || 0,
    total_duration_mins: course.total_duration_mins || 0,
    created_at: course.created_at || new Date().toISOString(),
    updated_at: course.updated_at || course.created_at || new Date().toISOString(),
  };
}

function getMaterialIcon(fileType?: string) {
  if (fileType === 'IMG') return <ImageIcon className="h-3.5 w-3.5" />;
  if (fileType === 'EXCEL') return <FileSpreadsheet className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

function formatDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate);
}

function getStatusMeta(status: CourseStatus) {
  if (status === 'PUBLISHED') return { label: 'Đã xuất bản', variant: 'success' as const };
  if (status === 'REJECTED') return { label: 'Yêu cầu chỉnh sửa', variant: 'danger' as const };
  if (status === 'HIDDEN') return { label: 'Đang ẩn', variant: 'secondary' as const };
  if (status === 'DRAFT') return { label: 'Bản nháp', variant: 'secondary' as const };
  return { label: 'Chờ duyệt', variant: 'warning' as const };
}

export default function CurriculumApprovalPage() {
  const [courses, setCourses] = React.useState<Course[]>([
    ...MOCK_COURSES,
    {
      id: 'crs-pending-01',
      title: 'Hóa Học 11: Chuyên Đề Cân Bằng Hóa Học & Phản Ứng Oxi Hóa Khử',
      slug: 'hoa-hoc-11-can-bang',
      description: 'Bộ giáo án chuẩn bị cho học kỳ I gồm 15 bài giảng video và 5 đề trắc nghiệm.',
      thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      price: 350000,
      is_marketplace: true,
      status: 'PENDING',
      level: 'INTERMEDIATE',
      teacher_name: 'Cô Hoàng Mai Lan',
      teacher_id: 'tchr-04',
      department_name: 'Tổ Khoa Học Tự Nhiên (Lý - Hóa - Sinh)',
      total_lessons: 15,
      total_duration_mins: 450,
      created_at: '2026-08-23T10:00:00Z',
      updated_at: '2026-08-23T10:00:00Z',
    },
  ].map((course) => normalizeApprovalCourse(course as ApprovalCourseResponse)));
  const [selectedDepartment, setSelectedDepartment] = React.useState('ALL');
  const [selectedTeacher, setSelectedTeacher] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [marketplaceFilter, setMarketplaceFilter] = React.useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [sortBy, setSortBy] = React.useState<'UPDATED_DESC' | 'TITLE_ASC'>('UPDATED_DESC');
  const [activeStatus, setActiveStatus] = React.useState<CourseStatus>('PENDING');
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [expandedChapterId, setExpandedChapterId] = React.useState<string | null>(null);
  const [reviewHistory, setReviewHistory] = React.useState<Record<string, ReviewRecord[]>>({});
  const [feedback, setFeedback] = React.useState('');
  const [feedbackError, setFeedbackError] = React.useState('');
  const [actionType, setActionType] = React.useState<'APPROVE' | 'REJECT' | null>(null);

  const departmentCourses = courses.filter((course) => {
    if (selectedDepartment === 'ALL') return true;
    const department = MOCK_DEPARTMENTS.find((item) => item.id === selectedDepartment);
    const departmentShortName = department?.name.split(' (')[0];
    return course.department_id === selectedDepartment
      || course.department_name === department?.name
      || course.department_name === departmentShortName;
  });

  const teachers = Array.from(
    new Map(
      departmentCourses.map((course) => [course.teacher_id, { id: course.teacher_id, name: course.teacher_name || 'Chưa cập nhật' }])
    ).values()
  );

  const filteredCourses = departmentCourses
    .filter((course) => selectedTeacher === 'ALL' || course.teacher_id === selectedTeacher)
    .filter((course) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return course.title.toLowerCase().includes(query)
        || (course.teacher_name || '').toLowerCase().includes(query)
        || (course.department_name || '').toLowerCase().includes(query);
    })
    .filter((course) => marketplaceFilter === 'ALL' || (marketplaceFilter === 'YES' ? course.is_marketplace : !course.is_marketplace));

  const visibleCourses = filteredCourses
    .filter((course) => course.status === activeStatus)
    .sort((firstCourse, secondCourse) => sortBy === 'TITLE_ASC'
      ? firstCourse.title.localeCompare(secondCourse.title, 'vi')
      : new Date(secondCourse.updated_at).getTime() - new Date(firstCourse.updated_at).getTime());

  const counts = statusTabs.reduce<Record<string, number>>((result, tab) => {
    result[tab.id] = filteredCourses.filter((course) => course.status === tab.id).length;
    return result;
  }, {});

  const openAction = (course: Course, action: ApprovalAction) => {
    setSelectedCourse(course);
    setActionType(action);
    setFeedback('');
    setFeedbackError('');
  };

  const openDetails = (course: Course) => {
    setSelectedCourse(course);
    setActionType(null);
    setExpandedChapterId(course.chapters?.[0]?.id || null);
  };

  const closeDialog = () => {
    setSelectedCourse(null);
    setActionType(null);
    setExpandedChapterId(null);
    setFeedback('');
    setFeedbackError('');
  };

  const handleAction = () => {
    if (!selectedCourse || !actionType) return;
    if (actionType === 'REJECT' && !feedback.trim()) {
      setFeedbackError('Vui lòng nhập nhận xét để giáo viên biết nội dung cần chỉnh sửa.');
      return;
    }
    const reviewedAt = new Date().toISOString();
    const actionPayload: ApprovalActionPayload = {
      course_id: selectedCourse.id,
      action: actionType,
      note: feedback.trim(),
      reviewed_at: reviewedAt,
    };

    setReviewHistory((previousHistory) => ({
      ...previousHistory,
      [actionPayload.course_id]: [
        ...(previousHistory[actionPayload.course_id] || []),
        {
          action: actionPayload.action,
          note: actionPayload.note || 'Đã phê duyệt hồ sơ.',
          reviewed_by: 'HOD hiện tại',
          reviewed_at: actionPayload.reviewed_at,
        },
      ],
    }));
    setCourses((previousCourses) =>
      previousCourses.map((course) =>
        course.id === selectedCourse.id
          ? {
              ...course,
              status: actionType === 'APPROVE' ? 'PUBLISHED' : 'REJECTED',
              updated_at: reviewedAt,
            }
          : course
      )
    );
    closeDialog();
  };

  const resetFilters = () => {
    setSelectedDepartment('ALL');
    setSelectedTeacher('ALL');
    setSearchQuery('');
    setMarketplaceFilter('ALL');
    setSortBy('UPDATED_DESC');
  };

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2" icon={<BookCheck className="h-3.5 w-3.5" />}>
          Phân hệ Trưởng Bộ Môn (HOD)
        </Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hồ Sơ Giáo Án Chờ Thẩm Định</h1>
        <p className="mt-0.5 text-xs text-slate-500">Chọn tổ chuyên môn để theo dõi, kiểm duyệt và phản hồi các khóa học của giáo viên.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Tổng hồ sơ</p>
            <BookCheck className="h-4 w-4 text-[#00B8DD]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{filteredCourses.length}</p>
          <p className="mt-1 text-xs text-slate-500">Theo bộ lọc hiện tại</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Chờ thẩm định</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{counts.PENDING || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Cần HOD xử lý</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Đã phát hành</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{counts.PUBLISHED || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Đang hiển thị cho học sinh</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Filter className="h-4 w-4 text-[#00B8DD]" />
          Bộ lọc chuyên môn
          </div>
          <Button size="sm" variant="ghost" onClick={resetFilters} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
            Đặt lại
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 xl:col-span-2">
            Tìm kiếm hồ sơ
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tên khóa học, giáo viên hoặc tổ chuyên môn..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-[#00B8DD] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 xl:col-span-1">
            Tổ chuyên môn
            <select
              value={selectedDepartment}
              onChange={(event) => {
                setSelectedDepartment(event.target.value);
                setSelectedTeacher('ALL');
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#00B8DD] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="ALL">Tất cả tổ chuyên môn</option>
              {MOCK_DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 xl:col-span-1">
            Giáo viên phụ trách
            <select
              value={selectedTeacher}
              onChange={(event) => setSelectedTeacher(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#00B8DD] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="ALL">Tất cả giáo viên</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 xl:col-span-1">
            Marketplace
            <select
              value={marketplaceFilter}
              onChange={(event) => setMarketplaceFilter(event.target.value as 'ALL' | 'YES' | 'NO')}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#00B8DD] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="ALL">Tất cả hồ sơ</option>
              <option value="YES">Có mở bán</option>
              <option value="NO">Không mở bán</option>
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 xl:col-span-1">
            Sắp xếp
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'UPDATED_DESC' | 'TITLE_ASC')}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-[#00B8DD] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="UPDATED_DESC">Mới cập nhật</option>
                <option value="TITLE_ASC">Tên A - Z</option>
              </select>
            </div>
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 pt-5 dark:border-slate-800">
          <Tabs
            variant="underline"
            activeTab={activeStatus}
            onChange={(tabId) => setActiveStatus(tabId as CourseStatus)}
            tabs={statusTabs.map((tab) => ({ ...tab, badge: counts[tab.id] || 0 }))}
          />
        </div>

        {visibleCourses.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2 px-5 text-center">
            <Clock className="h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">Chưa có hồ sơ phù hợp</p>
            <p className="text-sm text-slate-500">Thử chọn tổ chuyên môn hoặc giáo viên khác.</p>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-5">
            {visibleCourses.map((course) => {
              const statusMeta = getStatusMeta(course.status);
              return (
                <article key={course.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950/35 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-24 sm:w-32">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400"><BookCheck className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="default">{course.department_name || 'Chưa cập nhật'}</Badge>
                        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      </div>
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-white sm:text-lg" title={course.title}>{course.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Biên soạn bởi: <span className="font-semibold text-slate-700 dark:text-slate-300">{course.teacher_name || 'Chưa cập nhật'}</span>
                        <span className="mx-1.5">•</span>{course.total_lessons || 0} bài học
                        <span className="mx-1.5">•</span>Cập nhật {formatDate(course.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-stretch gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 lg:w-48 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <Button className="w-full justify-start text-slate-700 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-100" size="sm" variant="outline" onClick={() => openDetails(course)} leftIcon={<Eye className="h-4 w-4" />}>
                      Xem chi tiết
                    </Button>
                    {course.status === 'PENDING' && <>
                      <Button className="w-full justify-start text-slate-700 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-100" size="sm" variant="outline" onClick={() => openAction(course, 'REJECT')} leftIcon={<X className="h-4 w-4 text-rose-500" />}>
                        Yêu cầu chỉnh sửa
                      </Button>
                      <Button className="w-full justify-start" size="sm" variant="primary" onClick={() => openAction(course, 'APPROVE')} leftIcon={<Check className="h-4 w-4" />}>
                        Duyệt phát hành
                      </Button>
                    </>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Dialog
        isOpen={!!selectedCourse}
        onClose={closeDialog}
        title={actionType === 'APPROVE' ? 'Xác Nhận Duyệt Giáo Án' : actionType === 'REJECT' ? 'Yêu Cầu Chỉnh Sửa Chuyên Môn' : 'Chi Tiết Hồ Sơ Giáo Án'}
        description={`Khóa học: ${selectedCourse?.title}`}
        maxWidth="lg"
      >
        {actionType ? <div className="space-y-4 py-2">
          <Textarea
            label="Lời nhận xét / Góp ý chuyên môn cho Giáo viên"
            placeholder={actionType === 'APPROVE' ? 'Nội dung bám sát khung chương trình, bài tập đa dạng...' : 'Nêu rõ nội dung giáo viên cần bổ sung hoặc chỉnh sửa...'}
            value={feedback}
            onChange={(event) => {
              setFeedback(event.target.value);
              if (event.target.value.trim()) setFeedbackError('');
            }}
          />
          {feedbackError && <p className="text-xs font-medium text-rose-600">{feedbackError}</p>}
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={closeDialog}>Hủy</Button><Button variant={actionType === 'APPROVE' ? 'primary' : 'destructive'} onClick={handleAction}>{actionType === 'APPROVE' ? 'Phê Duyệt Ngay' : 'Gửi Yêu Cầu Sửa'}</Button></div>
        </div> : <div className="space-y-5 py-2 text-sm">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row">
            <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:h-28 sm:w-44">
              {selectedCourse?.thumbnail_url ? <img src={selectedCourse.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><BookCheck className="h-8 w-8" /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={selectedCourse?.status === 'PUBLISHED' ? 'success' : selectedCourse?.status === 'REJECTED' ? 'danger' : 'warning'}>{selectedCourse?.status === 'PUBLISHED' ? 'Đã xuất bản' : selectedCourse?.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}</Badge>
                <Badge variant={selectedCourse?.is_marketplace ? 'success' : 'secondary'} icon={<Store className="h-3 w-3" />}>{selectedCourse?.is_marketplace ? 'Marketplace' : 'Nội bộ'}</Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCourse?.title}</h3>
              <p className="mt-2 flex items-start gap-2 text-slate-600 dark:text-slate-300"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#00B8DD]" />{selectedCourse?.description || 'Chưa có mô tả.'}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Giáo viên phụ trách</p><p className="mt-1 truncate font-semibold" title={selectedCourse?.teacher_name}>{selectedCourse?.teacher_name || 'Chưa cập nhật'}</p></div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Tổ chuyên môn</p><p className="mt-1 truncate font-semibold" title={selectedCourse?.department_name}>{selectedCourse?.department_name || 'Chưa cập nhật'}</p></div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="flex items-center gap-1 text-xs text-slate-500"><Layers3 className="h-3.5 w-3.5" />Nội dung</p><p className="mt-1 font-semibold">{selectedCourse?.total_lessons || 0} bài học</p></div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Cập nhật</p><p className="mt-1 font-semibold">{selectedCourse ? formatDate(selectedCourse.updated_at) : 'Chưa cập nhật'}</p></div>
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><FileText className="h-4 w-4 text-[#00B8DD]" />Nội dung chương trình</div>
              <span className="text-xs text-slate-500">{selectedCourse?.chapters?.length || 0} chương</span>
            </div>
            {selectedCourse?.chapters && selectedCourse.chapters.length > 0 ? <div className="space-y-2">
              {selectedCourse.chapters.map((chapter) => {
                const isExpanded = expandedChapterId === chapter.id;
                return <div key={chapter.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <button type="button" onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <span className="min-w-0"><span className="block truncate font-semibold text-slate-900 dark:text-white">{chapter.title}</span><span className="mt-1 block text-xs text-slate-500">{chapter.lessons.length} bài học</span></span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-[#00B8DD]' : 'text-slate-400'}`} />
                  </button>
                  {isExpanded && <div className="space-y-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/30">
                    {chapter.lessons.map((lesson) => <div key={lesson.id} className="space-y-2 rounded-lg bg-white px-3 py-2.5 dark:bg-slate-900/70">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 shrink-0 text-[#00B8DD]" />
                        <span className="min-w-0 flex-1 truncate text-sm">{lesson.title}</span>
                        <span className="shrink-0 text-xs text-slate-500">{lesson.duration_mins || 0} phút</span>
                      </div>
                      {lesson.materials && lesson.materials.length > 0 && <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                        {lesson.materials.map((material) => <a key={material.id} href={material.file_url || '#'} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300">
                          <Paperclip className="h-3 w-3 shrink-0" />
                          {getMaterialIcon(material.file_type)}
                          <span className="max-w-[180px] truncate">{material.title}</span>
                        </a>)}
                      </div>}
                    </div>)}
                  </div>}
                </div>;
              })}
            </div> : <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700">Chưa có dữ liệu chương và bài học.</div>}
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><MessageSquare className="h-4 w-4 text-[#00B8DD]" />Lịch sử thẩm định</div>
            {(reviewHistory[selectedCourse?.id || ''] || []).length > 0 ? <div className="space-y-2">
              {(reviewHistory[selectedCourse?.id || ''] || []).map((review, index) => <div key={`${review.reviewed_at}-${index}`} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant={review.action === 'APPROVE' ? 'success' : 'danger'}>{review.action === 'APPROVE' ? 'Đã duyệt' : 'Yêu cầu chỉnh sửa'}</Badge><span className="text-xs text-slate-500">{review.reviewed_by} · {formatDate(review.reviewed_at)}</span></div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.note}</p>
              </div>)}
            </div> : <div className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 dark:border-slate-700">Chưa có lịch sử thẩm định.</div>}
          </section>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <Button variant="outline" onClick={closeDialog}>Đóng</Button>
            {selectedCourse?.status === 'PENDING' && <><Button variant="destructive" onClick={() => openAction(selectedCourse, 'REJECT')} leftIcon={<X className="h-4 w-4" />}>Yêu cầu chỉnh sửa</Button><Button variant="primary" onClick={() => openAction(selectedCourse, 'APPROVE')} leftIcon={<Check className="h-4 w-4" />}>Duyệt phát hành</Button></>}
          </div>
        </div>}
      </Dialog>
    </div>
  );
}
