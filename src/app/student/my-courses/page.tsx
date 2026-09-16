'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Award, 
  GraduationCap, 
  BarChart3, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface EnrolledCourse {
  id: string;
  title: string;
  department_name: string;
  teacher_name: string;
  teacher_avatar?: string;
  thumbnail_url: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed: string;
  category_id: string;
}

const MOCK_ENROLLED_COURSES: EnrolledCourse[] = [
  {
    id: 'crs-01',
    title: 'Toán Học 11: Chuyên Đề Lượng Giác & Xác Suất Thống Kê Ứng Dụng',
    department_name: 'Tổ Toán & Tin Học',
    category_id: 'math-it',
    teacher_name: 'ThS. Nguyễn Văn Hùng',
    teacher_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    progress: 65,
    completed_lessons: 15,
    total_lessons: 24,
    last_accessed: 'Hôm nay, 14:30',
  },
  {
    id: 'crs-02',
    title: 'Luyện Thi IELTS Academic 7.5+: Bứt Phá Kỹ Năng Writing & Speaking',
    department_name: 'Tổ Ngoại Ngữ',
    category_id: 'foreign-lang',
    teacher_name: 'Cô Sarah Trần (IELTS 8.5)',
    teacher_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
    progress: 30,
    completed_lessons: 9,
    total_lessons: 30,
    last_accessed: 'Hôm qua',
  },
  {
    id: 'crs-03',
    title: 'Lập Trình Web Fullstack Thực Chiến Với Next.js & NestJS',
    department_name: 'Tổ Toán & Tin Học',
    category_id: 'math-it',
    teacher_name: 'Thầy Lê Quốc Dũng',
    teacher_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    progress: 100,
    completed_lessons: 40,
    total_lessons: 40,
    last_accessed: '02/09/2026',
  },
  {
    id: 'crs-04',
    title: 'Vật Lý 11: Cơ Học & Điện Học Nâng Cao',
    department_name: 'Tổ Khoa Học Tự Nhiên',
    category_id: 'natural-sci',
    teacher_name: 'ThS. Trần Hoàng Nam',
    teacher_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
    progress: 45,
    completed_lessons: 9,
    total_lessons: 20,
    last_accessed: '04/09/2026',
  },
  {
    id: 'crs-05',
    title: 'Hóa Học 11: Hóa Học Hữu Cơ & Ứng Dụng Thực Tế',
    department_name: 'Tổ Khoa Học Tự Nhiên',
    category_id: 'natural-sci',
    teacher_name: 'Cô Phạm Thị Mai',
    teacher_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    progress: 100,
    completed_lessons: 25,
    total_lessons: 25,
    last_accessed: '28/08/2026',
  },
  {
    id: 'crs-06',
    title: 'Tiếng Nhật N4: Giao Tiếp & Từ Vựng Chuyên Ngành',
    department_name: 'Tổ Ngoại Ngữ',
    category_id: 'foreign-lang',
    teacher_name: 'Sensei Kenji Sato',
    teacher_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1528164344705-47542687990d?w=600&auto=format&fit=crop&q=80',
    progress: 15,
    completed_lessons: 3,
    total_lessons: 20,
    last_accessed: '01/09/2026',
  },
];

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  // Calculate statistics
  const totalCourses = MOCK_ENROLLED_COURSES.length;
  const inProgressCourses = useMemo(() => MOCK_ENROLLED_COURSES.filter(c => c.progress > 0 && c.progress < 100), []);
  const completedCourses = useMemo(() => MOCK_ENROLLED_COURSES.filter(c => c.progress === 100), []);
  
  const avgProgress = Math.round(
    MOCK_ENROLLED_COURSES.reduce((acc, c) => acc + c.progress, 0) / totalCourses
  );

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return MOCK_ENROLLED_COURSES.filter((course) => {
      // Filter by tab
      if (activeTab === 'in-progress' && (course.progress === 100 || course.progress === 0)) return false;
      if (activeTab === 'completed' && course.progress !== 100) return false;

      // Filter by department
      if (selectedDepartment !== 'ALL' && course.department_name !== selectedDepartment) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesTeacher = course.teacher_name.toLowerCase().includes(query);
        const matchesDept = course.department_name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTeacher && !matchesDept) return false;
      }

      return true;
    });
  }, [activeTab, selectedDepartment, searchQuery]);

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất cả khóa học', badge: totalCourses },
    { id: 'in-progress', label: 'Đang học', badge: inProgressCourses.length },
    { id: 'completed', label: 'Hoàn thành', badge: completedCourses.length },
  ];

  const departments = [
    'ALL',
    'Tổ Toán & Tin Học',
    'Tổ Ngoại Ngữ',
    'Tổ Khoa Học Tự Nhiên',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Badge variant="purple" className="mb-2">
            Học Viên Dashboard
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Khóa Học Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi tiến độ, tiếp tục bài học còn dang dở và xem lại các chứng chỉ đã đạt được.
          </p>
        </div>
        <Link href="/student/marketplace">
          <Button variant="outline" leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}>
            Khám phá thêm khóa học
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="stat" className="p-4 flex items-center gap-4 border-slate-200/80 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng khóa học</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalCourses}</h4>
          </div>
        </Card>

        <Card variant="stat" className="p-4 flex items-center gap-4 border-slate-200/80 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đang học</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{inProgressCourses.length}</h4>
          </div>
        </Card>

        <Card variant="stat" className="p-4 flex items-center gap-4 border-slate-200/80 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hoàn thành</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{completedCourses.length}</h4>
          </div>
        </Card>

        <Card variant="stat" className="p-4 flex items-center gap-4 border-slate-200/80 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiến độ trung bình</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{avgProgress}%</h4>
          </div>
        </Card>
      </div>

      {/* Filter and Tabs Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {/* Tab buttons */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />

          {/* Filters: Search & Department Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Tìm khóa học, giảng viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="bg-white dark:bg-slate-900"
              />
            </div>

            {/* Department Select Filter */}
            <div className="relative w-full sm:w-52">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full h-11 px-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer appearance-none"
              >
                <option value="ALL">Tất cả môn học</option>
                {departments.filter(d => d !== 'ALL').map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Course List Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCompleted = course.progress === 100;
            return (
              <Card
                key={course.id}
                className="p-0 overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-slate-200/80 dark:border-slate-800"
              >
                {/* Course Image Header */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                  {/* Progress / Status Badge */}
                  <div className="absolute top-3 right-3">
                    {isCompleted ? (
                      <Badge variant="emerald" className="shadow-md font-bold gap-1 px-2.5 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-900/85 backdrop-blur-md text-white font-bold px-2.5 py-1">
                        {course.progress}% Hoàn thành
                      </Badge>
                    )}
                  </div>

                  {/* Last accessed tag */}
                  <div className="absolute bottom-2.5 left-3 text-[11px] font-medium text-white/90 flex items-center gap-1.5 drop-shadow-sm">
                    <Clock className="w-3 h-3 text-indigo-300" />
                    <span>Học gần nhất: {course.last_accessed}</span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                        {course.department_name}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {course.completed_lessons}/{course.total_lessons} bài
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-2 pt-1">
                      {course.teacher_avatar ? (
                        <img
                          src={course.teacher_avatar}
                          alt={course.teacher_name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                        {course.teacher_name}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Tiến độ khóa học</span>
                        <span className="font-bold text-slate-900 dark:text-white">{course.progress}%</span>
                      </div>
                      <Progress
                        value={course.progress}
                        color={isCompleted ? 'emerald' : 'indigo'}
                        className="h-2"
                      />
                    </div>

                    {isCompleted ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/student/learn/${course.id}/ls-01`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            Xem lại bài
                          </Button>
                        </Link>
                        <Button
                          variant="emerald"
                          size="sm"
                          className="w-full text-xs gap-1"
                          leftIcon={<Award className="w-3.5 h-3.5" />}
                        >
                          Chứng chỉ
                        </Button>
                      </div>
                    ) : (
                      <Link href={`/student/learn/${course.id}/ls-01`} className="w-full">
                        <Button className="w-full justify-center" leftIcon={<Play className="w-4 h-4 fill-current" />}>
                          {course.progress > 0 ? 'Vào Học Tiếp' : 'Bắt Đầu Học'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy khóa học nào</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Không tìm thấy khóa học nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
              setSelectedDepartment('ALL');
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
