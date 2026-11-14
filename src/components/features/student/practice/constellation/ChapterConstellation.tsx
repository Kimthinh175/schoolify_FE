'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Lock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  chapterRoadmapService,
  CHAPTER_ROADMAP_UPDATED_EVENT,
  ChapterRoadmapNode,
  ChapterRoadmapResponse,
  CurriculumTrackCode,
  RoadmapDifficultyLevel,
} from '@/services/chapter-roadmap.service';
import {
  examPointsService,
  getCachedPointsBalance,
  getExamLevelCost,
} from '@/services/exam-points.service';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';
import { getSessionTopicContext, setSessionTopicContext } from '@/lib/topic-route-utils';
import { useAuthStore } from '@/store/auth.store';
import { TiaSangIcon } from '@/components/ui/point-icons';
import { cn } from '@/lib/utils';
import styles from './constellation.module.css';
import { SkyBackdrop } from './SkyBackdrop';
import { StarMap, type StarChapter, type StarState } from './StarMap';
import { ChapterCard, type LevelMeta } from './ChapterCard';
import { buildLayout, type SkyTheme } from './layout';

export interface StartChapterPracticePayload {
  subjectSlug: string;
  grade: 10 | 11 | 12;
  chapterId: number;
  chapterName: string;
  track: CurriculumTrackCode;
  level: RoadmapDifficultyLevel;
  durationMinutes: number;
  questionCount: number;
}

interface ChapterConstellationProps {
  subjectSlug: string;
  subjectName?: string;
  initialGrade?: number;
  initialTrack?: CurriculumTrackCode;
  initialLevel?: RoadmapDifficultyLevel;
  onStartPractice: (payload: StartChapterPracticePayload) => void;
  onRequestAuth?: () => void;
  /** 'page': phủ kín khung cha, 'embedded': bo góc, nằm trong một trang có nội dung khác */
  variant?: 'page' | 'embedded';
  className?: string;
}

const LEVELS: LevelMeta[] = [
  { code: 'BASIC', title: 'Cơ bản', prevLevelCode: null, prevLevelTitle: null },
  { code: 'MEDIUM', title: 'Trung bình', prevLevelCode: 'BASIC', prevLevelTitle: 'Cơ bản' },
  { code: 'ADVANCED', title: 'Nâng cao', prevLevelCode: 'MEDIUM', prevLevelTitle: 'Trung bình' },
];

const GRADES = [10, 11, 12] as const;

/** < 900px: bố cục xếp dọc, không scroll ngang */
function useIsNarrow(): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(max-width: 899px)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(max-width: 899px)').matches,
    () => false,
  );
}

