'use client';

import * as React from 'react';
import Link from 'next/link';
import { Question, DifficultyLevel } from '@/types/exam';
import { INITIAL_MASTER_QUESTIONS } from '@/services/mock/master-questions';
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
} from 'lucide-react';
import { ImportGuidelineModal } from '@/components/features/admin/questions/ImportGuidelineModal';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

// Danh sách môn học chuẩn cùng biểu tượng và màu nhận diện
const CORE_SUBJECT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; border: string; category: 'NATURAL' | 'SOCIAL' | 'LANGUAGE' }
> = {
  'Toán học': {
    icon: Calculator,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    category: 'NATURAL',
  },
  'Vật lí': {
    icon: Atom,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    category: 'NATURAL',
  },
  'Hóa học': {
    icon: FlaskConical,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    category: 'NATURAL',
  },
  'Sinh học': {
    icon: Dna,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    category: 'NATURAL',
  },
  'Tiếng Anh': {
    icon: Globe2,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    category: 'LANGUAGE',
  },
  'Lịch sử': {
    icon: Landmark,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    category: 'SOCIAL',
  },
  'Địa lí': {
    icon: Compass,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    category: 'SOCIAL',
  },
  'Ngữ văn': {
    icon: BookOpen,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    category: 'SOCIAL',
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
      const sub = q.subject || 'Khác';
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
      selectedSubject === 'ALL' || q.subject === selectedSubject;
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
    setQuestions(questions.filter((q) => q.id !== id));
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1 border-b border-slate-100">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
            <Database className="w-3.5 h-3.5 mr-1" />
            Master Question Bank
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Ngân Hàng Câu Hỏi Gốc (Toàn Sàn)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kho dữ liệu trung tâm chuẩn hóa các câu hỏi theo môn học, mức độ nhận thức Bloom và chuyên đề kiến thức.
          </p>
        </div>

        {/* Nút thao tác nhanh trên desktop */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <ImportGuidelineModal triggerText="Hướng dẫn & File mẫu" />

          <Link href="/admin/questions/import">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-medium shadow-xs whitespace-nowrap">
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel / Word
            </Button>
          </Link>

          <Link href="/admin/questions/create">
            <Button className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 font-semibold shadow-xs whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Soạn câu hỏi mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Thẻ Thống Kê Tổng Quan Hệ Thống */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng số câu hỏi</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{questions.length}</div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">Nhận biết (Dễ)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {questions.filter((q) => q.difficulty === 'RECOGNITION').length}
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-sky-600">Thông hiểu (TB)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {questions.filter((q) => q.difficulty === 'UNDERSTANDING').length}
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-amber-600">Vận dụng & VDC</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
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
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('SUBJECTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'SUBJECTS'
              ? 'bg-white text-primary shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Theo Môn Học ({subjectStats.length} môn)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ALL_QUESTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'ALL_QUESTIONS'
              ? 'bg-white text-primary shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
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
                className="pl-9 w-full h-9 bg-white border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary"
              />
            </div>

            {/* Sắp xếp thông minh */}
            <select
              value={subjectSort}
              onChange={(e) => setSubjectSort(e.target.value as any)}
              className="h-9 bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary font-medium shrink-0"
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
                color: 'text-slate-600',
                bg: 'bg-slate-50',
                border: 'border-slate-200',
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
                  className="p-5 bg-white border border-slate-200/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group"
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
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors">
                            {sub.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3" />
                            <span>{sub.chapters.size} chuyên đề</span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold px-2 py-0.5 shrink-0 ${hasQuestions
                          ? 'bg-slate-100 text-slate-800 border-slate-200'
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                      >
                        {sub.total} câu
                      </Badge>
                    </div>

                    {/* Thanh phân bố độ khó nhận thức Bloom */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500">Phân bố Bloom:</span>
                        <span className="text-slate-400 text-[10px]">
                          {hasQuestions ? `${sub.total} câu hỏi` : 'Chưa có dữ liệu'}
                        </span>
                      </div>

                      {/* Multi-segment Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
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
                          <div className="w-full bg-slate-200/50" />
                        )}
                      </div>

                      {/* Mini Legend */}
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
                        <div className="bg-emerald-50 text-emerald-800 rounded px-1 py-0.5" title="Nhận biết">
                          NB: {sub.recognition}
                        </div>
                        <div className="bg-sky-50 text-sky-800 rounded px-1 py-0.5" title="Thông hiểu">
                          TH: {sub.understanding}
                        </div>
                        <div className="bg-amber-50 text-amber-800 rounded px-1 py-0.5" title="Vận dụng">
                          VD: {sub.application}
                        </div>
                        <div className="bg-rose-50 text-rose-800 rounded px-1 py-0.5" title="Vận dụng cao">
                          VDC: {sub.advanced}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động xem danh sách câu hỏi môn này */}
                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectSubjectFromHub(sub.name)}
                      className="w-full justify-between text-xs border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-semibold group/btn"
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
            <div className="text-center py-12 p-6 rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs shadow-xs">
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-xs">
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
                <span className="text-slate-700 font-semibold">
                  Môn đang chọn:{' '}
                  <strong className="text-primary font-bold">{selectedSubject}</strong> (
                  {filteredQuestions.length} câu)
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedSubject('ALL')}
                className="h-7 text-[11px] text-slate-600 border-slate-200 hover:bg-white"
              >
                Hiển thị tất cả môn
              </Button>
            </div>
          )}

          {/* BỘ LỌC ĐA TIÊU CHÍ (Nằm trên 1 hàng ngang ở Desktop) */}
          <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/80 shadow-xs">
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
                  className="pl-9 h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white"
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
                  className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-36"
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
                  className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-32"
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
                  className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-36"
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
                  className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-44"
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
                    className="col-span-2 sm:col-span-3 lg:col-span-1 text-xs text-slate-500 hover:text-slate-900 gap-1 h-9 px-2.5 shrink-0 whitespace-nowrap"
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
              <div className="text-center py-12 p-6 rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs shadow-xs">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              paginatedQuestions.map((q, idx) => {
                const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

                return (
                  <Card
                    key={q.id}
                    className="p-5 bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {q.title || `Câu ${displayIndex}`}
                        </span>
                        {q.subject && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-sky-50 text-sky-800 border-sky-200 font-medium"
                          >
                            {q.subject}
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
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200 font-medium"
                        >
                          {q.difficulty}
                        </Badge>
                      </div>

                      {/* Nhóm nút hành động: Nút Sửa câu hỏi + Xóa */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono mr-1">
                          Điểm: <strong className="text-slate-800">{q.points}</strong>
                        </span>

                        {/* NÚT CHỈNH SỬA CÂU HỎI TRỰC TIẾP */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuestion(JSON.parse(JSON.stringify(q)))}
                          className="h-7 text-xs px-2.5 gap-1.5 border-slate-200 hover:border-primary hover:text-primary font-medium bg-white"
                          title="Chỉnh sửa câu hỏi này"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Sửa</span>
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(q.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Nội dung câu hỏi (Render công thức KaTeX) */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-normal">
                      <MathRenderer content={q.content} />
                    </div>

                    {/* Ảnh minh họa nếu có */}
                    {q.image_url && (
                      <div className="pt-1">
                        <img
                          src={q.image_url}
                          alt="Minh họa câu hỏi"
                          className="max-h-48 rounded-lg border border-slate-200 object-contain bg-slate-50"
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
                              ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-300 font-semibold'
                              : 'bg-slate-50 text-slate-600 border border-slate-200/70'
                              }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${ans.is_answer
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
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
                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-sky-700 font-semibold">Lời giải: </span>
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
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
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
                className="text-xs border-slate-200"
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
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Môn học:</label>
                <select
                  value={editingQuestion.subject || 'Toán học'}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, subject: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {Object.keys(CORE_SUBJECT_CONFIG).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Khối lớp:</label>
                <select
                  value={String(editingQuestion.grade_level || '12')}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, grade_level: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium"
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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${ans.is_answer
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
    </div>
  );
}
