'use client';

import * as React from 'react';
import { Question, ExamMatrixConfig, ExamVariant, ExamScopeMode } from '@/types/exam';
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
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  BookmarkCheck,
  Compass,
} from 'lucide-react';
import { generateExamsFromMatrix } from '@/services/exam-generator.service';
import { toast } from 'sonner';
import { MOCK_COURSES } from '@/services/mock/data';
import {
  AVAILABLE_SUBJECTS,
  GRADE_LEVELS,
  getChaptersForSubject,
} from '@/constants/curriculum';

interface ExamMatrixBuilderProps {
  questionPool: Question[];
  onSaveExams: (variants: ExamVariant[]) => void;
}

export function ExamMatrixBuilder({ questionPool, onSaveExams }: ExamMatrixBuilderProps) {
  // 1. Thông tin chung & Quy mô đề thi
  const [subject, setSubject] = React.useState<string>('Toán học');
  const [gradeLevel, setGradeLevel] = React.useState<string>('12');
  const [title, setTitle] = React.useState<string>('Đề Kiểm Tra Cuốn Chiếu - Chương 3 & Ôn Tập Cũ');
  const [totalQuestions, setTotalQuestions] = React.useState<number>(20);
  const [durationMinutes, setDurationMinutes] = React.useState<number>(45);
  const [passScore, setPassScore] = React.useState<number>(5.0);

  // Phân hạng tiếp cận & Khóa học gợi ý
  const [accessTier, setAccessTier] = React.useState<'FREE_TRIAL' | 'PRO'>('FREE_TRIAL');
  const [upsellCourseId, setUpsellCourseId] = React.useState<string>('NONE');

  // 2. Phạm vi kiến thức & Tỉ lệ Chương
  const [scopeMode, setScopeMode] = React.useState<ExamScopeMode>('CHAPTER_FOCUSED');
  const availableChapters = React.useMemo(
    () => getChaptersForSubject(subject, gradeLevel),
    [subject, gradeLevel]
  );

  // Chương trọng tâm (Chương mới)
  const [currentChapter, setCurrentChapter] = React.useState<string>(
    availableChapters[2] || availableChapters[0] || ''
  );
  // Bật/tắt phối hợp câu hỏi chương cũ
  const [includePreviousChapters, setIncludePreviousChapters] = React.useState<boolean>(true);
  // Các chương cũ được chọn để ôn tập cuốn chiếu
  const [previousChapters, setPreviousChapters] = React.useState<string[]>([
    availableChapters[0] || '',
    availableChapters[1] || '',
  ]);

  // Các chương được chọn cho kiểm tra học kỳ
  const [selectedSemesterChapters, setSelectedSemesterChapters] = React.useState<string[]>([
    availableChapters[0] || '',
    availableChapters[1] || '',
    availableChapters[2] || '',
  ]);

  // Tỉ lệ Chương trọng tâm vs Chương cũ
  const [currentChapterRatio, setCurrentChapterRatio] = React.useState<number>(70);
  const prevChapterRatio = 100 - currentChapterRatio;

  // 3. Tỉ lệ Bloom
  const [recRatio, setRecRatio] = React.useState<number>(40);
  const [undRatio, setUndRatio] = React.useState<number>(30);
  const [appRatio, setAppRatio] = React.useState<number>(20);
  const [advRatio, setAdvRatio] = React.useState<number>(10);

  // 4. Mã đề hoán vị
  const [variantCount, setVariantCount] = React.useState<2 | 4 | 8>(4);
  const [variantPrefix, setVariantPrefix] = React.useState<string>('10'); // 101-104 hoặc 201-204

  // Kết quả sinh đề
  const [generatedVariants, setGeneratedVariants] = React.useState<ExamVariant[]>([]);
  const [activeVariantCode, setActiveVariantCode] = React.useState<string>('101');

  // Tự động cập nhật danh sách chương khi đổi môn hoặc khối lớp
  React.useEffect(() => {
    const chapters = getChaptersForSubject(subject, gradeLevel);
    if (chapters.length > 0) {
      setCurrentChapter(chapters[2] || chapters[0]);
      setPreviousChapters(chapters.slice(0, 2));
      setSelectedSemesterChapters(chapters.slice(0, 3));
    }
  }, [subject, gradeLevel]);

  const bloomSum = recRatio + undRatio + appRatio + advRatio;
  const isBloomValid = bloomSum === 100;

  // Lọc số câu hỏi khả dụng theo môn học trong questionPool
  const availableCountForSubject = React.useMemo(() => {
    return questionPool.filter(
      (q) => !subject || q.subject?.toLowerCase().trim() === subject.toLowerCase().trim()
    ).length;
  }, [questionPool, subject]);

  const handleTogglePrevChapter = (ch: string) => {
    setPreviousChapters((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  const handleToggleSemesterChapter = (ch: string) => {
    setSelectedSemesterChapters((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  const handleGenerate = () => {
    if (!isBloomValid) {
      toast.error('Tổng tỉ lệ độ khó (Bloom) phải bằng đúng 100%!');
      return;
    }
    if (scopeMode === 'CHAPTER_FOCUSED' && !currentChapter) {
      toast.error('Vui lòng chọn Chương trọng tâm cần tạo đề!');
      return;
    }
    if (scopeMode === 'SEMESTER' && selectedSemesterChapters.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 chương học nằm trong phạm vi thi học kỳ!');
      return;
    }
    if (questionPool.length === 0) {
      toast.error('Ngân hàng câu hỏi của hệ thống đang trống!');
      return;
    }

    const config: ExamMatrixConfig = {
      title,
      subject,
      grade_level: gradeLevel,
      total_questions: totalQuestions,
      duration_minutes: durationMinutes,
      pass_score: passScore,
      scope_mode: scopeMode,
      current_chapter: currentChapter,
      previous_chapters: includePreviousChapters ? previousChapters : [],
      selected_chapters: selectedSemesterChapters,
      scope_ratio: {
        current_chapter: currentChapterRatio,
        previous_chapters: prevChapterRatio,
      },
      difficulty_ratio: {
        recognition: recRatio,
        understanding: undRatio,
        application: appRatio,
        advanced_application: advRatio,
      },
      variant_count: variantCount,
      variant_prefix: variantPrefix,
      access_tier: accessTier,
      upsell_course_id: upsellCourseId,
    };

    const variants = generateExamsFromMatrix(questionPool, config);
    setGeneratedVariants(variants);
    if (variants.length > 0) {
      setActiveVariantCode(variants[0].variant_code);
    }
    toast.success(`Đã sinh thành công ${variants.length} mã đề hoán vị theo đúng ma trận!`);
  };

  const handleSaveAll = () => {
    if (generatedVariants.length === 0) return;
    onSaveExams(generatedVariants);
  };

  const activeVariant =
    generatedVariants.find((v) => v.variant_code === activeVariantCode) ||
    generatedVariants[0];

  return (
    <div className="space-y-6">
      {/* 1. THÔNG TIN CHUNG & QUY MÔ ĐỀ THI */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            1. Thông Tin Chung & Quy Mô Đề Thi
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Tiêu đề đề thi */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tiêu đề đề thi / Bài kiểm tra:
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề đề thi..."
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          {/* Môn học Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Môn học:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-primary"
            >
              {AVAILABLE_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Khối lớp Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Khối lớp:
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-primary"
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

          {/* Tổng số câu */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tổng số câu hỏi:
            </label>
            <Input
              type="number"
              min={5}
              max={100}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 10)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          {/* Thời gian làm bài */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Thời gian làm bài (Phút):
            </label>
            <Input
              type="number"
              min={10}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          {/* Điểm đạt */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Điểm đạt (Pass score):
            </label>
            <Input
              type="number"
              step="0.5"
              min={1}
              max={10}
              value={passScore}
              onChange={(e) => setPassScore(parseFloat(e.target.value) || 5)}
              className="bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          {/* Phân hạng tiếp cận */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Phân hạng gói tiếp cận:
            </label>
            <select
              value={accessTier}
              onChange={(e) => setAccessTier(e.target.value as 'FREE_TRIAL' | 'PRO')}
              className="w-full h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary"
            >
              <option value="FREE_TRIAL">🎁 Khách thi thử (Free 3 lần/ngày)</option>
              <option value="PRO">⭐ Gói Rèn Luyện (Pro Member)</option>
            </select>
          </div>

          {/* Gợi ý khóa học liên quan */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Khóa học gợi ý liên quan cho học sinh sau khi làm bài:
            </label>
            <select
              value={upsellCourseId}
              onChange={(e) => setUpsellCourseId(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary"
            >
              <option value="NONE">-- Không gắn khóa học gợi ý --</option>
              {MOCK_COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} • GV: {c.teacher_name} ({c.price.toLocaleString('vi-VN')} đ)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Khóa học này sẽ hiển thị ở trang kết quả thi để học sinh tham khảo củng cố các lỗ hổng kiến thức.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. CẤU HÌNH PHẠM VI KIẾN THỨC & CHƯƠNG HỌC */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              2. Phạm Vi Kiến Thức & Tỉ Lệ Chương Học
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Xác định đề thi nhắm vào chuyên đề đang học, kiểm tra học kỳ, hay thi thử toàn diện.
            </p>
          </div>

          {/* 3 Tab chế độ */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setScopeMode('CHAPTER_FOCUSED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                scopeMode === 'CHAPTER_FOCUSED'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo Chương (Cuốn chiếu)
            </button>
            <button
              type="button"
              onClick={() => setScopeMode('SEMESTER')}
              className={`px-3 py-1 rounded-lg transition-all ${
                scopeMode === 'SEMESTER'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thi Học Kỳ
            </button>
            <button
              type="button"
              onClick={() => setScopeMode('NATIONAL_EXAM')}
              className={`px-3 py-1 rounded-lg transition-all ${
                scopeMode === 'NATIONAL_EXAM'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn Diện / THPT QG
            </button>
          </div>
        </div>

        {/* Nội dung theo từng chế độ */}
        {scopeMode === 'CHAPTER_FOCUSED' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chọn Chương trọng tâm */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  Chương trọng tâm (Chương mới đang học):
                </label>
                <select
                  value={currentChapter}
                  onChange={(e) => setCurrentChapter(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-primary shadow-2xs"
                >
                  {availableChapters.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Đây là kiến thức chính của bài kiểm tra, sẽ chiếm đa số điểm số.
                </p>
              </div>

              {/* Tỉ lệ phân bổ Cuốn chiếu */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Tỉ lệ phân bổ số câu:</span>
                  <span className="font-semibold text-primary">
                    {Math.round((totalQuestions * currentChapterRatio) / 100)} câu mới /{' '}
                    {totalQuestions - Math.round((totalQuestions * currentChapterRatio) / 100)} câu cũ
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Chương trọng tâm: <strong>{currentChapterRatio}%</strong></span>
                    <span>Chương cũ ôn tập: <strong>{prevChapterRatio}%</strong></span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    disabled={!includePreviousChapters}
                    value={includePreviousChapters ? currentChapterRatio : 100}
                    onChange={(e) => setCurrentChapterRatio(Number(e.target.value))}
                    className="w-full accent-primary disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Tùy chọn cuốn chiếu kiến thức các chương cũ */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePreviousChapters}
                    onChange={(e) => setIncludePreviousChapters(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    Kết hợp câu hỏi ôn tập các chương cũ đã học (Phương pháp cuốn chiếu)
                  </span>
                </label>
                <Badge variant="outline" className="text-[11px] bg-white text-slate-600">
                  {includePreviousChapters ? `${previousChapters.length} chương cũ được chọn` : 'Đã tắt'}
                </Badge>
              </div>

              {includePreviousChapters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                  {availableChapters
                    .filter((ch) => ch !== currentChapter)
                    .map((ch) => {
                      const isChecked = previousChapters.includes(ch);
                      return (
                        <label
                          key={ch}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-primary/5 border-primary/30 text-slate-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePrevChapter(ch)}
                            className="mt-0.5 rounded text-primary focus:ring-primary border-slate-300"
                          />
                          <span className="leading-snug">{ch}</span>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {scopeMode === 'SEMESTER' && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900">
              Chọn các chương học nằm trong phạm vi kiểm tra học kỳ:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {availableChapters.map((ch) => {
                const isChecked = selectedSemesterChapters.includes(ch);
                return (
                  <label
                    key={ch}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-primary/5 border-primary/30 text-slate-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSemesterChapter(ch)}
                      className="mt-0.5 rounded text-primary focus:ring-primary border-slate-300"
                    />
                    <span className="leading-snug">{ch}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {scopeMode === 'NATIONAL_EXAM' && (
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-600" />
              Chế độ Thi Thử Tốt Nghiệp THPT & Đánh Giá Năng Lực Toàn Diện
            </div>
            <p className="text-sky-700 leading-relaxed">
              Hệ thống sẽ tự động quét và phân bổ ngẫu nhiên câu hỏi từ tất cả các chuyên đề trong khối lớp {gradeLevel}{' '}
              để đảm bảo độ bao quát chuẩn theo cấu trúc khảo nghiệm của Bộ GD&ĐT.
            </p>
          </div>
        )}
      </Card>

      {/* 3. MA TRẬN BLOOM & 4. MÃ ĐỀ HOÁN VỊ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ma trận Bloom */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              3. Tỉ Lệ Độ Khó (Bloom's Taxonomy)
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

          {/* Progress bar trực quan */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
            <div style={{ width: `${recRatio}%` }} className="bg-emerald-500" title={`Nhận biết: ${recRatio}%`} />
            <div style={{ width: `${undRatio}%` }} className="bg-sky-500" title={`Thông hiểu: ${undRatio}%`} />
            <div style={{ width: `${appRatio}%` }} className="bg-amber-500" title={`Vận dụng: ${appRatio}%`} />
            <div style={{ width: `${advRatio}%` }} className="bg-rose-500" title={`Vận dụng cao: ${advRatio}%`} />
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-medium">
                <span>Nhận biết (Dễ)</span>
                <span className="font-bold text-slate-900">
                  {recRatio}% ({Math.round((totalQuestions * recRatio) / 100)} câu)
                </span>
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
                <span className="font-bold text-slate-900">
                  {undRatio}% ({Math.round((totalQuestions * undRatio) / 100)} câu)
                </span>
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
                <span className="font-bold text-slate-900">
                  {appRatio}% ({Math.round((totalQuestions * appRatio) / 100)} câu)
                </span>
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
                <span className="font-bold text-slate-900">
                  {advRatio}% ({Math.round((totalQuestions * advRatio) / 100)} câu)
                </span>
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

        {/* Cấu hình Mã đề hoán vị */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-600" />
              4. Cấu Hình Hoán Vị Mã Đề (Variants)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Chống gian lận</span>
          </div>

          {/* Hộp giải thích nghiệp vụ khảo thí */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-purple-950">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              Bản chất Khảo Thí & Chống Nhìn Bài:
            </div>
            <p className="text-[11px] leading-relaxed text-purple-800">
              Từ 1 bộ câu hỏi chuẩn theo ma trận, hệ thống sẽ tự động <strong>xáo trộn thứ tự các câu hỏi</strong>{' '}
              và <strong>đảo ngẫu nhiên 4 phương án A-B-C-D</strong> để tạo ra các mã đề khác nhau, kèm bảng đối soát
              đáp án chuẩn cho từng mã.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Chọn số lượng mã đề */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Số lượng mã đề cần sinh:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 4, 8] as const).map((count) => (
                  <Button
                    key={count}
                    type="button"
                    size="sm"
                    variant={variantCount === count ? 'default' : 'outline'}
                    onClick={() => setVariantCount(count)}
                    className={`text-xs shadow-xs font-semibold ${
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

            {/* Chọn dải tiền tố mã đề */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Dải đầu số mã đề:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { prefix: '10', label: 'Dải 10x (101, 102...)' },
                  { prefix: '20', label: 'Dải 20x (201, 202...)' },
                  { prefix: '30', label: 'Dải 30x (301, 302...)' },
                ].map((item) => (
                  <Button
                    key={item.prefix}
                    type="button"
                    size="sm"
                    variant={variantPrefix === item.prefix ? 'default' : 'outline'}
                    onClick={() => setVariantPrefix(item.prefix)}
                    className={`text-[11px] shadow-xs font-medium ${
                      variantPrefix === item.prefix
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* THANH KÍCH HOẠT SINH ĐỀ */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="text-xs text-slate-600">
          Môn <strong>{subject}</strong>: Khả dụng{' '}
          <strong className="text-slate-900 font-bold">{availableCountForSubject} câu hỏi</strong> trong hệ thống{' '}
          (Tổng toàn sàn: {questionPool.length} câu)
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!isBloomValid || questionPool.length === 0}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2 shadow-xs py-2 px-5"
        >
          <Wand2 className="w-4 h-4" />
          Sinh Ma Trận & Tạo {variantCount} Mã Đề Hoán Vị
        </Button>
      </Card>

      {/* HIỂN THỊ KẾT QUẢ CÁC MÃ ĐỀ ĐÃ SINH */}
      {generatedVariants.length > 0 && activeVariant && (
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Đã Sinh Thành Công {generatedVariants.length} Mã Đề Hoán Vị
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi mã đề có thứ tự câu hỏi và phương án A, B, C, D được xáo trộn độc lập.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.success(`Đã xuất bảng đối soát mã ${activeVariantCode} sang Excel!`)
                }
                className="text-xs gap-1 border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Xuất Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.success(`Đã xuất đề thi mã ${activeVariantCode} sang Word!`)
                }
                className="text-xs gap-1 border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Xuất Word
              </Button>
              <Button
                onClick={handleSaveAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" />
                Lưu Toàn Bộ Vào Hệ Thống
              </Button>
            </div>
          </div>

          {/* Selector mã đề */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Mã đề:</span>
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bảng Đối Soát Đáp Án Chuẩn (Answer Key) - Mã đề {activeVariant.variant_code}:
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Đã hoán vị độc lập so với đề gốc
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-1.5 text-xs font-mono">
                {Object.entries(activeVariant.answer_key).map(([qKey, ans]) => (
                  <div
                    key={qKey}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs"
                  >
                    <div className="text-[10px] text-slate-400">{qKey}</div>
                    <div className="font-bold text-primary mt-0.5">{String(ans)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách câu hỏi của mã đề đang chọn */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">
                Xem trước danh sách câu hỏi trong mã đề {activeVariant.variant_code} ({activeVariant.questions.length} câu):
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {activeVariant.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{q.title || `Câu ${idx + 1}`}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {q.chapter || 'Tổng hợp'}
                        </Badge>
                      </div>
                      <Badge className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                        {q.difficulty || 'UNDERSTANDING'}
                      </Badge>
                    </div>

                    <div className="text-slate-800 font-medium whitespace-pre-wrap">{q.content}</div>

                    {q.answers && q.answers.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                              ans.is_answer
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                ans.is_answer
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border text-slate-600'
                              }`}
                            >
                              {ans.label}
                            </span>
                            <span>{ans.content}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
