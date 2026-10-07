import type { PracticeLevel } from '@/types/subject';
import type {
  ExamQuestion,
  ExamFormat,
  QuestionDifficulty,
} from './practice-flow-data';

// =========================================================================
// 1. MA TRẬN PHÂN BỔ TỈ LỆ ĐỘ KHÓ THEO CẤP ĐỘ (LEVEL)
// =========================================================================
export const LEVEL_DIFFICULTY_MATRIX: Record<
  PracticeLevel,
  Record<QuestionDifficulty, number>
> = {
  // Cơ bản: 70% Dễ, 30% Trung bình
  BASIC: {
    EASY: 0.7,
    MEDIUM: 0.3,
    HARD: 0.0,
    VERY_HARD: 0.0,
  },
  // Trung bình: 40% Dễ, 40% Trung bình, 20% Khó
  MEDIUM: {
    EASY: 0.4,
    MEDIUM: 0.4,
    HARD: 0.2,
    VERY_HARD: 0.0,
  },
  // Nâng cao: 20% Dễ, 30% Trung bình, 35% Khó, 15% Vận dụng cao
  ADVANCED: {
    EASY: 0.2,
    MEDIUM: 0.3,
    HARD: 0.35,
    VERY_HARD: 0.15,
  },
  // HSG Tỉnh: 0% Dễ, 15% Trung bình, 45% Khó, 40% Vận dụng cao
  PROVINCIAL_EXCELLENT: {
    EASY: 0.0,
    MEDIUM: 0.15,
    HARD: 0.45,
    VERY_HARD: 0.4,
  },
  // HSG Quốc Gia: 0% Dễ, 0% Trung bình, 30% Khó, 70% Vận dụng cao
  NATIONAL_EXCELLENT: {
    EASY: 0.0,
    MEDIUM: 0.0,
    HARD: 0.3,
    VERY_HARD: 0.7,
  },
  // Đánh Giá Năng Lực: Phân hóa đa tầng (30% Dễ, 40% TB, 20% Khó, 10% VDC)
  ASSESSMENT: {
    EASY: 0.3,
    MEDIUM: 0.4,
    HARD: 0.2,
    VERY_HARD: 0.1,
  },
};

// =========================================================================
// 2. TỈ LỆ CÂU HỎI LIÊN QUAN TỚI CHƯƠNG TRƯỚC (PREVIOUS CHAPTER RATIO)
// =========================================================================
// Nếu chapter > 1: 80% câu chương hiện tại, 20% câu thuộc các chương trước
export const PREVIOUS_CHAPTER_RATIO = 0.2;

export function getActiveMatrixConfig(): Record<PracticeLevel, Record<QuestionDifficulty, number>> {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('schoolify_custom_matrix');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }
  return LEVEL_DIFFICULTY_MATRIX;
}

export function getActivePreviousChapterRatio(): number {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('schoolify_previous_chapter_ratio');
      if (saved) return parseFloat(saved);
    } catch (e) {
      // fallback
    }
  }
  return PREVIOUS_CHAPTER_RATIO;
}

export function saveActiveMatrixConfig(
  matrix: Record<PracticeLevel, Record<QuestionDifficulty, number>>,
  previousRatio?: number
) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('schoolify_custom_matrix', JSON.stringify(matrix));
    if (typeof previousRatio === 'number') {
      localStorage.setItem('schoolify_previous_chapter_ratio', previousRatio.toString());
    }
  }
}

export function resetActiveMatrixConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('schoolify_custom_matrix');
    localStorage.removeItem('schoolify_previous_chapter_ratio');
  }
}

export interface MatrixGenerationConfig {
  subjectSlug: string;
  grade: number;
  chapterId: number;
  level: PracticeLevel;
  format: ExamFormat;
  totalQuestions: number;
  quizCount?: number;
  essayCount?: number;
}

export interface MatrixQuota {
  currentChapter: Record<QuestionDifficulty, number>;
  previousChapters: Record<QuestionDifficulty, number>;
  totalCurrent: number;
  totalPrevious: number;
}

/**
 * Tính toán số lượng câu hỏi cụ thể cho từng ô ma trận:
 * [Chương hiện tại / Chương trước] x [Dễ / Trung bình / Khó / Vận dụng cao]
 */
