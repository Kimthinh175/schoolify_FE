'use client';

import * as React from 'react';
import Link from 'next/link';
import { Question, DifficultyLevel } from '@/types/exam';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';
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
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Landmark,
  Compass,
  BookOpen,
  BookMarked,
  RotateCcw,
  Sparkles,
  Layers,
  Pencil,
  ImageIcon,
  UploadCloud,
  Save,
  AlertTriangle,
  Laptop,
  Wrench,
  Scale,
  Microscope,
} from 'lucide-react';
import { ImportGuidelineModal } from '@/components/features/admin/questions/ImportGuidelineModal';
import { BugReportsDialog } from '@/components/features/admin/questions/BugReportsDialog';
import { QuestionBugReport } from '@/components/features/student/practice/ReportQuestionModal';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const DEFAULT_BUG_REPORTS: QuestionBugReport[] = [
  {
    id: 'rep-init-01',
    questionId: 'mst-001',
    questionTitle: 'Câu 1: Cho hàm số y = f(x) liên tục trên đoạn [a; b]...',
    subjectName: 'Toán học',
    issueType: 'KATEX_ERROR',
    issueTypeLabel: 'Lỗi công thức KaTeX / Hiển thị',
    description: 'Biểu thức tích phân ở dòng 2 bị thiếu dx, đề nghị ban khảo thí bổ sung để học sinh không nhầm lẫn khi làm bài.',
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    studentName: 'Nguyễn Văn Minh (Lớp 12A1)',
    status: 'PENDING',
  },
  {
    id: 'rep-init-02',
    questionId: 'mst-005',
    questionTitle: 'Câu 5: Một con lắc lò xo dao động điều hòa với tần số f = 2 Hz...',
    subjectName: 'Vật lí',
    issueType: 'WRONG_ANSWER',
    issueTypeLabel: 'Sai đáp án chuẩn',
    description: 'Đáp án đúng phải là 4π rad/s thay vì 2π rad/s theo công thức tốc độ góc ω = 2πf.',
    reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    studentName: 'Trần Thị Thu Thảo',
    status: 'PENDING',
  },
  {
    id: 'rep-init-03',
    questionId: 'mst-008',
    questionTitle: 'Câu 8: Thủy phân hoàn toàn este X trong môi trường axit...',
    subjectName: 'Hóa học',
    issueType: 'TYPO_CONTENT',
    issueTypeLabel: 'Lỗi chính tả / Đề bài thiếu dữ kiện',
    description: 'Đề bài chưa ghi rõ nồng độ H2SO4 đặc và nhiệt độ đun hồi lưu phản ứng este hóa.',
    reportedAt: new Date(Date.now() - 86400000).toISOString(),
    studentName: 'Lê Hoàng Nam',
    status: 'RESOLVED',
  },
];

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

