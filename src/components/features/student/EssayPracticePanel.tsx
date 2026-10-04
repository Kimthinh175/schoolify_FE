'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Lightbulb, ChevronDown, CheckCircle2, ListChecks, PenTool, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Question } from '@/types';
import { MathEssayEditor } from '@/components/ui/math-editor';

interface EssayPracticePanelProps {
  questions: Question[];
  title?: string;
}

export function EssayPracticePanel({ questions, title }: EssayPracticePanelProps) {
  // Lọc chỉ lấy câu hỏi tự luận
  const essayQuestions = questions.filter((q) => q.type === 'ESSAY');

  // State: Lưu bài làm của học sinh
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  // State: Mở gợi ý (hint)
  const [showHint, setShowHint] = React.useState<Record<string, boolean>>({});
  // State: Đã nộp bài chưa (để hiển thị đáp án & barem)
  const [submitted, setSubmitted] = React.useState<Record<string, boolean>>({});

  if (essayQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 px-6 py-16 text-center">
        <PenTool className="h-10 w-10 text-slate-600" />
        <p className="font-semibold text-slate-400">Không có câu hỏi tự luận</p>
        <p className="text-sm text-slate-600">Bài học này hiện chưa có bài tập tự luận nào.</p>
      </div>
    );
  }

  const toggleHint = (qId: string) => {
    setShowHint((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const submitAnswer = (qId: string) => {
    setSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="space-y-8 bg-slate-900/30 p-4 rounded-lg sm:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PenTool className="h-5 w-5 text-[#00B8DD]" />
            {title ?? 'Luyện Tập Tự Luận Chuyên Sâu'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {essayQuestions.length} bài toán · Rèn luyện tư duy và trình bày chi tiết
          </p>
        </div>
      </div>

      {/* ── Question List ── */}
      <div className="space-y-8">
        {essayQuestions.map((question, qIndex) => {
          const isSubmitted = submitted[question.id] || false;
          const isHintOpen = showHint[question.id] || false;
          const currentAnswer = answers[question.id] || '';

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/40"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 border-b border-slate-700/60 px-5 py-4 bg-slate-800/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00B8DD]/20 text-xs font-bold text-[#00B8DD]">
                  {qIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[11px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      Tự luận
                    </Badge>
                    {question.points > 0 && (
                      <Badge variant="outline" className="text-[11px] border-slate-600 text-slate-300">
                        {question.points} điểm
                      </Badge>
                    )}
                  </div>
                  {question.title && (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {question.title}
                    </p>
                  )}
                  <p className="text-[15px] font-medium leading-relaxed text-slate-100">
                    {question.content}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* ── Hints Section ── */}
                {question.hints && question.hints.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleHint(question.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {isHintOpen ? 'Ẩn gợi ý cách giải' : 'Xem gợi ý cách giải'}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isHintOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isHintOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                            <ul className="space-y-2 text-sm text-amber-200/90">
                              {question.hints.map((hint, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                                  <span>{hint}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ── Editor cho bài làm tự luận ── */}
                <div className="space-y-2">
                  <MathEssayEditor
                    disabled={isSubmitted}
                    rows={6}
                    value={currentAnswer}
                    onChange={(val) => setAnswers({ ...answers, [question.id]: val })}
                    label={
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <PenTool className="h-4 w-4 text-[#00B8DD]" />
                        Bài làm tự luận của bạn
                      </span>
                    }
                    placeholder="Trình bày bài giải chi tiết vào đây..."
                  />
                </div>

                {/* ── Submit Button ── */}
                {!isSubmitted ? (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => submitAnswer(question.id)}
                      disabled={currentAnswer.trim().length === 0}
                      className="bg-[#00B8DD] text-white hover:bg-[#009BBD]"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Nộp bài & Xem lời giải
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-700/80">
                    <div className="mb-4">
                      <Badge variant="success" className="mb-4 text-xs font-semibold">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Đã nộp
                      </Badge>
                    </div>

                    {/* Lời giải mẫu */}
                    {question.sample_essay_answer && (
                      <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
                          <BookOpen className="h-4 w-4" /> Lời Giải Chuẩn
                        </h4>
                        <div className="text-[15px] leading-relaxed text-emerald-100/90 whitespace-pre-wrap">
                          {question.sample_essay_answer}
                        </div>
                      </div>
                    )}

                    {/* Bảng Barem Điểm */}
                    {question.rubric && question.rubric.length > 0 && (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
                        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-[#00B8DD]">
                            <ListChecks className="h-4 w-4" /> Bảng Barem Chấm Điểm
                          </h4>
                        </div>
                        <div className="divide-y divide-slate-700/50">
                          {question.rubric.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
                              <span className="text-sm text-slate-300 pr-4">{item.criterion}</span>
                              <Badge variant="secondary" className="shrink-0 font-mono text-xs bg-slate-800 text-slate-300">
                                +{item.points}đ
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-800/40 px-4 py-3 flex justify-between items-center border-t border-slate-700">
                          <span className="text-sm font-semibold text-slate-400">Tổng điểm</span>
                          <span className="text-sm font-bold text-[#00B8DD]">
                            {question.rubric.reduce((sum, item) => sum + item.points, 0)} điểm
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

