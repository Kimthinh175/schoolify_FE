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

export interface DiagnosticPromptInfo {
  shouldPrompt: boolean;
  reason: 'FIRST_TIME' | 'INACTIVE_30_DAYS' | null;
  daysSinceLastPractice: number | null;
  thresholdDays: number;
}

export interface ExamPointsBalanceResponse {
  studentProfileId: string;
  currentPoints: number;
  diamonds?: number;
  activePackage?: string;
  dailyAllowance: number;
  dailyXinAllowance?: number;
  hasAi50PercentDiscount?: boolean;
  lastDailyGrantDate: string;
  alreadyClaimedToday?: boolean;
  totalSubmissionsCount?: number;
  lastSubmittedAt?: string | null;
  daysSinceLastPractice?: number | null;
  diagnosticPrompt?: DiagnosticPromptInfo;
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

export function notifyExamPointsUpdated(points?: number, diamonds?: number) {
  if (typeof window === 'undefined') return;
  if (typeof points === 'number') {
    try {
      window.localStorage.setItem('schoolify_user_tokens', String(points));
    } catch {}
  }
  if (typeof diamonds === 'number') {
    try {
      window.localStorage.setItem('schoolify_user_diamonds', String(diamonds));
    } catch {}
  }
  window.dispatchEvent(new CustomEvent('tokens-updated', { detail: { points, diamonds } }));
}

export function getCachedPointsBalance(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('schoolify_user_tokens');
    if (raw === null || raw === '') return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

export function getCachedDiamondsBalance(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('schoolify_user_diamonds');
    if (raw === null || raw === '') return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

export function isDiagnosticPromptSkipped(
  userId?: string | null,
  reason?: 'FIRST_TIME' | 'INACTIVE_30_DAYS' | null,
): boolean {
  if (typeof window === 'undefined' || !reason) return false;
  try {
    const uid = userId || 'guest';
    if (reason === 'FIRST_TIME') {
      return window.localStorage.getItem(`schoolify_diag_skip_first_${uid}`) === '1';
    }
    const monthKey = new Date().toISOString().slice(0, 7);
    return window.localStorage.getItem(`schoolify_diag_skip_inactive_${uid}_${monthKey}`) === '1';
  } catch {
    return false;
  }
}

export function markDiagnosticPromptSkipped(
  userId?: string | null,
  reason?: 'FIRST_TIME' | 'INACTIVE_30_DAYS' | null,
) {
  if (typeof window === 'undefined' || !reason) return;
  try {
    const uid = userId || 'guest';
    if (reason === 'FIRST_TIME') {
      window.localStorage.setItem(`schoolify_diag_skip_first_${uid}`, '1');
    } else {
      const monthKey = new Date().toISOString().slice(0, 7);
      window.localStorage.setItem(`schoolify_diag_skip_inactive_${uid}_${monthKey}`, '1');
    }
  } catch {}
}

export function getExamLevelCost(rawLevel?: string): {
  code: 'BASIC' | 'MEDIUM' | 'ADVANCED';
  label: string;
  costPoints: number;
} {
  const norm = String(rawLevel || 'BASIC')
    .trim()
    .toUpperCase();

  if (
    norm.includes('ASSESSMENT') ||
    norm.includes('DIAGNOSTIC') ||
    norm.includes('DANH_GIA') ||
    norm.includes('ĐÁNH GIÁ')
  ) {
    return {
      code: 'BASIC',
      label: 'Đánh giá năng lực',
      costPoints: 0,
    };
  }

  if (
    norm.includes('NATIONAL') ||
    norm.includes('QUOC_GIA') ||
    norm.includes('OLYMPIAD') ||
    norm.includes('HSG') ||
    norm.includes('PROVINCIAL') ||
    norm.includes('TINH') ||
    norm.includes('DGNL') ||
    norm.includes('DGTD') ||
    norm.includes('ADVANCED') ||
    norm.includes('HARD') ||
    norm.includes('VERY_HARD') ||
    norm.includes('GIOI') ||
    norm.includes('EXCELLENT') ||
    norm.includes('VAN_DUNG')
  ) {
    return {
      code: 'ADVANCED',
      label: 'Nâng cao / HSG',
      costPoints: 9,
    };
  }

  if (
    norm.includes('MEDIUM') ||
    norm.includes('INTERMEDIATE') ||
    norm.includes('TRUNG_BINH') ||
    norm.includes('THONG_HIEU') ||
    norm.includes('MOCK')
  ) {
    return {
      code: 'MEDIUM',
      label: 'Trung bình / Thi thử',
      costPoints: 4,
    };
  }

  return {
    code: 'BASIC',
    label: 'Cơ bản',
    costPoints: 3,
  };
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
        credentials: 'include',
        cache: 'no-store',
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        if (typeof window !== 'undefined') {
          try {
            if (typeof json.data.currentPoints === 'number') {
              window.localStorage.setItem('schoolify_user_tokens', String(json.data.currentPoints));
            }
            if (typeof json.data.diamonds === 'number') {
              window.localStorage.setItem('schoolify_user_diamonds', String(json.data.diamonds));
            }
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
      credentials: 'include',
      body: JSON.stringify({
        userId: effectiveUserId,
        forceReset: params?.forceReset ?? false,
      }),
    });
    const json = await res.json();
    if (json?.data?.currentPoints !== undefined) {
      notifyExamPointsUpdated(json.data.currentPoints, json.data.diamonds);
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
    useDiamonds?: boolean;
  }) {
    const headers = getAuthHeaders();
    const effectiveUserId = payload.userId || headers['x-user-id'] || undefined;
    const res = await fetch('/api/v1/exams/points/start-exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: effectiveUserId,
        level: payload.level,
        examTitle: payload.examTitle,
        subjectSlug: payload.subjectSlug,
        grade: payload.grade,
        chapterId: payload.chapterId,
        useDiamonds: payload.useDiamonds,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (json?.data?.currentPoints !== undefined || json?.data?.diamonds !== undefined) {
      notifyExamPointsUpdated(json.data.currentPoints, json.data.diamonds);
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
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        userId: effectiveUserId,
      }),
    });
    const json = await res.json();
    if (res.ok && (json?.data?.currentPoints !== undefined || json?.data?.diamonds !== undefined)) {
      notifyExamPointsUpdated(json.data.currentPoints, json.data.diamonds);
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
        credentials: 'include',
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

  /**
   * Dành cho ADMIN: Điều chỉnh trực tiếp số điểm Tia Sáng & Ngọc Tri Thức
   */
  async adminAdjustPoints(payload: {
    userId?: string;
    examPoints?: number;
    diamonds?: number;
    note?: string;
  }): Promise<{ ok: boolean; message?: string; data?: any }> {
    const headers = getAuthHeaders();
    const effectiveUserId = payload.userId || headers['x-user-id'] || undefined;
    const res = await fetch('/api/v1/exams/points/admin-adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        userId: effectiveUserId,
      }),
    });
    const json = await res.json().catch(() => ({}));
    const currentAuthUserId = headers['x-user-id'];
    const isAdjustingSelf = !payload.userId || payload.userId === currentAuthUserId;
    if (
      isAdjustingSelf &&
      (json?.data?.currentPoints !== undefined || json?.data?.diamonds !== undefined)
    ) {
      notifyExamPointsUpdated(json?.data?.currentPoints, json?.data?.diamonds);
    }
    return { ok: res.ok, ...json };
  },
};
