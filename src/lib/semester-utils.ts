export type SchoolSemester = 1 | 2;

export interface RealTimeSemesterInfo {
  semester: SchoolSemester;
  isSummer: boolean;
  label: string;
  shortLabel: string;
  schoolYear: string;
  badgeText: string;
  description: string;
}

export interface GuestOnboardingState {
  fullname: string;
  grade: 10 | 11 | 12;
  semester: SchoolSemester;
  schoolYear: string;
  trialUsedCount: number;
  createdAt: string;
  completedChapters: Record<
    string,
    {
      subjectSlug: string;
      grade: number;
      track: string;
      chapterId: number;
      basicCompleted: boolean;
      basicBestScore: number;
      mediumCompleted: boolean;
      mediumBestScore: number;
      advancedCompleted: boolean;
      advancedBestScore: number;
      crownsEarned: number;
    }
  >;
  pendingTrialSubmission?: any | null;
}

export const GUEST_ONBOARDING_STORAGE_KEY = 'schoolify_guest_onboarding_v1';

/**
 * Tự động tính Học kỳ & Năm học theo thời gian thực tại Việt Nam (Asia/Ho_Chi_Minh):
 * - Học kỳ 1 (HK1): 01/09 -> 15/01 năm kế tiếp
 * - Học kỳ 2 (HK2): 16/01 -> 31/05
 * - Ôn tập Hè (SUMMER): 01/06 -> 31/08 (mặc định mở theo HK1 năm học mới)
 */
export function getCurrentSchoolSemester(now: Date = new Date()): RealTimeSemesterInfo {
  // Chuyển sang giờ Việt Nam UTC+7
  const vnTime = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000);
  const year = vnTime.getFullYear();
  const month = vnTime.getMonth() + 1; // 1..12
  const day = vnTime.getDate();

  // HK1: Tháng 9..12 (năm Y -> năm học Y - Y+1) hoặc 01/01..15/01 (năm Y -> năm học Y-1 - Y)
  if (month >= 9) {
    const schoolYear = `${year} – ${year + 1}`;
    return {
      semester: 1,
      isSummer: false,
      label: 'Học kỳ 1',
      shortLabel: 'HK1',
      schoolYear,
      badgeText: `Học kỳ 1 · Năm học ${schoolYear}`,
      description: 'Tự động đồng bộ theo thời gian năm học thực tế trên trường.',
    };
  }

  if (month === 1 && day <= 15) {
    const schoolYear = `${year - 1} – ${year}`;
    return {
      semester: 1,
      isSummer: false,
      label: 'Học kỳ 1',
      shortLabel: 'HK1',
      schoolYear,
      badgeText: `Cuối Học kỳ 1 · Năm học ${schoolYear}`,
      description: 'Giai đoạn ôn thi cuối Học kỳ 1 theo lịch năm học thực tế.',
    };
  }

  // HK2: 16/01 -> 31/05 (năm Y -> năm học Y-1 - Y)
  if (month >= 1 && month <= 5) {
    const schoolYear = `${year - 1} – ${year}`;
    return {
      semester: 2,
      isSummer: false,
      label: 'Học kỳ 2',
      shortLabel: 'HK2',
      schoolYear,
      badgeText: `Học kỳ 2 · Năm học ${schoolYear}`,
      description: 'Tự động mở sẵn các chương Học kỳ 2 để bám sát bài học trên lớp.',
    };
  }

  // Hè: Tháng 6..8 -> Chuẩn bị năm học mới (HK1)
  const schoolYear = `${year} – ${year + 1}`;
  return {
    semester: 1,
    isSummer: true,
    label: 'Học kỳ 1 (Xuất phát sớm)',
    shortLabel: 'Hè / HK1',
    schoolYear,
    badgeText: `Ôn tập Hè · Xuất phát sớm ${schoolYear}`,
    description: 'Giai đoạn hè ôn tập nền tảng và xuất phát sớm Học kỳ 1 năm học mới.',
  };
}

/**
 * Chuẩn hóa chuỗi grade_level từ DB ("Lớp 10", "11", "Khối 12"...) về số 10 | 11 | 12 | null
 */
