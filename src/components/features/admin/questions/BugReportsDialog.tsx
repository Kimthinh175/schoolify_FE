'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QuestionBugReport } from '@/components/features/student/practice/ReportQuestionModal';

interface BugReportsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reports: QuestionBugReport[];
  onResolveReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onEditQuestion: (questionId: string) => void;
}

export function BugReportsDialog({
  isOpen,
  onClose,
  reports,
  onResolveReport,
  onDeleteReport,
  onEditQuestion,
}: BugReportsDialogProps) {
  const [filterTab, setFilterTab] = React.useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  const filteredReports = React.useMemo(() => {
    return reports.filter((rep) => {
      const matchTab =
        filterTab === 'ALL'
          ? true
          : filterTab === 'PENDING'
          ? rep.status === 'PENDING'
          : rep.status === 'RESOLVED';

      const matchQuery =
        rep.questionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.issueTypeLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.studentName?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTab && matchQuery;
    });
  }, [reports, filterTab, searchQuery]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      className="p-5 sm:p-6"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Hộp Thư Báo Cáo Sai Sót Từ Học Sinh
              </h2>
              {pendingCount > 0 && (
                <Badge className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5">
                  {pendingCount} chờ xử lý
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phản hồi thực tế từ học sinh trong phòng thi khảo thí (sai đáp án, lỗi KaTeX, lệch ma trận)
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Controls: Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả ({reports.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('PENDING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'PENDING'
                  ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Chờ xử lý ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('RESOLVED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'RESOLVED'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Đã duyệt ({resolvedCount})
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc môn, nội dung, loại lỗi..."
              className="h-8.5 pl-8.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* List of Reports */}
        {filteredReports.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Không có báo cáo sai sót nào
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Khi học sinh nộp báo cáo từ phòng thi, thông tin sẽ được cập nhật tức thì tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {filteredReports.map((report) => {
              const isPending = report.status === 'PENDING';
              return (
                <div
                  key={report.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Top Bar: Subject, Issue Type, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700">
                        {report.subjectName || 'Toán học'}
                      </Badge>
                      <Badge
                        className={`text-[11px] font-bold ${
                          report.issueType === 'WRONG_ANSWER'
                            ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            : report.issueType === 'KATEX_ERROR'
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {report.issueTypeLabel}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Mã câu: <span className="font-mono text-slate-600 dark:text-slate-300">{report.questionId}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Chờ Khảo Thí Xem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Đã Giải Quyết
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Title & Description */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {report.questionTitle}
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      &ldquo;{report.description}&rdquo;
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      Gửi bởi <strong className="text-slate-600 dark:text-slate-300">{report.studentName || 'Học sinh'}</strong> •{' '}
                      {new Date(report.reportedAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onEditQuestion(report.questionId);
                          onClose();
                        }}
                        className="h-7 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Mở Sửa Câu Này
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={isPending ? 'default' : 'outline'}
                        onClick={() => onResolveReport(report.id)}
                        className={`h-7 text-xs font-semibold gap-1 ${
                          isPending
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {isPending ? 'Đánh Dấu Đã Xử Lý' : 'Mở Lại Báo Cáo'}
                      </Button>

                      <button
                        type="button"
                        onClick={() => onDeleteReport(report.id)}
                        title="Xóa báo cáo này"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
}
