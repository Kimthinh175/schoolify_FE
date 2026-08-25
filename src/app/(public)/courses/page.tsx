'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, BookOpen, Star, Clock, User, ArrowRight, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { MOCK_COURSES } from '@/services/mock/data';

export default function CoursesMarketplacePage() {
  const [search, setSearch] = React.useState('');
  const [activeDept, setActiveDept] = React.useState('ALL');

  const deptTabs = [
    { id: 'ALL', label: 'Tất Cả Môn Học' },
    { id: 'Tổ Toán & Tin Học', label: 'Toán & Tin Học' },
    { id: 'Tổ Ngoại Ngữ', label: 'Ngoại Ngữ (IELTS)' },
    { id: 'Tổ Khoa Học Tự Nhiên', label: 'Khoa Học Tự Nhiên' },
  ];

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.teacher_name?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = activeDept === 'ALL' || course.department_name === activeDept;
    return matchesSearch && matchesDept;
  });

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="min-h-screen py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Page Header ── */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F8FC] dark:bg-[#00B8DD]/15 border border-[#00B8DD]/30 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Schoolify Course Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Kho Khóa Học & Đề Thi Trực Tuyến
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Học tập không giới hạn với hàng trăm bài giảng chuẩn hóa từ các trường chuyên và giáo viên hàng đầu. Thanh toán tiện lợi qua VietQR.
        </p>

        {/* Search & Department Filters */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Tìm kiếm khóa học hoặc tên giáo viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#00B8DD]" />}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <div className="overflow-x-auto w-full no-scrollbar">
            <Tabs tabs={deptTabs} activeTab={activeDept} onChange={setActiveDept} />
          </div>
        </div>
      </div>

      {/* ── Courses Count & Filter Status ── */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
        <span>Hiển thị <strong>{filteredCourses.length}</strong> khóa học phù hợp</span>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-[#00B8DD] hover:underline cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </div>

      {/* ── Courses Grid ── */}
      {filteredCourses.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy khóa học nào</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển danh mục môn học.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="p-0 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/70"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={course.thumbnail_url || ''}
                  alt={course.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <Badge variant="primary" className="bg-[#00B8DD] text-white font-bold text-xs shadow-md">
                    {formatMoney(course.price)}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] text-white font-semibold bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                    {course.level}
                  </span>
                  <span className="text-[10px] text-white font-medium bg-black/40 px-2 py-0.5 rounded-full">
                    {course.total_lessons} bài học
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-bold text-[#00B8DD] dark:text-[#00B8DD]">{course.department_name}</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{course.rating}</span>
                      <span className="text-[11px] text-slate-400">({course.total_reviews})</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-[#00B8DD] dark:group-hover:text-[#00B8DD] transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div>
                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-[#00B8DD]" />
                      {course.teacher_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {Math.round((course.total_duration_mins || 0) / 60)} giờ học
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link href={`/courses/${course.id}`}>
                    <Button
                      className="w-full justify-center bg-slate-100 hover:bg-[#00B8DD] hover:text-white text-slate-800 dark:bg-slate-800 dark:hover:bg-[#00B8DD] dark:text-slate-200 font-bold text-xs transition-colors"
                      variant="ghost"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Xem Chi Tiết & Học Thử
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
