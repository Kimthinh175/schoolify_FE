import { K12_SUBJECTS } from '@/services/mock/data';
import { K12Subject } from '@/types/subject';
import { parseHighSchoolGrade } from '@/lib/semester-utils';

const TOPIC_SESSION_KEY = 'schoolify_topic_view_ctx_v1';

export type TopicRoadmapLevelCode = 'BASIC' | 'MEDIUM' | 'ADVANCED';

export interface SessionTopicContext {
  grade?: 10 | 11 | 12;
  track?: 'TOAN_SO' | 'TOAN_HINH' | 'DEFAULT';
  level?: TopicRoadmapLevelCode;
}

const SHORT_TO_FULL_SLUG: Record<string, string> = {
  toan: 'toan-hoc',
  'toan-hoc': 'toan-hoc',
  tin: 'tin-hoc',
  'tin-hoc': 'tin-hoc',
  ly: 'vat-ly',
  'vat-ly': 'vat-ly',
  hoa: 'hoa-hoc',
  'hoa-hoc': 'hoa-hoc',
  sinh: 'sinh-hoc',
  'sinh-hoc': 'sinh-hoc',
  van: 'ngu-van',
  'ngu-van': 'ngu-van',
  anh: 'tieng-anh',
  'tieng-anh': 'tieng-anh',
  su: 'lich-su',
  'lich-su': 'lich-su',
  dia: 'dia-ly',
  'dia-ly': 'dia-ly',
};

const FULL_TO_SHORT_SLUG: Record<string, string> = {
  'toan-hoc': 'toan',
  'tin-hoc': 'tin',
  'vat-ly': 'ly',
  'hoa-hoc': 'hoa',
  'sinh-hoc': 'sinh',
  'ngu-van': 'van',
  'tieng-anh': 'anh',
  'lich-su': 'su',
  'dia-ly': 'dia',
};

export function getSessionTopicContext(): SessionTopicContext {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(TOPIC_SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const grade = parseHighSchoolGrade(parsed?.grade) ?? undefined;
    const track =
      parsed?.track === 'TOAN_SO' ||
      parsed?.track === 'TOAN_HINH' ||
      parsed?.track === 'DEFAULT'
        ? parsed.track
        : undefined;
    const level =
      parsed?.level === 'BASIC' ||
      parsed?.level === 'MEDIUM' ||
      parsed?.level === 'ADVANCED'
        ? parsed.level
        : undefined;
    return { grade, track, level };
  } catch {
    return {};
  }
}

export function setSessionTopicContext(next: Partial<SessionTopicContext>): void {
  if (typeof window === 'undefined') return;
  try {
    const prev = getSessionTopicContext();
    const merged: SessionTopicContext = {
      ...prev,
      ...(next.grade ? { grade: next.grade } : {}),
      ...(next.track ? { track: next.track } : {}),
      ...(next.level ? { level: next.level } : {}),
    };
    window.sessionStorage.setItem(TOPIC_SESSION_KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage quota errors
  }
}

export function resolveFullSubjectSlug(rawParam: string): string {
  const clean = decodeURIComponent(rawParam || '')
    .trim()
    .toLowerCase();
  return SHORT_TO_FULL_SLUG[clean] || clean || 'toan-hoc';
}

export function getShortTopicSlug(subjectSlug: string): string {
  const clean = (subjectSlug || '').trim().toLowerCase();
  return FULL_TO_SHORT_SLUG[clean] || clean || 'toan';
}

export function buildTopicRoadmapHref(
  subjectSlug: string,
  options?: { grade?: number; track?: string; level?: string },
): string {
  const shortSlug = getShortTopicSlug(subjectSlug);
  if (typeof window !== 'undefined' && options) {
    const parsedGrade = parseHighSchoolGrade(options.grade) ?? undefined;
    const parsedTrack =
      options.track === 'TOAN_SO' ||
      options.track === 'TOAN_HINH' ||
      options.track === 'DEFAULT'
        ? options.track
        : undefined;
    const rawLvl = (options.level || '').toUpperCase();
    const parsedLevel: TopicRoadmapLevelCode | undefined =
      rawLvl === 'BASIC' || rawLvl === 'MEDIUM' || rawLvl === 'ADVANCED'
        ? (rawLvl as TopicRoadmapLevelCode)
        : undefined;
    if (parsedGrade || parsedTrack || parsedLevel) {
      setSessionTopicContext({
        ...(parsedGrade ? { grade: parsedGrade } : {}),
        ...(parsedTrack ? { track: parsedTrack } : {}),
        ...(parsedLevel ? { level: parsedLevel } : {}),
      });
    }
  }
  return `/luyen-thi/chuyen-de/${shortSlug}`;
}

export function findSubjectByTopicParam(rawParam: string): K12Subject | null {
  const fullSlug = resolveFullSubjectSlug(rawParam);
  return K12_SUBJECTS.find((s) => s.slug === fullSlug) || null;
}
