import { QuestionBank, Question, ParsedQuestionItem, ParseImportResult, QuestionBankReviewStatus } from '@/types';
import { MOCK_QUESTION_BANKS } from './mock/data';
import mammoth from 'mammoth';
import {
  extractDocxWithMtefAndOmml,
  parseExamTextWithMathAndKeys,
} from './parsers/mtef-math-decoder';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function recalcCount(bank: QuestionBank) {
  bank.questions_count = bank.questions?.length ?? 0;
  bank.updated_at = new Date().toISOString();
}

/** Trích xuất toàn bộ đoạn văn, BẢNG BIỂU, HÌNH ẢNH & Công thức MathType OLE (oleObject*.bin) / Word OMML (<m:oMath>) sang LaTeX $...$ */
export async function extractDocxTextWithMath(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    return await extractDocxWithMtefAndOmml(arrayBuffer);
  } catch (e) {
    console.warn('Lỗi đọc XML/MTEF file docx bằng JSZip:', e);
    return '';
  }
}

/** Hàm Bóc tách Văn bản Đề thi Thật (Phần 1: Trắc nghiệm 4 đáp án, Phần 2: Đúng/Sai, Phần 3: Trả lời ngắn/Tự luận) */
export function parseExamTextToQuestions(text: string): ParsedQuestionItem[] {
  const unifiedList = parseExamTextWithMathAndKeys(text);

  return unifiedList.map((item) => {
    const qType =
      item.questionType === 'FILL_BLANK'
        ? 'ESSAY'
        : (item.questionType as ParsedQuestionItem['question_type']);

    const answers = item.answers.map((a) => ({
      content:
        item.questionType === 'TRUE_FALSE' && !/^[a-d]\)/i.test(a.content)
          ? `${a.label}) ${a.content}`
          : item.questionType === 'FILL_BLANK' && !a.content.startsWith('Đáp số')
            ? `Đáp số: ${a.content}`
            : a.content,
      is_correct: a.isCorrect,
    }));

    const hasCorrect = answers.some((a) => a.is_correct);
    const hasContent = item.content.trim() !== '';
    const isValid = qType === 'ESSAY' ? hasContent : hasContent && hasCorrect;

    return {
      temp_id: `temp-parsed-${item.index}`,
      question_type: qType,
      content: `${item.title}. ${item.content}`.trim(),
      img_urls: item.imageUrls.length > 0 ? item.imageUrls : undefined,
      explain: item.explain || '',
      points: item.points,
      is_valid: isValid,
      validation_errors: !hasContent
        ? ['Nội dung câu hỏi không được để trống']
        : qType !== 'ESSAY' && !hasCorrect
          ? ['Vui lòng chọn ít nhất 1 đáp án đúng']
          : [],
      answers,
    };
  });
}