// Danh sách 12 môn học chuẩn K-12 GDPT 2018 cùng biểu tượng và màu nhận diện
const CORE_SUBJECT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; category: 'NATURAL' | 'SOCIAL' | 'LANGUAGE' }
> = {
  'Toán Học': {
    icon: Calculator,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    border: 'border-indigo-200 dark:border-indigo-800',
    category: 'NATURAL',
  },
  'Vật Lý': {
    icon: Atom,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    border: 'border-cyan-200 dark:border-cyan-800',
    category: 'NATURAL',
  },
  'Hóa Học': {
    icon: FlaskConical,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-200 dark:border-emerald-800',
    category: 'NATURAL',
  },
  'Sinh Học': {
    icon: Dna,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    border: 'border-teal-200 dark:border-teal-800',
    category: 'NATURAL',
  },
  'Tiếng Anh': {
    icon: Globe2,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/60',
    border: 'border-violet-200 dark:border-violet-800',
    category: 'LANGUAGE',
  },
  'Lịch Sử': {
    icon: Landmark,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-200 dark:border-amber-800',
    category: 'SOCIAL',
  },
  'Địa Lý': {
    icon: Compass,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    border: 'border-orange-200 dark:border-orange-800',
    category: 'SOCIAL',
  },
  'Ngữ Văn': {
    icon: BookOpen,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    border: 'border-rose-200 dark:border-rose-800',
    category: 'SOCIAL',
  },
  'GDKT & Pháp Luật': {
    icon: Scale,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    border: 'border-sky-200 dark:border-sky-800',
    category: 'SOCIAL',
  },
  'Tin Học': {
    icon: Laptop,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-200 dark:border-blue-800',
    category: 'NATURAL',
  },
  'Công Nghệ': {
    icon: Wrench,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-200 dark:border-amber-800',
    category: 'NATURAL',
  },
  'Khoa Học Tự Nhiên': {
    icon: Microscope,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    border: 'border-purple-200 dark:border-purple-800',
    category: 'NATURAL',
  },
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = React.useState<Question[]>(INITIAL_MASTER_QUESTIONS);
  const [viewMode, setViewMode] = React.useState<'SUBJECTS' | 'ALL_QUESTIONS'>('SUBJECTS');

  // Bộ lọc cho Subject Hub
  const [subjectSearch, setSubjectSearch] = React.useState('');
  const [subjectSort, setSubjectSort] = React.useState<'DEFAULT' | 'COUNT_DESC' | 'COUNT_ASC' | 'ALPHA'>('DEFAULT');

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

  // Khởi tạo và đọc báo cáo sai sót + câu hỏi AI mới sinh từ DB
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('schoolify_question_bug_reports');
      if (stored) {
        setBugReports(JSON.parse(stored));
      } else {
        localStorage.setItem('schoolify_question_bug_reports', JSON.stringify(DEFAULT_BUG_REPORTS));
        setBugReports(DEFAULT_BUG_REPORTS);
      }
    } catch {
      setBugReports(DEFAULT_BUG_REPORTS);
    }

    // 1. Tải toàn bộ câu hỏi từ PostgreSQL (GET /api/v1/exams/questions)
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
  }, []);

  const handleResolveBugReport = (reportId: string) => {
    setBugReports((prev) => {
      const updated = prev.map((r) =>
        r.id === reportId
          ? { ...r, status: (r.status === 'PENDING' ? 'RESOLVED' : 'PENDING') as 'PENDING' | 'RESOLVED' }
          : r
      );
      try {
        localStorage.setItem('schoolify_question_bug_reports', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    toast.success('Đã cập nhật trạng thái báo cáo!');
  };

  const handleDeleteBugReport = (reportId: string) => {
    setBugReports((prev) => {
      const updated = prev.filter((r) => r.id !== reportId);
      try {
        localStorage.setItem('schoolify_question_bug_reports', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    toast.success('Đã xóa báo cáo!');
  };

  const handleOpenEditFromReport = (questionId: string) => {
    const targetQ = questions.find((q) => q.id === questionId);
    if (targetQ) {
      setEditingQuestion({ ...targetQ });
    } else {
      toast.info(`Mã câu hỏi ${questionId} không có trong danh sách ngân hàng.`);
    }
  };

  const pendingBugReportsCount = bugReports.filter((r) => r.status === 'PENDING').length;

  // Thống kê tổng hợp theo Môn học
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
        category: 'NATURAL' | 'SOCIAL' | 'LANGUAGE' | 'OTHER';
      }
    >();

    // Khởi tạo các môn học cốt lõi
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
      });
    });

    // Thống kê từ dữ liệu câu hỏi thực tế
    questions.forEach((q) => {
      const sub = normalizeSubjectName(q.subject || 'Khác');
      if (!map.has(sub)) {
        map.set(sub, {
          name: sub,
          total: 0,
          chapters: new Set<string>(),
          recognition: 0,
          understanding: 0,
          application: 0,
          advanced: 0,
          category: 'OTHER',
        });
      }
      const entry = map.get(sub)!;
      entry.total += 1;
      if (q.chapter) entry.chapters.add(q.chapter);
      if (q.difficulty === 'RECOGNITION') entry.recognition += 1;
      else if (q.difficulty === 'UNDERSTANDING') entry.understanding += 1;
      else if (q.difficulty === 'APPLICATION') entry.application += 1;
      else if (q.difficulty === 'ADVANCED_APPLICATION') entry.advanced += 1;
    });

    return Array.from(map.values());
  }, [questions]);

  // Lọc và sắp xếp môn học trong Subject Hub
  const filteredSubjects = React.useMemo(() => {
    let result = subjectStats.filter((s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    // Sắp xếp
    if (subjectSort === 'COUNT_DESC') {
      result = [...result].sort((a, b) => b.total - a.total);
    } else if (subjectSort === 'COUNT_ASC') {
      result = [...result].sort((a, b) => a.total - b.total);
    } else if (subjectSort === 'ALPHA') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return result;
  }, [subjectStats, subjectSearch, subjectSort]);

  // Lọc câu hỏi trong chế độ Toàn bộ câu hỏi
  const filteredQuestions = questions.filter((q) => {
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
    const matchType = selectedType === 'ALL' || q.type === selectedType;

    return matchSearch && matchSubject && matchGrade && matchDiff && matchType;
  });

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

  const handleSaveEditedQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.content.trim()) {
      toast.error('Nội dung câu hỏi không được để trống!');
      return;
    }

    setQuestions((prev) =>
      prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))
    );

    questionBankService.updatePostgresQuestion(editingQuestion.id, editingQuestion).catch(() => {});
    setEditingQuestion(null);
    toast.success('Đã lưu cập nhật câu hỏi thành công!');
  };

  const isFiltered =
    search !== '' ||
    selectedSubject !== 'ALL' ||
    selectedGrade !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedType !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0 max-w-3xl">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
            <Database className="w-3.5 h-3.5 mr-1" />
            Master Question Bank
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ngân Hàng Câu Hỏi Gốc (Toàn Sàn)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kho dữ liệu trung tâm chuẩn hóa các câu hỏi theo môn học, mức độ nhận thức Bloom và chuyên đề kiến thức.
          </p>
        </div>

        {/* Nút thao tác nhanh trên desktop & laptop */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsBugReportsOpen(true)}
            className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 text-xs gap-1.5 font-semibold shadow-xs whitespace-nowrap relative"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Báo cáo từ HS
            {pendingBugReportsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {pendingBugReportsCount}
              </span>
            )}
          </Button>

          <ImportGuidelineModal triggerText="Hướng dẫn & File mẫu" />

          <Link href="/admin/questions/import?mode=ai-docx">
            <Button className="bg-[#00B8DD] hover:bg-[#00B8DD]/90 text-white text-xs gap-1.5 font-semibold shadow-xs">
              <Sparkles className="w-4 h-4" />
              AI Quét Đề (.DOCX) & Sinh Câu Hỏi
            </Button>
          </Link>

          <Link href="/admin/questions/import?mode=raw">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-medium shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel / Word
            </Button>
          </Link>

          <Link href="/admin/questions/create">
            <Button className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 font-semibold shadow-xs">
              <Plus className="w-4 h-4" />
              Soạn câu hỏi mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Thẻ Thống Kê Tổng Quan Hệ Thống */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng số câu hỏi</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{questions.length}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Nhận biết (Dễ)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {questions.filter((q) => q.difficulty === 'RECOGNITION').length}
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">Thông hiểu (TB)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {questions.filter((q) => q.difficulty === 'UNDERSTANDING').length}
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Vận dụng & VDC</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {
              questions.filter(
                (q) =>
                  q.difficulty === 'APPLICATION' ||
                  q.difficulty === 'ADVANCED_APPLICATION'
              ).length
            }
          </div>
        </Card>
      </div>

      {/* Chuyển Đổi Chế Độ Xem & Bộ Lọc Nâng Cao Cho Subject Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Toggle View Mode */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('SUBJECTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'SUBJECTS'
              ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Theo Môn Học ({subjectStats.length} môn)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ALL_QUESTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'ALL_QUESTIONS'
              ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Toàn Bộ Câu Hỏi ({questions.length})
          </button>
        </div>

        {/* Thanh Tìm Kiếm + Sắp Xếp Bên Phải (Dành cho Subject Hub) */}
        {viewMode === 'SUBJECTS' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {/* Ô tìm kiếm môn học (Mở rộng chiều dài trên desktop) */}
            <div className="relative w-full sm:w-72 md:w-80 lg:w-[380px] xl:w-[420px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên môn học..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="pl-9 w-full h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary"
              />
            </div>

            {/* Sắp xếp thông minh */}
            <select
              value={subjectSort}
              onChange={(e) => setSubjectSort(e.target.value as any)}
              className="h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-medium shrink-0"
            >
              <option value="DEFAULT">Sắp xếp: Mặc định</option>
              <option value="COUNT_DESC">Nhiều câu hỏi nhất</option>
              <option value="COUNT_ASC">Ít câu hỏi nhất</option>
              <option value="ALPHA">Tên môn A - Z</option>
            </select>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: SUBJECT HUB (DANH SÁCH CÁC MÔN HỌC & THỐNG KÊ CHI TIẾT) */}
      {/* ============================================================== */}
      {viewMode === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubjects.map((sub) => {
              const cfg = CORE_SUBJECT_CONFIG[sub.name] || {
                icon: BookMarked,
                color: 'text-slate-600 dark:text-slate-400',
                bg: 'bg-slate-50 dark:bg-slate-800/60',
                border: 'border-slate-200 dark:border-slate-700',
              };
              const IconComp = cfg.icon;
              const hasQuestions = sub.total > 0;

              // Tỉ lệ phần trăm Bloom
              const recPct = sub.total ? Math.round((sub.recognition / sub.total) * 100) : 0;
              const undPct = sub.total ? Math.round((sub.understanding / sub.total) * 100) : 0;
              const appPct = sub.total ? Math.round((sub.application / sub.total) * 100) : 0;
              const advPct = sub.total ? Math.round((sub.advanced / sub.total) * 100) : 0;

              return (
                <Card
                  key={sub.name}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/60 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Header môn học */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border} ${cfg.color} shadow-2xs`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary dark:group-hover:text-[#00B8DD] transition-colors">
                            {sub.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3" />
                            <span>{sub.chapters.size} chuyên đề</span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold px-2 py-0.5 shrink-0 ${hasQuestions
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                          }`}
                      >
                        {sub.total} câu
                      </Badge>
                    </div>

                    {/* Thanh phân bố độ khó nhận thức Bloom */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Phân bố Bloom:</span>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                          {hasQuestions ? `${sub.total} câu hỏi` : 'Chưa có dữ liệu'}
                        </span>
                      </div>

                      {/* Multi-segment Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                        {hasQuestions ? (
                          <>
                            <div
                              style={{ width: `${recPct}%` }}
                              title={`Nhận biết: ${sub.recognition} (${recPct}%)`}
                              className="bg-emerald-500 transition-all"
                            />
                            <div
                              style={{ width: `${undPct}%` }}
                              title={`Thông hiểu: ${sub.understanding} (${undPct}%)`}
                              className="bg-sky-500 transition-all"
                            />
                            <div
                              style={{ width: `${appPct}%` }}
                              title={`Vận dụng: ${sub.application} (${appPct}%)`}
                              className="bg-amber-500 transition-all"
                            />
                            <div
                              style={{ width: `${advPct}%` }}
                              title={`Vận dụng cao: ${sub.advanced} (${advPct}%)`}
                              className="bg-rose-500 transition-all"
                            />
                          </>
                        ) : (
                          <div className="w-full bg-slate-200/50 dark:bg-slate-800" />
                        )}
                      </div>

                      {/* Mini Legend */}
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
                        <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded px-1 py-0.5" title="Nhận biết">
                          NB: {sub.recognition}
                        </div>
                        <div className="bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded px-1 py-0.5" title="Thông hiểu">
                          TH: {sub.understanding}
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded px-1 py-0.5" title="Vận dụng">
                          VD: {sub.application}
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded px-1 py-0.5" title="Vận dụng cao">
                          VDC: {sub.advanced}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động xem danh sách câu hỏi môn này */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectSubjectFromHub(sub.name)}
                      className="w-full justify-between text-xs border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:text-[#00B8DD] hover:bg-primary/5 transition-all font-semibold group/btn"
                    >
                      <span>Vào kho câu hỏi</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-primary transition-all" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs shadow-xs">
              Không tìm thấy môn học nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: FLAT ALL QUESTIONS LIST (DANH SÁCH BỘ LỌC VÀ CÂU HỎI)  */}
      {/* ============================================================== */}
      {viewMode === 'ALL_QUESTIONS' && (
        <div className="space-y-4">
          {/* Breadcrumb quay lại khi đang lọc theo môn từ Hub */}
          {selectedSubject !== 'ALL' && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBackToSubjects}
                  className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Danh sách môn học
                </Button>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Môn đang chọn:{' '}
                  <strong className="text-primary font-bold">{selectedSubject}</strong> (
                  {filteredQuestions.length} câu)
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedSubject('ALL')}
                className="h-7 text-[11px] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              >
                Hiển thị tất cả môn
              </Button>
            </div>
          )}

          {/* BỘ LỌC ĐA TIÊU CHÍ (Nằm trên 1 hàng ngang ở Desktop) */}
          <Card className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
              {/* Ô tìm kiếm */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo nội dung, môn học, chương..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              {/* Nhóm select lọc */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 shrink-0">
                {/* Lọc môn học */}
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-36"
                >
                  <option value="ALL">Tất cả môn học</option>
                  {Object.keys(CORE_SUBJECT_CONFIG).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>

                {/* Lọc Khối lớp (1 - 12) */}
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-32"
                >
                  <option value="ALL">Mọi khối lớp</option>
                  <optgroup label="THPT">
                    <option value="12">Lớp 12</option>
                    <option value="11">Lớp 11</option>
                    <option value="10">Lớp 10</option>
                  </optgroup>
                  <optgroup label="THCS">
                    <option value="9">Lớp 9</option>
                    <option value="8">Lớp 8</option>
                    <option value="7">Lớp 7</option>
                    <option value="6">Lớp 6</option>
                  </optgroup>
                  <optgroup label="Tiểu học">
                    <option value="5">Lớp 5</option>
                    <option value="4">Lớp 4</option>
                    <option value="3">Lớp 3</option>
                    <option value="2">Lớp 2</option>
                    <option value="1">Lớp 1</option>
                  </optgroup>
                </select>

                {/* Lọc theo Độ khó */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-36"
                >
                  <option value="ALL">Mọi độ khó</option>
                  <option value="RECOGNITION">Nhận biết</option>
                  <option value="UNDERSTANDING">Thông hiểu</option>
                  <option value="APPLICATION">Vận dụng</option>
                  <option value="ADVANCED_APPLICATION">Vận dụng cao</option>
                </select>

                {/* Lọc theo Loại câu hỏi */}
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium lg:w-44"
                >
                  <option value="ALL">Mọi định dạng</option>
                  <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                  <option value="TRUE_FALSE">Đúng / Sai 2025</option>
                  <option value="FILL_BLANK">Điền khuyết / Điền số</option>
                  <option value="ESSAY">Tự luận</option>
                  <option value="GROUP_QUESTIONS">Chùm câu hỏi</option>
                  <option value="MATCHING">Nối cặp</option>
                  <option value="ORDERING">Sắp xếp</option>
                  <option value="CLOZE_DROPDOWN">Đục lỗ inline</option>
                </select>

                {/* Nút đặt lại */}
                {isFiltered && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="col-span-2 sm:col-span-3 lg:col-span-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1 h-9 px-2.5 shrink-0 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Danh Sách Câu Hỏi (Đã phân trang 10 câu/trang) */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs shadow-xs">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              paginatedQuestions.map((q, idx) => {
                const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

                return (
                  <Card
                    key={q.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {q.title || `Câu ${displayIndex}`}
                        </span>
                        {q.subject && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-medium"
                          >
                            {normalizeSubjectName(q.subject)}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium"
                        >
                          {q.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 font-medium"
                        >
                          {q.chapter || 'Chương chung'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 font-medium"
                        >
                          {q.difficulty}
                        </Badge>
                      </div>

                      {/* Nhóm nút hành động: Nút Sửa câu hỏi + Xóa */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mr-1">
                          Điểm: <strong className="text-slate-800 dark:text-slate-200">{q.points}</strong>
                        </span>

                        {/* NÚT CHỈNH SỬA CÂU HỎI TRỰC TIẾP */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuestion(JSON.parse(JSON.stringify(q)))}
                          className="h-7 text-xs px-2.5 gap-1.5 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary font-medium bg-white dark:bg-slate-800 dark:text-slate-200"
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
                        {q.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${ans.is_answer
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70'
                              }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${ans.is_answer
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                              {ans.label || '•'}
                            </span>
                            <div className="truncate flex-1">
                              <MathRenderer content={ans.content} inline />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lời giải chi tiết nếu có */}
                    {q.explain && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <span className="text-sky-700 dark:text-sky-400 font-semibold">Lời giải: </span>
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
              <Pencil className="w-4 h-4 text-primary" />
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
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Môn học:</label>
                <select
                  value={editingQuestion.subject || 'Toán học'}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, subject: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100"
                >
                  {Object.keys(CORE_SUBJECT_CONFIG).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Khối lớp:</label>
                <select
                  value={String(editingQuestion.grade_level || '12')}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, grade_level: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100"
                >
                  <optgroup label="THPT">
                    <option value="12">Lớp 12</option>
                    <option value="11">Lớp 11</option>
                    <option value="10">Lớp 10</option>
                  </optgroup>
                  <optgroup label="THCS">
                    <option value="9">Lớp 9</option>
                    <option value="8">Lớp 8</option>
                    <option value="7">Lớp 7</option>
                    <option value="6">Lớp 6</option>
                  </optgroup>
                  <optgroup label="Tiểu học">
                    <option value="5">Lớp 5</option>
                    <option value="4">Lớp 4</option>
                    <option value="3">Lớp 3</option>
                    <option value="2">Lớp 2</option>
                    <option value="1">Lớp 1</option>
                  </optgroup>
                </select>
              </div>

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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-sans"
              />
            </div>

            {/* Hình ảnh minh họa */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
                      <UploadCloud className="w-3.5 h-3.5 text-primary" />
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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${ans.is_answer
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

            {/* Lời giải chi tiết (Nâng cấp toàn diện với Toolbar Toán & Live Preview) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-sans"
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
