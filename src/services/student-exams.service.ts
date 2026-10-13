import { demoDb } from '@/lib/demo-db';

/** Lượt luyện đề tóm tắt (không có snapshot chi tiết) - collection `practiceHistory` */
export interface PracticeHistoryItem {
  id: string;
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

/** Dữ liệu trang "Lịch sử luyện thi & điểm số" - đọc từ Demo JSON DB */
export const studentExamsService = {
  async getPracticeHistory(): Promise<PracticeHistoryItem[]> {
    const list = await demoDb.list<PracticeHistoryItem>('practiceHistory');
    return list.sort(byDateDesc<PracticeHistoryItem>('createdAt'));
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
