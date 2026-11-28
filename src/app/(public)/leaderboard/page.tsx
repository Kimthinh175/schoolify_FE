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
  GradeLevel,
  SubjectFilter,
  LeaderboardUser,
  Season,
} from '@/types/leaderboard';
import {
  leaderboardService,
  normalizeLeaderboardSubject,
} from '@/services/leaderboard.service';
import { catalogService } from '@/services/catalog.service';
import { useAuthStore } from '@/store/auth.store';
import { PodiumTopThree } from '@/components/features/leaderboard/PodiumTopThree';
import { LeaderboardFilters } from '@/components/features/leaderboard/LeaderboardFilters';
import { LeaderboardTable } from '@/components/features/leaderboard/LeaderboardTable';
import { StickyUserRank } from '@/components/features/leaderboard/StickyUserRank';
import { SeasonRewardsModal } from '@/components/features/leaderboard/SeasonRewardsModal';
import { UserRankDetailModal } from '@/components/features/leaderboard/UserRankDetailModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function computeRemainingTime(endDateIso?: string, seasonStatus?: string) {
  const defaultRemaining = { days: 14, hours: 8, minutes: 24, seconds: 50 };
  if (!endDateIso) return defaultRemaining;
  const diffMs = new Date(endDateIso).getTime() - Date.now();
  if (!Number.isFinite(diffMs)) return defaultRemaining;
  if (diffMs <= 0) {
    // Mùa giải đang ACTIVE ở chế độ dữ liệu mẫu có mốc ngày cũ -> hiển thị chu kỳ 14 ngày hoạt động thay vì 00:00:00:00
    if (seasonStatus === 'ACTIVE' || seasonStatus === 'FREEZING') {
      return defaultRemaining;
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

function mapLeaderboardEntries(entries: Record<string, unknown>[]): LeaderboardUser[] {
  return entries.map((entry, idx) => {
    const rawGrade = entry.grade ?? entry.gradeLevel ?? entry.grade_level ?? 12;
    const gradeNum = Number(String(rawGrade).match(/\d+/)?.[0] || 12);
    const safeGrade = `GRADE_${Math.min(12, Math.max(1, gradeNum))}` as GradeLevel;
    const pts = Number(entry.points || 0);
    const tier =
      idx === 0
        ? 'DIAMOND'
        : idx < 3
          ? 'PLATINUM'
          : idx < 10
            ? 'GOLD'
            : idx < 20
              ? 'SILVER'
              : 'BRONZE';
    const mappedSubject = normalizeLeaderboardSubject(
      String(entry.primarySubject || entry.primary_subject || entry.subject || '')
    );
    return {
      id: String(entry.userId || entry.studentId || `lb-${idx + 1}`),
      rank: Number(entry.rank || idx + 1),
      previousRank: Number(entry.previousRank || entry.rank || idx + 1),
      rankChange: (entry.rankChange as LeaderboardUser['rankChange']) || 'SAME',
      rankChangeAmount: Number(entry.rankChangeAmount || 0),
      name: String(entry.fullname || 'Học sinh Schoolify'),
      avatar: String(
        entry.avatarUrl ||
          entry.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      ),
      schoolName: String(entry.schoolName || entry.school_name || 'Schoolify Toàn Quốc'),
      className: String(entry.className || `Lớp ${gradeNum}`),
      grade: safeGrade,
      primarySubject: mappedSubject === 'ALL' ? 'MATH' : mappedSubject,
      points: pts,
      correctRate: Math.min(100, Math.round(Number(entry.avgScore || 8.5) * 10)),
      quizzesCompleted: Number(entry.totalExams || 0),
      streakDays: Number(entry.streakDays || 1),
      gems: Number(entry.gems ?? pts),
      badgeTitle: idx < 3 ? 'Chiến Thần Tri Thức' : 'Học Viên Nỗ Lực',
      badgeTier: tier,
    };
  });
}

export default function LeaderboardPage() {
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [timeframe, setTimeframe] = React.useState<LeaderboardTimeframe>('WEEKLY');
  const [grade, setGrade] = React.useState<GradeLevel>('ALL');
  const [subject, setSubject] = React.useState<SubjectFilter>('ALL');
  const [search, setSearch] = React.useState('');
  const [liveUsers, setLiveUsers] = React.useState<LeaderboardUser[] | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const [activeSeason, setActiveSeason] = React.useState<Season>(() =>
    leaderboardService.getActiveSeason()
  );

  const [selectedUser, setSelectedUser] = React.useState<LeaderboardUser | null>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = React.useState(false);
  const [highlightUserId, setHighlightUserId] = React.useState<string | undefined>(undefined);

  const [timeLeft, setTimeLeft] = React.useState(() =>
    computeRemainingTime(activeSeason?.endDate, activeSeason?.status)
  );

  // Tải dữ liệu ban đầu (tránh gọi setState đồng bộ đầu effect theo chuẩn React 19)
  React.useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      const [entries, seasons] = await Promise.all([
        catalogService.getLeaderboard(),
        catalogService.getSeasons(),
      ]);
      if (!mounted) return;
      if (Array.isArray(entries) && entries.length > 0) {
        setLiveUsers(mapLeaderboardEntries(entries as unknown as Record<string, unknown>[]));
      }
      if (Array.isArray(seasons) && seasons.length > 0) {
        const active = seasons.find((s) => s.status === 'ACTIVE') || seasons[0];
        if (active) {
          setActiveSeason(active as Season);
          setTimeLeft(computeRemainingTime(active.endDate, active.status));
        }
      }
    }
    void loadInitial();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefreshFiltersAndData = async () => {
    setSubject('ALL');
    setGrade('ALL');
    setSearch('');
    setHighlightUserId(undefined);
    setIsRefreshing(true);
    try {
      const [entries, seasons] = await Promise.all([
        catalogService.getLeaderboard(),
        catalogService.getSeasons(),
      ]);
      if (Array.isArray(entries) && entries.length > 0) {
        setLiveUsers(mapLeaderboardEntries(entries as unknown as Record<string, unknown>[]));
      }
      if (Array.isArray(seasons) && seasons.length > 0) {
        const active = seasons.find((s) => s.status === 'ACTIVE') || seasons[0];
        if (active) {
          setActiveSeason(active as Season);
          setTimeLeft(computeRemainingTime(active.endDate, active.status));
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // Filtered leaderboard data (chỉ lọc theo Môn, Khối, Tìm kiếm và Chu kỳ)
  const { topThree, restOfUsers, currentUser, nextRankUser, totalCount } = React.useMemo(() => {
    return leaderboardService.getFilteredLeaderboard({
      timeframe,
      scope: 'NATIONAL',
      grade,
      subject,
      search,
      sourceUsers: liveUsers,
      currentAuthUser:
        isAuthenticated && authUser?.id
          ? (() => {
              const authExtra = authUser as unknown as {
                avatarUrl?: string | null;
                gradeLevel?: string | null;
                points?: number;
                student_profile?: { grade_level?: string | null; points?: number };
              };
              return {
                id: authUser.id,
                fullname: authUser.fullname || 'Bạn',
                avatar_url: authUser.avatar_url || authExtra.avatarUrl,
                grade_level: authExtra.student_profile?.grade_level || authExtra.gradeLevel,
                points: authExtra.student_profile?.points ?? authExtra.points ?? 0,
              };
            })()
          : null,
    });
  }, [timeframe, grade, subject, search, liveUsers, isAuthenticated, authUser]);

  const handleScrollToMe = () => {
    if (!currentUser) return;
    setHighlightUserId(currentUser.id);
    const targetId = currentUser.rank <= 3 ? 'leaderboard-podium' : `user-rank-${currentUser.rank}`;
    const element = document.getElementById(targetId) || document.getElementById('leaderboard-podium');
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
        <div
          id="leaderboard-podium"
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md"
        >
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
          grade={grade}
          onGradeChange={setGrade}
          subject={subject}
          onSubjectChange={setSubject}
          search={search}
          onSearchChange={setSearch}
          totalCount={totalCount}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshFiltersAndData}
          isFrozen={activeSeason.isFrozen}
        />

        {/* RANKINGS TABLE */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bảng Đua Top</span>
                <span className="text-xs font-normal text-slate-500">
                  (Tổng {totalCount} thí sinh • Hạng #4 trở đi: {restOfUsers.length})
                </span>
              </h3>
            </div>
            <div className="text-xs text-slate-500">
              Cập nhật mỗi 15 phút
            </div>
          </div>

          <LeaderboardTable
            users={restOfUsers}
            totalCount={totalCount}
            onSelectUser={(user) => setSelectedUser(user)}
            highlightUserId={highlightUserId}
          />
        </div>
      </main>

      {/* ── STICKY USER RANK BAR (Ghim thứ hạng cá nhân) ── */}
      {currentUser && (
        <StickyUserRank
          currentUser={currentUser}
          nextRankUser={nextRankUser}
          totalCount={totalCount}
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
