import {
  Question,
  ExamMatrixConfig,
  ExamVariant,
  ExamVariantPart,
  ExamCategoryDistribution,
  ExamMatrixApiPayload,
  Answer,
} from '@/types/exam';
import { isSubjectMatch } from '@/services/mock/question-matrix-engine';

/** Xáo trộn mảng ngẫu nhiên (Fisher-Yates) */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Đảo thứ tự các đáp án trong 1 câu hỏi và gán lại nhãn A, B, C, D */
export function shuffleAnswers(answers: Answer[] | undefined): Answer[] {
  if (!answers || answers.length < 2) return answers || [];
  const shuffled = shuffleArray(answers);
  return shuffled.map((ans, idx) => ({
    ...ans,
    label: String.fromCharCode(65 + idx), // A, B, C, D...
  }));
}

/** Tạo bảng đối soát đáp án đúng (Answer Key) */
export function generateAnswerKey(questions: Question[]): Record<string, string | string[]> {
  const keyMap: Record<string, string | string[]> = {};
  questions.forEach((q, idx) => {
    const qKey = `Câu ${idx + 1}`;
    if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
      const corrects = q.answers?.filter((a) => a.is_answer).map((a) => a.label || '') || [];
      if (corrects.length === 1) {
        keyMap[qKey] = corrects[0];
      } else if (corrects.length > 1) {
        keyMap[qKey] = corrects.join(', ');
      } else if (q.correctChoice) {
        keyMap[qKey] = q.correctChoice;
      } else {
        keyMap[qKey] = 'A';
      }
    } else if (q.type === 'TRUE_FALSE') {
      if (q.statements && q.statements.length > 0) {
        keyMap[qKey] = q.statements.map((st) => `${st.subId}-${st.isCorrect ? 'Đ' : 'S'}`).join('; ');
      } else if (q.answers && q.answers.length > 0) {
        keyMap[qKey] = q.answers.map((a) => `${a.label || 'ý'}-${a.is_answer ? 'Đ' : 'S'}`).join('; ');
      } else {
        keyMap[qKey] = 'a-Đ; b-S; c-Đ; d-S';
      }
    } else if (q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER') {
      keyMap[qKey] = q.shortAnswerCorrect || q.answers?.[0]?.content || 'Đáp số';
    } else {
      keyMap[qKey] = 'A';
    }
  });
  return keyMap;
}

