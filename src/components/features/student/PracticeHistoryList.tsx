'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  History,
  RefreshCw,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Award,
  TrendingUp,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { ExamSnapshotModal } from '@/components/features/student/practice/ExamSnapshotModal';
import {
  examSnapshotService,
  ExamSnapshot,
  EXAM_SNAPSHOTS_EVENT,
} from '@/services/exam-snapshot.service';
import { studentExamsService, PracticeHistoryItem } from '@/services/student-exams.service';

const ITEMS_PER_PAGE = 10;

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

export function PracticeHistoryList({ showHeader = true }: PracticeHistoryListProps) {
  const [items, setItems] = React.useState<UnifiedHistoryItem[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedSnapshot, setSelectedSnapshot] = React.useState<ExamSnapshot | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = React.useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('ALL');
  const [selectedGrade, setSelectedGrade] = React.useState('ALL');
  const [selectedScoreRange, setSelectedScoreRange] = React.useState('ALL');
  const [sortBy, setSortBy] = React.useState<'NEWEST' | 'OLDEST' | 'SCORE_DESC' | 'SCORE_ASC'>('NEWEST');
  const [currentPage, setCurrentPage] = React.useState(1);

  const load = React.useCallback(async () => {
    try {
      const [snaps, rawHistory] = await Promise.all([
        examSnapshotService.getExamSnapshots(),
        studentExamsService.getPracticeHistory(),
      ]);

      const unifiedMap = new Map<string, UnifiedHistoryItem>();

      // 1. Map Snapshots
      for (const snap of snaps) {
        const key = snap.attemptToken || snap.id;
        unifiedMap.set(key, {
          id: snap.id,
          attemptToken: snap.attemptToken,
          title: snap.examTitle || 'Đề thi trắc nghiệm',
          subject: snap.subjectName || 'Toán Học',
          subjectSlug: snap.subjectSlug || 'toan-hoc',
          grade: Number(snap.grade || 12),
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
          unifiedMap.set(key, {
            id: h.id,
            attemptToken: h.attemptToken,
            title: h.title,
            subject: h.subject,
            subjectSlug: h.subjectSlug,
            grade: 12,
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
  }, []);

  React.useEffect(() => {
    load();
    window.addEventListener(EXAM_SNAPSHOTS_EVENT, load);
    return () => window.removeEventListener(EXAM_SNAPSHOTS_EVENT, load);
  }, [load]);

  // Danh sách môn học động từ dữ liệu
  const availableSubjects = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.subject) set.add(item.subject);
    });
    return Array.from(set).sort();
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

    // Lọc theo Môn
    if (selectedSubject !== 'ALL') {
      list = list.filter((it) => it.subject === selectedSubject);
    }

    // Lọc theo Khối lớp
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setSelectedGrade('ALL');
    setSelectedScoreRange('ALL');
    setSortBy('NEWEST');
    setCurrentPage(1);
  };

  const isFiltering =
    Boolean(searchQuery.trim()) ||
    selectedSubject !== 'ALL' ||
    selectedGrade !== 'ALL' ||
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

  return (
    <div className="space-y-6">
      {/* ── 1. Header (tuỳ chọn) ── */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00B8DD]" />
              <span>Lịch Sử Luyện Đề & Bảng Điểm</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tra cứu toàn bộ các bài thi đã làm, chi tiết đúng/sai và phân tích 4 mức độ nhận thức Bloom.
            </p>
          </div>
          <Link href="/luyen-thi" className="shrink-0">
            <Button
              className="min-h-[44px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold shadow-md shadow-[#00B8DD]/25 text-xs px-4 rounded-xl cursor-pointer shadow-md"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Luyện Đề Mới Ngay
            </Button>
          </Link>
        </div>
      )}

      {/* ── 2. KPI Metrics Bar ── */}
      {status === 'ready' && items.length > 0 && (
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

      {/* ── 3. Search & Filter Toolbar ── */}
      {status === 'ready' && items.length > 0 && (
        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Input
                placeholder="Tìm kiếm theo tên đề thi hoặc môn học..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="w-full text-xs h-10 pr-8"
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
              {/* Lọc Môn */}
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
              >
                <option value="ALL">Tất cả môn học</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    Môn {s}
                  </option>
                ))}
              </select>

              {/* Lọc Khối Lớp */}
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
              >
                <option value="ALL">Tất cả khối lớp</option>
                <option value="12">Lớp 12</option>
                <option value="11">Lớp 11</option>
                <option value="10">Lớp 10</option>
                <option value="9">Lớp 9</option>
              </select>

              {/* Lọc Khung Điểm */}
              <select
                value={selectedScoreRange}
                onChange={(e) => {
                  setSelectedScoreRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
              >
                <option value="ALL">Tất cả khung điểm</option>
                <option value="EXCELLENT">Giỏi / Xuất sắc (≥ 8.0đ)</option>
                <option value="GOOD">Khá (6.5 - 7.9đ)</option>
                <option value="AVERAGE">Trung bình (5.0 - 6.4đ)</option>
                <option value="POOR">Chưa đạt (&lt; 5.0đ)</option>
              </select>

              {/* Sắp xếp */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
              >
                <option value="NEWEST">Mới nhất trước</option>
                <option value="OLDEST">Cũ nhất trước</option>
                <option value="SCORE_DESC">Điểm cao nhất</option>
                <option value="SCORE_ASC">Điểm thấp nhất</option>
              </select>

              {/* Reset filter */}
              {isFiltering && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 px-3 text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Đặt lại
                </Button>
              )}
            </div>
          </div>

          {/* Active Filter summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              Tìm thấy <strong className="text-slate-900 dark:text-white font-bold">{totalItems}</strong> bài thi phù hợp
              {isFiltering ? ' (theo bộ lọc)' : ''}
            </span>
            <span>Trang {currentPage} / {totalPages || 1} • (10 bài/trang)</span>
          </div>
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

      {/* ── 6. Empty State (Khi chưa thi bài nào) ── */}
      {isEmpty && (
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
        <div className="space-y-4">
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
                          {hasSnapshot ? (
                            <Badge className="bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/30 text-[10px] font-bold">
                              📋 Chi Tiết Bài Thi
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-slate-500 font-medium">
                              Lượt thi tóm tắt
                            </Badge>
                          )}

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
