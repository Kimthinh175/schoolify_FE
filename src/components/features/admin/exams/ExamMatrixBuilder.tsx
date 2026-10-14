'use client';

import * as React from 'react';
import {
  Question,
  ExamMatrixConfig,
  ExamVariant,
  ExamScopeMode,
  ExamMatrixApiPayload,
} from '@/types/exam';
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
  Code2,
  Copy,
  Check,
  Send,
  Download,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import {
  generateExamsFromMatrix,
  buildExamMatrixApiPayload,
  sendExamMatrixToBackend,
} from '@/services/exam-generator.service';
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

  // 3. Phân bổ 4 danh mục câu hỏi (Chuẩn Bộ GD&ĐT 2025)
  const [mcqCount, setMcqCount] = React.useState<number>(10);
  const [tfCount, setTfCount] = React.useState<number>(4);
  const [saCount, setSaCount] = React.useState<number>(4);
  const [essayCount, setEssayCount] = React.useState<number>(2);

  // 4. Tỉ lệ Bloom
  const [recRatio, setRecRatio] = React.useState<number>(40);
  const [undRatio, setUndRatio] = React.useState<number>(30);
  const [appRatio, setAppRatio] = React.useState<number>(20);
  const [advRatio, setAdvRatio] = React.useState<number>(10);

  // 5. Mã đề hoán vị
  const [variantCount, setVariantCount] = React.useState<2 | 4 | 8>(4);
  const [variantPrefix, setVariantPrefix] = React.useState<string>('10'); // 101-104 hoặc 201-204

  // Trạng thái Payload Inspector & Gửi API
  const [showPayloadInspector, setShowPayloadInspector] = React.useState<boolean>(true);
  const [isSendingApi, setIsSendingApi] = React.useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = React.useState<boolean>(false);

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

  // Kiểm tra tính hợp lệ
  const categorySum = mcqCount + tfCount + saCount + essayCount;
  const isCategoryValid = categorySum === totalQuestions;

  const bloomSum = recRatio + undRatio + appRatio + advRatio;
  const isBloomValid = bloomSum === 100;

  // Tự động cân đối 4 danh mục theo preset
  const applyPreset = (preset: 'MOET_2025' | 'ONLY_MCQ' | 'MCQ_ESSAY' | 'COMPETENCY') => {
    if (preset === 'MOET_2025') {
      // 50% MCQ, 20% TF, 20% SA, 10% Essay
      const mcq = Math.round(totalQuestions * 0.5);
      const tf = Math.round(totalQuestions * 0.2);
      const sa = Math.round(totalQuestions * 0.2);
      const es = Math.max(0, totalQuestions - (mcq + tf + sa));
      setMcqCount(mcq);
      setTfCount(tf);
      setSaCount(sa);
      setEssayCount(es);
      toast.success('Đã áp dụng Preset: Cấu trúc toàn diện chuẩn Bộ GD&ĐT 2025 (4 Phần)');
    } else if (preset === 'ONLY_MCQ') {
      setMcqCount(totalQuestions);
      setTfCount(0);
      setSaCount(0);
      setEssayCount(0);
      toast.success('Đã áp dụng Preset: 100% Trắc nghiệm 4 lựa chọn');
    } else if (preset === 'MCQ_ESSAY') {
      const es = Math.max(1, Math.round(totalQuestions * 0.25));
      setMcqCount(totalQuestions - es);
      setTfCount(0);
      setSaCount(0);
      setEssayCount(es);
      toast.success('Đã áp dụng Preset: Kết hợp Trắc nghiệm & Tự luận');
    } else if (preset === 'COMPETENCY') {
      // Đánh giá năng lực: 60% MCQ, 20% TF, 20% SA
      const mcq = Math.round(totalQuestions * 0.6);
      const tf = Math.round(totalQuestions * 0.2);
      const sa = Math.max(0, totalQuestions - mcq - tf);
      setMcqCount(mcq);
      setTfCount(tf);
      setSaCount(sa);
      setEssayCount(0);
      toast.success('Đã áp dụng Preset: Đánh giá năng lực ĐHQG (3 Phần trắc nghiệm)');
    }
  };

  // Cân đối tự động số câu nếu lệch totalQuestions
  const handleAutoBalanceCategories = () => {
    applyPreset('MOET_2025');
  };

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

  // Compile real-time API Payload
  const currentConfig: ExamMatrixConfig = React.useMemo(() => ({
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
    category_distribution: {
      multiple_choice: mcqCount,
      true_false: tfCount,
      short_answer: saCount,
      essay: essayCount,
    },
    variant_count: variantCount,
    variant_prefix: variantPrefix,
    access_tier: accessTier,
    upsell_course_id: upsellCourseId,
  }), [
    title, subject, gradeLevel, totalQuestions, durationMinutes, passScore,
    scopeMode, currentChapter, includePreviousChapters, previousChapters,
    selectedSemesterChapters, currentChapterRatio, prevChapterRatio,
    recRatio, undRatio, appRatio, advRatio,
    mcqCount, tfCount, saCount, essayCount,
    variantCount, variantPrefix, accessTier, upsellCourseId
  ]);

  const apiPayload = React.useMemo<ExamMatrixApiPayload>(() => {
    return buildExamMatrixApiPayload(currentConfig);
  }, [currentConfig]);

  // Sao chép JSON Payload vào Clipboard
  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(apiPayload, null, 2));
    setCopiedPayload(true);
    toast.success('Đã sao chép ExamMatrixApiPayload vào Clipboard!');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Tải file JSON Payload
  const handleDownloadPayload = () => {
    const blob = new Blob([JSON.stringify(apiPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-matrix-payload-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã tải xuống file exam-matrix-payload.json!');
  };

  // Gửi API về Backend (POST /api/v1/exams/matrix-generate)
  const handleSendApiToBackend = async () => {
    if (!isBloomValid) {
      toast.error('Tổng tỉ lệ độ khó (Bloom) phải bằng đúng 100%!');
      return;
    }
    if (!isCategoryValid) {
      toast.error(`Tổng 4 danh mục câu hỏi (${categorySum}) phải bằng tổng số câu (${totalQuestions})! Hãy bấm "Cân đối tự động".`);
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

    setIsSendingApi(true);
    try {
      const result = await sendExamMatrixToBackend(apiPayload, questionPool);
      if (result.success && result.variants.length > 0) {
        setGeneratedVariants(result.variants);
        setActiveVariantCode(result.variants[0].variant_code);
        toast.success(result.message);
      } else {
        toast.error('Không thể sinh đề: ' + result.message);
      }
    } catch (err: any) {
      toast.error('Lỗi khi gửi API tạo đề: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSendingApi(false);
    }
  };

  // Sinh đề thử nghiệm trực tiếp ở Client
  const handleLocalGenerate = () => {
    if (!isBloomValid) {
      toast.error('Tổng tỉ lệ độ khó (Bloom) phải bằng đúng 100%!');
      return;
    }
    if (!isCategoryValid) {
      toast.error(`Tổng 4 danh mục câu hỏi (${categorySum}) phải bằng tổng số câu (${totalQuestions})!`);
      return;
    }
    const variants = generateExamsFromMatrix(questionPool, currentConfig);
    setGeneratedVariants(variants);
    if (variants.length > 0) {
      setActiveVariantCode(variants[0].variant_code);
    }
    toast.success(`Đã sinh nhanh ${variants.length} mã đề theo ma trận 4 danh mục!`);
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
              min={4}
              max={100}
              value={totalQuestions}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 10;
                setTotalQuestions(val);
              }}
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

      {/* 2. CẤU HÌNH 4 DANH MỤC CÂU HỎI (CHUẨN BỘ GD&ĐT 2025) */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              2. Phân Bổ 4 Danh Mục Câu Hỏi (Chuẩn Bộ GD&ĐT 2025)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cấu trúc theo chuẩn thi mới: Trắc nghiệm 4 lựa chọn, Đúng/Sai 4 ý, Trả lời ngắn, và Tự luận.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs font-semibold ${
                isCategoryValid
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              Tổng số câu: {categorySum} / {totalQuestions} {isCategoryValid ? '✓' : '(Lệch)'}
            </Badge>

            {!isCategoryValid && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAutoBalanceCategories}
                className="text-xs h-7 text-primary border-primary/30 hover:bg-primary/5"
              >
                Cân đối tự động
              </Button>
            )}
          </div>
        </div>

        {/* Nút chọn nhanh Preset */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Preset phân bổ mẫu:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('MOET_2025')}
              className="text-xs justify-start h-9 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              🎯 Chuẩn Bộ GD 2025
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('COMPETENCY')}
              className="text-xs justify-start h-9 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50"
            >
              📊 Đánh giá năng lực
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('MCQ_ESSAY')}
              className="text-xs justify-start h-9 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
            >
              📝 TN + Tự luận
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('ONLY_MCQ')}
              className="text-xs justify-start h-9 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
            >
              ⚡ 100% Trắc nghiệm
            </Button>
          </div>
        </div>

        {/* 4 Khối cấu hình số lượng cho 4 danh mục */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Phần I: MCQ */}
          <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-950">Phần I: Trắc nghiệm 4 lựa chọn</span>
              <Badge className="bg-sky-100 text-sky-800 text-[10px] border-sky-300">0.25 đ/câu</Badge>
            </div>
            <p className="text-[11px] text-sky-700 leading-snug">
              Chọn 1 đáp án đúng trong A, B, C, D
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min={0}
                max={totalQuestions}
                value={mcqCount}
                onChange={(e) => setMcqCount(parseInt(e.target.value) || 0)}
                className="bg-white border-sky-300 text-xs font-bold text-sky-900 h-8 text-center"
              />
              <span className="text-xs font-semibold text-sky-800 shrink-0">
                câu ({(mcqCount * 0.25).toFixed(2)} đ)
              </span>
            </div>
          </div>

          {/* Phần II: Đúng / Sai */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">Phần II: Đúng / Sai (4 ý)</span>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-emerald-300">1.0 đ/câu</Badge>
            </div>
            <p className="text-[11px] text-emerald-700 leading-snug">
              Lũy tiến: đúng 1 ý=0.1đ; 2 ý=0.25đ; 3 ý=0.5đ; 4 ý=1.0đ
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min={0}
                max={totalQuestions}
                value={tfCount}
                onChange={(e) => setTfCount(parseInt(e.target.value) || 0)}
                className="bg-white border-emerald-300 text-xs font-bold text-emerald-900 h-8 text-center"
              />
              <span className="text-xs font-semibold text-emerald-800 shrink-0">
                câu ({(tfCount * 1.0).toFixed(2)} đ)
              </span>
            </div>
          </div>

          {/* Phần III: Trả lời ngắn */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">Phần III: Trả lời ngắn</span>
              <Badge className="bg-amber-100 text-amber-800 text-[10px] border-amber-300">0.5 đ/câu</Badge>
            </div>
            <p className="text-[11px] text-amber-700 leading-snug">
              Điền số / kết quả ngắn trực tiếp vào ô trống
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min={0}
                max={totalQuestions}
                value={saCount}
                onChange={(e) => setSaCount(parseInt(e.target.value) || 0)}
                className="bg-white border-amber-300 text-xs font-bold text-amber-900 h-8 text-center"
              />
              <span className="text-xs font-semibold text-amber-800 shrink-0">
                câu ({(saCount * 0.5).toFixed(2)} đ)
              </span>
            </div>
          </div>

          {/* Phần IV: Tự luận */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950">Phần IV: Tự luận (Barem)</span>
              <Badge className="bg-purple-100 text-purple-800 text-[10px] border-purple-300">2.0 đ/câu</Badge>
            </div>
            <p className="text-[11px] text-purple-700 leading-snug">
              Trình bày tự luận chấm theo Barem rubric 4 bước
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min={0}
                max={totalQuestions}
                value={essayCount}
                onChange={(e) => setEssayCount(parseInt(e.target.value) || 0)}
                className="bg-white border-purple-300 text-xs font-bold text-purple-900 h-8 text-center"
              />
              <span className="text-xs font-semibold text-purple-800 shrink-0">
                câu ({(essayCount * 2.0).toFixed(2)} đ)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. CẤU HÌNH PHẠM VI KIẾN THỨC & CHƯƠNG HỌC */}
      <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              3. Phạm Vi Kiến Thức & Tỉ Lệ Chương Học
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

      {/* 4. MA TRẬN BLOOM & 5. MÃ ĐỀ HOÁN VỊ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ma trận Bloom */}
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              4. Tỉ Lệ Độ Khó (Bloom's Taxonomy)
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
              5. Cấu Hình Hoán Vị Mã Đề (Variants)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Chống gian lận</span>
          </div>

          {/* Hộp giải thích nghiệp vụ khảo thí */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-purple-950">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              Quy Chuẩn Hoán Vị Khảo Thí:
            </div>
            <p className="text-[11px] leading-relaxed text-purple-800">
              Hệ thống xáo trộn câu hỏi <strong>độc lập trong từng Phần</strong> (Phần I, II, III, IV), đồng thời đảo 4 phương án A-B-C-D của câu hỏi trắc nghiệm, tạo bảng đối soát đáp án chính xác cho từng mã đề.
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

      {/* 6. THU THẬP PAYLOAD GỬI API CHO BACKEND (PAYLOAD INSPECTOR) */}
      <Card className="p-5 sm:p-6 bg-slate-900 border border-slate-800 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/20 text-primary-300">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Thu Thập Payload Gửi API Về Cho Backend (BE API Inspector)
                </h3>
                <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]">
                  POST /api/v1/exams/matrix-generate
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cấu trúc JSON Payload chuẩn hóa ma trận 4 danh mục và phân bổ Bloom gửi về máy chủ Backend.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyPayload}
              className="text-xs gap-1.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              {copiedPayload ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Đã chép!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  Sao chép JSON
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownloadPayload}
              className="text-xs gap-1.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              Tải JSON
            </Button>
          </div>
        </div>

        {/* Khung JSON Preview Syntax Highlighted */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-56 select-all leading-relaxed">
            {JSON.stringify(apiPayload, null, 2)}
          </pre>
          <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">
            {new TextEncoder().encode(JSON.stringify(apiPayload)).length} bytes
          </div>
        </div>

        {/* Action Buttons: Gửi API Backend hoặc Sinh Nhanh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Môn <strong>{subject}</strong>: Khả dụng{' '}
            <strong className="text-white font-bold">{availableCountForSubject} câu hỏi</strong> trong hệ thống{' '}
            (Tổng kho toàn sàn: {questionPool.length} câu)
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleLocalGenerate}
              disabled={!isBloomValid || !isCategoryValid}
              className="text-xs font-semibold bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white gap-1.5"
            >
              <Wand2 className="w-4 h-4 text-amber-400" />
              Thử Nghiệm Local
            </Button>

            <Button
              type="button"
              onClick={handleSendApiToBackend}
              disabled={isSendingApi || !isBloomValid || !isCategoryValid}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 shadow-lg shadow-indigo-600/30 py-2.5 px-6"
            >
              <Send className="w-4 h-4" />
              {isSendingApi ? 'Đang gửi API về Backend...' : `Gửi API Tạo Đề Về Backend (${variantCount} Mã Đề)`}
            </Button>
          </div>
        </div>
      </Card>

      {/* HIỂN THỊ KẾT QUẢ CÁC MÃ ĐỀ ĐÃ SINH */}
      {generatedVariants.length > 0 && activeVariant && (
        <Card className="p-5 sm:p-6 bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                Đã Khởi Tạo Thành Công {generatedVariants.length} Mã Đề Theo Ma Trận Chuẩn 4 Danh Mục
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đề thi được cấu trúc thành 4 Phần phân tách chuẩn Bộ GD&ĐT 2025: Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn, và Tự luận.
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

          {/* Tóm tắt 4 phần của mã đề hiện tại */}
          {activeVariant.parts && activeVariant.parts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeVariant.parts.map((p) => (
                <div
                  key={p.part_number}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 truncate">{p.title}</div>
                  <div className="text-[11px] text-slate-500">
                    Số lượng: <strong className="text-slate-900">{p.questions.length} câu</strong>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    Tổng điểm: {p.total_points} đ ({p.points_per_question} đ/câu)
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4 mt-3">
            {/* Bảng Đáp án (Answer Key) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bảng Đối Soát Đáp Án Chuẩn (Answer Key) - Mã đề {activeVariant.variant_code}:
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Đã hoán vị độc lập trong từng phần
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-xs font-mono">
                {Object.entries(activeVariant.answer_key).map(([qKey, ans]) => (
                  <div
                    key={qKey}
                    className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-0.5"
                  >
                    <div className="text-[10px] text-slate-400 font-sans font-semibold">{qKey}</div>
                    <div className="font-bold text-primary text-[11px] truncate" title={String(ans)}>
                      {String(ans)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách câu hỏi của mã đề đang chọn phân theo 4 Phần */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">
                Xem trước danh sách câu hỏi trong mã đề {activeVariant.variant_code} ({activeVariant.questions.length} câu):
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {activeVariant.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-2.5 shadow-2xs"
                  >
                    {/* Header câu hỏi */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{q.title || `Câu ${idx + 1}`}</span>
                        {q.section_title && (
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700">
                            {q.section_title.split('.')[0]}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {q.chapter || 'Tổng hợp'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                          {q.points} điểm
                        </Badge>
                        <Badge className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                          {q.difficulty || 'UNDERSTANDING'}
                        </Badge>
                      </div>
                    </div>

                    {/* Nội dung câu hỏi */}
                    <div className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {q.content}
                    </div>

                    {/* 1. Render Trắc nghiệm 4 lựa chọn */}
                    {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && q.answers && q.answers.length > 0 && (
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
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
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

                    {/* 2. Render Đúng / Sai (4 ý a, b, c, d) */}
                    {q.type === 'TRUE_FALSE' && q.statements && q.statements.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {q.statements.map((st) => (
                          <div
                            key={st.subId}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                                {st.subId}
                              </span>
                              <span className="text-slate-800">{st.statement}</span>
                            </div>
                            <Badge
                              className={`text-[10px] font-bold shrink-0 ${
                                st.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {st.isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Render Trả lời ngắn / Điền số */}
                    {q.type === 'FILL_BLANK' && (
                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between gap-3">
                        <span className="text-amber-900 font-semibold">Đáp số chuẩn học sinh cần điền:</span>
                        <span className="font-mono font-bold text-amber-950 bg-white px-2.5 py-1 rounded border border-amber-300">
                          {q.shortAnswerCorrect || q.answers?.[0]?.content || 'Chưa cấu hình'}
                        </span>
                      </div>
                    )}

                    {/* 4. Render Tự luận & Barem rubric */}
                    {q.type === 'ESSAY' && (
                      <div className="space-y-2 pt-1">
                        {q.gradingRubric && q.gradingRubric.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-200 text-xs space-y-1.5">
                            <span className="font-bold text-purple-950 block">Barem chấm điểm chi tiết (Rubric):</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.gradingRubric.map((r, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="p-1.5 rounded bg-white border border-purple-200 text-[11px] flex items-center justify-between"
                                >
                                  <span className="text-purple-900 font-medium">
                                    {r.step}: {r.detail}
                                  </span>
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] shrink-0 ml-1">
                                    +{r.point}đ
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.explain && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                            <strong>Hướng dẫn giải:</strong> {q.explain}
                          </div>
                        )}
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
