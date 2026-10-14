'use client';

import * as React from 'react';
import { X, Plus, Trash2, HelpCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Question, QuestionType, Answer } from '@/types';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  questionToEdit?: Question | null;
  onSave: (question: Question) => Promise<void>;
}

export function QuestionFormModal({
  isOpen,
  onClose,
  bankId,
  questionToEdit,
  onSave,
}: QuestionFormModalProps) {
  const [questionType, setQuestionType] = React.useState<QuestionType>('SINGLE_CHOICE');
  const [content, setContent] = React.useState('');
  const [imgUrls, setImgUrls] = React.useState<string[]>([]);
  const [explain, setExplain] = React.useState('');
  const [points, setPoints] = React.useState<number>(1.0);
  const [answers, setAnswers] = React.useState<Array<{ content: string; is_correct: boolean }>>([
    { content: '', is_correct: false },
    { content: '', is_correct: false },
    { content: '', is_correct: false },
    { content: '', is_correct: false },
  ]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (questionToEdit) {
      setQuestionType(questionToEdit.type || 'SINGLE_CHOICE');
      setContent(questionToEdit.content || '');
      setImgUrls(questionToEdit.img_urls ? [...questionToEdit.img_urls] : []);
      setExplain(questionToEdit.answers?.[0]?.explain || '');
      setPoints(questionToEdit.points || 1.0);
      if (questionToEdit.answers && questionToEdit.answers.length > 0) {
        setAnswers(
          questionToEdit.answers.map((a) => ({
            content: a.content,
            is_correct: !!a.is_answer,
          }))
        );
      } else {
        setAnswers([
          { content: '', is_correct: false },
          { content: '', is_correct: false },
        ]);
      }
    } else {
      setQuestionType('SINGLE_CHOICE');
      setContent('');
      setImgUrls([]);
      setExplain('');
      setPoints(1.0);
      setAnswers([
        { content: '', is_correct: true },
        { content: '', is_correct: false },
        { content: '', is_correct: false },
        { content: '', is_correct: false },
      ]);
    }
    setErrorMsg(null);
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImgUrls((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImgUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    if (type === 'TRUE_FALSE') {
      if (answers.length !== 2 || answers[0]?.content !== 'Đúng') {
        setAnswers([
          { content: 'Đúng', is_correct: true },
          { content: 'Sai', is_correct: false },
        ]);
      }
    } else if (type !== 'ESSAY' && answers.length < 2) {
      setAnswers([
        { content: '', is_correct: true },
        { content: '', is_correct: false },
        { content: '', is_correct: false },
        { content: '', is_correct: false },
      ]);
    }
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { content: '', is_correct: false }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length <= 2 && questionType !== 'ESSAY') return;
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleAnswerContentChange = (index: number, val: string) => {
    const updated = [...answers];
    updated[index].content = val;
    setAnswers(updated);
  };

  const handleAnswerToggleCorrect = (index: number) => {
    if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
      const updated = answers.map((a, i) => ({
        ...a,
        is_correct: i === index,
      }));
      setAnswers(updated);
    } else if (questionType === 'MULTIPLE_CHOICE') {
      const updated = [...answers];
      updated[index].is_correct = !updated[index].is_correct;
      setAnswers(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!content.trim()) {
      setErrorMsg('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    if (questionType !== 'ESSAY') {
      const emptyAns = answers.some((a) => !a.content.trim());
      if (emptyAns) {
        setErrorMsg('Vui lòng nhập đầy đủ nội dung các lựa chọn đáp án');
        return;
      }
      const hasCorrect = answers.some((a) => a.is_correct);
      if (!hasCorrect) {
        setErrorMsg('Vui lòng chọn ít nhất 1 đáp án đúng');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: Question = {
        id: questionToEdit?.id || `qk-${Date.now()}`,
        bank_id: bankId,
        type: questionType,
        content: content.trim(),
        img_urls: imgUrls.length > 0 ? imgUrls : undefined,
        points: points || 1.0,
        answers: answers.map((a, i) => ({
          id: questionToEdit?.answers?.[i]?.id || `ans-${Date.now()}-${i}`,
          question_id: questionToEdit?.id || 'q-new',
          content: a.content.trim(),
          is_answer: a.is_correct,
          explain: i === 0 ? explain.trim() : undefined,
        })),
      };
      await onSave(payload);
      onClose();
    } catch {
      setErrorMsg('Có lỗi xảy ra khi lưu câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {questionToEdit ? 'Chỉnh Sửa Câu Hỏi' : 'Soạn Câu Hỏi Mới'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Soạn thảo câu hỏi trắc nghiệm hoặc tự luận linh hoạt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Chọn loại câu hỏi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Loại Câu Hỏi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'SINGLE_CHOICE', label: '1 Đáp án' },
                { type: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' },
                { type: 'TRUE_FALSE', label: 'Đúng / Sai' },
                { type: 'ESSAY', label: 'Tự luận' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => handleTypeChange(item.type as QuestionType)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    questionType === item.type
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nội dung câu hỏi & Điểm số */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Nội dung câu hỏi *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Điểm:</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="10"
                  value={points}
                  onChange={(e) => setPoints(parseFloat(e.target.value) || 1.0)}
                  className="w-16 px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg text-center font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi (hỗ trợ công thức $x^2 + y^2 = 1$ hoặc định dạng Markdown)..."
              className="w-full p-3 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-xs min-h-[120px]"
            />

            {/* Quản lý Hình ảnh minh họa */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Hình ảnh minh họa ({imgUrls.length})
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer transition-colors border border-purple-200 dark:border-purple-900">
                  <ImageIcon className="w-3.5 h-3.5" /> Tải ảnh từ máy
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </label>
              </div>

              {imgUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {imgUrls.map((url, imgIdx) => (
                    <div key={imgIdx} className="relative group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-1">
                      <img src={url} alt={`Hình minh họa ${imgIdx + 1}`} className="h-20 max-w-[180px] object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgIdx)}
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
          </div>

          {/* Danh sách đáp án (nếu không phải ESSAY) */}
          {questionType === 'ESSAY' ? (
            <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span>ℹ️ Chế độ Câu hỏi Tự luận</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Học sinh sẽ nhập câu trả lời dạng văn bản/đoạn văn trực tiếp. Các phương án lựa chọn A, B, C, D (nếu có) sẽ được tạm ẩn. Đổi lại Trắc nghiệm để mở lại danh sách lựa chọn.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Danh sách đáp án lựa chọn
                </label>
                <span className="text-xs text-slate-400">
                  {questionType === 'MULTIPLE_CHOICE'
                    ? 'Tích chọn 1 hoặc nhiều đáp án đúng'
                    : 'Tích chọn 1 đáp án đúng'}
                </span>
              </div>

              <div className="space-y-2.5">
                {answers.map((ans, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 border rounded-xl transition-all ${
                        ans.is_correct
                          ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/60'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleAnswerToggleCorrect(idx)}
                        className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                          ans.is_correct
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Tích để đánh dấu đáp án đúng"
                      >
                        {ans.is_correct ? <CheckCircle2 className="w-4 h-4" /> : letter}
                      </button>

                      <Input
                        value={ans.content}
                        onChange={(e) => handleAnswerContentChange(idx, e.target.value)}
                        placeholder={`Nội dung đáp án ${letter}...`}
                        disabled={questionType === 'TRUE_FALSE'}
                        className="flex-1 h-9 text-xs"
                      />

                      {questionType !== 'TRUE_FALSE' && answers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAnswer(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {questionType !== 'TRUE_FALSE' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswer}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="w-full mt-2 text-xs border-dashed"
                >
                  Thêm Lựa Chọn Đáp Án
                </Button>
              )}
            </div>
          )}

          {/* Lời giải / Explain */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Lời giải / Giải thích chi tiết (Explain)
            </label>
            <textarea
              rows={2}
              value={explain}
              onChange={(e) => setExplain(e.target.value)}
              placeholder="Nhập hướng dẫn giải hoặc lời giải chi tiết cho học sinh xem sau khi làm bài..."
              className="w-full p-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {questionToEdit ? 'Lưu Thay Đổi' : 'Thêm Câu Hỏi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
