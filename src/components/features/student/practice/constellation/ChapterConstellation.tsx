'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  chapterRoadmapService,
  CHAPTER_ROADMAP_UPDATED_EVENT,
  ChapterRoadmapNode,
  ChapterRoadmapResponse,
  ChapterRoadmapTrack,
  CurriculumTrackCode,
  RoadmapDifficultyLevel,
} from '@/services/chapter-roadmap.service';
import {
  examPointsService,
  getCachedPointsBalance,
  getExamLevelCost,
} from '@/services/exam-points.service';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';
import {
  getSessionTopicContext,
  setSessionTopicContext,
  type TopicRoadmapTrackCode,
} from '@/lib/topic-route-utils';
import { useAuthStore } from '@/store/auth.store';
import { TiaSangIcon } from '@/components/ui/point-icons';
import { cn } from '@/lib/utils';
import styles from './constellation.module.css';
import { SkyBackdrop } from './SkyBackdrop';
import { StarMap, type StarChapter, type StarState } from './StarMap';
import { ChapterCard, type LevelMeta } from './ChapterCard';
import { buildLayout, parseChapterSortAndLabel, type SkyTheme } from './layout';

type TrackFilter = 'ALL' | CurriculumTrackCode;

function buildCombinedAllTrack(
  tracks: ChapterRoadmapTrack[],
): ChapterRoadmapTrack | null {
  if (!tracks.length) return null;
  if (tracks.length === 1) return tracks[0];

  const merged = tracks
    .flatMap((t) => t.chapters)
    .sort((a, b) => {
      const ka = parseChapterSortAndLabel(a.name, a.trackOrder).sortKey;
      const kb = parseChapterSortAndLabel(b.name, b.trackOrder).sortKey;
      if (ka !== kb) return ka - kb;
      return a.id - b.id;
    });

  const resolveFrontier = (lvl: RoadmapDifficultyLevel): number | null => {
    const curSem = merged.find(
      (n) => n.levels[lvl].unlocked && n.isCurrentSemester && !n.levels[lvl].completed,
    );
    const anyIncomplete = merged.find(
      (n) => n.levels[lvl].unlocked && !n.levels[lvl].completed,
    );
    const lastUnlocked = [...merged].reverse().find((n) => n.levels[lvl].unlocked);
    return curSem?.id ?? anyIncomplete?.id ?? lastUnlocked?.id ?? merged[0]?.id ?? null;
  };

  const frontierByLevel = {
    BASIC: resolveFrontier('BASIC'),
    MEDIUM: resolveFrontier('MEDIUM'),
    ADVANCED: resolveFrontier('ADVANCED'),
  };

  return {
    trackCode: 'DEFAULT',
    trackTitle: 'Toàn bộ chương trình',
    shortTitle: 'Tất cả',
    frontierChapterId: frontierByLevel.BASIC,
    frontierByLevel,
    totalChapters: merged.length,
    completedBasicCount: merged.filter((n) => n.levels.BASIC.completed).length,
    completedMediumCount: merged.filter((n) => n.levels.MEDIUM.completed).length,
    completedAdvancedCount: merged.filter((n) => n.levels.ADVANCED.completed).length,
    totalCrowns: merged.reduce((acc, n) => acc + n.crownsEarned, 0),
    maxCrowns: merged.length * 3,
    chapters: merged,
  };
}

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
  onGradeChange?: (grade: 10 | 11 | 12) => void;
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
  onGradeChange,
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
  const [selectedTrack, setSelectedTrack] = React.useState<TrackFilter>(() => {
    if (initialTrack === 'TOAN_SO' || initialTrack === 'TOAN_HINH') return initialTrack;
    return subjectSlug === 'toan-hoc' ? 'ALL' : 'DEFAULT';
  });
  const [roadmap, setRoadmap] = React.useState<ChapterRoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeChapterId, setActiveChapterId] = React.useState<number | null>(null);
  const [jumpingId, setJumpingId] = React.useState<number | null>(null);
  const [pointsBalance, setPointsBalance] = React.useState<number | null>(null);
  const [guestTrialUsed, setGuestTrialUsed] = React.useState(0);

  const panViewportRef = React.useRef<HTMLDivElement | null>(null);
  const cardWrapRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = React.useState({ w: 1200, h: 640 });
  const [cardHeight, setCardHeight] = React.useState(195);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragRef = React.useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const justDraggedRef = React.useRef(false);
  const smoothNextScrollRef = React.useRef(false);

  // Đồng bộ khối lớp & mức độ trên client (không cần query trên URL)
  /* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage/hồ sơ sau hydration để tránh lệch SSR/CSR (không đọc được ở lần render đầu) */
  React.useEffect(() => {
    setSelectedGrade(resolvePreferredGrade());
    setSelectedLevel(resolvePreferredLevel());
    setIsHydrated(true);
  }, [resolvePreferredGrade, resolvePreferredLevel]);

  React.useEffect(() => {
    if (subjectSlug === 'toan-hoc') {
      const ctx = getSessionTopicContext();
      if (initialTrack === 'TOAN_SO' || initialTrack === 'TOAN_HINH') {
        setSelectedTrack(initialTrack);
      } else if (
        ctx.trackExplicit &&
        (ctx.track === 'ALL' || ctx.track === 'TOAN_SO' || ctx.track === 'TOAN_HINH')
      ) {
        setSelectedTrack(ctx.track);
      } else {
        setSelectedTrack('ALL');
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

  const resolveActiveTrack = React.useCallback(
    (
      data: ChapterRoadmapResponse | null,
      filter: TrackFilter,
    ): ChapterRoadmapTrack | null => {
      if (!data?.tracks?.length) return null;
      if (filter === 'ALL' && data.tracks.length > 1) {
        return buildCombinedAllTrack(data.tracks);
      }
      return data.tracks.find((t) => t.trackCode === filter) || data.tracks[0];
    },
    [],
  );

  const getFrontier = React.useCallback(
    (
      t: ChapterRoadmapTrack | null | undefined,
      lvl: RoadmapDifficultyLevel,
    ): number | null => {
      if (!t) return null;
      if (t.frontierByLevel && t.frontierByLevel[lvl]) return t.frontierByLevel[lvl];
      const unlockedIncomplete = t.chapters.find(
        (c) => c.levels[lvl].unlocked && !c.levels[lvl].completed,
      );
      if (unlockedIncomplete) return unlockedIncomplete.id;
      const lastUnlocked = [...t.chapters].reverse().find((c) => c.levels[lvl].unlocked);
      return lastUnlocked?.id ?? t.chapters[0]?.id ?? null;
    },
    [],
  );

  const fetchRoadmap = React.useCallback(async () => {
    setIsLoading(true);
    const data = await chapterRoadmapService.getChapterRoadmap(subjectSlug, selectedGrade);
    setRoadmap(data);
    setIsLoading(false);

    if (data && data.tracks.length > 0) {
      const resolvedTrack = resolveActiveTrack(data, selectedTrack);
      const frontier = getFrontier(resolvedTrack, selectedLevel);
      if (resolvedTrack && frontier) {
        setActiveChapterId((prev) =>
          resolvedTrack.chapters.some((c) => c.id === prev) ? prev : frontier,
        );
      }
    }
  }, [subjectSlug, selectedGrade, selectedTrack, selectedLevel, resolveActiveTrack, getFrontier]);

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

  const track = React.useMemo(
    () => resolveActiveTrack(roadmap, selectedTrack),
    [roadmap, selectedTrack, resolveActiveTrack],
  );

  const level = LEVELS.find((l) => l.code === selectedLevel) ?? LEVELS[0];
  const frontierId = React.useMemo(() => getFrontier(track, selectedLevel), [track, selectedLevel, getFrontier]);
  const chapters = React.useMemo<ChapterRoadmapNode[]>(() => track?.chapters ?? [], [track]);

  const chapterLabelsById = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const c of chapters) {
      map.set(c.id, parseChapterSortAndLabel(c.name, c.trackOrder).eyebrow);
    }
    return map;
  }, [chapters]);

  const levelSummaries = React.useMemo(() => {
    const first = chapters[0] ?? null;
    return Object.fromEntries(
      LEVELS.map((l) => [
        l.code,
        {
          entryUnlocked:
            chapters.length > 0
              ? chapters.some((c) => c.levels[l.code].unlocked)
              : l.code === 'BASIC',
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
        return {
          id: c.id,
          order: c.trackOrder,
          chapterLabel: chapterLabelsById.get(c.id) || `Chương ${c.trackOrder}`,
          shortName: c.shortName,
          name: c.name,
          state,
        };
      }),
    [chapters, selectedLevel, frontierId, chapterLabelsById],
  );

  const selectedNode =
    chapters.find((c) => c.id === activeChapterId) ??
    chapters.find((c) => c.id === frontierId) ??
    chapters[0] ??
    null;

  const selectedIndex = React.useMemo(
    () => (selectedNode ? chapters.findIndex((c) => c.id === selectedNode.id) : -1),
    [chapters, selectedNode],
  );

  const theme: SkyTheme =
    subjectSlug === 'tin-hoc' ? 'tin' : selectedTrack === 'TOAN_HINH' ? 'hinh' : 'so';
  const layout = React.useMemo(
    () => buildLayout(chapters.length || 4, narrow, theme),
    [chapters.length, narrow, theme],
  );

  // Theo dõi kích thước khung pan (desktop) & chiều cao thẻ chương
  React.useEffect(() => {
    if (narrow) return;
    const vp = panViewportRef.current;
    if (!vp) return;
    const syncVp = () => {
      setViewportSize({
        w: vp.clientWidth || 1200,
        h: vp.clientHeight || 640,
      });
    };
    syncVp();
    const ro = new ResizeObserver(syncVp);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [narrow, track, isLoading]);

  React.useEffect(() => {
    if (narrow) return;
    const cardEl = cardWrapRef.current;
    if (!cardEl) return;
    const syncCard = () => {
      const h = cardEl.offsetHeight;
      if (h > 0) setCardHeight(h);
    };
    syncCard();
    const ro = new ResizeObserver(syncCard);
    ro.observe(cardEl);
    return () => ro.disconnect();
  }, [narrow, selectedNode?.id, selectedLevel, jumpingId]);

  const scale = viewportSize.h > 0 ? viewportSize.h / layout.h : 1;
  const rawMapW = layout.w * scale;
  const canvasW = Math.max(viewportSize.w, Math.round(rawMapW));
  const offsetX = (canvasW - rawMapW) / 2;

  const selectedSvgPos = selectedIndex >= 0 ? layout.pos[selectedIndex] : null;
  const starPx = selectedSvgPos ? offsetX + selectedSvgPos.x * scale : 0;
  const starPy = selectedSvgPos ? selectedSvgPos.y * scale : 0;

  const cardWidth = 320;
  const belowTop = starPy + 28;
  const bottomClearance = 92;
  const topClearance = 132;
  const fitsBelow = belowTop + cardHeight <= viewportSize.h - bottomClearance;

  let cardLeft = starPx - cardWidth / 2;
  let cardTop = belowTop;
  let caretSide: 'top' | 'left' | 'right' = 'top';

  if (!fitsBelow && selectedSvgPos) {
    const canPlaceRight = starPx + 40 + cardWidth <= canvasW - 24;
    if (canPlaceRight) {
      cardLeft = starPx + 40;
      caretSide = 'left';
    } else {
      cardLeft = starPx - cardWidth - 40;
      caretSide = 'right';
    }
    cardTop = Math.max(
      topClearance,
      Math.min(viewportSize.h - cardHeight - 28, starPy - cardHeight / 2),
    );
  }
  cardLeft = Math.max(24, Math.min(canvasW - cardWidth - 24, cardLeft));
  const caretOffsetPx =
    caretSide === 'top'
      ? Math.max(24, Math.min(cardWidth - 24, starPx - cardLeft))
      : undefined;

  // Tự động cuộn mượt để chương đang chọn & thẻ nổi luôn nằm gọn trong màn hình
  React.useEffect(() => {
    if (narrow || !panViewportRef.current || !selectedSvgPos) return;
    const el = panViewportRef.current;
    const maxScroll = Math.max(0, canvasW - el.clientWidth);
    if (maxScroll <= 0) return;
    const focusX =
      caretSide === 'left'
        ? starPx + 140
        : caretSide === 'right'
          ? starPx - 140
          : starPx;
    const targetLeft = Math.max(0, Math.min(maxScroll, focusX - el.clientWidth / 2));
    el.scrollTo({
      left: targetLeft,
      behavior: smoothNextScrollRef.current ? 'smooth' : 'auto',
    });
    smoothNextScrollRef.current = false;
  }, [
    selectedNode?.id,
    selectedTrack,
    selectedGrade,
    narrow,
    canvasW,
    starPx,
    selectedSvgPos,
    caretSide,
  ]);

  const selectChapter = React.useCallback((id: number) => {
    smoothNextScrollRef.current = true;
    setActiveChapterId(id);
  }, []);

  const stepChapter = React.useCallback(
    (delta: -1 | 1) => {
      if (!chapters.length) return;
      const curIdx = selectedIndex >= 0 ? selectedIndex : 0;
      const nextIdx = Math.max(0, Math.min(chapters.length - 1, curIdx + delta));
      const nextChapter = chapters[nextIdx];
      if (nextChapter && nextChapter.id !== selectedNode?.id) {
        selectChapter(nextChapter.id);
      } else if (panViewportRef.current) {
        panViewportRef.current.scrollBy({
          left: delta * 260,
          behavior: 'smooth',
        });
      }
    },
    [chapters, selectedIndex, selectedNode?.id, selectChapter],
  );

  // Phím mũi tên trái/phải hoặc A/D để lướt qua lại các chương (Desktop)
  React.useEffect(() => {
    if (narrow) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (gradeOpen || chapters.length === 0) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        stepChapter(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        stepChapter(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [narrow, gradeOpen, chapters.length, stepChapter]);

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
    onGradeChange?.(g);
  };

  const handleSelectLevel = (lvl: RoadmapDifficultyLevel) => {
    setSelectedLevel(lvl);
    setSessionTopicContext({ level: lvl });
    smoothNextScrollRef.current = true;
    setActiveChapterId(getFrontier(track, lvl));
  };

  const handleSelectTrack = (code: TrackFilter) => {
    setSelectedTrack(code);
    setSessionTopicContext({
      track: code as TopicRoadmapTrackCode,
      trackExplicit: true,
    });
    const target = resolveActiveTrack(roadmap, code);
    smoothNextScrollRef.current = false;
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

  const handlePanPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement | null)?.closest('[data-chapter-card]')) return;
    const el = panViewportRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handlePanPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !panViewportRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 5) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }
    if (dragRef.current.moved) {
      panViewportRef.current.scrollLeft = dragRef.current.startScrollLeft - dx;
    }
  };

  const handlePanPointerEnd = () => {
    if (dragRef.current.moved) {
      justDraggedRef.current = true;
      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 60);
    }
    dragRef.current.active = false;
    dragRef.current.moved = false;
    setIsDragging(false);
  };

  const handlePanWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = panViewportRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
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
      ) : narrow ? (
        /* Mobile (< 900px): lộ trình dọc, thẻ chi tiết mở ngay tại chương đang chọn, không scroll ngang */
        <div className={styles.mobileTrack} role="list" aria-label="Danh sách các chương">
          {chapters.map((c, idx) => {
            const star = starChapters[idx];
            const isSelected = selectedNode?.id === c.id;
            const eyebrow = chapterLabelsById.get(c.id) || `Chương ${c.trackOrder}`;
            const state = star?.state ?? 'lock';
            return (
              <div key={c.id} role="listitem" className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => selectChapter(c.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70',
                    isSelected
                      ? 'border-[#00B8DD] bg-[#00B8DD]/15 text-white'
                      : 'border-white/10 bg-slate-900/55 text-slate-200 hover:border-white/25 hover:bg-slate-900/75',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                      state === 'done' &&
                        'border-[#10B981]/60 bg-[#10B981]/20 text-[#34D399]',
                      state === 'cur' &&
                        'border-[#5CE1FF] bg-[#00B8DD]/25 text-white shadow-[0_0_12px_rgba(0,184,221,0.55)]',
                      state === 'open' &&
                        'border-[#00B8DD]/60 bg-[#0E1626] text-[#5CE1FF]',
                      state === 'lock' &&
                        'border-slate-700 bg-slate-900/80 text-slate-500',
                    )}
                  >
                    {state === 'cur' ? '✦' : state === 'done' ? '✓' : idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.12em]',
                        state === 'lock'
                          ? 'text-slate-400'
                          : state === 'done'
                            ? 'text-[#34D399]'
                            : 'text-[#5CE1FF]',
                      )}
                    >
                      {eyebrow}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-semibold leading-snug">
                      {c.shortName}
                    </p>
                  </div>
                </button>

                {isSelected && (
                  <ChapterCard
                    node={c}
                    chapterLabel={eyebrow}
                    level={level}
                    isJumping={jumpingId === c.id}
                    caretSide="top"
                    onStart={() => startPractice(c)}
                    onGoPrevLevel={handleSelectLevel}
                    onJump={() => void handleManualJump(c)}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop (>= 900px): dải bầu trời lướt ngang + thẻ nổi bám đúng vị trí sao đang chọn */
        <>
          <div
            ref={panViewportRef}
            data-testid="constellation-pan-viewport"
            className={cn(styles.panViewport, isDragging && styles.panViewportDragging)}
            onPointerDown={handlePanPointerDown}
            onPointerMove={handlePanPointerMove}
            onPointerUp={handlePanPointerEnd}
            onPointerCancel={handlePanPointerEnd}
            onPointerLeave={handlePanPointerEnd}
            onWheel={handlePanWheel}
          >
            <div className={styles.panCanvas} style={{ width: `${canvasW}px` }}>
              <StarMap
                layout={layout}
                mobile={false}
                chapters={starChapters}
                selectedId={selectedNode?.id ?? null}
                onSelect={selectChapter}
                canSelect={() => !justDraggedRef.current}
              />

              {selectedNode && selectedSvgPos && (
                <div
                  ref={cardWrapRef}
                  data-testid="selected-chapter-popover"
                  data-chapter-card="true"
                  className={styles.floatingCard}
                  style={{
                    left: `${Math.round(cardLeft)}px`,
                    top: `${Math.round(cardTop)}px`,
                  }}
                >
                  <ChapterCard
                    node={selectedNode}
                    chapterLabel={
                      chapterLabelsById.get(selectedNode.id) ||
                      `Chương ${selectedNode.trackOrder}`
                    }
                    level={level}
                    isJumping={jumpingId === selectedNode.id}
                    caretSide={caretSide}
                    caretOffsetPx={caretOffsetPx}
                    onStart={() => startPractice(selectedNode)}
                    onGoPrevLevel={handleSelectLevel}
                    onJump={() => void handleManualJump(selectedNode)}
                  />
                </div>
              )}
            </div>
          </div>

          {chapters.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Lướt qua chương trước (Phím mũi tên trái hoặc A)"
                title="Chương trước (← hoặc A)"
                disabled={selectedIndex <= 0}
                onClick={() => stepChapter(-1)}
                className={cn(styles.navBtn, styles.navLeft)}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Lướt qua chương tiếp theo (Phím mũi tên phải hoặc D)"
                title="Chương tiếp (→ hoặc D)"
                disabled={selectedIndex >= chapters.length - 1}
                onClick={() => stepChapter(1)}
                className={cn(styles.navBtn, styles.navRight)}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </>
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
            {(
              [
                { code: 'ALL' as TrackFilter, label: 'Tất cả' },
                ...roadmap.tracks.map((t) => ({
                  code: t.trackCode as TrackFilter,
                  label: t.shortTitle,
                })),
              ]
            ).map((tab) => {
              const on = selectedTrack === tab.code;
              return (
                <button
                  key={tab.code}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => handleSelectTrack(tab.code)}
                  className={cn(
                    'min-h-[44px] px-0.5 text-sm font-semibold border-b-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD]/70',
                    on ? 'border-[#00B8DD] text-white' : 'border-transparent text-slate-400 hover:text-white',
                  )}
                >
                  {tab.label}
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
        <p className="flex flex-wrap items-center gap-2.5 text-[13px] font-semibold text-slate-200">
          <span className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
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

      <p className={styles.hint}>
        Chạm ngôi sao, kéo ngang hoặc dùng phím ← → / A D để lướt các chương
      </p>
    </section>
  );
}
