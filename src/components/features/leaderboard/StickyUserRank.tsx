'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  ArrowUp,
  Target,
  Gift,
  ChevronUp,
  ChevronDown,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { LeaderboardUser } from '@/types/leaderboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyUserRankProps {
  currentUser: LeaderboardUser;
  onScrollToMe?: () => void;
  onOpenRewardsModal?: () => void;
}

export function StickyUserRank({
  currentUser,
  onScrollToMe,
  onOpenRewardsModal,
}: StickyUserRankProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Compute points needed to reach rank 41 (or next rank)
  const nextRankPoints = 1910;
  const pointsGap = Math.max(0, nextRankPoints - currentUser.points);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative bg-slate-900/95 text-white backdrop-blur-xl border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 overflow-hidden"
        >
          {/* Subtle top cyan line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00B8DD] via-amber-400 to-[#00B8DD]" />

          {/* Main Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: User Rank & Avatar & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  Vị Trí Của Bạn
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    #{currentUser.rank}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center">
                    <ArrowUp className="w-3 h-3 stroke-[3]" />
                    +{currentUser.rankChangeAmount || 3}
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block shrink-0" />

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#00B8DD]"
                  />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00B8DD]" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-sm text-white truncate">
                      {currentUser.name}
                    </p>
                    <Badge variant="primary" className="text-[9px] py-0 px-1 font-bold h-4">
                      Bạn
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    {currentUser.className} • {currentUser.schoolName}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle: Gap to next rank & points */}
            <div className="hidden lg:flex flex-col items-center justify-center px-4 border-x border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Target className="w-3.5 h-3.5 text-[#00B8DD]" />
                <span>
                  Chỉ còn <strong className="text-amber-300">+{pointsGap} EXP</strong> để lên hạng <strong>#41</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Đang vượt qua <strong>92%</strong> học sinh cùng khối
              </div>
            </div>

            {/* Right: Points + Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-800 sm:border-0">
              <div className="text-left sm:text-right mr-2">
                <span className="text-[10px] text-slate-400 font-semibold block">ĐIỂM HIỆN TẠI</span>
                <span className="text-sm sm:text-base font-black text-[#00B8DD]">
                  {currentUser.points.toLocaleString('vi-VN')} EXP
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onScrollToMe}
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-xs h-9 px-2.5 rounded-xl flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#00B8DD]" />
                  <span className="hidden sm:inline">Tới vị trí</span>
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={onOpenRewardsModal}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs h-9 px-3 rounded-xl font-bold flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Quà Mùa</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
