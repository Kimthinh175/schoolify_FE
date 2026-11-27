'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Award, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { LeaderboardUser } from '@/types/leaderboard';
import { Badge } from '@/components/ui/badge';

interface PodiumTopThreeProps {
  topThree: LeaderboardUser[];
  onSelectUser?: (user: LeaderboardUser) => void;
}

export function PodiumTopThree({ topThree, onSelectUser }: PodiumTopThreeProps) {
  if (!topThree || topThree.length === 0) {
    return (
      <div className="py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Chưa có thí sinh nào phù hợp với bộ lọc môn học / khối lớp hiện tại.
      </div>
    );
  }

  const first = topThree.find((u) => u.rank === 1) || topThree[0];
  const second = topThree.find((u) => u.rank === 2) || topThree[1];
  const third = topThree.find((u) => u.rank === 3) || topThree[2];

  return (
    <div className="relative pt-6 pb-2 px-2 sm:px-4">
      {/* Background ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-[#00B8DD]/20 via-amber-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-row items-end justify-center gap-2 sm:gap-4 md:gap-6 pt-10">
        {/* RANK 2 - BẠC (Silver - Left) */}
        {second && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex-1 max-w-[200px] sm:max-w-[240px] flex flex-col items-center cursor-pointer group"
            onClick={() => onSelectUser?.(second)}
          >
            {/* Avatar & Badges */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 shadow-lg shadow-slate-400/20 group-hover:scale-105 transition-transform">
                  <img
                    src={second.avatar}
                    alt={second.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-400 to-slate-600 text-white font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full border-2 border-white shadow-md flex items-center gap-1">
                  <span>#2</span>
                </div>
              </div>

              <div className="text-center mt-3 w-full">
                <p className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[190px] mx-auto">
                  {second.name}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[190px] mx-auto">
                  {second.schoolName}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                    {second.badgeTitle}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pedestal Block 2 */}
            <div className="w-full h-36 sm:h-44 md:h-48 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-t-2 border-x-2 border-slate-300/80 dark:border-slate-700 p-2 sm:p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🥈</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-2 text-center border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase block">Điểm EXP</span>
                <p className="font-black text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-100">
                  {second.points.toLocaleString('vi-VN')}
                </p>
                <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                    <Flame className="w-3 h-3" /> {second.streakDays}d
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    💎 {second.gems}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RANK 1 - VÀNG (Gold - Center Champion) */}
        {first && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 max-w-[220px] sm:max-w-[270px] flex flex-col items-center cursor-pointer group z-10"
            onClick={() => onSelectUser?.(first)}
          >
            {/* Crown & Avatar */}
            <div className="relative mb-3 flex flex-col items-center">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="mb-1 text-amber-500 drop-shadow-md"
              >
                <Crown className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 fill-amber-400 text-amber-500" />
              </motion.div>

              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-xl shadow-amber-500/30 group-hover:scale-105 transition-transform ring-4 ring-amber-300/40">
                  <img
                    src={first.avatar}
                    alt={first.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs sm:text-sm px-3 py-0.5 rounded-full border-2 border-white shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-200" />
                  <span>#1</span>
                </div>
              </div>

              <div className="text-center mt-3.5 w-full">
                <p className="font-extrabold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[220px] mx-auto">
                  {first.name}
                </p>
                <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[170px] sm:max-w-[220px] mx-auto">
                  {first.schoolName}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Badge variant="warning" className="text-[10px] py-0 px-2 font-bold bg-amber-100 text-amber-800 border-amber-300">
                    👑 {first.badgeTitle}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pedestal Block 1 */}
            <div className="w-full h-44 sm:h-56 md:h-60 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-300 via-amber-200 to-amber-400 dark:from-amber-600/40 dark:via-amber-700/30 dark:to-slate-900 border-t-4 border-x-2 border-amber-400 dark:border-amber-500/60 p-2 sm:p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
              <div className="flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">🏆</span>
              </div>
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-xl p-2.5 text-center border border-amber-300/80 dark:border-amber-600/50 shadow-md">
                <span className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
                  QUÁN QUÂN EXP
                </span>
                <p className="font-black text-base sm:text-xl md:text-2xl text-amber-600 dark:text-amber-400">
                  {first.points.toLocaleString('vi-VN')}
                </p>
                <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-0.5 font-bold text-orange-500">
                    <Flame className="w-3.5 h-3.5" /> {first.streakDays} ngày
                  </span>
                  <span>•</span>
                  <span className="font-bold text-[#00B8DD]">
                    💎 {first.gems}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RANK 3 - ĐỒNG (Bronze - Right) */}
        {third && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex-1 max-w-[200px] sm:max-w-[240px] flex flex-col items-center cursor-pointer group"
            onClick={() => onSelectUser?.(third)}
          >
            {/* Avatar & Badges */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 shadow-lg shadow-amber-800/20 group-hover:scale-105 transition-transform">
                  <img
                    src={third.avatar}
                    alt={third.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full border-2 border-white shadow-md flex items-center gap-1">
                  <span>#3</span>
                </div>
              </div>

              <div className="text-center mt-3 w-full">
                <p className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[190px] mx-auto">
                  {third.name}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[190px] mx-auto">
                  {third.schoolName}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                    {third.badgeTitle}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pedestal Block 3 */}
            <div className="w-full h-28 sm:h-36 md:h-40 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-slate-900 border-t-2 border-x-2 border-amber-300 dark:border-amber-800 p-2 sm:p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🥉</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-2 text-center border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase block">Điểm EXP</span>
                <p className="font-black text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-100">
                  {third.points.toLocaleString('vi-VN')}
                </p>
                <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                    <Flame className="w-3 h-3" /> {third.streakDays}d
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    💎 {third.gems}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Podium base line */}
      <div className="max-w-4xl mx-auto h-2 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent rounded-full shadow-xs" />
    </div>
  );
}
