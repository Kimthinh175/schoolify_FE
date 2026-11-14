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

export const BLOOM_DIFFICULTY_META: Record<
  string,
  {
    label: string;
    shortDesc: string;
    dotClass: string;
    barClass: string;
    badgeClass: string;
    cardBorderClass: string;
    textClass: string;
  }
> = {
  RECOGNITION: {
    label: 'Nhận biết',
    shortDesc: 'Mức độ Dễ • Nhớ & nhận diện kiến thức cơ bản',
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    cardBorderClass:
      'border-emerald-200/90 dark:border-emerald-800/70 bg-emerald-50/40 dark:bg-emerald-950/20',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  UNDERSTANDING: {
    label: 'Thông hiểu',
    shortDesc: 'Mức độ Trung bình • Hiểu bản chất & suy luận trực tiếp',
    dotClass: 'bg-sky-500',
    barClass: 'bg-sky-500',
    badgeClass:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    cardBorderClass:
      'border-sky-200/90 dark:border-sky-800/70 bg-sky-50/40 dark:bg-sky-950/20',
    textClass: 'text-sky-700 dark:text-sky-400',
  },
  APPLICATION: {
    label: 'Vận dụng',
    shortDesc: 'Mức độ Khá • Áp dụng công thức giải bài toán tổng hợp',
    dotClass: 'bg-amber-500',
    barClass: 'bg-amber-500',
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    cardBorderClass:
      'border-amber-200/90 dark:border-amber-800/70 bg-amber-50/40 dark:bg-amber-950/20',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  ADVANCED_APPLICATION: {
    label: 'Vận dụng cao',
    shortDesc: 'Mức độ Khó • Tư duy phân loại 9+ & bài toán thực tiễn',
    dotClass: 'bg-rose-500',
    barClass: 'bg-rose-500',
    badgeClass:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    cardBorderClass:
      'border-rose-200/90 dark:border-rose-800/70 bg-rose-50/40 dark:bg-rose-950/20',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: 'Trắc nghiệm 4 lựa chọn',
  MULTIPLE_CHOICE: 'Trắc nghiệm nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai (THPT 2025)',
  SHORT_ANSWER: 'Trả lời ngắn (Điền số)',
  FILL_BLANK: 'Điền khuyết / Điền số',
  ESSAY: 'Tự luận',
  GROUP_QUESTIONS: 'Chùm câu hỏi',
  MATCHING: 'Nối cặp',
  ORDERING: 'Sắp xếp thứ tự',
  CLOZE_DROPDOWN: 'Đục lỗ inline',
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = React.useState<Question[]>(INITIAL_MASTER_QUESTIONS);
  const [viewMode, setViewMode] = React.useState<'SUBJECTS' | 'ALL_QUESTIONS'>('SUBJECTS');

  // Bộ lọc cho Subject Hub
  const [subjectSearch, setSubjectSearch] = React.useState('');
  const [subjectSort, setSubjectSort] = React.useState<'DEFAULT' | 'COUNT_DESC' | 'COUNT_ASC' | 'ALPHA'>('DEFAULT');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = React.useState<
    'ALL' | 'NATURAL' | 'SOCIAL' | 'LANGUAGE' | 'HAS_DATA'
  >('ALL');

  // Bộ lọc cho danh sách câu hỏi
  const [search, setSearch] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('ALL');
  const [selectedChapter, setSelectedChapter] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [selectedType, setSelectedType] = React.useState<string>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [compactQuestionView, setCompactQuestionView] = React.useState(false);

  // State Thao tác hàng loạt (Bulk Actions)
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<string[]>([]);
  const [bulkDifficulty, setBulkDifficulty] = React.useState<DifficultyLevel>('UNDERSTANDING');
  const [bulkChapterInput, setBulkChapterInput] = React.useState<string>('');

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
      // Giữ danh sách hiện tại nếu mất kết nối tạm thời
    }
  }, []);

  // Khởi tạo và đọc báo cáo sai sót + câu hỏi từ PostgreSQL
  React.useEffect(() => {
    loadBugReports();

    // Tải toàn bộ câu hỏi từ PostgreSQL (GET /api/v1/exams/questions)
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
  }, [loadBugReports]);

  React.useEffect(() => {
    if (isBugReportsOpen) {
      loadBugReports();
    }
  }, [isBugReportsOpen, loadBugReports]);

  const handleResolveBugReport = async (reportId: string) => {
    const target = bugReports.find((r) => r.id === reportId);
    if (!target) return;
    const nextStatus: 'PENDING' | 'RESOLVED' =
      target.status === 'PENDING' ? 'RESOLVED' : 'PENDING';

    setBugReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r))
    );

    try {
      const updated = await questionReportService.updateQuestionBugReportStatus(
        reportId,
        nextStatus
      );
      setBugReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      toast.success('Đã cập nhật trạng thái báo cáo!');
    } catch (err: any) {
      setBugReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: target.status } : r))
      );
      toast.error(err?.message || 'Không thể cập nhật trạng thái báo cáo.');
    }
  };

  const handleDeleteBugReport = async (reportId: string) => {
    const snapshot = bugReports;
    setBugReports((prev) => prev.filter((r) => r.id !== reportId));

    try {
      await questionReportService.deleteQuestionBugReport(reportId);
      toast.success('Đã xóa báo cáo khỏi hệ thống!');
    } catch (err: any) {
      setBugReports(snapshot);
      toast.error(err?.message || 'Không thể xóa báo cáo.');
    }
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

  // Thống kê tổng hợp theo Môn học (bao gồm cả độ phủ định dạng THPT 2025)
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
        singleChoiceCount: number;
        trueFalseCount: number;
        shortOrEssayCount: number;
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
        singleChoiceCount: 0,
        trueFalseCount: 0,
        shortOrEssayCount: 0,
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
          singleChoiceCount: 0,
          trueFalseCount: 0,
          shortOrEssayCount: 0,
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

      if (q.type === 'TRUE_FALSE') entry.trueFalseCount += 1;
      else if (q.type === 'FILL_BLANK' || q.type === 'ESSAY') entry.shortOrEssayCount += 1;
      else entry.singleChoiceCount += 1;
    });

    return Array.from(map.values());
  }, [questions]);

  // Lọc và sắp xếp môn học trong Subject Hub
  const filteredSubjects = React.useMemo(() => {
    let result = subjectStats.filter((s) => {
      const matchName = s.name.toLowerCase().includes(subjectSearch.toLowerCase());
      if (!matchName) return false;
      if (subjectCategoryFilter === 'HAS_DATA') return s.total > 0;
      if (subjectCategoryFilter !== 'ALL') return s.category === subjectCategoryFilter;
      return true;
    });

    // Sắp xếp
    if (subjectSort === 'COUNT_DESC') {
      result = [...result].sort((a, b) => b.total - a.total);
    } else if (subjectSort === 'COUNT_ASC') {
      result = [...result].sort((a, b) => a.total - b.total);
    } else if (subjectSort === 'ALPHA') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return result;
  }, [subjectStats, subjectSearch, subjectSort, subjectCategoryFilter]);

  // Thống kê tổng hợp toàn sàn theo 4 mức độ Bloom để hiển thị trên Thanh Chú Giải Màu
  const globalBloomCounts = React.useMemo(() => {
    const total = questions.length;
    const rec = questions.filter((q) => q.difficulty === 'RECOGNITION').length;
    const und = questions.filter((q) => q.difficulty === 'UNDERSTANDING').length;
    const app = questions.filter((q) => q.difficulty === 'APPLICATION').length;
    const adv = questions.filter((q) => q.difficulty === 'ADVANCED_APPLICATION').length;
    const activeSubjects = subjectStats.filter((s) => s.total > 0).length;
    return {
      total,
      rec,
      und,
      app,
      adv,
      recPct: total ? Math.round((rec / total) * 100) : 0,
      undPct: total ? Math.round((und / total) * 100) : 0,
      appPct: total ? Math.round((app / total) * 100) : 0,
      advPct: total ? Math.round((adv / total) * 100) : 0,
      activeSubjects,
    };
  }, [questions, subjectStats]);

  // Cây thư mục Chương / Chuyên đề bên trái (theo môn & khối lớp đang chọn)
  const chapterTreeStats = React.useMemo(() => {
    const basePool = questions.filter((q) => {
      const matchSubject =
        selectedSubject === 'ALL' ||
        normalizeSubjectName(q.subject) === normalizeSubjectName(selectedSubject);
      const matchGrade =
        selectedGrade === 'ALL' || String(q.grade_level || '') === selectedGrade;
      return matchSubject && matchGrade;
    });

    const map = new Map<
      string,
      {
        chapter: string;
        total: number;
        rec: number;
        und: number;
        app: number;
        adv: number;
      }
    >();

    basePool.forEach((q) => {
      const ch = (q.chapter || 'Chương chung').trim();
      if (!map.has(ch)) {
        map.set(ch, { chapter: ch, total: 0, rec: 0, und: 0, app: 0, adv: 0 });
      }
      const item = map.get(ch)!;
      item.total += 1;
      if (q.difficulty === 'RECOGNITION') item.rec += 1;
      else if (q.difficulty === 'UNDERSTANDING') item.und += 1;
      else if (q.difficulty === 'APPLICATION') item.app += 1;
      else if (q.difficulty === 'ADVANCED_APPLICATION') item.adv += 1;
    });

    return {
      totalInPool: basePool.length,
      items: Array.from(map.values()).sort((a, b) => b.total - a.total),
    };
  }, [questions, selectedSubject, selectedGrade]);

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
    const matchChapter =
      selectedChapter === 'ALL' || (q.chapter || 'Chương chung').trim() === selectedChapter;
    const matchDiff =
      selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchType = selectedType === 'ALL' || q.type === selectedType;

    return (
      matchSearch &&
      matchSubject &&
      matchGrade &&
      matchChapter &&
      matchDiff &&
      matchType
    );
  });

  // Phân trang danh sách câu hỏi: 10 câu mỗi trang
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectSubjectFromHub = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setSelectedChapter('ALL');
    setSelectedQuestionIds([]);
    setViewMode('ALL_QUESTIONS');
    setCurrentPage(1);
    setSearch('');
  };

  const handleFilterByDifficultyLegend = (diffKey: string) => {
    if (selectedDifficulty === diffKey && viewMode === 'ALL_QUESTIONS') {
      setSelectedDifficulty('ALL');
    } else {
      setSelectedDifficulty(diffKey);
      setViewMode('ALL_QUESTIONS');
      setCurrentPage(1);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject('ALL');
    setSelectedChapter('ALL');
    setSelectedQuestionIds([]);
    setViewMode('SUBJECTS');
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
    questionBankService.deletePostgresQuestion(id).catch(() => {});
    toast.success('Đã xóa câu hỏi khỏi ngân hàng!');
  };

  // Thao tác hàng loạt (Bulk Actions)
  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllCurrentPageSelected =
    paginatedQuestions.length > 0 &&
    paginatedQuestions.every((q) => selectedQuestionIds.includes(q.id));

  const toggleSelectCurrentPage = () => {
    const pageIds = paginatedQuestions.map((q) => q.id);
    if (isAllCurrentPageSelected) {
      setSelectedQuestionIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkUpdateDifficulty = () => {
    if (selectedQuestionIds.length === 0) return;
    const idSet = new Set(selectedQuestionIds);
    const updatedList: Question[] = [];
    setQuestions((prev) =>
      prev.map((q) => {
        if (!idSet.has(q.id)) return q;
        const nextQ = { ...q, difficulty: bulkDifficulty };
        updatedList.push(nextQ);
        return nextQ;
      })
    );
    updatedList.forEach((q) => {
      questionBankService.updatePostgresQuestion(q.id, q).catch(() => {});
    });
    toast.success(
      `Đã cập nhật mức độ "${BLOOM_DIFFICULTY_META[bulkDifficulty]?.label || bulkDifficulty}" cho ${selectedQuestionIds.length} câu hỏi!`
    );
    setSelectedQuestionIds([]);
  };

  const handleBulkUpdateChapter = () => {
    const targetChapter = bulkChapterInput.trim();
    if (!targetChapter || selectedQuestionIds.length === 0) {
      toast.error('Vui lòng nhập tên Chương / Chuyên đề muốn áp dụng!');
      return;
    }
    const idSet = new Set(selectedQuestionIds);
    const updatedList: Question[] = [];
    setQuestions((prev) =>
      prev.map((q) => {
        if (!idSet.has(q.id)) return q;
        const nextQ = { ...q, chapter: targetChapter };
        updatedList.push(nextQ);
        return nextQ;
      })
    );
    updatedList.forEach((q) => {
      questionBankService.updatePostgresQuestion(q.id, q).catch(() => {});
    });
    toast.success(
      `Đã chuyển ${selectedQuestionIds.length} câu hỏi sang chuyên đề "${targetChapter}"!`
    );
    setBulkChapterInput('');
    setSelectedQuestionIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedQuestionIds.length === 0) return;
    const count = selectedQuestionIds.length;
    const idSet = new Set(selectedQuestionIds);
    setQuestions((prev) => prev.filter((q) => !idSet.has(q.id)));
    selectedQuestionIds.forEach((id) => {
      questionBankService.deletePostgresQuestion(id).catch(() => {});
    });
    setSelectedQuestionIds([]);
    toast.success(`Đã xóa ${count} câu hỏi đã chọn khỏi ngân hàng!`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubject('ALL');
    setSelectedGrade('ALL');
    setSelectedChapter('ALL');
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
    selectedChapter !== 'ALL' ||
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
            className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 text-xs gap-1.5 font-semibold shadow-xs relative"
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

      {/* KHUNG TỔNG QUAN & BẢNG CHÚ GIẢI MÀU SẮC THANG ĐO NHẬN THỨC BLOOM (DÙNG CHUNG CHO TOÀN TRANG) */}
      <Card
        data-testid="bloom-color-legend-banner"
        className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                  Tổng kho toàn sàn
                </div>
                <div className="text-xl font-black leading-tight">
                  {globalBloomCounts.total}{' '}
                  <span className="text-xs font-normal text-slate-300">câu hỏi</span>
                </div>
              </div>
              <div className="h-7 w-px bg-slate-700" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                  Độ phủ môn
                </div>
                <div className="text-sm font-bold text-[#00B8DD]">
                  {globalBloomCounts.activeSubjects}/{subjectStats.length} môn
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Bảng Chú Giải Màu Sắc Mức Độ Nhận Thức (Chuẩn GDPT 2018)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Màu sắc dưới đây được áp dụng thống nhất trên thanh phân bố của tất cả các môn học. Nhấn vào từng thẻ màu để lọc nhanh câu hỏi.
              </p>
            </div>
          </div>

          {/* Thanh tỷ lệ tổng quát toàn sàn */}
          <div className="w-full lg:w-64 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Tỷ lệ độ khó toàn sàn</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                {globalBloomCounts.recPct}% • {globalBloomCounts.undPct}% • {globalBloomCounts.appPct}% • {globalBloomCounts.advPct}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
              <div
                style={{ width: `${globalBloomCounts.recPct}%` }}
                className="bg-emerald-500 rounded-l-full transition-all"
                title={`Nhận biết: ${globalBloomCounts.rec} câu (${globalBloomCounts.recPct}%)`}
              />
              <div
                style={{ width: `${globalBloomCounts.undPct}%` }}
                className="bg-sky-500 transition-all"
                title={`Thông hiểu: ${globalBloomCounts.und} câu (${globalBloomCounts.undPct}%)`}
              />
              <div
                style={{ width: `${globalBloomCounts.appPct}%` }}
                className="bg-amber-500 transition-all"
                title={`Vận dụng: ${globalBloomCounts.app} câu (${globalBloomCounts.appPct}%)`}
              />
              <div
                style={{ width: `${globalBloomCounts.advPct}%` }}
                className="bg-rose-500 rounded-r-full transition-all"
                title={`Vận dụng cao: ${globalBloomCounts.adv} câu (${globalBloomCounts.advPct}%)`}
              />
            </div>
          </div>
        </div>

        {/* 4 Ô Giải Thích Màu Sắc (Click để lọc nhanh) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {[
            {
              key: 'RECOGNITION',
              count: globalBloomCounts.rec,
              pct: globalBloomCounts.recPct,
              ...BLOOM_DIFFICULTY_META.RECOGNITION,
            },
            {
              key: 'UNDERSTANDING',
              count: globalBloomCounts.und,
              pct: globalBloomCounts.undPct,
              ...BLOOM_DIFFICULTY_META.UNDERSTANDING,
            },
            {
              key: 'APPLICATION',
              count: globalBloomCounts.app,
              pct: globalBloomCounts.appPct,
              ...BLOOM_DIFFICULTY_META.APPLICATION,
            },
            {
              key: 'ADVANCED_APPLICATION',
              count: globalBloomCounts.adv,
              pct: globalBloomCounts.advPct,
              ...BLOOM_DIFFICULTY_META.ADVANCED_APPLICATION,
            },
          ].map((item) => {
            const isSelected =
              viewMode === 'ALL_QUESTIONS' && selectedDifficulty === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleFilterByDifficultyLegend(item.key)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${item.cardBorderClass} ${
                  isSelected
                    ? 'ring-2 ring-[#00B8DD] shadow-xs'
                    : 'hover:brightness-95 dark:hover:brightness-110'
                }`}
                title={`Nhấn để lọc câu hỏi mức độ ${item.label}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ring-4 ring-white/80 dark:ring-slate-900/80 ${item.dotClass}`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-extrabold ${item.textClass}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        {item.pct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    {item.count}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">câu</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Chuyển Đổi Chế Độ Xem & Bộ Lọc Nâng Cao Cho Subject Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle View Mode */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('SUBJECTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'SUBJECTS'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'ALL_QUESTIONS'
                  ? 'bg-white dark:bg-slate-900 text-primary dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Toàn Bộ Câu Hỏi ({questions.length})
            </button>
          </div>

          {/* Chip lọc nhanh Tổ hợp môn học (Mobile-first flex-wrap) */}
          {viewMode === 'SUBJECTS' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Tất cả môn' },
                { id: 'HAS_DATA', label: `Đã có câu hỏi (${globalBloomCounts.activeSubjects})` },
                { id: 'NATURAL', label: 'Khoa học Tự nhiên' },
                { id: 'SOCIAL', label: 'Khoa học Xã hội' },
                { id: 'LANGUAGE', label: 'Ngoại ngữ' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubjectCategoryFilter(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    subjectCategoryFilter === tab.id
                      ? 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/40'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thanh Tìm Kiếm + Sắp Xếp Bên Phải (Dành cho Subject Hub) */}
        {viewMode === 'SUBJECTS' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {/* Ô tìm kiếm môn học */}
            <div className="relative w-full sm:w-64 md:w-72">
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

              // Phát hiện thiếu hụt theo cấu trúc đề THPT 2025
              const missingFormats: string[] = [];
              if (hasQuestions) {
                if (sub.trueFalseCount === 0) missingFormats.push('Thiếu Đúng/Sai');
                if (sub.shortOrEssayCount === 0) missingFormats.push('Thiếu Trả lời ngắn');
                if (sub.advanced === 0) missingFormats.push('Thiếu VDC');
              }

              return (
                <Card
                  key={sub.name}
                  onClick={() => handleSelectSubjectFromHub(sub.name)}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/60 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
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
                        className={`text-xs font-bold px-2.5 py-0.5 shrink-0 ${
                          hasQuestions
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        {sub.total} câu
                      </Badge>
                    </div>

                    {/* Thanh phân bố độ khó nhận thức theo màu (Đã gộp giải thích màu lên phía trên) */}
                    <div className="space-y-2 pt-0.5">
                      {/* Multi-segment Color Bar */}
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                        {hasQuestions ? (
                          <>
                            {sub.recognition > 0 && (
                              <div
                                style={{ width: `${recPct}%` }}
                                title={`Nhận biết: ${sub.recognition} câu (${recPct}%)`}
                                className="bg-emerald-500 rounded-l-full transition-all"
                              />
                            )}
                            {sub.understanding > 0 && (
                              <div
                                style={{ width: `${undPct}%` }}
                                title={`Thông hiểu: ${sub.understanding} câu (${undPct}%)`}
                                className="bg-sky-500 transition-all"
                              />
                            )}
                            {sub.application > 0 && (
                              <div
                                style={{ width: `${appPct}%` }}
                                title={`Vận dụng: ${sub.application} câu (${appPct}%)`}
                                className="bg-amber-500 transition-all"
                              />
                            )}
                            {sub.advanced > 0 && (
                              <div
                                style={{ width: `${advPct}%` }}
                                title={`Vận dụng cao: ${sub.advanced} câu (${advPct}%)`}
                                className="bg-rose-500 rounded-r-full transition-all"
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full bg-slate-200/50 dark:bg-slate-800 rounded-full" />
                        )}
                      </div>

                      {/* Chỉ báo số lượng tinh gọn bằng chấm màu (không lặp lại chữ viết tắt NB/TH/VD/VDC) */}
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        {hasQuestions ? (
                          <div className="flex flex-wrap items-center gap-3 font-mono font-bold">
                            <span
                              className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"
                              title={`Nhận biết: ${sub.recognition} câu (${recPct}%)`}
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {sub.recognition}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400"
                              title={`Thông hiểu: ${sub.understanding} câu (${undPct}%)`}
                            >
                              <span className="w-2 h-2 rounded-full bg-sky-500" />
                              {sub.understanding}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400"
                              title={`Vận dụng: ${sub.application} câu (${appPct}%)`}
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              {sub.application}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400"
                              title={`Vận dụng cao: ${sub.advanced} câu (${advPct}%)`}
                            >
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              {sub.advanced}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            Chưa có câu hỏi nào
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-primary dark:text-[#00B8DD] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Xem kho
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Độ phủ định dạng THPT 2025 & Cảnh báo lệch ma trận */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          TN 4 lựa chọn: <strong>{sub.singleChoiceCount}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold ${
                            sub.trueFalseCount > 0
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60'
                          }`}
                        >
                          Đúng/Sai: <strong>{sub.trueFalseCount}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold ${
                            sub.shortOrEssayCount > 0
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60'
                          }`}
                        >
                          TLN / Tự luận: <strong>{sub.shortOrEssayCount}</strong>
                        </span>
                      </div>

                      {(!hasQuestions || missingFormats.length > 0) && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50"
                        >
                          <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                            ⚠️{' '}
                            {!hasQuestions
                              ? 'Kho môn này đang trống'
                              : missingFormats.join(' • ')}
                          </span>
                          <Link
                            href={`/admin/questions/import?mode=ai-docx&subject=${encodeURIComponent(sub.name)}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00B8DD] hover:bg-[#009bbd] text-white text-[10px] font-bold transition-colors shrink-0"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Sinh bổ sung</span>
                          </Link>
                        </div>
                      )}
                    </div>
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
      {/* VIEW 2: CÂY CHUYÊN ĐỀ (SIDEBAR) + DANH SÁCH CÂU HỎI & BULK ACTIONS */}
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
                {selectedChapter !== 'ALL' && (
                  <>
                    <span className="text-slate-400">/</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-bold">
                      {selectedChapter}
                    </span>
                  </>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedSubject('ALL');
                  setSelectedChapter('ALL');
                }}
                className="h-7 text-[11px] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              >
                Hiển thị tất cả môn
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* CỘT TRÁI (3/12): CÂY THƯ MỤC CHƯƠNG / CHUYÊN ĐỀ */}
            <Card
              data-testid="chapter-tree-sidebar"
              className="xl:col-span-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#00B8DD]" />
                    Cây Chương / Chuyên Đề
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedSubject === 'ALL' ? 'Toàn bộ môn học' : selectedSubject} (
                    {chapterTreeStats.items.length} chuyên đề)
                  </p>
                </div>
                {selectedChapter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChapter('ALL');
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-bold text-[#00B8DD] hover:underline cursor-pointer"
                  >
                    Bỏ lọc
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChapter('ALL');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedChapter === 'ALL'
                      ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <span>Tất cả chuyên đề</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[11px] font-mono">
                    {chapterTreeStats.totalInPool}
                  </span>
                </button>

                {chapterTreeStats.items.map((item) => {
                  const isActive = selectedChapter === item.chapter;
                  return (
                    <button
                      key={item.chapter}
                      type="button"
                      onClick={() => {
                        setSelectedChapter(isActive ? 'ALL' : item.chapter);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer border space-y-1.5 ${
                        isActive
                          ? 'bg-[#00B8DD]/10 border-[#00B8DD]/50 text-slate-900 dark:text-white shadow-2xs'
                          : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/70 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold leading-snug line-clamp-2">
                          {item.chapter}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-[10px] font-mono font-bold shrink-0">
                          {item.total} câu
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold">
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item.rec}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          {item.und}
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {item.app}
                        </span>
                        <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {item.adv}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* CỘT PHẢI (9/12): BỘ LỌC + BULK ACTIONS + DANH SÁCH CÂU HỎI */}
            <div className="xl:col-span-9 space-y-4">
              {/* BỘ LỌC ĐA TIÊU CHÍ */}
              <Card className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
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
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Lọc môn học */}
                    <select
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setSelectedChapter('ALL');
                        setCurrentPage(1);
                      }}
                      className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium"
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
                        setSelectedChapter('ALL');
                        setCurrentPage(1);
                      }}
                      className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium"
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
                      className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium"
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
                      className="h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-900 font-medium"
                    >
                      <option value="ALL">Mọi định dạng</option>
                      <option value="SINGLE_CHOICE">Trắc nghiệm 4 lựa chọn</option>
                      <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                      <option value="TRUE_FALSE">Đúng / Sai 2025</option>
                      <option value="FILL_BLANK">Điền khuyết / Điền số</option>
                      <option value="ESSAY">Tự luận</option>
                      <option value="GROUP_QUESTIONS">Chùm câu hỏi</option>
                      <option value="MATCHING">Nối cặp</option>
                      <option value="ORDERING">Sắp xếp</option>
                      <option value="CLOZE_DROPDOWN">Đục lỗ inline</option>
                    </select>

                    {/* Công tắc Thu gọn / Đầy đủ */}
                    <button
                      type="button"
                      onClick={() => setCompactQuestionView((v) => !v)}
                      className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        compactQuestionView
                          ? 'bg-[#00B8DD]/10 border-[#00B8DD]/40 text-[#007D99] dark:text-[#00B8DD]'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {compactQuestionView ? '👁️ Đang thu gọn đáp án' : '📋 Hiện đầy đủ đáp án'}
                    </button>

                    {/* Nút đặt lại */}
                    {isFiltered && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetFilters}
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1 h-9 px-2.5 shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đặt lại</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Thanh chọn nhanh câu hỏi trên trang để thao tác hàng loạt */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={toggleSelectCurrentPage}
                      className="w-4 h-4 rounded border-slate-300 text-[#00B8DD] focus:ring-[#00B8DD] cursor-pointer"
                    />
                    <span>
                      Chọn tất cả trang này ({paginatedQuestions.length} câu)
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Đang hiển thị <strong>{paginatedQuestions.length}</strong> /{' '}
                    <strong>{filteredQuestions.length}</strong> câu hỏi phù hợp
                  </span>
                </div>
              </Card>

              {/* THANH THAO TÁC HÀNG LOẠT (BULK ACTIONS BAR) */}
              {selectedQuestionIds.length > 0 && (
                <Card
                  data-testid="bulk-action-bar"
                  className="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-600/70 shadow-xs space-y-2.5 animate-in fade-in duration-150"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-black">
                        Đã chọn {selectedQuestionIds.length} câu hỏi
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedQuestionIds([])}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                      >
                        Bỏ chọn tất cả
                      </button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDelete}
                      className="h-8 text-xs border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa {selectedQuestionIds.length} câu đã chọn
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/80 dark:border-amber-800/60">
                    {/* Đổi độ khó Bloom hàng loạt */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Đổi mức độ:
                      </span>
                      <select
                        value={bulkDifficulty}
                        onChange={(e) => setBulkDifficulty(e.target.value as DifficultyLevel)}
                        className="h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs font-semibold"
                      >
                        <option value="RECOGNITION">Nhận biết</option>
                        <option value="UNDERSTANDING">Thông hiểu</option>
                        <option value="APPLICATION">Vận dụng</option>
                        <option value="ADVANCED_APPLICATION">Vận dụng cao</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={handleBulkUpdateDifficulty}
                        className="h-8 bg-[#00B8DD] hover:bg-[#009bbd] text-white text-xs font-bold"
                      >
                        Áp dụng mức độ
                      </Button>
                    </div>

                    <div className="h-5 w-px bg-amber-300 dark:bg-amber-700 hidden sm:block" />

                    {/* Đổi Chương / Chuyên đề hàng loạt */}
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[240px]">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Gán chuyên đề:
                      </span>
                      <Input
                        value={bulkChapterInput}
                        onChange={(e) => setBulkChapterInput(e.target.value)}
                        placeholder="Nhập tên Chương / Chuyên đề mới..."
                        className="h-8 text-xs bg-white dark:bg-slate-900 flex-1 min-w-[140px]"
                      />
                      <Button
                        size="sm"
                        onClick={handleBulkUpdateChapter}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Gán chuyên đề
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Danh Sách Câu Hỏi (Đã phân trang 10 câu/trang) */}
              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs shadow-xs">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
                  </div>
                ) : (
                  paginatedQuestions.map((q, idx) => {
                    const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const diffMeta =
                      BLOOM_DIFFICULTY_META[q.difficulty || 'UNDERSTANDING'] ||
                      BLOOM_DIFFICULTY_META.UNDERSTANDING;
                    const typeLabel = QUESTION_TYPE_LABELS[q.type || 'SINGLE_CHOICE'] || q.type;
                    const isChecked = selectedQuestionIds.includes(q.id);

                    return (
                      <Card
                        key={q.id}
                        className={`p-5 bg-white dark:bg-slate-900 border transition-all space-y-3 ${
                          isChecked
                            ? 'border-[#00B8DD] ring-2 ring-[#00B8DD]/15'
                            : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectQuestion(q.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#00B8DD] focus:ring-[#00B8DD] cursor-pointer"
                              title="Chọn câu hỏi để thao tác hàng loạt"
                            />
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {q.title || `Câu ${displayIndex}`}
                            </span>
                            {q.subject && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-semibold"
                              >
                                {normalizeSubjectName(q.subject)}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold inline-flex items-center gap-1.5 ${diffMeta.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${diffMeta.dotClass}`} />
                              {diffMeta.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium"
                            >
                              {typeLabel}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium"
                            >
                              {q.chapter || 'Chương chung'}
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
                        {!compactQuestionView && q.answers && q.answers.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.answers.map((ans) => (
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
                        {!compactQuestionView && q.explain && (
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
          </div>
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
