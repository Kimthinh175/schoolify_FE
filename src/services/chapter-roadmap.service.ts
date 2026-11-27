import { getGuestOnboarding, clearGuestOnboarding } from '@/lib/semester-utils';

export type CurriculumTrackCode = 'TOAN_SO' | 'TOAN_HINH' | 'DEFAULT';

export type RoadmapDifficultyLevel = 'BASIC' | 'MEDIUM' | 'ADVANCED';

export interface ChapterLevelStatus {
  unlocked: boolean;
  unlockedManually?: boolean;
  completed: boolean;
  bestScore: number | null;
  costPoints: number;
}

export interface ChapterRoadmapNode {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  sgkLabel: string;
  description: string;
  semester: 1 | 2;
  track: CurriculumTrackCode;
  trackLabel: string;
  trackOrder: number;
  isUnlocked: boolean;
  unlockedManually: boolean;
  isCurrentSemester: boolean;
  isFrontier: boolean;
  crownsEarned: number;
  maxCrowns: number;
  attemptsCount: number;
  lastPracticedAt: string | null;
  levels: {
    BASIC: ChapterLevelStatus;
    MEDIUM: ChapterLevelStatus;
    ADVANCED: ChapterLevelStatus;
  };
}

export interface ChapterRoadmapTrack {
  trackCode: CurriculumTrackCode;
  trackTitle: string;
  shortTitle: string;
  frontierChapterId: number | null;
  frontierByLevel?: {
    BASIC: number | null;
    MEDIUM: number | null;
    ADVANCED: number | null;
  };
  totalChapters: number;
  completedBasicCount: number;
  completedMediumCount?: number;
  completedAdvancedCount?: number;
  totalCrowns: number;
  maxCrowns: number;
  chapters: ChapterRoadmapNode[];
}

export interface DiagnosticStatusInfo {
  subject: string;
  grade: number;
  isAuthenticated: boolean;
  isPrivileged: boolean;
  diagnosticCompleted: boolean;
  diagnosticRequired: boolean;
  diagnosticResult: {
    assignedLevel: string;
    overallScore: number;
    trackScores?: Record<string, number>;
    bloomBreakdown?: Record<string, { correct: number; total: number }>;
    completedAt?: string;
  } | null;
}

export interface ChapterRoadmapResponse {
  subject: string;
  hasDualMathTracks: boolean;
  grade: 10 | 11 | 12;
  savedStudentGrade: 10 | 11 | 12 | null;
  needsGradeOnboarding: boolean;
  isAuthenticated: boolean;
  diagnosticStatus?: DiagnosticStatusInfo;
  semesterInfo: {
    semester: 1 | 2;
    isSummerReview: boolean;
    label: string;
    shortLabel: string;
    schoolYear: string;
    description: string;
  };
  summary: {
    totalCrowns: number;
    maxCrowns: number;
    totalChapters: number;
  };
  tracks: ChapterRoadmapTrack[];
}

export interface ChapterProgressUpdatePayload {
  isGuestTrial: boolean;
  subject: string;
  grade: number;
  chapterId: number;
  chapterName: string;
  shortName: string;
  track: CurriculumTrackCode;
  trackLabel: string;
  levelCompleted: 'BASIC' | 'MEDIUM' | 'ADVANCED';
  score: number;
  passed: boolean;
  crownsEarned: number;
  basicCompleted: boolean;
  mediumCompleted: boolean;
  advancedCompleted: boolean;
  unlockedNextLevel: 'MEDIUM' | 'ADVANCED' | null;
  nextChapterInTrack: {
    id: number;
    name: string;
    shortName: string;
    track: CurriculumTrackCode;
    trackLabel: string;
    semester: 1 | 2;
  } | null;
}

export const CHAPTER_ROADMAP_UPDATED_EVENT = 'schoolify-chapter-roadmap-updated';

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

/**
 * Phủ tiến độ làm thử của Khách (từ localStorage) lên bản đồ chương khi chưa đăng nhập
 */
