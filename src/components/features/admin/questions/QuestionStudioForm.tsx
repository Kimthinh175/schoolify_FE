'use client';

import * as React from 'react';
import { Question, QuestionType, DifficultyLevel, Answer } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Plus,
  Trash2,
  Sparkles,
  ImageIcon,
  UploadCloud,
  BookmarkCheck,
  FolderPlus,
  RotateCcw,
} from 'lucide-react';
import { MathFormulaToolbar } from '@/components/features/admin/questions/MathFormulaToolbar';
import { toast } from 'sonner';
import {
  AVAILABLE_SUBJECTS,
  getChaptersForSubject,
} from '@/constants/curriculum';

interface QuestionStudioFormProps {
  initialQuestion?: Question;
  questionPool?: Question[];
  onSave: (question: Question) => void;
  onCancel?: () => void;
}

export function QuestionStudioForm({
  initialQuestion,
  questionPool = [],
  onSave,
  onCancel,
}: QuestionStudioFormProps) {
  const [type, setType] = React.useState<QuestionType>(
    initialQuestion?.type || 'SINGLE_CHOICE'
  );
  const [title, setTitle] = React.useState(initialQuestion?.title || 'Câu hỏi mới');
  const [content, setContent] = React.useState(initialQuestion?.content || '');
  const [imageUrl, setImageUrl] = React.useState<string | null>(
    initialQuestion?.image_url || null
  );
  const [difficulty, setDifficulty] = React.useState<DifficultyLevel>(
    initialQuestion?.difficulty || 'UNDERSTANDING'
  );
  const [subject, setSubject] = React.useState(initialQuestion?.subject || 'Toán học');
  const [gradeLevel, setGradeLevel] = React.useState(
    String(initialQuestion?.grade_level || '12')
  );

  // Quản lý Chương / Chuyên đề: Có sẵn vs Tạo mới
  const [isCreatingNewChapter, setIsCreatingNewChapter] = React.useState(false);
  const [customChapterName, setCustomChapterName] = React.useState('');
  const [chapter, setChapter] = React.useState(
    initialQuestion?.chapter || 'Chương 1: Khảo sát hàm số & Ứng dụng đạo hàm'
  );

  const [points, setPoints] = React.useState(
    initialQuestion?.points !== undefined ? initialQuestion.points : 0.25
  );
  const [explain, setExplain] = React.useState(initialQuestion?.explain || '');

  // Danh sách đáp án cho Single/Multi Choice
  const [answers, setAnswers] = React.useState<Answer[]>(
    initialQuestion?.answers || [
      { id: '1', question_id: 'q', content: '', is_answer: true, label: 'A' },
      { id: '2', question_id: 'q', content: '', is_answer: false, label: 'B' },
      { id: '3', question_id: 'q', content: '', is_answer: false, label: 'C' },
      { id: '4', question_id: 'q', content: '', is_answer: false, label: 'D' },
    ]
  );

  // Mệnh đề Đúng/Sai
  const [tfStatements, setTfStatements] = React.useState([
    { id: '1', label: 'a', content: '', is_answer: true },
    { id: '2', label: 'b', content: '', is_answer: false },
    { id: '3', label: 'c', content: '', is_answer: true },
    { id: '4', label: 'd', content: '', is_answer: false },
  ]);

  // Fill blank answer
  const [fillAnswer, setFillAnswer] = React.useState(
    initialQuestion?.answers?.[0]?.content || ''
  );

  // 1. Trích xuất danh sách chương thực tế trong questionPool của Môn + Khối lớp này
  const poolChapters = React.useMemo(() => {
    const set = new Set<string>();
    questionPool.forEach((q) => {
      if (
        q.subject?.toLowerCase().trim() === subject.toLowerCase().trim() &&
        String(q.grade_level || '') === String(gradeLevel) &&
        q.chapter
      ) {
        set.add(q.chapter);
      }
    });
    return Array.from(set);
  }, [questionPool, subject, gradeLevel]);

  // 2. Thống kê số câu hỏi hiện có trong từng chương
  const countByChapter = React.useMemo(() => {
    const map: Record<string, number> = {};
    questionPool.forEach((q) => {
      if (
        q.subject?.toLowerCase().trim() === subject.toLowerCase().trim() &&
        String(q.grade_level || '') === String(gradeLevel) &&
        q.chapter
      ) {
        map[q.chapter] = (map[q.chapter] || 0) + 1;
      }
    });
    return map;
  }, [questionPool, subject, gradeLevel]);

  // 3. Kết hợp chương chuẩn khung GDPT + chương thực tế trong ngân hàng
  const combinedChapters = React.useMemo(() => {
    const curriculum = getChaptersForSubject(subject, gradeLevel);
    const set = new Set([...curriculum, ...poolChapters]);
    return Array.from(set);
  }, [subject, gradeLevel, poolChapters]);

  // Khi đổi Môn học hoặc Khối lớp -> cập nhật chương mặc định nếu không ở chế độ tạo mới
  React.useEffect(() => {
    if (!isCreatingNewChapter) {
      if (!combinedChapters.includes(chapter)) {
        setChapter(combinedChapters[0] || `Chương 1: Mở đầu môn ${subject} Lớp ${gradeLevel}`);
      }
    }
  }, [subject, gradeLevel, combinedChapters, isCreatingNewChapter, chapter]);

  const handleAddAnswer = () => {
    const nextLabel = String.fromCharCode(65 + answers.length);
    setAnswers([
      ...answers,
      {
        id: `ans_${Date.now()}`,
        question_id: 'q',
        content: '',
        is_answer: false,
        label: nextLabel,
      },
    ]);
  };

  const handleRemoveAnswer = (idx: number) => {
    if (answers.length <= 2) {
      toast.error('Cần ít nhất 2 phương án trả lời!');
      return;
    }
    const filtered = answers.filter((_, i) => i !== idx);
    const relabeled = filtered.map((a, i) => ({
      ...a,
      label: String.fromCharCode(65 + i),
    }));
    setAnswers(relabeled);
  };

  const handleToggleAnswer = (idx: number) => {
    if (type === 'SINGLE_CHOICE') {
      setAnswers(answers.map((a, i) => ({ ...a, is_answer: i === idx })));
    } else {
      setAnswers(
        answers.map((a, i) => (i === idx ? { ...a, is_answer: !a.is_answer } : a))
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    let finalChapter = chapter;
    if (isCreatingNewChapter) {
      if (!customChapterName.trim()) {
        toast.error('Vui lòng nhập tên chương mới cần tạo!');
        return;
      }
      finalChapter = customChapterName.trim();
    }

    let finalAnswers: Answer[] = [];

    if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
      const hasEmpty = answers.some((a) => !a.content.trim());
      if (hasEmpty) {
        toast.error('Vui lòng nhập đầy đủ nội dung các phương án!');
        return;
      }
      const hasCorrect = answers.some((a) => a.is_answer);
      if (!hasCorrect) {
        toast.error('Vui lòng chọn ít nhất 1 đáp án đúng!');
        return;
      }
      finalAnswers = answers;
    } else if (type === 'TRUE_FALSE') {
      finalAnswers = tfStatements.map((s) => ({
        id: s.id,
        question_id: 'q',
        content: s.content || `Mệnh đề ${s.label}`,
        is_answer: s.is_answer,
        label: s.label,
      }));
    } else if (type === 'FILL_BLANK') {
      if (!fillAnswer.trim()) {
        toast.error('Vui lòng nhập kết quả đáp án đúng!');
        return;
      }
      finalAnswers = [
        {
          id: 'fill_1',
          question_id: 'q',
          content: fillAnswer.trim(),
          is_answer: true,
        },
      ];
    }

    const newQuestion: Question = {
      id: initialQuestion?.id || `mst_q_${Date.now()}`,
      type,
      title,
      content,
      difficulty,
      subject,
      grade_level: gradeLevel,
      chapter: finalChapter,
      points: Number(points) || 0.25,
      answers: finalAnswers,
      explain: explain || undefined,
      image_url: imageUrl || undefined,
      created_at: new Date().toISOString(),
    };

    onSave(newQuestion);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Phân loại & Metadata */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Phân Loại & Cấu Hình Câu Hỏi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Loại câu hỏi */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Loại câu hỏi:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:bg-white font-medium"
            >
              <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án (Single Choice)</option>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án (Multi Choice)</option>
              <option value="TRUE_FALSE">Đúng / Sai 4 mệnh đề (Chuẩn 2025)</option>
              <option value="FILL_BLANK">Điền số / Trả lời ngắn</option>
              <option value="ESSAY">Tự luận (Barem điểm)</option>
              <option value="GROUP_QUESTIONS">Chùm câu hỏi / Ngữ liệu</option>
              <option value="MATCHING">Nối cặp tương ứng A - B</option>
              <option value="ORDERING">Sắp xếp theo thứ tự</option>
              <option value="CLOZE_DROPDOWN">Đục lỗ chọn từ (Inline)</option>
            </select>
          </div>

          {/* Mức độ Bloom */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mức độ nhận thức (Bloom):
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:bg-white font-medium"
            >
              <option value="RECOGNITION">Nhận biết (Dễ)</option>
              <option value="UNDERSTANDING">Thông hiểu (Trung bình)</option>
              <option value="APPLICATION">Vận dụng (Khá)</option>
              <option value="ADVANCED_APPLICATION">Vận dụng cao (Khó)</option>
            </select>
          </div>

          {/* Môn học Dropdown chuẩn */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Môn học:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:bg-white font-semibold"
            >
              {AVAILABLE_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Điểm số */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Điểm số mặc định:
            </label>
            <Input
              type="number"
              step="0.05"
              value={points}
              onChange={(e) => setPoints(parseFloat(e.target.value) || 0)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Khối lớp (1 - 12) & Quản lý Chương (Có sẵn / Tạo mới) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Khối lớp từ Lớp 1 đến Lớp 12 */}
          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Khối lớp (Lớp 1 - 12):
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:bg-white font-medium"
            >
              <optgroup label="THPT (Cấp 3)">
                <option value="12">Lớp 12</option>
                <option value="11">Lớp 11</option>
                <option value="10">Lớp 10</option>
              </optgroup>
              <optgroup label="THCS (Cấp 2)">
                <option value="9">Lớp 9</option>
                <option value="8">Lớp 8</option>
                <option value="7">Lớp 7</option>
                <option value="6">Lớp 6</option>
              </optgroup>
              <optgroup label="Tiểu học (Cấp 1)">
                <option value="5">Lớp 5</option>
                <option value="4">Lớp 4</option>
                <option value="3">Lớp 3</option>
                <option value="2">Lớp 2</option>
                <option value="1">Lớp 1</option>
              </optgroup>
            </select>
          </div>

          {/* Quản lý Chương / Chuyên đề: Chọn chương cũ hoặc Tạo chương mới */}
          <div className="sm:col-span-8">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Chương / Chuyên đề kiến thức:
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNewChapter(!isCreatingNewChapter);
                  if (!isCreatingNewChapter) {
                    setCustomChapterName('');
                  }
                }}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                {isCreatingNewChapter ? (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    Quay lại chọn chương có sẵn
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-3 h-3" />
                    ➕ Tạo chương mới cho môn này
                  </>
                )}
              </button>
            </div>

            {isCreatingNewChapter ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    value={customChapterName}
                    onChange={(e) => setCustomChapterName(e.target.value)}
                    placeholder="Ví dụ: Chương 8: Ôn tập hè và bồi dưỡng nâng cao..."
                    className="bg-primary/5 border-primary/30 text-xs text-slate-900 focus:bg-white focus:border-primary font-medium"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNewChapter(false);
                      setChapter(combinedChapters[0] || '');
                    }}
                    className="text-xs h-9 text-slate-500 border-slate-200 shrink-0"
                  >
                    Hủy
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                    ✨ Chương mới
                  </Badge>
                  <span>
                    Chương này sẽ được lưu vào hệ thống cho <strong>{subject}</strong> - Khối{' '}
                    <strong>{gradeLevel}</strong> để dùng cho các câu hỏi tiếp theo.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <select
                  value={chapter}
                  onChange={(e) => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setIsCreatingNewChapter(true);
                      setCustomChapterName('');
                    } else {
                      setChapter(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:bg-white font-medium shadow-2xs"
                >
                  {combinedChapters.map((ch) => {
                    const qCount = countByChapter[ch] || 0;
                    return (
                      <option key={ch} value={ch}>
                        {ch} {qCount > 0 ? `(${qCount} câu đã có trong kho)` : '(Chưa có câu nào)'}
                      </option>
                    );
                  })}
                  <option value="__CREATE_NEW__" className="text-primary font-bold">
                    ➕ [Tạo chương mới khác cho môn này...]
                  </option>
                </select>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                  <span className="flex items-center gap-1 truncate max-w-[70%]">
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Đang chọn: <strong>{chapter}</strong></span>
                  </span>
                  <span className="shrink-0 font-medium text-slate-600">
                    Kho hiện có: <strong>{countByChapter[chapter] || 0} câu</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Nội dung câu hỏi */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900">
            Nội dung câu hỏi:
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            Hỗ trợ công thức KaTeX đặt trong dấu <code className="text-primary font-bold bg-primary/10 px-1 rounded">$...$</code>
          </span>
        </div>

        {/* Thanh công cụ chèn công thức Toán học KaTeX */}
        <MathFormulaToolbar
          onInsert={(snippet) => {
            setContent((prev) => (prev ? `${prev} ${snippet}` : snippet));
          }}
          previewContent={content}
        />

        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung câu hỏi tại đây... Ví dụ: Cho hàm số $y = x^2$..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white font-sans"
        />

        {/* Khu vực đính kèm ảnh minh họa câu hỏi */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              Hình ảnh minh họa câu hỏi (nếu có):
            </span>
            {imageUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setImageUrl(null)}
                className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 px-2"
              >
                <Trash2 className="w-3 h-3" />
                Gỡ ảnh
              </Button>
            )}
          </div>

          {imageUrl ? (
            <div className="relative p-2 rounded-xl border border-slate-200 bg-slate-50/50 w-fit">
              <img
                src={imageUrl}
                alt="Minh họa câu hỏi"
                className="max-h-48 rounded-lg object-contain border border-slate-200 bg-white"
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                          setImageUrl(reader.result);
                          toast.success('Đã tải ảnh lên!');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors whitespace-nowrap shrink-0">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  Tải ảnh từ máy tính...
                </span>
              </label>

              <span className="text-xs text-slate-400 self-center shrink-0">hoặc dán URL:</span>

              <Input
                placeholder="https://example.com/hinh-anh.png"
                className="h-9 text-xs bg-slate-50 border-slate-200 focus:bg-white flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      setImageUrl(val);
                      toast.success('Đã gắn link ảnh!');
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val) {
                    setImageUrl(val);
                    toast.success('Đã gắn link ảnh!');
                  }
                }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Soạn thảo đáp án theo QuestionType */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Thiết Lập Đáp Án
        </h3>

        {(type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Click vào biểu tượng chữ cái (A, B, C, D) để đánh dấu đáp án đúng.
            </p>
            {answers.map((ans, idx) => (
              <div key={ans.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAnswer(idx)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    ans.is_answer
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {ans.label || String.fromCharCode(65 + idx)}
                </button>

                <Input
                  value={ans.content}
                  onChange={(e) => {
                    const newAns = [...answers];
                    newAns[idx].content = e.target.value;
                    setAnswers(newAns);
                  }}
                  placeholder={`Nội dung phương án ${ans.label}...`}
                  className="bg-slate-50 border-slate-200 text-xs text-slate-900 flex-1 focus:bg-white"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveAnswer(idx)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAnswer}
              className="text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm phương án
            </Button>
          </div>
        )}

        {type === 'TRUE_FALSE' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Nhập nội dung 4 mệnh đề a, b, c, d và chọn trạng thái Đúng / Sai cho từng mệnh đề:
            </p>
            {tfStatements.map((st, idx) => (
              <div key={st.id} className="flex items-center gap-3">
                <span className="font-bold text-xs text-slate-700 w-6">
                  {st.label})
                </span>
                <Input
                  value={st.content}
                  onChange={(e) => {
                    const updated = [...tfStatements];
                    updated[idx].content = e.target.value;
                    setTfStatements(updated);
                  }}
                  placeholder={`Nội dung mệnh đề ${st.label}...`}
                  className="bg-slate-50 border-slate-200 text-xs text-slate-900 flex-1 focus:bg-white"
                />
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={st.is_answer ? 'default' : 'outline'}
                    onClick={() => {
                      const updated = [...tfStatements];
                      updated[idx].is_answer = true;
                      setTfStatements(updated);
                    }}
                    className={`text-xs px-3 shadow-xs ${
                      st.is_answer
                        ? 'bg-emerald-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Đúng
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!st.is_answer ? 'destructive' : 'outline'}
                    onClick={() => {
                      const updated = [...tfStatements];
                      updated[idx].is_answer = false;
                      setTfStatements(updated);
                    }}
                    className="text-xs px-3 shadow-xs"
                  >
                    Sai
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'FILL_BLANK' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Kết quả đáp án đúng (Học sinh nhập đúng chuỗi này sẽ có điểm):
            </label>
            <Input
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
              placeholder="Ví dụ: 3.5 hoặc 42"
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 max-w-md focus:bg-white"
            />
          </div>
        )}

        {type === 'ESSAY' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Gợi ý đáp án mẫu / Barem chấm:
            </label>
            <textarea
              rows={3}
              value={explain}
              onChange={(e) => setExplain(e.target.value)}
              placeholder="Nhập tiêu chí chấm điểm tự luận..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
        )}
      </Card>

      {/* Lời giải chi tiết */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 block">
            Lời giải chi tiết (Hiển thị sau khi thi):
          </label>
          <span className="text-[11px] text-slate-400">
            Hỗ trợ công thức KaTeX <code className="text-primary font-bold">$...$</code>
          </span>
        </div>

        <MathFormulaToolbar
          label="Ký tự giải:"
          onInsert={(snippet) => {
            setExplain((prev) => (prev ? `${prev} ${snippet}` : snippet));
          }}
          previewContent={explain}
        />

        <textarea
          rows={3}
          value={explain}
          onChange={(e) => setExplain(e.target.value)}
          placeholder="Nhập hướng dẫn giải chi tiết cho học sinh..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary focus:bg-white font-sans"
        />
      </Card>

      {/* Nút hành động */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            Hủy bỏ
          </Button>
        )}
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 font-semibold shadow-xs"
        >
          <Save className="w-4 h-4" />
          Lưu vào Ngân hàng câu hỏi
        </Button>
      </div>
    </form>
  );
}
