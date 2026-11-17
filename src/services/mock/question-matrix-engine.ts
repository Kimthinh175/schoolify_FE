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

// Ma trận chuẩn cấu trúc Đề Thi Thử THPT (40% Nhận biết - 30% Thông hiểu - 20% Vận dụng - 10% Vận dụng cao)
export const STANDARD_MOCK_EXAM_DIFFICULTY_MATRIX: Record<QuestionDifficulty, number> = {
  EASY: 0.4,
  MEDIUM: 0.3,
  HARD: 0.2,
  VERY_HARD: 0.1,
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
  practiceMode?: 'TOPIC' | 'MOCK_EXAM';
  targetDifficulty?: QuestionDifficulty | 'ALL';
  topicTagFilter?: string;
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
  chapterId: number,
  practiceMode?: 'TOPIC' | 'MOCK_EXAM',
  targetDifficulty?: QuestionDifficulty | 'ALL'
): MatrixQuota {
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

  // Chế độ 1: Luyện tập theo chuyên đề (TOPIC) với mức độ nhận thức cụ thể
  if (practiceMode === 'TOPIC' && targetDifficulty && targetDifficulty !== 'ALL') {
    currentCounts[targetDifficulty] = totalCount;
    return {
      currentChapter: currentCounts,
      previousChapters: prevCounts,
      totalCurrent: totalCount,
      totalPrevious: 0,
    };
  }

  const activeMatrix = getActiveMatrixConfig();
  const diffRatios =
    practiceMode === 'MOCK_EXAM'
      ? STANDARD_MOCK_EXAM_DIFFICULTY_MATRIX
      : activeMatrix[level] || LEVEL_DIFFICULTY_MATRIX[level] || LEVEL_DIFFICULTY_MATRIX.BASIC;
  const prevRatio = getActivePreviousChapterRatio();

  // Nếu là MOCK_EXAM, TOPIC hoặc Chương 1: 100% nằm trong pool chính
  // Nếu là Luyện theo chương truyền thống (Chương >= 2): tỷ lệ câu chương trước, còn lại câu chương hiện tại
  const hasPreviousChapters = practiceMode !== 'MOCK_EXAM' && practiceMode !== 'TOPIC' && chapterId > 1;
  const targetPrevious = hasPreviousChapters ? Math.max(1, Math.round(totalCount * prevRatio)) : 0;
  const targetCurrent = totalCount - targetPrevious;

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
 * Chuẩn hóa tên/slug môn học để so khớp chính xác
 */
function normalizeSubject(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function isSubjectMatch(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const normA = normalizeSubject(a);
  const normB = normalizeSubject(b);
  if (normA === normB) return true;

  const gdcdGroup = [
    'gdcd',
    'gdkt',
    'gdkt phap luat',
    'gdkt va phap luat',
    'giao duc cong dan',
    'giao duc kinh te va phap luat',
    'phap luat',
  ];
  if (gdcdGroup.includes(normA) && gdcdGroup.includes(normB)) return true;

  const khtnGroup = ['khtn', 'khoa hoc tu nhien'];
  if (khtnGroup.includes(normA) && khtnGroup.includes(normB)) return true;

  const vatLyGroup = ['vat ly', 'vat li'];
  if (vatLyGroup.includes(normA) && vatLyGroup.includes(normB)) return true;

  const diaLyGroup = ['dia ly', 'dia li'];
  if (diaLyGroup.includes(normA) && diaLyGroup.includes(normB)) return true;

  const suGroup = ['lich su', 'su'];
  if (suGroup.includes(normA) && suGroup.includes(normB)) return true;

  const sinhGroup = ['sinh hoc', 'sinh'];
  if (sinhGroup.includes(normA) && sinhGroup.includes(normB)) return true;

  const hoaGroup = ['hoa hoc', 'hoa'];
  if (hoaGroup.includes(normA) && hoaGroup.includes(normB)) return true;

  const toanGroup = ['toan hoc', 'toan'];
  if (toanGroup.includes(normA) && toanGroup.includes(normB)) return true;

  const tinGroup = ['tin hoc', 'tin'];
  if (tinGroup.includes(normA) && tinGroup.includes(normB)) return true;

  const cnGroup = ['cong nghe', 'cn'];
  if (cnGroup.includes(normA) && cnGroup.includes(normB)) return true;

  const anhGroup = ['tieng anh', 'anh'];
  if (anhGroup.includes(normA) && anhGroup.includes(normB)) return true;

  const vanGroup = ['ngu van', 'van'];
  if (vanGroup.includes(normA) && vanGroup.includes(normB)) return true;

  return false;
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

function hashStringToUint32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function hasPositionDependentAnswerText(contents: string[]): boolean {
  const positionalRegex =
    /(cả\s+[abc]\b|tất\s+cả\s+(đều|các|ý|phương\s+án)|không\s+có\s+(đáp\s+án|phương\s+án)|đáp\s+án\s+khác|[abc]\s+và\s+[bcd]\s+đều|[abc]\s*,\s*[bcd]\s+(đều|đúng|sai))/i;
  return contents.some((text) => positionalRegex.test(String(text || '')));
}

/**
 * Đảo vị trí 4 phương án A, B, C, D với cam kết dịch chuyển khác vị trí gốc (Derangement / Non-Identity Shift)
 * và cập nhật lại correctChoice tương ứng.
 */
export function permuteQuestionChoicesGuaranteedShift(
  q: ExamQuestion,
  seedStr: string
): ExamQuestion {
  if (
    q.type !== 'MULTIPLE_CHOICE' ||
    !Array.isArray(q.choices) ||
    q.choices.length < 2 ||
    hasPositionDependentAnswerText(q.choices.map((c) => c.content))
  ) {
    return q;
  }

  const n = q.choices.length;
  const h1 = hashStringToUint32(`${seedStr}:${q.id}:shift`);
  const shift = (h1 % (n - 1)) + 1; // 1 .. n-1 (cam kết luôn đổi vị trí!)
  const shifted = new Array(n);
  for (let i = 0; i < n; i++) {
    shifted[(i + shift) % n] = q.choices[i];
  }
  if (n >= 4) {
    const h2 = hashStringToUint32(`${seedStr}:${q.id}:swap`);
    if (h2 % 2 === 1) {
      const tmp = shifted[1];
      shifted[1] = shifted[3];
      shifted[3] = tmp;
    }
  }

  const keys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  let newCorrectChoice: 'A' | 'B' | 'C' | 'D' = q.correctChoice || 'A';

  const newChoices = shifted.map((origChoice, idx) => {
    const newKey = keys[idx] || ('A' as const);
    if (origChoice.key === q.correctChoice) {
      newCorrectChoice = newKey;
    }
    return {
      ...origChoice,
      key: newKey,
    };
  });

  return {
    ...q,
    choices: newChoices,
    correctChoice: newCorrectChoice,
  };
}

/**
 * Bốc mẫu Đa Chu Kỳ (Multi-Epoch Coprime LCG Stride + Boundary Cooldown) trên bể câu hỏi đã lọc:
 * - Chưa hết bể (Epoch 0): Đi qua đúng 100% câu trong bể mà không bao giờ trùng lặp.
 * - Khi chạm đáy bể (Epoch >= 1): Tự động tăng Epoch, đổi hoán vị mới, chặn trùng giáp ranh và tự động đảo vị trí đáp án A/B/C/D!
 */
function samplePoolWithMultiEpochStride(
  pool: ExamQuestion[],
  needed: number,
  poolKey: string
): ExamQuestion[] {
  const m = pool.length;
  if (m === 0 || needed <= 0) return [];

  const storageKey = `schoolify_pool_cursor_${poolKey}`;
  let cursorPos = 0;
  let epoch = 0;
  let lastBoundaryIds: string[] = [];
  let clientSeed = 'local-student';

  if (typeof window !== 'undefined') {
    try {
      let savedSeed = localStorage.getItem('schoolify_client_seed');
      if (!savedSeed) {
        savedSeed = `seed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('schoolify_client_seed', savedSeed);
      }
      clientSeed = savedSeed;

      const rawCursor = localStorage.getItem(storageKey);
      if (rawCursor) {
        const parsed = JSON.parse(rawCursor);
        cursorPos = Math.max(0, Number(parsed.cursorPos || 0) % m);
        epoch = Math.max(0, Number(parsed.epoch || 0));
        if (Array.isArray(parsed.lastBoundaryIds)) {
          lastBoundaryIds = parsed.lastBoundaryIds;
        }
      }
    } catch {}
  }

  const buildPermutation = (ep: number, cooldownSet: Set<string>): ExamQuestion[] => {
    if (m <= 1) return [...pool];
    const seedStr = `${clientSeed}:${poolKey}:ep:${ep}`;
    const rawStep = (hashStringToUint32(`${seedStr}:step`) % (m - 1)) + 1;
    let step = rawStep;
    for (let delta = 0; delta < m; delta++) {
      const candidate = ((rawStep - 1 + delta) % (m - 1)) + 1;
      if (gcd(candidate, m) === 1) {
        step = candidate;
        break;
      }
    }
    const offset = hashStringToUint32(`${seedStr}:offset`) % m;
    const permuted: ExamQuestion[] = new Array(m);
    for (let i = 0; i < m; i++) {
      permuted[i] = pool[(step * i + offset) % m];
    }
    if (ep === 0 || cooldownSet.size === 0) return permuted;
    const freshPart = permuted.filter((q) => !cooldownSet.has(q.id));
    const cooldownPart = permuted.filter((q) => cooldownSet.has(q.id));
    return [...freshPart, ...cooldownPart];
  };

  const target = Math.min(needed, m);
  const cooldownWindow = Math.min(target, Math.max(1, Math.floor(m / 2)));
  let activeBoundaryIds = [...lastBoundaryIds];
  let curEpoch = epoch;
  let curCursor = cursorPos;
  let curPerm = buildPermutation(curEpoch, new Set<string>(activeBoundaryIds));

  const picked: ExamQuestion[] = [];
  const pickedIds = new Set<string>();
  let steps = 0;

  while (picked.length < target && steps < m * 3 + target) {
    steps++;
    if (curCursor >= m) {
      const tailIds = curPerm.slice(Math.max(0, m - cooldownWindow)).map((q) => q.id);
      activeBoundaryIds = Array.from(new Set([...tailIds, ...picked.map((p) => p.id)])).slice(
        0,
        cooldownWindow
      );
      curEpoch += 1;
      curCursor = 0;
      curPerm = buildPermutation(curEpoch, new Set<string>(activeBoundaryIds));
    }
    const item = curPerm[curCursor];
    curCursor += 1;
    if (item && !pickedIds.has(item.id)) {
      pickedIds.add(item.id);
      const finalQ =
        curEpoch >= 1
          ? permuteQuestionChoicesGuaranteedShift(
              item,
              `${clientSeed}:${poolKey}:ep:${curEpoch}`
            )
          : item;
      picked.push(finalQ);
    }
  }

  let nextEpoch = curEpoch;
  let nextCursor = curCursor;
  if (nextCursor >= m) {
    activeBoundaryIds = curPerm.slice(Math.max(0, m - cooldownWindow)).map((q) => q.id);
    nextEpoch += 1;
    nextCursor = nextCursor % m;
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          cursorPos: nextCursor,
          epoch: nextEpoch,
          lastBoundaryIds: activeBoundaryIds,
        })
      );
    } catch {}
  }

  return picked;
}

/**
 * Thuật toán bốc câu hỏi từ Kho câu hỏi dựa trên ma trận
 */
export function generateQuestionsByMatrix(
  questionBank: ExamQuestion[],
  config: MatrixGenerationConfig
): ExamQuestion[] {
  const { format, subjectSlug } = config;

  // LỌC CHẶT CHẼ THEO MÔN HỌC - TUYỆT ĐỐI KHÔNG ĐỂ LẪN CÂU HỎI MÔN KHÁC
  let subjectOnlyBank = questionBank.filter((q) =>
    isSubjectMatch(q.subjectSlug || q.subjectName, subjectSlug)
  );

  if (subjectOnlyBank.length === 0 && subjectSlug) {
    subjectOnlyBank = questionBank.filter((q) =>
      isSubjectMatch(q.subjectSlug, subjectSlug) || isSubjectMatch(q.subjectName, subjectSlug)
    );
  }

  // Sử dụng ngân hàng riêng của môn này để tránh rò rỉ câu hỏi môn khác
  const bank = subjectOnlyBank.length > 0 ? subjectOnlyBank : questionBank.filter((q) => !subjectSlug || isSubjectMatch(q.subjectSlug, subjectSlug));

  // Chỉ giữ lại các câu hỏi trắc nghiệm khách quan (loại bỏ hoàn toàn câu tự luận)
  const filteredBank = bank.filter((q) => (q.type as string) !== 'ESSAY');

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
  const {
    totalQuestions,
    level,
    chapterId,
    grade,
    subjectSlug,
    practiceMode,
    targetDifficulty,
    topicTagFilter,
  } = config;
  const isFullSubjectExam = level === 'ASSESSMENT' || practiceMode === 'MOCK_EXAM';
  const quota = calculateMatrixQuota(
    totalQuestions,
    level,
    chapterId,
    practiceMode,
    targetDifficulty
  );

  // ĐÁNH GIÁ NĂNG LỰC hoặc THI THỬ CHUẨN CẤU TRÚC (MOCK_EXAM): Lấy câu hỏi trên TOÀN BỘ CÁC CHƯƠNG của môn học đó!
  // LUYỆN TẬP THEO CHUYÊN ĐỀ (TOPIC): Ưu tiên lọc theo topicTagFilter và chapterId.
  let currentChapterPool = candidateBank.filter((q) => {
    if (subjectSlug && !isSubjectMatch(q.subjectSlug || q.subjectName, subjectSlug)) return false;
    if (isFullSubjectExam) return true; // Thi thử / ĐGNL bao quát tất cả các chương trong môn
    if (topicTagFilter) {
      const normFilter = normalizeSubject(topicTagFilter);
      const qTopic = normalizeSubject(`${q.topicTag || ''} ${q.topic || ''} ${q.title || ''}`);
      if (qTopic.includes(normFilter)) return true;
    }
    return q.chapterId === chapterId;
  });

  // Nếu pool chương/tag quá ít câu, mở rộng sang toàn bộ môn học cùng khối hoặc cùng môn
  if (currentChapterPool.length === 0) {
    currentChapterPool = candidateBank.filter(
      (q) => !subjectSlug || isSubjectMatch(q.subjectSlug || q.subjectName, subjectSlug)
    );
  }

  const prevChapterPool = candidateBank.filter((q) => {
    if (subjectSlug && !isSubjectMatch(q.subjectSlug || q.subjectName, subjectSlug)) return false;
    if (grade && q.grade && q.grade !== grade) return false;
    if (isFullSubjectExam || practiceMode === 'TOPIC') return false;
    return q.chapterId < chapterId || q.isPreviousChapterReview;
  });

  const selectedQuestions: ExamQuestion[] = [];
  const selectedIds = new Set<string>();

  const difficulties: QuestionDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'];
  const basePoolKey = `${subjectSlug}:g${grade}:ch${chapterId}:${format}:${topicTagFilter || 'ALL'}`;

  // 1. Bốc câu hỏi cho Chương Hiện Tại theo con trỏ Đa Chu Kỳ (Multi-Epoch Coprime LCG Stride)
  difficulties.forEach((diff) => {
    const needed = quota.currentChapter[diff];
    if (needed <= 0) return;

    const diffPool = currentChapterPool.filter(
      (q) => q.difficulty === diff && !selectedIds.has(q.id)
    );

    const taken = samplePoolWithMultiEpochStride(
      diffPool,
      needed,
      `${basePoolKey}:cur:${diff}`
    );
    taken.forEach((q) => {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    });

    // Fallback: Nếu chọn mức độ cụ thể ở TOPIC mode nhưng chương đó thiếu câu cùng mức độ, tìm câu cùng mức độ trong toàn môn trước
    if (taken.length < needed && practiceMode === 'TOPIC' && targetDifficulty && targetDifficulty !== 'ALL') {
      const remainingNeeded = needed - taken.length;
      const sameDiffInSubject = samplePoolWithMultiEpochStride(
        candidateBank.filter(
          (q) =>
            (!subjectSlug || isSubjectMatch(q.subjectSlug || q.subjectName, subjectSlug)) &&
            q.difficulty === diff &&
            !selectedIds.has(q.id)
        ),
        remainingNeeded,
        `${basePoolKey}:subdiff:${diff}`
      );
      sameDiffInSubject.forEach((q) => {
        selectedQuestions.push(q);
        selectedIds.add(q.id);
      });
    }

    // Fallback tiếp trong cùng pool chương nếu vẫn thiếu
    const currentTakenCount = selectedQuestions.length;
    if (currentTakenCount < needed && practiceMode === 'TOPIC' && targetDifficulty && targetDifficulty !== 'ALL') {
      const remainingNeeded = needed - currentTakenCount;
      const fallbackPool = samplePoolWithMultiEpochStride(
        currentChapterPool.filter((q) => !selectedIds.has(q.id)),
        remainingNeeded,
        `${basePoolKey}:curfb1`
      );
      fallbackPool.forEach((q) => {
        selectedQuestions.push(q);
        selectedIds.add(q.id);
      });
    } else if (taken.length < needed && (!practiceMode || practiceMode !== 'TOPIC' || targetDifficulty === 'ALL')) {
      const remainingNeeded = needed - taken.length;
      const fallbackTaken = samplePoolWithMultiEpochStride(
        currentChapterPool.filter((q) => !selectedIds.has(q.id)),
        remainingNeeded,
        `${basePoolKey}:curfb2`
      );
      fallbackTaken.forEach((q) => {
        selectedQuestions.push(q);
        selectedIds.add(q.id);
      });
    }
  });

  // 2. Bốc câu hỏi cho Các Chương Trước (nếu có yêu cầu)
  if (!isFullSubjectExam && quota.totalPrevious > 0) {
    difficulties.forEach((diff) => {
      const needed = quota.previousChapters[diff];
      if (needed <= 0) return;

      const taken = samplePoolWithMultiEpochStride(
        prevChapterPool.filter((q) => q.difficulty === diff && !selectedIds.has(q.id)),
        needed,
        `${basePoolKey}:prev:${diff}`
      );

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
        const fallbackTaken = samplePoolWithMultiEpochStride(
          prevChapterPool.filter((q) => !selectedIds.has(q.id)),
          remainingNeeded,
          `${basePoolKey}:prevfb`
        );
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

  // 3. Fallback: Nếu tổng câu bốc được vẫn chưa đủ totalQuestions, CHỈ ĐƯỢC PHÉP LẤY TRONG CÙNG MÔN HỌC!
  if (selectedQuestions.length < totalQuestions) {
    const deficit = totalQuestions - selectedQuestions.length;
    const bonus = samplePoolWithMultiEpochStride(
      candidateBank.filter(
        (q) => (!subjectSlug || isSubjectMatch(q.subjectSlug || q.subjectName, subjectSlug)) && !selectedIds.has(q.id)
      ),
      deficit,
      `${basePoolKey}:subjectfb`
    );
    bonus.forEach((q) => {
      selectedQuestions.push(q);
      selectedIds.add(q.id);
    });
  }

  // 4. Nếu toàn bộ kho câu hỏi của môn này vẫn ít hơn totalQuestions -> Tạo bản sao variant của CHÍNH MÔN NÀY và ĐẢO ĐÁP ÁN A/B/C/D
  if (selectedQuestions.length < totalQuestions && selectedQuestions.length > 0) {
    const baseList = [...selectedQuestions];
    let idx = 0;
    while (selectedQuestions.length < totalQuestions) {
      const baseQ = baseList[idx % baseList.length];
      const variantIdx = Math.floor(idx / baseList.length) + 1;
      const permutedVariant = permuteQuestionChoicesGuaranteedShift(
        baseQ,
        `${basePoolKey}:var:${variantIdx}`
      );
      selectedQuestions.push({
        ...permutedVariant,
        id: `${baseQ.id}_var${variantIdx}`,
      });
      idx++;
    }
  }

  return selectedQuestions;
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
    default:
      return 'Khảo thí';
  }
}
