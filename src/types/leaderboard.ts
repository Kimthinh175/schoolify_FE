export type LeaderboardTimeframe = 'WEEKLY' | 'MONTHLY' | 'SEASON';

export type LeaderboardScope = 'NATIONAL' | 'SCHOOL' | 'CLASS';

export type GradeLevel =
  | 'ALL'
  | 'GRADE_1'
  | 'GRADE_2'
  | 'GRADE_3'
  | 'GRADE_4'
  | 'GRADE_5'
  | 'GRADE_6'
  | 'GRADE_7'
  | 'GRADE_8'
  | 'GRADE_9'
  | 'GRADE_10'
  | 'GRADE_11'
  | 'GRADE_12';

export type SubjectFilter =
  | 'ALL'
  | 'MATH'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'ENGLISH'
  | 'BIOLOGY'
  | 'LITERATURE'
  | 'INFORMATICS';

export type RankTier = 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

export type RankChangeType = 'UP' | 'DOWN' | 'SAME' | 'NEW';

export interface LeaderboardUser {
  id: string;
  rank: number;
  previousRank: number;
  rankChange: RankChangeType;
  rankChangeAmount: number;
  name: string;
  avatar: string;
  schoolName: string;
  className: string;
  grade: GradeLevel;
  primarySubject: SubjectFilter;
  points: number; // EXP / Ranking Points (RP)
  correctRate: number; // percentage, e.g. 96
  quizzesCompleted: number;
  streakDays: number;
  gems: number;
  badgeTitle: string;
  badgeTier: RankTier;
  isCurrentUser?: boolean;
}

export interface SeasonRewardTier {
  id: string;
  tierRank: string; // e.g. "Hạng 1", "Hạng 2 - 3", "Top 4 - 10", "Top 11 - 50", "Top 51 - 100"
  minRank: number;
  maxRank: number;
  gemReward: number;
  badgeName: string;
  titleName: string;
  frameUrl?: string;
  voucherDiscountPct?: number;
  description: string;
}

export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'FREEZING' | 'COMPLETED';

export interface Season {
  id: string;
  code: string; // e.g. "SS-2025-Q1"
  name: string; // e.g. "Mùa 1: Thức Tỉnh Tri Thức 2025 - 2026"
  description: string;
  status: SeasonStatus;
  startDate: string; // ISO
  endDate: string; // ISO
  freezeDate?: string; // 24h before end date
  totalParticipants: number;
  totalGemsPool: number;
  isFrozen: boolean;
  scoringMultiplier: number; // e.g. 1.2x points for semester exam
  rules: string[];
  rewards: SeasonRewardTier[];
  settlementDate?: string;
  distributedGems?: number;
  distributionStatus?: 'NOT_STARTED' | 'PROCESSING' | 'COMPLETED';
  distributedBy?: string;
}

export interface DistributionRecipient {
  userId: string;
  userName: string;
  avatar: string;
  schoolName: string;
  className: string;
  rank: number;
  points: number;
  gemsAwarded: number;
  badgeAwarded: string;
  status: 'PENDING' | 'AWARDED' | 'FLAGGED';
  flagReason?: string;
}

export interface SeasonDistributionLog {
  id: string;
  seasonId: string;
  seasonName: string;
  seasonCode: string;
  settledAt: string;
  adminName: string;
  adminEmail: string;
  totalRecipients: number;
  totalGemsDistributed: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  topWinners: {
    rank: number;
    userName: string;
    gemsAwarded: number;
    badge: string;
  }[];
  auditNotes?: string;
}
