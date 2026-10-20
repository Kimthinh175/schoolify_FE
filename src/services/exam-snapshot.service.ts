import { ExamQuestion } from '@/services/mock/practice-flow-data';
import { demoDb } from '@/lib/demo-db';

export interface ExamSnapshot {
  id: string; // e.g. "SNAP-1791839281923"
  attemptToken?: string; // Token định danh bảo mật phiên thi (vd: "att_9f8e7d6c...")
  userId?: string; // ID học sinh sở hữu bài làm
  userFullName?: string; // Tên hiển thị của học sinh
  examId: string;
  examTitle: string;
  subjectSlug: string;
  subjectName: string;
  grade: number;
  chapterId: number;
  chapterName: string;
  createdAt: string; // ISO date string
  durationMinutes: number;
  timeSpentSeconds: number;
  // Kết quả đề gốc
  originalExam: {
    finalScore: number;
    maxScore: number;
    correctCount: number;
    wrongCount: number;
    totalQuestions: number;
    questions: ExamQuestion[];
    studentAnswers: {
      multipleChoices: Record<string, string>;
      trueFalseAnswers: Record<string, Record<string, boolean>>;
      shortAnswers: Record<string, string>;
      essayAnswers: Record<string, string>;
    };
    wrongQuestionIds: string[];
  };
  // Kết quả bài khắc phục (nếu đã làm)
  remediation?: {
    attempted: boolean;
    attemptedAt?: string;
    finalScore?: number;
    totalQuestions: number;
    correctCount: number;
    questions: ExamQuestion[]; // Các câu hỏi biến thể đã sinh
    studentAnswers: {
      multipleChoices: Record<string, string>;
      trueFalseAnswers: Record<string, Record<string, boolean>>;
      shortAnswers: Record<string, string>;
      essayAnswers: Record<string, string>;
    };
  };
  bloomSummary: Record<string, { total: number; correct: number }>;
}

const COLLECTION = 'examSnapshots';
export const EXAM_SNAPSHOTS_EVENT = 'exam-snapshots-updated';

const notifyUpdated = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EXAM_SNAPSHOTS_EVENT));
};

/** Sinh mã attemptToken an toàn (Cryptographically Random) */
export function generateAttemptToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const raw = crypto.randomUUID().replace(/-/g, '');
    return `att_${raw}`;
  }
  const randomHex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `att_${randomHex}`;
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

/** Chuyển đổi bản ghi submission từ PostgreSQL sang ExamSnapshot chuẩn cho UI */
function mapBackendSubmissionToSnapshot(item: any): ExamSnapshot | null {
  if (!item) return null;
  const snapData = item.snapshotData;
  if (snapData && snapData.originalExam) {
    return {
      ...snapData,
      id: snapData.id || item.id,
      attemptToken: item.attemptToken || snapData.attemptToken || item.id,
      userId: item.userId || snapData.userId,
      examTitle: item.examTitle || snapData.examTitle || 'Đề luyện thi Schoolify',
      createdAt: item.submittedAt || snapData.createdAt || new Date().toISOString(),
    } as ExamSnapshot;
  }

  return {
    id: item.id,
    attemptToken: item.attemptToken || item.id,
    userId: item.userId,
    examId: item.id,
    examTitle: item.examTitle || 'Đề luyện thi Schoolify',
    subjectSlug: 'toan-hoc',
    subjectName: 'Toán Học',
    grade: 12,
    chapterId: 1,
    chapterName: 'Chương 1',
    createdAt: item.submittedAt || new Date().toISOString(),
    durationMinutes: 45,
    timeSpentSeconds: Number(item.timeSpentSeconds || 0),
    originalExam: {
      finalScore: Number(item.score || 0),
      maxScore: Number(item.totalPoints || 10),
      correctCount: Math.round(Number(item.score || 0)),
      wrongCount: Math.max(0, 10 - Math.round(Number(item.score || 0))),
      totalQuestions: 10,
      questions: [],
      studentAnswers: {
        multipleChoices: {},
        trueFalseAnswers: {},
        shortAnswers: {},
        essayAnswers: {},
      },
      wrongQuestionIds: [],
    },
    bloomSummary: {
      EASY: { total: 4, correct: Math.min(4, Math.round(Number(item.score || 0) * 0.4)) },
      MEDIUM: { total: 3, correct: Math.min(3, Math.round(Number(item.score || 0) * 0.3)) },
      HARD: { total: 2, correct: Math.min(2, Math.round(Number(item.score || 0) * 0.2)) },
      VERY_HARD: { total: 1, correct: Number(item.score || 0) >= 9 ? 1 : 0 },
    },
  };
}

