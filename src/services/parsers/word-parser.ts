import mammoth from 'mammoth';
import { Question, QuestionType, DifficultyLevel, ParseError, Answer } from '@/types/exam';

function extractDifficulty(text: string): { difficulty: DifficultyLevel; cleanText: string } {
  let difficulty: DifficultyLevel = 'UNDERSTANDING';
  let cleanText = text;

  if (/\[VDC\]/i.test(text) || /\[VẬN DỤNG CAO\]/i.test(text)) {
    difficulty = 'ADVANCED_APPLICATION';
    cleanText = cleanText.replace(/\[(VDC|VẬN DỤNG CAO)\]/gi, '');
  } else if (/\[VD\]/i.test(text) || /\[VẬN DỤNG\]/i.test(text)) {
    difficulty = 'APPLICATION';
    cleanText = cleanText.replace(/\[(VD|VẬN DỤNG)\]/gi, '');
  } else if (/\[NB\]/i.test(text) || /\[NHẬN BIẾT\]/i.test(text)) {
    difficulty = 'RECOGNITION';
    cleanText = cleanText.replace(/\[(NB|NHẬN BIẾT)\]/gi, '');
  } else if (/\[TH\]/i.test(text) || /\[THÔNG HIỂU\]/i.test(text)) {
    difficulty = 'UNDERSTANDING';
    cleanText = cleanText.replace(/\[(TH|THÔNG HIỂU)\]/gi, '');
  }

  return { difficulty, cleanText: cleanText.trim() };
}

function extractChapter(text: string): { chapter: string; cleanText: string } {
  const chapterMatch = text.match(/\[(Chương[^\]]+|Chuyên đề[^\]]+)\]/i);
  let chapter = 'Chương chung';
  let cleanText = text;

  if (chapterMatch) {
    chapter = chapterMatch[1].trim();
    cleanText = cleanText.replace(chapterMatch[0], '').trim();
  }

  return { chapter, cleanText };
}

export interface WordParseResult {
  valid: Question[];
  errors: ParseError[];
  allParsed: (Question & { hasError?: boolean; errorReason?: string; originalIndex: number })[];
}

