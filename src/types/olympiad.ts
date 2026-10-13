export interface OlympiadRubricStep {
  step: number;
  criterion: string;
  maxPoints: number;
}

export interface OlympiadSubPart {
  subId: string; // 'a', 'b', 'c'
  title: string; // 'Ý a: Tìm điều kiện xác định và rút gọn biểu thức P'
  points: number; // 2.0
  targetAnswer: string; // Đáp số cốt lõi (ví dụ: 'P = (sqrt(x) + 1)/(sqrt(x) - 1)')
  targetKeywords: string[]; // Các từ khóa/ký hiệu nhận diện
  rubric: OlympiadRubricStep[];
  solutionSample: string; // Lời giải mẫu chuẩn sư phạm
}

export interface OlympiadMathProblem {
  id: string;
  problemNumber: number; // 1, 2, 3...
  title: string; // 'Bài 1: Rút gọn biểu thức & Phương trình vô tỉ'
  points: number; // 4.0
  topic: string; // 'Đại số' | 'Hình học phẳng' | 'Số học' | 'Bất đẳng thức' | 'Tổ hợp'
  content: string; // Đề bài
  subParts: OlympiadSubPart[];
}

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  explanation?: string;
  points: number;
}

export interface CodingProblem {
  id: string;
  problemNumber: number; // 1, 2, 3
  title: string;
  points: number; // Thang 20 điểm
  timeLimitMs: number; // 1000ms
  memoryLimitMb: number; // 256MB
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sampleTests: CodingTestCase[];
  hiddenTests: CodingTestCase[];
  starterCode: {
    cpp: string;
    c: string;
    python: string;
  };
  solutionCode?: {
    cpp: string;
    python: string;
  };
  editorial: string;
  timeComplexityTarget: string; // 'O(N log N)'
}

export interface OlympiadExam {
  id: string;
  subjectSlug: string;
  subjectName: string;
  level: 'PROVINCIAL_EXCELLENT' | 'NATIONAL_EXCELLENT';
  levelLabel: string; // 'HSG Cấp Tỉnh' | 'HSG Quốc Gia'
  province?: string; // 'Hà Nội', 'Nghệ An', 'Nam Định', 'TP. Hồ Chí Minh'
  year: string; // '2025 - 2026'
  title: string;
  description: string;
  durationMinutes: number; // 120, 150, 180
  totalPoints: number; // 20
  pointsReward: number; // 100, 200 💎
  examType: 'ESSAY' | 'CODING';
  mathProblems?: OlympiadMathProblem[];
  codingProblems?: CodingProblem[];
}

export interface SubPartGradingResult {
  subId: string;
  pointsEarned: number;
  maxPoints: number;
  answerMatchStatus: 'MATCHED' | 'PARTIALLY_MATCHED' | 'MISMATCHED';
  answerMatchNote: string;
  rubricBreakdown: {
    step: number;
    criterion: string;
    pointsAwarded: number;
    maxPoints: number;
    passed: boolean;
    note: string;
  }[];
  feedback: string;
}

export interface ProblemGradingResult {
  problemId: string;
  problemNumber: number;
  title: string;
  pointsEarned: number;
  maxPoints: number;
  subPartResults: SubPartGradingResult[];
}

export interface OlympiadGradingReport {
  examId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  rankingClassification: 'GIẢI NHẤT' | 'GIẢI NHÌ' | 'GIẢI BA' | 'KHUYẾN KHÍCH' | 'CẦN CỐ GẮNG';
  overallTeacherComments: string;
  problemResults: ProblemGradingResult[];
  gradedAt: string;
}
