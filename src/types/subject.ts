export type PracticeLevel = 
  | 'BASIC'                 // 1. Cơ bản (SGK)
  | 'MEDIUM'                // 2. Trung bình (Học kỳ / Tốt nghiệp)
  | 'ADVANCED'              // 3. Nâng cao (Vận dụng cao 9-10)
  | 'PROVINCIAL_EXCELLENT'  // 4. HSG Tỉnh / Thành phố
  | 'NATIONAL_EXCELLENT'   // 5. HSG Quốc Gia / Olympic
  | 'ASSESSMENT';           // 6. Đánh giá năng lực

export interface LevelDetail {
  id: PracticeLevel;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  badgeColor: string;
  gradient: string;
  pointsReward: number; // 💎 Kim cương thưởng
  totalExams: number;
}

export interface K12Subject {
  id: string;
  slug: string;
  name: string;
  shortCode: string;
  iconName: string;
  themeColor: string;
  bgLight: string;
  borderColor: string;
  badgeBg: string;
  totalExams: number;
  completedExams?: number;
  description: string;
  category: 'NATURAL' | 'SOCIAL' | 'LANGUAGE' | 'TECH';
}

export interface PracticeExamItem {
  id: string;
  subjectSlug: string;
  subjectName: string;
  level: PracticeLevel;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  pointsReward: number;
  gradeLevel: number;
  year?: string;
  attemptsCount: number;
  highestScore?: number | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

// ── Lộ Trình Bài Luyện (Bài 1 -> Bài N) ──
export interface TheoryPoint {
  title: string;
  content: string;
  formula?: string;
}

export interface TheorySection {
  summary: string;
  points: TheoryPoint[];
  exampleProblem: {
    title: string;
    statement: string;
    solution: string;
    note?: string;
  };
  documentDownloadUrl?: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSection {
  totalQuestions: number;
  estimatedMinutes: number;
  questions: QuizItem[];
}

export interface EssayItem {
  id: string;
  title: string;
  problem: string;
  hint: string;
  solution: string;
  scoreRubric: { criterion: string; points: number }[];
  maxPoints: number;
}

export interface EssaySection {
  totalExercises: number;
  exercises: EssayItem[];
}

export interface LessonExamSection {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  passScore: number;
  rewardDiamonds: number;
}

export interface PracticeLesson {
  id: string;
  lessonNumber: number; // Bài 1 -> Bài N
  subjectSlug: string;
  level: PracticeLevel;
  title: string;
  description: string;
  theory: TheorySection;
  quiz: QuizSection;
  essay: EssaySection;
  exam: LessonExamSection;
  progressPct: number; // 0 - 100%
  completedParts: ('theory' | 'quiz' | 'essay' | 'exam')[];
  estimatedTotalMinutes: number;
}
