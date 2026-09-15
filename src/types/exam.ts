export type QuestionType = 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE';
export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'RETURNED';

/** ERD: Answer — một đáp án của câu hỏi */
export interface Answer {
  id: string;
  question_id: string;
  content: string;
  explain?: string | null;
  img_url?: string | null;
  is_answer: boolean;
}

/** ERD: Question (+ một số field mở rộng FE cần cho Exam Runner) */
export interface Question {
  id: string;
  bank_id?: string | null;
  lesson_id?: string | null;
  type: QuestionType;
  title?: string | null;
  content: string;
  points: number;
  answers?: Answer[];
  sample_essay_answer?: string | null;
  created_at?: string;
}

/** ERD: QuestionBank */
export interface QuestionBank {
  id: string;
  title: string;
  owner_id?: string | null;
  school_id?: string | null;
  is_premium: boolean;
  description?: string | null;
  subject?: string | null;
  questions_count?: number;
  created_at: string;
  updated_at?: string;
  questions?: Question[];
  count_used?: number;
}

export interface Exam {
  id: string;
  course_id?: string | null;
  class_id?: string | null;
  title: string;
  description?: string | null;
  duration_minutes: number;
  pass_score: number;
  max_score: number;
  total_questions: number;
  questions?: Question[];
  deadline?: string | null;
  is_published: boolean;
  created_at: string;
}

export interface SubmissionAnswer {
  question_id: string;
  selected_answer_id?: string | null;
  text_answer?: string;
  is_correct?: boolean;
  points_earned?: number;
  teacher_feedback?: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  student_name?: string;
  student_avatar?: string;
  exam_title?: string;
  course_title?: string;
  started_at: string;
  submitted_at?: string | null;
  score?: number | null;
  status: SubmissionStatus;
  answers: SubmissionAnswer[];
  teacher_notes?: string | null;
  graded_by_teacher_id?: string | null;
  graded_at?: string | null;
}
