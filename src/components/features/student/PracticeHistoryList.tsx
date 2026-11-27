'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  Calendar,
  Clock,
  Cpu,
  Dna,
  FlaskConical,
  Globe,
  History,
  Home,
  Landmark,
  Languages,
  RefreshCw,
  Scale,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Award,
  TrendingUp,
  Sparkles,
  RotateCcw,
  ChevronDown,
  Check,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ExamSnapshotModal } from '@/components/features/student/practice/ExamSnapshotModal';
import { cn } from '@/lib/utils';
import {
  examSnapshotService,
  ExamSnapshot,
  EXAM_SNAPSHOTS_EVENT,
} from '@/services/exam-snapshot.service';
import { studentExamsService, PracticeHistoryItem } from '@/services/student-exams.service';
import { K12_SUBJECTS } from '@/services/mock/subject-data';

const ITEMS_PER_PAGE = 10;

const PRIORITY_SUBJECT_ORDER: string[] = [
  'toan-hoc',
  'tin-hoc',
  ...K12_SUBJECTS.filter((s) => s.slug !== 'toan-hoc' && s.slug !== 'tin-hoc').map((s) => s.slug),
];

function normalizeSubjectMeta(rawSlug?: string | null, rawName?: string | null): {
  slug: string;
  name: string;
} {
  const cleanSlug = String(rawSlug || '').trim().toLowerCase();
  const cleanName = String(rawName || '').trim().toLowerCase();

  // Khớp trực tiếp theo slug trong K12_SUBJECTS
  const bySlug = K12_SUBJECTS.find((s) => s.slug === cleanSlug);
  if (bySlug) return { slug: bySlug.slug, name: bySlug.name };

  // Suy luận thông minh từ tên hoặc slug viết tắt
  if (cleanSlug.includes('toan') || cleanName.includes('toán')) {
    return { slug: 'toan-hoc', name: 'Toán Học' };
  }
  if (cleanSlug.includes('tin') || cleanName.includes('tin học') || cleanName.includes('lập trình')) {
    return { slug: 'tin-hoc', name: 'Tin Học' };
  }
  if (cleanSlug.includes('ly') || cleanName.includes('vật lý')) {
    return { slug: 'vat-ly', name: 'Vật Lý' };
  }
  if (cleanSlug.includes('hoa') || cleanName.includes('hóa')) {
    return { slug: 'hoa-hoc', name: 'Hóa Học' };
  }
  if (cleanSlug.includes('sinh') || cleanName.includes('sinh học')) {
    return { slug: 'sinh-hoc', name: 'Sinh Học' };
  }
  if (cleanSlug.includes('anh') || cleanName.includes('tiếng anh')) {
    return { slug: 'tieng-anh', name: 'Tiếng Anh' };
  }
  if (cleanSlug.includes('van') || cleanName.includes('ngữ văn')) {
    return { slug: 'ngu-van', name: 'Ngữ Văn' };
  }
  if (cleanSlug.includes('su') || cleanName.includes('lịch sử')) {
    return { slug: 'lich-su', name: 'Lịch Sử' };
  }
  if (cleanSlug.includes('dia') || cleanName.includes('địa lý')) {
    return { slug: 'dia-ly', name: 'Địa Lý' };
  }
  if (cleanSlug.includes('gdcd') || cleanSlug.includes('gdkt') || cleanName.includes('pháp luật')) {
    return { slug: 'gdcd', name: 'GDKT & Pháp Luật' };
  }
  if (cleanSlug.includes('cong-nghe') || cleanName.includes('công nghệ')) {
    return { slug: 'cong-nghe', name: 'Công Nghệ' };
  }
  if (cleanSlug.includes('khtn') || cleanName.includes('tự nhiên')) {
    return { slug: 'khoa-hoc-tu-nhien', name: 'Khoa Học Tự Nhiên' };
  }

  // Mặc định chuẩn hóa những nhãn chung như "Môn Học K-12" về Toán Học
  return { slug: 'toan-hoc', name: 'Toán Học' };
}

