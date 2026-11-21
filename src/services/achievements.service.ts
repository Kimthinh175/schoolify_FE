export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  ruleType: string;
  threshold: number;
  rewardDiamonds: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementSummary {
  total: number;
  unlockedCount: number;
  totalRewardDiamonds: number;
}

export interface AchievementsResponse {
  items: AchievementItem[];
  summary: AchievementSummary;
}

export const achievementsService = {
  async getMyAchievements(): Promise<AchievementsResponse> {
    try {
      const res = await fetch('/api/v1/achievements/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch {
      // fallback to public catalog
    }

    try {
      const res = await fetch('/api/v1/achievements', {
        method: 'GET',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch {
      // ignore
    }

    return {
      items: [],
      summary: { total: 0, unlockedCount: 0, totalRewardDiamonds: 0 },
    };
  },
};
