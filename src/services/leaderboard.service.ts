import {
  LeaderboardUser,
  LeaderboardTimeframe,
  LeaderboardScope,
  GradeLevel,
  SubjectFilter,
  Season,
  SeasonDistributionLog,
  DistributionRecipient,
} from '@/types/leaderboard';
import {
  MOCK_LEADERBOARD_USERS,
  MOCK_SEASONS,
  MOCK_DISTRIBUTION_LOGS,
} from './mock/leaderboard-data';

const SEASONS_STORAGE_KEY = 'schoolify_seasons_data';
const DIST_LOGS_STORAGE_KEY = 'schoolify_season_dist_logs';
const USERS_STORAGE_KEY = 'schoolify_leaderboard_users';

function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const leaderboardService = {
  // --- SEASONS MANAGEMENT ---
  getSeasons(): Season[] {
    return getStoredData<Season[]>(SEASONS_STORAGE_KEY, MOCK_SEASONS);
  },

  getActiveSeason(): Season {
    const seasons = this.getSeasons();
    return seasons.find((s) => s.status === 'ACTIVE') || seasons[0];
  },

  getSeasonById(id: string): Season | undefined {
    const seasons = this.getSeasons();
    return seasons.find((s) => s.id === id);
  },

  createSeason(season: Omit<Season, 'id' | 'totalParticipants' | 'distributionStatus' | 'isFrozen'>): Season {
    const seasons = this.getSeasons();
    const newSeason: Season = {
      ...season,
      id: `season-${Date.now()}`,
      totalParticipants: 0,
      distributionStatus: 'NOT_STARTED',
      isFrozen: false,
    };
    const updated = [newSeason, ...seasons];
    setStoredData(SEASONS_STORAGE_KEY, updated);
    return newSeason;
  },

  updateSeason(id: string, updates: Partial<Season>): Season {
    const seasons = this.getSeasons();
    const index = seasons.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Không tìm thấy mùa giải');

    seasons[index] = { ...seasons[index], ...updates };
    setStoredData(SEASONS_STORAGE_KEY, seasons);
    return seasons[index];
  },

  toggleSeasonFreeze(id: string): Season {
    const seasons = this.getSeasons();
    const season = seasons.find((s) => s.id === id);
    if (!season) throw new Error('Không tìm thấy mùa giải');

    const newFreeze = !season.isFrozen;
    const newStatus = newFreeze ? 'FREEZING' : 'ACTIVE';
    return this.updateSeason(id, {
      isFrozen: newFreeze,
      status: season.status === 'COMPLETED' ? 'COMPLETED' : newStatus,
    });
  },

  // --- REWARD DISTRIBUTION (PHÁT THƯỞNG NGỌC CUỐI MÙA) ---
  getDistributionRecipients(seasonId: string): DistributionRecipient[] {
    const users = this.getUsers();
    const season = this.getSeasonById(seasonId) || this.getActiveSeason();

    return users.slice(0, 50).map((user) => {
      let gemsAwarded = 100;
      let badgeAwarded = 'Chứng Nhận Mùa Giải';

      for (const tier of season.rewards) {
        if (user.rank >= tier.minRank && user.rank <= tier.maxRank) {
          gemsAwarded = tier.gemReward;
          badgeAwarded = tier.badgeName;
          break;
        }
      }

      // Check for suspicious behaviour (Anti-cheat mock check: rate > 98% with unusual completion)
      const isSuspicious = user.rank === 999;

      return {
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        schoolName: user.schoolName,
        className: user.className,
        rank: user.rank,
        points: user.points,
        gemsAwarded,
        badgeAwarded,
        status: isSuspicious ? 'FLAGGED' : 'PENDING',
        flagReason: isSuspicious ? 'Tốc độ nộp bài vượt ngưỡng bình thường' : undefined,
      };
    });
  },

  executeSeasonRewardDistribution(
    seasonId: string,
    adminName: string,
    auditNotes?: string
  ): { log: SeasonDistributionLog; season: Season } {
    const season = this.getSeasonById(seasonId);
    if (!season) throw new Error('Không tìm thấy mùa giải');

    const recipients = this.getDistributionRecipients(seasonId);
    const validRecipients = recipients.filter((r) => r.status !== 'FLAGGED');
    const totalGems = validRecipients.reduce((sum, r) => sum + r.gemsAwarded, 0);

    const log: SeasonDistributionLog = {
      id: `dist-log-${Date.now()}`,
      seasonId: season.id,
      seasonName: season.name,
      seasonCode: season.code,
      settledAt: new Date().toISOString(),
      adminName: adminName || 'Admin Quản Trị Viên',
      adminEmail: 'admin@schoolify.edu.vn',
      totalRecipients: validRecipients.length,
      totalGemsDistributed: totalGems,
      status: 'SUCCESS',
      topWinners: validRecipients.slice(0, 3).map((r) => ({
        rank: r.rank,
        userName: r.userName,
        gemsAwarded: r.gemsAwarded,
        badge: r.badgeAwarded,
      })),
      auditNotes: auditNotes || 'Đã kiểm tra đối soát tự động và chuyển Ngọc trực tiếp vào số dư ví của toàn bộ học sinh đạt chuẩn.',
    };

    // Save log
    const logs = this.getDistributionLogs();
    const updatedLogs = [log, ...logs];
    setStoredData(DIST_LOGS_STORAGE_KEY, updatedLogs);

    // Update season status to COMPLETED
    const updatedSeason = this.updateSeason(seasonId, {
      status: 'COMPLETED',
      settlementDate: new Date().toISOString(),
      distributedGems: totalGems,
      distributionStatus: 'COMPLETED',
      distributedBy: adminName,
    });

    return { log, season: updatedSeason };
  },

  getDistributionLogs(): SeasonDistributionLog[] {
    return getStoredData<SeasonDistributionLog[]>(DIST_LOGS_STORAGE_KEY, MOCK_DISTRIBUTION_LOGS);
  },

  // --- LEADERBOARD RANKINGS ---
  getUsers(): LeaderboardUser[] {
    return getStoredData<LeaderboardUser[]>(USERS_STORAGE_KEY, MOCK_LEADERBOARD_USERS);
  },

  getFilteredLeaderboard(params: {
    timeframe: LeaderboardTimeframe;
    grade: GradeLevel;
    subject: SubjectFilter;
    scope: LeaderboardScope;
    search?: string;
  }): {
    topThree: LeaderboardUser[];
    restOfUsers: LeaderboardUser[];
    currentUser: LeaderboardUser | undefined;
    totalCount: number;
  } {
    let users = [...this.getUsers()];

    // Grade filter
    if (params.grade !== 'ALL') {
      users = users.filter((u) => u.grade === params.grade);
    }

    // Subject filter
    if (params.subject !== 'ALL') {
      users = users.filter((u) => u.primarySubject === params.subject);
    }

    // Scope filter (mock: National = all, School = THPT Chuyên Lê Hồng Phong, Class = 11 Toán 1)
    if (params.scope === 'SCHOOL') {
      users = users.filter((u) => u.schoolName.includes('Lê Hồng Phong'));
    } else if (params.scope === 'CLASS') {
      users = users.filter((u) => u.className.includes('11 Toán 1') || u.className.includes('12 Toán 1'));
    }

    // Search query
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.schoolName.toLowerCase().includes(q) ||
          u.className.toLowerCase().includes(q)
      );
    }

    // Adjust points slightly based on timeframe for realism
    let timeframeUsers = users.map((u, i) => {
      let multiplier = 1;
      if (params.timeframe === 'WEEKLY') multiplier = 0.22;
      else if (params.timeframe === 'MONTHLY') multiplier = 0.65;
      return {
        ...u,
        points: Math.round(u.points * multiplier),
      };
    });

    // Sort by points descending
    timeframeUsers.sort((a, b) => b.points - a.points);

    // Re-rank
    timeframeUsers = timeframeUsers.map((u, idx) => ({
      ...u,
      rank: idx + 1,
    }));

    const topThree = timeframeUsers.slice(0, 3);
    const restOfUsers = timeframeUsers.slice(3);
    const currentUser = timeframeUsers.find((u) => u.isCurrentUser) || this.getCurrentUserMock();

    return {
      topThree,
      restOfUsers,
      currentUser,
      totalCount: timeframeUsers.length,
    };
  },

  getCurrentUserMock(): LeaderboardUser {
    const users = this.getUsers();
    return (
      users.find((u) => u.isCurrentUser) || {
        id: 'current-user-me',
        rank: 42,
        previousRank: 45,
        rankChange: 'UP',
        rankChangeAmount: 3,
        name: 'Nguyễn Văn Minh (Bạn)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        schoolName: 'THPT Chuyên Lê Hồng Phong TP.HCM',
        className: '11 Toán 1',
        grade: 'GRADE_11',
        primarySubject: 'MATH',
        points: 1850,
        correctRate: 86.4,
        quizzesCompleted: 114,
        streakDays: 9,
        gems: 850,
        badgeTitle: 'Ong Vàng Nỗ Lực',
        badgeTier: 'BRONZE',
        isCurrentUser: true,
      }
    );
  },
};
