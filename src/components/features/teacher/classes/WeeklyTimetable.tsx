'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterDropdown, FilterOption } from '@/components/ui/filter-dropdown';
import { SearchField } from '@/components/ui/search-field';
import { cn } from '@/lib/utils';
import { Class, ClassSession } from '@/types';
import { SessionCard } from './SessionCard';

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

type FilterMode = 'ALL' | 'ONLINE' | 'OFFLINE';

const mondayOf = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Chủ nhật
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeek = (offset: number) => {
  const monday = mondayOf(new Date());
  monday.setDate(monday.getDate() + offset * 7);
  return monday;
};

const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
    2,
    '0'
  )}`;

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDay = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

/** Lịch giảng dạy theo tuần (ERD: ClassSession) */
export function WeeklyTimetable({
  sessions,
  classes,
  onEdit,
  onDelete,
  onQuickAddDate,
}: {
  sessions: ClassSession[];
  classes: Class[];
  onEdit: (session: ClassSession) => void;
  onDelete: (session: ClassSession) => void;
  onQuickAddDate?: (dateStr: string) => void;
}) {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [classFilter, setClassFilter] = React.useState('ALL');
  const [modeFilter, setModeFilter] = React.useState<FilterMode>('ALL');
  const [query, setQuery] = React.useState('');

  const handlePickDate = (value: string) => {
    if (!value) return;
    const picked = mondayOf(new Date(`${value}T00:00:00`));
    const base = mondayOf(new Date());
    setWeekOffset(Math.round((picked.getTime() - base.getTime()) / 604800000));
  };

  const classOptions: FilterOption[] = [
    { value: 'ALL', label: 'Tất cả lớp học', count: sessions.length },
    ...classes.map((c) => ({
      value: c.id,
      label: c.class_name,
      count: sessions.filter((s) => s.class_id === c.id).length,
    })),
  ];

  const modeOptions: FilterOption[] = [
    { value: 'ALL', label: 'Tất cả hình thức' },
    {
      value: 'ONLINE',
      label: 'Trực tuyến (Meet/Zoom)',
      count: sessions.filter((s) => Boolean(s.meeting_url)).length,
    },
    {
      value: 'OFFLINE',
      label: 'Tại phòng học',
      count: sessions.filter((s) => !s.meeting_url).length,
    },
  ];

  const isFiltering = classFilter !== 'ALL' || modeFilter !== 'ALL' || query.trim() !== '';

  const resetFilters = () => {
    setQuery('');
    setClassFilter('ALL');
    setModeFilter('ALL');
  };

  const filtered = sessions.filter((s) => {
    const matchClass = classFilter === 'ALL' || s.class_id === classFilter;
    const matchMode =
      modeFilter === 'ALL' || (modeFilter === 'ONLINE' ? Boolean(s.meeting_url) : !s.meeting_url);
    const keyword = query.trim().toLowerCase();
    const text = `${s.title} ${s.class_name || ''} ${s.room || ''}`.toLowerCase();
    const matchQuery = !keyword || text.includes(keyword);
    return matchClass && matchMode && matchQuery;
  });

  const monday = startOfWeek(weekOffset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = new Date();

  const byDay = days.map((day) =>
    filtered
      .filter((s) => isSameDay(new Date(s.start_time), day))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  );
  const totalInWeek = byDay.reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="space-y-5">
      {/* Unified Toolbar Tìm Kiếm & Bộ Lọc Thời Khóa Biểu */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
        <div className="w-full lg:max-w-md">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Tìm theo tiết dạy, tên lớp, phòng học..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Lọc Lớp */}
          <FilterDropdown value={classFilter} options={classOptions} onChange={setClassFilter} />

          {/* Lọc Hình Thức */}
          <FilterDropdown
            value={modeFilter}
            options={modeOptions}
            onChange={(v) => setModeFilter(v as FilterMode)}
          />

          {/* Nút Đặt Lại */}
          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 h-10 px-3"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Đặt lại
            </Button>
          )}

          {/* Picker Chọn Ngày Chuyển Tuần */}
          <label
            title="Chọn ngày cụ thể để chuyển tuần"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 cursor-pointer hover:border-[#00B8DD] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
            <input
              type="date"
              value={toDateInput(days[0])}
              onChange={(e) => handlePickDate(e.target.value)}
              aria-label="Chọn ngày"
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer dark:text-slate-200"
            />
          </label>

          {/* Bộ Điều Hướng Tuần */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="h-8 w-8 p-0 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={weekOffset === 0 ? 'primary' : 'ghost'}
              onClick={() => setWeekOffset(0)}
              className={cn(
                'h-8 px-3 text-xs font-bold rounded-lg',
                weekOffset === 0
                  ? 'bg-[#00B8DD] text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              Tuần này
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="h-8 w-8 p-0 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Timetable Grid (7 Cột rộng rãi 220px/cột, scroll ngang mượt) */}
      <div className="hidden lg:block overflow-x-auto pb-4 pt-1">
        <div className="grid grid-cols-7 gap-3.5 min-w-[1540px]">
          {days.map((day, i) => {
            const isToday = isSameDay(day, today);
            const dateStr = toDateInput(day);

            return (
              <div
                key={i}
                className={cn(
                  'group/col flex flex-col space-y-2.5 rounded-2xl p-2.5 transition-all',
                  isToday
                    ? 'bg-[#E6F8FC]/50 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/40 ring-1 ring-[#00B8DD]/20'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60'
                )}
              >
                {/* Day Header */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors',
                    isToday
                      ? 'bg-[#00B8DD] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  )}
                >
                  <div className="text-left">
                    <p
                      className={cn(
                        'text-xs font-black uppercase tracking-wider',
                        isToday ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                      )}
                    >
                      {DAY_LABELS[i]}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] font-medium mt-0.5',
                        isToday ? 'text-cyan-50' : 'text-slate-400'
                      )}
                    >
                      {formatDay(day)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {byDay[i].length > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                          isToday
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        )}
                      >
                        {byDay[i].length}
                      </span>
                    )}
                    {onQuickAddDate && (
                      <button
                        type="button"
                        onClick={() => onQuickAddDate(dateStr)}
                        className={cn(
                          'rounded-lg p-1 transition-transform active:scale-95 cursor-pointer',
                          isToday
                            ? 'hover:bg-white/20 text-white'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:hover:bg-slate-700'
                        )}
                        title={`Thêm tiết dạy cho ${DAY_LABELS[i]}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Sessions Content */}
                <div className="flex-1 space-y-2 min-h-[160px]">
                  {byDay[i].length === 0 ? (
                    <div
                      onClick={() => onQuickAddDate && onQuickAddDate(dateStr)}
                      className="flex flex-col items-center justify-center h-full min-h-[130px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center transition-colors hover:border-[#00B8DD]/60 hover:bg-white dark:hover:bg-slate-800/40 group/add cursor-pointer"
                    >
                      <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/add:bg-[#E6F8FC] group-hover/add:text-[#00B8DD] transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="mt-1.5 text-[11px] font-bold text-slate-400 group-hover/add:text-[#00B8DD] transition-colors">
                        Thêm tiết dạy
                      </span>
                    </div>
                  ) : (
                    byDay[i].map((s) => (
                      <SessionCard key={s.id} session={s} onEdit={onEdit} onDelete={onDelete} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timetable List View */}
      <div className="lg:hidden space-y-3.5">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dateStr = toDateInput(day);
          const hasSessions = byDay[i].length > 0;

          if (!hasSessions && isFiltering) return null;

          return (
            <div
              key={i}
              className={cn(
                'rounded-2xl border p-3.5 space-y-3 transition-all',
                isToday
                  ? 'border-[#00B8DD]/60 bg-[#E6F8FC]/40 dark:bg-[#00B8DD]/10'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-black uppercase tracking-wider',
                      isToday ? 'text-[#007D99] dark:text-[#00B8DD]' : 'text-slate-800 dark:text-slate-200'
                    )}
                  >
                    {DAY_LABELS[i]} ({formatDay(day)})
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-[#00B8DD] text-white text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
                      Hôm nay
                    </span>
                  )}
                </div>

                {onQuickAddDate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onQuickAddDate(dateStr)}
                    className="h-7 px-2 text-[11px] font-semibold text-[#00B8DD] hover:bg-[#E6F8FC]"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Thêm tiết
                  </Button>
                )}
              </div>

              {!hasSessions ? (
                <p className="text-xs text-slate-400 py-2 italic text-center">Không có tiết dạy.</p>
              ) : (
                <div className="space-y-2.5">
                  {byDay[i].map((s) => (
                    <SessionCard key={s.id} session={s} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {totalInWeek === 0 && (
          <div className="py-12 text-center space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              {isFiltering ? 'Không tìm thấy tiết dạy nào phù hợp với bộ lọc.' : 'Tuần này chưa có lịch giảng dạy nào.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

