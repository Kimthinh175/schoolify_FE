'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Trophy,
  AlertCircle,
  Lightbulb,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Question, Answer, QuestionType } from '@/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface QuizPracticePanelProps {
  questions: Question[];
  title?: string;
}

type QuizPhase = 'ANSWERING' | 'REVIEWING';

interface QuizState {
  phase: QuizPhase;
  answers: Record<string, string[]>; // questionId → selected answerId[]
  score: { correct: number; total: number };
  expandedExplain: string | null;
}

type QuizAction =
  | { type: 'SELECT_ANSWER'; questionId: string; answerId: string; isMulti: boolean }
  | { type: 'SUBMIT' }
  | { type: 'TOGGLE_EXPLAIN'; questionId: string }
  | { type: 'RESET' };

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function questionTypeLabel(type: QuestionType): string {
  if (type === 'MULTIPLE_CHOICE') return 'Nhiều đáp án';
  if (type === 'SINGLE_CHOICE') return 'Một đáp án';
  if (type === 'TRUE_FALSE') return 'Đúng / Sai';
  if (type === 'FILL_BLANK') return 'Điền vào chỗ trống';
  if (type === 'ESSAY') return 'Tự luận';
  return 'Khác';
}

function questionTypeIcon(type: QuestionType) {
  if (type === 'MULTIPLE_CHOICE') return <CheckSquare className="h-3.5 w-3.5" />;
  if (type === 'TRUE_FALSE') return <ToggleLeft className="h-3.5 w-3.5" />;
  if (type === 'ESSAY') return <FileText className="h-3.5 w-3.5" />;
  if (type === 'FILL_BLANK') return <FileText className="h-3.5 w-3.5" />;
  return <CircleDot className="h-3.5 w-3.5" />;
}

function gradeQuestion(question: Question, selected: string[]): boolean {
  const correct = (question.answers ?? []).filter((a) => a.is_answer).map((a) => a.id);
  if (correct.length === 0) return false;
  return (
    correct.length === selected.length && correct.every((id) => selected.includes(id))
  );
}

function gradeAll(questions: Question[], answers: Record<string, string[]>) {
  const gradable = (q: Question) => q.type !== 'ESSAY' && q.type !== 'FILL_BLANK';
  const total = questions.filter(gradable).length;
  const correct = questions.filter(
    (q) => gradable(q) && gradeQuestion(q, answers[q.id] ?? [])
  ).length;
  return { correct, total };
}

function getScoreMeta(correct: number, total: number) {
  if (total === 0) return { label: '—', variant: 'secondary' as const, emoji: '📝' };
  const pct = (correct / total) * 100;
  if (pct >= 80) return { label: 'Xuất sắc!', variant: 'success' as const, emoji: '🏆' };
  if (pct >= 60) return { label: 'Khá tốt!', variant: 'primary' as const, emoji: '👍' };
  return { label: 'Cần ôn thêm', variant: 'warning' as const, emoji: '📚' };
}

// ─────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_ANSWER': {
      if (state.phase === 'REVIEWING') return state;
      const prev = state.answers[action.questionId] ?? [];
      let next: string[];
      if (action.isMulti) {
        next = prev.includes(action.answerId)
          ? prev.filter((id) => id !== action.answerId)
          : [...prev, action.answerId];
      } else {
        next = [action.answerId];
      }
      return { ...state, answers: { ...state.answers, [action.questionId]: next } };
    }
    case 'SUBMIT':
      return { ...state, phase: 'REVIEWING', expandedExplain: null };
    case 'TOGGLE_EXPLAIN':
      return {
        ...state,
        expandedExplain:
          state.expandedExplain === action.questionId ? null : action.questionId,
      };
    case 'RESET':
      return { phase: 'ANSWERING', answers: {}, score: { correct: 0, total: 0 }, expandedExplain: null };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface AnswerOptionProps {
  answer: Answer;
  index: number;
  isSelected: boolean;
  isMulti: boolean;
  phase: QuizPhase;
  onSelect: () => void;
}

