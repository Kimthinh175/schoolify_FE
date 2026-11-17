'use client';

import * as React from 'react';
import {
  Trophy,
  Calendar,
  Gift,
  Snowflake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Coins,
  Settings,
  Flame,
} from 'lucide-react';
import { Season } from '@/types/leaderboard';
import { leaderboardService } from '@/services/leaderboard.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface AdminSeasonManagerProps {
  seasons: Season[];
  selectedSeason: Season;
  onSelectSeason: (season: Season) => void;
  onOpenCreateModal: () => void;
  onOpenDistributeModal: () => void;
  onSeasonUpdated: (updated: Season) => void;
}

export function AdminSeasonManager({
  seasons,
  selectedSeason,
  onSelectSeason,
  onOpenCreateModal,
  onOpenDistributeModal,
  onSeasonUpdated,
}: AdminSeasonManagerProps) {
  const [isTogglingFreeze, setIsTogglingFreeze] = React.useState(false);

  const handleToggleFreeze = () => {
    setIsTogglingFreeze(true);
    setTimeout(() => {
      try {
        const updated = leaderboardService.toggleSeasonFreeze(selectedSeason.id);
        onSeasonUpdated(updated);
      } catch (err) {
        alert(String(err));
      } finally {
        setIsTogglingFreeze(false);
      }
    }, 400);
  };

  const isCompleted = selectedSeason.status === 'COMPLETED';
  const isDistributed = selectedSeason.distributionStatus === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Top Bar with Season Selector & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Season Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {seasons.map((s) => {
            const isSelected = s.id === selectedSeason.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSeason(s)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5',
                  isSelected
                    ? 'bg-[#00B8DD] border-[#00B8DD] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <span>{s.status === 'ACTIVE' ? '🏆' : s.status === 'COMPLETED' ? '🏁' : '⏳'}</span>
                <span>{s.name}</span>
                {s.isFrozen && <span>❄️</span>}
              </button>
            );
          })}
        </div>

        {/* Action Button: Create New Season */}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenCreateModal}
          className="shrink-0 font-bold text-xs h-9 rounded-xl flex items-center gap-1.5 border-slate-300 dark:border-slate-700"
        >
          <Plus className="w-4 h-4 text-[#00B8DD]" />
          <span>Tạo Mùa Giải Mới</span>
        </Button>
      </div>

      {/* Main Selected Season Control Card */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  selectedSeason.status === 'ACTIVE'
                    ? 'success'
                    : selectedSeason.status === 'FREEZING'
                    ? 'warning'
                    : 'secondary'
                }
                className="text-xs font-bold"
              >
                {selectedSeason.status === 'ACTIVE' && '🟢 Đang Diễn Ra'}
                {selectedSeason.status === 'FREEZING' && '❄️ Đang Đóng Băng BXH'}
                {selectedSeason.status === 'COMPLETED' && '🏁 Đã Kết Thúc & Chốt Giải'}
                {selectedSeason.status === 'UPCOMING' && '⏳ Sắp Bắt Đầu'}
              </Badge>
              <span className="text-xs font-mono text-slate-400">Mã: {selectedSeason.code}</span>
              {selectedSeason.isFrozen && (
                <Badge variant="warning" className="text-xs font-bold">
                  ❄️ Freeze Mode Bật
                </Badge>
              )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {selectedSeason.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {selectedSeason.description}
            </p>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Toggle Freeze Leaderboard */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Đóng Băng BXH
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedSeason.isFrozen ? 'Đang ẩn thứ hạng' : 'Hiện BXH bình thường'}
                </span>
              </div>
              <Switch
                checked={selectedSeason.isFrozen}
                onCheckedChange={handleToggleFreeze}
                disabled={isTogglingFreeze || isCompleted}
              />
            </div>

            {/* Core Action: Distribute Rewards Button */}
            <Button
              size="lg"
              variant="primary"
              onClick={onOpenDistributeModal}
              disabled={isDistributed}
              className={cn(
                'font-extrabold text-sm h-12 rounded-xl shadow-lg flex items-center gap-2',
                isDistributed
                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
              )}
            >
              {isDistributed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Đã Phát Thưởng Xong</span>
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  <span>Phát Thưởng Ngọc Cuối Mùa</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Season Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Thời Gian Diễn Ra</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
              {new Date(selectedSeason.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedSeason.endDate).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Quỹ Ngọc Dự Trù</span>
            <p className="font-bold text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
              💎 {selectedSeason.totalGemsPool.toLocaleString('vi-VN')} Ngọc
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Hệ Số Điểm EXP</span>
            <p className="font-bold text-amber-600 dark:text-amber-400 mt-1">
              {selectedSeason.scoringMultiplier}x Hệ số nhân
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Tình Trạng Phát Thưởng</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
              {selectedSeason.distributionStatus === 'COMPLETED' ? (
                <span className="text-emerald-600">Đã chốt sổ ({selectedSeason.distributedGems?.toLocaleString('vi-VN')} 💎)</span>
              ) : (
                <span className="text-amber-600">Chưa chốt sổ phát thưởng</span>
              )}
            </p>
          </div>
        </div>

        {/* Reward Structure Matrix Preview */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Cơ Cấu Giải Thưởng Thiết Lập Sẵn
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {selectedSeason.rewards.map((tier, idx) => (
              <div
                key={tier.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900 dark:text-white">
                      {tier.tierRank}
                    </span>
                    <span className="text-base">{idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}</span>
                  </div>
                  <p className="text-[11px] text-[#00B8DD] font-bold mt-1">
                    💎 {tier.gemReward.toLocaleString('vi-VN')} Ngọc
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 truncate" title={tier.description}>
                  {tier.badgeName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Box */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Thể Lệ & Điều Khoản Tính Điểm Đua Top
          </span>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
            {selectedSeason.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
