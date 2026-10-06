export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'ESSAY'
  | 'GROUP_QUESTIONS'
  | 'MATCHING'
  | 'ORDERING'
  | 'CLOZE_DROPDOWN';

export type DifficultyLevel =
  | 'RECOGNITION'           // Nhận biết
  | 'UNDERSTANDING'         // Thông hiểu
  | 'APPLICATION'           // Vận dụng
  | 'ADVANCED_APPLICATION';  // Vận dụng cao

export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'RETURNED';
export type QuestionBankReviewStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

/** ERD: Answer — một đáp án của câu hỏi */
export interface Answer {
  id: string;
  question_id: string;
  content: string;
  explain?: string | null;
  img_url?: string | null;
  is_answer: boolean;
  label?: string; // e.g. "A", "B", "C", "D"
  order_index?: number;
}

export interface RubricItem {
  criterion: string;
  points: number;
}

/** Cặp ghép nối cho loại MATCHING */
export interface MatchingPair {
  id: string;
  left_text: string;
  right_text: string;
  correct_match: string; // id hoặc text tương ứng
}

/** Mục sắp xếp cho loại ORDERING */
export interface OrderingItem {
  id: string;
  content: string;
  correct_order: number; // Thứ tự đúng (1, 2, 3...)
}

/** Ô đục lỗ cho loại CLOZE_DROPDOWN */
export interface ClozeBlank {
  id: string;
  index: number;
  options: string[];
  correct_answer: string;
}

/** ERD: Question (+ một số field mở rộng FE cần cho Exam Runner) */
export interface Question {
  id: string;
  bank_id?: string | null;
  lesson_id?: string | null;
  type: QuestionType;
  title?: string | null;
  content: string;
  img_urls?: string[];
  points: number;
  difficulty?: DifficultyLevel;
  subject?: string | null;
  grade_level?: string | number | null;
  chapter?: string | null;
  source_tag?: string | null;
  audio_url?: string | null;
  image_url?: string | null;
  answers?: Answer[];
  sample_essay_answer?: string | null;
  hints?: string[];
  rubric?: RubricItem[];
  // Dành cho GROUP_QUESTIONS (Chùm câu hỏi ngữ liệu)
  passage_content?: string | null;
  sub_questions?: Question[];
  // Dành cho MATCHING
  matching_pairs?: MatchingPair[];
  // Dành cho ORDERING
  ordering_items?: OrderingItem[];
  // Dành cho CLOZE_DROPDOWN
  cloze_blanks?: ClozeBlank[];
  explain?: string | null;
  count_used?: number;
  created_at?: string;
  updated_at?: string;
}

/** ERD: QuestionBank */
export interface QuestionBank {
  id: string;
  title: string;
  owner_id?: string | null;
  school_id?: string | null;
  teacher_name?: string | null;
  department_name?: string | null;
  grade_level?: string | null;
  chapter_name?: string | null;
  is_premium: boolean;
  status?: QuestionBankReviewStatus;
  review_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
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

export type ExamScopeMode = 'CHAPTER_FOCUSED' | 'SEMESTER' | 'NATIONAL_EXAM';

/** Cấu hình sinh đề thi tự động theo ma trận */
export interface ExamMatrixConfig {
  title: string;
  subject: string;
  grade_level: string;
  total_questions: number;
  duration_minutes: number;
  pass_score: number;
  scope_mode?: ExamScopeMode;
  current_chapter?: string;
  previous_chapters?: string[];
  selected_chapters?: string[];
  scope_ratio: {
    current_chapter: number;     // % Chương trọng tâm (e.g. 70)
    previous_chapters: number;   // % Các chương cũ liên quan (e.g. 30)
  };
  difficulty_ratio: {
    recognition: number;         // % Nhận biết (e.g. 40)
    understanding: number;       // % Thông hiểu (e.g. 30)
    application: number;         // % Vận dụng (e.g. 20)
    advanced_application: number;// % Vận dụng cao (e.g. 10)
  };
  variant_count: 2 | 4 | 8;      // Số lượng mã đề cần sinh (e.g. 4)
  variant_prefix?: string;       // Tiền tố mã đề (e.g. "10", "20")
  access_tier?: 'FREE_TRIAL' | 'PRO';
  upsell_course_id?: string;
}

/** Mã đề thi được sinh ra (e.g. Đề 101, 102...) */
export interface ExamVariant {
  variant_code: string;          // e.g. "101", "102"
  title: string;
  total_questions: number;
  duration_minutes: number;
  questions: Question[];
  answer_key: Record<string, string | string[]>; // Map question_id -> đáp án đúng
}

/** Lỗi bắt được khi import file Word / Excel */
export interface ParseError {
  row_or_index: number;
  question_title?: string;
  field?: string;
  error_type:
    | 'MISSING_CONTENT'
    | 'MISSING_CORRECT_ANSWER'
    | 'INVALID_FORMAT'
    | 'INVALID_DIFFICULTY'
    | 'NOT_ENOUGH_ANSWERS';
  message: string;
  raw_data?: any;
}