/** Lọc câu hỏi từ pool theo tỷ lệ Bloom */
export function pickQuestionsByBloom(
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

/** Tính toán phân bổ danh mục câu hỏi trắc nghiệm mặc định nếu config chưa chỉ định */
export function resolveCategoryDistribution(
  total: number,
  custom?: ExamCategoryDistribution
): ExamCategoryDistribution {
  if (custom) {
    const sum = custom.multiple_choice + custom.true_false + custom.short_answer;
    if (sum === total) {
      return { ...custom };
    }
  }

  // Tỉ lệ chuẩn GDPT 2018 (3 Phần Trắc Nghiệm: 60% MCQ, 20% Đúng/Sai, 20% Trả lời ngắn)
  if (total <= 10) {
    const mcq = Math.max(1, Math.round(total * 0.6));
    const tf = Math.max(1, Math.round(total * 0.2));
    const sa = Math.max(0, total - mcq - tf);
    return {
      multiple_choice: mcq,
      true_false: tf,
      short_answer: sa,
    };
  }

  const mcq = Math.round(total * 0.6);
  const tf = Math.round(total * 0.2);
  const sa = Math.max(0, total - mcq - tf);

  return {
    multiple_choice: mcq,
    true_false: tf,
    short_answer: sa,
  };
}

/** Lọc câu hỏi từ pool cho một danh mục cụ thể theo phạm vi chương học & Bloom */
function pickCategoryQuestions(
  categoryPool: Question[],
  targetCount: number,
  config: ExamMatrixConfig
): Question[] {
  if (categoryPool.length === 0 || targetCount <= 0) return [];

  const scopeMode = config.scope_mode || 'CHAPTER_FOCUSED';

  if (scopeMode === 'CHAPTER_FOCUSED') {
    const currentChapterRatio = config.scope_ratio?.current_chapter ?? 70;
    const neededCurrent = Math.round((targetCount * currentChapterRatio) / 100);
    const neededPrev = targetCount - neededCurrent;

    const currentChapterName = config.current_chapter?.toLowerCase().trim() || '';
    const currentPool = categoryPool.filter((q) =>
      currentChapterName ? q.chapter?.toLowerCase().trim().includes(currentChapterName) : true
    );

    const prevChapterNames = (config.previous_chapters || []).map((c) => c.toLowerCase().trim());
    const prevPool = categoryPool.filter((q) =>
      prevChapterNames.some((pName) => q.chapter?.toLowerCase().trim().includes(pName))
    );

    const pickedCurrent = pickQuestionsByBloom(
      currentPool.length > 0 ? currentPool : categoryPool,
      neededCurrent,
      config.difficulty_ratio
    );
    const pickedPrev = pickQuestionsByBloom(
      prevPool.length > 0 ? prevPool : categoryPool,
      neededPrev,
      config.difficulty_ratio
    );

    const result = [...pickedCurrent, ...pickedPrev];
    if (result.length < targetCount) {
      const pickedIds = new Set(result.map((q) => q.id));
      const remaining = categoryPool.filter((q) => !pickedIds.has(q.id));
      result.push(...shuffleArray(remaining).slice(0, targetCount - result.length));
    }
    return result.slice(0, targetCount);
  }

  if (scopeMode === 'SEMESTER') {
    const selectedChapters = (config.selected_chapters || []).map((c) => c.toLowerCase().trim());
    const semesterPool = categoryPool.filter((q) =>
      selectedChapters.some((sName) => q.chapter?.toLowerCase().trim().includes(sName))
    );
    return pickQuestionsByBloom(
      semesterPool.length > 0 ? semesterPool : categoryPool,
      targetCount,
      config.difficulty_ratio
    );
  }

  // NATIONAL_EXAM
  return pickQuestionsByBloom(categoryPool, targetCount, config.difficulty_ratio);
}

/** Thuật toán sinh đề thi theo ma trận (Exam Matrix Blueprint) 3 Phần Trắc nghiệm Bộ GD&ĐT 2025 */
export function generateExamsFromMatrix(
  questionPool: Question[],
  config: ExamMatrixConfig
): ExamVariant[] {
  const total = config.total_questions;

  // 1. Lọc chặt chẽ theo Môn học & loại bỏ hoàn toàn câu hỏi tự luận cũ (nếu có)
  let subjectPool = questionPool.filter(
    (q) =>
      (q.type as string) !== 'ESSAY' &&
      (!config.subject || isSubjectMatch(q.subject, config.subject))
  );
  if (subjectPool.length === 0 && config.subject) {
    subjectPool = questionPool.filter(
      (q) => (q.type as string) !== 'ESSAY' && isSubjectMatch(q.subject, config.subject)
    );
  }

  // 2. Phân loại pool câu hỏi theo 3 phần trắc nghiệm chuẩn GDPT 2018
  const mcqPool = subjectPool.filter(
    (q) => q.type === 'MULTIPLE_CHOICE' || q.type === 'SINGLE_CHOICE'
  );
  const tfPool = subjectPool.filter((q) => q.type === 'TRUE_FALSE');
  const saPool = subjectPool.filter(
    (q) => q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER'
  );

  // 3. Phân bổ số câu cho từng danh mục
  const catDist = resolveCategoryDistribution(total, config.category_distribution);

  // 4. Bốc câu hỏi cho từng phần theo đúng ma trận
  const baseMcq = pickCategoryQuestions(
    mcqPool.length > 0 ? mcqPool : subjectPool,
    catDist.multiple_choice,
    config
  );
  const baseTf = pickCategoryQuestions(
    tfPool.length > 0 ? tfPool : subjectPool,
    catDist.true_false,
    config
  );
  const baseSa = pickCategoryQuestions(
    saPool.length > 0 ? saPool : subjectPool,
    catDist.short_answer,
    config
  );

  // 5. Sinh N mã đề hoán vị (Variants)
  const variants: ExamVariant[] = [];
  const prefix = config.variant_prefix || '10';

  for (let v = 0; v < config.variant_count; v++) {
    const code = `${prefix}${v + 1}`;

    // Hoán vị độc lập TRONG TỪNG PHẦN (không xáo trộn lộn xộn các phần)
    const varMcq = shuffleArray(baseMcq).map((q) => ({
      ...q,
      answers: shuffleAnswers(q.answers),
      section_title: 'PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN',
    }));

    const varTf = shuffleArray(baseTf).map((q) => ({
      ...q,
      section_title: 'PHẦN II. CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI',
    }));

    const varSa = shuffleArray(baseSa).map((q) => ({
      ...q,
      section_title: 'PHẦN III. CÂU HỎI TRẮC NGHIỆM TRẢ LỜI NGẮN',
    }));

    // Hợp nhất theo đúng thứ tự 3 phần trắc nghiệm của Bộ GD&ĐT
    const allQuestions = [...varMcq, ...varTf, ...varSa].map((q, idx) => ({
      ...q,
      title: `Câu ${idx + 1}`,
    }));

    // Cấu trúc 3 phần trắc nghiệm chuẩn
    const parts: ExamVariantPart[] = [];
    if (varMcq.length > 0) {
      parts.push({
        part_number: 1,
        title: 'PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN',
        description: 'Thí sinh chọn 01 phương án đúng duy nhất (A, B, C hoặc D).',
        question_type: 'MULTIPLE_CHOICE',
        questions: varMcq,
        points_per_question: 0.25,
        total_points: Number((varMcq.length * 0.25).toFixed(2)),
      });
    }
    if (varTf.length > 0) {
      parts.push({
        part_number: 2,
        title: 'PHẦN II. CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI',
        description: 'Thí sinh trả lời Đúng/Sai cho từng ý a, b, c, d. Điểm tính lũy tiến theo quy chế Bộ GD&ĐT.',
        question_type: 'TRUE_FALSE',
        questions: varTf,
        points_per_question: 1.0,
        total_points: Number((varTf.length * 1.0).toFixed(2)),
      });
    }
    if (varSa.length > 0) {
      parts.push({
        part_number: 3,
        title: 'PHẦN III. CÂU HỎI TRẮC NGHIỆM TRẢ LỜI NGẮN',
        description: 'Thí sinh tính toán và điền đáp số trực tiếp vào ô kết quả (không có đáp án mồi).',
        question_type: 'FILL_BLANK',
        questions: varSa,
        points_per_question: 0.5,
        total_points: Number((varSa.length * 0.5).toFixed(2)),
      });
    }

    const answerKey = generateAnswerKey(allQuestions);
    const totalScore = parts.reduce((acc, p) => acc + p.total_points, 0);

    variants.push({
      variant_code: code,
      title: `${config.title} - Mã đề ${code}`,
      total_questions: allQuestions.length,
      duration_minutes: config.duration_minutes,
      questions: allQuestions,
      answer_key: answerKey,
      parts,
      total_score: totalScore > 0 ? Number(totalScore.toFixed(2)) : 10.0,
    });
  }

  return variants;
}

/** Thu thập toàn bộ cấu hình ma trận thành Payload chuẩn gửi Backend API */
export function buildExamMatrixApiPayload(config: ExamMatrixConfig): ExamMatrixApiPayload {
  const catDist = resolveCategoryDistribution(config.total_questions, config.category_distribution);

  return {
    exam_info: {
      title: config.title,
      subject: config.subject,
      grade_level: String(config.grade_level),
      duration_minutes: config.duration_minutes,
      pass_score: config.pass_score,
      access_tier: config.access_tier || 'FREE_TRIAL',
      upsell_course_id: config.upsell_course_id === 'NONE' ? undefined : config.upsell_course_id,
    },
    scope_config: {
      scope_mode: config.scope_mode || 'CHAPTER_FOCUSED',
      current_chapter: config.current_chapter,
      previous_chapters: config.previous_chapters || [],
      selected_chapters: config.selected_chapters || [],
      scope_ratio: {
        current_chapter_percentage: config.scope_ratio?.current_chapter ?? 70,
        previous_chapters_percentage: config.scope_ratio?.previous_chapters ?? 30,
      },
    },
    matrix_blueprint: {
      total_questions: config.total_questions,
      category_distribution: catDist,
      bloom_ratio: {
        recognition_percentage: config.difficulty_ratio.recognition,
        understanding_percentage: config.difficulty_ratio.understanding,
        application_percentage: config.difficulty_ratio.application,
        advanced_application_percentage: config.difficulty_ratio.advanced_application,
      },
    },
    variants_config: {
      variant_count: config.variant_count,
      variant_prefix: config.variant_prefix || '10',
      shuffle_questions: true,
      shuffle_choices: true,
    },
    metadata: {
      created_by: 'Schoolify Admin Portal',
      client_timestamp: new Date().toISOString(),
      standards: 'GDPT 2018 - MOET 2025 Format (4 Categories)',
    },
  };
}

function getMatrixAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('schoolify-auth-storage');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const state = parsed?.state || {};
    const token = state.token || '';
    const userId = state.user?.id || '';
    const role = state.currentRole || state.user?.role || '';
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': String(userId) } : {}),
      ...(role ? { 'x-user-role': String(role) } : {}),
    };
  } catch {
    return {};
  }
}

/** Gửi Payload về Backend API (PostgreSQL) để sinh đề */
export async function sendExamMatrixToBackend(
  payload: ExamMatrixApiPayload,
  _pool: Question[]
): Promise<{ success: boolean; variants: ExamVariant[]; message: string; isDemoFallback?: boolean }> {
  try {
    const res = await fetch('/api/v1/exams/matrix-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getMatrixAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data && Array.isArray(data.variants) && data.variants.length > 0) {
      return {
        success: true,
        variants: data.variants,
        message:
          data.message ||
          `Backend PostgreSQL đã sinh thành công ${data.variants.length} mã đề theo ma trận!`,
        isDemoFallback: false,
      };
    }

    return {
      success: false,
      variants: [],
      message:
        data?.message ||
        `Backend trả về mã lỗi ${res.status} khi sinh đề từ PostgreSQL.`,
      isDemoFallback: false,
    };
  } catch (err: any) {
    return {
      success: false,
      variants: [],
      message:
        'Không thể kết nối Backend để sinh đề từ PostgreSQL: ' + (err?.message || 'Unknown error'),
      isDemoFallback: false,
    };
  }
}