export function parseHighSchoolGrade(raw?: string | number | null): 10 | 11 | 12 | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    if (raw === 10 || raw === 11 || raw === 12) return raw;
    return null;
  }
  const str = String(raw).trim();
  if (!str) return null;
  const match = str.match(/\b(10|11|12)\b/);
  if (!match) return null;
  const num = Number(match[1]);
  if (num === 10 || num === 11 || num === 12) return num;
  return null;
}

export function formatGradeLabel(grade: number): string {
  return `Lớp ${grade}`;
}

export function getGuestOnboarding(): GuestOnboardingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GUEST_ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.fullname || ![10, 11, 12].includes(Number(parsed.grade))) {
      return null;
    }
    return {
      ...parsed,
      grade: Number(parsed.grade) as 10 | 11 | 12,
      trialUsedCount: Number(parsed.trialUsedCount || 0),
      completedChapters: parsed.completedChapters || {},
    };
  } catch {
    return null;
  }
}

export function saveGuestOnboarding(data: Partial<GuestOnboardingState> & { fullname: string; grade: 10 | 11 | 12 }): GuestOnboardingState {
  const sem = getCurrentSchoolSemester();
  const existing = getGuestOnboarding();
  const next: GuestOnboardingState = {
    fullname: data.fullname.trim(),
    grade: data.grade,
    semester: data.semester || sem.semester,
    schoolYear: data.schoolYear || sem.schoolYear,
    trialUsedCount: data.trialUsedCount ?? existing?.trialUsedCount ?? 0,
    createdAt: existing?.createdAt || new Date().toISOString(),
    completedChapters: data.completedChapters ?? existing?.completedChapters ?? {},
    pendingTrialSubmission:
      data.pendingTrialSubmission !== undefined
        ? data.pendingTrialSubmission
        : existing?.pendingTrialSubmission ?? null,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GUEST_ONBOARDING_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('schoolify-guest-onboarding-updated'));
    } catch {}
  }
  return next;
}

export function recordGuestChapterCompletion(params: {
  subjectSlug: string;
  grade: number;
  track: string;
  chapterId: number;
  level: string;
  score: number;
  submissionPayload?: any;
}) {
  const existing = getGuestOnboarding();
  if (!existing) return null;

  const key = `${params.subjectSlug}::${params.grade}::${params.chapterId}`;
  const prev = existing.completedChapters[key] || {
    subjectSlug: params.subjectSlug,
    grade: params.grade,
    track: params.track || 'DEFAULT',
    chapterId: params.chapterId,
    basicCompleted: false,
    basicBestScore: 0,
    mediumCompleted: false,
    mediumBestScore: 0,
    advancedCompleted: false,
    advancedBestScore: 0,
    crownsEarned: 0,
  };

  const passed = params.score >= 5.0;
  const lvl = String(params.level || 'BASIC').toUpperCase();

  const updatedEntry = { ...prev };
  if (lvl === 'BASIC') {
    updatedEntry.basicBestScore = Math.max(prev.basicBestScore, params.score);
    if (passed) updatedEntry.basicCompleted = true;
  } else if (lvl === 'MEDIUM') {
    updatedEntry.mediumBestScore = Math.max(prev.mediumBestScore, params.score);
    if (passed) updatedEntry.mediumCompleted = true;
  } else if (lvl === 'ADVANCED') {
    updatedEntry.advancedBestScore = Math.max(prev.advancedBestScore, params.score);
    if (passed) updatedEntry.advancedCompleted = true;
  }

  updatedEntry.crownsEarned =
    (updatedEntry.basicCompleted ? 1 : 0) +
    (updatedEntry.mediumCompleted ? 1 : 0) +
    (updatedEntry.advancedCompleted ? 1 : 0);

  return saveGuestOnboarding({
    fullname: existing.fullname,
    grade: existing.grade,
    trialUsedCount: Math.max(1, existing.trialUsedCount + 1),
    completedChapters: {
      ...existing.completedChapters,
      [key]: updatedEntry,
    },
    pendingTrialSubmission: params.submissionPayload || existing.pendingTrialSubmission || null,
  });
}

export function clearGuestOnboarding() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GUEST_ONBOARDING_STORAGE_KEY);
    window.dispatchEvent(new Event('schoolify-guest-onboarding-updated'));
  } catch {}
}
