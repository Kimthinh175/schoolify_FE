<<<<<<< HEAD
export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'SHORT_ANSWER'
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

=======
import type { PracticeLevel } from './subject';

export type QuestionType = 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE' | 'FILL_BLANK';
>>>>>>> 7db6a01c8d7f2ce0a5c8c0369cdfa5dacb890043
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

<<<<<<< HEAD
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
=======
/**
 * Độ khó của câu hỏi — dùng chung thang 5 cấp với lộ trình luyện thi
 * (BASIC → NATIONAL_EXCELLENT) để FE chỉ có một nguồn sự thật.
 */
export type QuestionDifficulty = PracticeLevel;

/** Liên kết tới chương học mà câu hỏi thuộc về. */
export interface QuestionChapterRef {
  id?: string | null;
  /** VD: "Chương 1: Động lực học chất điểm" */
  title: string;
  /** Nếu có, UI sẽ render thành link điều hướng tới chương. */
  href?: string | null;
>>>>>>> 7db6a01c8d7f2ce0a5c8c0369cdfa5dacb890043
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
<<<<<<< HEAD
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
  // Dành cho 4 danh mục câu hỏi chuẩn GDPT 2018 / Bộ GD&ĐT 2025
  choices?: { key: string; content: string }[];
  correctChoice?: string;
  statements?: { subId: string; statement: string; isCorrect: boolean; explanation?: string }[];
  shortAnswerCorrect?: string;
  gradingRubric?: { step: string; point: number; detail: string }[];
  section_title?: string;
  count_used?: number;
=======
  /** Optional — data cũ có thể thiếu, UI sẽ tự ẩn badge. */
  difficulty?: QuestionDifficulty | null;
  /** Optional — chấp nhận chuỗi (data cũ) hoặc object có `href`. */
  chapter?: QuestionChapterRef | string | null;
>>>>>>> 7db6a01c8d7f2ce0a5c8c0369cdfa5dacb890043
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

/** Phân bổ 4 danh mục câu hỏi chuẩn Bộ GD&ĐT 2025 */
export interface ExamCategoryDistribution {
  multiple_choice: number; // Phần I: Trắc nghiệm 4 lựa chọn (số lượng câu)
  true_false: number;      // Phần II: Đúng / Sai 4 ý a,b,c,d (số lượng câu)
  short_answer: number;    // Phần III: Trả lời ngắn / điền số (số lượng câu)
  essay: number;           // Phần IV: Tự luận kèm barem (số lượng câu)
}

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
  category_distribution?: ExamCategoryDistribution; // Phân bổ 4 danh mục
  variant_count: 2 | 4 | 8;      // Số lượng mã đề cần sinh (e.g. 4)
  variant_prefix?: string;       // Tiền tố mã đề (e.g. "10", "20")
  access_tier?: 'FREE_TRIAL' | 'PRO';
  upsell_course_id?: string;
}

/** Từng phần trong cấu trúc đề thi chuẩn Bộ GD&ĐT 2025 */
export interface ExamVariantPart {
  part_number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  question_type: QuestionType;
  questions: Question[];
  points_per_question: number;
  total_points: number;
}

/** Mã đề thi được sinh ra (e.g. Đề 101, 102...) */
export interface ExamVariant {
  variant_code: string;          // e.g. "101", "102"
  title: string;
  total_questions: number;
  duration_minutes: number;
  questions: Question[];
  answer_key: Record<string, string | string[]>; // Map question_id -> đáp án đúng
  parts?: ExamVariantPart[];     // Chia 4 phần chuẩn Bộ GD&ĐT
  total_score?: number;          // Điểm tối đa (thang 10)
}

/** Payload chuẩn gửi Backend API để sinh đề theo ma trận */
export interface ExamMatrixApiPayload {
  exam_info: {
    title: string;
    subject: string;
    grade_level: string;
    duration_minutes: number;
    pass_score: number;
    access_tier: 'FREE_TRIAL' | 'PRO';
    upsell_course_id?: string;
  };
  scope_config: {
    scope_mode: ExamScopeMode;
    current_chapter?: string;
    previous_chapters?: string[];
    selected_chapters?: string[];
    scope_ratio: {
      current_chapter_percentage: number;
      previous_chapters_percentage: number;
    };
  };
  matrix_blueprint: {
    total_questions: number;
    category_distribution: ExamCategoryDistribution;
    bloom_ratio: {
      recognition_percentage: number;         // Nhận biết
      understanding_percentage: number;       // Thông hiểu
      application_percentage: number;         // Vận dụng
      advanced_application_percentage: number;// Vận dụng cao
    };
  };
  variants_config: {
    variant_count: 2 | 4 | 8;
    variant_prefix: string;
    shuffle_questions: boolean;
    shuffle_choices: boolean;
  };
  metadata?: {
    created_by?: string;
    client_timestamp: string;
    standards: string;
  };
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
