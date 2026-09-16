'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Eye, Pencil, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchField } from '@/components/ui/search-field';
import { FilterDropdown, FilterOption } from '@/components/ui/filter-dropdown';
import { teacherService, CourseStatusFilter } from '@/services/teacher.service';
import { Course, CourseStatus } from '@/types';

const STATUS_META: Record<
  CourseStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  DRAFT: { label: 'Bản nháp', variant: 'secondary' },
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  REJECTED: { label: 'Bị từ chối', variant: 'danger' },
  HIDDEN: { label: 'Đang ẩn', variant: 'outline' },
};

// Chỉ khóa đã xuất bản (hoặc đang ẩn) mới có thể bật/tắt bán trên Marketplace
const canToggleMarketplace = (status: CourseStatus) => status === 'PUBLISHED' || status === 'HIDDEN';

type MarketplaceFilterType = 'ALL' | 'MARKETPLACE_ONLY' | 'NOT_MARKETPLACE';
type PriceFilterType = 'ALL' | 'FREE' | 'PAID';
type SortOptionType = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'STUDENTS_DESC' | 'TITLE_ASC';

const MARKETPLACE_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'Tất cả kênh bán' },
  { value: 'MARKETPLACE_ONLY', label: 'Đang bán Marketplace' },
  { value: 'NOT_MARKETPLACE', label: 'Chưa bán Marketplace' },
];

const PRICE_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'Tất cả mức giá' },
  { value: 'FREE', label: 'Miễn phí (0đ)' },
  { value: 'PAID', label: 'Có tính phí' },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: 'NEWEST', label: 'Sắp xếp: Mới nhất' },
  { value: 'PRICE_ASC', label: 'Giá: Thấp đến cao' },
  { value: 'PRICE_DESC', label: 'Giá: Cao đến thấp' },
  { value: 'STUDENTS_DESC', label: 'Nhiều học viên nhất' },
  { value: 'TITLE_ASC', label: 'Tên khóa học (A-Z)' },
];

