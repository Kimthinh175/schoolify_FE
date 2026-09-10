import { z } from 'zod';

/** ERD: Answer */
export const answerSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Nội dung đáp án không được để trống'),
  explain: z.string().optional(),
  img_url: z.string().optional(),
  is_answer: z.boolean(),
});

/** Form soạn câu hỏi — validation động theo QuestionType */
export const questionFormSchema = z
  .object({
    type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'ESSAY', 'TRUE_FALSE']),
    title: z.string().optional(),
    content: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi'),
    points: z.number().min(0, 'Điểm phải ≥ 0'),
    sample_essay_answer: z.string().optional(),
    answers: z.array(answerSchema),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'ESSAY') return;
    if (val.answers.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['answers'], message: 'Cần ít nhất 2 đáp án.' });
      return;
    }
    const correct = val.answers.filter((a) => a.is_answer).length;
    if (val.type === 'MULTIPLE_CHOICE') {
      if (correct < 1) {
        ctx.addIssue({ code: 'custom', path: ['answers'], message: 'Chọn ít nhất 1 đáp án đúng.' });
      }
    } else if (correct !== 1) {
      ctx.addIssue({ code: 'custom', path: ['answers'], message: 'Chỉ được chọn đúng 1 đáp án đúng.' });
    }
  });

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

/** Form tạo ngân hàng đề (ERD: QuestionBank) */
export const bankFormSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên ngân hàng đề'),
  subject: z.string().optional(),
  description: z.string().optional(),
  is_premium: z.boolean(),
});

export type BankFormValues = z.infer<typeof bankFormSchema>;
