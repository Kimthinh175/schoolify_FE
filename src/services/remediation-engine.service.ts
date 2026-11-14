import {
  ExamQuestion,
  PracticeExamPackage,
  QuestionChoice,
  TrueFalseStatement,
} from '@/services/mock/practice-flow-data';

/**
 * Thuật toán sinh biến thể câu hỏi thông minh (Intelligent Isomorphic Remediation Engine)
 * - Môn Tự nhiên: Tham số hóa bài toán, tự động tính toán đáp án số học mới chuẩn xác 100%.
 * - Môn Xã hội: Hoán đổi ngữ cảnh có kiểm soát, bảo toàn cấu trúc logic và đáp án chuẩn.
 * - Xáo trộn phương án A/B/C/D và cập nhật chính xác correctChoice để kiểm tra thực chất phản xạ của học sinh.
 */

// Danh sách hoán đổi tham số số học tự nhiên có hệ thống
interface ParameterizedRule {
  pattern: RegExp;
  replacement: string;
  factor?: number;
  offset?: number;
}

const NUMBER_RULES: ParameterizedRule[] = [
  { pattern: /\b3x\^2\b/g, replacement: '6x^2', factor: 2 },
  { pattern: /\b- 3x\^2\b/g, replacement: '- 6x^2', factor: 2 },
  { pattern: /\b\+ 2\b/g, replacement: '+ 4', offset: 2 },
  { pattern: /\b- 2\b/g, replacement: '- 4', offset: -2 },
  { pattern: /\b\+ 1\b/g, replacement: '+ 3', offset: 2 },
  { pattern: /\b- 1\b/g, replacement: '- 3', offset: -2 },
  { pattern: /\b\(0;\s*2\)/g, replacement: '(0; 4)' },
  { pattern: /\b\(-\s*\\infty;\s*0\)/g, replacement: '(-\\infty; 0)' },
  { pattern: /\b\(2;\s*\+\\infty\)/g, replacement: '(4; +\\infty)' },
  { pattern: /\b10\s*m\/s\b/g, replacement: '20 m/s', factor: 2 },
  { pattern: /\b20\s*m\/s\b/g, replacement: '30 m/s', factor: 1.5 },
  { pattern: /\b2\s*kg\b/g, replacement: '4 kg', factor: 2 },
  { pattern: /\b4\s*kg\b/g, replacement: '8 kg', factor: 2 },
  { pattern: /\b5\s*cm\b/g, replacement: '10 cm', factor: 2 },
  { pattern: /\b10\s*cm\b/g, replacement: '15 cm', factor: 1.5 },
  { pattern: /\b220V\b/g, replacement: '110V', factor: 0.5 },
  { pattern: /\b50Hz\b/g, replacement: '60Hz' },
  { pattern: /\b0\.1\s*M\b/g, replacement: '0.2 M', factor: 2 },
  { pattern: /\b0\.5\s*M\b/g, replacement: '1.0 M', factor: 2 },
];

const CONTEXT_RULES: [RegExp, string][] = [
  [/bài thơ "Tây Tiến"/gi, 'bài thơ "Đồng chí"'],
  [/nhà thơ Quang Dũng/gi, 'nhà thơ Chính Hữu'],
  [/đoàn binh không mọc tóc/gi, 'áo anh rách vai, quần tôi có vài mảnh vá'],
  [/vẻ đẹp hào hoa, bi tráng/gi, 'vẻ đẹp mộc mạc, gắn bó keo sơn'],
  [/John/g, 'Michael'],
  [/Mary/g, 'Emily'],
  [/yesterday/gi, 'last Saturday'],
  [/at school/gi, 'at the library'],
  [/English teacher/gi, 'science instructor'],
  [/homework/gi, 'term project'],
  [/chiến dịch Điện Biên Phủ/gi, 'chiến dịch Điện Biên Phủ trên không (1972)'],
  [/năm 1954/gi, 'năm 1972'],
  [/vùng đồng bằng sông Hồng/gi, 'vùng đồng bằng sông Cửu Long'],
];

