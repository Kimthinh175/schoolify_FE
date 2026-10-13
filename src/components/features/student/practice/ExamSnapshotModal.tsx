'use client';

import * as React from 'react';
import { Calendar, Check, X, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MathRenderer } from '@/components/ui/math-renderer';
import { cn } from '@/lib/utils';
import { ExamSnapshot } from '@/services/exam-snapshot.service';

interface ExamSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: ExamSnapshot | null;
}

export function ExamSnapshotModal({ isOpen, onClose, snapshot }: ExamSnapshotModalProps) {
  const [activeTab, setActiveTab] = React.useState<'ORIGINAL' | 'REMEDIATION'>('ORIGINAL');

  if (!snapshot) return null;

  const { originalExam, remediation } = snapshot;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="space-y-1.5 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/30 text-[10px] font-bold">
              📋 CHI TIẾT BÀI THI & LỜI GIẢI
            </Badge>
            <span className="text-xs text-slate-400 font-mono">Mã: {snapshot.id}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(snapshot.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {snapshot.examTitle}
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            {snapshot.subjectName} • Lớp {snapshot.grade} • {snapshot.chapterName}
          </p>
        </div>
      }
      footer={
        <Button
          onClick={onClose}
          className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold px-6 rounded-xl cursor-pointer"
        >
          Đóng
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Score & Remediation Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Điểm Đề Gốc</span>
            <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
              {originalExam.finalScore} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </p>
          </Card>

          <Card className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Số Câu Đúng</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {originalExam.correctCount} / {originalExam.totalQuestions}
            </p>
          </Card>

          <Card className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-center">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Số Câu Sai</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {originalExam.wrongCount} câu
            </p>
          </Card>

          <Card className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-center">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Khắc Phục Lỗi</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {remediation?.attempted ? `${remediation.correctCount}/${remediation.totalQuestions}` : 'Chưa làm'}
            </p>
          </Card>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('ORIGINAL')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'ORIGINAL'
                ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span>Đề Gốc & Bài Làm ({originalExam.questions.length} câu)</span>
          </button>

          {remediation?.attempted && (
            <button
              onClick={() => setActiveTab('REMEDIATION')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'REMEDIATION'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Bài Khắc Phục Biến Thể ({remediation.questions.length} câu)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black">
                {remediation.finalScore}/10đ
              </span>
            </button>
          )}
        </div>

        {/* Tab Content 1: Original Exam */}
        {activeTab === 'ORIGINAL' && (
          <div className="space-y-4">
            {originalExam.questions.map((q, idx) => {
              const isWrong = originalExam.wrongQuestionIds.includes(q.id);
              const studentChoice = originalExam.studentAnswers.multipleChoices[q.id];

              return (
                <Card
                  key={q.id}
                  className={cn(
                    'p-5 rounded-2xl border transition-all space-y-3',
                    isWrong
                      ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Câu {idx + 1} • {q.score} điểm
                    </span>
                    <Badge variant={isWrong ? 'danger' : 'success'} className="text-[10px]">
                      {isWrong ? '✗ Chưa đúng' : '✓ Đúng'}
                    </Badge>
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    <MathRenderer text={q.title} />
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <MathRenderer text={q.content} />
                  </div>

                  {/* Multiple choice options */}
                  {q.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.choices.map((c) => {
                        const isStudentPick = studentChoice === c.key;
                        const isCorrect = q.correctChoice === c.key;

                        return (
                          <div
                            key={c.key}
                            className={cn(
                              'p-2.5 rounded-xl border text-xs flex items-center justify-between',
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                                : isStudentPick
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            )}
                          >
                            <span>
                              <strong>{c.key}.</strong> <MathRenderer text={c.content} />
                            </span>
                            {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {!isCorrect && isStudentPick && <X className="w-4 h-4 text-rose-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 block">Lời giải chi tiết:</span>
                    <MathRenderer text={q.explanation} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tab Content 2: Remediation Variants */}
        {activeTab === 'REMEDIATION' && remediation && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Đây là các câu hỏi biến thể được sinh tự động (Toán đổi số, Văn đổi văn phong) mà bạn đã làm để khắc phục các lỗi sai của đề gốc.
              </span>
            </div>

            {remediation.questions.map((q, idx) => {
              const studentChoice = remediation.studentAnswers.multipleChoices[q.id];
              const isCorrect = studentChoice === q.correctChoice;

              return (
                <Card
                  key={q.id}
                  className={cn(
                    'p-5 rounded-2xl border transition-all space-y-3',
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Câu Biến Thể {idx + 1}
                    </span>
                    <Badge variant={isCorrect ? 'success' : 'danger'} className="text-[10px]">
                      {isCorrect ? '✓ Khắc phục thành công' : '✗ Chưa chuẩn'}
                    </Badge>
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    <MathRenderer text={q.title} />
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <MathRenderer text={q.content} />
                  </div>

                  {q.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.choices.map((c) => {
                        const isStudentPick = studentChoice === c.key;
                        const isAnswer = q.correctChoice === c.key;

                        return (
                          <div
                            key={c.key}
                            className={cn(
                              'p-2.5 rounded-xl border text-xs flex items-center justify-between',
                              isAnswer
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                                : isStudentPick
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            )}
                          >
                            <span>
                              <strong>{c.key}.</strong> <MathRenderer text={c.content} />
                            </span>
                            {isAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 block">Lời giải biến thể:</span>
                    <MathRenderer text={q.explanation} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
}
