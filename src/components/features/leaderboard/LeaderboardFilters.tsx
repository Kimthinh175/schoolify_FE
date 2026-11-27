'use client';

import * as React from 'react';
import {
  Calendar,
  Flame,
  Trophy,
  Filter,
  Search,
  Globe2,
  Building2,
  Users2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  LeaderboardTimeframe,
  LeaderboardScope,
  GradeLevel,
  SubjectFilter,
} from '@/types/leaderboard';
import { cn } from '@/lib/utils';
import { Tabs } from '@/components/ui/tabs';

interface LeaderboardFiltersProps {
  timeframe: LeaderboardTimeframe;
  onTimeframeChange: (tf: LeaderboardTimeframe) => void;
  scope: LeaderboardScope;
  onScopeChange: (sc: LeaderboardScope) => void;
  grade: GradeLevel;
  onGradeChange: (g: GradeLevel) => void;
  subject: SubjectFilter;
  onSubjectChange: (s: SubjectFilter) => void;
  search: string;
  onSearchChange: (val: string) => void;
  isFrozen?: boolean;
}

const TIMEFRAME_TABS = [
  { id: 'WEEKLY', label: 'BXH Tuần', icon: <Flame className="w-4 h-4 text-orange-500" /> },
  { id: 'MONTHLY', label: 'BXH Tháng', icon: <Calendar className="w-4 h-4 text-[#00B8DD]" /> },
  { id: 'SEASON', label: 'Toàn Mùa Giải 👑', icon: <Trophy className="w-4 h-4 text-amber-500" /> },
];

const SCOPE_OPTIONS = [
  { id: 'NATIONAL', label: 'Toàn Quốc', icon: Globe2 },
  { id: 'SCHOOL', label: 'Trường Của Tôi', icon: Building2 },
  { id: 'CLASS', label: 'Lớp Của Tôi', icon: Users2 },
];

const GRADE_OPTIONS: { id: GradeLevel; label: string }[] = [
  { id: 'ALL', label: 'Tất Cả Khối' },
  { id: 'GRADE_12', label: 'Khối 12' },
  { id: 'GRADE_11', label: 'Khối 11' },
  { id: 'GRADE_10', label: 'Khối 10' },
  { id: 'GRADE_9', label: 'Khối 9' },
  { id: 'GRADE_8', label: 'Khối 8' },
  { id: 'GRADE_7', label: 'Khối 7' },
  { id: 'GRADE_6', label: 'Khối 6' },
];

const SUBJECT_OPTIONS: { id: SubjectFilter; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Tất Cả Môn', icon: '📚' },
  { id: 'MATH', label: 'Toán Học', icon: '📐' },
  { id: 'PHYSICS', label: 'Vật Lý', icon: '⚡' },
  { id: 'CHEMISTRY', label: 'Hóa Học', icon: '🧪' },
  { id: 'ENGLISH', label: 'Tiếng Anh', icon: '🌐' },
  { id: 'BIOLOGY', label: 'Sinh Học', icon: '🧬' },
  { id: 'LITERATURE', label: 'Ngữ Văn', icon: '📖' },
  { id: 'INFORMATICS', label: 'Tin Học', icon: '💻' },
];

export function LeaderboardFilters({
  timeframe,
  onTimeframeChange,
  scope,
  onScopeChange,
  grade,
  onGradeChange,
  subject,
  onSubjectChange,
  search,
  onSearchChange,
  isFrozen = false,
}: LeaderboardFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Timeframe & Scope row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Main Timeframe Tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <Tabs
            tabs={TIMEFRAME_TABS}
            activeTab={timeframe}
            onChange={(id) => onTimeframeChange(id as LeaderboardTimeframe)}
          />
        </div>

        {/* Scope selector (National / School / Class) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          {SCOPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = scope === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onScopeChange(opt.id as LeaderboardScope)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-[#00B8DD] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#00B8DD]' : 'text-slate-400')} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade, Subject and Search Bar row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Subject Pills (Wrap cleanly on desktop so pills never overlap grade select) */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {SUBJECT_OPTIONS.map((sub) => {
            const isActive = subject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSubjectChange(sub.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border',
                  isActive
                    ? 'bg-[#00B8DD] border-[#00B8DD] text-white shadow-xs shadow-[#00B8DD]/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grade dropdown & Search input */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Grade selection */}
          <div className="relative">
            <select
              value={grade}
              onChange={(e) => onGradeChange(e.target.value as GradeLevel)}
              aria-label="Chọn khối lớp"
              className="h-10 px-3 pr-8 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] appearance-none cursor-pointer shadow-xs"
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm học sinh, trường..."
              className="h-10 w-full pl-9 pr-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Freeze Announcement Banner if season is frozen */}
      {isFrozen && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
          <div className="p-2 bg-amber-500 text-white rounded-xl font-bold shrink-0">
            ❄️
          </div>
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
