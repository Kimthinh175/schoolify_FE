'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Gift,
  Coins,
  ShieldAlert,
  History,
  Plus,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Season, SeasonDistributionLog } from '@/types/leaderboard';
import { leaderboardService } from '@/services/leaderboard.service';
import { AdminSeasonStats } from '@/components/features/admin/leaderboard/AdminSeasonStats';
import { AdminSeasonManager } from '@/components/features/admin/leaderboard/AdminSeasonManager';
import { DistributionLogsTable } from '@/components/features/admin/leaderboard/DistributionLogsTable';
import { AdminLeaderboardAudit } from '@/components/features/admin/leaderboard/AdminLeaderboardAudit';
import { CreateSeasonModal } from '@/components/features/admin/leaderboard/CreateSeasonModal';
import { RewardDistributionModal } from '@/components/features/admin/leaderboard/RewardDistributionModal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminLeaderboardPage() {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = React.useState<Season | null>(null);
  const [logs, setLogs] = React.useState<SeasonDistributionLog[]>([]);
  const [activeTab, setActiveTab] = React.useState('seasons');

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = React.useState(false);

  // Load data
  const refreshData = React.useCallback(() => {
    const sList = leaderboardService.getSeasons();
    const lList = leaderboardService.getDistributionLogs();
    setSeasons(sList);
    setLogs(lList);
    if (!selectedSeason || !sList.find((s) => s.id === selectedSeason.id)) {
      const active = sList.find((s) => s.status === 'ACTIVE') || sList[0];
      setSelectedSeason(active);
    } else {
      const updated = sList.find((s) => s.id === selectedSeason.id);
      if (updated) setSelectedSeason(updated);
    }
  }, [selectedSeason]);

  React.useEffect(() => {
    refreshData();
  }, []);

  const handleSeasonCreated = (newSeason: Season) => {
    refreshData();
    setSelectedSeason(newSeason);
  };

  const handleDistributionComplete = () => {
    refreshData();
  };

  const handleSeasonUpdated = (updated: Season) => {
    refreshData();
    setSelectedSeason(updated);
  };

  const users = leaderboardService.getUsers();

  const ADMIN_TABS = [
    {
      id: 'seasons',
      label: 'Mùa Giải & Phát Thưởng',
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'history',
      label: 'Biên Bản Phát Thưởng',
      badge: logs.length,
      icon: <History className="w-4 h-4 text-[#00B8DD]" />,
    },
    {
      id: 'audit',
      label: 'Giám Sát Gian Lận AI',
      icon: <ShieldAlert className="w-4 h-4 text-emerald-500" />,
    },
  ];

  if (!selectedSeason) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" className="text-[10px] font-bold">
              Super Admin SaaS
            </Badge>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs text-slate-500">Bảng Xếp Hạng & Mùa Giải</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Quản Lý Mùa Giải & Phát Thưởng Ngọc
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thiết lập chu kỳ đua top, đóng băng BXH và phát thưởng tự động cho học sinh đạt thứ hạng cao.
          </p>
        </div>

        {/* Quick External Link to Student View */}
        <div className="flex items-center gap-2">
          <Link href="/leaderboard" target="_blank">
            <Button variant="outline" size="sm" className="font-semibold text-xs h-9 rounded-xl flex items-center gap-1.5">
              <span>Xem BXH Học Sinh</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00B8DD]" />
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsDistributeModalOpen(true)}
            className="font-bold text-xs h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Phát Thưởng Ngọc</span>
          </Button>
        </div>
      </div>

      {/* ── KPI STATS CARDS ── */}
      <AdminSeasonStats
        activeSeason={selectedSeason}
        totalParticipants={selectedSeason.totalParticipants || 14250}
      />

      {/* ── MAIN TABS NAVIGATION ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <Tabs
            tabs={ADMIN_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        {/* TAB 1: SEASONS & REWARD MANAGEMENT */}
        {activeTab === 'seasons' && (
          <AdminSeasonManager
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSelectSeason={setSelectedSeason}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenDistributeModal={() => setIsDistributeModalOpen(true)}
            onSeasonUpdated={handleSeasonUpdated}
          />
        )}

        {/* TAB 2: DISTRIBUTION LOGS */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nhật Ký & Lịch Sử Phát Thưởng Ngọc Cuối Mùa
                </h3>
                <p className="text-xs text-slate-500">
                  Danh sách biên bản đối soát và xác nhận chuyển Ngọc tự động vào ví học sinh
                </p>
              </div>
            </div>
            <DistributionLogsTable logs={logs} />
          </div>
        )}

        {/* TAB 3: ANTI-CHEAT AUDIT */}
        {activeTab === 'audit' && (
          <AdminLeaderboardAudit
            users={users}
            onUserAdjusted={refreshData}
          />
        )}
      </div>

      {/* ── MODALS ── */}
      <CreateSeasonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSeasonCreated={handleSeasonCreated}
      />

      <RewardDistributionModal
        isOpen={isDistributeModalOpen}
        onClose={() => setIsDistributeModalOpen(false)}
        season={selectedSeason}
        onDistributionComplete={handleDistributionComplete}
      />
    </div>
  );
}