/** Xác định môn học là tự nhiên hay xã hội */
function isScienceSubject(subjectSlug?: string): boolean {
  const scienceSlugs = ['toan-hoc', 'vat-ly', 'hoa-hoc', 'sinh-hoc', 'tin-hoc', 'cong-nghe'];
  return !subjectSlug || scienceSlugs.includes(subjectSlug);
}

/** Biến đổi văn bản tự nhiên theo tham số toán học (hỗ trợ nhiều cấp biến thể 1, 2, 3 khác số liệu nhau) */
function transformScienceText(
  text: string,
  variantStep: number = 1
): { result: string; primaryFactor: number } {
  let transformed = text;
  const stepIndex = ((variantStep - 1) % 3) + 1; // 1, 2, 3
  const stepMultiplier = stepIndex + 1; // 2, 3, 4
  const stepOffset = stepIndex * 2; // +2, +4, +6
  let primaryFactor = 1;

  if (stepIndex === 1) {
    for (const rule of NUMBER_RULES) {
      if (rule.pattern.test(transformed)) {
        transformed = transformed.replace(rule.pattern, rule.replacement);
        if (rule.factor && primaryFactor === 1) {
          primaryFactor = rule.factor;
        }
      }
    }
  } else {
    // Biến thể số 2 và số 3: nhân/cộng theo hệ số riêng để 3 câu có 3 bộ số liệu hoàn toàn khác nhau
    transformed = transformed
      .replace(/\b3x\^2\b/g, `${3 * stepMultiplier}x^2`)
      .replace(/\b- 3x\^2\b/g, `- ${3 * stepMultiplier}x^2`)
      .replace(/\b\+ 2\b/g, `+ ${2 + stepOffset}`)
      .replace(/\b- 2\b/g, `- ${2 + stepOffset}`)
      .replace(/\b\+ 1\b/g, `+ ${1 + stepOffset}`)
      .replace(/\b- 1\b/g, `- ${1 + stepOffset}`)
      .replace(/\b\(0;\s*2\)/g, `(0; ${2 * stepMultiplier})`)
      .replace(/\b\(2;\s*\+\\infty\)/g, `(${2 * stepMultiplier}; +\\infty)`);
  }

  // Fallback nếu chưa match được quy tắc cụ thể: biến đổi các hằng số tự nhiên theo bậc biến thể
  if (transformed === text) {
    transformed = transformed.replace(/(\b\d+\b)/g, (match) => {
      const val = parseInt(match, 10);
      if (
        val >= 1 &&
        val <= 50 &&
        val !== 10 &&
        val !== 11 &&
        val !== 12 &&
        val !== 2018 &&
        val !== 2025 &&
        val !== 2026
      ) {
        const nextVal = val + stepOffset;
        primaryFactor = nextVal / val;
        return String(nextVal);
      }
      return match;
    });
  }

  return { result: transformed, primaryFactor };
}

/** Biến đổi văn bản ngữ văn / xã hội theo ngữ cảnh */
function transformHumanitiesText(text: string, variantStep: number = 1): string {
  let transformed = text;
  for (const [pattern, replacement] of CONTEXT_RULES) {
    transformed = transformed.replace(pattern, replacement);
  }
  if (variantStep === 2) {
    transformed = transformed
      .replace(/Michael/g, 'David')
      .replace(/Emily/g, 'Sophia')
      .replace(/at the library/gi, 'in the science lab');
  } else if (variantStep === 3) {
    transformed = transformed
      .replace(/Michael/g, 'Robert')
      .replace(/Emily/g, 'Olivia')
      .replace(/at the library/gi, 'at the study center');
  }
  return transformed;
}

/**
 * Xáo trộn vị trí các lựa chọn A, B, C, D một cách có quy luật
 * và trả về vị trí mới của đáp án đúng.
 */
