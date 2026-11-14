'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Cpu,
  Target,
  BookOpen,
} from 'lucide-react';
import {
  ChapterConstellation,
  StartChapterPracticePayload,
} from '@/components/features/student/practice/constellation/ChapterConstellation';
import { GradeOnboardingModal } from '@/components/features/student/practice/GradeOnboardingModal';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { Button } from '@/components/ui/button';
import {
  CurriculumTrackCode,
  RoadmapDifficultyLevel,
} from '@/services/chapter-roadmap.service';
import {
  examPointsService,
  getExamLevelCost,
  notifyExamPointsUpdated,
} from '@/services/exam-points.service';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';
import {
  findSubjectByTopicParam,
  resolveFullSubjectSlug,
  setSessionTopicContext,
} from '@/lib/topic-route-utils';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export default function ChuyenDeSubjectPage() {
  const params = useParams<{ subject: string }>();
  const router = useRouter();
  const { user, isAuthenticated, currentRole } = useAuthStore();

  const isLoggedIn = Boolean(isAuthenticated && user?.id);
  const isAdmin =
    (currentRole as string) === 'ADMIN' ||
    currentRole === 'SUPER_ADMIN' ||
    (user?.role as string) === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';

  const rawSubjectParam = String(params?.subject || 'toan');
  const fullSubjectSlug = resolveFullSubjectSlug(rawSubjectParam);
  const subjectInfo = findSubjectByTopicParam(rawSubjectParam);
  const isSupportedSubject =
    fullSubjectSlug === 'toan-hoc' || fullSubjectSlug === 'tin-hoc';

  const [legacyGrade, setLegacyGrade] = React.useState<10 | 11 | 12 | undefined>(
    undefined,
  );
  const [legacyTrack, setLegacyTrack] = React.useState<
    CurriculumTrackCode | undefined
  >(undefined);
  const [legacyLevel, setLegacyLevel] = React.useState<
    RoadmapDifficultyLevel | undefined
  >(undefined);

  // Nếu người dùng mở bookmark cũ có ?grade=..., ?track=..., ?level=..., lưu vào session và làm sạch URL ngay
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.location.search) return;
    const sp = new URLSearchParams(window.location.search);
    const parsedGrade = parseHighSchoolGrade(sp.get('grade')) ?? undefined;
    const rawTrack = (sp.get('track') || '').toUpperCase();
    const parsedTrack: CurriculumTrackCode | undefined =
      rawTrack === 'TOAN_SO' || rawTrack === 'TOAN_HINH' || rawTrack === 'DEFAULT'
        ? (rawTrack as CurriculumTrackCode)
        : undefined;
    const rawLevel = (sp.get('level') || '').toUpperCase();
    const parsedLevel: RoadmapDifficultyLevel | undefined =
      rawLevel === 'BASIC' || rawLevel === 'MEDIUM' || rawLevel === 'ADVANCED'
        ? (rawLevel as RoadmapDifficultyLevel)
        : undefined;

    if (parsedGrade || parsedTrack || parsedLevel) {
      setSessionTopicContext({
        ...(parsedGrade ? { grade: parsedGrade } : {}),
        ...(parsedTrack ? { track: parsedTrack } : {}),
        ...(parsedLevel ? { level: parsedLevel } : {}),
      });
      if (parsedGrade) setLegacyGrade(parsedGrade);
      if (parsedTrack) setLegacyTrack(parsedTrack);
      if (parsedLevel) setLegacyLevel(parsedLevel);
    }

    if (sp.has('grade') || sp.has('track') || sp.has('level')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const [guestOnboardingOpen, setGuestOnboardingOpen] = React.useState(false);
  const [pendingPayload, setPendingPayload] =
    React.useState<StartChapterPracticePayload | null>(null);

  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [gatedLevelName, setGatedLevelName] = React.useState('');
  const [pendingReturnUrl, setPendingReturnUrl] = React.useState('');

  const [outOfPointsModal, setOutOfPointsModal] = React.useState<{
    isOpen: boolean;
    currentPoints: number;
    requiredPoints: number;
    levelLabel: string;
  }>({
    isOpen: false,
    currentPoints: 0,
    requiredPoints: 3,
    levelLabel: 'Cơ bản',
  });

  const buildExamRoomUrl = React.useCallback(
    (payload: StartChapterPracticePayload) => {
      const diffMap: Record<string, string> = {
        BASIC: 'EASY',
        MEDIUM: 'MEDIUM',
        ADVANCED: 'HARD',
      };
      return `/student/practice/exam-room?subject=${payload.subjectSlug}&level=${payload.level.toLowerCase()}&grade=${payload.grade}&chapter=${payload.chapterId}&track=${payload.track}&format=quiz&duration=${payload.durationMinutes}&quizCount=${payload.questionCount}&count=${payload.questionCount}&practiceMode=TOPIC&difficulty=${diffMap[payload.level] || 'ALL'}`;
    },
    [],
  );

  const handleStartPractice = React.useCallback(
    async (payload: StartChapterPracticePayload) => {
      const levelLabelMap: Record<string, string> = {
        BASIC: 'Cơ bản',
        MEDIUM: 'Trung bình',
        ADVANCED: 'Nâng cao',
      };
      const label = `${payload.chapterName} (${levelLabelMap[payload.level] || payload.level})`;
      const examRoomUrl = buildExamRoomUrl(payload);

      if (!isLoggedIn) {
        const guest = getGuestOnboarding();
        if (!guest) {
          setPendingPayload(payload);
          setGuestOnboardingOpen(true);
          return;
        }

        const canGuestTry =
          (guest.trialUsedCount ?? 0) < 1 && payload.level === 'BASIC';
        if (canGuestTry) {
          router.push(examRoomUrl);
          return;
        }

        setGatedLevelName(label);
        setPendingReturnUrl(examRoomUrl);
        setRequireLoginOpen(true);
        return;
      }

      if (!isAdmin) {
        try {
          const costInfo = getExamLevelCost(payload.level);
          const bal = await examPointsService.getBalance(user?.id);
          if (bal && typeof bal.currentPoints === 'number') {
            notifyExamPointsUpdated(bal.currentPoints);
            if (
              bal.currentPoints <= 0 ||
              bal.currentPoints < costInfo.costPoints
            ) {
              setOutOfPointsModal({
                isOpen: true,
                currentPoints: Math.max(0, bal.currentPoints),
                requiredPoints: costInfo.costPoints,
                levelLabel: label,
              });
              return;
            }
          }
        } catch {
          // Cho phép tiếp tục nếu API điểm tạm gián đoạn, exam-room sẽ kiểm tra lại
        }
      }

      router.push(examRoomUrl);
    },
    [buildExamRoomUrl, isAdmin, isLoggedIn, router, user?.id],
  );

  const displaySubjectName =
    subjectInfo?.name ||
    (fullSubjectSlug === 'tin-hoc' ? 'Tin Học' : 'Toán Học');

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      {/* Thanh Breadcrumb & Chuyển nhanh Môn / Thi thử */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
            <Link
              href="/luyen-thi"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cổng Luyện Thi</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Chuyên đề {displaySubjectName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chuyển môn nhanh (hiện trên mọi kích thước) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href="/luyen-thi/chuyen-de/toan"
                className={cn(
                  'min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors',
                  fullSubjectSlug === 'toan-hoc'
                    ? 'bg-[#00B8DD] border-[#009BBD] text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300',
                )}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Toán</span>
              </Link>
              <Link
                href="/luyen-thi/chuyen-de/tin"
                className={cn(
                  'min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors',
                  fullSubjectSlug === 'tin-hoc'
                    ? 'bg-[#00B8DD] border-[#009BBD] text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300',
                )}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Tin</span>
              </Link>
            </div>

            <Link
              href={`/luyen-thi?subject=${isSupportedSubject ? fullSubjectSlug : 'toan-hoc'}&mode=mock`}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#00B8DD]/10 hover:bg-[#00B8DD]/20 border border-[#00B8DD]/30 text-[#00B8DD] text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>Thi thử tổng hợp</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Nội dung chính: bầu trời "Chòm sao Tia Sáng" phủ kín màn hình */}
      <main
        className={cn(
          isSupportedSubject
            ? 'w-full'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7',
        )}
      >
        {!isSupportedSubject ? (
          <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#00B8DD]/10 text-[#00B8DD] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Lộ trình chuyên đề môn {displaySubjectName} đang biên soạn
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Hiện tại ngân hàng lộ trình chuyên đề GDPT 2018 đã mở đầy đủ cho hai môn mũi nhọn là <strong>Toán Học (Toán Số &amp; Toán Hình)</strong> và <strong>Tin Học THPT</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/luyen-thi/chuyen-de/toan">
                <Button className="min-h-[44px] rounded-xl bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold text-xs cursor-pointer">
                  <span>Vào Chuyên đề Toán Học</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/luyen-thi/chuyen-de/tin">
                <Button
                  variant="outline"
                  className="min-h-[44px] rounded-xl font-bold text-xs cursor-pointer"
                >
                  <span>Vào Chuyên đề Tin Học</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="min-[900px]:h-[calc(100dvh-8.5rem)] min-[900px]:min-h-[560px]">
            <ChapterConstellation
              subjectSlug={fullSubjectSlug}
              subjectName={displaySubjectName}
              initialGrade={legacyGrade}
              initialTrack={legacyTrack}
              initialLevel={legacyLevel}
              onRequestAuth={() => {
                setGatedLevelName('Lưu tiến độ lộ trình chuyên đề');
                setPendingReturnUrl(window.location.pathname);
                setRequireLoginOpen(true);
              }}
              onStartPractice={(payload) => void handleStartPractice(payload)}
            />
          </div>
        )}
      </main>

      <GradeOnboardingModal
        isOpen={guestOnboardingOpen}
        mode="GUEST_TRIAL"
        subjectName={displaySubjectName}
        onClose={() => {
          setGuestOnboardingOpen(false);
          setPendingPayload(null);
        }}
        onCompleted={(result) => {
          setGuestOnboardingOpen(false);
          setSessionTopicContext({ grade: result.grade });
          if (pendingPayload) {
            const nextPayload: StartChapterPracticePayload = {
              ...pendingPayload,
              grade: result.grade,
            };
            setPendingPayload(null);
            if (nextPayload.level === 'BASIC') {
              router.push(buildExamRoomUrl(nextPayload));
            } else {
              setGatedLevelName(nextPayload.chapterName);
              setPendingReturnUrl(buildExamRoomUrl(nextPayload));
              setRequireLoginOpen(true);
            }
          }
        }}
      />

      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={gatedLevelName}
        returnUrl={pendingReturnUrl}
        onSuccessLogin={() => {
          setRequireLoginOpen(false);
          if (pendingReturnUrl) {
            router.push(pendingReturnUrl);
          }
        }}
      />

      <OutOfPointsModal
        isOpen={outOfPointsModal.isOpen}
        onClose={() =>
          setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }))
        }
        currentPoints={outOfPointsModal.currentPoints}
        requiredPoints={outOfPointsModal.requiredPoints}
        levelLabel={outOfPointsModal.levelLabel}
        onNavigatePricing={() => {
          setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }));
          router.push('/pricing');
        }}
      />
    </div>
  );
}
