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
      // Chuỗi Đ/S
      keyMap[qKey] = q.answers?.map((a) => (a.is_answer ? 'Đ' : 'S')).join(', ') || '';
    } else if (q.type === 'FILL_BLANK') {
      keyMap[qKey] = q.answers?.[0]?.content || '';
    } else {
      keyMap[qKey] = 'Tự luận / Khác';
    }
  });
  return keyMap;
}

/** Thuật toán sinh đề thi theo ma trận (Exam Matrix Blueprint) */
export function generateExamsFromMatrix(
  questionPool: Question[],
  config: ExamMatrixConfig
): ExamVariant[] {
  const total = config.total_questions;

  // Tính số lượng câu hỏi mục tiêu theo từng độ khó
  const targetDiff = {
    RECOGNITION: Math.round((total * config.difficulty_ratio.recognition) / 100),
    UNDERSTANDING: Math.round((total * config.difficulty_ratio.understanding) / 100),
    APPLICATION: Math.round((total * config.difficulty_ratio.application) / 100),
    ADVANCED_APPLICATION: Math.round((total * config.difficulty_ratio.advanced_application) / 100),
  };

  // Điều chỉnh sai số làm tròn để tổng đúng bằng total
  const currentSum = Object.values(targetDiff).reduce((a, b) => a + b, 0);
  const diffOffset = total - currentSum;
  targetDiff.UNDERSTANDING += diffOffset;

  // Phân chia pool theo độ khó
  const poolByDiff: Record<string, Question[]> = {
    RECOGNITION: [],
    UNDERSTANDING: [],
    APPLICATION: [],
    ADVANCED_APPLICATION: [],
  };

  questionPool.forEach((q) => {
    const diff = q.difficulty || 'UNDERSTANDING';
    if (poolByDiff[diff]) {
      poolByDiff[diff].push(q);
    } else {
      poolByDiff.UNDERSTANDING.push(q);
    }
  });

  // Bốc thăm câu hỏi từ từng nhóm độ khó
  const selectedBaseQuestions: Question[] = [];

  (['RECOGNITION', 'UNDERSTANDING', 'APPLICATION', 'ADVANCED_APPLICATION'] as const).forEach(
    (diffKey) => {
      const needed = Math.max(0, targetDiff[diffKey]);
      const available = shuffleArray(poolByDiff[diffKey] || []);
      const picked = available.slice(0, needed);
      selectedBaseQuestions.push(...picked);
    }
  );

  // Nếu số câu bốc được chưa đủ (do kho thiếu câu ở 1 mức độ nào đó), bổ sung thêm từ các câu còn lại
  if (selectedBaseQuestions.length < total) {
    const pickedIds = new Set(selectedBaseQuestions.map((q) => q.id));
    const remaining = questionPool.filter((q) => !pickedIds.has(q.id));
    const supplement = shuffleArray(remaining).slice(0, total - selectedBaseQuestions.length);
    selectedBaseQuestions.push(...supplement);
  }

  // Cắt đúng số lượng total
  const baseQuestions = selectedBaseQuestions.slice(0, total);

  // Sinh N mã đề (variants)
  const variants: ExamVariant[] = [];
  const variantCodes = ['101', '102', '103', '104', '105', '106', '107', '108'];

  for (let v = 0; v < config.variant_count; v++) {
    const code = variantCodes[v] || `${101 + v}`;

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
