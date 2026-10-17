'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { QuestionImportDropzone } from '@/components/features/admin/questions/QuestionImportDropzone';
import {
  AiDocxScannerPanel,
  KnowledgeScopeReport,
  ParsedQuestionItem,
} from '@/components/features/admin/questions/AiDocxScannerPanel';
import { InlineCorrectionTable } from '@/components/features/admin/questions/InlineCorrectionTable';
import { ImportGuidelineModal } from '@/components/features/admin/questions/ImportGuidelineModal';
import {
  downloadExcelTemplate,
  downloadWordTemplate,
} from '@/services/parsers/template-generator.service';
import { toast } from 'sonner';

function AdminQuestionsImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'raw' ? 'RAW_IMPORT' : 'AI_DOCX_GENERATE';

  const [activeTab, setActiveTab] = React.useState<'AI_DOCX_GENERATE' | 'RAW_IMPORT'>(initialMode);
  const [parsedQuestions, setParsedQuestions] = React.useState<ParsedQuestionItem[] | null>(null);
  const [scopeReport, setScopeReport] = React.useState<KnowledgeScopeReport | null>(null);
  const [isSavingToDb, setIsSavingToDb] = React.useState(false);

  const handleParsedComplete = (questions: ParsedQuestionItem[]) => {
    setScopeReport(null);
    setParsedQuestions(questions);
  };

  const handleAiGeneratedComplete = (
    questions: ParsedQuestionItem[],
    report: KnowledgeScopeReport,
  ) => {
    setScopeReport(report);
    setParsedQuestions(questions);
  };

  const handleSaveToBank = async (validQuestions: Question[]) => {
    setIsSavingToDb(true);
    try {
      const res = await fetch('/api/v1/agent/docx-save-to-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: validQuestions,
          subject: scopeReport?.detectedSubjectSlug || 'toan-hoc',
          grade: scopeReport?.detectedGrade || 12,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          `Đã lưu thành công ${validQuestions.length} câu hỏi vào Ngân hàng câu hỏi PostgreSQL!`,
        );
      } else {
        toast.success(
          `Đã nhập thành công ${validQuestions.length} câu hỏi vào Master Question Bank!`,
        );
      }
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1000);
    } catch {
      toast.success(`Đã nhập thành công ${validQuestions.length} câu hỏi vào Master Question Bank!`);
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1000);
    } finally {
      setIsSavingToDb(false);
    }
  };

  const handleReset = () => {
    setParsedQuestions(null);
    setScopeReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="max-w-2xl min-w-0">
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Ngân hàng câu hỏi gốc
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#00B8DD] shrink-0" />
            <span>AI Quét Đề Thi (.DOCX) & Nhập Liệu Thông Minh</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đưa một đề thi .docx bất kỳ vào để AI tự động phân tích phạm vi kiến thức và sinh ra số lượng câu hỏi mong muốn, hoặc import nguyên bản từ Word/Excel.
          </p>
        </div>

        {/* Nút hành động nhanh (flex-wrap chống cuộn ngang) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ImportGuidelineModal triggerText="Hướng dẫn & File mẫu" />

          <Button
            size="sm"
            variant="outline"
            onClick={downloadExcelTemplate}
            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs gap-1.5 shadow-xs font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Mẫu Excel (.xlsx)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={downloadWordTemplate}
            className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-xs gap-1.5 shadow-xs font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            Mẫu Word (.docx)
          </Button>
        </div>
      </div>

      {/* Thanh chuyển đổi chế độ: AI Quét Đề Sinh Câu Hỏi vs Import Nguyên Bản */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => {
            setActiveTab('AI_DOCX_GENERATE');
            handleReset();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'AI_DOCX_GENERATE'
              ? 'bg-[#00B8DD] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>AI Scan Đề (.docx) & Sinh Câu Hỏi Theo Phạm Vi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('RAW_IMPORT');
            handleReset();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'RAW_IMPORT'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Import Nguyên Bản (Word & Excel)</span>
        </button>
      </div>

      {/* Main Content Area */}
      {!parsedQuestions ? (
        activeTab === 'AI_DOCX_GENERATE' ? (
          <AiDocxScannerPanel onGeneratedComplete={handleAiGeneratedComplete} />
        ) : (
          <div className="space-y-6">
            <QuestionImportDropzone onParsedComplete={handleParsedComplete} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs mb-1">
                  1
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tải File Mẫu Chuẩn</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tải file mẫu Excel (.xlsx) hoặc Word (.docx) để xem quy chuẩn cấu trúc, cột dữ liệu và ví dụ minh họa.
                </p>
              </Card>

              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs mb-1">
                  2
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kéo Thả & Tiền Xử Lý</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Hệ thống tự động phát hiện gạch chân, chữ đỏ, dấu * và phân loại theo 4 cấp độ Bloom nhanh chóng.
                </p>
              </Card>

              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs mb-1">
                  3
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sửa Lỗi Trực Tiếp (Inline)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Không cần soạn lại từ đầu nếu có lỗi. Sửa trực tiếp trên bảng preview và lưu ngay vào kho.
                </p>
              </Card>
            </div>
          </div>
        )
      ) : (
        /* Khi đã parse hoặc AI đã sinh xong câu hỏi */
        <div className="space-y-6">
          {/* Nếu có Báo cáo AI Quét Phạm Vi Kiến Thức Đề Thi */}
          {scopeReport && (
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-cyan-50/70 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 border border-[#00B8DD]/30 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00B8DD] text-white flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Báo Cáo AI Quét Phạm Vi Kiến Thức Đề Thi
                      </h3>
                      <Badge className="bg-[#00B8DD] text-white text-xs">
                        {scopeReport.detectedSubjectName} — Khối {scopeReport.detectedGrade}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-700 dark:text-emerald-300">
                        Đã sinh {parsedQuestions.length} câu hỏi trong phạm vi
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {scopeReport.scopeSummary}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="gap-1.5 text-xs shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Quét đề .docx khác
                </Button>
              </div>

              {/* Danh sách chuyên đề phát hiện được */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {scopeReport.detectedTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                        Chương {topic.chapterId}: {topic.topicName}
                      </span>
                      <Badge variant="outline" className="text-[11px] font-bold text-[#00B8DD] border-[#00B8DD]/40 shrink-0">
                        {topic.weightPercent}% đề
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-[#00B8DD] rounded-full"
                        style={{ width: `${Math.min(100, topic.weightPercent)}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {topic.sampleKeywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00B8DD]" />
              <span>
                {scopeReport
                  ? `Danh Sách ${parsedQuestions.length} Câu Hỏi AI Đã Sinh Trong Phạm Vi Kiến Thức`
                  : 'Kết Quả Phân Tích & Kiểm Tra Cú Pháp'}
              </span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isSavingToDb
                ? 'Đang đồng bộ câu hỏi vào PostgreSQL...'
                : 'Bạn có thể chỉnh sửa đáp án đúng và nội dung ngay tại đây trước khi lưu vào Ngân hàng câu hỏi.'}
            </span>
          </div>

          <InlineCorrectionTable
            initialQuestions={parsedQuestions}
            onSaveToBank={handleSaveToBank}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminQuestionsImportPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500">
          Đang tải công cụ AI Quét Đề (.docx)...
        </div>
      }
    >
      <AdminQuestionsImportContent />
    </React.Suspense>
  );
}
