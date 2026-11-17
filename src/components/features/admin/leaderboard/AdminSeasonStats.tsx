'use client';

import * as React from 'react';
import {
  Trophy,
  Users,
  Coins,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
  Snowflake,
} from 'lucide-react';
import { Season } from '@/types/leaderboard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminSeasonStatsProps {
  activeSeason: Season;
  totalParticipants: number;
}

export function AdminSeasonStats({
  activeSeason,
  totalParticipants,
}: AdminSeasonStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Season Card */}
      <Card className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mùa Giải Đang Chạy
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {activeSeason.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={
                activeSeason.status === 'ACTIVE'
                  ? 'success'
                  : activeSeason.status === 'FREEZING'
                  ? 'warning'
                  : 'secondary'
              }
              className="text-[10px] font-bold"
            >
              {activeSeason.status === 'ACTIVE' && '🟢 Đang Diễn Ra'}
              {activeSeason.status === 'FREEZING' && '❄️ Đang Đóng Băng'}
              {activeSeason.status === 'COMPLETED' && '🏁 Đã Kết Thúc'}
              {activeSeason.status === 'UPCOMING' && '⏳ Sắp Diễn Ra'}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">{activeSeason.code}</span>
          </div>
        </div>
      </Card>

      {/* Participants */}
      <Card className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tổng Thí Sinh Đua Top
          </span>
          <div className="p-2 rounded-xl bg-[#00B8DD]/10 text-[#00B8DD]">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {totalParticipants.toLocaleString('vi-VN')}
          </h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">▲ +1,240</span> học sinh tuần này
          </p>
        </div>
      </Card>

      {/* Gem Prize Pool */}
      <Card className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quỹ Ngọc Phát Thưởng
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <h4 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            💎 {activeSeason.totalGemsPool.toLocaleString('vi-VN')}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {activeSeason.distributionStatus === 'COMPLETED'
              ? '✅ Đã phát thưởng hoàn tất'
              : 'Chờ chốt sổ phát thưởng cuối mùa'}
          </p>
        </div>
      </Card>

      {/* Anti-cheat Health */}
      <Card className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Giám Sát Gian Lận (AI)
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            99.8%
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            0 tài khoản vi phạm • Đạt chuẩn đối soát
          </p>
        </div>
      </Card>
    </div>
  );
}
