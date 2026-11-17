'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  Award,
  Sparkles,
  Gift,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Share2,
} from 'lucide-react';
import {
  LeaderboardTimeframe,
  LeaderboardScope,
  GradeLevel,
  SubjectFilter,
  LeaderboardUser,
  Season,
} from '@/types/leaderboard';
import { leaderboardService } from '@/services/leaderboard.service';
import { PodiumTopThree } from '@/components/features/leaderboard/PodiumTopThree';
import { LeaderboardFilters } from '@/components/features/leaderboard/LeaderboardFilters';
import { LeaderboardTable } from '@/components/features/leaderboard/LeaderboardTable';
import { StickyUserRank } from '@/components/features/leaderboard/StickyUserRank';
import { SeasonRewardsModal } from '@/components/features/leaderboard/SeasonRewardsModal';
import { UserRankDetailModal } from '@/components/features/leaderboard/UserRankDetailModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = React.useState<LeaderboardTimeframe>('WEEKLY');
  const [scope, setScope] = React.useState<LeaderboardScope>('NATIONAL');
  const [grade, setGrade] = React.useState<GradeLevel>('ALL');
  const [subject, setSubject] = React.useState<SubjectFilter>('ALL');
  const [search, setSearch] = React.useState('');

  const [activeSeason, setActiveSeason] = React.useState<Season>(() =>
    leaderboardService.getActiveSeason()
  );

  const [selectedUser, setSelectedUser] = React.useState<LeaderboardUser | null>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = React.useState(false);
  const [highlightUserId, setHighlightUserId] = React.useState<string | undefined>(undefined);

  // Countdown timer for active season
  const [timeLeft, setTimeLeft] = React.useState({ days: 14, hours: 8, minutes: 24, seconds: 50 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered leaderboard data
  const { topThree, restOfUsers, currentUser, totalCount } = React.useMemo(() => {
    return leaderboardService.getFilteredLeaderboard({
      timeframe,
      scope,
      grade,
      subject,
      search,
    });
  }, [timeframe, scope, grade, subject, search]);

  const handleScrollToMe = () => {
    if (!currentUser) return;
    setHighlightUserId(currentUser.id);
    const element = document.getElementById(`user-rank-${currentUser.rank}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-28">
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00B8DD]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="primary" className="bg-[#00B8DD] text-white font-extrabold uppercase tracking-wide">
                  Đấu Trường Học Tập Schoolify
                </Badge>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
                  {activeSeason.name}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Bảng Xếp Hạng & <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Đua Top Mùa Giải</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Vinh danh những gương mặt học sinh xuất sắc nhất toàn quốc. Tích lũy điểm kinh nghiệm (EXP), rèn luyện kỹ năng và nhận hàng ngàn Ngọc thưởng giá trị.
              </p>
            </div>

            {/* Countdown Box & Gem Pool */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 shrink-0 w-full md:w-auto shadow-xl">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>KẾT THÚC SAU</span>
                </div>
                <span className="text-xs text-slate-400">Chốt sổ Mùa 1</span>
              </div>

              {/* Countdown Numbers */}
              <div className="grid grid-cols-4 gap-2 text-center mt-3">
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-700">
                  <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Ngày</span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-700">
                  <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.hours}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Giờ</span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-700">
                  <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.minutes}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Phút</span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-700">
                  <span className="text-xl sm:text-2xl font-black text-[#00B8DD]">{timeLeft.seconds}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Giây</span>
                </div>
              </div>

              {/* Gem Pool & Action */}
              <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">TỔNG QUỸ THƯỞNG</span>
                  <span className="text-sm font-black text-cyan-400 flex items-center gap-1">
                    💎 {activeSeason.totalGemsPool.toLocaleString('vi-VN')} Ngọc
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsRewardsModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl h-9"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Cơ Cấu Quà</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        {/* PODIUM TOP 3 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md">
          <div className="text-center mb-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00B8DD]">
              Vinh Danh Anh Tài
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Podium Top 3 Xuất Sắc Nhất
            </h2>
          </div>

          <PodiumTopThree
            topThree={topThree}
            onSelectUser={(user) => setSelectedUser(user)}
          />
        </div>

        {/* FILTERS SECTION */}
        <LeaderboardFilters
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          scope={scope}
          onScopeChange={setScope}
          grade={grade}
          onGradeChange={setGrade}
          subject={subject}
          onSubjectChange={setSubject}
          search={search}
          onSearchChange={setSearch}
          isFrozen={activeSeason.isFrozen}
        />

        {/* RANKINGS TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bảng Đua Top</span>
                <span className="text-xs font-normal text-slate-500">
                  (Hiển thị {restOfUsers.length} thí sinh)
                </span>
              </h3>
            </div>
            <div className="text-xs text-slate-500">
              Cập nhật mỗi 15 phút
            </div>
          </div>

          <LeaderboardTable
            users={restOfUsers}
            onSelectUser={(user) => setSelectedUser(user)}
            highlightUserId={highlightUserId}
          />
        </div>
      </main>

      {/* ── STICKY USER RANK BAR (Ghim thứ hạng cá nhân) ── */}
      {currentUser && (
        <StickyUserRank
          currentUser={currentUser}
          onScrollToMe={handleScrollToMe}
          onOpenRewardsModal={() => setIsRewardsModalOpen(true)}
        />
      )}

      {/* ── MODALS ── */}
      <SeasonRewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        season={activeSeason}
        userRank={currentUser?.rank || 42}
      />

      <UserRankDetailModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