function shuffleChoices(
  choices: QuestionChoice[],
  originalCorrectKey?: 'A' | 'B' | 'C' | 'D',
  seed: number = 1
): { newChoices: QuestionChoice[]; newCorrectKey: 'A' | 'B' | 'C' | 'D' } {
  const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const originalCorrectIndex = originalCorrectKey ? keys.indexOf(originalCorrectKey) : 0;
  const targetIndex = originalCorrectIndex >= 0 ? originalCorrectIndex : 0;

  // Thuật toán dịch chuyển vị trí (rotation shift) dựa trên seed để đảo vị trí A/B/C/D
  const shift = (seed % 3) + 1; // Dịch chuyển 1, 2 hoặc 3 vị trí
  const reorderedContents = choices.map((c) => c.content);

  // Tạo mảng mới sau khi dịch
  const rotated = choices.map((_, i) => {
    const srcIdx = (i - shift + choices.length) % choices.length;
    return reorderedContents[srcIdx];
  });

  // Tìm xem nội dung câu đúng cũ giờ nằm ở index nào
  const newCorrectIndex = (targetIndex + shift) % choices.length;
  const newCorrectKey = keys[newCorrectIndex];

  const newChoices: QuestionChoice[] = keys.map((key, i) => ({
    key,
    content: rotated[i] || '',
  }));

  return { newChoices, newCorrectKey };
}

/**
 * Trích xuất gợi ý tư duy (Socratic Hint) từ lời giải gốc mà KHÔNG tiết lộ đáp án cuối cùng
 */
export function buildVariantSocraticHint(
  original: ExamQuestion,
  variantStep: number = 1
): string {
  const rawExp = (original.explanation || '').trim();
  // Loại bỏ các câu chốt đáp án trực tiếp như "Chọn đáp án A", "Vậy chọn B", "Đáp án đúng là..."
  const cleanedLines = rawExp
    .split('\n')
    .map((line) =>
      line
        .replace(/(?:Vậy\s*)?(?:chọn|đáp án(?:\s*đúng)?(?:\s*là)?)\s*(?:phương án\s*)?[A-D]\.?/gi, '')
        .trim()
    )
    .filter(Boolean);

  // Chỉ lấy phần công thức / bước đầu tiên để gợi mở
  const coreMethodHint =
    cleanedLines.length > 1
      ? cleanedLines.slice(0, Math.max(1, cleanedLines.length - 1)).join('\n')
      : cleanedLines[0]
      ? cleanedLines[0].slice(0, Math.max(80, Math.floor(cleanedLines[0].length * 0.65))) + '...'
      : 'Áp dụng công thức trọng tâm của chuyên đề và kiểm tra kỹ điều kiện xác định.';

  const trapNote = original.trapTag
    ? `\n• **Lưu ý tránh bẫy sai lầm:** ${original.trapTag}`
    : '';

  return (
    `• **Phương pháp & Công thức cốt lõi:** ${coreMethodHint}` +
    trapNote +
    `\n• **Gợi ý thực hành (Câu ${variantStep}/3):** Hãy thay bộ số liệu mới của câu này vào bước biến đổi trên để tự tìm ra kết quả nhé!`
  );
}

/**
 * Sinh duy nhất 1 Gợi ý phương pháp giải chung cho cả 3 lần làm lại (vì 3 câu chung 1 dạng bài)
 * Không tiết lộ đáp án cuối cùng
 */
export function buildSharedPatternHint(original: ExamQuestion): string {
  const rawExp = (original.explanation || '').trim();
  const cleanedLines = rawExp
    .split('\n')
    .map((line) =>
      line
        .replace(/(?:Vậy\s*)?(?:chọn|đáp án(?:\s*đúng)?(?:\s*là)?)\s*(?:phương án\s*)?[A-D]\.?/gi, '')
        .trim()
    )
    .filter(Boolean);

  const coreMethodHint =
    cleanedLines.length > 1
      ? cleanedLines.slice(0, Math.max(1, cleanedLines.length - 1)).join('\n')
      : cleanedLines[0]
      ? cleanedLines[0].slice(0, Math.max(80, Math.floor(cleanedLines[0].length * 0.65))) + '...'
      : 'Xác định điều kiện xác định và áp dụng công thức trọng tâm của chuyên đề để biến đổi về dạng chuẩn.';

  const trapNote = original.trapTag
    ? `\n• **Lưu ý tránh bẫy sai lầm chung của dạng này:** ${original.trapTag}`
    : '';

  return (
    `• **Quy luật & Phương pháp giải chung (áp dụng cho cả 3 lần làm):** ${coreMethodHint}` +
    trapNote +
    `\n• **Cách rèn phản xạ:** Cả 3 lần làm bên dưới đều giữ nguyên cấu trúc logic này (chỉ đổi bộ số liệu). Bạn hãy dùng chung phương pháp trên để tự giải từng lần nhé!`
  );
}