function AnswerOption({ answer, index, isSelected, isMulti, phase, onSelect }: AnswerOptionProps) {
  const label = ['A', 'B', 'C', 'D', 'E'][index] ?? String(index + 1);

  const isCorrect = phase === 'REVIEWING' && answer.is_answer;
  const isWrong = phase === 'REVIEWING' && isSelected && !answer.is_answer;
  const isUnrelated = phase === 'REVIEWING' && !answer.is_answer && !isSelected;
  const isCorrectNotPicked = phase === 'REVIEWING' && answer.is_answer && !isSelected;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={phase === 'REVIEWING'}
      className={cn(
        'group relative w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
        'flex items-start gap-3 disabled:cursor-default',
        // ANSWERING state
        phase === 'ANSWERING' && !isSelected &&
          'border-slate-700 bg-slate-800/40 hover:border-[#00B8DD]/50 hover:bg-[#00B8DD]/5',
        phase === 'ANSWERING' && isSelected &&
          'border-[#00B8DD] bg-[#00B8DD]/10 shadow-sm shadow-[#00B8DD]/10',
        // REVIEWING: correct
        isCorrect &&
          'border-emerald-500/60 bg-emerald-900/20',
        // REVIEWING: wrong (selected but wrong)
        isWrong &&
          'border-rose-500/60 bg-rose-900/20',
        // REVIEWING: correct but not picked (show highlight too)
        isCorrectNotPicked &&
          'border-emerald-500/40 bg-emerald-900/10',
        // REVIEWING: unrelated dimmed
        isUnrelated &&
          'border-slate-700/50 bg-slate-800/20 opacity-50',
      )}
      animate={{
        scale: phase === 'ANSWERING' && isSelected ? 1.005 : 1,
      }}
      transition={{ duration: 0.15 }}
    >
      {/* Label bubble */}
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors',
          phase === 'ANSWERING' && !isSelected && 'bg-slate-700 text-slate-300',
          phase === 'ANSWERING' && isSelected && 'bg-[#00B8DD] text-white',
          isCorrect && 'bg-emerald-500 text-white',
          isWrong && 'bg-rose-500 text-white',
          isCorrectNotPicked && 'bg-emerald-600/60 text-white',
          isUnrelated && 'bg-slate-700 text-slate-400',
        )}
      >
        {label}
      </span>

      {/* Answer text */}
      <span
        className={cn(
          'flex-1 text-sm leading-relaxed transition-colors',
          phase === 'ANSWERING' && !isSelected && 'text-slate-300',
          phase === 'ANSWERING' && isSelected && 'font-medium text-white',
          isCorrect && 'font-medium text-emerald-200',
          isWrong && 'font-medium text-rose-200',
          isCorrectNotPicked && 'text-emerald-300',
          isUnrelated && 'text-slate-500',
        )}
      >
        {answer.content}
      </span>

      {/* Result icon */}
      {phase === 'REVIEWING' && (
        <span className="mt-0.5 shrink-0">
          {(isCorrect || isCorrectNotPicked) && (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          {isWrong && <XCircle className="h-5 w-5 text-rose-400" />}
        </span>
      )}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function QuizPracticePanel({ questions, title }: QuizPracticePanelProps) {
  const [state, dispatch] = React.useReducer(quizReducer, {
    phase: 'ANSWERING',
    answers: {},
    score: { correct: 0, total: 0 },
    expandedExplain: null,
  });

  const { phase, answers, expandedExplain } = state;

  // ---- Timer state: 30 s per question ----
  const [timers, setTimers] = React.useState<Record<string, number>>(() =>
    questions.reduce((acc, q) => {
      acc[q.id] = 30; // seconds for each question
      return acc;
    }, {} as Record<string, number>)
  );

  // Decrease timers every second while answering
  React.useEffect(() => {
    if (phase !== 'ANSWERING') return;
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        questions.forEach(q => {
          if (prev[q.id] > 0) {
            updated[q.id] = prev[q.id] - 1;
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, questions]);

  const [fillAnswers, setFillAnswers] = React.useState<Record<string, string>>({});
const answeredCount = questions.filter((q) => (answers[q.id] ?? []).length > 0 || (fillAnswers[q.id] ?? '').length > 0).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const score = React.useMemo(
    () => gradeAll(questions, answers),
    [questions, answers]
  );
  const scoreMeta = getScoreMeta(score.correct, score.total);

  const canSubmit = answeredCount === questions.length;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 px-6 py-16 text-center">
        <BookOpen className="h-10 w-10 text-slate-600" />
        <p className="font-semibold text-slate-400">Chưa có câu hỏi luyện tập</p>
        <p className="text-sm text-slate-600">Giáo viên chưa gắn ngân hàng đề vào bài học này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-900/30 p-4 rounded-lg sm:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {title ?? 'Luyện Tập Trắc Nghiệm'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-300">
            {questions.length} câu hỏi · Chọn đáp án rồi bấm Kiểm Tra khi hoàn thành
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-200">
            {answeredCount}/{questions.length} câu đã chọn
          </Badge>
          {phase === 'REVIEWING' && (
            <Badge
              variant={scoreMeta.variant}
              className="text-xs"
            >
              {score.correct}/{score.total} câu đúng
            </Badge>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      {phase === 'ANSWERING' && (
        <Progress
          value={progressPct}
          indicatorClassName="bg-[#00B8DD]"
          className="bg-slate-800"
        />
      )}

      {/* ── Scorecard (after submit) ── */}
      <AnimatePresence>
        {phase === 'REVIEWING' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60"
          >
            <div className="flex flex-col items-center gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
              <span className="text-4xl">{scoreMeta.emoji}</span>
              <div className="flex-1">
                <p className="text-xl font-bold text-white">
                  {score.correct}/{score.total} câu đúng &nbsp;
                  <span
                    className={cn(
                      'text-base font-semibold',
                      scoreMeta.variant === 'success' && 'text-emerald-400',
                      scoreMeta.variant === 'primary' && 'text-[#00B8DD]',
                      scoreMeta.variant === 'warning' && 'text-amber-400',
                    )}
                  >
                    · {scoreMeta.label}
                  </span>
                </p>
                <Progress
                  value={score.total > 0 ? (score.correct / score.total) * 100 : 0}
                  className="mt-2 bg-slate-700"
                  indicatorClassName={cn(
                    scoreMeta.variant === 'success' && 'bg-emerald-500',
                    scoreMeta.variant === 'primary' && 'bg-[#00B8DD]',
                    scoreMeta.variant === 'warning' && 'bg-amber-500',
                  )}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => dispatch({ type: 'RESET' })}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                className="shrink-0 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Làm Lại
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Question list ── */}
      <div className="space-y-5">
        {questions.map((question, qIndex) => {
          const isMulti = question.type === 'MULTIPLE_CHOICE';
          const isEssay = question.type === 'ESSAY';
          const selected = answers[question.id] ?? [];
          const isExpanded = expandedExplain === question.id;
          const isCorrectQ = phase === 'REVIEWING' && gradeQuestion(question, selected);
          const hasExplain =
            phase === 'REVIEWING' &&
            !isEssay &&
            (question.answers ?? []).some((a) => a.explain);

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.04 }}
              className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/40"
            >
              {/* Question header */}
              <div className="flex items-start gap-3 border-b border-slate-700/60 px-5 py-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-slate-300">
                  {qIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" icon={questionTypeIcon(question.type)} className="text-[11px]">
                      {questionTypeLabel(question.type)}
                    </Badge>
                    {question.points > 0 && (
                      <Badge variant="default" className="text-[11px]">
                        {question.points} điểm
                      </Badge>
                    )}
                    {phase === 'REVIEWING' && !isEssay && (
                      <Badge
                        variant={isCorrectQ ? 'success' : 'danger'}
                        icon={isCorrectQ
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <XCircle className="h-3 w-3" />
                        }
                        className="text-[11px]"
                      >
                        {isCorrectQ ? 'Đúng' : 'Sai'}
                      </Badge>
                    )}
                    {phase === 'ANSWERING' && (
                      <Badge
                        variant={timers[question.id] <= 10 ? 'danger' : 'secondary'}
                        className={cn(
                          'ml-auto text-[11px] tabular-nums',
                          timers[question.id] <= 10 && 'animate-pulse'
                        )}
                      >
                        ⏱ {Math.floor(timers[question.id] / 60)}:{String(timers[question.id] % 60).padStart(2, '0')}
                      </Badge>
                    )}
                  </div>
                  {question.title && (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {question.title}
                    </p>
                  )}
                  <p className="text-sm font-medium leading-relaxed text-slate-100">
                    {question.content}
                  </p>
                </div>
              </div>

              {/* Answer area */}
              <div className="px-5 py-4">
                {isEssay ? (
                  // ── Essay type ──
                  <div className="space-y-3">
                    <textarea
                      disabled={phase === 'REVIEWING'}
                      rows={4}
                      placeholder="Nhập câu trả lời của bạn tại đây..."
                      className="w-full resize-none rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#00B8DD] disabled:opacity-60"
                    />
                    {phase === 'REVIEWING' && question.sample_essay_answer && (
                      <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Đáp án mẫu
                        </p>
                        <p className="text-sm text-amber-200">{question.sample_essay_answer}</p>
                      </div>
                    )}
                  </div>
                ) : question.type === 'FILL_BLANK' ? (
                  // ── Fill‑in‑the‑blank type ──
                  <div className="space-y-3">
                    <input
                      type="text"
                      disabled={phase === 'REVIEWING'}
                      placeholder="Nhập câu trả lời của bạn..."
                      value={fillAnswers[question.id] ?? ''}
                      onChange={(e) =>
                        setFillAnswers((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#00B8DD] disabled:opacity-60"
                    />
                    {phase === 'REVIEWING' && (
                      <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Đáp án đúng
                        </p>
                        <p className="text-sm text-amber-200">
                          {(question.answers ?? []).find((a) => a.is_answer)?.content ?? '—'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // ── Choice type ──
                  <div className="space-y-2.5">
                    {(question.answers ?? []).map((answer, aIndex) => (
                      <AnswerOption
                        key={answer.id}
                        answer={answer}
                        index={aIndex}
                        isSelected={selected.includes(answer.id)}
                        isMulti={isMulti}
                        phase={phase}
                        onSelect={() =>
                          dispatch({
                            type: 'SELECT_ANSWER',
                            questionId: question.id,
                            answerId: answer.id,
                            isMulti,
                          })
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Explain toggle */}
                {hasExplain && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: 'TOGGLE_EXPLAIN', questionId: question.id })
                      }
                      className="flex items-center gap-1.5 text-xs font-medium text-[#00B8DD] hover:text-[#009BBD] transition-colors"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      {isExpanded ? 'Ẩn lời giải' : 'Xem lời giải chi tiết'}
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="explain"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#00B8DD]">
                              <BookOpen className="h-3.5 w-3.5" />
                              Lời Giải Chi Tiết
                            </p>
                            {(question.answers ?? [])
                              .filter((a) => a.explain)
                              .map((a) => (
                                <div key={a.id} className="flex items-start gap-2.5">
                                  <span
                                    className={cn(
                                      'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                                      a.is_answer ? 'bg-emerald-400' : 'bg-slate-600'
                                    )}
                                  />
                                  <div>
                                    <span
                                      className={cn(
                                        'text-xs font-semibold',
                                        a.is_answer ? 'text-emerald-400' : 'text-slate-400'
                                      )}
                                    >
                                      {a.content}:{' '}
                                    </span>
                                    <span className="text-xs text-slate-300">{a.explain}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Footer action ── */}
      <div className="sticky bottom-4 z-10">
        {phase === 'ANSWERING' ? (
          <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/95 px-5 py-3 backdrop-blur-sm shadow-xl shadow-slate-950/50">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {canSubmit ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Đã chọn đủ {questions.length} câu</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>Còn {questions.length - answeredCount} câu chưa chọn</span>
                </>
              )}
            </div>
            <Button
              variant="primary"
              onClick={() => dispatch({ type: 'SUBMIT' })}
              disabled={!canSubmit}
              leftIcon={<Trophy className="h-4 w-4" />}
            >
              Kiểm Tra Đáp Án
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/95 px-5 py-3 backdrop-blur-sm shadow-xl shadow-slate-950/50">
            <p className="text-sm text-slate-400">
              Đúng{' '}
              <span className="font-bold text-white">{score.correct}/{score.total}</span>{' '}
              câu · {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
            </p>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'RESET' })}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Làm Lại Từ Đầu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

