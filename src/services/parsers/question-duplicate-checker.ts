import { Question } from '@/types/exam';

export type DuplicateCheckStatus = 'UNIQUE' | 'EXACT_DUPLICATE' | 'CONFLICT_ANSWER';
export type DuplicateMatchSource = 'DB' | 'BATCH' | 'BOTH' | null;
export type DuplicateResolutionAction = 'SKIP' | 'OVERWRITE' | 'KEEP_BOTH';

export interface DuplicateMatchInfo {
  id?: string;
  title?: string;
  subject?: string;
  grade?: number;
  questionFormat?: string;
  answerSummary: string;
  answerFingerprint: string;
  explanation?: string | null;
  batchIndex?: number;
}

export interface DuplicateAwareQuestion extends Question {
  hasError?: boolean;
  errorReason?: string;
  originalIndex: number;
  groupCode?: string;
  group_code?: string;
  duplicateStatus?: DuplicateCheckStatus;
  duplicateSource?: DuplicateMatchSource;
  incomingAnswerSummary?: string;
  incomingAnswerFingerprint?: string;
  existingMatch?: DuplicateMatchInfo;
  /** Thông tin bản trùng lấy từ PostgreSQL (lưu lại để re-evaluate khi Admin chỉnh đáp án tại UI) */
  dbMatch?: DuplicateMatchInfo;
  duplicateResolution?: DuplicateResolutionAction;
}

export function normalizeQuestionStem(raw?: string | null): string {
  if (!raw) return '';
  let text = String(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/^\s*(?:Câu|Bài|Question)\s+\d+\s*[\.:\]\-]*\s*/i, '')
    .replace(/\[(VDC|VẬN DỤNG CAO|VD|VẬN DỤNG|NB|NHẬN BIẾT|TH|THÔNG HIỂU)\]/gi, ' ')
    .replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  text = text.replace(/[.,:;!?]+$/g, '').trim();
  return text;
}

export function normalizeAnswerText(raw?: string | null): string {
  if (!raw) return '';
  return String(raw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/^[A-Da-d][\.\)]\s*/i, '')
    .replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function resolveCanonicalFormat(rawFormat?: string | null): string {
  const upper = String(rawFormat || 'SINGLE_CHOICE').toUpperCase().trim();
  if (upper === 'FILL_BLANK' || upper === 'SHORT_ANSWER') return 'SHORT_ANSWER';
  if (upper === 'TRUE_FALSE') return 'TRUE_FALSE';
  if (upper === 'MULTIPLE_CHOICE' || upper === 'MULTI_CHOICE') return 'MULTI_CHOICE';
  return 'SINGLE_CHOICE';
}

export function extractClientAnswerProfile(q: Partial<DuplicateAwareQuestion> & Record<string, any>) {
  const format = resolveCanonicalFormat(q.questionFormat || q.type);
  const normalizedAnswers = Array.isArray(q.answers)
    ? q.answers.map((a: any, idx: number) => ({
        label: String(a.label || a.sub_label || String.fromCharCode(65 + idx)).trim(),
        content: String(a.content || '').trim(),
        isAnswer: Boolean(a.isAnswer ?? a.is_answer ?? a.isCorrect),
      }))
    : [];

  if (format === 'SHORT_ANSWER') {
    const rawShort =
      q.shortAnswerCorrect ||
      q.shortAnswer ||
      q.answer ||
      normalizedAnswers.find((a) => a.isAnswer)?.content ||
      '';
    const cleaned = String(rawShort).trim();
    const norm = normalizeAnswerText(cleaned);
    if (!norm || norm === '(điền đáp số)') {
      return {
        fingerprint: 'NONE',
        summary: '(Chưa có đáp số)',
      };
    }
    return {
      fingerprint: `SHORT:${norm}`,
      summary: cleaned,
    };
  }

  if (format === 'TRUE_FALSE') {
    if (normalizedAnswers.length === 0) {
      return {
        fingerprint: 'NONE',
        summary: '(Chưa có mệnh đề Đúng/Sai)',
      };
    }
    const items = normalizedAnswers.map((a, idx) => ({
      label: a.label || String.fromCharCode(97 + idx),
      normContent: normalizeAnswerText(a.content),
      flag: a.isAnswer ? 'Đ' : 'S',
    }));
    const fingerprintParts = [...items]
      .sort((x, y) => x.normContent.localeCompare(y.normContent))
      .map((x) => `${x.normContent}=>${x.flag}`);
    return {
      fingerprint: `TF:${fingerprintParts.join('||')}`,
      summary: items.map((x) => `${x.label.toLowerCase()}-${x.flag}`).join(', '),
    };
  }

  const correctOptions = normalizedAnswers.filter((a) => a.isAnswer);
  if (correctOptions.length === 0) {
    return {
      fingerprint: 'NONE',
      summary: '(Chưa chọn đáp án đúng)',
    };
  }

  const sortedContents = correctOptions
    .map((a) => normalizeAnswerText(a.content))
    .filter(Boolean)
    .sort();

  return {
    fingerprint: `MC:${sortedContents.join('||')}`,
    summary: correctOptions
      .map((a) => (a.content ? `${a.label}. ${a.content}` : a.label))
      .join(' | '),
  };
}