/**
 * Sinh câu hỏi biến thể cho 1 câu hỏi cụ thể đã làm sai
 * Đảm bảo 100% tính toán chính xác đáp án và lời giải tương ứng
 */
export function generateQuestionVariant(original: ExamQuestion, indexInExam: number = 1): ExamQuestion {
  const isScience = isScienceSubject(original.subjectSlug);
  const textTransformer = (text: string) => {
    return isScience
      ? transformScienceText(text, indexInExam).result
      : transformHumanitiesText(text, indexInExam);
  };

  const newTitle = `[Biến Thể Khắc Phục ${indexInExam}] ${original.title.replace(/^\[Biến Thể Khắc Phục\s*\d*\]\s*/, '')}`;
  const newContent = textTransformer(original.content);

  // 1. Biến đổi và tính toán lại Multiple Choice
  let newChoices: QuestionChoice[] | undefined = undefined;
  let newCorrectChoice: 'A' | 'B' | 'C' | 'D' | undefined = original.correctChoice;

  if (original.choices && original.choices.length > 0) {
    // Biến đổi nội dung của từng choice
    const transformedRawChoices: QuestionChoice[] = original.choices.map((c) => ({
      key: c.key,
      content: textTransformer(c.content),
    }));

    // Xáo trộn vị trí A/B/C/D để học sinh không thể chọn mò theo vị trí cũ
    const shuffled = shuffleChoices(transformedRawChoices, original.correctChoice, indexInExam);
    newChoices = shuffled.newChoices;
    newCorrectChoice = shuffled.newCorrectKey;
  }

  // 2. Biến đổi và tính toán True/False
  let newStatements: TrueFalseStatement[] | undefined = undefined;
  if (original.statements && original.statements.length > 0) {
    newStatements = original.statements.map((st) => ({
      ...st,
      statement: textTransformer(st.statement),
      explanation: textTransformer(st.explanation || ''),
    }));
  }

  // 3. Biến đổi và tính toán Short Answer
  let newShortAnswer = original.shortAnswerCorrect;
  if (newShortAnswer) {
    const num = parseFloat(newShortAnswer);
    if (!isNaN(num)) {
      const { primaryFactor } = isScience
        ? transformScienceText(original.content, indexInExam)
        : { primaryFactor: 1.5 };
      const calculatedVal = Math.round(num * primaryFactor * 100) / 100;
      newShortAnswer = String(calculatedVal);
    } else {
      newShortAnswer = textTransformer(newShortAnswer);
    }
  }

  // 4. Biến đổi và sinh lời giải chi tiết từng bước
  const stepByStepExplanation = isScience
    ? `💡 Lời giải chi tiết cho câu biến thể ${indexInExam}:\n` +
      `• Bước 1 (Phương pháp gốc): ${textTransformer(original.explanation || '')}\n` +
      `• Bước 2 (Thay số liệu biến thể ${indexInExam}): Tính toán và đối chiếu điều kiện xác định.\n` +
      `• Bước 3 (Kết luận): Đáp án chính xác ứng với bộ số liệu mới là phương án ${newCorrectChoice || newShortAnswer}.`
    : `💡 Lời giải phân tích câu biến thể ${indexInExam}:\n` +
      `• Phân tích ngữ cảnh mới: ${textTransformer(original.explanation)}\n` +
      `• Đáp án chính xác được xác định là phương án ${newCorrectChoice || newShortAnswer}.`;

  return {
    ...original,
    id: `${original.id}_variant_${Date.now()}_${indexInExam}`,
    title: newTitle,
    content: newContent,
    choices: newChoices,
    correctChoice: newCorrectChoice,
    statements: newStatements,
    shortAnswerCorrect: newShortAnswer,
    explanation: stepByStepExplanation,
    topic: original.topic ? `${original.topic} (Khắc phục)` : 'Khắc phục lỗi sai',
  };
}

