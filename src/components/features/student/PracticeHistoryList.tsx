'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar, Clock, History, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExamSnapshotModal } from '@/components/features/student/practice/ExamSnapshotModal';
import {
  examSnapshotService,
  ExamSnapshot,
  EXAM_SNAPSHOTS_EVENT,
} from '@/services/exam-snapshot.service';
import { studentExamsService, PracticeHistoryItem } from '@/services/student-exams.service';

const BLOOM_LEVELS = [
  { key: 'EASY', label: 'Nhận biết', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'MEDIUM', label: 'Thông hiểu', color: 'text-cyan-600 dark:text-cyan-400' },
  { key: 'HARD', label: 'Vận dụng', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'VERY_HARD', label: 'Vận dụng cao', color: 'text-rose-600 dark:text-rose-400' },
] as const;

const HISTORY_BREAKDOWN_KEYS = ['nhanBiet', 'thongHieu', 'vanDung', 'vanDungCao'] as const;

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

function BloomGrid({ values }: { values: string[] }) {
  return (
    <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      {BLOOM_LEVELS.map((level, i) => (
        <div
          key={level.key}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
        >
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">{level.label}</span>
          <span className={`font-bold ${level.color}`}>{values[i]}</span>
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

/** Danh sách lịch sử luyện đề (snapshot chi tiết + lượt luyện tóm tắt) - dữ liệu từ Demo JSON DB */
export function PracticeHistoryList({ showHeader = true }: PracticeHistoryListProps) {
  const [snapshots, setSnapshots] = React.useState<ExamSnapshot[]>([]);
  const [history, setHistory] = React.useState<PracticeHistoryItem[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedSnapshot, setSelectedSnapshot] = React.useState<ExamSnapshot | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [snaps, items] = await Promise.all([
        examSnapshotService.getExamSnapshots(),
        studentExamsService.getPracticeHistory(),
      ]);
      setSnapshots(snaps);
      setHistory(items);
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

  const isEmpty = status === 'ready' && snapshots.length === 0 && history.length === 0;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Lịch Sử Luyện Đề Ma Trận</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Các bài thi thử bạn đã làm cùng chi tiết 4 mức độ nhận thức Bloom.
            </p>
          </div>
          <Link href="/luyen-thi" className="shrink-0">
            <Button
              className="min-h-[44px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 rounded-xl cursor-pointer"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Luyện Đề Mới Ngay
            </Button>
          </Link>
        </div>
      )}

      {status === 'loading' && <HistorySkeleton />}

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

      {isEmpty && (
        <Card className="p-8 rounded-3xl text-center space-y-3 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
            <History className="w-6 h-6 text-[#00B8DD]" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bạn chưa luyện đề nào</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Làm thử một đề ma trận để Schoolify lưu lại kết quả và gợi ý phần cần ôn thêm cho bạn.
          </p>
          <Link href="/luyen-thi" className="inline-block">
            <Button className="min-h-[44px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl">
              Vào Cổng Luyện Thi Ngay
            </Button>
          </Link>
        </Card>
      )}

      {status === 'ready' && !isEmpty && (
        <ul className="space-y-3.5" aria-label="Lịch sử luyện đề">
          {snapshots.map((snap) => (
            <li key={snap.id}>
              <Card className="p-5 border-2 border-[#00B8DD]/30 rounded-3xl hover:border-[#00B8DD] transition-all bg-gradient-to-r from-white via-cyan-50/20 to-white dark:from-slate-900 dark:via-cyan-950/20 dark:to-slate-900 shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/40 text-[10px] font-bold">
                        📋 CHI TIẾT BÀI THI
                      </Badge>
                      <Badge className="bg-cyan-50 text-[#007D99] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-[10px] font-bold">
                        {snap.subjectName}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-slate-500">
                        Lớp {snap.grade}
                      </Badge>
                      {snap.remediation?.attempted && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-[10px] font-bold">
                          ✓ Đã khắc phục ({snap.remediation.correctCount}/{snap.remediation.totalQuestions} câu)
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden /> {formatDate(snap.createdAt)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden /> {Math.floor(snap.timeSpentSeconds / 60)}p{' '}
                        {snap.timeSpentSeconds % 60}s
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{snap.examTitle}</h4>
                    <BloomGrid
                      values={BLOOM_LEVELS.map(({ key }) => {
                        const b = snap.bloomSummary?.[key];
                        return b && b.total > 0 ? `${b.correct}/${b.total}` : '-';
                      })}
                    />
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="lg:text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Điểm ban đầu</span>
                      <p className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
                        {snap.originalExam.finalScore}{' '}
                        <span className="text-xs text-slate-400 font-normal">/ 10</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSnapshot(snap);
                          setIsSnapshotOpen(true);
                        }}
                        className="min-h-[44px] bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs rounded-xl cursor-pointer"
                        leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                      >
                        Xem Lại Đề Thi
                      </Button>
                      <Link
                        href={`/student/practice/exam-room?subject=${snap.subjectSlug}&chapter=${snap.chapterId}&grade=${snap.grade}`}
                      >
                        <Button variant="outline" size="sm" className="min-h-[44px] text-xs font-bold rounded-xl cursor-pointer">
                          Thi Lại
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}

          {history.map((item) => (
            <li key={item.id}>
              <Card className="p-5 border-slate-200 dark:border-slate-800 rounded-3xl hover:border-cyan-500/40 transition-all bg-white dark:bg-slate-900 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-cyan-50 text-[#007D99] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-[10px] font-bold">
                        {item.subject}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-slate-500">
                        {item.level}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden /> {formatDate(item.createdAt)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden /> {item.timeSpentMinutes} phút
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <BloomGrid values={HISTORY_BREAKDOWN_KEYS.map((k) => item.breakdown[k])} />
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="lg:text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Đúng {item.correctQuestions}/{item.totalQuestions} câu
                      </span>
                      <p className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
                        {item.score} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                      </p>
                    </div>
                    <Link href="/luyen-thi">
                      <Button variant="outline" size="sm" className="min-h-[44px] text-xs font-bold rounded-xl cursor-pointer">
                        Luyện Lại
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ExamSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        snapshot={selectedSnapshot}
      />
    </div>
  );
}
