'use client';

import * as React from 'react';
import Link from 'next/link';
import { Question, DifficultyLevel } from '@/types/exam';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';
import { MOCK_QUESTION_BANK, ExamQuestion } from '@/services/mock/practice-flow-data';
import { questionBankService } from '@/services/question-bank.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { MathFormulaToolbar } from '@/components/features/admin/questions/MathFormulaToolbar';
import { MathRenderer } from '@/components/ui/math-renderer';
import {
  Plus,
  FileSpreadsheet,
  Search,
  Database,
  Trash2,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  ArrowLeft,
  Calculator,
  RotateCcw,
  Sparkles,
  Layers,
  Pencil,
  ImageIcon,
  UploadCloud,
  Save,
  AlertTriangle,
  Laptop,
} from 'lucide-react';
import { ImportGuidelineModal } from '@/components/features/admin/questions/ImportGuidelineModal';
import { BugReportsDialog } from '@/components/features/admin/questions/BugReportsDialog';
import { QuestionBugReport } from '@/components/features/student/practice/ReportQuestionModal';
import { questionReportService } from '@/services/question-report.service';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export function normalizeSubjectName(raw?: string | null): string {
  const s = (raw || '').trim();
  const lower = s.toLowerCase();
  if (lower === 'toán học' || lower === 'toán') return 'Toán Học';
  if (lower === 'vật lí' || lower === 'vật lý') return 'Vật Lý';
  if (lower === 'hóa học' || lower === 'hóa') return 'Hóa Học';
  if (lower === 'sinh học' || lower === 'sinh') return 'Sinh Học';
  if (lower === 'tiếng anh' || lower === 'anh') return 'Tiếng Anh';
  if (lower === 'lịch sử' || lower === 'sử') return 'Lịch Sử';
  if (lower === 'địa lí' || lower === 'địa lý' || lower === 'địa') return 'Địa Lý';
  if (lower === 'ngữ văn' || lower === 'văn') return 'Ngữ Văn';
  if (lower === 'tin học' || lower === 'tin') return 'Tin Học';
  if (lower === 'công nghệ') return 'Công Nghệ';
  if (lower === 'gdkt & pháp luật' || lower === 'giáo dục kinh tế & pháp luật' || lower === 'gdcd') return 'GDKT & Pháp Luật';
  if (lower === 'khoa học tự nhiên' || lower === 'khtn') return 'Khoa Học Tự Nhiên';
  return s;
}

export function formatQuestionTypeName(type?: string | null): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'Nhiều đáp án';
    case 'TRUE_FALSE':
      return 'Đúng / Sai';
    case 'SINGLE_CHOICE':
    default:
      return '1 đáp án';
  }
}

