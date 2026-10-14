import { ExamQuestion } from '@/services/mock/practice-flow-data';
import { demoDb } from '@/lib/demo-db';

export interface ExamSnapshot {
  id: string; // e.g. "SNAP-1791839281923"
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

/** Snapshot đề thi được lưu trong Demo JSON DB (`data/db.json` -> collection `examSnapshots`). */
export const examSnapshotService = {
  /** Lưu một snapshot đề thi mới (server tự giữ tối đa 50 bản gần nhất) */
  async saveExamSnapshot(snapshot: ExamSnapshot): Promise<void> {
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

  /** Cập nhật kết quả bài khắc phục vào snapshot đã có */
  async updateRemediationInSnapshot(
    snapshotId: string,
    remediationData: NonNullable<ExamSnapshot['remediation']>
  ): Promise<void> {
    await demoDb.patch<ExamSnapshot>(COLLECTION, snapshotId, { remediation: remediationData });
    notifyUpdated();
  },
};