export function ChapterConstellation({
  subjectSlug,
  subjectName,
  initialGrade,
  initialTrack,
  initialLevel,
  onStartPractice,
  onRequestAuth,
  variant = 'page',
  className,
}: ChapterConstellationProps) {
  const { user, isAuthenticated } = useAuthStore();
  const isLoggedIn = Boolean(isAuthenticated && user?.id);
  const narrow = useIsNarrow();

  // Khối lớp ưu tiên: initialGrade -> sessionStorage -> hồ sơ học sinh -> khách -> 12
  const resolvePreferredGrade = React.useCallback((): 10 | 11 | 12 => {
    const fromProp = parseHighSchoolGrade(initialGrade);
    if (fromProp) return fromProp;
    const fromSession = getSessionTopicContext().grade;
    if (fromSession) return fromSession;
    const fromUser = parseHighSchoolGrade(
      user?.student_profile?.grade_level ||
        (user as unknown as { gradeLevel?: string | number })?.gradeLevel,
    );
    if (fromUser) return fromUser;
    const guest = getGuestOnboarding();
    if (guest?.grade) return guest.grade;
    return 12;
  }, [initialGrade, user]);

  const resolvePreferredLevel = React.useCallback((): RoadmapDifficultyLevel => {
    if (initialLevel === 'BASIC' || initialLevel === 'MEDIUM' || initialLevel === 'ADVANCED') {
      return initialLevel;
    }
    return getSessionTopicContext().level || 'BASIC';
  }, [initialLevel]);

  const [isHydrated, setIsHydrated] = React.useState(false);
  const [selectedGrade, setSelectedGrade] = React.useState<10 | 11 | 12>(
    () => parseHighSchoolGrade(initialGrade) ?? 12,
  );
  const [gradeOpen, setGradeOpen] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<RoadmapDifficultyLevel>(
    () => initialLevel || 'BASIC',
  );
  const [selectedTrack, setSelectedTrack] = React.useState<CurriculumTrackCode>(
    initialTrack || (subjectSlug === 'toan-hoc' ? 'TOAN_SO' : 'DEFAULT'),
  );
  const [roadmap, setRoadmap] = React.useState<ChapterRoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeChapterId, setActiveChapterId] = React.useState<number | null>(null);
  const [jumpingId, setJumpingId] = React.useState<number | null>(null);
  const [pointsBalance, setPointsBalance] = React.useState<number | null>(null);
  const [guestTrialUsed, setGuestTrialUsed] = React.useState(0);

  // Đồng bộ khối lớp & mức độ trên client (không cần query trên URL)
  /* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage/hồ sơ sau hydration để tránh lệch SSR/CSR (không đọc được ở lần render đầu) */
  React.useEffect(() => {
    setSelectedGrade(resolvePreferredGrade());
    setSelectedLevel(resolvePreferredLevel());
    setIsHydrated(true);
  }, [resolvePreferredGrade, resolvePreferredLevel]);

  React.useEffect(() => {
    if (subjectSlug === 'toan-hoc') {
      const sessionTrack = getSessionTopicContext().track;
      if (initialTrack === 'TOAN_SO' || initialTrack === 'TOAN_HINH') {
        setSelectedTrack(initialTrack);
      } else if (sessionTrack === 'TOAN_SO' || sessionTrack === 'TOAN_HINH') {
        setSelectedTrack(sessionTrack);
      } else {
        setSelectedTrack((prev) => (prev === 'TOAN_SO' || prev === 'TOAN_HINH' ? prev : 'TOAN_SO'));
      }
    } else {
      setSelectedTrack('DEFAULT');
    }
  }, [subjectSlug, initialTrack]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const syncSideStats = React.useCallback(async () => {
    setGuestTrialUsed(getGuestOnboarding()?.trialUsedCount ?? 0);
    if (isLoggedIn) {
      const cached = getCachedPointsBalance();
      if (cached !== null) setPointsBalance(cached);
      try {
        const bal = await examPointsService.getBalance();
        if (bal && typeof bal.currentPoints === 'number') setPointsBalance(bal.currentPoints);
      } catch {
        // giữ giá trị cache
      }
    } else {
      setPointsBalance(null);
    }
  }, [isLoggedIn]);

  /* eslint-disable react-hooks/set-state-in-effect -- đồng bộ số dư Tia Sáng / lượt thử của khách từ storage + API khi mount */
  React.useEffect(() => {
    void syncSideStats();
  }, [syncSideStats]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getFrontier = React.useCallback(
    (
      track: ChapterRoadmapResponse['tracks'][number] | null | undefined,
      lvl: RoadmapDifficultyLevel,
    ): number | null => {
      if (!track) return null;
      if (track.frontierByLevel && track.frontierByLevel[lvl]) return track.frontierByLevel[lvl];
      const unlockedIncomplete = track.chapters.find(
        (c) => c.levels[lvl].unlocked && !c.levels[lvl].completed,
      );
      if (unlockedIncomplete) return unlockedIncomplete.id;
      const lastUnlocked = [...track.chapters].reverse().find((c) => c.levels[lvl].unlocked);
      return lastUnlocked?.id ?? track.chapters[0]?.id ?? null;
    },
    [],
  );

  const fetchRoadmap = React.useCallback(async () => {
    setIsLoading(true);
    const data = await chapterRoadmapService.getChapterRoadmap(subjectSlug, selectedGrade);
    setRoadmap(data);
    setIsLoading(false);

    if (data && data.tracks.length > 0) {
      const track = data.tracks.find((t) => t.trackCode === selectedTrack) || data.tracks[0];
      const frontier = getFrontier(track, selectedLevel);
      if (frontier) {
        setActiveChapterId((prev) =>
          track.chapters.some((c) => c.id === prev) ? prev : frontier,
        );
      }
    }
  }, [subjectSlug, selectedGrade, selectedTrack, selectedLevel, getFrontier]);

  /* eslint-disable react-hooks/set-state-in-effect -- nạp dữ liệu từ API khi lớp/mức/nhánh đổi: cần bật isLoading ngay */
  React.useEffect(() => {
    if (!isHydrated) return;
    void fetchRoadmap();
  }, [fetchRoadmap, isHydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onUpdated = () => {
      setSelectedGrade(resolvePreferredGrade());
      void fetchRoadmap();
      void syncSideStats();
    };
    window.addEventListener(CHAPTER_ROADMAP_UPDATED_EVENT, onUpdated);
    window.addEventListener('schoolify-guest-onboarding-updated', onUpdated);
    window.addEventListener('tokens-updated', onUpdated);
    return () => {
      window.removeEventListener(CHAPTER_ROADMAP_UPDATED_EVENT, onUpdated);
      window.removeEventListener('schoolify-guest-onboarding-updated', onUpdated);
      window.removeEventListener('tokens-updated', onUpdated);
    };
  }, [fetchRoadmap, resolvePreferredGrade, syncSideStats]);

  const track = React.useMemo(() => {
    if (!roadmap?.tracks?.length) return null;
    return roadmap.tracks.find((t) => t.trackCode === selectedTrack) || roadmap.tracks[0];
  }, [roadmap, selectedTrack]);

  const level = LEVELS.find((l) => l.code === selectedLevel) ?? LEVELS[0];
  const frontierId = React.useMemo(() => getFrontier(track, selectedLevel), [track, selectedLevel, getFrontier]);
  const chapters = React.useMemo<ChapterRoadmapNode[]>(() => track?.chapters ?? [], [track]);

  const levelSummaries = React.useMemo(() => {
    const first = chapters[0] ?? null;
    return Object.fromEntries(
      LEVELS.map((l) => [
        l.code,
        {
          entryUnlocked: first ? first.levels[l.code].unlocked : l.code === 'BASIC',
          cost: first?.levels[l.code].costPoints ?? getExamLevelCost(l.code).costPoints,
        },
      ]),
    ) as Record<RoadmapDifficultyLevel, { entryUnlocked: boolean; cost: number }>;
  }, [chapters]);

  const starChapters = React.useMemo<StarChapter[]>(
    () =>
      chapters.map((c) => {
        const s = c.levels[selectedLevel];
        const state: StarState = s.completed
          ? 'done'
          : s.unlocked
            ? c.id === frontierId
              ? 'cur'
              : 'open'
            : 'lock';
        return { id: c.id, order: c.trackOrder, shortName: c.shortName, name: c.name, state };
      }),
    [chapters, selectedLevel, frontierId],
  );

  const selectedNode =
    chapters.find((c) => c.id === activeChapterId) ??
    chapters.find((c) => c.id === frontierId) ??
    chapters[0] ??
    null;

  const theme: SkyTheme =
    subjectSlug === 'tin-hoc' ? 'tin' : selectedTrack === 'TOAN_HINH' ? 'hinh' : 'so';
  const layout = React.useMemo(
    () => buildLayout(chapters.length || 4, narrow, theme),
    [chapters.length, narrow, theme],
  );

  const savedUserGrade = React.useMemo(() => {
    const fromUser = parseHighSchoolGrade(
      user?.student_profile?.grade_level ||
        (user as unknown as { gradeLevel?: string | number })?.gradeLevel,
    );
    return fromUser || getGuestOnboarding()?.grade || null;
  }, [user]);

  const displaySubjectName = subjectName || (subjectSlug === 'tin-hoc' ? 'Tin Học' : 'Toán Học');
  const doneCount = starChapters.filter((c) => c.state === 'done').length;

  const handleSelectGrade = (g: 10 | 11 | 12) => {
    setSelectedGrade(g);
    setSessionTopicContext({ grade: g });
    setActiveChapterId(null);
    setGradeOpen(false);
  };

  const handleSelectLevel = (lvl: RoadmapDifficultyLevel) => {
    setSelectedLevel(lvl);
    setSessionTopicContext({ level: lvl });
    setActiveChapterId(getFrontier(track, lvl));
  };

  const handleSelectTrack = (code: CurriculumTrackCode) => {
    setSelectedTrack(code);
    setSessionTopicContext({ track: code });
    const target = roadmap?.tracks.find((t) => t.trackCode === code);
    setActiveChapterId(getFrontier(target, selectedLevel));
  };

  const startPractice = (node: ChapterRoadmapNode) =>
    onStartPractice({
      subjectSlug,
      grade: selectedGrade,
      chapterId: node.id,
      chapterName: node.name,
      track: node.track,
      level: selectedLevel,
      durationMinutes: 15,
      questionCount: 10,
    });

  const handleManualJump = async (node: ChapterRoadmapNode) => {
    setJumpingId(node.id);
    try {
      if (isLoggedIn) {
        const ok = await chapterRoadmapService.unlockChapterJump({
          subject: subjectSlug,
          grade: selectedGrade,
          chapterId: node.id,
          level: selectedLevel,
        });
        if (ok) {
          toast.success(`Đã mở khóa "${node.shortName}" trên lộ trình ${level.title}!`);
          await fetchRoadmap();
          setActiveChapterId(node.id);
        } else {
          toast.error('Không thể mở khóa chương lúc này, vui lòng thử lại.');
        }
      } else {
        startPractice(node);
      }
    } finally {
      setJumpingId(null);
    }
  };

  const chip =
    'inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[13px] font-semibold backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70';

  return (
    <section
      data-testid="chapter-constellation"
      aria-label={`Bản đồ chòm sao chuyên đề ${displaySubjectName}`}
      className={cn(styles.sky, variant === 'embedded' && styles.rounded, className)}
    >
      <SkyBackdrop theme={theme} />

      {/* ----- Bản đồ sao / trạng thái tải ----- */}
      {isLoading && !roadmap ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center gap-2 text-sm text-slate-300" role="status">
          <Loader2 className="h-4 w-4 animate-spin text-[#00B8DD]" aria-hidden="true" />
          Đang vẽ chòm sao...
        </div>
      ) : !track ? (
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm font-semibold text-slate-200">
            Chưa tải được bản đồ chương cho môn {displaySubjectName}.
          </p>
          <button
            type="button"
            onClick={() => void fetchRoadmap()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold text-white hover:border-[#00B8DD] hover:bg-[#00B8DD]/12 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Thử tải lại
          </button>
        </div>
      ) : (
        <StarMap
          layout={layout}
          mobile={narrow}
          chapters={starChapters}
          selectedId={selectedNode?.id ?? null}
          onSelect={setActiveChapterId}
        />
      )}

      {/* ----- Góc trái trên: tiêu đề, khối lớp, nhánh ----- */}
      <div className={cn(styles.hud, styles.tl)}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5CE1FF]">Chuyên đề</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setGradeOpen((v) => !v)}
              aria-expanded={gradeOpen}
              aria-haspopup="listbox"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-bold text-white backdrop-blur-md hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70"
            >
              Lớp {selectedGrade}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', gradeOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {gradeOpen && (
              <ul
                role="listbox"
                aria-label="Chọn khối lớp"
                className="absolute left-0 top-full z-10 mt-1 min-w-[150px] overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 p-1 backdrop-blur-xl"
                onKeyDown={(e) => e.key === 'Escape' && setGradeOpen(false)}
              >
                {GRADES.map((g) => (
                  <li key={g} role="option" aria-selected={g === selectedGrade}>
                    <button
                      type="button"
                      onClick={() => handleSelectGrade(g)}
                      className={cn(
                        'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-semibold cursor-pointer hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70',
                        g === selectedGrade ? 'text-white' : 'text-slate-300',
                      )}
                    >
                      Lớp {g}
                      {isHydrated && savedUserGrade === g && (
                        <span className="rounded bg-[#00B8DD]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#5CE1FF]">Của bạn</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <h1 className="mt-1 text-[28px] font-extrabold leading-[1.1] tracking-tight text-white md:text-[34px]">
          {displaySubjectName}
        </h1>

        {subjectSlug === 'toan-hoc' && roadmap && roadmap.tracks.length > 1 && (
          <div role="tablist" aria-label="Nhánh chuyên đề" className="mt-3 flex flex-wrap gap-x-5">
            {roadmap.tracks.map((t) => {
              const on = selectedTrack === t.trackCode;
              return (
                <button
                  key={t.trackCode}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => handleSelectTrack(t.trackCode)}
                  className={cn(
                    'min-h-[44px] px-0.5 text-sm font-semibold border-b-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70',
                    on ? 'border-[#00B8DD] text-white' : 'border-transparent text-slate-400 hover:text-white',
                  )}
                >
                  {t.shortTitle}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ----- Góc phải trên: 3 mức tư duy ----- */}
      <div className={cn(styles.hud, styles.tr)} role="group" aria-label="Mức tư duy">
        {LEVELS.map((l) => {
          const on = selectedLevel === l.code;
          const sum = levelSummaries[l.code];
          return (
            <button
              key={l.code}
              type="button"
              aria-pressed={on}
              onClick={() => handleSelectLevel(l.code)}
              className={cn(
                chip,
                on
                  ? 'border-[#00B8DD] bg-[#00B8DD]/20 text-white'
                  : sum.entryUnlocked
                    ? 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/10',
              )}
            >
              {!sum.entryUnlocked && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              {l.title}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B]">
                <TiaSangIcon className="h-3 w-3" />
                {sum.cost}
              </span>
            </button>
          );
        })}
      </div>

      {/* ----- Góc trái dưới: tiến độ + số dư + chú thích ----- */}
      <div className={cn(styles.hud, styles.bl)}>
        <p className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-200">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {starChapters.map((c) => (
              <i
                key={c.id}
                className={cn(
                  'inline-block rounded-full not-italic',
                  c.state === 'done' && 'h-2 w-2 bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.9)]',
                  c.state === 'cur' && 'text-[13px] leading-none text-white [text-shadow:0_0_8px_#00B8DD]',
                  c.state === 'open' && 'h-2 w-2 border-[1.5px] border-[#00B8DD]',
                  c.state === 'lock' && 'h-2 w-2 border-[1.5px] border-slate-500',
                )}
              >
                {c.state === 'cur' ? '✦' : ''}
              </i>
            ))}
          </span>
          <span>
            {doneCount}/{starChapters.length} chương · {level.title}
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
          <TiaSangIcon className="h-3.5 w-3.5" />
          {isLoggedIn ? (
            <span>
              <b className="text-[#F59E0B]">{pointsBalance ?? '--'}</b> Tia Sáng
            </span>
          ) : (
            <>
              <span>
                <b className="text-[#F59E0B]">{Math.max(0, 1 - guestTrialUsed)}</b> đề thử miễn phí
              </span>
              <span aria-hidden="true">·</span>
              {onRequestAuth ? (
                <button
                  type="button"
                  onClick={onRequestAuth}
                  className="inline-flex min-h-[44px] items-center rounded-md font-semibold text-[#5CE1FF] underline-offset-4 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70 min-[900px]:min-h-[28px]"
                >
                  Đăng nhập để lưu tiến độ
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center font-semibold text-[#5CE1FF] underline-offset-4 hover:underline min-[900px]:min-h-[28px]"
                >
                  Đăng nhập để lưu tiến độ
                </Link>
              )}
            </>
          )}
        </p>
        <p className="flex items-center gap-3.5 text-[11px] text-slate-400" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            Đã qua
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="not-italic text-xs text-white [text-shadow:0_0_6px_#00B8DD]">✦</i>
            Đang ở đây
          </span>
        </p>
      </div>

      {/* ----- Góc phải dưới: thẻ chi tiết chương đang chọn ----- */}
      <div className={cn(styles.hud, styles.br)}>
        {selectedNode && (
          <ChapterCard
            node={selectedNode}
            level={level}
            isJumping={jumpingId === selectedNode.id}
            onStart={() => startPractice(selectedNode)}
            onGoPrevLevel={handleSelectLevel}
            onJump={() => void handleManualJump(selectedNode)}
          />
        )}
      </div>

      <p className={styles.hint}>Chạm vào một ngôi sao để xem chương</p>
    </section>
  );
}
