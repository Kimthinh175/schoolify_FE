'use client';

import * as React from 'react';
import {
  Calendar,
  Flame,
  Trophy,
  Search,
  BookOpen,
  ChevronDown,
  Check,
  RefreshCw,
  X,
  Calculator,
  Cpu,
  Atom,
  FlaskConical,
  Dna,
  Languages,
} from 'lucide-react';
import {
  LeaderboardTimeframe,
  GradeLevel,
  SubjectFilter,
} from '@/types/leaderboard';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface LeaderboardFiltersProps {
  timeframe: LeaderboardTimeframe;
  onTimeframeChange: (tf: LeaderboardTimeframe) => void;
  grade: GradeLevel;
  onGradeChange: (g: GradeLevel) => void;
  subject: SubjectFilter;
  onSubjectChange: (s: SubjectFilter) => void;
  search: string;
  onSearchChange: (val: string) => void;
  totalCount: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isFrozen?: boolean;
}

const TIMEFRAME_TABS: Array<{
  id: LeaderboardTimeframe;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'WEEKLY', label: 'BXH Tuần', icon: Flame },
  { id: 'MONTHLY', label: 'BXH Tháng', icon: Calendar },
  { id: 'SEASON', label: 'Toàn Mùa Giải', icon: Trophy },
];

export const LEADERBOARD_GRADE_OPTIONS: { id: GradeLevel; label: string; shortLabel: string }[] = [
  { id: 'ALL', label: 'Tất cả khối', shortLabel: 'Tất cả khối' },
  { id: 'GRADE_12', label: 'Lớp 12', shortLabel: 'Khối 12' },
  { id: 'GRADE_11', label: 'Lớp 11', shortLabel: 'Khối 11' },
  { id: 'GRADE_10', label: 'Lớp 10', shortLabel: 'Khối 10' },
  { id: 'GRADE_9', label: 'Lớp 9', shortLabel: 'Khối 9' },
  { id: 'GRADE_8', label: 'Lớp 8', shortLabel: 'Khối 8' },
  { id: 'GRADE_7', label: 'Lớp 7', shortLabel: 'Khối 7' },
  { id: 'GRADE_6', label: 'Lớp 6', shortLabel: 'Khối 6' },
  { id: 'GRADE_5', label: 'Lớp 5', shortLabel: 'Khối 5' },
  { id: 'GRADE_4', label: 'Lớp 4', shortLabel: 'Khối 4' },
  { id: 'GRADE_3', label: 'Lớp 3', shortLabel: 'Khối 3' },
  { id: 'GRADE_2', label: 'Lớp 2', shortLabel: 'Khối 2' },
  { id: 'GRADE_1', label: 'Lớp 1', shortLabel: 'Khối 1' },
];

export const LEADERBOARD_SUBJECT_OPTIONS: {
  id: SubjectFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}[] = [
  { id: 'ALL', label: 'Tất cả các môn học', icon: BookOpen, colorClass: 'text-[#00B8DD]' },
  { id: 'MATH', label: 'Toán Học', icon: Calculator, colorClass: 'text-sky-600 dark:text-sky-400' },
  { id: 'INFORMATICS', label: 'Tin Học', icon: Cpu, colorClass: 'text-cyan-600 dark:text-cyan-400' },
  { id: 'PHYSICS', label: 'Vật Lý', icon: Atom, colorClass: 'text-indigo-500 dark:text-indigo-400' },
  { id: 'CHEMISTRY', label: 'Hóa Học', icon: FlaskConical, colorClass: 'text-emerald-500 dark:text-emerald-400' },
  { id: 'BIOLOGY', label: 'Sinh Học', icon: Dna, colorClass: 'text-teal-500 dark:text-teal-400' },
  { id: 'ENGLISH', label: 'Tiếng Anh', icon: Languages, colorClass: 'text-amber-500 dark:text-amber-400' },
  { id: 'LITERATURE', label: 'Ngữ Văn', icon: BookOpen, colorClass: 'text-rose-500 dark:text-rose-400' },
];

