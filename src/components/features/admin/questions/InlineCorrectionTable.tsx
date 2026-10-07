'use client';

import * as React from 'react';
import { Question, DifficultyLevel } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { MathFormulaToolbar } from '@/components/features/admin/questions/MathFormulaToolbar';
import { MathRenderer } from '@/components/ui/math-renderer';
import {
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
  RotateCcw,
  Pencil,
  ImageIcon,
  UploadCloud,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ParsedQuestionItem extends Question {
  hasError?: boolean;
  errorReason?: string;
  originalIndex: number;
}

interface InlineCorrectionTableProps {
  initialQuestions: ParsedQuestionItem[];
  onSaveToBank: (validQuestions: Question[]) => void;
  onReset: () => void;
}

export function InlineCorrectionTable({
  initialQuestions,
  onSaveToBank,
  onReset,
}: InlineCorrectionTableProps) {
  const [questions, setQuestions] = React.useState<ParsedQuestionItem[]>(initialQuestions);
  const [filterMode, setFilterMode] = React.useState<'ALL' | 'ERROR' | 'VALID'>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingQuestion, setEditingQuestion] = React.useState<ParsedQuestionItem | null>(null);
  const [questionToDelete, setQuestionToDelete] = React.useState<ParsedQuestionItem | null>(null);

  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    setQuestions(initialQuestions);
    setCurrentPage(1);
  }, [initialQuestions]);

  const handleToggleAnswer = (qIndex: number, aIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const targetQ = { ...updated[qIndex] };
      if (!targetQ.answers) return prev;

      const newAnswers = targetQ.answers.map((ans, idx) => {
        if (targetQ.type === 'SINGLE_CHOICE') {
          return { ...ans, is_answer: idx === aIndex };
        } else {
          return idx === aIndex ? { ...ans, is_answer: !ans.is_answer } : ans;
        }
      });

      targetQ.answers = newAnswers;

      const hasCorrect = newAnswers.some((a) => a.is_answer);
      if (hasCorrect && targetQ.hasError && targetQ.errorReason?.includes('đáp án')) {
        targetQ.hasError = false;
        targetQ.errorReason = undefined;
      }

      updated[qIndex] = targetQ;
      return updated;
    });
    toast.success('Đã cập nhật đáp án đúng!');
  };

  const handleChangeDifficulty = (qIndex: number, diff: DifficultyLevel) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], difficulty: diff };
      return updated;
    });
  };

  const handleEditContent = (qIndex: number, newContent: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const targetQ = { ...updated[qIndex], content: newContent };
      if (
        newContent.trim().length > 0 &&
        targetQ.hasError &&
        targetQ.errorReason?.includes('nội dung')
      ) {
        targetQ.hasError = false;
        targetQ.errorReason = undefined;
      }
      updated[qIndex] = targetQ;
      return updated;
    });
  };

  // Gắn ảnh nhanh cho một câu hỏi
  const handleAttachImage = (qIndex: number, imageBase64OrUrl: string | null) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], image_url: imageBase64OrUrl || undefined };
      return updated;
    });
    if (imageBase64OrUrl) {
      toast.success('Đã cập nhật hình ảnh minh họa cho câu hỏi!');
    } else {
      toast.info('Đã gỡ ảnh minh họa!');
    }
  };

  // Mở modal sửa chi tiết
  const handleOpenEditModal = (q: ParsedQuestionItem) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
  };

  // Lưu câu hỏi từ modal sửa chi tiết
  const handleSaveModalEdit = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.content.trim()) {
      toast.error('Nội dung câu hỏi không được để trống!');
      return;
    }

    const originalIdx = questions.findIndex((item) => item.id === editingQuestion.id);
    if (originalIdx === -1) return;

    const updatedQ = { ...editingQuestion };
    // Kiểm tra xem lỗi đã được giải quyết chưa
    const hasCorrect = updatedQ.answers?.some((a) => a.is_answer);
    if (updatedQ.content.trim().length > 0 && hasCorrect) {
      updatedQ.hasError = false;
      updatedQ.errorReason = undefined;
    }

    setQuestions((prev) => {
      const list = [...prev];
      list[originalIdx] = updatedQ;
      return list;
    });

    setEditingQuestion(null);
    toast.success(`Đã lưu thay đổi cho câu #${updatedQ.originalIndex}!`);
  };

  // Xác nhận loại bỏ câu hỏi
  const handleConfirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    const targetId = questionToDelete.id;
    const targetIdx = questionToDelete.originalIndex;

    setQuestions((prev) => prev.filter((item) => item.id !== targetId));
    setQuestionToDelete(null);
    toast.success(`Đã loại bỏ câu #${targetIdx} khỏi danh sách import!`);
  };

  const totalCount = questions.length;
  const errorCount = questions.filter((q) => q.hasError).length;
  const validCount = totalCount - errorCount;

  const handleFilterModeChange = (mode: 'ALL' | 'ERROR' | 'VALID') => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterMode === 'ERROR') return q.hasError;
    if (filterMode === 'VALID') return !q.hasError;
    return true;
  });

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSave = () => {
    const validOnly = questions.filter((q) => !q.hasError);
    if (validOnly.length === 0) {
      toast.error('Chưa có câu hỏi hợp lệ nào để lưu!');
      return;
    }
    onSaveToBank(validOnly);
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ thống kê & Bộ lọc */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filterMode === 'ALL' ? 'default' : 'outline'}
            onClick={() => handleFilterModeChange('ALL')}
            className={`text-xs ${
              filterMode === 'ALL'
                ? 'bg-primary text-white'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tất cả ({totalCount})
          </Button>
          <Button
            size="sm"
            variant={filterMode === 'ERROR' ? 'destructive' : 'outline'}
            onClick={() => handleFilterModeChange('ERROR')}
            className="text-xs gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Cần sửa ({errorCount})
          </Button>
          <Button
            size="sm"
            variant={filterMode === 'VALID' ? 'default' : 'outline'}
            onClick={() => handleFilterModeChange('VALID')}
            className={`text-xs gap-1.5 ${
              filterMode === 'VALID'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Hợp lệ ({validCount})
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="text-slate-500 hover:text-slate-800 text-xs gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nhập file khác
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={validCount === 0}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            Lưu vào Ngân Hàng ({validCount} câu)
          </Button>
        </div>
      </Card>

      {/* Danh sách các câu hỏi đã parse */}
      <div className="space-y-3">
        {paginatedQuestions.map((q) => {
          const originalIdx = questions.findIndex((item) => item.id === q.id);

          return (
            <Card
              key={q.id}
              className={`p-5 transition-all shadow-xs ${
                q.hasError
                  ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              {/* Header câu hỏi: Trạng thái Hợp lệ/Lỗi ở bên trái nhận diện, Nút Bỏ câu ở ngoài cùng bên phải */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">
                    Câu #{q.originalIndex}
                  </span>

                  {/* Trạng thái lỗi / Hợp lệ: Đặt ngay cạnh số thứ tự câu hỏi */}
                  {q.hasError ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-[11px] gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      {q.errorReason || 'Có lỗi định dạng'}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] gap-1 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Hợp lệ
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 font-medium"
                  >
                    {q.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-700 bg-amber-50 border-amber-200 font-medium"
                  >
                    {q.chapter || 'Chương chung'}
                  </Badge>
                </div>

                {/* Nhóm nút hành động: Nút Bỏ câu nằm ngoài cùng bên phải */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Selector Độ khó nhanh */}
                  <select
                    value={q.difficulty || 'UNDERSTANDING'}
                    onChange={(e) =>
                      handleChangeDifficulty(originalIdx, e.target.value as DifficultyLevel)
                    }
                    className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="RECOGNITION">Nhận biết</option>
                    <option value="UNDERSTANDING">Thông hiểu</option>
                    <option value="APPLICATION">Vận dụng</option>
                    <option value="ADVANCED_APPLICATION">Vận dụng cao</option>
                  </select>

                  {/* Nút sửa chi tiết (Mở Modal Soạn Thảo Đầy Đủ) */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditModal(q)}
                    className="h-7 text-xs px-2.5 gap-1 border-slate-200 hover:border-primary hover:text-primary font-medium bg-white"
                  >
                    <Pencil className="w-3 h-3" />
                    Sửa chi tiết
                  </Button>

                  {/* Nút loại bỏ câu hỏi (Nằm ngoài cùng bên phải) */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuestionToDelete(q)}
                    className="h-7 px-2.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 gap-1 border border-rose-100 hover:border-rose-200 transition-colors"
                    title="Bỏ câu hỏi này khỏi danh sách import"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bỏ câu</span>
                  </Button>
                </div>
              </div>

              {/* Nội dung câu hỏi (Hiển thị render KaTeX và input sửa nhanh) */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">
                    Nội dung câu hỏi:
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Click &ldquo;Sửa chi tiết&rdquo; để dùng thanh công thức Toán và tải ảnh
                  </span>
                </div>
                <Input
                  value={q.content}
                  onChange={(e) => handleEditContent(originalIdx, e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 text-xs focus:border-primary font-sans"
                />

                {/* Render KaTeX công thức toán ngay trên thẻ câu hỏi */}
                {q.content.includes('$') && (
                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80 text-xs text-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      Hiển thị công thức:
                    </span>
                    <MathRenderer content={q.content} />
                  </div>
                )}
              </div>

              {/* Hình ảnh minh họa (nếu có hoặc nút thêm ảnh nhanh) */}
              <div className="mb-3">
                {q.image_url ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl w-fit">
                    <img
                      src={q.image_url}
                      alt={`Minh họa câu #${q.originalIndex}`}
                      className="max-h-24 rounded-lg border border-slate-200 object-contain bg-white"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAttachImage(originalIdx, null)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2 gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Gỡ ảnh
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors py-1 shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              handleAttachImage(originalIdx, reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="whitespace-nowrap">+ Thêm ảnh minh họa cho câu này</span>
                  </label>
                )}
              </div>

              {/* Danh sách phương án & Nút chọn đáp án đúng tức thì */}
              {q.answers && q.answers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Các phương án (Click vào chữ cái để chọn/bỏ đáp án đúng):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.answers.map((ans, aIdx) => (
                      <div
                        key={ans.id}
                        onClick={() => handleToggleAnswer(originalIdx, aIdx)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border transition-all ${
                          ans.is_answer
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                            ans.is_answer
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {ans.label || String.fromCharCode(65 + aIdx)}
                        </span>
                        <div className="text-xs truncate flex-1">
                          <MathRenderer content={ans.content} inline />
                        </div>
                        {ans.is_answer && (
                          <Check className="w-3.5 h-3.5 ml-auto text-emerald-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lời giải chi tiết nếu có */}
              {q.explain && (
                <div className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-sky-700 font-semibold">Lời giải: </span>
                  <MathRenderer content={q.explain} inline />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Phân trang: Tự động hiển thị khi số lượng câu hỏi > 10 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredQuestions.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* MODAL SỬA CHI TIẾT TOÀN DIỆN CÂU HỎI */}
      {editingQuestion && (
        <Dialog
          isOpen={Boolean(editingQuestion)}
          onClose={() => setEditingQuestion(null)}
          title={
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Pencil className="w-4 h-4 text-primary" />
              Chỉnh Sửa Chi Tiết - Câu #{editingQuestion.originalIndex}
            </div>
          }
          description="Chỉnh sửa nội dung, công thức KaTeX, hình ảnh minh họa, các phương án và lời giải chi tiết."
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingQuestion(null)}
                className="text-xs border-slate-200"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                onClick={handleSaveModalEdit}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu thay đổi
              </Button>
            </div>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Phân loại & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Mức độ nhận thức:</label>
                <select
                  value={editingQuestion.difficulty || 'UNDERSTANDING'}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      difficulty: e.target.value as DifficultyLevel,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="RECOGNITION">Nhận biết</option>
                  <option value="UNDERSTANDING">Thông hiểu</option>
                  <option value="APPLICATION">Vận dụng</option>
                  <option value="ADVANCED_APPLICATION">Vận dụng cao</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Chương / Chuyên đề:</label>
                <Input
                  value={editingQuestion.chapter || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, chapter: e.target.value })
                  }
                  placeholder="Ví dụ: Khảo sát hàm số"
                  className="h-8.5 bg-white border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Điểm số:</label>
                <Input
                  type="number"
                  step="0.05"
                  value={editingQuestion.points || 0.25}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      points: parseFloat(e.target.value) || 0.25,
                    })
                  }
                  className="h-8.5 bg-white border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Nội dung câu hỏi + Thanh ký tự Toán */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">Nội dung câu hỏi:</label>
                <span className="text-[11px] text-slate-400">
                  Công thức bọc trong <code className="text-primary font-bold">$...$</code>
                </span>
              </div>

              <MathFormulaToolbar
                label="Ký tự Toán:"
                onInsert={(snippet) => {
                  setEditingQuestion((prev) =>
                    prev
                      ? {
                          ...prev,
                          content: prev.content ? `${prev.content} ${snippet}` : snippet,
                        }
                      : null
                  );
                }}
                previewContent={editingQuestion.content}
              />

              <textarea
                rows={4}
                value={editingQuestion.content}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, content: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-sans"
              />
            </div>

            {/* Hình ảnh minh họa */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  Ảnh minh họa cho câu hỏi:
                </span>
                {editingQuestion.image_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditingQuestion({ ...editingQuestion, image_url: undefined })
                    }
                    className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa ảnh
                  </Button>
                )}
              </div>

              {editingQuestion.image_url ? (
                <div className="p-2 bg-white rounded-lg border border-slate-200 w-fit">
                  <img
                    src={editingQuestion.image_url}
                    alt="Minh họa"
                    className="max-h-40 rounded object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditingQuestion({
                                ...editingQuestion,
                                image_url: reader.result,
                              });
                              toast.success('Đã tải ảnh lên!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap shrink-0">
                      <UploadCloud className="w-3.5 h-3.5 text-primary" />
                      Tải ảnh lên từ thiết bị
                    </span>
                  </label>

                  <Input
                    placeholder="Hoặc dán URL ảnh tại đây..."
                    className="h-8.5 text-xs bg-white border-slate-200 flex-1 min-w-0"
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        setEditingQuestion({
                          ...editingQuestion,
                          image_url: val,
                        });
                        toast.success('Đã gắn link ảnh!');
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Các phương án trả lời */}
            {editingQuestion.answers && editingQuestion.answers.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Các phương án trả lời (Click chữ cái để đánh dấu đáp án đúng):
                </label>
                <div className="space-y-2">
                  {editingQuestion.answers.map((ans, aIdx) => (
                    <div key={ans.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const nextAnswers = editingQuestion.answers!.map((a, idx) => {
                            if (editingQuestion.type === 'SINGLE_CHOICE') {
                              return { ...a, is_answer: idx === aIdx };
                            } else {
                              return idx === aIdx ? { ...a, is_answer: !a.is_answer } : a;
                            }
                          });
                          setEditingQuestion({
                            ...editingQuestion,
                            answers: nextAnswers,
                          });
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                          ans.is_answer
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {ans.label || String.fromCharCode(65 + aIdx)}
                      </button>

                      <Input
                        value={ans.content}
                        onChange={(e) => {
                          const nextAnswers = [...editingQuestion.answers!];
                          nextAnswers[aIdx] = { ...nextAnswers[aIdx], content: e.target.value };
                          setEditingQuestion({
                            ...editingQuestion,
                            answers: nextAnswers,
                          });
                        }}
                        className="h-8.5 bg-slate-50 border-slate-200 text-xs text-slate-900 flex-1 focus:bg-white"
                        placeholder={`Nội dung phương án ${ans.label}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lời giải chi tiết (Nâng cấp toàn diện với Toolbar Toán & Live Preview) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 block">
                  Lời giải chi tiết:
                </label>
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ công thức Toán học <code className="text-primary font-bold">$...$</code>
                </span>
              </div>

              {/* Thanh ký tự Toán cho Lời giải */}
              <MathFormulaToolbar
                label="Ký tự giải:"
                onInsert={(snippet) => {
                  setEditingQuestion((prev) =>
                    prev
                      ? {
                          ...prev,
                          explain: prev.explain ? `${prev.explain} ${snippet}` : snippet,
                        }
                      : null
                  );
                }}
                previewContent={editingQuestion.explain || ''}
              />

              <textarea
                rows={3}
                value={editingQuestion.explain || ''}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explain: e.target.value })
                }
                placeholder="Nhập hướng dẫn giải, các bước giải hoặc phương pháp chi tiết..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-sans"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* POPUP XÁC NHẬN BỎ CÂU HỎI KHỎI DANH SÁCH IMPORT (AN TOÀN) */}
      {questionToDelete && (
        <Dialog
          isOpen={Boolean(questionToDelete)}
          onClose={() => setQuestionToDelete(null)}
          title={
            <div className="flex items-center gap-2 text-base font-bold text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              Xác Nhận Loại Bỏ Câu Hỏi
            </div>
          }
          description="Hành động này sẽ loại bỏ câu hỏi khỏi danh sách xem trước và sẽ không lưu vào Ngân hàng câu hỏi."
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestionToDelete(null)}
                className="text-xs border-slate-200"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmDeleteQuestion}
                className="text-xs font-semibold gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xác nhận loại bỏ
              </Button>
            </div>
          }
        >
          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-rose-900 flex items-center justify-between">
              <span>Câu #{questionToDelete.originalIndex} ({questionToDelete.type})</span>
              <Badge variant="outline" className="text-[10px] bg-rose-100 text-rose-800 border-rose-200">
                {questionToDelete.chapter || 'Chương chung'}
              </Badge>
            </div>
            <div className="line-clamp-3 text-slate-600 italic bg-white p-2.5 rounded-lg border border-rose-100">
              &ldquo;{questionToDelete.content || '(Chưa có nội dung)'}&rdquo;
            </div>
            <p className="text-[11px] text-slate-500">
              Bạn có thể nhập lại câu này sau từ file nguồn nếu cần.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
