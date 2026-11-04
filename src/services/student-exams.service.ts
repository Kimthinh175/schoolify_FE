import { demoDb } from '@/lib/demo-db';
import {
  PracticeExamPackage,
  ExamQuestion,
  getPracticeExam,
  getChaptersBySubject,
  MATH_GRADE_12_CHAPTERS,
  ExamFormat,
} from '@/services/mock/practice-flow-data';
import { PracticeLevel } from '@/types/subject';

export interface GenerateExamOptions {
  subjectSlug: string;
  grade: number;
  chapterId?: number;
  totalQuestions?: number;
  durationMinutes?: number;
  practiceMode?: 'TOPIC' | 'MOCK_EXAM';
  targetDifficulty?: string;
  topicTagFilter?: string;
  level?: PracticeLevel;
  format?: ExamFormat;
}

const SUBJECT_NAME_MAP: Record<string, string> = {
  'toan-hoc': 'Toán Học',
  'vat-ly': 'Vật Lý',
  'hoa-hoc': 'Hóa Học',
  'sinh-hoc': 'Sinh Học',
  'tieng-anh': 'Tiếng Anh',
  'lich-su': 'Lịch Sử',
  'dia-ly': 'Địa Lý',
  'gdcd': 'GDKT & Pháp Luật',
  'gdkt': 'GDKT & Pháp Luật',
  'gdkt-phap-luat': 'GDKT & Pháp Luật',
  'giao-duc-kinh-te-va-phap-luat': 'GDKT & Pháp Luật',
  'tin-hoc': 'Tin Học',
  'cong-nghe': 'Công Nghệ',
  'ngu-van': 'Ngữ Văn',
  'khoa-hoc-tu-nhien': 'Khoa Học Tự Nhiên',
};

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

  /**
   * Sinh đề thi ma trận trực tiếp từ Backend NestJS API (POST /api/v1/exams/matrix-generate)
   * Tự động fallback xuống generator local client nếu mất mạng hoặc offline
   */
  async generateMatrixExam(options: GenerateExamOptions): Promise<PracticeExamPackage> {
    const {
      subjectSlug = 'toan-hoc',
      grade = 12,
      chapterId = 1,
      totalQuestions = 10,
      durationMinutes = 45,
      practiceMode = 'TOPIC',
      targetDifficulty,
      topicTagFilter,
      level = 'BASIC',
      format = 'QUIZ',
    } = options;

    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/v1/exams/matrix-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          subject: subjectSlug,
          grade: Number(grade),
          chapterId: Number(chapterId),
          totalQuestions: Number(totalQuestions),
          durationMinutes: Number(durationMinutes),
          practiceMode,
          targetDifficulty: targetDifficulty === 'ALL' ? undefined : targetDifficulty,
          topicTag: topicTagFilter === 'ALL' ? undefined : topicTagFilter,
          level,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.errorCode === 'INSUFFICIENT_EXAM_POINTS' || res.status === 400) {
          const err: any = new Error(errJson?.message || 'Không đủ điểm làm đề thi');
          err.isInsufficientPoints = true;
          err.errorCode = errJson?.errorCode || 'INSUFFICIENT_EXAM_POINTS';
          err.data = errJson?.data;
          throw err;
        }
      }

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const data = json?.data;
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          const chapters = getChaptersBySubject(subjectSlug, grade);
          const chapter =
            chapters.find((c) => c.id === chapterId) || chapters[0] || MATH_GRADE_12_CHAPTERS[0];

          const mappedQuestions: ExamQuestion[] = data.questions.map((q: any, idx: number) => {
            const rawFormat = String(q.questionFormat || 'SINGLE_CHOICE').toUpperCase();
            let type: ExamQuestion['type'] = 'MULTIPLE_CHOICE';
            if (rawFormat === 'TRUE_FALSE') type = 'TRUE_FALSE';
            else if (rawFormat === 'SHORT_ANSWER') type = 'SHORT_ANSWER';
            else if (rawFormat === 'ESSAY') type = 'ESSAY';

            const bloom = String(q.bloomLevel || 'THONG_HIEU').toUpperCase();
            let difficulty: ExamQuestion['difficulty'] = 'MEDIUM';
            if (bloom === 'NHAN_BIET') difficulty = 'EASY';
            else if (bloom === 'VAN_DUNG') difficulty = 'HARD';
            else if (bloom === 'VAN_DUNG_CAO') difficulty = 'VERY_HARD';

            const choices =
              Array.isArray(q.answers) && q.answers.length > 0
                ? q.answers.map((a: any, aIdx: number) => ({
                    key: (a.label || String.fromCharCode(65 + aIdx)) as 'A' | 'B' | 'C' | 'D',
                    content: a.content || '',
                  }))
                : [
                    { key: 'A', content: 'Phương án A' },
                    { key: 'B', content: 'Phương án B' },
                    { key: 'C', content: 'Phương án C' },
                    { key: 'D', content: 'Phương án D' },
                  ];

            const subjectLabel = SUBJECT_NAME_MAP[subjectSlug] || 'Môn Học K-12';
            return {
              id: q.id || `q-matrix-${idx + 1}`,
              type,
              difficulty,
              grade: Number(grade),
              chapterId: Number(q.chapterId || chapterId || 1),
              subjectSlug,
              subjectName: subjectLabel,
              topic: q.topicTag || chapter.name,
              topicTag: q.topicTag || chapter.name,
              cognitiveTag:
                q.cognitiveTag ||
                (difficulty === 'EASY'
                  ? 'Nhận biết'
                  : difficulty === 'MEDIUM'
                  ? 'Thông hiểu'
                  : difficulty === 'HARD'
                  ? 'Vận dụng'
                  : 'Vận dụng cao'),
              trapTag: q.trapTag || 'Nhầm lẫn giả thiết hoặc tính toán',
              title: q.title || `Câu ${idx + 1} (${q.cognitiveTag || difficulty})`,
              content: q.content || '',
              score: Number(q.points || 0.25),
              choices,
              correctChoice: (q.correctChoice || 'A') as 'A' | 'B' | 'C' | 'D',
              explanation:
                q.explanation || 'Xem lời giải chi tiết và các bước phân tích phương án đúng.',
            };
          });

          const totalPoints = mappedQuestions.reduce((acc, q) => acc + q.score, 0);
          const subjectLabel = SUBJECT_NAME_MAP[subjectSlug] || 'Môn Học K-12';

          return {
            id: `pkg-${subjectSlug}-g${grade}-ch${chapterId}-${Date.now().toString(36)}`,
            subjectSlug,
            subjectName: subjectLabel,
            level,
            grade: Number(grade),
            chapterId: Number(chapterId),
            chapterName: chapter.name,
            format,
            practiceMode,
            targetDifficulty: targetDifficulty as any,
            topicTagFilter,
            title: data.examTitle || `Đề Luyện Thi Ma Trận ${subjectLabel} - Khối ${grade}`,
            durationMinutes: Number(data.durationMinutes || durationMinutes),
            totalPoints: Math.round(totalPoints * 100) / 100,
            questions: mappedQuestions,
          };
        }
      }
    } catch (err: any) {
      if (err?.isInsufficientPoints || err?.errorCode === 'INSUFFICIENT_EXAM_POINTS') {
        throw err;
      }
      console.warn('[studentExamsService.generateMatrixExam] Fallback to local practice generator:', err);
    }

    // Graceful fallback to client generator
    return getPracticeExam(subjectSlug, level, grade, chapterId, format, {
      requestedCount: totalQuestions,
      quizCount: totalQuestions,
      durationMinutes,
      practiceMode,
      targetDifficulty: targetDifficulty as any,
      topicTagFilter,
    });
  },

  /** Nộp bài thi lên Backend API: POST /api/v1/exams/submissions */
  async submitExamResult(payload: any): Promise<any> {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/v1/exams/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json().catch(() => null);
      }
    } catch (err) {
      console.warn('[studentExamsService.submitExamResult] Error submitting to BE:', err);
    }
    return null;
  },
};