function overlayGuestProgressOnRoadmap(
  data: ChapterRoadmapResponse,
): ChapterRoadmapResponse {
  if (data.isAuthenticated) return data;
  const guest = getGuestOnboarding();
  if (!guest) return data;

  const diagKey = `${(data.subject || 'toan-hoc').trim().toLowerCase()}::${data.grade}`;
  const guestDiag = guest.completedDiagnostics?.[diagKey] || null;

  const nextTracks = data.tracks.map((track) => {
    const firstNode = track.chapters[0];
    const firstKey = firstNode ? `${data.subject}::${data.grade}::${firstNode.id}` : '';
    const firstProg = firstKey ? guest.completedChapters?.[firstKey] : null;
    const firstBasicDone = Boolean(
      firstNode?.levels.BASIC.completed || firstProg?.basicCompleted,
    );
    const firstMediumDone = Boolean(
      firstNode?.levels.MEDIUM.completed || firstProg?.mediumCompleted,
    );

    const trackDiagScore = guestDiag
      ? Number(
          guestDiag.trackScores?.[track.trackCode] ??
            guestDiag.trackScores?.DEFAULT ??
            guestDiag.overallScore ??
            0,
        )
      : 0;
    const diagUnlockMedium = Boolean(guestDiag && trackDiagScore >= 5.0);
    const diagUnlockAdvanced = Boolean(guestDiag && trackDiagScore >= 8.0);

    const updatedChapters = track.chapters.map((node, idx, arr) => {
      const key = `${data.subject}::${data.grade}::${node.id}`;
      const localProg = guest.completedChapters?.[key];
      const prevNode = idx > 0 ? arr[idx - 1] : null;
      const prevKey = prevNode ? `${data.subject}::${data.grade}::${prevNode.id}` : '';
      const prevProg = prevKey ? guest.completedChapters?.[prevKey] : null;

      const basicCompleted = Boolean(node.levels.BASIC.completed || localProg?.basicCompleted);
      const mediumCompleted = Boolean(node.levels.MEDIUM.completed || localProg?.mediumCompleted);
      const advancedCompleted = Boolean(
        node.levels.ADVANCED.completed || localProg?.advancedCompleted,
      );

      const prevBasicCompleted = Boolean(
        prevNode?.levels.BASIC.completed || prevProg?.basicCompleted,
      );
      const prevMediumCompleted = Boolean(
        prevNode?.levels.MEDIUM.completed || prevProg?.mediumCompleted,
      );
      const prevAdvancedCompleted = Boolean(
        prevNode?.levels.ADVANCED.completed || prevProg?.advancedCompleted,
      );

      const inDiagUnlockWindow =
        data.semesterInfo?.semester === 2 || node.semester === 1 || node.trackOrder === 1;

      const basicUnlocked = Boolean(
        node.levels.BASIC.unlocked || basicCompleted || prevBasicCompleted,
      );
      const mediumUnlocked = Boolean(
        node.levels.MEDIUM.unlocked ||
          mediumCompleted ||
          (diagUnlockMedium && inDiagUnlockWindow) ||
          (idx === 0 && firstBasicDone) ||
          (idx > 0 && prevMediumCompleted),
      );
      const advancedUnlocked = Boolean(
        node.levels.ADVANCED.unlocked ||
          advancedCompleted ||
          (diagUnlockAdvanced && inDiagUnlockWindow) ||
          (idx === 0 && firstMediumDone) ||
          (idx > 0 && prevAdvancedCompleted),
      );

      const crownsEarned =
        (basicCompleted ? 1 : 0) +
        (mediumCompleted ? 1 : 0) +
        (advancedCompleted ? 1 : 0);

      return {
        ...node,
        isUnlocked: basicUnlocked,
        crownsEarned,
        levels: {
          BASIC: {
            ...node.levels.BASIC,
            unlocked: basicUnlocked,
            completed: basicCompleted,
            bestScore: localProg?.basicBestScore || node.levels.BASIC.bestScore,
          },
          MEDIUM: {
            ...node.levels.MEDIUM,
            unlocked: mediumUnlocked,
            completed: mediumCompleted,
            bestScore: localProg?.mediumBestScore || node.levels.MEDIUM.bestScore,
          },
          ADVANCED: {
            ...node.levels.ADVANCED,
            unlocked: advancedUnlocked,
            completed: advancedCompleted,
            bestScore: localProg?.advancedBestScore || node.levels.ADVANCED.bestScore,
          },
        },
      };
    });

    const resolveFrontier = (lvl: RoadmapDifficultyLevel): number | null => {
      const f =
        updatedChapters.find(
          (n) =>
            n.levels[lvl].unlocked && n.isCurrentSemester && !n.levels[lvl].completed,
        ) ||
        updatedChapters.find((n) => n.levels[lvl].unlocked && !n.levels[lvl].completed) ||
        [...updatedChapters].reverse().find((n) => n.levels[lvl].unlocked) ||
        updatedChapters[0];
      return f?.id || null;
    };

    const frontierByLevel = {
      BASIC: resolveFrontier('BASIC'),
      MEDIUM: resolveFrontier('MEDIUM'),
      ADVANCED: resolveFrontier('ADVANCED'),
    };

    const withFrontier = updatedChapters.map((n) => ({
      ...n,
      isFrontier: n.id === frontierByLevel.BASIC,
    }));

    return {
      ...track,
      frontierChapterId: frontierByLevel.BASIC,
      frontierByLevel,
      completedBasicCount: withFrontier.filter((n) => n.levels.BASIC.completed).length,
      completedMediumCount: withFrontier.filter((n) => n.levels.MEDIUM.completed).length,
      completedAdvancedCount: withFrontier.filter((n) => n.levels.ADVANCED.completed).length,
      totalCrowns: withFrontier.reduce((s, n) => s + n.crownsEarned, 0),
      chapters: withFrontier,
    };
  });

  return {
    ...data,
    diagnosticStatus: guestDiag
      ? {
          subject: data.subject,
          grade: data.grade,
          isAuthenticated: false,
          isPrivileged: false,
          diagnosticCompleted: true,
          diagnosticRequired: false,
          diagnosticResult: {
            assignedLevel: guestDiag.assignedLevel,
            overallScore: guestDiag.overallScore,
            trackScores: guestDiag.trackScores,
            bloomBreakdown: guestDiag.bloomBreakdown,
            completedAt: guestDiag.completedAt,
          },
        }
      : data.diagnosticStatus,
    summary: {
      ...data.summary,
      totalCrowns: nextTracks.reduce((s, t) => s + t.totalCrowns, 0),
    },
    tracks: nextTracks,
  };
}