export function TeacherCourseManager({
  teacherId,
  initialCourses,
}: {
  teacherId: string;
  initialCourses: Course[];
}) {
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [activeStatus, setActiveStatus] = React.useState<CourseStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [marketplaceFilter, setMarketplaceFilter] = React.useState<MarketplaceFilterType>('ALL');
  const [priceFilter, setPriceFilter] = React.useState<PriceFilterType>('ALL');
  const [sortBy, setSortBy] = React.useState<SortOptionType>('NEWEST');
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const formatMoney = (amount: number) =>
    amount === 0
      ? 'Miễn phí'
      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { DRAFT: 0, PENDING: 0, PUBLISHED: 0, HIDDEN: 0 };
    courses.forEach((c) => {
      base[c.status] = (base[c.status] || 0) + 1;
    });
    return base;
  }, [courses]);

  const statusOptions: FilterOption[] = React.useMemo(
    () => [
      { value: 'ALL', label: 'Tất cả trạng thái', count: courses.length },
      { value: 'DRAFT', label: 'Bản nháp', count: counts.DRAFT },
      { value: 'PENDING', label: 'Chờ duyệt', count: counts.PENDING },
      { value: 'PUBLISHED', label: 'Đã xuất bản', count: counts.PUBLISHED },
      { value: 'HIDDEN', label: 'Đang ẩn', count: counts.HIDDEN },
    ],
    [courses.length, counts]
  );

  // Lọc và sắp xếp danh sách khóa học
  const filteredCourses = React.useMemo(() => {
    return courses
      .filter((course) => {
        // Lọc theo CourseStatus (DRAFT, PENDING, PUBLISHED, HIDDEN)
        if (activeStatus !== 'ALL' && course.status !== activeStatus) {
          return false;
        }
        // Lọc theo từ khóa tìm kiếm (tên khóa học, tổ chuyên môn)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesTitle = course.title.toLowerCase().includes(query);
          const matchesDept = course.department_name?.toLowerCase().includes(query) ?? false;
          if (!matchesTitle && !matchesDept) return false;
        }
        // Lọc theo Marketplace (bán trên Marketplace hay không)
        if (marketplaceFilter === 'MARKETPLACE_ONLY' && !course.is_marketplace) {
          return false;
        }
        if (marketplaceFilter === 'NOT_MARKETPLACE' && course.is_marketplace) {
          return false;
        }
        // Lọc theo Mức giá (Miễn phí vs Có phí)
        if (priceFilter === 'FREE' && course.price > 0) {
          return false;
        }
        if (priceFilter === 'PAID' && course.price === 0) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        if (sortBy === 'STUDENTS_DESC') return (b.total_students || 0) - (a.total_students || 0);
        if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title, 'vi');
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [courses, activeStatus, searchQuery, marketplaceFilter, priceFilter, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    activeStatus !== 'ALL' ||
    marketplaceFilter !== 'ALL' ||
    priceFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  const resetFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setMarketplaceFilter('ALL');
    setPriceFilter('ALL');
    setSortBy('NEWEST');
  };

  const handleToggleMarketplace = async (course: Course, value: boolean) => {
    setTogglingId(course.id);
    await teacherService.toggleMarketplace(teacherId, course.id, value);
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, is_marketplace: value } : c))
    );
    setTogglingId(null);
  };

  return (
    <Card className="p-0 overflow-hidden">
      {/* Card Header: Tiêu đề + Thống kê số lượng */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Quản Lý Khóa Học</h3>
              <Badge variant="secondary" className="text-xs font-semibold">
                {courses.length} khóa
              </Badge>
            </div>
          </div>
        </div>

        {/* Đếm số lượng hiển thị */}
        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <strong className="text-slate-900 dark:text-white">{filteredCourses.length}</strong> / {courses.length} khóa học
        </div>
      </div>

      {/* Single Unified Toolbar: Ô tìm kiếm + Tất cả bộ lọc trên 1 hàng */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Ô Tìm Kiếm */}
        <div className="w-full lg:max-w-md">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên khóa học, tổ chuyên môn..."
          />
        </div>

        {/* Nhóm Bộ Lọc Tập Trung (Status + Marketplace + Price + Sort + Reset) */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Lọc Trạng Thái Khóa Học */}
          <FilterDropdown
            value={activeStatus}
            options={statusOptions}
            onChange={(v) => setActiveStatus(v as CourseStatusFilter)}
          />

          {/* Lọc Marketplace */}
          <FilterDropdown
            value={marketplaceFilter}
            options={MARKETPLACE_OPTIONS}
            onChange={(v) => setMarketplaceFilter(v as MarketplaceFilterType)}
          />

          {/* Lọc Mức Giá */}
          <FilterDropdown
            value={priceFilter}
            options={PRICE_OPTIONS}
            onChange={(v) => setPriceFilter(v as PriceFilterType)}
          />

          {/* Sắp Xếp */}
          <FilterDropdown
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={(v) => setSortBy(v as SortOptionType)}
          />

          {/* Nút Đặt lại bộ lọc */}
          {hasActiveFilters && (
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

      {/* Bảng Danh Sách Khóa Học */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[240px]">Khóa Học</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Giá Bán</TableHead>
            <TableHead>Học Viên</TableHead>
            <TableHead>Bán Marketplace</TableHead>
            <TableHead className="text-right">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-500">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Không tìm thấy khóa học phù hợp với bộ lọc hiện tại.
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                      Xóa bộ lọc & thử lại
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredCourses.map((course) => {
              const meta = STATUS_META[course.status];
              const canToggle = canToggleMarketplace(course.status);
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.thumbnail_url || ''}
                        alt=""
                        className="h-11 w-16 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-500">{course.department_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        course.price > 0
                          ? 'text-sm font-bold text-slate-900 dark:text-white'
                          : 'text-sm font-semibold text-slate-500'
                      }
                    >
                      {formatMoney(course.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200">
                      <Users className="w-4 h-4 text-slate-400" />
                      {(course.total_students || 0).toLocaleString('vi-VN')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={course.is_marketplace}
                        disabled={!canToggle || togglingId === course.id}
                        onCheckedChange={(value) => handleToggleMarketplace(course, value)}
                        aria-label={`Bán khóa học ${course.title} trên Marketplace`}
                      />
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {canToggle ? (course.is_marketplace ? 'Đang bán' : 'Đã tắt') : 'Cần xuất bản'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Xem trước khóa học">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/teacher/courses/builder?courseId=${course.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs font-bold text-amber-700 bg-amber-50/80 border-amber-200 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900/60 dark:hover:bg-amber-950/80"
                          leftIcon={<Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                        >
                          Chỉnh Sửa
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