/** Service quản lý Ngân hàng đề & Import câu hỏi (ERD: QuestionBank → Question → Answer) */
export const questionBankService = {
  /** Danh sách ngân hàng đề của giáo viên (owner_id) */
  async getBanks(ownerId?: string): Promise<QuestionBank[]> {
    await delay();
    if (!ownerId) return MOCK_QUESTION_BANKS.map((b) => ({ ...b }));
    return MOCK_QUESTION_BANKS.filter(
      (b) => b.owner_id === ownerId || b.owner_id === 'tchr-01' || !b.owner_id
    ).map((b) => ({ ...b }));
  },

  async getBank(bankId: string): Promise<QuestionBank | undefined> {
    await delay();
    return MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
  },

  async createBank(payload: {
    title: string;
    owner_id: string;
    subject?: string;
    description?: string;
    is_premium?: boolean;
    school_id?: string;
  }): Promise<QuestionBank> {
    await delay();
    const now = new Date().toISOString();
    const bank: QuestionBank = {
      id: uid('bank'),
      title: payload.title,
      owner_id: payload.owner_id,
      school_id: payload.school_id ?? null,
      is_premium: payload.is_premium ?? false,
      subject: payload.subject ?? null,
      description: payload.description ?? null,
      questions_count: 0,
      count_used: 0,
      created_at: now,
      updated_at: now,
      questions: [],
    };
    MOCK_QUESTION_BANKS.unshift(bank);
    return bank;
  },

  async updateBank(bankId: string, patch: Partial<QuestionBank>): Promise<QuestionBank | undefined> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) return undefined;
    Object.assign(bank, patch);
    recalcCount(bank);
    return bank;
  },

  /** Bật/tắt ngân hàng Premium (is_premium) */
  async togglePremium(bankId: string, value: boolean): Promise<QuestionBank | undefined> {
    await delay(150);
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) return undefined;
    bank.is_premium = value;
    bank.updated_at = new Date().toISOString();
    return bank;
  },

  async updateReviewStatus(
    bankId: string,
    status: QuestionBankReviewStatus,
    reviewNote = '',
    reviewedBy = 'HOD hiện tại'
  ): Promise<QuestionBank | undefined> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((item) => item.id === bankId);
    if (!bank) return undefined;
    Object.assign(bank, {
      status,
      review_note: reviewNote,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return bank;
  },

  async deleteBank(bankId: string): Promise<void> {
    await delay();
    const index = MOCK_QUESTION_BANKS.findIndex((b) => b.id === bankId);
    if (index >= 0) MOCK_QUESTION_BANKS.splice(index, 1);
  },

  /** Lưu câu hỏi (thêm mới nếu chưa có id trong bank) */
  async saveQuestion(bankId: string, question: Question): Promise<Question | undefined> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) return undefined;
    bank.questions = bank.questions ?? [];
    const index = bank.questions.findIndex((q) => q.id === question.id);
    if (index >= 0) {
      bank.questions[index] = question;
    } else {
      bank.questions.push(question);
    }
    recalcCount(bank);
    return question;
  },

  async deleteQuestion(bankId: string, questionId: string): Promise<void> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank?.questions) return;
    bank.questions = bank.questions.filter((q) => q.id !== questionId);
    recalcCount(bank);
  },

  /** Bóc tách THẬT từ File Word / File Excel / Text người dùng upload (Bao gồm cả công thức toán MathType) */
  async parseImportFile(file: File, fileType: 'WORD' | 'EXCEL', customText?: string): Promise<ParseImportResult> {
    await delay(300);

    let rawText = customText || '';

    // Đọc văn bản THẬT bao gồm cả các thẻ công thức toán <m:t> từ file .docx
    if (!rawText && file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        rawText = await extractDocxTextWithMath(arrayBuffer);

        if (!rawText.trim()) {
          const res = await mammoth.extractRawText({ arrayBuffer });
          rawText = res.value || '';
        }
      } catch (err) {
        console.warn('Không thể đọc file Word trực tiếp từ trình duyệt:', err);
      }
    }

    const parsedItems: ParsedQuestionItem[] = parseExamTextToQuestions(rawText);

    const validCount = parsedItems.filter((i) => i.is_valid).length;
    const invalidCount = parsedItems.length - validCount;

    return {
      summary: {
        total_parsed: parsedItems.length,
        valid_count: validCount,
        invalid_count: invalidCount,
      },
      parsed_questions: parsedItems,
      raw_text: rawText,
    };
  },

  /** Lưu hàng loạt câu hỏi từ Import vào Ngân hàng đề */
  async batchImportQuestions(
    bankId: string,
    questions: ParsedQuestionItem[]
  ): Promise<{ imported_count: number; bank_id: string }> {
    await delay(300);
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) throw new Error('Ngân hàng đề không tồn tại');

    bank.questions = bank.questions ?? [];
    const validItems = questions.filter((q) => q.is_valid);
    let count = 0;

    for (const item of validItems) {
      const q: Question = {
        id: uid('q'),
        bank_id: bankId,
        type: item.question_type,
        content: item.content,
        img_urls: item.img_urls,
        points: item.points || 1.0,
        created_at: new Date().toISOString(),
        answers: item.answers.map((ans, idx) => ({
          id: uid('ans'),
          question_id: 'q-new',
          content: ans.content,
          is_answer: ans.is_correct,
          order_index: idx,
        })),
      };
      bank.questions.push(q);
      count++;
    }

    recalcCount(bank);
    return { imported_count: count, bank_id: bankId };
  },
};
