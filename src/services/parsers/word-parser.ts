import mammoth from 'mammoth';
import { Question, QuestionType, DifficultyLevel, ParseError, Answer } from '@/types/exam';
import {
  extractDocxWithMtefAndOmml,
  parseExamTextWithMathAndKeys,
} from './mtef-math-decoder';

export interface WordParseResult {
  valid: Question[];
  errors: ParseError[];
  allParsed: (Question & { hasError?: boolean; errorReason?: string; originalIndex: number })[];
}

export async function parseWordQuestions(file: File): Promise<WordParseResult> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Ưu tiên giải mã trực tiếp XML + MathType OLE (oleObject*.bin) + Word OMML (<m:oMath>) + Bảng đáp án
  let extractedText = '';
  try {
    extractedText = await extractDocxWithMtefAndOmml(arrayBuffer);
  } catch (err) {
    console.warn('Không thể giải mã trực tiếp XML/MTEF từ docx, dùng mammoth dự phòng:', err);
  }

  // 2. Dự phòng mammoth nếu file không có cấu trúc word/document.xml chuẩn
  if (!extractedText.trim()) {
    const rawRes = await mammoth.extractRawText({ arrayBuffer });
    extractedText = rawRes.value || '';
  }

  const unifiedList = parseExamTextWithMathAndKeys(extractedText);

  const valid: Question[] = [];
  const errors: ParseError[] = [];
  const allParsed: (Question & { hasError?: boolean; errorReason?: string; originalIndex: number })[] = [];

  for (const item of unifiedList) {
    const qId = `word_q_${Date.now()}_${item.index}`;
    const qType: QuestionType = item.questionType as QuestionType;

    const answers: Answer[] = item.answers.map((ans, aIdx) => ({
      id: `ans_word_${item.index}_${aIdx}`,
      question_id: qId,
      content: ans.content,
      is_answer: ans.isCorrect,
      label: ans.label || String.fromCharCode(65 + aIdx),
    }));

    let hasError = false;
    let errorReason: string | undefined;

    if (!item.content.trim()) {
      hasError = true;
      errorReason = 'Không tìm thấy nội dung câu hỏi';
      errors.push({
        row_or_index: item.index,
        field: 'Content',
        error_type: 'MISSING_CONTENT',
        message: errorReason,
      });
    } else if (
      (qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE') &&
      answers.some((a) => !a.content.trim() || a.content.trim() === '.')
    ) {
      hasError = true;
      errorReason = 'Có phương án trả lời bị trống hoặc lỗi công thức';
      errors.push({
        row_or_index: item.index,
        field: 'Answers',
        error_type: 'MISSING_CONTENT',
        message: errorReason,
      });
    } else if (
      (qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE') &&
      answers.length > 0 &&
      !answers.some((a) => a.is_answer)
    ) {
      hasError = true;
      errorReason = 'Chưa xác định được đáp án đúng — vui lòng chọn thủ công';
      errors.push({
        row_or_index: item.index,
        field: 'Answers',
        error_type: 'MISSING_CORRECT_ANSWER',
        message: errorReason,
      });
    } else if (
      qType === 'FILL_BLANK' &&
      (!item.shortAnswer?.trim() || item.shortAnswer.trim() === '(Điền đáp số)')
    ) {
      hasError = true;
      errorReason = 'Chưa xác định được đáp số trả lời ngắn — vui lòng nhập thủ công';
      errors.push({
        row_or_index: item.index,
        field: 'CorrectAnswer',
        error_type: 'MISSING_CORRECT_ANSWER',
        message: errorReason,
      });
    }

    const parsedQuestion: Question & {
      hasError?: boolean;
      errorReason?: string;
      originalIndex: number;
    } = {
      id: qId,
      type: qType,
      title: item.title,
      content: item.content || '(Chưa có nội dung)',
      difficulty: item.difficulty as DifficultyLevel,
      chapter: item.chapter,
      points: item.points,
      image_url: item.imageUrls[0],
      img_urls: item.imageUrls.length > 0 ? item.imageUrls : undefined,
      answers,
      explain: item.explain || undefined,
      shortAnswerCorrect:
        qType === 'FILL_BLANK' && item.shortAnswer && item.shortAnswer !== '(Điền đáp số)'
          ? item.shortAnswer
          : undefined,
      hasError,
      errorReason,
      originalIndex: item.index,
      created_at: new Date().toISOString(),
    };

    allParsed.push(parsedQuestion);
    if (!hasError) {
      valid.push(parsedQuestion);
    }
  }

  return { valid, errors, allParsed };
}