// Cấu hình môn học trọng tâm THPT (Cấp 3) - Tập trung TOÁN HỌC & TIN HỌC
const CORE_SUBJECT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; category: 'NATURAL'; isPriority: boolean }
> = {
  'Toán Học': {
    icon: Calculator,
    color: 'text-[#00B8DD]',
    bg: 'bg-slate-50 dark:bg-slate-800/80',
    border: 'border-slate-200/80 dark:border-slate-800',
    category: 'NATURAL',
    isPriority: true,
  },
  'Tin Học': {
    icon: Laptop,
    color: 'text-[#00B8DD]',
    bg: 'bg-slate-50 dark:bg-slate-800/80',
    border: 'border-slate-200/80 dark:border-slate-800',
    category: 'NATURAL',
    isPriority: true,
  },
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = React.useState<Question[]>(INITIAL_MASTER_QUESTIONS);
  const [viewMode, setViewMode] = React.useState<'SUBJECTS' | 'ALL_QUESTIONS'>('SUBJECTS');

  // Bộ lọc cho danh sách câu hỏi
  const [search, setSearch] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [selectedType, setSelectedType] = React.useState<string>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);

  // State chỉnh sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = React.useState<Question | null>(null);

  // Quản lý báo cáo sai sót từ học sinh
  const [bugReports, setBugReports] = React.useState<QuestionBugReport[]>([]);
  const [isBugReportsOpen, setIsBugReportsOpen] = React.useState(false);

  const loadBugReports = React.useCallback(async () => {
    try {
      const res = await questionReportService.fetchQuestionBugReports({ limit: 100 });
      setBugReports(res.items);
    } catch {
      // Giữ nguyên state hiện tại nếu mất kết nối tạm thời
    }
  }, []);

  // Khởi tạo và đọc báo cáo sai sót + câu hỏi từ PostgreSQL
  React.useEffect(() => {
    loadBugReports();

    // Tải câu hỏi từ PostgreSQL (GET /api/v1/exams/questions)
    questionBankService
      .fetchPostgresQuestions({ page: 1, limit: 1000 })
      .then((res) => {
        if (res.items.length > 0) {
          setQuestions((prev) => {
            const pgIds = new Set(res.items.map((q) => q.id));
            const remainingMock = prev.filter((q) => !pgIds.has(q.id));
            return [...res.items, ...remainingMock];
          });
        }
      })
      .catch(() => {});

    fetch('/api/db/generatedQuestions', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setQuestions((prev) => {
            const existingIds = new Set(prev.map((q) => q.id));
            const newItems = (json.data as Question[]).filter((q) => !existingIds.has(q.id));
            return [...newItems, ...prev];
          });
        }
      })
      .catch(() => {});
  }, [loadBugReports]);

  const handleResolveBugReport = async (reportId: string) => {
    const target = bugReports.find((r) => r.id === reportId);
    if (!target) return;
    const nextStatus = target.status === 'PENDING' ? 'RESOLVED' : 'PENDING';

    try {
      const updatedReport = await questionReportService.updateQuestionBugReportStatus(
        reportId,
        nextStatus,
      );
      setBugReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)));
      toast.success(
        nextStatus === 'RESOLVED'
          ? 'Đã đánh dấu báo cáo là đã xử lý!'
          : 'Đã mở lại báo cáo để kiểm tra thêm!',
      );
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái báo cáo.');
    }
  };

  const handleDeleteBugReport = async (reportId: string) => {
    try {
      await questionReportService.deleteQuestionBugReport(reportId);
      setBugReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success('Đã xóa báo cáo!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa báo cáo.');
    }
  };

  const convertExamQuestionToBankQuestion = (
    mockQ: ExamQuestion,
    fallbackSubject?: string,
  ): Question => {
    const diffMap: Record<string, DifficultyLevel> = {
      EASY: 'RECOGNITION',
      MEDIUM: 'UNDERSTANDING',
      HARD: 'APPLICATION',
      VERY_HARD: 'ADVANCED_APPLICATION',
    };
    const isTin = mockQ.id.startsWith('tin-');
    const resolvedSubject = normalizeSubjectName(
      mockQ.subjectName || fallbackSubject || (isTin ? 'Tin Học' : 'Toán Học'),
    );
    const mappedType: Question['type'] =
      mockQ.type === 'TRUE_FALSE' ||
      (Array.isArray(mockQ.statements) && mockQ.statements.length > 0)
        ? 'TRUE_FALSE'
        : 'SINGLE_CHOICE';

    const answers =
      mappedType === 'TRUE_FALSE' && Array.isArray(mockQ.statements)
        ? mockQ.statements.map((st, idx) => ({
            id: `${mockQ.id}-st-${st.subId || idx}`,
            question_id: mockQ.id,
            content: st.statement,
            is_answer: Boolean(st.isCorrect),
            explain: st.explanation || undefined,
            order_index: idx,
            label: st.subId || String.fromCharCode(97 + idx),
          }))
        : (mockQ.choices || []).map((ch, idx) => ({
            id: `${mockQ.id}-ch-${ch.key || idx}`,
            question_id: mockQ.id,
            content: ch.content,
            is_answer: mockQ.correctChoice === ch.key,
            order_index: idx,
            label: ch.key,
          }));

    return {
      id: mockQ.id,
      bank_id: 'bank-practice-mock',
      type: mappedType,
      title: mockQ.title || null,
      content: mockQ.content || '',
      points: mockQ.score || 0.25,
      explain: mockQ.explanation || '',
      subject: resolvedSubject,
      grade_level: String(mockQ.grade || 12) as '10' | '11' | '12',
      chapter: mockQ.topicTag || `Chương ${mockQ.chapterId || 1}`,
      difficulty: diffMap[mockQ.difficulty] || 'UNDERSTANDING',
      created_at: new Date().toISOString(),
      answers,
    };
  };

  const handleOpenEditFromReport = (questionId: string) => {
    // 1. Tìm trực tiếp theo ID trong ngân hàng hiện tại
    const targetQ = questions.find((q) => q.id === questionId);
    if (targetQ) {
      setEditingQuestion({ ...targetQ });
      return;
    }

    // 2. Nếu là ID phòng thi demo/fallback (vd: q-10, tin-q-01...), đối chiếu nội dung trong DB hoặc MOCK_QUESTION_BANK
    const matchedReport = bugReports.find((r) => r.questionId === questionId);
    const mockPracticeQ = MOCK_QUESTION_BANK.find((m) => m.id === questionId);

    const candidateSnippet = (
      matchedReport?.questionSnippet ||
      mockPracticeQ?.content ||
      ''
    )
      .trim()
      .toLowerCase()
      .slice(0, 60);

    if (candidateSnippet) {
      const byContent = questions.find((q) =>
        q.content.toLowerCase().includes(candidateSnippet),
      );
      if (byContent) {
        setEditingQuestion({ ...byContent });
        return;
      }
    }

    if (mockPracticeQ) {
      setEditingQuestion(
        convertExamQuestionToBankQuestion(mockPracticeQ, matchedReport?.subjectName),
      );
      toast.info(
        `Đang mở câu hỏi phòng thi mẫu (${questionId}). Khi bấm Lưu, hệ thống sẽ đồng bộ bản mới vào ngân hàng PostgreSQL.`,
      );
      return;
    }

    toast.info(`Mã câu hỏi ${questionId} không có trong danh sách ngân hàng.`);
  };

  const pendingBugReportsCount = bugReports.filter((r) => r.status === 'PENDING').length;

  // Tập trung dữ liệu Toán Học & Tin Học cấp 3 (Lớp 10, 11, 12)
  const focusedQuestions = React.useMemo(() => {
    return questions.filter((q) => {
      const sub = normalizeSubjectName(q.subject);
      const isFocusedSub = sub === 'Toán Học' || sub === 'Tin Học';
      const grade = String(q.grade_level || '12');
      const isHighSchool = grade === '10' || grade === '11' || grade === '12';
      return isFocusedSub && isHighSchool;
    });
  }, [questions]);

  // Thống kê tổng hợp cho 2 môn trọng tâm (Toán & Tin)
  const subjectStats = React.useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        total: number;
        chapters: Set<string>;
        recognition: number;
        understanding: number;
        application: number;
        advanced: number;
        category: 'NATURAL';
        isPriority: boolean;
      }
    >();

    Object.entries(CORE_SUBJECT_CONFIG).forEach(([sub, cfg]) => {
      map.set(sub, {
        name: sub,
        total: 0,
        chapters: new Set<string>(),
        recognition: 0,
        understanding: 0,
        application: 0,
        advanced: 0,
        category: cfg.category,
        isPriority: cfg.isPriority,
      });
    });

    focusedQuestions.forEach((q) => {
      const sub = normalizeSubjectName(q.subject);
      const entry = map.get(sub);
      if (!entry) return;
      entry.total += 1;
      if (q.chapter) entry.chapters.add(q.chapter);
      if (q.difficulty === 'RECOGNITION') entry.recognition += 1;
      else if (q.difficulty === 'UNDERSTANDING') entry.understanding += 1;
      else if (q.difficulty === 'APPLICATION') entry.application += 1;
      else if (q.difficulty === 'ADVANCED_APPLICATION') entry.advanced += 1;
    });

    return Array.from(map.values());
  }, [focusedQuestions]);

  const prioritySubjects = subjectStats;

  // Lọc câu hỏi: Chuẩn hóa 3 định dạng đề thi (SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE)
  const filteredQuestions = React.useMemo(() => {
    return focusedQuestions.filter((q) => {
      const matchSearch =
        q.content.toLowerCase().includes(search.toLowerCase()) ||
        (q.title && q.title.toLowerCase().includes(search.toLowerCase())) ||
        (q.chapter && q.chapter.toLowerCase().includes(search.toLowerCase())) ||
        (q.subject && q.subject.toLowerCase().includes(search.toLowerCase()));

      const matchSubject =
        selectedSubject === 'ALL' ||
        normalizeSubjectName(q.subject) === normalizeSubjectName(selectedSubject);
      const matchGrade =
        selectedGrade === 'ALL' || String(q.grade_level || '') === selectedGrade;
      const matchDiff =
        selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;

      const matchType =
        selectedType === 'ALL' ||
        q.type === selectedType ||
        (selectedType === 'SINGLE_CHOICE' && (q.type === 'SINGLE_CHOICE' || q.type === 'SHORT_ANSWER' || !q.type || q.type === 'ESSAY')) ||
        (selectedType === 'TRUE_FALSE' && q.type === 'TRUE_FALSE') ||
        (selectedType === 'MULTIPLE_CHOICE' && q.type === 'MULTIPLE_CHOICE');

      return matchSearch && matchSubject && matchGrade && matchDiff && matchType;
    });
  }, [focusedQuestions, search, selectedSubject, selectedGrade, selectedDifficulty, selectedType]);

  // Phân trang danh sách câu hỏi: 10 câu mỗi trang
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectSubjectFromHub = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setViewMode('ALL_QUESTIONS');
    setCurrentPage(1);
    setSearch('');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject('ALL');
    setViewMode('SUBJECTS');
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    questionBankService.deletePostgresQuestion(id).catch(() => {});
    toast.success('Đã xóa câu hỏi khỏi ngân hàng!');
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubject('ALL');
    setSelectedGrade('ALL');
    setSelectedDifficulty('ALL');
    setSelectedType('ALL');
    setCurrentPage(1);
  };

  const handleSaveEditedQuestion = async () => {
    if (!editingQuestion) return;

    if (!editingQuestion.content.trim()) {
      toast.error('Nội dung câu hỏi không được để trống!');
      return;
    }

    const existsInBank = questions.some((q) => q.id === editingQuestion.id);

    if (existsInBank) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q)),
      );
      questionBankService
        .updatePostgresQuestion(editingQuestion.id, editingQuestion)
        .catch(() => {});
      setEditingQuestion(null);
      toast.success('Đã lưu cập nhật câu hỏi thành công!');
    } else {
      const created = await questionBankService.createPostgresQuestion(editingQuestion);
      const savedQuestion = created || editingQuestion;
      setQuestions((prev) => [savedQuestion, ...prev]);
      setEditingQuestion(null);
      toast.success('Đã lưu câu hỏi mới vào ngân hàng thành công!');
    }
  };

  const isFiltered =
    search !== '' ||
    selectedSubject !== 'ALL' ||
    selectedGrade !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedType !== 'ALL';

  const mathQuestionsCount = focusedQuestions.filter((q) => normalizeSubjectName(q.subject) === 'Toán Học').length;
  const csQuestionsCount = focusedQuestions.filter((q) => normalizeSubjectName(q.subject) === 'Tin Học').length;

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      {/* 1. Header & Nút Thao Tác Chuẩn Schoolify Palette */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0 max-w-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-[#00B8DD] border border-cyan-200 dark:border-cyan-800/60">
              <Database className="w-3 h-3" />
              Ngân hàng câu hỏi THPT
            </span>
            <span className="text-xs text-slate-400">• Cấp 3 (Lớp 10 - 12)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kho Câu Hỏi & Ma Trận Đề
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Trọng tâm chuyên sâu 2 môn Toán học & Tin học cấp 3 (Lớp 10 - 12) • Chuẩn hóa 3 định dạng đề thi mới.
          </p>
        </div>

        {/* Nhóm nút thao tác: Phân 2 tầng cân đối, căn phải đồng bộ */}
        <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
          {/* Tầng 1: Công cụ hỗ trợ & Báo cáo */}
          <div className="flex flex-wrap items-center lg:justify-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBugReportsOpen(true);
                loadBugReports();
              }}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white gap-1.5 font-medium shadow-2xs relative cursor-pointer transition-colors"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${pendingBugReportsCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>Báo cáo từ HS</span>
              {pendingBugReportsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {pendingBugReportsCount}
                </span>
              )}
            </Button>

            <ImportGuidelineModal
              triggerText="Quy chuẩn & File mẫu"
              triggerClassName="h-8 px-2.5 text-xs rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white gap-1.5 font-medium shadow-2xs shrink-0 whitespace-nowrap cursor-pointer transition-colors"
            />

            <Link href="/admin/questions/import?mode=raw">
              <Button
                variant="outline"
                className="h-8 px-2.5 text-xs rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white gap-1.5 font-medium shadow-2xs cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                <span>Import Excel / Word</span>
              </Button>
            </Link>
          </div>

          {/* Tầng 2: Thao tác tạo mới & AI Quét đề */}
          <div className="flex flex-wrap items-center lg:justify-end gap-2">
            <Link href="/admin/questions/import?mode=ai-docx">
              <Button
                variant="outline"
                className="h-9 px-3.5 text-xs rounded-xl border border-[#00B8DD]/40 dark:border-[#00B8DD]/40 bg-cyan-50/50 dark:bg-cyan-950/30 text-[#009BBD] dark:text-[#00B8DD] hover:border-[#00B8DD] hover:bg-[#00B8DD]/10 gap-1.5 font-semibold shadow-2xs cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
                <span>AI Quét Đề (.DOCX)</span>
              </Button>
            </Link>

            <Link href="/admin/questions/create">
              <Button className="h-9 px-4 text-xs rounded-xl bg-[#00B8DD] hover:bg-[#009BBD] text-white gap-1.5 font-semibold shadow-xs cursor-pointer transition-all">
                <Plus className="w-3.5 h-3.5" />
                <span>Soạn câu hỏi mới</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Thẻ KPI Cốt Lõi (Modern Flat Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Tổng câu hỏi trong kho</span>
            <Database className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {focusedQuestions.length}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-[#00B8DD] font-bold">Toán: {mathQuestionsCount}</span>
              <span>•</span>
              <span className="text-[#00B8DD] font-bold">Tin: {csQuestionsCount}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Nhận biết (Dễ)</span>
            <span className="w-2 h-2 rounded-full bg-[#00B8DD]/35" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {focusedQuestions.filter((q) => q.difficulty === 'RECOGNITION').length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Câu hỏi cơ bản nhận biết</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Thông hiểu (TB)</span>
            <span className="w-2 h-2 rounded-full bg-[#00B8DD]/65" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {focusedQuestions.filter((q) => q.difficulty === 'UNDERSTANDING').length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Giải thích & suy luận logic</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Vận dụng & VDC</span>
            <span className="w-2 h-2 rounded-full bg-[#007491]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {
                focusedQuestions.filter((q) => q.difficulty === 'APPLICATION' ||
                    q.difficulty === 'ADVANCED_APPLICATION'
                ).length
              }
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Giải quyết bài toán thực tế</p>
          </div>
        </Card>
      </div>

      {/* 3. Thanh Chuyển Đổi Chế Độ Xem (Theo Môn Học vs Toàn Bộ Câu Hỏi) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('SUBJECTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'SUBJECTS'
                ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Theo Môn Học (Toán & Tin)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ALL_QUESTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'ALL_QUESTIONS'
                ? 'bg-white dark:bg-slate-900 text-[#00B8DD] shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Toàn Bộ Câu Hỏi ({focusedQuestions.length})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: SUBJECT HUB (TẬP TRUNG TOÁN & TIN TRƯỚC, BỔ TRỢ MỞ RỘNG) */}
      {/* ============================================================== */}
      {viewMode === 'SUBJECTS' && (
        <div className="space-y-6">
          {/* PHÂN KHU 1: 2 MÔN HỌC TRỌNG TÂM (TOÁN HỌC & TIN HỌC) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00B8DD]" />
                  Kho Môn Học Trọng Tâm THPT (Cấp 3)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tập trung chuyên sâu 2 môn Toán học & Tin học (Khối 10, 11, 12) theo 3 định dạng đề thi 2025.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prioritySubjects.map((sub) => {
                const isMath = sub.name === 'Toán Học';
                const IconComp = isMath ? Calculator : Laptop;
                const recPct = sub.total ? Math.round((sub.recognition / sub.total) * 100) : 0;
                const undPct = sub.total ? Math.round((sub.understanding / sub.total) * 100) : 0;
                const appPct = sub.total ? Math.round((sub.application / sub.total) * 100) : 0;
                const advPct = sub.total ? Math.round((sub.advanced / sub.total) * 100) : 0;

                return (
                  <Card
                    key={sub.name}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Header môn */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-[#00B8DD]">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                {sub.name}
                              </h3>
                              <Badge className="text-[10px] px-2 py-0 font-semibold border border-[#00B8DD]/20 bg-[#00B8DD]/10 text-[#00B8DD]">
                                Môn mũi nhọn
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {isMath
                                ? 'Khảo sát hàm số, Hình không gian, Tích phân & Xác suất (Lớp 10 - 12)'
                                : 'Thuật toán Python, CSDL SQL, Mạng máy tính & Code (Lớp 10 - 12)'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xl font-bold text-slate-900 dark:text-white block">
                            {sub.total}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {sub.chapters.size} chuyên đề
                          </span>
                        </div>
                      </div>

                      {/* Phân bố Bloom - Tinh gọn đồng nhất theo tông màu nhận diện */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Phân bố mức độ nhận thức
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {sub.total} câu hỏi trong kho
                          </span>
                        </div>

                        {/* Thanh đơn sắc tăng cấp độ đậm dần từ Nhận biết -> Vận dụng cao */}
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                          <div style={{ width: `${recPct}%` }} title={`Nhận biết: ${sub.recognition} (${recPct}%)`} className="bg-[#00B8DD]/25 h-full" />
                          <div style={{ width: `${undPct}%` }} title={`Thông hiểu: ${sub.understanding} (${undPct}%)`} className="bg-[#00B8DD]/55 h-full border-l border-white/60 dark:border-slate-900/60" />
                          <div style={{ width: `${appPct}%` }} title={`Vận dụng: ${sub.application} (${appPct}%)`} className="bg-[#00B8DD] h-full border-l border-white/60 dark:border-slate-900/60" />
                          <div style={{ width: `${advPct}%` }} title={`Vận dụng cao: ${sub.advanced} (${advPct}%)`} className="bg-[#007491] h-full border-l border-white/60 dark:border-slate-900/60" />
                        </div>

                        {/* Thẻ chỉ số trung tính kèm chấm nhận diện sắc độ đậm dần */}
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium inline-flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]/25" />
                              Nhận biết
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{sub.recognition}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium inline-flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]/55" />
                              Thông hiểu
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{sub.understanding}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium inline-flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD]" />
                              Vận dụng
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{sub.application}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg py-1.5 px-2 text-center">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium inline-flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#007491]" />
                              Vận dụng cao
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{sub.advanced}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động xem danh sách câu hỏi môn này */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Chuẩn cấu trúc đề thi 2025</span>
                      <Button
                        size="sm"
                        onClick={() => handleSelectSubjectFromHub(sub.name)}
                        className="text-xs font-semibold gap-1.5 cursor-pointer bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs"
                      >
                        <span>Vào ngân hàng {sub.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: FLAT ALL QUESTIONS LIST (CHUẨN 3 ĐỊNH DẠNG ĐỀ THI)      */}
      {/* ============================================================== */}
      {viewMode === 'ALL_QUESTIONS' && (
        <div className="space-y-4">
          {/* Lối tắt chọn nhanh môn mũi nhọn */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedSubject('ALL'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubject === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Tất cả ({focusedQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => { setSelectedSubject('Toán Học'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSubject === 'Toán Học'
                    ? 'bg-[#00B8DD] text-white font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Toán Học ({mathQuestionsCount})
              </button>
              <button
                type="button"
                onClick={() => { setSelectedSubject('Tin Học'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSubject === 'Tin Học'
                    ? 'bg-[#00B8DD] text-white font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Tin Học ({csQuestionsCount})
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleBackToSubjects}
              className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Về Subject Hub
            </Button>
          </div>

          {/* BỘ LỌC ĐA TIÊU CHÍ (CHỈ CÒN 3 ĐỊNH DẠNG ĐỀ) */}
          <Card className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
              {/* Ô tìm kiếm */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo nội dung, câu hỏi, chuyên đề..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#00B8DD]"
                />
              </div>

              {/* Nhóm select lọc */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 shrink-0">
                {/* 1. Lọc môn học */}
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-40"
                >
                  <option value="ALL">Tất cả (Toán & Tin)</option>
                  <option value="Toán Học">Toán Học</option>
                  <option value="Tin Học">Tin Học</option>
                </select>

                {/* 2. Lọc Khối lớp (Chỉ Cấp 3 THPT) */}
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-36"
                >
                  <option value="ALL">Tất cả khối THPT</option>
                  <option value="12">Lớp 12</option>
                  <option value="11">Lớp 11</option>
                  <option value="10">Lớp 10</option>
                </select>

                {/* 3. Lọc theo Mức độ nhận thức */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-36"
                >
                  <option value="ALL">Mọi mức độ</option>
                  <option value="RECOGNITION">Nhận biết</option>
                  <option value="UNDERSTANDING">Thông hiểu</option>
                  <option value="APPLICATION">Vận dụng</option>
                  <option value="ADVANCED_APPLICATION">Vận dụng cao</option>
                </select>

                {/* 4. Lọc theo Loại câu hỏi: CHỈ CÒN 3 LOẠI CHUẨN */}
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-48"
                >
                  <option value="ALL">Tất cả định dạng</option>
                  <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                  <option value="TRUE_FALSE">Đúng / Sai</option>
                </select>

                {/* Nút đặt lại */}
                {isFiltered && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="col-span-2 sm:col-span-4 lg:col-span-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1 h-9 px-2.5 shrink-0 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Danh Sách Câu Hỏi (10 câu/trang) */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs shadow-xs">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              paginatedQuestions.map((q, idx) => {
                const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                const isMath = normalizeSubjectName(q.subject) === 'Toán Học';
                const isCS = normalizeSubjectName(q.subject) === 'Tin Học';

                return (
                  <Card
                    key={q.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {q.title || `Câu ${displayIndex}`}
                        </span>
                        {q.subject && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              isMath
                                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-[#00B8DD] border-cyan-200 dark:border-cyan-800'
                                : isCS
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {normalizeSubjectName(q.subject)}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 font-semibold"
                        >
                          {formatQuestionTypeName(q.type)}
                        </Badge>
                        {q.chapter && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 font-normal"
                          >
                            {q.chapter}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 font-medium"
                        >
                          {q.difficulty === 'RECOGNITION'
                            ? 'Nhận biết'
                            : q.difficulty === 'UNDERSTANDING'
                              ? 'Thông hiểu'
                              : q.difficulty === 'APPLICATION'
                                ? 'Vận dụng'
                                : 'VDC'}
                        </Badge>
                      </div>

                      {/* Nhóm nút hành động: Nút Sửa + Xóa */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mr-1">
                          Điểm: <strong className="text-slate-800 dark:text-slate-200">{q.points ?? 0.25}</strong>
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuestion(JSON.parse(JSON.stringify(q)))}
                          className="h-7 text-xs px-2.5 gap-1.5 border-slate-200 dark:border-slate-700 hover:border-[#00B8DD] hover:text-[#00B8DD] font-medium bg-white dark:bg-slate-800 dark:text-slate-200"
                          title="Chỉnh sửa câu hỏi này"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Sửa</span>
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(q.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-7 h-7"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Nội dung câu hỏi (Render công thức KaTeX) */}
                    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-normal">
                      <MathRenderer content={q.content} />
                    </div>

                    {/* Ảnh minh họa nếu có */}
                    {q.image_url && (
                      <div className="pt-1">
                        <img
                          src={q.image_url}
                          alt="Minh họa câu hỏi"
                          className="max-h-48 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    )}

                    {/* Các phương án trả lời */}
                    {q.answers && q.answers.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.answers.map((ans) => {
                          const isTrueFalse = q.type === 'TRUE_FALSE';

                          return (
                            <div
                              key={ans.id}
                              className={`p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                                ans.is_answer
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  ans.is_answer
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {isTrueFalse ? (ans.is_answer ? 'Đ' : 'S') : ans.label || '•'}
                              </span>
                              <div className="truncate flex-1">
                                <MathRenderer content={ans.content} inline />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Lời giải chi tiết nếu có */}
                    {q.explain && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <span className="text-[#00B8DD] font-semibold">Lời giải: </span>
                        <MathRenderer content={q.explain} inline />
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Phân trang: Tự động hiển thị khi số lượng câu hỏi > 10 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredQuestions.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* MODAL CHỈNH SỬA CÂU HỎI TOÀN DIỆN */}
      {editingQuestion && (
        <Dialog
          isOpen={Boolean(editingQuestion)}
          onClose={() => setEditingQuestion(null)}
          title={
            <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Pencil className="w-4 h-4 text-[#00B8DD]" />
              Chỉnh Sửa Câu Hỏi - {editingQuestion.title || editingQuestion.id}
            </div>
          }
          description="Chỉnh sửa nội dung, công thức KaTeX, ảnh minh họa, các đáp án và lời giải chi tiết."
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingQuestion(null)}
                className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEditedQuestion}
                className="bg-[#00B8DD] hover:bg-[#009BBD] text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu thay đổi
              </Button>
            </div>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Phân loại & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {/* Môn học */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Môn học:</label>
                <select
                  value={normalizeSubjectName(editingQuestion.subject || 'Toán Học')}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, subject: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="Toán Học">Toán Học</option>
                  <option value="Tin Học">Tin Học</option>
                </select>
              </div>

              {/* Định dạng câu hỏi: CHỈ CÒN 3 LOẠI */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Định dạng:</label>
                <select
                  value={editingQuestion.type || 'SINGLE_CHOICE'}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, type: e.target.value as any })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="SINGLE_CHOICE">1 đáp án</option>
                  <option value="MULTIPLE_CHOICE">Nhiều đáp án</option>
                  <option value="TRUE_FALSE">Đúng / Sai</option>
                </select>
              </div>

              {/* Khối lớp (THPT) */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Khối lớp:</label>
                <select
                  value={String(editingQuestion.grade_level || '12')}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, grade_level: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="12">Lớp 12</option>
                  <option value="11">Lớp 11</option>
                  <option value="10">Lớp 10</option>
                </select>
              </div>

              {/* Mức độ nhận thức */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Mức độ nhận thức:</label>
                <select
                  value={editingQuestion.difficulty || 'UNDERSTANDING'}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      difficulty: e.target.value as DifficultyLevel,
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="RECOGNITION">Nhận biết</option>
                  <option value="UNDERSTANDING">Thông hiểu</option>
                  <option value="APPLICATION">Vận dụng</option>
                  <option value="ADVANCED_APPLICATION">Vận dụng cao</option>
                </select>
              </div>

              {/* Chương / Chuyên đề */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Chương / Chuyên đề:</label>
                <Input
                  value={editingQuestion.chapter || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, chapter: e.target.value })
                  }
                  placeholder="Ví dụ: Khảo sát hàm số"
                  className="h-8.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Điểm số */}
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Điểm số:</label>
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
                  className="h-8.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Nội dung câu hỏi + Thanh ký tự Toán */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white">Nội dung câu hỏi:</label>
                <span className="text-[11px] text-slate-400">
                  Công thức bọc trong <code className="text-[#00B8DD] font-bold">$...$</code>
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 font-sans"
              />
            </div>

            {/* Hình ảnh minh họa */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#00B8DD]" />
                  Ảnh minh họa cho câu hỏi:
                </span>
                {editingQuestion.image_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditingQuestion({ ...editingQuestion, image_url: undefined })
                    }
                    className="h-6 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa ảnh
                  </Button>
                )}
              </div>

              {editingQuestion.image_url ? (
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs whitespace-nowrap shrink-0">
                      <UploadCloud className="w-3.5 h-3.5 text-[#00B8DD]" />
                      Tải ảnh lên từ thiết bị
                    </span>
                  </label>

                  <Input
                    placeholder="Hoặc dán URL ảnh tại đây..."
                    className="h-8.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex-1 min-w-0"
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
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          ans.is_answer
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
                        className="h-8.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white flex-1 focus:bg-white dark:focus:bg-slate-900"
                        placeholder={`Nội dung phương án ${ans.label}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lời giải chi tiết */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Lời giải chi tiết:
                </label>
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ công thức Toán học <code className="text-[#00B8DD] font-bold">$...$</code>
                </span>
              </div>

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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 font-sans"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* Dialog Hộp Thư Báo Cáo Sai Sót Từ Học Sinh */}
      <BugReportsDialog
        isOpen={isBugReportsOpen}
        onClose={() => setIsBugReportsOpen(false)}
        reports={bugReports}
        onResolveReport={handleResolveBugReport}
        onDeleteReport={handleDeleteBugReport}
        onEditQuestion={handleOpenEditFromReport}
      />
    </div>
  );
}