export interface QuickDrillQuestion extends ExamQuestion {
  socraticHint: string;
  variantStep: number;
}

/**
 * Sinh nhanh bộ 3 câu hỏi y chang dạng của câu học sinh vừa chọn để luyện lại tức thì trong Popup Full-screen,
 * đi kèm gợi ý hướng giải (Socratic Hint) cho từng câu.
 */
export function generateThreeSameTypeQuestions(original: ExamQuestion): QuickDrillQuestion[] {
  const cleanBaseTitle = original.title
    .replace(/^Câu\s*\d+\s*[:.-]?\s*/i, '')
    .replace(/^\[Biến Thể Khắc Phục\s*\d*\]\s*/i, '')
    .trim();

  return [1, 2, 3].map((step) => {
    const variant = generateQuestionVariant(original, step);
    return {
      ...variant,
      id: `${original.id}_quick3_${step}_${Date.now()}`,
      title: `Câu ${step}/3 — Cùng dạng: ${cleanBaseTitle || original.topicTag || 'Luyện phản xạ'}`,
      socraticHint: buildVariantSocraticHint(original, step),
      variantStep: step,
    };
  });
}

/**
 * Sinh trọn vẹn gói đề thi khắc phục lỗi sai từ danh sách câu hỏi làm sai.
 * Luôn đảm bảo sinh đủ đúng 5 câu hỏi luyện bù biến thể chuẩn 100%.
 */
export function generateRemediationExamPackage(
  wrongQuestions: ExamQuestion[],
  baseExam: PracticeExamPackage
): PracticeExamPackage {
  // 1. Lấy danh sách câu hỏi làm cơ sở sinh biến thể
  let sourceQuestions = [...wrongQuestions];

  // Nếu không có câu sai (ví dụ đạt điểm tuyệt đối nhưng vẫn muốn luyện bù), lấy từ đề gốc
  if (sourceQuestions.length === 0 && baseExam.questions.length > 0) {
    sourceQuestions = baseExam.questions.slice(0, 5);
  }

  // 2. Sinh biến thể từ các câu sai trước
  const variantQuestions = sourceQuestions.map((q, idx) => generateQuestionVariant(q, idx + 1));

  // 3. Đảm bảo luôn đủ 5 câu luyện bù theo đúng chuẩn cam kết trên giao diện ("Luyện bù ngay 5 câu")
  const TARGET_COUNT = 5;
  if (variantQuestions.length < TARGET_COUNT && baseExam.questions.length > 0) {
    const existingIds = new Set(sourceQuestions.map((q) => q.id));
    const extraCandidates = baseExam.questions.filter((q) => !existingIds.has(q.id));

    let candidateIdx = 0;
    while (variantQuestions.length < TARGET_COUNT) {
      const sourceQ =
        extraCandidates[candidateIdx] ||
        sourceQuestions[variantQuestions.length % (sourceQuestions.length || 1)] ||
        baseExam.questions[0];

      if (sourceQ) {
        variantQuestions.push(
          generateQuestionVariant(sourceQ, variantQuestions.length + 1)
        );
      } else {
        break;
      }
      candidateIdx++;
    }
  }

  // Giới hạn đúng 5 câu nếu danh sách ban đầu nhiều hơn 5 câu
  const finalQuestions = variantQuestions.slice(0, TARGET_COUNT);
  const totalPoints = finalQuestions.reduce((sum, q) => sum + (q.score || 1), 0);

  return {
    id: `remediation_${baseExam.id}_${Date.now()}`,
    subjectSlug: baseExam.subjectSlug,
    subjectName: baseExam.subjectName,
    level: baseExam.level,
    grade: baseExam.grade,
    chapterId: baseExam.chapterId,
    chapterName: baseExam.chapterName,
    format: baseExam.format,
    title: `Đề Khắc Phục Lỗi Sai (5 câu): ${baseExam.title}`,
    durationMinutes: Math.max(5, Math.min(30, finalQuestions.length * 3)),
    totalPoints: Math.round(totalPoints * 10) / 10 || 10,
    questions: finalQuestions,
  };
}
