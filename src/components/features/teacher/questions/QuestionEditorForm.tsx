'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Answer, Question, QuestionType } from '@/types';
import { questionFormSchema, QuestionFormValues } from './question.schema';
import { AnswerListEditor } from './AnswerListEditor';

let idSeq = 0;
const uid = (prefix: string) => `${prefix}-${++idSeq}`;

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm – nhiều đáp án đúng' },
  { value: 'SINGLE_CHOICE', label: 'Trắc nghiệm – 1 đáp án đúng' },
  { value: 'TRUE_FALSE', label: 'Đúng / Sai' },
  { value: 'ESSAY', label: 'Tự luận' },
];

function toFormValues(q: Question | undefined): QuestionFormValues {
  if (!q) {
    return {
      type: 'SINGLE_CHOICE',
      title: '',
      content: '',
      points: 2.5,
      sample_essay_answer: '',
      answers: [
        { id: uid('a'), content: '', is_answer: true, explain: '' },
        { id: uid('a'), content: '', is_answer: false, explain: '' },
      ],
    };
  }
  return {
    type: q.type,
    title: q.title || '',
    content: q.content,
    points: q.points,
    sample_essay_answer: q.sample_essay_answer || '',
    answers: (q.answers || []).map((a) => ({
      id: a.id,
      content: a.content,
      explain: a.explain || '',
      img_url: a.img_url || '',
      is_answer: a.is_answer,
    })),
  };
}

export function QuestionEditorForm({
  bankId,
  question,
  onSave,
  onDelete,
}: {
  bankId: string;
  question: Question | undefined;
  onSave: (question: Question) => void;
  onDelete: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: toFormValues(question),
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'answers' });
  const type = watch('type');

  React.useEffect(() => {
    reset(toFormValues(question));
  }, [question, reset]);

  const handleTypeChange = (newType: QuestionType) => {
    setValue('type', newType, { shouldValidate: true });
    if (newType === 'TRUE_FALSE') {
      replace([
        { id: uid('a'), content: 'Đúng', is_answer: true, explain: '' },
        { id: uid('a'), content: 'Sai', is_answer: false, explain: '' },
      ]);
    } else if (newType === 'SINGLE_CHOICE') {
      const current = getValues('answers');
      let found = false;
      replace(
        current.length >= 2
          ? current.map((a) => {
              if (a.is_answer && !found) {
                found = true;
                return a;
              }
              return { ...a, is_answer: false };
            })
          : [
              { id: uid('a'), content: '', is_answer: true, explain: '' },
              { id: uid('a'), content: '', is_answer: false, explain: '' },
            ]
      );
    } else if (newType === 'MULTIPLE_CHOICE' && getValues('answers').length < 2) {
      replace([
        { id: uid('a'), content: '', is_answer: true, explain: '' },
        { id: uid('a'), content: '', is_answer: false, explain: '' },
      ]);
    }
  };

  const submit = (values: QuestionFormValues) => {
    const qId = question?.id || uid('q');
    const answers: Answer[] =
      values.type === 'ESSAY'
        ? []
        : values.answers.map((a) => ({
            id: a.id,
            question_id: qId,
            content: a.content,
            explain: a.explain || null,
            img_url: a.img_url || null,
            is_answer: a.is_answer,
          }));
    onSave({
      id: qId,
      bank_id: bankId,
      type: values.type,
      title: values.title || '',
      content: values.content,
      points: values.points,
      sample_essay_answer: values.type === 'ESSAY' ? values.sample_essay_answer || '' : undefined,
      answers,
    });
  };

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-3">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chưa chọn câu hỏi</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Chọn một câu hỏi ở cột giữa hoặc bấm “Thêm câu hỏi” để bắt đầu soạn.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">Chọn loại câu hỏi, nhập nội dung và đáp án.</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 shrink-0"
          onClick={onDelete}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Xoá
        </Button>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
          Loại câu hỏi (QuestionType)
        </label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Tiêu đề ngắn (tùy chọn)"
        placeholder="VD: Giá trị lượng giác cơ bản"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Nội dung câu hỏi *"
        placeholder="Nhập nội dung câu hỏi..."
        error={errors.content?.message}
        {...register('content')}
      />

      <Input
        label="Điểm *"
        type="number"
        step="0.5"
        min={0}
        error={errors.points?.message}
        {...register('points', { valueAsNumber: true })}
      />

      {type === 'ESSAY' ? (
        <Textarea
          label="Đáp án mẫu (sample_essay_answer)"
          placeholder="Gợi ý đáp án cho phần tự luận..."
          {...register('sample_essay_answer')}
        />
      ) : (
        <AnswerListEditor
          type={type}
          fields={fields}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          onAppend={() => append({ id: uid('a'), content: '', is_answer: false, explain: '' })}
          onRemove={remove}
        />
      )}

      <Button type="submit" className="w-full justify-center" leftIcon={<Save className="w-4 h-4" />}>
        Lưu Câu Hỏi
      </Button>
    </form>
  );
}
