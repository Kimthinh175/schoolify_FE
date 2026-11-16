'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FieldErrors,
  FieldArrayWithId,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { CheckCircle2, Plus, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionType } from '@/types';
import { QuestionFormValues } from './question.schema';

export function AnswerListEditor({
  type,
  fields,
  register,
  errors,
  watch,
  setValue,
  onAppend,
  onRemove,
}: {
  type: QuestionType;
  fields: FieldArrayWithId<QuestionFormValues, 'answers'>[];
  register: UseFormRegister<QuestionFormValues>;
  errors: FieldErrors<QuestionFormValues>;
  watch: UseFormWatch<QuestionFormValues>;
  setValue: UseFormSetValue<QuestionFormValues>;
  onAppend: () => void;
  onRemove: (index: number) => void;
}) {
  const isTrueFalse = type === 'TRUE_FALSE';
  const isMultiple = type === 'MULTIPLE_CHOICE';
  const answersError = errors.answers as { message?: string } | undefined;

  const markCorrect = (index: number) => {
    if (isMultiple) {
      const current = watch(`answers.${index}.is_answer`);
      setValue(`answers.${index}.is_answer`, !current, { shouldValidate: true });
    } else {
      fields.forEach((_, i) => {
        setValue(`answers.${i}.is_answer`, i === index, { shouldValidate: true });
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
          Danh Sách Đáp Án (Answer)
        </p>
        <span className="text-[10px] text-slate-400">
          {isTrueFalse ? 'Đúng/Sai (chọn 1)' : isMultiple ? 'Chọn nhiều đáp án đúng' : 'Chọn 1 đáp án đúng'}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {fields.map((field, index) => {
          const correct = watch(`answers.${index}.is_answer`);
          const contentError = errors.answers?.[index]?.content?.message;
          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'rounded-xl border p-2.5 space-y-2 transition-colors',
                correct
                  ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markCorrect(index)}
                  aria-label="Đánh dấu đáp án đúng"
                  className={cn(
                    'h-5 w-5 shrink-0 flex items-center justify-center border transition-colors cursor-pointer',
                    isMultiple ? 'rounded-md' : 'rounded-full',
                    correct
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                  )}
                >
                  {correct && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <input
                  {...register(`answers.${index}.content`)}
                  readOnly={isTrueFalse}
                  placeholder={`Đáp án ${index + 1}`}
                  className={cn(
                    'flex-1 min-w-0 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] disabled:opacity-60',
                    contentError && 'border-rose-500'
                  )}
                />

                {!isTrueFalse && fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                    aria-label="Xoá đáp án"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {contentError && <p className="text-[11px] font-medium text-rose-500 pl-7">{contentError}</p>}

              {!isTrueFalse && (
                <div className="pl-7">
                  <input
                    {...register(`answers.${index}.explain`)}
                    placeholder="Giải thích cho đáp án này (explain)..."
                    className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!isTrueFalse && (
        <button
          type="button"
          onClick={onAppend}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-2 text-xs font-semibold text-slate-500 hover:border-[#00B8DD] hover:text-[#007D99] dark:hover:text-[#00B8DD] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm đáp án
        </button>
      )}

      {answersError?.message && (
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-500">
          <HelpCircle className="w-3.5 h-3.5" /> {answersError.message}
        </p>
      )}
    </div>
  );
}
