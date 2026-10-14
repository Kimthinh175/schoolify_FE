// TypeScript types cho 4 Phần Nội dung của mỗi Bài học (Lesson Content Sections)

// -------------------------------------------------------------
// PHẦN 1: THEORY SECTION (Lý Thuyết - Định nghĩa, Công thức & Ví dụ mẫu)
// -------------------------------------------------------------
export interface TheoryDefinition {
  id: string;
  title: string;
  summary: string;
  highlightedKeywords: string[];
  keyNotes?: string[];
}

export interface TheoryFormula {
  id: string;
  category: string;
  name: string;
  expressionLatex: string;
  condition?: string;
  explanation?: string;
}

export interface ExampleStep {
  stepNumber: number;
  title: string;
  content: string;
  formulaUsed?: string;
}

export interface TheoryExample {
  id: string;
  title: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  problemStatement: string;
  steps: ExampleStep[];
  finalAnswer: string;
}

export interface TheorySection {
  definitions: TheoryDefinition[];
  formulas: TheoryFormula[];
  examples: TheoryExample[];
}

// -------------------------------------------------------------
// PHẦN 2: QUIZ SECTION (Trắc Nghiệm Luyện Tập Bài Học)
// -------------------------------------------------------------
export interface QuizOption {
  id: string;
  content: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  number: number;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  content: string;
  options: QuizOption[];
  explain?: string;
}

export interface QuizSection {
  title: string;
  description: string;
  totalQuestions: number;
  passingScorePct: number;
  questions: QuizQuestion[];
}

// -------------------------------------------------------------
// PHẦN 3: ESSAY SECTION (Bài Tập Tự Luận)
// -------------------------------------------------------------
export interface EssayProblem {
  id: string;
  number: number;
  title: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  problemStatement: string;
  hints?: string[];
  sampleSolution: string;
  maxPoints: number;
}

export interface EssaySection {
  title: string;
  description: string;
  problems: EssayProblem[];
}

// -------------------------------------------------------------
// PHẦN 4: LESSON EXAM SECTION (Bài Kiểm Tra Tổng Hợp Bài Học)
// -------------------------------------------------------------
export interface LessonExamQuestion {
  id: string;
  number: number;
  type: 'SINGLE_CHOICE' | 'ESSAY';
  points: number;
  content: string;
  options?: QuizOption[];
  explain?: string;
}

export interface LessonExamConfig {
  examId: string;
  title: string;
  durationMins: number;
  totalQuestions: number;
  maxScore: number;
  passingScore: number;
  questions: LessonExamQuestion[];
}

export interface LessonExamSection {
  title: string;
  description: string;
  examConfig: LessonExamConfig;
}

// -------------------------------------------------------------
// WRAPPER CHO TOÀN BỘ NỘI DUNG 4 PHẦN CỦA MỖI BÀI HỌC
// -------------------------------------------------------------
export interface LessonFullContent {
  lessonId: string;
  lessonTitle: string;
  theory: TheorySection;
  quiz: QuizSection;
  essay: EssaySection;
  exam: LessonExamSection;
}