export function LeaderboardFilters({
  timeframe,
  onTimeframeChange,
  grade,
  onGradeChange,
  subject,
  onSubjectChange,
  search,
  onSearchChange,
  totalCount,
  isRefreshing = false,
  onRefresh,
  isFrozen = false,
}: LeaderboardFiltersProps) {
  const currentSubject =
    LEADERBOARD_SUBJECT_OPTIONS.find((s) => s.id === subject) || LEADERBOARD_SUBJECT_OPTIONS[0];
  const currentGrade =
    LEADERBOARD_GRADE_OPTIONS.find((g) => g.id === grade) || LEADERBOARD_GRADE_OPTIONS[0];
  const CurrentSubjectIcon = currentSubject.icon;

  return (
    <div className="relative z-20 space-y-3">
      {/* Khối Bộ Lọc Đồng Bộ 100% Phong Cách Cổng Luyện Thi K-12 */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Hàng trên: Chuyển chu kỳ BXH gọn gàng theo màu chủ đạo */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
            {TIMEFRAME_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = timeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTimeframeChange(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer',
                    isActive
                      ? 'bg-[#00B8DD] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Xếp hạng toàn quốc theo môn &amp; khối lớp
          </span>
        </div>

        {/* Hàng bộ lọc chính (Chỉ gồm Tìm kiếm + Dropdown Môn + Dropdown Khối) */}
        <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3 space-y-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
            {/* 1. Ô tìm kiếm học sinh / trường / lớp (kính lúp xanh + hiệu ứng focus/hover) */}
            <div className="flex-1 relative min-w-[220px] group">
              <Input
                placeholder="Tìm kiếm theo tên học sinh, trường học hoặc lớp..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                leftIcon={
                  <Search className="w-4 h-4 text-[#00B8DD] transition-transform duration-200 group-focus-within:scale-110" />
                }
                className="w-full text-xs h-10 pr-8 bg-white dark:bg-slate-900 rounded-xl border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/60 focus:border-[#00B8DD] focus:ring-2 focus:ring-[#00B8DD]/20 transition-all shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-[#00B8DD] hover:bg-[#00B8DD]/10 transition-colors cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Cụm 2 Dropdown: Môn + Khối */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Dropdown Môn học (đầy đủ màu icon + hiệu ứng hover/chọn) */}
              <DropdownMenu
                align="left"
                className="min-w-[225px] max-h-80 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[70]"
                trigger={
                  <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/70 hover:bg-[#00B8DD]/[0.03] hover:shadow-xs active:scale-[0.98] text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <CurrentSubjectIcon
                        className={cn('w-4 h-4 shrink-0', currentSubject.colorClass)}
                      />
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Môn:
                      </span>
                      <span className="truncate">{currentSubject.label}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                }
              >
                {LEADERBOARD_SUBJECT_OPTIONS.map((subj) => {
                  const Icon = subj.icon;
                  const isSelected = subj.id === subject;
                  return (
                    <DropdownMenuItem
                      key={subj.id}
                      onClick={() => onSubjectChange(subj.id)}
                      className={cn(
                        'group py-2 px-2.5 rounded-xl text-xs transition-all',
                        isSelected
                          ? 'bg-[#00B8DD]/12 text-[#007D99] dark:text-[#00B8DD] font-bold'
                          : 'hover:bg-[#00B8DD]/[0.07] hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                      )}
                      icon={
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                            subj.colorClass
                          )}
                        />
                      }
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>{subj.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenu>

              {/* Dropdown Khối lớp */}
              <DropdownMenu
                align="right"
                className="min-w-[175px] max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-[70]"
                trigger={
                  <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/70 hover:bg-[#00B8DD]/[0.03] hover:shadow-xs active:scale-[0.98] text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Khối:
                      </span>
                      <span className="truncate">{currentGrade.label}</span>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                }
              >
                {LEADERBOARD_GRADE_OPTIONS.map((g) => {
                  const isSelected = g.id === grade;
                  return (
                    <DropdownMenuItem
                      key={g.id}
                      onClick={() => onGradeChange(g.id)}
                      className={cn(
                        'py-2 px-2.5 rounded-xl text-xs transition-all',
                        isSelected
                          ? 'bg-[#00B8DD]/12 text-[#007D99] dark:text-[#00B8DD] font-bold'
                          : 'hover:bg-[#00B8DD]/[0.07] hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                      )}
                      icon={
                        isSelected ? (
                          <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
                        ) : (
                          <span className="w-3.5 h-3.5 block" />
                        )
                      }
                    >
                      {g.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenu>
            </div>
          </div>

          {/* Thanh tóm tắt & nút Làm mới (giống hệt Hình 1) */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
            <span>
              Đang hiển thị:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{currentSubject.label}</strong>{' '}
              • <strong className="text-slate-800 dark:text-slate-200">{currentGrade.shortLabel}</strong>
              {search.trim() ? (
                <>
                  {' '}
                  • Từ khóa{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    &ldquo;{search.trim()}&rdquo;
                  </strong>
                </>
              ) : null}
            </span>

            <div className="flex items-center gap-3">
              <span>{totalCount} thí sinh • Khối 12 → 1</span>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#007D99] dark:text-[#00B8DD] hover:underline cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
                  <span>Làm mới</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Banner thông báo đóng băng mùa giải (nếu có) */}
      {isFrozen && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
          <div className="p-2 bg-amber-500 text-white rounded-xl font-bold shrink-0">❄️</div>
          <div>
            <span className="font-bold">Bảng xếp hạng đang được ĐÓNG BĂNG để chốt giải mùa!</span>
            <p className="text-[11px] sm:text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
              Điểm số các bài thi trong 24 giờ cuối vẫn được ghi nhận ngầm và kết quả chính thức sẽ được công bố tại lễ phát thưởng.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