export async function parseWordQuestions(file: File): Promise<WordParseResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Convert docx sang HTML để giữ lại thẻ <u>, màu sắc style, và hình ảnh
  const convertResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "u => u",
        "b => strong",
        "i => em",
        "span[color] => span[color]",
      ],
    }
  );

  const rawHtml = convertResult.value;

  // Tách đoạn văn bản thành các dòng sạch
  // Thay thế các thẻ block thành line breaks
  const textWithBreaks = rawHtml
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  // Chia theo các câu hỏi: Tìm "Câu 1:", "Câu 1.", "[Câu 1]", "Bài 1:"
  const rawBlocks = textWithBreaks.split(/(?=(?:<[^>]+>)*\s*(?:Câu|Bài|Question)\s+\d+[\.:\]])/gi);

  const valid: Question[] = [];
  const errors: ParseError[] = [];
  const allParsed: (Question & { hasError?: boolean; errorReason?: string; originalIndex: number })[] = [];

  let questionIndex = 0;

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed || !/(?:Câu|Bài|Question)\s+\d+[\.:\]]/i.test(trimmed)) {
      continue;
    }

    questionIndex++;
    let hasError = false;
    let errorReason = '';

    // Bóc tách Lời giải / Hướng dẫn giải
    let questionBody = trimmed;
    let explain = '';
    const explainMatch = trimmed.match(/(?:Lời giải|Hướng dẫn giải|Giải chi tiết)[:\s]+([\s\S]*)$/i);
    if (explainMatch) {
      explain = explainMatch[1].replace(/<[^>]+>/g, '').trim();
      questionBody = trimmed.substring(0, explainMatch.index).trim();
    }

    // Tách dòng đầu tiên chứa tiêu đề và nội dung
    const lines = questionBody.split('\n').map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || '';

    // Lấy tiêu đề: "Câu 1"
    const titleMatch = firstLine.match(/(?:Câu|Bài|Question)\s+(\d+)/i);
    const questionNumber = titleMatch ? titleMatch[1] : `${questionIndex}`;
    const title = `Câu ${questionNumber}`;

    // Lọc bỏ prefix "Câu 1:"
    let contentHeader = firstLine.replace(/^(?:<[^>]+>)*\s*(?:Câu|Bài|Question)\s+\d+[\.:\]]\s*/i, '');

    // Bóc tách Độ khó và Chương
    const diffResult = extractDifficulty(contentHeader);
    const difficulty = diffResult.difficulty;
    const chapResult = extractChapter(diffResult.cleanText);
    const chapter = chapResult.chapter;

    // Các dòng còn lại của đề bài trước khi tới các đáp án A, B, C, D
    const questionContentLines: string[] = [chapResult.cleanText];
    const answerLines: string[] = [];

    // Duyệt các dòng tiếp theo
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Nếu dòng bắt đầu bằng A., B., C., D. hoặc *A., hoặc chứa đáp án
      if (
        /(?:<[^>]+>)*\s*[*]?\s*[<u>]?\s*[A-D][\.\)]/i.test(line) ||
        /(?:<[^>]+>)*\s*[a-d]\)\s*.*\[[ĐS]\]/i.test(line) ||
        /(?:<[^>]+>)*\s*Đáp án[:\s]/i.test(line)
      ) {
        answerLines.push(line);
      } else if (answerLines.length === 0) {
        questionContentLines.push(line);
      } else {
        // Nối vào đáp án trước đó nếu đáp án dài nhiều dòng
        answerLines[answerLines.length - 1] += ' ' + line;
      }
    }

    const cleanQuestionContent = questionContentLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (!cleanQuestionContent) {
      hasError = true;
      errorReason = 'Không tìm thấy nội dung câu hỏi';
      errors.push({
        row_or_index: questionIndex,
        field: 'Content',
        error_type: 'MISSING_CONTENT',
        message: errorReason,
      });
    }

    // Phân tích các loại câu hỏi
    let questionType: QuestionType = 'SINGLE_CHOICE';
    const answers: Answer[] = [];

    // Kiểm tra xem có phải câu hỏi Đúng/Sai (TRUE_FALSE)
    const isTrueFalse = answerLines.some((l) => /\[[ĐS]\]/i.test(l) || /\[[TF]\]/i.test(l));

    if (isTrueFalse) {
      questionType = 'TRUE_FALSE';
      answerLines.forEach((al, aIdx) => {
        const isCorrect = /\[[ĐT]\]/i.test(al);
        const label = String.fromCharCode(97 + aIdx); // a, b, c, d
        const cleanAns = al.replace(/<[^>]+>/g, '').replace(/\[[ĐSTF]\]/gi, '').trim();
        answers.push({
          id: `ans_tf_${questionIndex}_${aIdx}`,
          question_id: `q_word_${questionIndex}`,
          content: cleanAns,
          is_answer: isCorrect,
          label,
        });
      });
    } else {
      // Xử lý A, B, C, D
      // Tách các đáp án nếu nhiều đáp án nằm trên cùng 1 dòng
      const splittedAnswers: string[] = [];
      answerLines.forEach((al) => {
        // Tách theo A., B., C., D.
        const matches = al.split(/(?=(?:<[^>]+>)*\s*[*]?\s*(?:<u>)?\s*[A-D][\.\)])/g);
        matches.forEach((m) => {
          if (m.trim()) splittedAnswers.push(m.trim());
        });
      });

      let correctCount = 0;
      splittedAnswers.forEach((ansHtml, aIdx) => {
        const labelMatch = ansHtml.match(/([A-D])[\.\)]/i);
        const label = labelMatch ? labelMatch[1].toUpperCase() : String.fromCharCode(65 + aIdx);

        // 3 KIỂU ĐÁNH DẤU ĐÁP ÁN ĐÚNG:
        // 1. Gạch chân: Có thẻ <u> hoặc text-decoration: underline
        const isUnderlined = /<u>/i.test(ansHtml) || /text-decoration:\s*underline/i.test(ansHtml);
        // 2. Màu đỏ: color: red hoặc #ff0000
        const isRed = /color:\s*(red|#ff0000|#f00)/i.test(ansHtml);
        // 3. Ký tự hoa thị: Bắt đầu bằng *A hoặc * A
        const hasAsterisk = /^\s*[*]/i.test(ansHtml.replace(/<[^>]+>/g, ''));

        const isAnswer = isUnderlined || isRed || hasAsterisk;
        if (isAnswer) correctCount++;

        const cleanText = ansHtml
          .replace(/<[^>]+>/g, '')
          .replace(/^\s*[*]\s*/, '')
          .replace(/^[A-D][\.\)]\s*/i, '')
          .trim();

        answers.push({
          id: `ans_word_${questionIndex}_${aIdx}`,
          question_id: `q_word_${questionIndex}`,
          content: cleanText,
          is_answer: isAnswer,
          label,
        });
      });

      if (correctCount > 1) {
        questionType = 'MULTIPLE_CHOICE';
      }

      // Kiểm tra lỗi thiếu đáp án đúng
      if (answers.length >= 2 && correctCount === 0) {
        hasError = true;
        errorReason = 'Chưa đánh dấu đáp án đúng (Gạch chân / Đỏ / Dấu *)';
        errors.push({
          row_or_index: questionIndex,
          field: 'Answers',
          error_type: 'MISSING_CORRECT_ANSWER',
          message: errorReason,
        });
      }
    }

    const parsedQuestion: Question & { hasError?: boolean; errorReason?: string; originalIndex: number } = {
      id: `word_q_${Date.now()}_${questionIndex}`,
      type: questionType,
      title,
      content: cleanQuestionContent || '(Chưa có nội dung)',
      difficulty,
      chapter,
      points: questionType === 'TRUE_FALSE' ? 1.0 : 0.25,
      answers,
      explain: explain || undefined,
      hasError,
      errorReason,
      originalIndex: questionIndex,
      created_at: new Date().toISOString(),
    };

    allParsed.push(parsedQuestion);
    if (!hasError) {
      valid.push(parsedQuestion);
    }
  }

  return { valid, errors, allParsed };
}
