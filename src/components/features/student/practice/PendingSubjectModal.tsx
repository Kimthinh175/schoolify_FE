'use client';

import React, { useEffect } from 'react';
import { Calculator, Cpu, Sparkles, X, Clock } from 'lucide-react';

interface PendingSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName?: string;
  onSelectSubject?: (subjectSlug: 'toan-hoc' | 'tin-hoc') => void;
}

export const PendingSubjectModal: React.FC<PendingSubjectModalProps> = ({
  isOpen,
  onClose,
  subjectName = 'Môn học',
  onSelectSubject,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChoose = (slug: 'toan-hoc' | 'tin-hoc') => {
    onClose();
    if (onSelectSubject) {
      onSelectSubject(slug);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-modal-title"
      >
        {/* Header nhẹ nhàng */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang chuẩn bị đề</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung thông báo */}
        <div className="px-6 py-4 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>

          <h3 id="pending-modal-title" className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Môn {subjectName} sắp ra mắt
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Thầy cô đang hoàn tất bộ đề thi và ngân hàng câu hỏi chuẩn cho môn này.
            Trong lúc chờ đợi, bạn hãy làm bài môn <strong className="text-slate-800 dark:text-white">Toán</strong> hoặc <strong className="text-slate-800 dark:text-white">Tin học</strong> để rèn luyện nhé!
          </p>

          {/* Lựa chọn 2 môn Toán và Tin */}
          <div className="space-y-2.5 text-left mb-6">
            <button
              onClick={() => handleChoose('toan-hoc')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:border-sky-300 dark:hover:border-sky-800 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                    Làm bài môn Toán
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Ngân hàng 12.500+ câu hỏi • Trắc nghiệm, điền số, đúng sai
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 shrink-0 ml-2">
                Vào ngay →
              </span>
            </button>

            <button
              onClick={() => handleChoose('tin-hoc')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    Làm bài môn Tin học
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Ngân hàng 4.200+ câu hỏi &amp; bài tập • Python, C++
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                Vào ngay →
              </span>
            </button>
          </div>

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
};
