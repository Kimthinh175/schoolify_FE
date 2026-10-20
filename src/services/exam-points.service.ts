export interface ExamPointsQuotaItem {
  code: 'BASIC' | 'MEDIUM' | 'ADVANCED';
  label: string;
  costPoints: number;
  canStart: boolean;
  maxExamsAvailable: number;
}

export interface ExamPointLogItem {
  id: string;
  actionType: string;
  examLevel?: string | null;
  examTitle?: string | null;
  submissionId?: string | null;
  examScore?: number | null;
  pointsBefore: number;
  pointsDelta: number;
  pointsAfter: number;
  note?: string | null;
  createdAt: string;
}

export interface ExamPointsBalanceResponse {
  studentProfileId: string;
  currentPoints: number;
  diamonds?: number;
  dailyAllowance: number;
  lastDailyGrantDate: string;
  alreadyClaimedToday?: boolean;
  quotaByLevel: {
    BASIC: ExamPointsQuotaItem;
    MEDIUM: ExamPointsQuotaItem;
    ADVANCED: ExamPointsQuotaItem;
  };
  todaySummary: {
    date: string;
    examsStartedToday: number;
    pointsSpentToday: number;
    pointsRewardedToday: number;
    pointsPenalizedToday: number;
  };
  recentLogs: ExamPointLogItem[];
  rules: any;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('schoolify-auth-storage');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const state = parsed?.state || {};
    const token = state.token || '';
    const userId = state.user?.id || '';
    const role = state.currentRole || state.user?.role || 'STUDENT';
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': String(userId) } : {}),
      ...(role ? { 'x-user-role': String(role) } : {}),
    };
  } catch {
    return {};
  }
}

export function notifyExamPointsUpdated(points?: number) {
  if (typeof window === 'undefined') return;
  if (typeof points === 'number') {
    try {
      window.localStorage.setItem('schoolify_user_tokens', String(points));
    } catch {}
  }
  window.dispatchEvent(new CustomEvent('tokens-updated', { detail: { points } }));
}

export const examPointsService = {
  async getBalance(userId?: string): Promise<ExamPointsBalanceResponse | null> {
    try {
      const headers = getAuthHeaders();
      const effectiveUserId = userId || headers['x-user-id'] || '';
      const query = effectiveUserId ? `?userId=${encodeURIComponent(effectiveUserId)}` : '';
      const res = await fetch(`/api/v1/exams/points/balance${query}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        if (typeof window !== 'undefined' && typeof json.data.currentPoints === 'number') {
          try {
            window.localStorage.setItem('schoolify_user_tokens', String(json.data.currentPoints));
          } catch {}
        }
        return json.data as ExamPointsBalanceResponse;
      }
      return null;
    } catch (err) {
      console.warn('[examPointsService.getBalance] Failed:', err);
      return null;
    }
  },

  async claimDailyPoints(params?: { userId?: string; forceReset?: boolean }) {
    const headers = getAuthHeaders();
    const effectiveUserId = params?.userId || headers['x-user-id'] || undefined;
    const res = await fetch('/api/v1/exams/points/daily-claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        userId: effectiveUserId,
        forceReset: params?.forceReset ?? false,
      }),
    });
    const json = await res.json();
    if (json?.data?.currentPoints !== undefined) {
      notifyExamPointsUpdated(json.data.currentPoints);
    }
    return json;
  },

  async startExamWithPoints(payload: {
    userId?: string;
    level: string;
    examTitle?: string;
    subjectSlug?: string;
    grade?: number;
    chapterId?: number;
  }) {
    const headers = getAuthHeaders();
    const effectiveUserId = payload.userId || headers['x-user-id'] || undefined;
    const res = await fetch('/api/v1/exams/points/start-exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        ...payload,
        userId: effectiveUserId,
      }),
    });
    const json = await res.json();
    if (res.ok && json?.data?.currentPoints !== undefined) {
      notifyExamPointsUpdated(json.data.currentPoints);
    }
    return { ok: res.ok, status: res.status, ...json };
  },

  async settleSubmissionPoints(payload: {
    userId?: string;
    score: number;
    level?: string;
    examTitle?: string;
    submissionId?: string;
    deductEntryCost?: boolean;
  }) {
    const headers = getAuthHeaders();
    const effectiveUserId = payload.userId || headers['x-user-id'] || undefined;
    const res = await fetch('/api/v1/exams/points/settle-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        ...payload,
        userId: effectiveUserId,
      }),
    });
    const json = await res.json();
    if (res.ok && json?.data?.currentPoints !== undefined) {
      notifyExamPointsUpdated(json.data.currentPoints);
    }
    return { ok: res.ok, status: res.status, ...json };
  },

  async getHistory(params?: {
    userId?: string;
    page?: number;
    limit?: number;
    actionType?: string;
  }): Promise<{
    currentPoints: number;
    dailyAllowance: number;
    items: ExamPointLogItem[];
    pagination: { totalItems: number; page: number; limit: number; totalPages: number };
  } | null> {
    try {
      const headers = getAuthHeaders();
      const effectiveUserId = params?.userId || headers['x-user-id'] || '';
      const searchParams = new URLSearchParams();
      if (effectiveUserId) searchParams.set('userId', effectiveUserId);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.actionType) searchParams.set('actionType', params.actionType);

      const res = await fetch(`/api/v1/exams/points/history?${searchParams.toString()}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.warn('[examPointsService.getHistory] Failed:', err);
      return null;
    }
  },
};
