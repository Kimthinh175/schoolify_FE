import {
  QuestionBank,
  Question,
  ParsedQuestionItem,
  ParseImportResult,
  QuestionBankReviewStatus,
} from '@/types';
import { DifficultyLevel, QuestionType } from '@/types/exam';
import { MOCK_QUESTION_BANKS } from './mock/data';
import mammoth from 'mammoth';
import {
  extractDocxWithMtefAndOmml,
  parseExamTextWithMathAndKeys,
} from './parsers/mtef-math-decoder';

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function recalcCount(bank: QuestionBank) {
  bank.questions_count = bank.questions?.length ?? 0;
  bank.updated_at = new Date().toISOString();
}

const SLUG_TO_SUBJECT_NAME: Record<string, string> = {
  'toan-hoc': 'Toán Học',
  'vat-ly': 'Vật Lý',
  'hoa-hoc': 'Hóa Học',
  'sinh-hoc': 'Sinh Học',
  'tieng-anh': 'Tiếng Anh',
  'lich-su': 'Lịch Sử',
  'dia-ly': 'Địa Lý',
  'ngu-van': 'Ngữ Văn',
  'tin-hoc': 'Tin Học',
  'cong-nghe': 'Công Nghệ',
  'gdkt-phap-luat': 'GDKT & Pháp Luật',
  'khoa-hoc-tu-nhien': 'Khoa Học Tự Nhiên',
};

export function mapBloomToDifficulty(bloom?: string | null): DifficultyLevel {
  switch (String(bloom || '').toUpperCase()) {
    case 'NHAN_BIET':
      return 'RECOGNITION';
    case 'THONG_HIEU':
      return 'UNDERSTANDING';
    case 'VAN_DUNG':
      return 'APPLICATION';
    case 'VAN_DUNG_CAO':
      return 'ADVANCED_APPLICATION';
    default:
      return 'UNDERSTANDING';
  }
}

export function mapDifficultyToBloom(diff?: DifficultyLevel | string | null): string {
  switch (String(diff || '').toUpperCase()) {
    case 'RECOGNITION':
    case 'NHAN_BIET':
      return 'NHAN_BIET';
    case 'UNDERSTANDING':
    case 'THONG_HIEU':
      return 'THONG_HIEU';
    case 'APPLICATION':
    case 'VAN_DUNG':
      return 'VAN_DUNG';
    case 'ADVANCED_APPLICATION':
    case 'VAN_DUNG_CAO':
      return 'VAN_DUNG_CAO';
    default:
      return 'THONG_HIEU';
  }
}

