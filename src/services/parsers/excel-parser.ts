import * as XLSX from 'xlsx';
import {
  Question,
  QuestionType,
  DifficultyLevel,
  ParseError,
  Answer,
  MatchingPair,
  OrderingItem,
  ClozeBlank,
} from '@/types/exam';

export interface ParsedQuestionRow extends Question {
  hasError?: boolean;
  errorReason?: string;
  originalIndex: number;
  groupCode?: string;
}

export interface ExcelParseResult {
  valid: Question[];
  errors: ParseError[];
  allParsed: ParsedQuestionRow[];
}

export function mapDifficulty(val: string | undefined): DifficultyLevel {
  const norm = (val || '').toUpperCase().trim();
  if (norm.includes('NB') || norm.includes('NHAN_BIET') || norm.includes('DE')) return 'RECOGNITION';
  if (norm.includes('VD') && !norm.includes('VDC')) return 'APPLICATION';
  if (norm.includes('VDC') || norm.includes('VAN_DUNG_CAO') || norm.includes('KHO')) return 'ADVANCED_APPLICATION';
  return 'UNDERSTANDING'; // default TH
}

export function mapQuestionType(val: string | undefined): QuestionType {
  const norm = (val || '').toUpperCase().trim();
  if (norm.includes('TN_NHIEU') || norm.includes('NHIEU_DAP_AN') || norm.includes('MULTI')) return 'MULTIPLE_CHOICE';
  if (norm.includes('DUNG_SAI') || norm.includes('TRUE_FALSE') || norm === 'DS' || norm === 'TF') return 'TRUE_FALSE';
  if (norm.includes('DIEN_SO') || norm.includes('DIEN_KHUYET') || norm.includes('FILL') || norm.includes('TRA_LOI_NGAN') || norm.includes('SHORT')) return 'FILL_BLANK';
  if (norm.includes('TU_LUAN') || norm.includes('ESSAY') || norm === 'TL') return 'ESSAY';
  if (norm.includes('CHUM') || norm.includes('GROUP') || norm.includes('DOC_HIEU') || norm.includes('NGU_LIEU')) return 'GROUP_QUESTIONS';
  if (norm.includes('NOI') || norm.includes('MATCH') || norm.includes('GHEP')) return 'MATCHING';
  if (norm.includes('SAP_XEP') || norm.includes('ORDER') || norm.includes('THU_TU') || norm.includes('SAPXEP')) return 'ORDERING';
  if (norm.includes('DUC_LO') || norm.includes('CLOZE') || norm.includes('DIEN_TU')) return 'CLOZE_DROPDOWN';
  return 'SINGLE_CHOICE'; // default TN_1
}

function isTrueStatement(val: string | undefined): boolean {
  if (!val) return false;
  const s = val.trim().toUpperCase();
  return s === 'Đ' || s === 'D' || s === 'T' || s === 'TRUE' || s === 'DUNG' || s === '1';
}

