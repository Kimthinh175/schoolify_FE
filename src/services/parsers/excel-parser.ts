import * as XLSX from 'xlsx';
import { Question, QuestionType, DifficultyLevel, ParseError, Answer } from '@/types/exam';

function mapDifficulty(val: string | undefined): DifficultyLevel {
  const norm = (val || '').toUpperCase().trim();
  if (norm.includes('NB') || norm.includes('NHAN_BIET') || norm.includes('DE')) return 'RECOGNITION';
  if (norm.includes('VD') && !norm.includes('VDC')) return 'APPLICATION';
  if (norm.includes('VDC') || norm.includes('VAN_DUNG_CAO') || norm.includes('KHO')) return 'ADVANCED_APPLICATION';
  return 'UNDERSTANDING'; // default
}

function mapQuestionType(val: string | undefined): QuestionType {
  const norm = (val || '').toUpperCase().trim();
  if (norm.includes('TN_NHIEU') || norm.includes('MULTI')) return 'MULTIPLE_CHOICE';
  if (norm.includes('DUNG_SAI') || norm.includes('TRUE_FALSE')) return 'TRUE_FALSE';
  if (norm.includes('DIEN') || norm.includes('FILL')) return 'FILL_BLANK';
  if (norm.includes('TU_LUAN') || norm.includes('ESSAY')) return 'ESSAY';
  if (norm.includes('CHUM') || norm.includes('GROUP')) return 'GROUP_QUESTIONS';
  if (norm.includes('NOI') || norm.includes('MATCH')) return 'MATCHING';
  if (norm.includes('SAP_XEP') || norm.includes('ORDER')) return 'ORDERING';
  if (norm.includes('DUC_LO') || norm.includes('CLOZE')) return 'CLOZE_DROPDOWN';
  return 'SINGLE_CHOICE'; // default
}

export interface ExcelParseResult {
  valid: Question[];
  errors: ParseError[];
  allParsed: (Question & { hasError?: boolean; errorReason?: string; originalIndex: number })[];
}

export async function parseExcelQuestions(file: File): Promise<ExcelParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const valid: Question[] = [];
  const errors: ParseError[] = [];
  const allParsed: (Question & { hasError?: boolean; errorReason?: string; originalIndex: number })[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1
    const content = String(row.NoiDung || row['Nội dung'] || '').trim();
    const typeStr = String(row.LoaiCauHoi || row['Loại câu hỏi'] || 'TN_1').trim();
    const questionType = mapQuestionType(typeStr);
    const difficulty = mapDifficulty(String(row.MucDo || row['Mức độ'] || 'TH'));
    const chapter = String(row.Chuong || row['Chương'] || '').trim();
    const points = parseFloat(row.Diem || row['Điểm']) || (questionType === 'TRUE_FALSE' ? 1.0 : 0.25);
    const explain = String(row.LoiGiai || row['Lời giải'] || '').trim();
    const hints = row.GoiY ? [String(row.GoiY).trim()] : [];

    let hasError = false;
    let errorReason = '';

    // Check nội dung câu hỏi
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

    // Xử lý các đáp án A, B, C, D
    const rawAnswers = [
      { label: 'A', text: String(row.DapAnA || row['Đáp án A'] || '').trim() },
      { label: 'B', text: String(row.DapAnB || row['Đáp án B'] || '').trim() },
      { label: 'C', text: String(row.DapAnC || row['Đáp án C'] || '').trim() },
      { label: 'D', text: String(row.DapAnD || row['Đáp án D'] || '').trim() },
    ].filter((a) => a.text.length > 0);

    const correctStr = String(row.DapAnDung || row['Đáp án đúng'] || '').trim().toUpperCase();

    // Validate đáp án cho từng loại câu hỏi
    if (questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') {
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
      } else if (!correctStr) {
        hasError = true;
        errorReason = 'Chưa chọn đáp án đúng (cột DapAnDung)';
        errors.push({
          row_or_index: rowNum,
          field: 'DapAnDung',
          error_type: 'MISSING_CORRECT_ANSWER',
          message: errorReason,
          raw_data: row,
        });
      }
    }

    const answers: Answer[] = rawAnswers.map((a, aIdx) => {
      let isAnswer = false;
      if (questionType === 'SINGLE_CHOICE') {
        isAnswer = correctStr.includes(a.label);
      } else if (questionType === 'MULTIPLE_CHOICE') {
        const parts = correctStr.split(/[,;\s]+/).map((s) => s.trim());
        isAnswer = parts.includes(a.label);
      } else if (questionType === 'TRUE_FALSE') {
        // e.g. Đ, S, Đ, S
        const parts = correctStr.split(/[,;\s]+/).map((s) => s.trim());
        isAnswer = parts[aIdx] === 'Đ' || parts[aIdx] === 'T' || parts[aIdx] === 'DUNG';
      }
      return {
        id: `ans_${rowNum}_${aIdx}`,
        question_id: `q_${rowNum}`,
        content: a.text,
        is_answer: isAnswer,
        label: a.label,
      };
    });

    const parsedQuestion: Question & { hasError?: boolean; errorReason?: string; originalIndex: number } = {
      id: `excel_q_${Date.now()}_${idx}`,
      type: questionType,
      title: `Câu ${row.STT || idx + 1}`,
      content: content || '(Chưa nhập nội dung)',
      difficulty,
      chapter: chapter || 'Chương chung',
      points,
      answers,
      explain,
      hints,
      hasError,
      errorReason,
      originalIndex: rowNum,
      created_at: new Date().toISOString(),
    };

    allParsed.push(parsedQuestion);
    if (!hasError) {
      valid.push(parsedQuestion);
    }
  });

  return { valid, errors, allParsed };
}
