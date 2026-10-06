import { Question, ExamMatrixConfig, ExamVariant, Answer } from '@/types/exam';

/** Xáo trộn mảng ngẫu nhiên (Fisher-Yates) */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Đảo thứ tự các đáp án trong 1 câu hỏi và gán lại nhãn A, B, C, D */
function shuffleAnswers(answers: Answer[] | undefined): Answer[] {
  if (!answers || answers.length < 2) return answers || [];
  const shuffled = shuffleArray(answers);
  return shuffled.map((ans, idx) => ({
    ...ans,
    label: String.fromCharCode(65 + idx), // A, B, C, D...
  }));
}

/** Tạo bảng đối soát đáp án đúng (Answer Key) */
function generateAnswerKey(questions: Question[]): Record<string, string | string[]> {
  const keyMap: Record<string, string | string[]> = {};
  questions.forEach((q, idx) => {
    const qKey = `Câu ${idx + 1}`;
    if (q.type === 'SINGLE_CHOICE') {
      const correct = q.answers?.find((a) => a.is_answer);
      keyMap[qKey] = correct?.label || 'A';
    } else if (q.type === 'MULTIPLE_CHOICE') {
      const corrects = q.answers?.filter((a) => a.is_answer).map((a) => a.label || '') || [];
      keyMap[qKey] = corrects;
    } else if (q.type === 'TRUE_FALSE') {
      keyMap[qKey] = q.answers?.map((a) => (a.is_answer ? 'Đ' : 'S')).join(', ') || '';
    } else if (q.type === 'FILL_BLANK') {
      keyMap[qKey] = q.answers?.[0]?.content || '';
    } else {
      keyMap[qKey] = 'Tự luận / Khác';
    }
  });
  return keyMap;
}

/** Lọc câu hỏi từ pool theo tỷ lệ Bloom */
function pickQuestionsByBloom(
  pool: Question[],
  targetCount: number,
  bloomRatio: ExamMatrixConfig['difficulty_ratio']
): Question[] {
  if (pool.length === 0 || targetCount <= 0) return [];

  const targetDiff = {
    RECOGNITION: Math.round((targetCount * bloomRatio.recognition) / 100),
    UNDERSTANDING: Math.round((targetCount * bloomRatio.understanding) / 100),
    APPLICATION: Math.round((targetCount * bloomRatio.application) / 100),
    ADVANCED_APPLICATION: Math.round((targetCount * bloomRatio.advanced_application) / 100),
  };

  const currentSum = Object.values(targetDiff).reduce((a, b) => a + b, 0);
  const diffOffset = targetCount - currentSum;
  targetDiff.UNDERSTANDING += diffOffset;

  const poolByDiff: Record<string, Question[]> = {
    RECOGNITION: [],
    UNDERSTANDING: [],
    APPLICATION: [],
    ADVANCED_APPLICATION: [],
  };

  pool.forEach((q) => {
    const diff = q.difficulty || 'UNDERSTANDING';
    if (poolByDiff[diff]) {
      poolByDiff[diff].push(q);
    } else {
      poolByDiff.UNDERSTANDING.push(q);
    }
  });

  const selected: Question[] = [];
  (['RECOGNITION', 'UNDERSTANDING', 'APPLICATION', 'ADVANCED_APPLICATION'] as const).forEach(
    (diffKey) => {
      const needed = Math.max(0, targetDiff[diffKey]);
      const available = shuffleArray(poolByDiff[diffKey] || []);
      selected.push(...available.slice(0, needed));
    }
  );

  // Nếu thiếu do nhóm nào đó không đủ câu, bổ sung từ các câu còn lại trong pool
  if (selected.length < targetCount) {
    const pickedIds = new Set(selected.map((q) => q.id));
    const remaining = pool.filter((q) => !pickedIds.has(q.id));
    selected.push(...shuffleArray(remaining).slice(0, targetCount - selected.length));
  }

  return selected.slice(0, targetCount);
}