export function mapBackendQuestionToFrontend(raw: any): Question {
  const rawSubject = String(raw.subject || 'toan-hoc').trim();
  const subjectName =
    SLUG_TO_SUBJECT_NAME[rawSubject.toLowerCase()] || rawSubject || 'Toán Học';

  const rawFormat = String(raw.question_format || raw.type || 'SINGLE_CHOICE').toUpperCase();
  let qType: QuestionType = 'SINGLE_CHOICE';
  if (rawFormat === 'TRUE_FALSE_GROUP' || rawFormat === 'TRUE_FALSE') {
    qType = 'TRUE_FALSE';
  } else if (rawFormat === 'SHORT_ANSWER') {
    qType = 'SHORT_ANSWER';
  } else if (rawFormat === 'ESSAY') {
    qType = 'ESSAY';
  }

  const rawAnswers = Array.isArray(raw.answers) ? raw.answers : [];
  const mappedAnswers = rawAnswers.map((a: any, idx: number) => ({
    id: a.id || `ans-${raw.id}-${idx}`,
    question_id: raw.id,
    content: a.content || '',
    explain: a.explain || null,
    is_answer: Boolean(a.is_answer),
    label: String.fromCharCode(65 + idx),
    order_index: idx,
  }));

  return {
    id: raw.id,
    bank_id: raw.bank_id || null,
    type: qType,
    title: raw.title || `Câu hỏi ${subjectName}`,
    content: raw.question || raw.content || '',
    points: Number(raw.points || 0.25),
    difficulty: mapBloomToDifficulty(raw.bloom_level),
    subject: subjectName,
    grade_level: raw.grade ? Number(raw.grade) : 12,
    chapter: raw.chapter || `Chương ${raw.chapter_id || 1}`,
    explain: raw.explanation || raw.explain || '',
    answers: mappedAnswers,
    created_at: raw.created_at || new Date().toISOString(),
  };
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

/** Service quản lý Ngân hàng đề & Import câu hỏi (Kết nối trực tiếp PostgreSQL /api/v1/exams/*) */
export const questionBankService = {
  /** Tải danh sách câu hỏi từ PostgreSQL (`GET /api/v1/exams/questions`) */
  async fetchPostgresQuestions(params?: {
    page?: number;
    limit?: number;
    subject?: string;
    grade?: number;
    bloomLevel?: string;
    search?: string;
  }): Promise<{ items: Question[]; total: number }> {
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(params?.page || 1));
      qs.set('limit', String(params?.limit || 1000));
      if (params?.subject) qs.set('subject', params.subject);
      if (params?.grade) qs.set('grade', String(params.grade));
      if (params?.bloomLevel) qs.set('bloomLevel', params.bloomLevel);
      if (params?.search) qs.set('search', params.search);

      const res = await fetch(`/api/v1/exams/questions?${qs.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return { items: [], total: 0 };
      const json = await res.json();
      const rawItems: any[] = json?.data?.items || [];
      return {
        items: rawItems.map(mapBackendQuestionToFrontend),
        total: Number(json?.data?.total || rawItems.length),
      };
    } catch (err) {
      console.warn('[questionBankService.fetchPostgresQuestions] Failed:', err);
      return { items: [], total: 0 };
    }
  },

  /** Tạo câu hỏi mới trong PostgreSQL (`POST /api/v1/exams/questions`) */
  async createPostgresQuestion(question: Partial<Question>): Promise<Question | null> {
    try {
      const res = await fetch('/api/v1/exams/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: question.subject || 'Toán Học',
          grade: Number(question.grade_level || 12),
          topicName: question.title || question.chapter || 'Câu hỏi chuẩn hóa',
          question: question.content || '',
          explanation: question.explain || '',
          bloomLevel: mapDifficultyToBloom(question.difficulty),
          questionFormat:
            question.type === 'TRUE_FALSE'
              ? 'TRUE_FALSE'
              : question.type === 'MULTIPLE_CHOICE'
                ? 'MULTI_CHOICE'
                : question.type === 'SHORT_ANSWER' || question.type === 'FILL_BLANK'
                  ? 'SHORT_ANSWER'
                  : question.type === 'ESSAY'
                    ? 'ESSAY'
                    : 'SINGLE_CHOICE',
          answers: (question.answers || []).map((a) => ({
            content: a.content,
            is_answer: Boolean(a.is_answer),
            explanation: a.explain || undefined,
          })),
        }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.data) {
        return mapBackendQuestionToFrontend(json.data);
      }
      return null;
    } catch (err) {
      console.warn('[questionBankService.createPostgresQuestion] Failed:', err);
      return null;
    }
  },

  /** Cập nhật câu hỏi trong PostgreSQL (`PATCH /api/v1/exams/questions/:id`) */
  async updatePostgresQuestion(
    id: string,
    question: Partial<Question>
  ): Promise<Question | null> {
    try {
      const res = await fetch(`/api/v1/exams/questions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.content,
          explanation: question.explain,
          bloomLevel: question.difficulty ? mapDifficultyToBloom(question.difficulty) : undefined,
          answers: question.answers
            ? question.answers.map((a) => ({
                content: a.content,
                is_answer: Boolean(a.is_answer),
                explanation: a.explain || undefined,
              }))
            : undefined,
        }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.data) {
        return mapBackendQuestionToFrontend(json.data);
      }
      return null;
    } catch (err) {
      console.warn('[questionBankService.updatePostgresQuestion] Failed:', err);
      return null;
    }
  },

  /** Xóa câu hỏi trong PostgreSQL (`DELETE /api/v1/exams/questions/:id`) */
  async deletePostgresQuestion(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/exams/questions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('[questionBankService.deletePostgresQuestion] Failed:', err);
      return false;
    }
  },

  /** Lấy danh sách Đề mẫu / Ngân hàng đề từ PostgreSQL (`GET /api/v1/exams/templates`) */
  async fetchExamTemplates(): Promise<any[]> {
    try {
      const res = await fetch('/api/v1/exams/templates', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data : [];
    } catch (err) {
      console.warn('[questionBankService.fetchExamTemplates] Failed:', err);
      return [];
    }
  },

  /** Danh sách ngân hàng đề (ưu tiên kết hợp từ PostgreSQL GET /api/v1/exams/templates) */
  async getBanks(ownerId?: string): Promise<QuestionBank[]> {
    try {
      const templates = await this.fetchExamTemplates();
      if (templates.length > 0) {
        const pgBanks: QuestionBank[] = templates.map((t: any) => ({
          id: t.id,
          title: t.title || 'Ngân hàng câu hỏi PostgreSQL',
          owner_id: t.owner_id || ownerId || 'tchr-01',
          school_id: t.school_id || null,
          is_premium: Boolean(t.is_premium),
          subject: 'Toán Học',
          description: `Ngân hàng câu hỏi đồng bộ trực tiếp trên PostgreSQL (${t._count?.questions || 0} câu hỏi).`,
          questions_count: Number(t._count?.questions || 0),
          count_used: Number(t._count?.exam_submissions || 0),
          created_at: t.created_at || new Date().toISOString(),
          updated_at: t.created_at || new Date().toISOString(),
          questions: [],
        }));
        return [...pgBanks, ...MOCK_QUESTION_BANKS.map((b) => ({ ...b }))];
      }
    } catch {}

    await delay();
    if (!ownerId) return MOCK_QUESTION_BANKS.map((b) => ({ ...b }));
    return MOCK_QUESTION_BANKS.filter(
      (b) => b.owner_id === ownerId || b.owner_id === 'tchr-01' || !b.owner_id
    ).map((b) => ({ ...b }));
  },

  async getBank(bankId: string): Promise<QuestionBank | undefined> {
    const localBank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (localBank) return localBank;

    // Nếu là bank trên PostgreSQL, tải câu hỏi từ PostgreSQL
    try {
      const [templates, pgQuestions] = await Promise.all([
        this.fetchExamTemplates(),
        this.fetchPostgresQuestions({ page: 1, limit: 200 }),
      ]);
      const match = templates.find((t: any) => t.id === bankId);
      if (match) {
        const bankQuestions = pgQuestions.items.filter(
          (q) => !q.bank_id || q.bank_id === bankId
        );
        return {
          id: match.id,
          title: match.title,
          owner_id: match.owner_id || 'tchr-01',
          school_id: match.school_id || null,
          is_premium: Boolean(match.is_premium),
          subject: 'Toán Học',
          description: 'Ngân hàng câu hỏi lưu trữ trên PostgreSQL',
          questions_count: bankQuestions.length,
          count_used: Number(match._count?.exam_submissions || 0),
          created_at: match.created_at || new Date().toISOString(),
          updated_at: match.created_at || new Date().toISOString(),
          questions: bankQuestions,
        };
      }
    } catch {}
    return undefined;
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

  /** Lưu câu hỏi (đồng bộ cả PostgreSQL và bộ nhớ local) */
  async saveQuestion(bankId: string, question: Question): Promise<Question | undefined> {
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    const isExisting = bank?.questions?.some((q) => q.id === question.id);

    if (isExisting) {
      await this.updatePostgresQuestion(question.id, question);
    } else {
      const created = await this.createPostgresQuestion(question);
      if (created) {
        question = { ...question, id: created.id };
      }
    }

    if (bank) {
      bank.questions = bank.questions ?? [];
      const index = bank.questions.findIndex((q) => q.id === question.id);
      if (index >= 0) {
        bank.questions[index] = question;
      } else {
        bank.questions.push(question);
      }
      recalcCount(bank);
    }
    return question;
  },

  async deleteQuestion(bankId: string, questionId: string): Promise<void> {
    await this.deletePostgresQuestion(questionId);
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank?.questions) return;
    bank.questions = bank.questions.filter((q) => q.id !== questionId);
    recalcCount(bank);
  },

  /** Bóc tách THẬT từ File Word / File Excel / Text người dùng upload (Bao gồm cả công thức toán MathType) */
  async parseImportFile(
    file: File,
    fileType: 'WORD' | 'EXCEL',
    customText?: string
  ): Promise<ParseImportResult> {
    await delay(200);

    let rawText = customText || '';

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

  /** Lưu hàng loạt câu hỏi từ Import vào Ngân hàng đề PostgreSQL */
  async batchImportQuestions(
    bankId: string,
    questions: ParsedQuestionItem[]
  ): Promise<{ imported_count: number; bank_id: string }> {
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
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
        explain: item.explain || '',
        created_at: new Date().toISOString(),
        answers: item.answers.map((ans, idx) => ({
          id: uid('ans'),
          question_id: 'q-new',
          content: ans.content,
          is_answer: ans.is_correct,
          order_index: idx,
        })),
      };
      const created = await this.createPostgresQuestion(q);
      if (created) {
        q.id = created.id;
      }
      if (bank) {
        bank.questions = bank.questions ?? [];
        bank.questions.push(q);
      }
      count++;
    }

    if (bank) recalcCount(bank);
    return { imported_count: count, bank_id: bankId };
  },
};
