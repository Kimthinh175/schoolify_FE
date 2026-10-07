'use client';

import * as React from 'react';
import { UploadCloud, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { parseExcelQuestions } from '@/services/parsers/excel-parser';
import { parseWordQuestions } from '@/services/parsers/word-parser';
import { toast } from 'sonner';
import { Question } from '@/types/exam';

interface ParsedQuestionItem extends Question {
  hasError?: boolean;
  errorReason?: string;
  originalIndex: number;
}

interface QuestionImportDropzoneProps {
  onParsedComplete: (questions: ParsedQuestionItem[]) => void;
}

export function QuestionImportDropzone({ onParsedComplete }: QuestionImportDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'docx') {
      toast.error('Vui lòng chỉ tải lên file Excel (.xlsx) hoặc file Word (.docx)');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      if (ext === 'xlsx' || ext === 'xls') {
        const result = await parseExcelQuestions(file);
        toast.success(`Đã đọc ${result.allParsed.length} câu hỏi từ file Excel!`);
        onParsedComplete(result.allParsed);
      } else {
        const result = await parseWordQuestions(file);
        toast.success(`Đã đọc ${result.allParsed.length} câu hỏi từ file Word!`);
        onParsedComplete(result.allParsed);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi xử lý file: ' + (err.message || 'Sai định dạng'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 shadow-xs ${
        isDragging
          ? 'border-primary bg-primary/5 scale-[0.99]'
          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      {isProcessing ? (
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div className="text-sm font-bold text-slate-800">
            Đang phân tích cú pháp: {fileName}...
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống đang quét regex, bóc tách đáp án đúng và kiểm tra lỗi định dạng.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              Kéo thả file câu hỏi vào đây hoặc{' '}
              <span className="text-primary underline font-semibold">chọn từ máy tính</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Hỗ trợ Microsoft Excel (<span className="text-emerald-600 font-semibold">.xlsx</span>) và Microsoft Word (<span className="text-sky-600 font-semibold">.docx</span>)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-700 font-medium border border-slate-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Tự động nhận diện cột Excel
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-700 font-medium border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              Tự động nhận diện <u>Gạch chân</u> & Màu đỏ Word
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