/** Thuật toán sinh đề thi theo ma trận (Exam Matrix Blueprint) */
export function generateExamsFromMatrix(
  questionPool: Question[],
  config: ExamMatrixConfig
): ExamVariant[] {
  const total = config.total_questions;

  // 1. Lọc theo Môn học (nếu có câu hỏi thuộc môn tương ứng)
  let subjectPool = questionPool.filter(
    (q) => !config.subject || q.subject?.toLowerCase().trim() === config.subject.toLowerCase().trim()
  );
  if (subjectPool.length === 0) {
    // Nếu kho chưa có môn này, dự phòng dùng toàn bộ pool
    subjectPool = questionPool;
  }

  // 2. Lấy bộ câu hỏi gốc (Base Questions) theo chế độ phạm vi
  let baseQuestions: Question[] = [];
  const scopeMode = config.scope_mode || 'CHAPTER_FOCUSED';

  if (scopeMode === 'CHAPTER_FOCUSED') {
    const currentChapterRatio = config.scope_ratio?.current_chapter ?? 70;
    const neededCurrent = Math.round((total * currentChapterRatio) / 100);
    const neededPrev = total - neededCurrent;

    // Lọc câu hỏi chương trọng tâm
    const currentChapterName = config.current_chapter?.toLowerCase().trim() || '';
    const currentPool = subjectPool.filter((q) =>
      currentChapterName ? q.chapter?.toLowerCase().trim().includes(currentChapterName) : true
    );

    // Lọc câu hỏi các chương cũ
    const prevChapterNames = (config.previous_chapters || []).map((c) => c.toLowerCase().trim());
    const prevPool = subjectPool.filter((q) =>
      prevChapterNames.some((pName) => q.chapter?.toLowerCase().trim().includes(pName))
    );

    const pickedCurrent = pickQuestionsByBloom(currentPool, neededCurrent, config.difficulty_ratio);
    const pickedPrev = pickQuestionsByBloom(prevPool, neededPrev, config.difficulty_ratio);

    baseQuestions = [...pickedCurrent, ...pickedPrev];

    // Bổ sung nếu chưa đủ total
    if (baseQuestions.length < total) {
      const pickedIds = new Set(baseQuestions.map((q) => q.id));
      const remaining = subjectPool.filter((q) => !pickedIds.has(q.id));
      baseQuestions.push(...shuffleArray(remaining).slice(0, total - baseQuestions.length));
    }
  } else if (scopeMode === 'SEMESTER') {
    const selectedChapters = (config.selected_chapters || []).map((c) => c.toLowerCase().trim());
    const semesterPool = subjectPool.filter((q) =>
      selectedChapters.some((sName) => q.chapter?.toLowerCase().trim().includes(sName))
    );
    baseQuestions = pickQuestionsByBloom(
      semesterPool.length > 0 ? semesterPool : subjectPool,
      total,
      config.difficulty_ratio
    );
  } else {
    // NATIONAL_EXAM: Toàn diện
    baseQuestions = pickQuestionsByBloom(subjectPool, total, config.difficulty_ratio);
  }

  // Nếu kho vẫn còn thiếu so với total, nhân bản hoặc cắt đúng số lượng
  if (baseQuestions.length < total) {
    const remainingDiff = total - baseQuestions.length;
    baseQuestions.push(...shuffleArray(subjectPool).slice(0, remainingDiff));
  }
  baseQuestions = baseQuestions.slice(0, total);

  // 3. Sinh N mã đề (variants) hoán vị
  const variants: ExamVariant[] = [];
  const prefix = config.variant_prefix || '10';

  for (let v = 0; v < config.variant_count; v++) {
    const code = `${prefix}${v + 1}`;

    // Xáo trộn vị trí câu hỏi
    const variantQuestions = shuffleArray(baseQuestions).map((q, qIdx) => {
      // Đảo thứ tự các phương án trong câu hỏi (nếu là trắc nghiệm)
      let randomizedAnswers = q.answers;
      if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
        randomizedAnswers = shuffleAnswers(q.answers);
      }

      return {
        ...q,
        title: `Câu ${qIdx + 1}`,
        answers: randomizedAnswers,
      };
    });

    const answerKey = generateAnswerKey(variantQuestions);

    variants.push({
      variant_code: code,
      title: `${config.title} - Mã đề ${code}`,
      total_questions: variantQuestions.length,
      duration_minutes: config.duration_minutes,
      questions: variantQuestions,
      answer_key: answerKey,
    });
  }

  return variants;
}