export const chapterRoadmapService = {
  notifyUpdated() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CHAPTER_ROADMAP_UPDATED_EVENT));
    }
  },

  async getDiagnosticStatus(
    subjectSlug: string,
    grade?: number,
  ): Promise<DiagnosticStatusInfo | null> {
    const normalizedSubject = (subjectSlug || 'toan-hoc').trim().toLowerCase();
    const safeGrade =
      grade && [10, 11, 12].includes(Number(grade)) ? Number(grade) : 12;

    try {
      const qs = new URLSearchParams();
      qs.set('subject', normalizedSubject);
      qs.set('grade', String(safeGrade));

      const res = await fetch(`/api/v1/exams/diagnostic-status?${qs.toString()}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
        },
        cache: 'no-store',
      });

      if (!res.ok) return null;
      const json = await res.json();
      const raw: DiagnosticStatusInfo | null = json?.data || null;
      if (!raw) return null;

      if (!raw.isAuthenticated && !raw.isPrivileged) {
        const guest = getGuestOnboarding();
        const diagKey = `${normalizedSubject}::${safeGrade}`;
        const guestDiag = guest?.completedDiagnostics?.[diagKey];
        if (guestDiag) {
          return {
            ...raw,
            diagnosticCompleted: true,
            diagnosticRequired: false,
            diagnosticResult: {
              assignedLevel: guestDiag.assignedLevel,
              overallScore: guestDiag.overallScore,
              trackScores: guestDiag.trackScores,
              bloomBreakdown: guestDiag.bloomBreakdown,
              completedAt: guestDiag.completedAt,
            },
          };
        }
      }
      return raw;
    } catch (err) {
      console.warn('[chapterRoadmapService.getDiagnosticStatus] Error:', err);
      return null;
    }
  },

  async getChapterRoadmap(
    subjectSlug: string,
    grade?: number,
  ): Promise<ChapterRoadmapResponse | null> {
    try {
      const qs = new URLSearchParams();
      qs.set('subject', subjectSlug || 'toan-hoc');
      if (grade && [10, 11, 12].includes(Number(grade))) {
        qs.set('grade', String(grade));
      }

      const res = await fetch(`/api/v1/exams/chapter-roadmap?${qs.toString()}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
        },
        cache: 'no-store',
      });

      if (!res.ok) return null;
      const json = await res.json();
      const raw: ChapterRoadmapResponse | null = json?.data || null;
      if (!raw) return null;
      return overlayGuestProgressOnRoadmap(raw);
    } catch (err) {
      console.warn('[chapterRoadmapService.getChapterRoadmap] Error:', err);
      return null;
    }
  },

  async unlockChapterJump(params: {
    subject: string;
    grade: number;
    chapterId: number;
    level?: RoadmapDifficultyLevel;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/exams/chapter-roadmap/jump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) return false;
      this.notifyUpdated();
      return true;
    } catch {
      return false;
    }
  },

  async syncGuestOnboarding(): Promise<boolean> {
    const guest = getGuestOnboarding();
    if (!guest) return false;

    const headers = getAuthHeaders();
    if (!headers.Authorization && !headers['x-user-id']) return false;

    const completedChapters: Array<{
      subject: string;
      grade: number;
      chapterId: number;
      level: string;
      score: number;
    }> = [];

    for (const entry of Object.values(guest.completedChapters || {})) {
      if (entry.basicCompleted || entry.basicBestScore > 0) {
        completedChapters.push({
          subject: entry.subjectSlug,
          grade: entry.grade,
          chapterId: entry.chapterId,
          level: 'BASIC',
          score: entry.basicBestScore,
        });
      }
      if (entry.mediumCompleted || entry.mediumBestScore > 0) {
        completedChapters.push({
          subject: entry.subjectSlug,
          grade: entry.grade,
          chapterId: entry.chapterId,
          level: 'MEDIUM',
          score: entry.mediumBestScore,
        });
      }
      if (entry.advancedCompleted || entry.advancedBestScore > 0) {
        completedChapters.push({
          subject: entry.subjectSlug,
          grade: entry.grade,
          chapterId: entry.chapterId,
          level: 'ADVANCED',
          score: entry.advancedBestScore,
        });
      }
    }

    const completedDiagnostics = Object.values(guest.completedDiagnostics || {});

    try {
      const res = await fetch('/api/v1/exams/sync-guest-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          fullname: guest.fullname,
          grade: guest.grade,
          semester: guest.semester,
          completedChapters,
          completedDiagnostics,
          pendingTrialSubmission: guest.pendingTrialSubmission || undefined,
        }),
      });

      if (res.ok) {
        clearGuestOnboarding();
        this.notifyUpdated();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};