export function calculateMatrixQuota(
  totalCount: number,
  level: PracticeLevel,
  chapterId: number
): MatrixQuota {
  const activeMatrix = getActiveMatrixConfig();
  const diffRatios = activeMatrix[level] || LEVEL_DIFFICULTY_MATRIX[level] || LEVEL_DIFFICULTY_MATRIX.BASIC;
  const prevRatio = getActivePreviousChapterRatio();

  // Nếu là Chương 1: 100% thuộc Chương 1
  // Nếu là Chương >= 2: tỷ lệ câu chương trước, còn lại câu chương hiện tại
  const hasPreviousChapters = chapterId > 1;
  const targetPrevious = hasPreviousChapters ? Math.max(1, Math.round(totalCount * prevRatio)) : 0;
  const targetCurrent = totalCount - targetPrevious;

  const currentCounts: Record<QuestionDifficulty, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    VERY_HARD: 0,
  };
  const prevCounts: Record<QuestionDifficulty, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    VERY_HARD: 0,
  };

  const difficulties: QuestionDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'];

  // Phân bổ câu chương hiện tại theo tỉ lệ độ khó
  let currentAssigned = 0;
  difficulties.forEach((d) => {
    const count = Math.round(targetCurrent * diffRatios[d]);
    currentCounts[d] = count;
    currentAssigned += count;
  });

  // Điều chỉnh sai số làm tròn cho chương hiện tại
  let diffCurrent = targetCurrent - currentAssigned;
  if (diffCurrent !== 0) {
    const primaryDiff = diffRatios.EASY >= diffRatios.MEDIUM ? 'EASY' : 'MEDIUM';
    currentCounts[primaryDiff] = Math.max(0, currentCounts[primaryDiff] + diffCurrent);
  }

  // Phân bổ câu chương trước theo tỉ lệ độ khó
  if (targetPrevious > 0) {
    let prevAssigned = 0;
    difficulties.forEach((d) => {
      const count = Math.round(targetPrevious * diffRatios[d]);
      prevCounts[d] = count;
      prevAssigned += count;
    });

    let diffPrev = targetPrevious - prevAssigned;
    if (diffPrev !== 0) {
      const primaryDiff = diffRatios.EASY >= diffRatios.MEDIUM ? 'EASY' : 'MEDIUM';
      prevCounts[primaryDiff] = Math.max(0, prevCounts[primaryDiff] + diffPrev);
    }
  }

  return {
    currentChapter: currentCounts,
    previousChapters: prevCounts,
    totalCurrent: targetCurrent,
    totalPrevious: targetPrevious,
  };
}

/**
 * Thuật toán Shuffle Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Thuật toán bốc câu hỏi từ Kho câu hỏi dựa trên ma trận
 */
export function generateQuestionsByMatrix(
  questionBank: ExamQuestion[],
  config: MatrixGenerationConfig
): ExamQuestion[] {
  const { grade, chapterId, level, format } = config;
  const isMixed = format === 'MIXED';

  if (isMixed) {
    const targetQuiz = config.quizCount || 10;
    const targetEssay = config.essayCount || 2;

    const quizQuestions = sampleQuestionsForType(
      questionBank.filter((q) => q.type !== 'ESSAY'),
      { ...config, totalQuestions: targetQuiz, format: 'QUIZ' },
      'QUIZ'
    );

    const essayQuestions = sampleQuestionsForType(
      questionBank.filter((q) => q.type === 'ESSAY'),
      { ...config, totalQuestions: targetEssay, format: 'ESSAY' },
      'ESSAY'
    );

    // Điểm: Trắc nghiệm chiếm 7 điểm, Tự luận chiếm 3 điểm (chuẩn đề thi THPT)
    const quizScoreEach = Math.round((7 / Math.max(1, quizQuestions.length)) * 100) / 100;
    const essayScoreEach = Math.round((3 / Math.max(1, essayQuestions.length)) * 100) / 100;

    const finalQuestions: ExamQuestion[] = [
      ...quizQuestions.map((q, idx) => ({
        ...q,
        title: `Câu ${idx + 1} (${getQuestionTypeLabel(q.type)}): ${cleanTitle(q.title)}`,
        score: quizScoreEach,
      })),
      ...essayQuestions.map((q, idx) => ({
        ...q,
        title: `Câu ${quizQuestions.length + idx + 1} (Tự luận): ${cleanTitle(q.title)}`,
        score: essayScoreEach,
      })),
    ];

    return finalQuestions;
  }

  // QUIZ hoặc ESSAY đơn thuần
  const filteredBank =
    format === 'ESSAY'
      ? questionBank.filter((q) => q.type === 'ESSAY')
      : questionBank.filter((q) => q.type !== 'ESSAY');

  const picked = sampleQuestionsForType(filteredBank, config, format);
  const scoreEach = Math.round((10 / Math.max(1, picked.length)) * 100) / 100;

  return picked.map((q, idx) => ({
    ...q,
    title: `Câu ${idx + 1}: ${cleanTitle(q.title)}`,
    score: scoreEach,
  }));
}

/**
 * Bốc tập câu hỏi cho một phân loại đề (Quiz hoặc Essay)
 */