function renderHistorySubjectLogo(slug: string, className = 'w-4 h-4') {
  switch (slug) {
    case 'toan-hoc':
      return <Calculator className={`${className} text-sky-600 dark:text-sky-400`} />;
    case 'tin-hoc':
      return <Cpu className={`${className} text-cyan-600 dark:text-cyan-400`} />;
    case 'vat-ly':
      return <Atom className={`${className} text-indigo-500 dark:text-indigo-400`} />;
    case 'hoa-hoc':
      return <FlaskConical className={`${className} text-emerald-500 dark:text-emerald-400`} />;
    case 'sinh-hoc':
      return <Dna className={`${className} text-teal-500 dark:text-teal-400`} />;
    case 'tieng-anh':
      return <Languages className={`${className} text-amber-500 dark:text-amber-400`} />;
    case 'ngu-van':
      return <BookOpen className={`${className} text-rose-500 dark:text-rose-400`} />;
    case 'lich-su':
      return <Landmark className={`${className} text-orange-500 dark:text-orange-400`} />;
    case 'dia-ly':
      return <Globe className={`${className} text-blue-500 dark:text-blue-400`} />;
    case 'gdcd':
      return <Scale className={`${className} text-purple-500 dark:text-purple-400`} />;
    case 'cong-nghe':
      return <Wrench className={`${className} text-slate-500 dark:text-slate-400`} />;
    case 'khoa-hoc-tu-nhien':
      return <Sparkles className={`${className} text-emerald-600 dark:text-emerald-400`} />;
    default:
      return <BookOpen className={`${className} text-[#00B8DD]`} />;
  }
}

function normalizeHighSchoolGrade(rawGrade?: number | string | null, rawTitle?: string | null): number {
  const num = Number(rawGrade);
  if (num >= 1 && num <= 12) return num;
  const titleMatch = String(rawTitle || '').match(/(?:Khối|Lớp|Toán|Tin)\s*(1[0-2]|[1-9])\b/i);
  if (titleMatch) {
    const parsed = Number(titleMatch[1]);
    if (parsed >= 1 && parsed <= 12) return parsed;
  }
  return 12;
}

const BLOOM_LEVELS = [
  { key: 'EASY', label: 'Nhận biết', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'MEDIUM', label: 'Thông hiểu', color: 'text-cyan-600 dark:text-cyan-400' },
  { key: 'HARD', label: 'Vận dụng', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'VERY_HARD', label: 'Vận dụng cao', color: 'text-rose-600 dark:text-rose-400' },
] as const;

const HISTORY_BREAKDOWN_KEYS = ['nhanBiet', 'thongHieu', 'vanDung', 'vanDungCao'] as const;

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export interface UnifiedHistoryItem {
  id: string;
  attemptToken?: string;
  title: string;
  subject: string;
  subjectSlug: string;
  grade: number;
  level: string;
  score: number;
  totalQuestions: number;
  correctQuestions: number;
  timeSpentSeconds: number;
  createdAt: string;
  snapshot?: ExamSnapshot;
  bloomSummary?: Record<string, { correct: number; total: number }>;
  breakdown?: { nhanBiet: string; thongHieu: string; vanDung: string; vanDungCao: string };
  remediationAttempted?: boolean;
  remediationCorrectCount?: number;
  remediationTotalQuestions?: number;
  chapterId?: number;
}

function HistorySelectDropdown({
  value,
  options,
  onChange,
  prefixLabel,
  menuClassName,
  align = 'left',
}: {
  value: string;
  options: Array<{ value: string; label: string; count?: number; icon?: React.ReactNode }>;
  onChange: (next: string) => void;
  prefixLabel?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
}) {
  const current = options.find((o) => o.value === value) || options[0];

  return (
    <DropdownMenu
      align={align}
      className={cn(
        'min-w-[210px] max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800',
        menuClassName
      )}
      trigger={
        <div className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD]/60 dark:hover:border-[#00B8DD]/50 text-xs text-slate-900 dark:text-white font-semibold inline-flex items-center justify-between gap-2 transition-all select-none cursor-pointer shadow-2xs">
          <span className="inline-flex items-center gap-1.5 truncate">
            {current?.icon}
            {prefixLabel && (
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {prefixLabel}
              </span>
            )}
            <span className="truncate">{current?.label}</span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      }
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'py-2 px-2.5 rounded-xl text-xs',
              isSelected && 'bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] font-bold'
            )}
            icon={
              opt.icon ? (
                opt.icon
              ) : isSelected ? (
                <Check className="w-3.5 h-3.5 text-[#00B8DD]" />
              ) : (
                <span className="w-3.5 h-3.5 block" />
              )
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span>{opt.label}</span>
              {typeof opt.count === 'number' && opt.count > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
                  {opt.count}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenu>
  );
}

