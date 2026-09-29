'use client';

import * as React from 'react';
import { Users, BookOpen, Plus, GraduationCap, ArrowRight, Eye, Sparkles, MapPin, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchField } from '@/components/ui/search-field';
import { FilterDropdown, FilterOption } from '@/components/ui/filter-dropdown';
import { Class, ClassCourse, ClassStatus, Course } from '@/types';

import { CLASS_STATUS_META } from './class.meta';

export function ClassPanel({
  classes,
  classCourses,
  courses,
  onAssign,
  onView,
}: {
  classes: Class[];
  classCourses: ClassCourse[];
  courses: Course[];
  onAssign: (cls: Class) => void;
  onView: (cls: Class) => void;
}) {
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | ClassStatus>('ALL');

  const statusOptions: FilterOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái', count: classes.length },
    ...(Object.keys(CLASS_STATUS_META) as ClassStatus[]).map((s) => ({
      value: s,
      label: CLASS_STATUS_META[s].label,
      count: classes.filter((c) => c.status === s).length,
    })),
  ];

  const filtered = classes.filter((c) => {
    const keyword = query.trim().toLowerCase();
    const matchQuery =
      !keyword ||
      c.class_name.toLowerCase().includes(keyword) ||
      (c.code || '').toLowerCase().includes(keyword);
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const isFiltering = statusFilter !== 'ALL' || query.trim() !== '';

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar Lọc Lớp Học */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="w-full sm:max-w-md">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Tìm kiếm lớp học theo tên hoặc mã lớp..."
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(v) => setStatusFilter(v as 'ALL' | ClassStatus)}
          />
          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 h-11 px-3"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {classes.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> trên tổng số {classes.length} lớp học
          </p>
        </div>
      )}

      {/* Grid Danh Sách Lớp Học */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classes.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Bạn chưa được phân công lớp học nào.</p>
          </div>
        )}

        {classes.length > 0 && filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Không tìm thấy lớp học nào phù hợp với bộ lọc.</p>
          </div>
        )}

        {filtered.map((cls) => {
          const meta = CLASS_STATUS_META[cls.status] || CLASS_STATUS_META.ACTIVE;
          const assignedCourses = classCourses
            .filter((cc) => cc.class_id === cls.id)
            .map((cc) => courses.find((c) => c.id === cc.course_id))
            .filter((c): c is Course => Boolean(c));

          return (
            <div
              key={cls.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#00B8DD]/60 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="space-y-3">
                {/* Header Thẻ Lớp Học */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#E6F8FC] to-[#00B8DD]/20 text-[#007D99] dark:from-[#00B8DD]/20 dark:to-cyan-950 dark:text-[#00B8DD] flex items-center justify-center shrink-0 font-black shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00B8DD] transition-colors">
                        {cls.class_name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
                        {cls.code && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {cls.code}
                          </span>
                        )}
                        <span>{cls.room ? `Phòng ${cls.room}` : 'Chưa gán phòng'}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant={meta.variant} className="shrink-0 font-bold px-2.5 py-0.5">
                    {meta.label}
                  </Badge>
                </div>

                {/* Sĩ số học sinh */}
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-2.5 px-3 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Users className="w-4 h-4 text-[#00B8DD]" />
                    <span>Sĩ số: {cls.student_count ?? 0} học sinh</span>
                  </div>
                </div>

                {/* Khóa Học Đã Phân Công */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      Khóa học gắn với lớp ({assignedCourses.length})
                    </span>
                  </div>

                  {assignedCourses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                      Chưa phân công khóa học nào.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {assignedCourses.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 rounded-xl border border-indigo-100 bg-indigo-50/60 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span className="truncate max-w-[180px]">{c.title}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 justify-center text-xs font-bold border-slate-200 dark:border-slate-700"
                  onClick={() => onView(cls)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Chi Tiết Lớp
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1 justify-center text-xs font-bold bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs"
                  onClick={() => onAssign(cls)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Gán Khóa Học
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