function sampleQuestionsForType(
  candidateBank: ExamQuestion[],
  config: MatrixGenerationConfig,
  format: ExamFormat
): ExamQuestion[] {
  const { totalQuestions, level, chapterId, grade } = config;
  const quota = calculateMatrixQuota(totalQuestions, level, chapterId);

  const currentChapterPool = candidateBank.filter(
    (q) =>
      (!config.subjectSlug || !q.subjectSlug || q.subjectSlug === config.subjectSlug) &&
      q.chapterId === chapterId &&
      (!grade || q.grade === grade)
  );

  const prevChapterPool = candidateBank.filter(
    (q) =>
      (!config.subjectSlug || !q.subjectSlug || q.subjectSlug === config.subjectSlug) &&
      (q.chapterId < chapterId || q.isPreviousChapterReview) &&
      (!grade || q.grade === grade)
  );

  const selectedQuestions: ExamQuestion[] = [];
  const selectedIds = new Set<string>();

  const difficulties: QuestionDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'];

  // 1. Bốc câu hỏi cho Chương Hiện Tại theo từng mức độ
  difficulties.forEach((diff) => {
    const needed = quota.currentChapter[diff];
    if (needed <= 0) return;

    const available = shuffleArray(
      currentChapterPool.filter((q) => q.difficulty === diff && !selectedIds.has(q.id))
    );

    const taken = available.slice(0, needed);
    taken.forEach((q) => {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    });

    // Fallback trong chương hiện tại nếu thiếu mức độ này
    if (taken.length < needed) {
      const remainingNeeded = needed - taken.length;
      const fallbackPool = shuffleArray(
        currentChapterPool.filter((q) => !selectedIds.has(q.id))
      );
      const fallbackTaken = fallbackPool.slice(0, remainingNeeded);
      fallbackTaken.forEach((q) => {
        selectedQuestions.push(q);
        selectedIds.add(q.id);
      });
    }
  });

  // 2. Bốc câu hỏi cho Các Chương Trước (nếu có yêu cầu)
  if (quota.totalPrevious > 0) {
    difficulties.forEach((diff) => {
      const needed = quota.previousChapters[diff];
      if (needed <= 0) return;

      const available = shuffleArray(
        prevChapterPool.filter((q) => q.difficulty === diff && !selectedIds.has(q.id))
      );

      const taken = available.slice(0, needed);
      taken.forEach((q) => {
        selectedQuestions.push({
          ...q,
          isPreviousChapterReview: true,
        });
        selectedIds.add(q.id);
      });

      // Fallback trong chương trước nếu thiếu mức độ này
      if (taken.length < needed) {
        const remainingNeeded = needed - taken.length;
        const fallbackPool = shuffleArray(
          prevChapterPool.filter((q) => !selectedIds.has(q.id))
        );
        const fallbackTaken = fallbackPool.slice(0, remainingNeeded);
        fallbackTaken.forEach((q) => {
          selectedQuestions.push({
            ...q,
            isPreviousChapterReview: true,
          });
          selectedIds.add(q.id);
        });
      }
    });
  }

  // 3. Fallback tối hậu: Nếu tổng câu bốc được vẫn chưa đủ totalQuestions
  if (selectedQuestions.length < totalQuestions) {
    const deficit = totalQuestions - selectedQuestions.length;
    const remainingInEntireBank = shuffleArray(
      candidateBank.filter((q) => !selectedIds.has(q.id))
    );
    const bonus = remainingInEntireBank.slice(0, deficit);
    bonus.forEach((q) => {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    });
  }

  // 4. Nếu toàn bộ kho câu hỏi vẫn ít hơn totalQuestions (tạo biến thể bản sao có hậu tố _var)
  if (selectedQuestions.length < totalQuestions && selectedQuestions.length > 0) {
    const baseList = [...selectedQuestions];
    let idx = 0;
    while (selectedQuestions.length < totalQuestions) {
      const baseQ = baseList[idx % baseList.length];
      const variantIdx = Math.floor(idx / baseList.length) + 1;
      selectedQuestions.push({
        ...baseQ,
        id: `${baseQ.id}_var${variantIdx}`,
      });
      idx++;
    }
  }

  return shuffleArray(selectedQuestions);
}

function cleanTitle(title: string): string {
  return title.replace(/^Câu \d+(\s*\([^)]*\))?:\s*/, '').trim();
}

function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'Trắc nghiệm';
    case 'TRUE_FALSE':
      return 'Đúng/Sai';
    case 'SHORT_ANSWER':
      return 'Điền số';
    case 'ESSAY':
      return 'Tự luận';
    default:
      return 'Khảo thí';
  }
}