function BloomGrid({ values }: { values: string[] }) {
  return (
    <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      {BLOOM_LEVELS.map((level, i) => (
        <div
          key={level.key}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
        >
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
            {level.label}
          </span>
          <span className={`font-bold ${level.color}`}>{values[i] || '-'}</span>
        </div>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3.5" aria-busy="true" aria-label="Đang tải lịch sử luyện đề">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="p-5 rounded-3xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-11 rounded-xl" />
                ))}
              </div>
            </div>
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
}

interface PracticeHistoryListProps {
  /** Hiển thị header kèm nút "Luyện Đề Mới" */
  showHeader?: boolean;
}

function extractUserGradeNumber(rawGrade?: string | number | null): string | null {
  if (rawGrade === null || rawGrade === undefined) return null;
  const match = String(rawGrade).match(/(1[0-2]|[1-9])\b/);
  if (!match) return null;
  const num = Number(match[1]);
  return num >= 1 && num <= 12 ? String(num) : null;
}

export function PracticeHistoryList({ showHeader = true }: PracticeHistoryListProps) {
  const { isAuthenticated, user } = useAuthStore();
  const isLoggedIn = Boolean(isAuthenticated && user?.id);
  const [items, setItems] = React.useState<UnifiedHistoryItem[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedSnapshot, setSelectedSnapshot] = React.useState<ExamSnapshot | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = React.useState(false);

  // Filter & Search states (Mặc định Môn = Tất cả các môn học, Khối = lớp người dùng đang học)
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('ALL');
  const [hasManualGradeSelect, setHasManualGradeSelect] = React.useState(false);
  const [selectedGrade, setSelectedGrade] = React.useState<string>(() => {
    return extractUserGradeNumber(user?.student_profile?.grade_level) || 'ALL';
  });

  React.useEffect(() => {
    if (!isLoggedIn) {
      setSelectedGrade('ALL');
      setHasManualGradeSelect(false);
      return;
    }
    if (!hasManualGradeSelect) {
      const userGrade = extractUserGradeNumber(user?.student_profile?.grade_level);
      if (userGrade) {
        setSelectedGrade(userGrade);
      }
    }
  }, [isLoggedIn, user?.id, user?.student_profile?.grade_level, hasManualGradeSelect]);
  const [selectedScoreRange, setSelectedScoreRange] = React.useState('ALL');
  const [sortBy, setSortBy] = React.useState<'NEWEST' | 'OLDEST' | 'SCORE_DESC' | 'SCORE_ASC'>('NEWEST');
  const [currentPage, setCurrentPage] = React.useState(1);

  const load = React.useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setSelectedSnapshot(null);
      setIsSnapshotOpen(false);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    try {
      const [snaps, rawHistory] = await Promise.all([
        examSnapshotService.getExamSnapshots(),
        studentExamsService.getPracticeHistory(),
      ]);

      const unifiedMap = new Map<string, UnifiedHistoryItem>();

      // 1. Map Snapshots
      for (const snap of snaps) {
        const key = snap.attemptToken || snap.id;
        const normSubj = normalizeSubjectMeta(snap.subjectSlug, snap.subjectName || snap.examTitle);
        const normGrade = normalizeHighSchoolGrade(snap.grade, snap.examTitle);
        unifiedMap.set(key, {
          id: snap.id,
          attemptToken: snap.attemptToken,
          title: snap.examTitle || 'Đề thi trắc nghiệm',
          subject: normSubj.name,
          subjectSlug: normSubj.slug,
          grade: normGrade,
          level: 'Tiêu chuẩn',
          score: Number(snap.originalExam?.finalScore ?? 0),
          totalQuestions: snap.originalExam?.totalQuestions ?? 10,
          correctQuestions: snap.originalExam?.correctCount ?? 0,
          timeSpentSeconds: snap.timeSpentSeconds || 0,
          createdAt: snap.createdAt || new Date().toISOString(),
          snapshot: snap,
          bloomSummary: snap.bloomSummary,
          remediationAttempted: snap.remediation?.attempted,
          remediationCorrectCount: snap.remediation?.correctCount,
          remediationTotalQuestions: snap.remediation?.totalQuestions,
          chapterId: snap.chapterId,
        });
      }

      // 2. Map History items nếu chưa có trong snapshots
      for (const h of rawHistory) {
        const key = h.attemptToken || h.id;
        if (!unifiedMap.has(key)) {
          const normSubj = normalizeSubjectMeta(h.subjectSlug, h.subject || h.title);
          const normGrade = normalizeHighSchoolGrade(undefined, h.title);
          unifiedMap.set(key, {
            id: h.id,
            attemptToken: h.attemptToken,
            title: h.title,
            subject: normSubj.name,
            subjectSlug: normSubj.slug,
            grade: normGrade,
            level: h.level || 'Tiêu chuẩn',
            score: Number(h.score ?? 0),
            totalQuestions: h.totalQuestions ?? 10,
            correctQuestions: h.correctQuestions ?? 0,
            timeSpentSeconds: (h.timeSpentMinutes ?? 10) * 60,
            createdAt: h.createdAt || new Date().toISOString(),
            breakdown: h.breakdown,
          });
        }
      }

      setItems(Array.from(unifiedMap.values()));
      setStatus('ready');
    } catch (err) {
      console.error('Failed to load practice history:', err);
      setStatus('error');
    }
  }, [isLoggedIn]);

  React.useEffect(() => {
    load();
    window.addEventListener(EXAM_SNAPSHOTS_EVENT, load);
    return () => window.removeEventListener(EXAM_SNAPSHOTS_EVENT, load);
  }, [load]);

  // Danh sách đầy đủ các môn học K-12, luôn đưa Môn Toán Học và Môn Tin Học lên đầu tiên
  const sortedSubjectFilters = React.useMemo(() => {
    const countBySlug = new Map<string, number>();
    items.forEach((item) => {
      const slug = item.subjectSlug || 'toan-hoc';
      countBySlug.set(slug, (countBySlug.get(slug) || 0) + 1);
    });

    return PRIORITY_SUBJECT_ORDER.map((slug) => {
      const subj = K12_SUBJECTS.find((s) => s.slug === slug);
      return {
        slug,
        name: subj?.name || 'Toán Học',
        isPriority: slug === 'toan-hoc' || slug === 'tin-hoc',
        count: countBySlug.get(slug) || 0,
      };
    });
  }, [items]);

  // Lọc và tìm kiếm
  const filteredItems = React.useMemo(() => {
    let list = [...items];

    // Tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.subject.toLowerCase().includes(q)
      );
    }

    // Lọc theo Môn (khớp chuẩn theo cả subjectSlug và tên môn)
    if (selectedSubject !== 'ALL') {
      list = list.filter(
        (it) => it.subjectSlug === selectedSubject || it.subject === selectedSubject
      );
    }

    // Lọc theo Khối lớp (Chỉ Lớp 10, Lớp 11, Lớp 12)
    if (selectedGrade !== 'ALL') {
      list = list.filter((it) => String(it.grade) === selectedGrade);
    }

    // Lọc theo Khung điểm
    if (selectedScoreRange !== 'ALL') {
      switch (selectedScoreRange) {
        case 'EXCELLENT':
          list = list.filter((it) => it.score >= 8.0);
          break;
        case 'GOOD':
          list = list.filter((it) => it.score >= 6.5 && it.score < 8.0);
          break;
        case 'AVERAGE':
          list = list.filter((it) => it.score >= 5.0 && it.score < 6.5);
          break;
        case 'POOR':
          list = list.filter((it) => it.score < 5.0);
          break;
      }
    }

    // Sắp xếp
    list.sort((a, b) => {
      switch (sortBy) {
        case 'NEWEST':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'OLDEST':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'SCORE_DESC':
          return b.score - a.score;
        case 'SCORE_ASC':
          return a.score - b.score;
        default:
          return 0;
      }
    });

    return list;
  }, [items, searchQuery, selectedSubject, selectedGrade, selectedScoreRange, sortBy]);

  // Phân trang 10 dữ liệu / trang
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Tự động điều chỉnh trang nếu vượt quá
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const pagedItems = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const defaultUserGrade =
    (isLoggedIn && extractUserGradeNumber(user?.student_profile?.grade_level)) || 'ALL';

  const handleRefreshHistory = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setSelectedGrade(defaultUserGrade);
    setHasManualGradeSelect(false);
    setSelectedScoreRange('ALL');
    setSortBy('NEWEST');
    setCurrentPage(1);
    void load();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setSelectedGrade('ALL');
    setHasManualGradeSelect(true);
    setSelectedScoreRange('ALL');
    setSortBy('NEWEST');
    setCurrentPage(1);
  };

  const isFiltering =
    Boolean(searchQuery.trim()) ||
    selectedSubject !== 'ALL' ||
    selectedGrade !== defaultUserGrade ||
    selectedScoreRange !== 'ALL' ||
    sortBy !== 'NEWEST';

  // Thống kê nhanh
  const stats = React.useMemo(() => {
    if (items.length === 0) return { total: 0, avg: 0, highest: 0, passRate: 0 };
    const total = items.length;
    const sum = items.reduce((acc, it) => acc + it.score, 0);
    const avg = Number((sum / total).toFixed(1));
    const highest = Math.max(...items.map((it) => it.score));
    const passed = items.filter((it) => it.score >= 5.0).length;
    const passRate = Math.round((passed / total) * 100);
    return { total, avg, highest, passRate };
  }, [items]);

  const handleOpenSnapshot = async (item: UnifiedHistoryItem) => {
    if (item.snapshot) {
      setSelectedSnapshot(item.snapshot);
      setIsSnapshotOpen(true);
      return;
    }

    try {
      const snap = await examSnapshotService.getExamSnapshotById(item.id);
      if (snap) {
        setSelectedSnapshot(snap);
        setIsSnapshotOpen(true);
      }
    } catch {
      // ignore
    }
  };

  const isEmpty = status === 'ready' && items.length === 0;

  const filterToolbarContent = (
    <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 rounded-xl p-2.5 sm:p-3 space-y-2.5">
      <div className="flex flex-col xl:flex-row xl:items-center gap-2.5">
        {/* Search Input */}
        <div className="flex-1 relative min-w-[220px]">
          <Input
            placeholder="Tìm kiếm theo tên đề thi hoặc môn học..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="w-full text-xs h-10 pr-8 bg-white dark:bg-slate-900 rounded-xl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Xoá tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Lọc Môn Học */}
          <HistorySelectDropdown
            prefixLabel="Môn:"
            value={selectedSubject}
            onChange={(val) => {
              setSelectedSubject(val);
              setCurrentPage(1);
            }}
            menuClassName="min-w-[240px] max-h-80"
            options={[
              {
                value: 'ALL',
                label: 'Tất cả các môn học',
                count: items.length,
                icon: renderHistorySubjectLogo('ALL', 'w-4 h-4 shrink-0'),
              },
              ...sortedSubjectFilters.map((s) => ({
                value: s.slug,
                label: s.name,
                count: s.count,
                icon: renderHistorySubjectLogo(s.slug, 'w-4 h-4 shrink-0'),
              })),
            ]}
          />

          {/* 2. Lọc Khối Lớp (Từ Lớp 12 giảm xuống Lớp 1) */}
          <HistorySelectDropdown
            prefixLabel="Khối:"
            value={selectedGrade}
            onChange={(val) => {
              setHasManualGradeSelect(true);
              setSelectedGrade(val);
              setCurrentPage(1);
            }}
            menuClassName="min-w-[170px]"
            options={[
              { value: 'ALL', label: 'Tất cả khối lớp' },
              ...Array.from({ length: 12 }, (_, idx) => {
                const g = 12 - idx;
                return { value: String(g), label: `Lớp ${g}` };
              }),
            ]}
          />

          {/* 3. Lọc Khung Điểm */}
          <HistorySelectDropdown
            prefixLabel="Điểm:"
            value={selectedScoreRange}
            onChange={(val) => {
              setSelectedScoreRange(val);
              setCurrentPage(1);
            }}
            align="right"
            menuClassName="min-w-[200px]"
            options={[
              { value: 'ALL', label: 'Tất cả khung điểm' },
              { value: 'EXCELLENT', label: 'Giỏi / Xuất sắc (≥ 8.0đ)' },
              { value: 'GOOD', label: 'Khá (6.5 - 7.9đ)' },
              { value: 'AVERAGE', label: 'Trung bình (5.0 - 6.4đ)' },
              { value: 'POOR', label: 'Chưa đạt (< 5.0đ)' },
            ]}
          />

          {/* 4. Sắp xếp */}
          <HistorySelectDropdown
            prefixLabel="Xếp:"
            value={sortBy}
            onChange={(val) => {
              setSortBy(val as any);
              setCurrentPage(1);
            }}
            align="right"
            menuClassName="min-w-[175px]"
            options={[
              { value: 'NEWEST', label: 'Mới nhất trước' },
              { value: 'OLDEST', label: 'Cũ nhất trước' },
              { value: 'SCORE_DESC', label: 'Điểm cao nhất' },
              { value: 'SCORE_ASC', label: 'Điểm thấp nhất' },
            ]}
          />
        </div>
      </div>

      {/* Active Filter summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
        <span>
          Tìm thấy <strong className="text-slate-900 dark:text-white font-bold">{totalItems}</strong> bài thi phù hợp
          {isFiltering ? ' (theo bộ lọc)' : ''}
        </span>
        <div className="flex items-center gap-3">
          <span>
            Trang {currentPage} / {totalPages || 1} • (10 bài/trang)
          </span>
          <button
            type="button"
            onClick={handleRefreshHistory}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#007D99] dark:text-[#00B8DD] hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── 1. HEADER & FILTER CARD (Đồng bộ hoàn toàn với Cổng Luyện Thi K-12) ── */}
      {showHeader && (
        <section className="relative z-30 overflow-visible bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#00B8DD]/10 text-[#00B8DD] text-xs font-semibold">
                  <History className="w-3.5 h-3.5" />
                  Khảo thí &amp; Lịch sử làm bài
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length} bài thi đã lưu
                  {isLoggedIn && user?.fullname ? ` • ${user.fullname}` : ''}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 inline-flex items-center justify-center shrink-0">
                  {renderHistorySubjectLogo(selectedSubject === 'ALL' ? 'default' : selectedSubject, 'w-4.5 h-4.5')}
                </span>
                <span>Lịch Sử Luyện Đề &amp; Điểm Số</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start lg:self-auto">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer min-h-[40px]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Về Trang Chủ</span>
              </Link>
              <Link
                href="/student/practice"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lộ Trình AI</span>
              </Link>
              <Link
                href="/luyen-thi"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#00B8DD] hover:bg-[#009bbd] text-white shadow-xs transition-all cursor-pointer min-h-[40px]"
              >
                <span>Luyện Đề Mới</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {isLoggedIn && status === 'ready' && items.length > 0 && filterToolbarContent}
        </section>
      )}

      {/* ── 2. KPI Metrics Bar ── */}
      {isLoggedIn && status === 'ready' && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Tổng đề đã làm</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
              <span className="text-[10px] text-slate-400">lượt thi</span>
            </div>
          </Card>

          <Card className="p-3.5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Điểm trung bình</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#007D99] dark:text-[#00B8DD]">{stats.avg}</span>
              <span className="text-[10px] text-slate-400">/ 10</span>
            </div>
          </Card>

          <Card className="p-3.5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Điểm cao nhất</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-amber-500">{stats.highest}</span>
              <span className="text-[10px] text-slate-400">/ 10</span>
            </div>
          </Card>

          <Card className="p-3.5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Tỉ lệ đạt (≥ 5đ)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-500">{stats.passRate}%</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">đạt yêu cầu</span>
            </div>
          </Card>
        </div>
      )}

      {/* ── 3. Fallback Search & Filter Toolbar khi nhúng không có Header ── */}
      {!showHeader && isLoggedIn && status === 'ready' && items.length > 0 && (
        <Card className="relative z-30 overflow-visible p-3 sm:p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          {filterToolbarContent}
        </Card>
      )}

      {/* ── 4. Loading Skeleton ── */}
      {status === 'loading' && <HistorySkeleton />}

      {/* ── 5. Error State ── */}
      {status === 'error' && (
        <Card className="p-6 rounded-3xl text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Chưa tải được lịch sử luyện đề. Bạn kiểm tra kết nối rồi thử lại nhé.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] rounded-xl"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              setStatus('loading');
              load();
            }}
          >
            Thử Lại
          </Button>
        </Card>
      )}

      {/* ── 6. Logged-out or Empty State ── */}
      {status === 'ready' && !isLoggedIn && (
        <Card className="p-8 rounded-3xl text-center space-y-3 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
            <History className="w-6 h-6 text-[#00B8DD]" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Đăng nhập để xem Lịch sử Luyện đề &amp; Điểm số
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Kết quả bài thi và phân tích 4 mức độ nhận thức Bloom được lưu bảo mật theo từng tài khoản học sinh.
          </p>
          <Link href="/login/student?returnUrl=/student/exams" className="inline-block pt-2">
            <Button className="min-h-[44px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl shadow-md cursor-pointer">
              Đăng nhập tài khoản học sinh
            </Button>
          </Link>
        </Card>
      )}

      {isLoggedIn && isEmpty && (
        <Card className="p-8 rounded-3xl text-center space-y-3 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
            <History className="w-6 h-6 text-[#00B8DD]" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bạn chưa luyện đề nào</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Làm thử một đề ma trận để Schoolify lưu lại kết quả và phân tích chi tiết cho bạn.
          </p>
          <Link href="/luyen-thi" className="inline-block pt-2">
            <Button className="min-h-[44px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl shadow-md cursor-pointer">
              Vào Cổng Luyện Thi Ngay
            </Button>
          </Link>
        </Card>
      )}

      {/* ── 7. Filtered Empty State (Lọc không ra kết quả) ── */}
      {status === 'ready' && !isEmpty && totalItems === 0 && (
        <Card className="p-8 rounded-3xl text-center space-y-3 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Filter className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Không tìm thấy bài thi phù hợp</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Không có kết quả nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại của bạn.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="rounded-xl text-xs font-semibold"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Xoá bộ lọc và xem tất cả
          </Button>
        </Card>
      )}

      {/* ── 8. Paged List of Exams (10 items / page) ── */}
      {status === 'ready' && totalItems > 0 && (
        <div className="relative z-10 space-y-4">
          <ul className="space-y-3.5" aria-label="Lịch sử luyện đề">
            {pagedItems.map((item) => {
              const hasSnapshot = Boolean(item.snapshot);
              const scoreBadgeColor =
                item.score >= 8.0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : item.score >= 6.5
                  ? 'text-[#007D99] dark:text-[#00B8DD]'
                  : item.score >= 5.0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400';

              return (
                <li key={item.id}>
                  <Card className="p-5 border border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/60 rounded-3xl transition-all bg-white dark:bg-slate-900 shadow-xs hover:shadow-md">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info & Bloom Breakdown */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-cyan-50 text-[#007D99] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-[10px] font-bold">
                            {item.subject}
                          </Badge>

                          <Badge variant="outline" className="text-[10px] text-slate-500">
                            Lớp {item.grade}
                          </Badge>

                          {item.remediationAttempted && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-[10px] font-bold">
                              ✓ Đã khắc phục ({item.remediationCorrectCount}/{item.remediationTotalQuestions} câu)
                            </Badge>
                          )}

                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" aria-hidden />
                            {formatDate(item.createdAt)}
                          </span>

                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" aria-hidden />
                            {Math.floor(item.timeSpentSeconds / 60)} phút {item.timeSpentSeconds % 60}s
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>

                        {/* Bloom levels */}
                        {item.bloomSummary ? (
                          <BloomGrid
                            values={BLOOM_LEVELS.map(({ key }) => {
                              const b = item.bloomSummary?.[key];
                              return b && b.total > 0 ? `${b.correct}/${b.total}` : '-';
                            })}
                          />
                        ) : item.breakdown ? (
                          <BloomGrid
                            values={HISTORY_BREAKDOWN_KEYS.map((k) => item.breakdown?.[k] || '-')}
                          />
                        ) : null}
                      </div>

                      {/* Right: Score & Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="lg:text-right">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                            Đúng {item.correctQuestions}/{item.totalQuestions} câu
                          </span>
                          <p className={`text-2xl sm:text-3xl font-black ${scoreBadgeColor}`}>
                            {item.score}{' '}
                            <span className="text-xs text-slate-400 font-normal">/ 10</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasSnapshot ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenSnapshot(item)}
                              className="min-h-[40px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                            >
                              Xem Lại Đề Thi
                            </Button>
                          ) : (
                            <Link href="/luyen-thi">
                              <Button
                                variant="outline"
                                size="sm"
                                className="min-h-[40px] text-xs font-bold rounded-xl cursor-pointer"
                              >
                                Luyện Đề Tương Tự
                              </Button>
                            </Link>
                          )}

                          <Link
                            href={
                              item.snapshot
                                ? `/student/practice/exam-room?subject=${item.snapshot.subjectSlug}&chapter=${item.snapshot.chapterId}&grade=${item.snapshot.grade}`
                                : `/luyen-thi`
                            }
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[40px] text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Thi Lại
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>

          {/* ── 9. Pagination Component (10 items / page) ── */}
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Modal xem lại snapshot đề thi */}
      <ExamSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        snapshot={selectedSnapshot}
      />
    </div>
  );
}
