'use client';

import * as React from 'react';
import { Question, ExamMatrixConfig, ExamVariant } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Wand2,
  CheckCircle2,
  FileCheck2,
  Shuffle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { generateExamsFromMatrix } from '@/services/exam-generator.service';
import { toast } from 'sonner';

interface ExamMatrixBuilderProps {
  questionPool: Question[];
  onSaveExams: (variants: ExamVariant[]) => void;
}

export function ExamMatrixBuilder({ questionPool, onSaveExams }: ExamMatrixBuilderProps) {
  const [title, setTitle] = React.useState('Đề Khảo Sát Đánh Giá Năng Lực Toàn Nền Tảng');
  const [subject, setSubject] = React.useState('Toán học');
  const [gradeLevel, setGradeLevel] = React.useState('12');
  const [totalQuestions, setTotalQuestions] = React.useState(20);
  const [durationMinutes, setDurationMinutes] = React.useState(30);
  const [passScore, setPassScore] = React.useState(5.0);

  // Tỉ lệ Bloom
  const [recRatio, setRecRatio] = React.useState(40);
  const [undRatio, setUndRatio] = React.useState(30);
  const [appRatio, setAppRatio] = React.useState(20);
  const [advRatio, setAdvRatio] = React.useState(10);

  // Tỉ lệ Chương
  const [currentChapterRatio, setCurrentChapterRatio] = React.useState(70);
  const [prevChapterRatio, setPrevChapterRatio] = React.useState(30);

  // Số lượng mã đề
  const [variantCount, setVariantCount] = React.useState<2 | 4 | 8>(4);

  // Kết quả sinh đề
  const [generatedVariants, setGeneratedVariants] = React.useState<ExamVariant[]>([]);
  const [activeVariantCode, setActiveVariantCode] = React.useState<string>('101');

  const bloomSum = recRatio + undRatio + appRatio + advRatio;
  const isBloomValid = bloomSum === 100;

  const scopeSum = currentChapterRatio + prevChapterRatio;
  const isScopeValid = scopeSum === 100;

  const handleGenerate = () => {
    if (!isBloomValid) {
      toast.error('Tổng tỉ lệ độ khó (Bloom) phải bằng đúng 100%!');
      return;
    }
    if (!isScopeValid) {
      toast.error('Tổng tỉ lệ phạm vi chương học phải bằng đúng 100%!');
      return;
    }
    if (questionPool.length === 0) {
      toast.error('Ngân hàng câu hỏi đang trống!');
      return;
    }

    const config: ExamMatrixConfig = {
      title,
      subject,
      grade_level: gradeLevel,
      total_questions: totalQuestions,
      duration_minutes: durationMinutes,
      pass_score: passScore,
      difficulty_ratio: {
        recognition: recRatio,
        understanding: undRatio,
        application: appRatio,
        advanced_application: advRatio,
      },
      scope_ratio: {
        current_chapter: currentChapterRatio,
        previous_chapters: prevChapterRatio,
      },
      variant_count: variantCount,
    };

    const variants = generateExamsFromMatrix(questionPool, config);
    setGeneratedVariants(variants);
    if (variants.length > 0) {
      setActiveVariantCode(variants[0].variant_code);
    }
    toast.success(`Đã sinh thành công ${variants.length} mã đề thi ngẫu nhiên!`);
  };

  const handleSaveAll = () => {
    if (generatedVariants.length === 0) return;
    onSaveExams(generatedVariants);
    toast.success(`Đã lưu ${generatedVariants.length} mã đề thi vào hệ thống!`);
  };

  const activeVariant =
    generatedVariants.find((v) => v.variant_code === activeVariantCode) ||
    generatedVariants[0];

  return (
    <div className="space-y-6">
      {/* Cấu hình cơ bản của Đề thi */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Thông Tin Chung & Quy Mô Đề Thi
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tiêu đề bài kiểm tra / Đề thi:
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Môn học:</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tổng số câu hỏi:</label>
            <Input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 10)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Thời gian làm bài (Phút):
            </label>
            <Input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Điểm đạt (Pass score):</label>
            <Input
              type="number"
              step="0.5"
              value={passScore}
              onChange={(e) => setPassScore(parseFloat(e.target.value) || 5)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Ma trận Độ khó (Bloom Taxonomy) & Tỉ lệ Chương */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ma trận Bloom */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Tỉ Lệ Độ Khó (Bloom's Taxonomy)
            </h3>
            <Badge
              className={`text-xs font-semibold ${
                isBloomValid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              Tổng: {bloomSum}% {isBloomValid ? '✓' : '(Cần = 100%)'}
            </Badge>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Nhận biết (Dễ)</span>
                <span className="font-bold text-slate-900">{recRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={recRatio}
                onChange={(e) => setRecRatio(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Thông hiểu (Trung bình)</span>
                <span className="font-bold text-slate-900">{undRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={undRatio}
                onChange={(e) => setUndRatio(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Vận dụng (Khá)</span>
                <span className="font-bold text-slate-900">{appRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={appRatio}
                onChange={(e) => setAppRatio(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Vận dụng cao (Khó)</span>
                <span className="font-bold text-slate-900">{advRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={advRatio}
                onChange={(e) => setAdvRatio(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>
          </div>
        </Card>

        {/* Tỉ lệ Chương & Số lượng mã đề */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-600" />
              Tỉ Lệ Kiến Thức Cũ / Mới & Mã Đề
            </h3>
            <Badge
              className={`text-xs font-semibold ${
                isScopeValid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              Tổng: {scopeSum}% {isScopeValid ? '✓' : '(Cần = 100%)'}
            </Badge>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Chương học trọng tâm (Mới)</span>
                <span className="font-bold text-slate-900">{currentChapterRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentChapterRatio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentChapterRatio(val);
                  setPrevChapterRatio(100 - val);
                }}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Các chương học cũ (Ôn tập liên quan)</span>
                <span className="font-bold text-slate-900">{prevChapterRatio}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={prevChapterRatio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPrevChapterRatio(val);
                  setCurrentChapterRatio(100 - val);
                }}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Số lượng mã đề cần sinh (Variants):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 4, 8] as const).map((count) => (
                  <Button
                    key={count}
                    type="button"
                    size="sm"
                    variant={variantCount === count ? 'default' : 'outline'}
                    onClick={() => setVariantCount(count)}
                    className={`text-xs shadow-xs font-medium ${
                      variantCount === count
                        ? 'bg-primary text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {count} mã đề {count === 4 ? '(Chuẩn)' : ''}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Nút Kích hoạt Sinh Đề */}
      <Card className="flex items-center justify-between p-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="text-xs text-slate-600">
          Kho câu hỏi khả dụng: <strong className="text-slate-900 font-bold">{questionPool.length} câu</strong>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!isBloomValid || !isScopeValid || questionPool.length === 0}
          className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-2 shadow-xs"
        >
          <Wand2 className="w-4 h-4" />
          Sinh Ma Trận & Tạo {variantCount} Mã Đề
        </Button>
      </Card>

      {/* Hiển thị kết quả các mã đề đã sinh */}
      {generatedVariants.length > 0 && activeVariant && (
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Đã Sinh Thành Công {generatedVariants.length} Mã Đề
              </h3>
              <p className="text-xs text-slate-500">
                Mỗi mã đề có thứ tự câu hỏi và phương án A, B, C, D được xáo trộn độc lập.
              </p>
            </div>

            <Button
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-2 shadow-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu Toàn Bộ Mã Đề Vào Hệ Thống
            </Button>
          </div>

          {/* Selector mã đề */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {generatedVariants.map((v) => (
              <button
                key={v.variant_code}
                onClick={() => setActiveVariantCode(v.variant_code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  activeVariantCode === v.variant_code
                    ? 'bg-primary text-white shadow-primary/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Mã đề {v.variant_code}
              </button>
            ))}
          </div>

          <div className="space-y-4 mt-3">
            {/* Bảng Đáp án (Answer Key) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-amber-800">
                Bảng Đối Soát Đáp Án (Answer Key) - Mã đề {activeVariant.variant_code}:
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-1.5 text-xs font-mono">
                {Object.entries(activeVariant.answer_key).map(([k, val]) => (
                  <div
                    key={k}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs"
                  >
                    <span className="text-[10px] text-slate-500 block font-medium">{k}</span>
                    <span className="font-bold text-emerald-700">
                      {Array.isArray(val) ? val.join(',') : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách câu hỏi của mã đề */}
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {activeVariant.questions.map((q, idx) => (
                <div
                  key={q.id + '_' + idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {q.title || `Câu ${idx + 1}`}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-sky-700 bg-sky-50 border-sky-200 font-medium"
                    >
                      {q.difficulty}
                    </Badge>
                  </div>

                  <p className="text-slate-800 text-xs sm:text-sm">{q.content}</p>

                  {q.answers && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className={`p-2 rounded-lg flex items-center gap-2 text-xs transition-all ${
                            ans.is_answer
                              ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-300'
                              : 'bg-slate-50 text-slate-600 border border-slate-200/80'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              ans.is_answer
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {ans.label}
                          </span>
                          <span className="truncate">{ans.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
