'use client';

import * as React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { LeaderboardUser } from '@/types/leaderboard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  onSelectUser?: (user: LeaderboardUser) => void;
  highlightUserId?: string;
}

export function LeaderboardTable({
  users,
  onSelectUser,
  highlightUserId,
}: LeaderboardTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3">
          🔍
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
          Không tìm thấy thí sinh phù hợp
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Hãy thử đổi bộ lọc khối lớp, môn học hoặc từ khóa tìm kiếm khác.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-1 text-center">Hạng</div>
        <div className="col-span-5">Thí Sinh & Trường Học</div>
        <div className="col-span-2 text-center">Môn & Chuỗi Học</div>
        <div className="col-span-2 text-center">Tỷ Lệ Đúng</div>
        <div className="col-span-2 text-right">Điểm EXP & Ngọc</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {users.map((user) => {
          const isHighlighted = user.isCurrentUser || user.id === highlightUserId;

          return (
            <div
              key={user.id}
              id={`user-rank-${user.rank}`}
              onClick={() => onSelectUser?.(user)}
              className={cn(
                'group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-4 sm:px-6 py-4 items-stretch md:items-center transition-all cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/50',
                isHighlighted && 'bg-[#00B8DD]/8 dark:bg-[#00B8DD]/15 border-l-4 border-l-[#00B8DD]'
              )}
            >
              {/* Rank column */}
              <div className="flex md:block md:col-span-1 items-center justify-between md:text-center">
                <div className="flex items-center md:justify-center gap-2">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm',
                      user.rank <= 3
                        ? 'bg-amber-100 text-amber-700 font-extrabold'
                        : user.rank <= 10
                        ? 'bg-cyan-50 text-[#007D99] dark:bg-cyan-950/60 dark:text-cyan-300 font-bold'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-semibold'
                    )}
                  >
                    #{user.rank}
                  </span>

                  {/* Rank Change Indicator */}
                  <span className="flex items-center text-[11px] font-bold">
                    {user.rankChange === 'UP' && (
                      <span className="text-emerald-500 flex items-center" title={`Tăng ${user.rankChangeAmount} bậc`}>
                        <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="hidden sm:inline text-[10px]">{user.rankChangeAmount}</span>
                      </span>
                    )}
                    {user.rankChange === 'DOWN' && (
                      <span className="text-rose-500 flex items-center" title={`Giảm ${user.rankChangeAmount} bậc`}>
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="hidden sm:inline text-[10px]">{user.rankChangeAmount}</span>
                      </span>
                    )}
                    {user.rankChange === 'SAME' && (
                      <span className="text-slate-400" title="Giữ nguyên thứ hạng">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </span>
                </div>

                {/* Mobile Points preview */}
                <div className="md:hidden text-right">
                  <span className="text-sm font-black text-[#00B8DD]">
                    {user.points.toLocaleString('vi-VN')} EXP
                  </span>
                </div>
              </div>

              {/* Student info */}
              <div className="md:col-span-5 flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  {user.isCurrentUser && (
                    <span className="absolute -bottom-1 -right-1 bg-[#00B8DD] text-white text-[9px] font-extrabold px-1 rounded-full border border-white">
                      BẠN
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-[#00B8DD] transition-colors">
                      {user.name}
                    </p>
                    {user.isCurrentUser && (
                      <Badge variant="primary" className="text-[10px] py-0 px-1.5 h-4 font-bold">
                        Bạn
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.className} • {user.schoolName}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold">
                      {user.badgeTitle}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Subject & Streak */}
              <div className="md:col-span-2 flex items-center justify-between md:justify-center gap-3 text-xs">
                <span className="md:hidden text-slate-400">Thế mạnh & Chuỗi:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {user.primarySubject}
                  </Badge>
                  <span className="flex items-center gap-0.5 font-bold text-orange-500 text-xs">
                    <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                    <span>{user.streakDays}d</span>
                  </span>
                </div>
              </div>

              {/* Correct Rate & Quizzes */}
              <div className="md:col-span-2 flex items-center justify-between md:justify-center gap-2 text-xs">
                <span className="md:hidden text-slate-400">Tỷ lệ đúng:</span>
                <div className="text-right md:text-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {user.correctRate}%
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {user.quizzesCompleted} bài thi
                  </span>
                </div>
              </div>

              {/* Points & Gems */}
              <div className="hidden md:flex md:col-span-2 flex-col items-end justify-center">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {user.points.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-400">EXP</span>
                </span>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  💎 {user.gems.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
