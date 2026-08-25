import { Exam, ExamSubmission } from '@/types';
import { MOCK_EXAMS, MOCK_SUBMISSIONS } from './mock/data';

export const examService = {
  async getExams(): Promise<Exam[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_EXAMS;
  },

  async getExamById(id: string): Promise<Exam | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_EXAMS.find((e) => e.id === id);
  },

  async getSubmissions(): Promise<ExamSubmission[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SUBMISSIONS;
  },

  async getSubmissionById(id: string): Promise<ExamSubmission | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SUBMISSIONS.find((s) => s.id === id);
  },
};