export async function parseExcelQuestions(file: File): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const rawParsedList: ParsedQuestionRow[] = [];
  const errors: ParseError[] = [];

  // Pass 1: Parse và validate từng dòng câu hỏi
  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1
    const content = String(row.NoiDung || row['Nội dung'] || '').trim();
    const typeStr = String(row.LoaiCauHoi || row['Loại câu hỏi'] || 'TN_1').trim();
    const questionType = mapQuestionType(typeStr);
    const difficulty = mapDifficulty(String(row.MucDo || row['Mức độ'] || 'TH'));
    const chapter = String(row.Chuong || row['Chương'] || '').trim();
    const groupCode = String(row.MaNhom || row['Mã nhóm'] || row.GroupCode || '').trim();
    const explain = String(row.LoiGiai || row['Lời giải'] || '').trim();
    const hints = row.GoiY ? [String(row.GoiY).trim()] : [];

    // Mặc định điểm: Đúng/sai = 1.0, Tự luận = 1.0, Trắc nghiệm = 0.25
    const defaultPoints =
      questionType === 'TRUE_FALSE' || questionType === 'ESSAY'
        ? 1.0
        : questionType === 'GROUP_QUESTIONS'
          ? 0.0
          : 0.25;
    const points = parseFloat(row.Diem || row['Điểm']) || defaultPoints;

    let hasError = false;
    let errorReason = '';

    // 1. Kiểm tra nội dung câu hỏi
    if (!content) {
      hasError = true;
      errorReason = 'Nội dung câu hỏi không được để trống';
      errors.push({
        row_or_index: rowNum,
        field: 'NoiDung',
        error_type: 'MISSING_CONTENT',
        message: errorReason,
        raw_data: row,
      });
    }

    // Các lựa chọn đáp án A, B, C, D
    const rawAnswers = [
      { label: 'A', text: String(row.DapAnA || row['Đáp án A'] || '').trim() },
      { label: 'B', text: String(row.DapAnB || row['Đáp án B'] || '').trim() },
      { label: 'C', text: String(row.DapAnC || row['Đáp án C'] || '').trim() },
      { label: 'D', text: String(row.DapAnD || row['Đáp án D'] || '').trim() },
    ].filter((a) => a.text.length > 0);

    const correctStr = String(row.DapAnDung || row['Đáp án đúng'] || '').trim();
    const correctUpper = correctStr.toUpperCase();

    let answers: Answer[] = [];
    let matchingPairs: MatchingPair[] | undefined;
    let orderingItems: OrderingItem[] | undefined;
    let clozeBlanks: ClozeBlank[] | undefined;
    let statements: { subId: string; statement: string; isCorrect: boolean; explanation?: string }[] | undefined;
    let shortAnswerCorrect: string | undefined;
    let sampleEssayAnswer: string | undefined;

    // 2. Xử lý & validate theo từng dạng trong 9 dạng câu hỏi
    switch (questionType) {
      case 'SINGLE_CHOICE': {
        if (rawAnswers.length < 2) {
          hasError = true;
          errorReason = 'Cần ít nhất 2 đáp án (A, B)';
          errors.push({
            row_or_index: rowNum,
            field: 'Answers',
            error_type: 'NOT_ENOUGH_ANSWERS',
            message: errorReason,
            raw_data: row,
          });
        } else if (!correctUpper) {
          hasError = true;
          errorReason = 'Chưa chọn đáp án đúng (cột DapAnDung: A/B/C/D)';
          errors.push({
            row_or_index: rowNum,
            field: 'DapAnDung',
            error_type: 'MISSING_CORRECT_ANSWER',
            message: errorReason,
            raw_data: row,
          });
        }

        answers = rawAnswers.map((a, aIdx) => ({
          id: `ans_${rowNum}_${aIdx}`,
          question_id: `q_${rowNum}`,
          content: a.text,
          is_answer: correctUpper.includes(a.label),
          label: a.label,
        }));
        break;
      }

      case 'MULTIPLE_CHOICE': {
        if (rawAnswers.length < 2) {
          hasError = true;
          errorReason = 'Cần ít nhất 2 đáp án lựa chọn';
          errors.push({
            row_or_index: rowNum,
            field: 'Answers',
            error_type: 'NOT_ENOUGH_ANSWERS',
            message: errorReason,
            raw_data: row,
          });
        } else if (!correctUpper) {
          hasError = true;
          errorReason = 'Chưa chọn đáp án đúng (ví dụ: A, C)';
          errors.push({
            row_or_index: rowNum,
            field: 'DapAnDung',
            error_type: 'MISSING_CORRECT_ANSWER',
            message: errorReason,
            raw_data: row,
          });
        }

        const parts = correctUpper.split(/[,;\s]+/).map((s) => s.trim());
        answers = rawAnswers.map((a, aIdx) => ({
          id: `ans_${rowNum}_${aIdx}`,
          question_id: `q_${rowNum}`,
          content: a.text,
          is_answer: parts.includes(a.label),
          label: a.label,
        }));
        break;
      }

      case 'TRUE_FALSE': {
        if (rawAnswers.length < 2) {
          hasError = true;
          errorReason = 'Cần ít nhất 2 mệnh đề (a, b, c, d)';
          errors.push({
            row_or_index: rowNum,
            field: 'Answers',
            error_type: 'NOT_ENOUGH_ANSWERS',
            message: errorReason,
            raw_data: row,
          });
        } else if (!correctUpper) {
          hasError = true;
          errorReason = 'Chưa nhập đáp án đúng/sai (ví dụ: Đ, S, Đ, S hoặc T, F, T, F)';
          errors.push({
            row_or_index: rowNum,
            field: 'DapAnDung',
            error_type: 'MISSING_CORRECT_ANSWER',
            message: errorReason,
            raw_data: row,
          });
        }

        const parts = correctUpper.split(/[,;\s-]+/).map((s) => s.trim());
        statements = [];
        answers = rawAnswers.map((a, aIdx) => {
          const isAns = isTrueStatement(parts[aIdx]);
          statements!.push({
            subId: a.label.toLowerCase(),
            statement: a.text,
            isCorrect: isAns,
          });
          return {
            id: `ans_${rowNum}_${aIdx}`,
            question_id: `q_${rowNum}`,
            content: `${a.label}) ${a.text}`,
            is_answer: isAns,
            label: a.label,
          };
        });
        break;
      }

      case 'FILL_BLANK': {
        // Dạng điền số / kết quả ngắn: Không cần cột DapAnA-D
        if (!correctStr) {
          hasError = true;
          errorReason = 'Chưa nhập kết quả/đáp số đúng vào cột DapAnDung';
          errors.push({
            row_or_index: rowNum,
            field: 'DapAnDung',
            error_type: 'MISSING_CORRECT_ANSWER',
            message: errorReason,
            raw_data: row,
          });
        }

        shortAnswerCorrect = correctStr;
        answers = [
          {
            id: `ans_${rowNum}_0`,
            question_id: `q_${rowNum}`,
            content: correctStr,
            is_answer: true,
            label: 'ĐS',
          },
        ];
        break;
      }

      case 'ESSAY': {
        // Tự luận: Không bắt buộc có DapAnA..D hay DapAnDung
        sampleEssayAnswer = correctStr || explain || 'Theo barem hướng dẫn chấm';
        answers = [];
        break;
      }

      case 'GROUP_QUESTIONS': {
        // Chùm câu hỏi ngữ liệu mẹ: Chứa nội dung bài đọc / đồ thị chung
        answers = [];
        break;
      }

      case 'MATCHING': {
        // Dạng nối cặp: Đáp án chứa "Vế trái | Vế phải"
        matchingPairs = [];
        rawAnswers.forEach((a, aIdx) => {
          const splitParts = a.text.split(/\||---|;/).map((s) => s.trim());
          const leftText = splitParts[0] || a.text;
          const rightText = splitParts[1] || '';
          matchingPairs!.push({
            id: `pair_${rowNum}_${aIdx + 1}`,
            left_text: leftText,
            right_text: rightText,
            correct_match: rightText,
          });
        });

        if (matchingPairs.length < 2) {
          hasError = true;
          errorReason = 'Cần ít nhất 2 cặp nối (định dạng Vế trái | Vế phải ở các cột DapAnA..D)';
          errors.push({
            row_or_index: rowNum,
            field: 'Answers',
            error_type: 'NOT_ENOUGH_ANSWERS',
            message: errorReason,
            raw_data: row,
          });
        }

        answers = rawAnswers.map((a, aIdx) => ({
          id: `ans_${rowNum}_${aIdx}`,
          question_id: `q_${rowNum}`,
          content: a.text,
          is_answer: true,
          label: a.label,
        }));
        break;
      }

      case 'ORDERING': {
        // Dạng sắp xếp theo thứ tự đúng: DapAnA..D chứa các bước
        if (rawAnswers.length < 2) {
          hasError = true;
          errorReason = 'Cần ít nhất 2 bước/ý cần sắp xếp (ở cột DapAnA..D)';
          errors.push({
            row_or_index: rowNum,
            field: 'Answers',
            error_type: 'NOT_ENOUGH_ANSWERS',
            message: errorReason,
            raw_data: row,
          });
        } else if (!correctStr) {
          hasError = true;
          errorReason = 'Chưa chỉ định thứ tự đúng ở DapAnDung (ví dụ: 2-3-4-1 hoặc B-C-D-A)';
          errors.push({
            row_or_index: rowNum,
            field: 'DapAnDung',
            error_type: 'MISSING_CORRECT_ANSWER',
            message: errorReason,
            raw_data: row,
          });
        }

        // Bóc tách thứ tự đúng (ví dụ: "2-3-4-1" hoặc "B-C-D-A" hoặc "2, 3, 4, 1")
        const orderTokens = correctStr
          .split(/[-,\s;]+/)
          .map((t) => t.trim().toUpperCase())
          .filter(Boolean);

        orderingItems = rawAnswers.map((a, aIdx) => {
          let pos = aIdx + 1;
          // Tìm theo số thứ tự (ví dụ: '1', '2', '3')
          const numIdx = orderTokens.indexOf(String(aIdx + 1));
          if (numIdx !== -1) {
            pos = numIdx + 1;
          } else {
            // Hoặc tìm theo nhãn chữ cái (ví dụ: 'A', 'B', 'C')
            const charIdx = orderTokens.indexOf(a.label);
            if (charIdx !== -1) {
              pos = charIdx + 1;
            }
          }

          return {
            id: `ord_${rowNum}_${aIdx + 1}`,
            content: a.text,
            correct_order: pos,
          };
        });

        answers = rawAnswers.map((a, aIdx) => ({
          id: `ans_${rowNum}_${aIdx}`,
          question_id: `q_${rowNum}`,
          content: a.text,
          is_answer: true,
          label: a.label,
          order_index: orderingItems ? orderingItems[aIdx]?.correct_order : aIdx + 1,
        }));
        break;
      }

      case 'CLOZE_DROPDOWN': {
        // Dạng đục lỗ chọn từ inline: Bóc tách token [opt1*|opt2|opt3]
        clozeBlanks = [];
        const blankRegex = /\[([^\]]+)\]/g;
        let match: RegExpExecArray | null;
        let blankIndex = 1;

        while ((match = blankRegex.exec(content)) !== null) {
          const rawOptions = match[1].split('|').map((s) => s.trim());
          let correctAnswer = '';
          const cleanedOptions: string[] = [];

          rawOptions.forEach((opt) => {
            if (opt.endsWith('*') || opt.startsWith('*')) {
              const clean = opt.replace(/\*/g, '').trim();
              correctAnswer = clean;
              cleanedOptions.push(clean);
            } else {
              cleanedOptions.push(opt);
            }
          });

          if (!correctAnswer && cleanedOptions.length > 0) {
            correctAnswer = cleanedOptions[0];
          }

          clozeBlanks.push({
            id: `blank_${rowNum}_${blankIndex}`,
            index: blankIndex,
            options: cleanedOptions,
            correct_answer: correctAnswer,
          });
          blankIndex++;
        }

        // Nếu nội dung không có cú pháp [opt*|opt], kiểm tra cột DapAnDung
        if (clozeBlanks.length === 0 && correctStr) {
          const words = correctStr.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
          words.forEach((w, wIdx) => {
            clozeBlanks!.push({
              id: `blank_${rowNum}_${wIdx + 1}`,
              index: wIdx + 1,
              options: [w],
              correct_answer: w,
            });
          });
        }

        if (clozeBlanks.length === 0) {
          hasError = true;
          errorReason = 'Cần chứa ít nhất 1 ô đục lỗ cú pháp [từ_đúng*|từ_sai] trong nội dung';
          errors.push({
            row_or_index: rowNum,
            field: 'NoiDung',
            error_type: 'INVALID_FORMAT',
            message: errorReason,
            raw_data: row,
          });
        }

        answers = clozeBlanks.map((b) => ({
          id: b.id,
          question_id: `q_${rowNum}`,
          content: b.correct_answer,
          is_answer: true,
          label: `Ô ${b.index}`,
        }));
        break;
      }
    }

    const parsedQuestion: ParsedQuestionRow = {
      id: `excel_q_${Date.now()}_${idx}`,
      type: questionType,
      title: `Câu ${row.STT || idx + 1}`,
      content: content || '(Chưa nhập nội dung)',
      difficulty,
      chapter: chapter || 'Chương chung',
      groupCode: groupCode || undefined,
      points,
      answers,
      explain,
      hints,
      matching_pairs: matchingPairs,
      ordering_items: orderingItems,
      cloze_blanks: clozeBlanks,
      statements,
      shortAnswerCorrect,
      sample_essay_answer: sampleEssayAnswer,
      passage_content: questionType === 'GROUP_QUESTIONS' ? content : undefined,
      sub_questions: questionType === 'GROUP_QUESTIONS' ? [] : undefined,
      hasError,
      errorReason: hasError ? errorReason : undefined,
      originalIndex: rowNum,
      created_at: new Date().toISOString(),
    };

    rawParsedList.push(parsedQuestion);
  });

  // Pass 2: Gom chùm câu hỏi ngữ liệu (GROUP_QUESTIONS)
  // Nếu có câu mẹ GROUP_QUESTIONS, liên kết các câu con có cùng groupCode hoặc đặt ngay sau nó
  const valid: Question[] = [];
  const allParsed: ParsedQuestionRow[] = [];

  for (let i = 0; i < rawParsedList.length; i++) {
    const current = rawParsedList[i];

    if (current.type === 'GROUP_QUESTIONS') {
      current.sub_questions = [];
      const currentGroupCode = current.groupCode;

      // Tìm các câu con: Cùng groupCode (nếu có) hoặc các câu liên tiếp phía sau không phải GROUP_QUESTIONS
      for (let j = i + 1; j < rawParsedList.length; j++) {
        const nextQ = rawParsedList[j];
        if (nextQ.type === 'GROUP_QUESTIONS') break;

        const isMatchGroup = currentGroupCode && nextQ.groupCode
          ? nextQ.groupCode === currentGroupCode
          : Boolean(nextQ.groupCode && currentGroupCode === nextQ.groupCode);

        if (isMatchGroup) {
          nextQ.passage_content = current.content;
          current.sub_questions.push(nextQ);
        }
      }
    } else if (current.groupCode) {
      // Tìm xem có câu mẹ nào chứa groupCode này chưa
      const parentGroup = rawParsedList.find(
        (p) => p.type === 'GROUP_QUESTIONS' && p.groupCode === current.groupCode
      );
      if (parentGroup && !current.passage_content) {
        current.passage_content = parentGroup.content;
      }
    }

    allParsed.push(current);
    if (!current.hasError) {
      valid.push(current);
    }
  }

  return { valid, errors, allParsed };
}
