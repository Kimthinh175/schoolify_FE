'use client';

import * as React from 'react';
import {
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  School,
  GraduationCap,
} from 'lucide-react';
import { LeaderboardUser } from '@/types/leaderboard';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserRankDetailModalProps {
  user: LeaderboardUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserRankDetailModal({
  user,
  isOpen,
  onClose,
}: UserRankDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Hồ Sơ Thành Tích Học Tập</span>
        </div>
      }
    >
      <div className="space-y-5 my-2">
        {/* Profile Card Header */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-6xl opacity-10 font-black">
            #{user.rank}
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#00B8DD]"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white font-black text-xs px-1.5 py-0.2 rounded-full border border-white">
                #{user.rank}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white truncate">
                  {user.name}
                </h3>
                {user.isCurrentUser && (
                  <Badge variant="primary" className="text-[10px] py-0 px-1.5 font-bold">
                    Bạn
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {user.className} • {user.schoolName}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="warning" className="text-[10px] font-bold">
                  🎖️ {user.badgeTitle}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tổng EXP</span>
            <p className="text-lg font-black text-[#00B8DD] mt-0.5">
              {user.points.toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Chuỗi Học</span>
            <p className="text-lg font-black text-orange-500 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500" />
              {user.streakDays} ngày
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tỷ Lệ Đúng</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {user.correctRate}%
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Số Dư Ngọc</span>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
              💎 {user.gems}
            </p>
          </div>
        </div>

        {/* Learning details */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Môn sở trường:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{user.primarySubject}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Bài tập & đề thi đã giải:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{user.quizzesCompleted} bài</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Trạng thái xếp hạng:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {user.rankChange === 'UP' ? `Tăng ${user.rankChangeAmount} bậc` : user.rankChange === 'DOWN' ? `Tụt ${user.rankChangeAmount} bậc` : 'Giữ vững vị trí'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="secondary" onClick={onClose} size="sm">
          Đóng
        </Button>
      </div>
    </Dialog>
  );
}
