import { QuestionBank, Question } from '@/types';
import { MOCK_QUESTION_BANKS } from './mock/data';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function recalcCount(bank: QuestionBank) {
  bank.questions_count = bank.questions?.length ?? 0;
  bank.updated_at = new Date().toISOString();
}

/** Service quản lý Ngân hàng đề (ERD: QuestionBank → Question → Answer) */
export const questionBankService = {
  /** Danh sách ngân hàng đề của giáo viên (owner_id) */
  async getBanks(ownerId: string): Promise<QuestionBank[]> {
    await delay();
    return MOCK_QUESTION_BANKS.filter((b) => b.owner_id === ownerId).map((b) => ({ ...b }));
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
};
