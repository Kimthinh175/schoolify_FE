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
    const token = state.token || 'mock-student-token';
    const userId = state.user?.id || '';
    const role = state.currentRole || state.user?.role || 'STUDENT';
    return {
      Authorization: `Bearer ${token}`,
      ...(userId ? { 'x-user-id': String(userId) } : {}),
      ...(role ? { 'x-user-role': String(role) } : {}),
    };
  } catch {
    return {};
  }
}

/** Snapshot đề thi được lưu đồng bộ lên Backend (`POST /api/v1/exams/submissions`) & Demo JSON DB (`data/db.json` -> `examSnapshots`). */
export const examSnapshotService = {
  /** Lưu một snapshot đề thi mới và đồng bộ lên Backend API */
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
          userId: snapshot.userId,
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

    // 2. Lưu vào Demo JSON DB
    await demoDb.create<ExamSnapshot>(COLLECTION, snapshot);
    notifyUpdated();
  },

  /** Lấy toàn bộ danh sách snapshots (mới nhất trước) */
  async getExamSnapshots(): Promise<ExamSnapshot[]> {
    const list = await demoDb.list<ExamSnapshot>(COLLECTION);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Lấy snapshot theo ID */
  async getExamSnapshotById(id: string): Promise<ExamSnapshot | null> {
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
      if (headers.Authorization) {
        const beRes = await fetch(`/api/v1/exams/results/${encodeURIComponent(token)}`, {
          method: 'GET',
          headers,
        });
        if (beRes.status === 403) {
          // Backend chặn IDOR (403 Forbidden) -> trả về snapshot đánh dấu thuộc user khác để UI bật màn hình 403
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
          const snapData = payload?.data?.snapshotData;
          if (snapData && snapData.originalExam) {
            return {
              ...snapData,
              attemptToken: payload?.data?.attemptToken || token,
              userId: payload?.data?.userId || snapData.userId,
            } as ExamSnapshot;
          }
        }
      }
    } catch {
      // Fallback sang Demo JSON DB nếu Backend không phản hồi
    }

    try {
      const list = await demoDb.list<ExamSnapshot>(COLLECTION);
      const match = list.find((s) => s.attemptToken === token || s.id === token);
      return match || null;
    } catch {
      return null;
    }
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
    // 1. Quản trị viên và Giáo viên có quyền xem bài của học sinh
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'TEACHER') {
      return true;
    }
    // 2. Nếu bài làm chưa gắn userId (bài thi khách / demo cũ), cho phép hiển thị
    if (!snapshot.userId || snapshot.userId === 'guest') {
      return true;
    }
    // 3. Nếu bài làm có gắn userId, bắt buộc người dùng hiện tại phải trùng khớp
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
    await demoDb.patch<ExamSnapshot>(COLLECTION, snapshotId, { remediation: remediationData });
    notifyUpdated();
  },
};