/** Snapshot đề thi được lưu đồng bộ lên Backend (`POST /api/v1/exams/submissions`) & PostgreSQL */
export const examSnapshotService = {
  /** Lưu một snapshot đề thi mới và đồng bộ lên Backend API PostgreSQL */
  async saveExamSnapshot(snapshot: ExamSnapshot): Promise<void> {
    if (!snapshot.attemptToken) {
      snapshot.attemptToken = generateAttemptToken();
    }

    // 1. Gửi lên Backend API: POST /api/v1/exams/submissions
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/v1/exams/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          attemptToken: snapshot.attemptToken,
          examId: snapshot.examId,
          examTitle: snapshot.examTitle,
          subjectSlug: snapshot.subjectSlug,
          grade: snapshot.grade,
          chapterId: snapshot.chapterId,
          timeSpentSeconds: snapshot.timeSpentSeconds,
          scoreOverride: snapshot.originalExam.finalScore,
          answers: snapshot.originalExam.studentAnswers,
          snapshotData: snapshot,
          userId: snapshot.userId || headers['x-user-id'],
        }),
      });
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const serverToken = body?.attemptToken || body?.data?.attemptToken;
        if (serverToken) {
          snapshot.attemptToken = serverToken;
        }
      }
    } catch (err) {
      console.warn('[ExamSnapshotService] Sync to Backend /api/v1/exams/submissions skipped:', err);
    }

    // 2. Lưu bản sao vào Demo JSON DB dự phòng
    try {
      await demoDb.create<ExamSnapshot>(COLLECTION, snapshot);
    } catch {}
    notifyUpdated();
  },

  /** Lấy toàn bộ danh sách snapshots (ưu tiên từ PostgreSQL GET /api/v1/exams/history) */
  async getExamSnapshots(): Promise<ExamSnapshot[]> {
    const mergedMap = new Map<string, ExamSnapshot>();

    // 1. Tải từ PostgreSQL qua GET /api/v1/exams/history
    try {
      const headers = getAuthHeaders();
      const userIdQuery = headers['x-user-id']
        ? `&userId=${encodeURIComponent(headers['x-user-id'])}`
        : '';
      const beRes = await fetch(`/api/v1/exams/history?page=1&limit=50${userIdQuery}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      if (beRes.ok) {
        const json = await beRes.json().catch(() => null);
        const items: any[] = json?.data?.items || [];
        for (const item of items) {
          const snap = mapBackendSubmissionToSnapshot(item);
          if (snap) {
            const key = snap.attemptToken || snap.id;
            mergedMap.set(key, snap);
          }
        }
      }
    } catch (err) {
      console.warn('[ExamSnapshotService.getExamSnapshots] Backend fetch skipped:', err);
    }

    // 2. Bổ sung các snapshot local nếu chưa có trong map
    try {
      const localList = await demoDb.list<ExamSnapshot>(COLLECTION);
      for (const localSnap of localList) {
        const key = localSnap.attemptToken || localSnap.id;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, localSnap);
        }
      }
    } catch {}

    return Array.from(mergedMap.values()).sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
  },

  /** Lấy snapshot theo ID từ PostgreSQL GET /api/v1/exams/snapshots/:id */
  async getExamSnapshotById(id: string): Promise<ExamSnapshot | null> {
    try {
      const headers = getAuthHeaders();
      const beRes = await fetch(`/api/v1/exams/snapshots/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      if (beRes.ok) {
        const json = await beRes.json().catch(() => null);
        const mapped = mapBackendSubmissionToSnapshot(json?.data);
        if (mapped) return mapped;
      }
    } catch {}

    try {
      return await demoDb.get<ExamSnapshot>(COLLECTION, id);
    } catch {
      return null;
    }
  },

  /** Lấy snapshot theo mã attemptToken bảo mật (ưu tiên kiểm tra qua Backend GET /api/v1/exams/results/:attemptToken) */
  async getExamSnapshotByToken(token: string): Promise<ExamSnapshot | null> {
    try {
      const headers = getAuthHeaders();
      const beRes = await fetch(`/api/v1/exams/results/${encodeURIComponent(token)}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      if (beRes.status === 403) {
        return {
          id: token,
          attemptToken: token,
          userId: '__FORBIDDEN_IDOR_OWNER__',
          examId: '',
          examTitle: '',
          subjectSlug: '',
          subjectName: '',
          grade: 12,
          chapterId: 1,
          chapterName: '',
          createdAt: new Date().toISOString(),
          durationMinutes: 45,
          timeSpentSeconds: 0,
          originalExam: {
            finalScore: 0,
            maxScore: 10,
            correctCount: 0,
            wrongCount: 0,
            totalQuestions: 0,
            questions: [],
            studentAnswers: {
              multipleChoices: {},
              trueFalseAnswers: {},
              shortAnswers: {},
              essayAnswers: {},
            },
            wrongQuestionIds: [],
          },
          bloomSummary: {},
        };
      }
      if (beRes.ok) {
        const payload = await beRes.json().catch(() => null);
        const mapped = mapBackendSubmissionToSnapshot(payload?.data);
        if (mapped) return mapped;
      }
    } catch {
      // Fallback sang GET /api/v1/exams/snapshots/:id hoặc Demo JSON DB
    }

    return this.getExamSnapshotById(token);
  },

  /**
   * Kiểm tra quyền xem kết quả bài làm:
   * - Giáo viên / Admin: được quyền xem kiểm tra.
   * - Học sinh: Chỉ được xem nếu bài làm thuộc về chính mình (tránh lỗ hổng IDOR).
   */
  canUserAccessSnapshot(
    snapshot: ExamSnapshot,
    currentUserId?: string,
    userRole?: string
  ): boolean {
    if (snapshot.userId === '__FORBIDDEN_IDOR_OWNER__') {
      return false;
    }
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'TEACHER') {
      return true;
    }
    if (!snapshot.userId || snapshot.userId === 'guest') {
      return true;
    }
    if (currentUserId && snapshot.userId === currentUserId) {
      return true;
    }
    return false;
  },

  /** Cập nhật kết quả bài khắc phục vào snapshot đã có */
  async updateRemediationInSnapshot(
    snapshotId: string,
    remediationData: NonNullable<ExamSnapshot['remediation']>
  ): Promise<void> {
    try {
      await demoDb.patch<ExamSnapshot>(COLLECTION, snapshotId, { remediation: remediationData });
    } catch {}
    notifyUpdated();
  },
};
