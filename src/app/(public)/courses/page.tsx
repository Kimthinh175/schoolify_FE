'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, BookOpen, Star, Clock, User, ArrowRight, Sparkles, Filter, CheckCircle2, Award, Flame, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { MOCK_COURSES } from '@/services/mock/data';

export default function CoursesMarketplacePage() {
  const [search, setSearch] = React.useState('');
  const [activeDept, setActiveDept] = React.useState('ALL');
  const [activeLevel, setActiveLevel] = React.useState('ALL');

  const deptTabs = [
    { id: 'ALL', label: 'Tất Cả Môn Học' },
    { id: 'Tổ Toán & Tin Học', label: 'Toán & Tin Học' },
    { id: 'Tổ Khoa Học Tự Nhiên', label: 'Lý - Hóa - Sinh' },
    { id: 'Tổ Ngoại Ngữ', label: 'Tiếng Anh (IELTS)' },
    { id: 'Tổ Ngữ Văn', label: 'Ngữ Văn' },
  ];

  const levelTabs = [
    { id: 'ALL', label: 'Mọi Trình Độ' },
    { id: 'BEGINNER', label: 'Cơ Bản' },
    { id: 'INTERMEDIATE', label: 'Trung Cấp' },
    { id: 'ADVANCED', label: 'Nâng Cao / Luyện Thi' },
  ];

  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = activeDept === 'ALL' || course.department_name === activeDept;
    const matchesLevel = activeLevel === 'ALL' || course.level === activeLevel;
    return matchesSearch && matchesDept && matchesLevel;
  });

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="min-h-screen py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Page Header ── */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F8FC] dark:bg-[#00B8DD]/15 border border-[#00B8DD]/30 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] mb-3">
          <BookMarked className="w-3.5 h-3.5 text-[#00B8DD]" />
          <span>Schoolify Course Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Kho Khóa Học & Chuyên Đề Luyện Thi
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Nền tảng khóa học chuẩn hóa K-12 từ các trường chuyên và giảng viên hàng đầu. Đóng gói tri thức, học mọi lúc mọi nơi với thanh toán VietQR tiện lợi.
        </p>

        {/* Search & Department Filters */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Tìm tên khóa học, môn học, giáo viên..."
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

          {/* Sub-Filter: Level */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#00B8DD]" /> Trình độ:
            </span>
            <div className="flex flex-wrap gap-2">
              {levelTabs.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setActiveLevel(lvl.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeLevel === lvl.id
                      ? 'bg-[#00B8DD] text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Courses Count & Status ── */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
        <span>Hiển thị <strong>{filteredCourses.length}</strong> / {MOCK_COURSES.length} khóa học phù hợp</span>
        {(search || activeDept !== 'ALL' || activeLevel !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setActiveDept('ALL');
              setActiveLevel('ALL');
            }}
            className="text-[#00B8DD] font-semibold hover:underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* ── Courses Grid ── */}
      {filteredCourses.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy khóa học phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc trình độ.</p>
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
                
                {/* Price Tag */}
                <div className="absolute top-3 right-3">
                  <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-black text-xs shadow-md">
                    {formatMoney(course.price)}
                  </Badge>
                </div>

                {/* Level & Lessons info */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] text-white font-semibold bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                    {course.level === 'BEGINNER' ? 'Cơ Bản' : course.level === 'INTERMEDIATE' ? 'Trung Cấp' : 'Nâng Cao'}
                  </span>
                  <span className="text-[10px] text-white font-medium bg-black/50 px-2 py-0.5 rounded-full">
                    {course.total_lessons} bài học
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">{course.department_name}</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{course.rating}</span>
                      <span className="text-[11px] text-slate-400">({course.total_reviews})</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-[#00B8DD] dark:group-hover:text-[#00B8DD] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div>
                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
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
                      className="w-full justify-center bg-[#E6F8FC] hover:bg-[#00B8DD] hover:text-slate-950 text-[#007D99] dark:bg-slate-800 dark:hover:bg-[#00B8DD] dark:hover:text-slate-950 dark:text-cyan-400 font-bold text-xs transition-all"
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