/**
 * Đánh giá trùng lặp nội bộ trong danh sách xem trước kết hợp với dbMatch đã lưu từ backend.
 */
export function recomputeDuplicateStates<T extends DuplicateAwareQuestion>(items: T[]): T[] {
  const batchStemMap = new Map<string, DuplicateMatchInfo[]>();

  return items.map((q, idx) => {
    const stemKey = normalizeQuestionStem(q.content);
    const incomingProfile = extractClientAnswerProfile(q);

    if (!stemKey) {
      return {
        ...q,
        duplicateStatus: 'UNIQUE' as DuplicateCheckStatus,
        duplicateSource: null,
        incomingAnswerSummary: incomingProfile.summary,
        incomingAnswerFingerprint: incomingProfile.fingerprint,
        existingMatch: undefined,
      };
    }

    const dbMatches = q.dbMatch ? [q.dbMatch] : [];
    const batchMatches = batchStemMap.get(stemKey) || [];
    const allMatches = [...dbMatches, ...batchMatches];

    let duplicateStatus: DuplicateCheckStatus = 'UNIQUE';
    let duplicateSource: DuplicateMatchSource = null;
    let existingMatch: DuplicateMatchInfo | undefined;

    if (allMatches.length > 0) {
      const hasDb = dbMatches.length > 0;
      const hasBatch = batchMatches.length > 0;
      duplicateSource = hasDb && hasBatch ? 'BOTH' : hasDb ? 'DB' : 'BATCH';

      const conflict = allMatches.find(
        (m) =>
          m.answerFingerprint !== incomingProfile.fingerprint ||
          (m.answerFingerprint !== 'NONE' && incomingProfile.fingerprint === 'NONE'),
      );

      if (conflict) {
        duplicateStatus = 'CONFLICT_ANSWER';
        existingMatch = conflict;
      } else {
        duplicateStatus = 'EXACT_DUPLICATE';
        existingMatch = dbMatches[0] || batchMatches[0];
      }
    }

    const prevList = batchStemMap.get(stemKey) || [];
    prevList.push({
      title: q.title || `Câu #${q.originalIndex || idx + 1}`,
      batchIndex: q.originalIndex || idx + 1,
      questionFormat: resolveCanonicalFormat(q.type),
      answerSummary: incomingProfile.summary,
      answerFingerprint: incomingProfile.fingerprint,
      explanation: q.explain || null,
    });
    batchStemMap.set(stemKey, prevList);

    let duplicateResolution = q.duplicateResolution;
    if (duplicateStatus === 'UNIQUE') {
      duplicateResolution = undefined;
    } else if (duplicateStatus === 'EXACT_DUPLICATE' && !duplicateResolution) {
      duplicateResolution = 'SKIP';
    } else if (duplicateStatus === 'CONFLICT_ANSWER' && q.duplicateStatus !== 'CONFLICT_ANSWER') {
      // Bắt buộc Admin chọn lại nếu vừa chuyển sang trạng thái xung đột đáp án
      duplicateResolution = undefined;
    }

    return {
      ...q,
      duplicateStatus,
      duplicateSource,
      incomingAnswerSummary: incomingProfile.summary,
      incomingAnswerFingerprint: incomingProfile.fingerprint,
      existingMatch,
      duplicateResolution,
    };
  });
}
