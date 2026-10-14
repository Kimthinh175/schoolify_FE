'use client';

import * as React from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trash2,
  FileCode2,
  FileDown,
  FolderPlus,
  Folder,
  Pencil,
  Plus,
  Image as ImageIcon,
  Columns,
  Maximize2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { questionBankService } from '@/services/question-bank.service';
import { QuestionBank, ParsedQuestionItem, ParseImportSummary } from '@/types';
import { MathText, cleanOptionText } from '@/components/ui/math-text';
import mammoth from 'mammoth';

interface QuestionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBankId?: string | null;
  onSuccess: (count: number, bankId: string) => void;
}

export function QuestionImportModal({
  isOpen,
  onClose,
  targetBankId,
  onSuccess,
}: QuestionImportModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [fileType, setFileType] = React.useState<'WORD' | 'EXCEL'>('WORD');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [pastedText, setPastedText] = React.useState<string>('');
  const [importMode, setImportMode] = React.useState<'FILE' | 'TEXT'>('FILE');

  const [isParsing, setIsParsing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Dữ liệu ngân hàng đề thi
  const [banks, setBanks] = React.useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = React.useState<string>(targetBankId || '');
  const [isCreatingNewBank, setIsCreatingNewBank] = React.useState(!targetBankId);
  const [newBankTitle, setNewBankTitle] = React.useState('');
  const [newBankIsPremium, setNewBankIsPremium] = React.useState(false);

  // Dữ liệu sau khi parse
  const [parsedSummary, setParsedSummary] = React.useState<ParseImportSummary | null>(null);
  const [parsedQuestions, setParsedQuestions] = React.useState<ParsedQuestionItem[]>([]);
  const [ignoreErrors, setIgnoreErrors] = React.useState(false);

  // Inline editing state ở Bước 3 (Dual-Mode)
  const [editingTempId, setEditingTempId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');
  const [editExplain, setEditExplain] = React.useState('');
  const [editAnswers, setEditAnswers] = React.useState<Array<{ content: string; is_correct: boolean }>>([]);
  const [editImgUrls, setEditImgUrls] = React.useState<string[]>([]);

  // Document Native Previewer States ở Bước 3
  const [rawSourceText, setRawSourceText] = React.useState<string>('');
  const [filePreviewHtml, setFilePreviewHtml] = React.useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = React.useState<string | null>(null);
  const [viewLayout, setViewLayout] = React.useState<'SPLIT' | 'SINGLE'>('SPLIT');
  const [sourceSearchQuery, setSourceSearchQuery] = React.useState<string>('');
  const [activeQuestionTempId, setActiveQuestionTempId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedFile(null);
      setPastedText('');
      setParsedSummary(null);
      setParsedQuestions([]);
      setFilePreviewHtml('');
      setPdfBlobUrl(null);
      (async () => {
        const list = await questionBankService.getBanks();
        setBanks(list);
        if (targetBankId) {
          setSelectedBankId(targetBankId);
          setIsCreatingNewBank(false);
        } else if (list.length > 0) {
          setSelectedBankId(list[0].id);
          setIsCreatingNewBank(false);
        } else {
          setIsCreatingNewBank(true);
        }
      })();
    }
  }, [isOpen, targetBankId]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setSelectedFile(f);
      if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        setFileType('EXCEL');
      } else {
        setFileType('WORD');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
    }
  };

  const handleStartParse = async () => {
    if (importMode === 'FILE' && !selectedFile) {
      alert('Vui lòng chọn 1 file từ máy tính của bạn');
      return;
    }
    if (importMode === 'TEXT' && !pastedText.trim()) {
      alert('Vui lòng dán nội dung văn bản đề thi');
      return;
    }

    setIsParsing(true);
    try {
      if (importMode === 'FILE' && selectedFile) {
        if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
          const blobUrl = URL.createObjectURL(selectedFile);
          setPdfBlobUrl(blobUrl);
          setFilePreviewHtml('');
        } else if (selectedFile.name.toLowerCase().endsWith('.docx') || selectedFile.name.toLowerCase().endsWith('.doc')) {
          setPdfBlobUrl(null);
          try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setFilePreviewHtml(result.value || '');
          } catch (mErr) {
            console.warn('Mammoth preview error:', mErr);
            setFilePreviewHtml('');
          }
        } else {
          setPdfBlobUrl(null);
          setFilePreviewHtml('');
        }
      } else if (importMode === 'TEXT' && pastedText.trim()) {
        setPdfBlobUrl(null);
        const formatted = pastedText
          .split('\n')
          .map((line) => (line.trim() ? `<p class="mb-3">${line}</p>` : '<br/>'))
          .join('');
        setFilePreviewHtml(formatted);
      }

      const res = await questionBankService.parseImportFile(
        selectedFile || new File([], 'uploaded_file.docx'),
        fileType,
        pastedText.trim() || undefined
      );

      if (res.parsed_questions.length === 0) {
        alert('Không tìm thấy câu hỏi hợp lệ nào trong file do bạn chọn. Vui lòng kiểm tra lại định dạng file!');
        return;
      }

      setParsedSummary(res.summary);
      setParsedQuestions(res.parsed_questions);
      setRawSourceText(res.raw_text || pastedText || '');
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi đọc file import. Vui lòng kiểm tra định dạng file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleChangeQuestionType = (tempId: string, newType: any) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.temp_id !== tempId) return q;
        let updatedAns = [...q.answers];
        if (newType === 'SINGLE_CHOICE') {
          let foundFirst = false;
          updatedAns = updatedAns.map((a) => {
            if (a.is_correct && !foundFirst) {
              foundFirst = true;
              return a;
            }
            return { ...a, is_correct: false };
          });
        }
        const hasCorrect = updatedAns.some((a) => a.is_correct);
        const isValid = newType === 'ESSAY' ? true : hasCorrect;
        return {
          ...q,
          question_type: newType,
          answers: updatedAns,
          is_valid: isValid,
          validation_errors: isValid ? [] : ['Chưa chọn đáp án đúng'],
        };
      })
    );
  };

  const handleToggleAnswerCorrect = (tempId: string, ansIndex: number) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.temp_id !== tempId) return q;
        const updatedAns = q.answers.map((a, i) => ({
          ...a,
          is_correct: i === ansIndex ? !a.is_correct : q.question_type === 'SINGLE_CHOICE' ? false : a.is_correct,
        }));
        const hasCorrect = updatedAns.some((a) => a.is_correct);
        const isValid = q.question_type === 'ESSAY' ? true : hasCorrect;
        return {
          ...q,
          answers: updatedAns,
          is_valid: isValid,
          validation_errors: isValid ? [] : ['Chưa chọn đáp án đúng'],
        };
      })
    );
  };

  const handleRemoveQuestion = (tempId: string) => {
    setParsedQuestions((prev) => prev.filter((q) => q.temp_id !== tempId));
  };

  // Dual-Mode Inline Edit Handlers
  const handleStartEdit = (q: ParsedQuestionItem) => {
    setEditingTempId(q.temp_id);
    setEditContent(q.content);
    setEditExplain(q.explain || '');
    setEditAnswers(q.answers.map((a) => ({ ...a })));
    setEditImgUrls(q.img_urls ? [...q.img_urls] : []);
  };

  const handleCancelEdit = () => {
    setEditingTempId(null);
    setEditContent('');
    setEditExplain('');
    setEditAnswers([]);
    setEditImgUrls([]);
  };

  const handleSaveEdit = (tempId: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.temp_id !== tempId) return q;
        const hasCorrect = editAnswers.some((a) => a.is_correct);
        const isValid = q.question_type === 'ESSAY' ? editContent.trim() !== '' : (hasCorrect && editContent.trim() !== '');
        const errors: string[] = [];
        if (!editContent.trim()) {
          errors.push('Nội dung câu hỏi không được để trống');
        }
        if (q.question_type !== 'ESSAY' && !hasCorrect) {
          errors.push('Vui lòng chọn ít nhất 1 đáp án đúng');
        }
        return {
          ...q,
          content: editContent.trim(),
          img_urls: editImgUrls.length > 0 ? editImgUrls : undefined,
          explain: editExplain.trim(),
          answers: editAnswers,
          is_valid: isValid,
          validation_errors: errors,
        };
      })
    );
    setEditingTempId(null);
  };

  const handleEditAddAnswer = () => {
    setEditAnswers((prev) => [...prev, { content: '', is_correct: false }]);
  };

  const handleEditRemoveAnswer = (index: number) => {
    setEditAnswers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditRemoveImage = (index: number) => {
    setEditImgUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setEditImgUrls((prev) => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleConfirmBatchSave = async () => {
    let destBankId = selectedBankId;

    setIsSaving(true);
    try {
      if (isCreatingNewBank) {
        if (!newBankTitle.trim()) {
          alert('Vui lòng nhập tên Ngân hàng đề thi mới');
          setIsSaving(false);
          return;
        }
        const createdBank = await questionBankService.createBank({
          title: newBankTitle.trim(),
          owner_id: 'tchr-01',
          is_premium: newBankIsPremium,
        });
        destBankId = createdBank.id;
      }

      const questionsToSave = ignoreErrors
        ? parsedQuestions.filter((q) => q.is_valid)
        : parsedQuestions;

      const res = await questionBankService.batchImportQuestions(destBankId, questionsToSave);
      setStep(4);
      onSuccess(res.imported_count, res.bank_id);
    } catch {
      alert('Có lỗi xảy ra khi lưu ngân hàng câu hỏi');
    } finally {
      setIsSaving(false);
    }
  };

  const validQuestionsCount = parsedQuestions.filter((q) => q.is_valid).length;
  const invalidQuestionsCount = parsedQuestions.length - validQuestionsCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Câu Hỏi Từ File (Word / Excel)
              </h2>
              <p className="text-xs text-slate-500">
                Đọc & bóc tách dữ liệu THẬT từ file do bạn tải lên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {[
            { s: 1, label: '1. Ngân Hàng & File Mẫu' },
            { s: 2, label: '2. Upload / Dán Đề Thi' },
            { s: 3, label: '3. Preview & Sửa Lỗi' },
            { s: 4, label: '4. Hoàn Tất' },
          ].map((item) => (
            <div
              key={item.s}
              className={`flex items-center gap-2 text-xs font-semibold ${
                step === item.s
                  ? 'text-purple-600 dark:text-purple-400 font-bold'
                  : step > item.s
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === item.s
                    ? 'bg-purple-600 text-white'
                    : step > item.s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step > item.s ? '✓' : item.s}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: CHỌN NGÂN HÀNG VÀ TẢI FILE MẪU */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Chọn Ngân Hàng Đề Đích */}
              <div className="p-5 border border-purple-100 dark:border-purple-950/50 bg-purple-50/30 dark:bg-purple-950/10 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                    <FolderPlus className="w-4 h-4" />
                  </span>
                  Bước 1: Chọn Ngân Hàng Đề Thi Lưu Dữ Liệu
                </h3>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="bank_choice"
                      checked={!isCreatingNewBank}
                      onChange={() => setIsCreatingNewBank(false)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    Chọn Ngân hàng đề có sẵn
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="bank_choice"
                      checked={isCreatingNewBank}
                      onChange={() => setIsCreatingNewBank(true)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    Tạo Ngân hàng đề mới
                  </label>
                </div>

                {!isCreatingNewBank ? (
                  <div>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.questions_count ?? 0} câu) {b.is_premium ? '⭐ PREMIUM' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Nhập tên Ngân hàng đề mới (vd: Ôn thi Học kỳ 1 Toán 12)..."
                        value={newBankTitle}
                        onChange={(e) => setNewBankTitle(e.target.value)}
                        className="text-xs h-10"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={newBankIsPremium}
                          onChange={(e) => setNewBankIsPremium(e.target.checked)}
                          className="rounded text-purple-600"
                        />
                        Ngân hàng trả phí ⭐ (is_premium)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Tải File Mẫu & Link Google Drive */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                    <FileDown className="w-4 h-4" />
                  </span>
                  Tải File Mẫu Chuẩn Định Dạng Hệ Thống
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Word Template */}
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          File Mẫu Microsoft Word (.docx)
                        </h4>
                        <span className="text-[11px] text-slate-400">Khuyên dùng cho Giáo viên</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tải file mẫu để xem quy chuẩn soạn câu hỏi trắc nghiệm & tự luận trên Word.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href="https://docs.google.com/document/d/1TpHqm97CADl_oV573xokrFBJTjl2Zhmj/edit#heading=h.6px4zopv830x"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Mở / Tải File Mẫu Word
                      </a>
                      <a
                        href="https://drive.google.com/drive/u/6/folders/1X10XsO1xfMi31o7PRZOU7vE30XLKTxzj"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        <Folder className="w-3.5 h-3.5 text-blue-600" /> Thư Mục Tham Khảo Drive
                      </a>
                    </div>
                  </div>

                  {/* Card Excel Template */}
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          File Mẫu Microsoft Excel (.xlsx)
                        </h4>
                        <span className="text-[11px] text-slate-400">Dạng bảng cột rõ ràng</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Cột: <code className="text-purple-600 font-bold">question_type</code>, <code className="text-purple-600 font-bold">content</code>, <code className="text-purple-600 font-bold">option_a..d</code>, <code className="text-emerald-600 font-bold">correct_answers</code>.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="/templates/schoolify_question_template.xlsx"
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Tải về máy
                      </a>
                      <a
                        href="https://docs.google.com/spreadsheets/u/0/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Mở trên Google Sheets
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD FILE HOẶC DÁN NỘI DUNG */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setImportMode('FILE')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    importMode === 'FILE'
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload File (Word / Excel)
                </button>
                <button
                  onClick={() => setImportMode('TEXT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    importMode === 'TEXT'
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <FileCode2 className="w-4 h-4" /> Dán Văn Bản Đề Thi Direct
                </button>
              </div>

              {importMode === 'FILE' ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50 space-y-4"
                >
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-2">
                      <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                        📄 File đã chọn: {selectedFile.name}
                      </span>
                      <p className="text-xs text-slate-400">
                        Hệ thống sẽ đọc trực tiếp dữ liệu nhị phân từ file của bạn.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Kéo thả file Word (.docx) hoặc Excel (.xlsx) từ máy tính vào đây
                      </p>
                      <p className="text-xs text-slate-400">
                        Hệ thống sẽ bóc tách 100% dữ liệu từ file bạn tải lên
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-md">
                      <UploadCloud className="w-4 h-4" /> Chọn File Từ Máy Tính
                      <input
                        type="file"
                        accept=".docx,.doc,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Dán toàn bộ nội dung văn bản đề thi vào khung bên dưới:
                  </label>
                  <textarea
                    rows={12}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Dán toàn bộ nội dung đề thi Word/Text của bạn vào đây..."
                    className="w-full p-3 font-mono text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PREVIEW & VALIDATION (INLINE EDIT & SPLIT VIEW) */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary Banner & Layout Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Badge variant="purple" className="text-xs px-2.5 py-1">
                    Đã đọc thành công: {parsedQuestions.length} câu hỏi
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {validQuestionsCount} hợp lệ
                  </span>
                  {invalidQuestionsCount > 0 && (
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> {invalidQuestionsCount} cần kiểm tra
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setViewLayout('SPLIT')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        viewLayout === 'SPLIT'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" /> Đối Chiếu Song Song
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewLayout('SINGLE')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        viewLayout === 'SINGLE'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Mở Rộng Danh Sách
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ignoreErrors}
                      onChange={(e) => setIgnoreErrors(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    Chỉ lưu câu hợp lệ ({validQuestionsCount})
                  </label>
                </div>
              </div>

              {/* BODY: SPLIT VIEW HOẶC SINGLE VIEW */}
              {viewLayout === 'SPLIT' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[55vh] min-h-[440px]">
                  {/* CỘT TRÁI: NỘI DUNG VĂN BẢN / FILE GỐC (NATIVE DOCUMENT VIEWER) */}
                  <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 shadow-inner">
                    <div className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-purple-300 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        {pdfBlobUrl ? 'PDF Document Viewer' : selectedFile ? `File: ${selectedFile.name}` : 'Tài Liệu Xem Trước'}
                      </span>
                      {!pdfBlobUrl && (
                        <div className="relative w-40">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tìm trong file..."
                            value={sourceSearchQuery}
                            onChange={(e) => setSourceSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* RENDER BODY: PDF VIEWER HOẶC WORD PAPER A4 CANVAS (IN-TEXT HIGHLIGHT ĐÁP ÁN ĐÚNG) */}
                    {pdfBlobUrl ? (
                      <iframe
                        src={pdfBlobUrl}
                        className="w-full h-full border-0 bg-white"
                        title="PDF Viewer"
                      />
                    ) : (
                      <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-200/70 dark:bg-slate-950/80">
                        <div className="bg-white text-slate-900 shadow-xl p-6 sm:p-8 rounded-xl max-w-[210mm] mx-auto min-h-[480px] font-serif leading-relaxed text-xs sm:text-sm border border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 space-y-6">
                          {sourceSearchQuery.trim() ? (
                            <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2">
                              {rawSourceText.split(new RegExp(`(${sourceSearchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi')).map((part, pIdx) => (
                                part.toLowerCase() === sourceSearchQuery.toLowerCase() ? (
                                  <mark key={pIdx} className="bg-yellow-300 text-slate-950 font-bold px-0.5 rounded">
                                    {part}
                                  </mark>
                                ) : (
                                  <MathText key={pIdx} text={part} />
                                )
                              ))}
                            </div>
                          ) : parsedQuestions.length > 0 ? (
                            /* IN-TEXT HIGHLIGHT TRỰC TIẾP ĐÁP ÁN ĐÚNG TRÊN TRANG GIẤY A4 */
                            parsedQuestions.map((q, qIdx) => (
                              <div key={q.temp_id} className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  <MathText text={q.content} />
                                </div>

                                {q.img_urls && q.img_urls.length > 0 && (
                                  <div className="flex flex-wrap gap-2 py-1">
                                    {q.img_urls.map((url, imgIdx) => (
                                      <img key={imgIdx} src={url} alt={`Ảnh ${imgIdx + 1}`} className="max-h-56 max-w-full rounded-lg border border-slate-200 shadow-sm" />
                                    ))}
                                  </div>
                                )}

                                {q.question_type !== 'ESSAY' && q.answers.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                                    {q.answers.map((ans, aIdx) => (
                                      <div
                                        key={aIdx}
                                        className={`p-2 rounded-xl transition-all flex items-start gap-2 ${
                                          ans.is_correct
                                            ? 'bg-emerald-100 text-emerald-950 font-bold border-2 border-emerald-500 shadow-xs dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-600'
                                            : 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                      >
                                        <span
                                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                            ans.is_correct
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                          }`}
                                        >
                                          {ans.is_correct ? '✓' : String.fromCharCode(65 + aIdx)}
                                        </span>
                                        <span className="flex-1 break-words leading-snug">
                                          <MathText text={cleanOptionText(ans.content)} />
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {q.explain && (
                                  <div className="text-[11px] italic text-purple-700 dark:text-purple-300 pt-1">
                                    ✨ Lời giải: <MathText text={q.explain} />
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-20 text-slate-400 italic text-xs">
                              Chưa có văn bản gốc để xem trước
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CỘT PHẢI: DANH SÁCH CÂU HỎI BÓC TÁCH */}
                  <div className="lg:col-span-7 flex flex-col overflow-hidden">
                    <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                      {parsedQuestions.map((q, idx) => (
                        <div
                          key={q.temp_id}
                          className={`p-4 border rounded-2xl transition-all space-y-3 ${
                            q.is_valid
                              ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                              : 'border-rose-300 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <select
                                value={q.question_type}
                                onChange={(e) => handleChangeQuestionType(q.temp_id, e.target.value as any)}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-purple-50 dark:bg-slate-900 text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                              >
                                <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                                <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                                <option value="TRUE_FALSE">Câu hỏi Đúng / Sai</option>
                                <option value="ESSAY">Câu hỏi Tự luận</option>
                              </select>
                              {!q.is_valid && (
                                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                                  ⚠️ {q.validation_errors.join(', ')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => (editingTempId === q.temp_id ? handleCancelEdit() : handleStartEdit(q))}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  editingTempId === q.temp_id
                                    ? 'text-purple-600 bg-purple-100 dark:bg-purple-950'
                                    : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                                }`}
                                title={editingTempId === q.temp_id ? 'Đang chỉnh sửa' : 'Chỉnh sửa câu hỏi & đáp án'}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(q.temp_id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="Xóa câu hỏi này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* DUAL-MODE: CHI TIẾT CÂU HỎI (VIEW MODE HOẶC EDIT MODE) */}
                          {editingTempId === q.temp_id ? (
                            <div className="space-y-3 pt-2 bg-purple-50/40 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-200 dark:border-purple-900/50">
                              <div>
                                <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase mb-1">
                                  Nội dung câu hỏi (chữ & công thức toán):
                                </label>
                                <textarea
                                  rows={5}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full p-3 text-xs border border-purple-300 dark:border-purple-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono min-h-[120px]"
                                />
                              </div>

                              {/* Quản lý Hình ảnh minh họa ở Edit Mode */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase">
                                    Hình ảnh minh họa ({editImgUrls.length}):
                                  </label>
                                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer transition-colors">
                                    <ImageIcon className="w-3.5 h-3.5" /> Tải ảnh lên
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={handleEditUploadImage}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {editImgUrls.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {editImgUrls.map((url, imgIdx) => (
                                      <div key={imgIdx} className="relative group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1">
                                        <img src={url} alt={`Minh họa ${imgIdx + 1}`} className="h-20 max-w-[160px] object-contain rounded-lg" />
                                        <button
                                          type="button"
                                          onClick={() => handleEditRemoveImage(imgIdx)}
                                          className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-md shadow-md opacity-90 hover:opacity-100 transition-opacity"
                                          title="Xóa ảnh này"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {q.question_type !== 'ESSAY' && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase">
                                      Các lựa chọn đáp án:
                                    </label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={handleEditAddAnswer}
                                      leftIcon={<Plus className="w-3 h-3" />}
                                      className="h-7 text-[11px]"
                                    >
                                      Thêm đáp án
                                    </Button>
                                  </div>

                                  {editAnswers.map((ans, aIdx) => (
                                    <div key={aIdx} className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = editAnswers.map((a, i) => ({
                                            ...a,
                                            is_correct: i === aIdx ? !a.is_correct : q.question_type === 'SINGLE_CHOICE' ? false : a.is_correct,
                                          }));
                                          setEditAnswers(updated);
                                        }}
                                        className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                                          ans.is_correct
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        }`}
                                        title={ans.is_correct ? 'Đáp án đúng' : 'Đánh dấu đáp án đúng'}
                                      >
                                        {ans.is_correct ? '✓' : String.fromCharCode(65 + aIdx)}
                                      </button>
                                      <Input
                                        value={ans.content}
                                        onChange={(e) => {
                                          const updated = [...editAnswers];
                                          updated[aIdx].content = e.target.value;
                                          setEditAnswers(updated);
                                        }}
                                        placeholder={`Nhập nội dung đáp án ${String.fromCharCode(65 + aIdx)}...`}
                                        className="text-xs h-8 flex-1"
                                      />
                                      {editAnswers.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => handleEditRemoveAnswer(aIdx)}
                                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div>
                                <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase mb-1">
                                  Lời giải / Đáp số (không bắt buộc):
                                </label>
                                <Input
                                  value={editExplain}
                                  onChange={(e) => setEditExplain(e.target.value)}
                                  placeholder="Nhập lời giải chi tiết hoặc đáp số..."
                                  className="text-xs h-8"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-200/60 dark:purple-900/40">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="min-w-[80px] h-8 px-3.5 font-semibold text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(q.temp_id)}
                                  className="min-w-[110px] h-8 px-4 font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                >
                                  Lưu thay đổi
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Nội dung câu hỏi (VIEW MODE) */}
                              <div className="text-xs font-semibold text-slate-900 dark:text-white whitespace-pre-wrap">
                                <MathText text={q.content} />
                              </div>

                              {/* Hình ảnh minh họa (VIEW MODE) */}
                              {q.img_urls && q.img_urls.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {q.img_urls.map((url, imgIdx) => (
                                    <div key={imgIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-1">
                                      <img src={url} alt={`Hình minh họa ${imgIdx + 1}`} className="h-24 max-w-[220px] object-contain rounded-lg" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Danh sách đáp án hoặc Chú thích Tự luận */}
                              {q.question_type === 'ESSAY' ? (
                                <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                                  <span>ℹ️ <strong>Chế độ Tự luận:</strong> {q.answers.length > 0 ? `Đã tạm ẩn ${q.answers.length} lựa chọn trắc nghiệm. Đổi lại Trắc nghiệm để hiển thị lại.` : 'Câu hỏi tự luận không yêu cầu đáp án lựa chọn.'}</span>
                                </div>
                              ) : (
                                q.answers.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {q.answers.map((ans, aIdx) => (
                                      <button
                                        type="button"
                                        key={aIdx}
                                        onClick={() => handleToggleAnswerCorrect(q.temp_id, aIdx)}
                                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 text-left border transition-all w-full min-w-0 ${
                                          ans.is_correct
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-xs'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                        }`}
                                      >
                                        <span
                                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                            ans.is_correct
                                              ? 'bg-emerald-500 text-white'
                                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                          }`}
                                        >
                                          {ans.is_correct ? '✓' : String.fromCharCode(65 + aIdx)}
                                        </span>
                                        <span className="flex-1 truncate">
                                          <MathText text={cleanOptionText(ans.content)} />
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )
                              )}

                              {q.explain && (
                                <div className="p-2.5 rounded-r-xl border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-xs text-purple-900 dark:text-purple-300">
                                  <span className="font-bold">✨ Lời giải / Đáp số:</span> <MathText text={q.explain} />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* SINGLE VIEW (FULL WIDTH) */
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {parsedQuestions.map((q, idx) => (
                    <div
                      key={q.temp_id}
                      className={`p-4 border rounded-2xl transition-all space-y-3 ${
                        q.is_valid
                          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                          : 'border-rose-300 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <select
                            value={q.question_type}
                            onChange={(e) => handleChangeQuestionType(q.temp_id, e.target.value as any)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-purple-50 dark:bg-slate-900 text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                            <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                            <option value="TRUE_FALSE">Câu hỏi Đúng / Sai</option>
                            <option value="ESSAY">Câu hỏi Tự luận</option>
                          </select>
                          {!q.is_valid && (
                            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                              ⚠️ {q.validation_errors.join(', ')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => (editingTempId === q.temp_id ? handleCancelEdit() : handleStartEdit(q))}
                            className={`p-1.5 rounded-lg transition-colors ${
                              editingTempId === q.temp_id
                                ? 'text-purple-600 bg-purple-100 dark:bg-purple-950'
                                : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                            }`}
                            title={editingTempId === q.temp_id ? 'Đang chỉnh sửa' : 'Chỉnh sửa câu hỏi & đáp án'}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.temp_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* DUAL-MODE: CHI TIẾT CÂU HỎI (VIEW MODE HOẶC EDIT MODE) */}
                      {editingTempId === q.temp_id ? (
                        <div className="space-y-3 pt-2 bg-purple-50/40 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-200 dark:border-purple-900/50">
                          <div>
                            <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase mb-1">
                              Nội dung câu hỏi (chữ & công thức toán):
                            </label>
                            <textarea
                              rows={5}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-3 text-xs border border-purple-300 dark:border-purple-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono min-h-[120px]"
                            />
                          </div>

                          {/* Quản lý Hình ảnh minh họa ở Edit Mode */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase">
                                Hình ảnh minh họa ({editImgUrls.length}):
                              </label>
                              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer transition-colors">
                                <ImageIcon className="w-3.5 h-3.5" /> Tải ảnh lên
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditUploadImage}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {editImgUrls.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {editImgUrls.map((url, imgIdx) => (
                                  <div key={imgIdx} className="relative group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1">
                                    <img src={url} alt={`Minh họa ${imgIdx + 1}`} className="h-20 max-w-[160px] object-contain rounded-lg" />
                                    <button
                                      type="button"
                                      onClick={() => handleEditRemoveImage(imgIdx)}
                                      className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-md shadow-md opacity-90 hover:opacity-100 transition-opacity"
                                      title="Xóa ảnh này"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {q.question_type !== 'ESSAY' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase">
                                  Các lựa chọn đáp án:
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleEditAddAnswer}
                                  leftIcon={<Plus className="w-3 h-3" />}
                                  className="h-7 text-[11px]"
                                >
                                  Thêm đáp án
                                </Button>
                              </div>

                              {editAnswers.map((ans, aIdx) => (
                                <div key={aIdx} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = editAnswers.map((a, i) => ({
                                        ...a,
                                        is_correct: i === aIdx ? !a.is_correct : q.question_type === 'SINGLE_CHOICE' ? false : a.is_correct,
                                      }));
                                      setEditAnswers(updated);
                                    }}
                                    className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                                      ans.is_correct
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    }`}
                                    title={ans.is_correct ? 'Đáp án đúng' : 'Đánh dấu đáp án đúng'}
                                  >
                                    {ans.is_correct ? '✓' : String.fromCharCode(65 + aIdx)}
                                  </button>
                                  <Input
                                    value={ans.content}
                                    onChange={(e) => {
                                      const updated = [...editAnswers];
                                      updated[aIdx].content = e.target.value;
                                      setEditAnswers(updated);
                                    }}
                                    placeholder={`Nhập nội dung đáp án ${String.fromCharCode(65 + aIdx)}...`}
                                    className="text-xs h-8 flex-1"
                                  />
                                  {editAnswers.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleEditRemoveAnswer(aIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase mb-1">
                              Lời giải / Đáp số (không bắt buộc):
                            </label>
                            <Input
                              value={editExplain}
                              onChange={(e) => setEditExplain(e.target.value)}
                              placeholder="Nhập lời giải chi tiết hoặc đáp số..."
                              className="text-xs h-8"
                            />
                          </div>

                              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-200/60 dark:border-purple-900/40">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="min-w-[80px] h-8 px-3.5 font-semibold text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(q.temp_id)}
                                  className="min-w-[110px] h-8 px-4 font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                >
                                  Lưu thay đổi
                                </Button>
                              </div>
                        </div>
                      ) : (
                        <>
                          {/* Nội dung câu hỏi (VIEW MODE) */}
                          <div className="text-xs font-semibold text-slate-900 dark:text-white whitespace-pre-wrap">
                            <MathText text={q.content} />
                          </div>

                          {/* Hình ảnh minh họa (VIEW MODE) */}
                          {q.img_urls && q.img_urls.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {q.img_urls.map((url, imgIdx) => (
                                <div key={imgIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-1">
                                  <img src={url} alt={`Hình minh họa ${imgIdx + 1}`} className="h-24 max-w-[220px] object-contain rounded-lg" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Danh sách đáp án hoặc Chú thích Tự luận */}
                          {q.question_type === 'ESSAY' ? (
                            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                              <span>ℹ️ <strong>Chế độ Tự luận:</strong> {q.answers.length > 0 ? `Đã tạm ẩn ${q.answers.length} lựa chọn trắc nghiệm. Đổi lại Trắc nghiệm để hiển thị lại.` : 'Câu hỏi tự luận không yêu cầu đáp án lựa chọn.'}</span>
                            </div>
                          ) : (
                            q.answers.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.answers.map((ans, aIdx) => (
                                  <button
                                    type="button"
                                    key={aIdx}
                                    onClick={() => handleToggleAnswerCorrect(q.temp_id, aIdx)}
                                    className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 text-left border transition-all w-full min-w-0 ${
                                      ans.is_correct
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                    }`}
                                  >
                                    <span
                                      className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                        ans.is_correct
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                                      }`}
                                    >
                                      {ans.is_correct ? '✓' : String.fromCharCode(65 + aIdx)}
                                    </span>
                                    <span className="flex-1 truncate">
                                      <MathText text={cleanOptionText(ans.content)} />
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )
                          )}

                          {q.explain && (
                            <div className="p-2.5 rounded-r-xl border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-xs text-purple-900 dark:text-purple-300">
                              <span className="font-bold">✨ Lời giải / Đáp số:</span> <MathText text={q.explain} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: HOÀN TẤT */}
          {step === 4 && (
            <div className="py-12 text-center space-y-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Import Câu Hỏi Thành Công!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Đã nhập thành công {validQuestionsCount} câu hỏi từ file của bạn vào Ngân hàng đề thi.
              </p>
              <Button onClick={onClose} className="mt-4">
                Hoàn Tất & Xem Ngân Hàng Đề
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {step > 1 && step < 4 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step === 1 && (
              <Button
                size="sm"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Tiếp tục (Upload / Dán Văn Bản)
              </Button>
            )}

            {step === 2 && (
              <Button
                size="sm"
                isLoading={isParsing}
                onClick={handleStartParse}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isParsing ? 'Đang đọc dữ liệu...' : 'Phân Tích Đề Thi'}
              </Button>
            )}

            {step === 3 && (
              <Button
                size="sm"
                isLoading={isSaving}
                onClick={handleConfirmBatchSave}
                disabled={!ignoreErrors && invalidQuestionsCount > 0}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Lưu {ignoreErrors ? validQuestionsCount : parsedQuestions.length} Câu Hỏi Vào Bank
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
