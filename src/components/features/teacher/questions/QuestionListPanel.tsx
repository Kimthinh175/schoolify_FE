'use client';

import * as React from 'react';
import { ListChecks, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Question, QuestionType } from '@/types';
import { SearchField } from './SearchField';
import { FilterDropdown, FilterOption } from './FilterDropdown';

type FilterType = 'ALL' | QuestionType;

const TYPE_LABEL: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Nhiều đáp án',
  SINGLE_CHOICE: '1 đáp án',
  TRUE_FALSE: 'Đúng/Sai',
  ESSAY: 'Tự luận',
};

export function QuestionListPanel({
  questions,
  selectedQuestionId,
  onSelect,
  onAdd,
  onDelete,
}: {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = React.useState<FilterType>('ALL');
  const [query, setQuery] = React.useState('');

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { MULTIPLE_CHOICE: 0, SINGLE_CHOICE: 0, ESSAY: 0, TRUE_FALSE: 0 };
    questions.forEach((q) => {
      base[q.type] = (base[q.type] || 0) + 1;
    });
    return base;
  }, [questions]);

  const typeOptions: FilterOption[] = [
    { value: 'ALL', label: 'Tất cả loại', count: questions.length },
    { value: 'MULTIPLE_CHOICE', label: TYPE_LABEL.MULTIPLE_CHOICE, count: counts.MULTIPLE_CHOICE },
    { value: 'SINGLE_CHOICE', label: TYPE_LABEL.SINGLE_CHOICE, count: counts.SINGLE_CHOICE },
    { value: 'TRUE_FALSE', label: TYPE_LABEL.TRUE_FALSE, count: counts.TRUE_FALSE },
    { value: 'ESSAY', label: TYPE_LABEL.ESSAY, count: counts.ESSAY },
  ];

  const filtered = questions.filter((q) => {
    const matchType = filter === 'ALL' || q.type === filter;
    const keyword = query.trim().toLowerCase();
    const text = `${q.title || ''} ${q.content || ''}`.toLowerCase();
    const matchQuery = !keyword || text.includes(keyword);
    return matchType && matchQuery;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Danh Sách Câu Hỏi</h2>
        </div>
        <Button size="sm" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Thêm
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="sm:flex-1 sm:min-w-0">
          <SearchField value={query} onChange={setQuery} placeholder="Tìm theo nội dung câu hỏi..." />
        </div>
        <div className="sm:shrink-0">
          <FilterDropdown
            value={filter}
            options={typeOptions}
            onChange={(v) => setFilter(v as FilterType)}
          />
        </div>
      </div>

      {questions.length > 0 && (
        <p className="text-[11px] text-slate-400">
          Hiển thị{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span>
          /{questions.length} câu hỏi
        </p>
      )}

      <div className="space-y-2">
        {questions.length > 0 && filtered.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">Không tìm thấy câu hỏi phù hợp.</p>
        )}
        {filtered.map((q, idx) => {
          const correctCount = q.answers?.filter((a) => a.is_answer).length || 0;
          return (
            <div
              key={q.id}
              onClick={() => onSelect(q.id)}
              className={cn(
                'rounded-xl border p-3 cursor-pointer transition-all',
                selectedQuestionId === q.id
                  ? 'border-[#00B8DD] ring-1 ring-[#00B8DD]/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">{TYPE_LABEL[q.type]}</Badge>
                    <span className="text-[10px] text-slate-400">{q.points}đ</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 mt-1.5">
                    {q.content || '(Chưa có nội dung)'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {q.type === 'ESSAY'
                      ? 'Tự luận'
                      : `${q.answers?.length || 0} đáp án • ${correctCount} đáp án đúng`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(q.id);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                  aria-label="Xoá câu hỏi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {questions.length === 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5" /> Bấm “Thêm” để tạo câu hỏi đầu tiên.
        </p>
      )}
    </div>
  );
}
