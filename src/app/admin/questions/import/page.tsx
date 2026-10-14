'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from 'lucide-react';
import { QuestionImportDropzone } from '@/components/features/admin/questions/QuestionImportDropzone';
import { InlineCorrectionTable } from '@/components/features/admin/questions/InlineCorrectionTable';
import { ImportGuidelineModal } from '@/components/features/admin/questions/ImportGuidelineModal';
import {
  downloadExcelTemplate,
  downloadWordTemplate,
} from '@/services/parsers/template-generator.service';
import { toast } from 'sonner';

interface ParsedQuestionItem extends Question {
  hasError?: boolean;
  errorReason?: string;
  originalIndex: number;
}

export default function AdminQuestionsImportPage() {
  const router = useRouter();
  const [parsedQuestions, setParsedQuestions] = React.useState<ParsedQuestionItem[] | null>(null);

  const handleParsedComplete = (questions: ParsedQuestionItem[]) => {
    setParsedQuestions(questions);
  };

  const handleSaveToBank = (validQuestions: Question[]) => {
    toast.success(`Đã nhập thành công ${validQuestions.length} câu hỏi vào Master Question Bank!`);
    setTimeout(() => {
      router.push('/admin/questions');
    }, 1200);
  };

  const handleReset = () => {
    setParsedQuestions(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="max-w-2xl min-w-0">
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Ngân hàng câu hỏi gốc
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600 shrink-0" />
            <span>Nhập Câu Hỏi Hàng Loạt (Word & Excel)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hỗ trợ tự động bóc tách công thức KaTeX, nhận diện 3 kiểu đáp án đúng và sửa lỗi trực tiếp trên bảng preview.
          </p>
        </div>

        {/* Nút hành động nhanh: Đảm bảo không bị rớt dòng trên Desktop */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <ImportGuidelineModal triggerText="Hướng dẫn & File mẫu" />

          <Button
            size="sm"
            variant="outline"
            onClick={downloadExcelTemplate}
            className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs gap-1.5 shadow-xs font-medium whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Mẫu Excel (.xlsx)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={downloadWordTemplate}
            className="border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 text-xs gap-1.5 shadow-xs font-medium whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            Mẫu Word (.docx)
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {!parsedQuestions ? (
        <div className="space-y-6">
          {/* Hộp kéo thả file */}
          <QuestionImportDropzone onParsedComplete={handleParsedComplete} />

          {/* Hướng dẫn tóm tắt nhanh 3 bước */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-1">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Tải File Mẫu Chuẩn</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tải file mẫu Excel (.xlsx) hoặc Word (.docx) để xem quy chuẩn cấu trúc, cột dữ liệu và ví dụ minh họa.
              </p>
            </Card>

            <Card className="p-5 bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs mb-1">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Kéo Thả & Tiền Xử Lý</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống tự động phát hiện gạch chân, chữ đỏ, dấu * và phân loại theo 4 cấp độ Bloom nhanh chóng.
              </p>
            </Card>

            <Card className="p-5 bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-1">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Sửa Lỗi Trực Tiếp (Inline)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Không cần soạn lại từ đầu nếu có lỗi. Sửa trực tiếp trên bảng preview và lưu ngay vào kho.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        /* Khi đã parse xong file: Hiển thị bảng Inline Correction Table */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Kết Quả Phân Tích & Kiểm Tra Cú Pháp
            </h3>
            <span className="text-xs text-slate-500">
              Bạn có thể chỉnh sửa đáp án đúng và nội dung ngay tại đây trước khi lưu.
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
