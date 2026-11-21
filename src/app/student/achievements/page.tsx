'use client';

import * as React from 'react';
import { Trophy, Sparkles, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { achievementsService, AchievementItem, AchievementSummary } from '@/services/achievements.service';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất Cả' },
  { id: 'EXAM', label: 'Luyện Đề' },
  { id: 'SCORE', label: 'Điểm Số' },
  { id: 'STREAK', label: 'Chuyên Cần' },
  { id: 'FORUM', label: 'Diễn Đàn' },
];

export default function StudentAchievementsPage() {
  const [items, setItems] = React.useState<AchievementItem[]>([]);
  const [summary, setSummary] = React.useState<AchievementSummary>({
    total: 0,
    unlockedCount: 0,
    totalRewardDiamonds: 0,
  });
  const [category, setCategory] = React.useState('ALL');
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await achievementsService.getMyAchievements();
    setItems(res.items || []);
    setSummary(res.summary || { total: 0, unlockedCount: 0, totalRewardDiamonds: 0 });
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered =
    category === 'ALL' ? items : items.filter((it) => it.category === category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" className="text-[11px] font-bold">
              Huy Hiệu & Danh Hiệu
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Thành Tựu Học Tập</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hoàn thành mục tiêu luyện đề, điểm danh và đóng góp diễn đàn để mở khóa huy hiệu & nhận Ngọc Tri Thức.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          leftIcon={<RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />}
        >
          Làm mới tiến độ
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/12 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đã mở khóa</p>
            <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
              {summary.unlockedCount} / {summary.total}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#00B8DD]/12 text-[#009BBD] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Ngọc thưởng đã nhận</p>
            <p className="text-xl font-black text-[#009BBD] tabular-nums">
              +{summary.totalRewardDiamonds} 💎
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/12 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tỉ lệ hoàn thành</p>
            <p className="text-xl font-black text-emerald-600 tabular-nums">
              {summary.total > 0 ? Math.round((summary.unlockedCount / summary.total) * 100) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border',
              category === c.id
                ? 'bg-[#00B8DD] text-white border-[#00B8DD] shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/40'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading && items.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải danh sách thành tựu...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Chưa có thành tựu nào trong nhóm này.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => {
            const pct =
              ach.threshold > 0
                ? Math.min(100, Math.round((ach.progress / ach.threshold) * 100))
                : 0;
            return (
              <Card
                key={ach.id}
                className={cn(
                  'p-5 flex flex-col justify-between gap-4 transition-all border',
                  ach.unlocked
                    ? 'border-amber-300/70 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/15 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-800 opacity-90'
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0',
                      ach.unlocked
                        ? 'bg-amber-400/20 ring-2 ring-amber-400/40'
                        : 'bg-slate-100 dark:bg-slate-800 grayscale opacity-75'
                    )}
                  >
                    {ach.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {ach.title}
                      </h3>
                      {ach.unlocked ? (
                        <Badge variant="success" className="text-[10px] shrink-0">
                          Đã mở
                        </Badge>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">
                      Tiến độ: {ach.progress}/{ach.threshold}
                    </span>
                    <span className="text-[#009BBD] font-bold">+{ach.rewardDiamonds} 💎</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        ach.unlocked ? 'bg-amber-500' : 'bg-[#00B8DD]'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
