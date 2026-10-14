'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Send,
  X,
  HelpCircle,
  FileQuestion,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface QuestionBugReport {
  id: string;
  questionId: string;
  questionTitle: string;
  subjectName: string;
  issueType: string;
  issueTypeLabel: string;
  description: string;
  reportedAt: string;
  studentName: string;
  status: 'PENDING' | 'RESOLVED';
}

interface ReportQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionTitle: string;
  subjectName?: string;
  questionContentSnippet?: string;
}

const ISSUE_TYPES = [
  {
    id: 'WRONG_ANSWER',
    label: 'Sai đáp án chuẩn',
    desc: 'Đáp án đúng trên hệ thống khác với kết quả tính toán hoặc lời giải chuẩn.',
  },
  {
    id: 'KATEX_ERROR',
    label: 'Lỗi công thức KaTeX / Hiển thị',
    desc: 'Công thức toán học bị vỡ hạt, lỗi cú pháp LaTeX hoặc không hiển thị đúng ký hiệu.',
  },
  {
    id: 'TYPO_CONTENT',
    label: 'Lỗi chính tả / Đề bài thiếu dữ kiện',
    desc: 'Sai chính tả, nhầm lẫn số liệu hoặc thiếu điều kiện cần thiết để giải.',
  },
  {
    id: 'MATRIX_MISMATCH',
    label: 'Độ khó không khớp ma trận Bloom',
    desc: 'Câu hỏi quá khó so với mức Nhận biết/Thông hiểu hoặc kiến thức vượt chương trình.',
  },
  {
    id: 'OTHER',
    label: 'Vấn đề khảo thí khác',
    desc: 'Các góp ý khác về mặt phương pháp sư phạm hoặc hình vẽ minh họa.',
  },
];

export function ReportQuestionModal({
  isOpen,
  onClose,
  questionId,
  questionTitle,
  subjectName = 'Toán Học',
  questionContentSnippet,
}: ReportQuestionModalProps) {
  const [selectedIssue, setSelectedIssue] = React.useState<string>(ISSUE_TYPES[0].id);
  const [description, setDescription] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const issueObj = ISSUE_TYPES.find((i) => i.id === selectedIssue) || ISSUE_TYPES[0];

    const report: QuestionBugReport = {
      id: `rep_${Date.now()}`,
      questionId,
      questionTitle,
      subjectName,
      issueType: selectedIssue,
      issueTypeLabel: issueObj.label,
      description: description.trim() || 'Học sinh báo cáo lỗi đề thi từ phòng thi khảo thí.',
      reportedAt: new Date().toISOString(),
      studentName: 'Học sinh luyện thi',
      status: 'PENDING',
    };

    try {
      const existing = localStorage.getItem('schoolify_question_bug_reports');
      const list: QuestionBugReport[] = existing ? JSON.parse(existing) : [];
      list.unshift(report);
      localStorage.setItem('schoolify_question_bug_reports', JSON.stringify(list));
    } catch (err) {
      console.warn('Cannot write report to localStorage:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Đã gửi báo cáo cho Ban Khảo thí thành công! Cảm ơn bạn đã đóng góp để hoàn thiện đề thi.`,
        { duration: 4000 }
      );
      setDescription('');
      onClose();
    }, 600);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Báo Cáo Sai Sót Câu Hỏi Cho Ban Khảo Thí
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {subjectName} • {questionTitle}
            </span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {questionContentSnippet && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
            &ldquo;{questionContentSnippet}&rdquo;
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            1. Chọn loại sai sót bạn phát hiện:
          </label>
          <div className="space-y-1.5">
            {ISSUE_TYPES.map((type) => {
              const isChecked = selectedIssue === type.id;
              return (
                <label
                  key={type.id}
                  onClick={() => setSelectedIssue(type.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="issueType"
                    checked={isChecked}
                    onChange={() => setSelectedIssue(type.id)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {type.label}
                    </span>
                    <span className="text-slate-500 text-[11px] leading-tight block">
                      {type.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            2. Mô tả chi tiết vấn đề (không bắt buộc):
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ví dụ: Ở bước biến đổi thứ 2, công thức đạo hàm bị thiếu dấu trừ, đáp án đúng phải là C thay vì A..."
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-bold text-slate-500"
          >
            Hủy Bỏ
          </Button>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Gửi Báo Cáo Cho Khảo Thí
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
