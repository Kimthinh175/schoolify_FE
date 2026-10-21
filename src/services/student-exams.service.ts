import { demoDb } from '@/lib/demo-db';

/** Lượt luyện đề tóm tắt (không có snapshot chi tiết) - kết nối PostgreSQL GET /api/v1/exams/history */
export interface PracticeHistoryItem {
  id: string;
  attemptToken?: string;
  title: string;
  subject: string;
  subjectSlug: string;
  level: string;
  score: number;
  totalQuestions: number;
  correctQuestions: number;
  breakdown: { nhanBiet: string; thongHieu: string; vanDung: string; vanDungCao: string };
  createdAt: string;
  timeSpentMinutes: number;
  status: string;
}

/** Bài kiểm tra thầy cô giao - collection `assignments` */
export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  courseTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  maxScore: number;
  deadline: string;
  status: 'PENDING' | 'SUBMITTED';
}

/** Bài đã được thầy cô chấm - collection `gradedSubmissions` */
export interface GradedSubmission {
  id: string;
  examId: string;
  examTitle: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  gradedAt: string;
  teacherNotes: string;
}

const byDateDesc = <T,>(key: keyof T) => (a: T, b: T) =>
  String(b[key]).localeCompare(String(a[key]));

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

/** Dữ liệu trang "Lịch sử luyện thi & điểm số" - ưu tiên đọc từ PostgreSQL GET /api/v1/exams/history */
export const studentExamsService = {
  async getPracticeHistory(): Promise<PracticeHistoryItem[]> {
    const backendItems: PracticeHistoryItem[] = [];
    try {
      const headers = getAuthHeaders();
      const userIdQuery = headers['x-user-id']
        ? `&userId=${encodeURIComponent(headers['x-user-id'])}`
        : '';
      const res = await fetch(`/api/v1/exams/history?page=1&limit=50${userIdQuery}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const rawList: any[] = json?.data?.items || [];
        for (const item of rawList) {
          // Nếu bản ghi đã có snapshotData.originalExam thì nó sẽ được hiển thị ở phần Snapshot chi tiết phía trên
          if (item.snapshotData && item.snapshotData.originalExam) {
            continue;
          }
          const score = Number(item.score || 0);
          const totalQ = 10;
          const correctQ = Math.min(totalQ, Math.max(0, Math.round(score)));
          backendItems.push({
            id: item.id,
            attemptToken: item.attemptToken,
            title: item.examTitle || 'Đề luyện thi THPT',
            subject: item.snapshotData?.subjectName || 'Toán Học',
            subjectSlug: item.snapshotData?.subjectSlug || 'toan-hoc',
            level: item.snapshotData?.level || 'Tiêu chuẩn',
            score,
            totalQuestions: totalQ,
            correctQuestions: correctQ,
            breakdown: {
              nhanBiet: `${Math.min(4, Math.round(correctQ * 0.4))}/4`,
              thongHieu: `${Math.min(3, Math.round(correctQ * 0.3))}/3`,
              vanDung: `${Math.min(2, Math.round(correctQ * 0.2))}/2`,
              vanDungCao: `${score >= 9 ? 1 : 0}/1`,
            },
            createdAt: item.submittedAt || new Date().toISOString(),
            timeSpentMinutes: Math.max(1, Math.round(Number(item.timeSpentSeconds || 600) / 60)),
            status: item.status || 'COMPLETED',
          });
        }
      }
    } catch (err) {
      console.warn('[studentExamsService.getPracticeHistory] Backend fetch failed:', err);
    }

    try {
      const localList = await demoDb.list<PracticeHistoryItem>('practiceHistory');
      const existingIds = new Set(backendItems.map((i) => i.id));
      const merged = [
        ...backendItems,
        ...localList.filter((i) => !existingIds.has(i.id)),
      ];
      return merged.sort(byDateDesc<PracticeHistoryItem>('createdAt'));
    } catch {
      return backendItems.sort(byDateDesc<PracticeHistoryItem>('createdAt'));
    }
  },
  async getAssignments(): Promise<StudentAssignment[]> {
    const list = await demoDb.list<StudentAssignment>('assignments');
    return list.sort((a, b) => a.deadline.localeCompare(b.deadline));
  },
  async getGradedSubmissions(): Promise<GradedSubmission[]> {
    const list = await demoDb.list<GradedSubmission>('gradedSubmissions');
    return list.sort(byDateDesc<GradedSubmission>('gradedAt'));
  },
};
