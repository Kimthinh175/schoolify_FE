export type QuestionType = 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE';
export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'RETURNED';

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id: string;
  bank_id?: string | null;
  type: QuestionType;
  content: string;
  points: number;
  options?: QuestionOption[];
  correct_answer_explanation?: string;
  sample_essay_answer?: string;
}

export interface QuestionBank {
  id: string;
  school_id?: string | null;
  creator_id: string;
  title: string;
  description?: string | null;
  subject: string;
  questions_count?: number;
  created_at: string;
  questions?: Question[];
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
  selected_option_ids?: string[];
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
