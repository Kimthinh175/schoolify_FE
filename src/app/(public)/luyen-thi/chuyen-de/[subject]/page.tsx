'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  ChapterConstellation,
  StartChapterPracticePayload,
} from '@/components/features/student/practice/constellation/ChapterConstellation';
import { DiagnosticGateOverlay } from '@/components/features/student/practice/DiagnosticGateOverlay';
import { GradeOnboardingModal } from '@/components/features/student/practice/GradeOnboardingModal';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import { DiagnosticPromptModal } from '@/components/features/student/practice/DiagnosticPromptModal';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { Button } from '@/components/ui/button';
import {
  chapterRoadmapService,
  CHAPTER_ROADMAP_UPDATED_EVENT,
  CurriculumTrackCode,
  RoadmapDifficultyLevel,
} from '@/services/chapter-roadmap.service';
import {
  examPointsService,
  getExamLevelCost,
  isDiagnosticPromptSkipped,
  markDiagnosticPromptSkipped,
  notifyExamPointsUpdated,
} from '@/services/exam-points.service';
import { getGuestOnboarding, parseHighSchoolGrade } from '@/lib/semester-utils';
import {
  findSubjectByTopicParam,
  getSessionTopicContext,
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

  const [isClientMounted, setIsClientMounted] = React.useState(false);
  const [forceGateMode, setForceGateMode] = React.useState(false);
  const [activeGradeOverride, setActiveGradeOverride] = React.useState<
    10 | 11 | 12 | undefined
  >(undefined);
  const [legacyTrack, setLegacyTrack] = React.useState<
    CurriculumTrackCode | undefined
  >(undefined);
  const [legacyLevel, setLegacyLevel] = React.useState<
    RoadmapDifficultyLevel | undefined
  >(undefined);

  // Nếu người dùng mở bookmark cũ có ?grade=..., ?track=..., ?level=..., lưu vào session và làm sạch URL ngay
  React.useEffect(() => {
    setIsClientMounted(true);
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

    if (sp.get('forceGate') === '1') {
      setForceGateMode(true);
    }

    if (parsedGrade || parsedTrack || parsedLevel) {
      setSessionTopicContext({
        ...(parsedGrade ? { grade: parsedGrade } : {}),
        ...(parsedTrack ? { track: parsedTrack } : {}),
        ...(parsedLevel ? { level: parsedLevel } : {}),
      });
      if (parsedGrade) setActiveGradeOverride(parsedGrade);
      if (parsedTrack) setLegacyTrack(parsedTrack);
      if (parsedLevel) setLegacyLevel(parsedLevel);
    }

    if (sp.has('grade') || sp.has('track') || sp.has('level') || sp.has('forceGate')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const [guestOnboardingOpen, setGuestOnboardingOpen] = React.useState(false);
  const [pendingPayload, setPendingPayload] =
    React.useState<StartChapterPracticePayload | null>(null);
  const [diagnosticGate, setDiagnosticGate] = React.useState<{
    isOpen: boolean;
    grade: 10 | 11 | 12;
  }>({ isOpen: false, grade: 12 });
  const [gateRefreshNonce, setGateRefreshNonce] = React.useState(0);

  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [gatedLevelName, setGatedLevelName] = React.useState('');
  const [pendingReturnUrl, setPendingReturnUrl] = React.useState('');

  const [outOfPointsModal, setOutOfPointsModal] = React.useState<{
    isOpen: boolean;
    currentPoints: number;
    currentDiamonds: number;
    requiredPoints: number;
    levelLabel: string;
    targetExamUrl: string;
  }>({
    isOpen: false,
    currentPoints: 0,
    currentDiamonds: 0,
    requiredPoints: 3,
    levelLabel: 'Cơ bản',
    targetExamUrl: '',
  });

  const [diagnosticModal, setDiagnosticModal] = React.useState<{
    isOpen: boolean;
    reason: 'FIRST_TIME' | 'INACTIVE_30_DAYS';
    daysSinceLastPractice: number | null;
    grade: number;
    pendingPayload: StartChapterPracticePayload | null;
  }>({
    isOpen: false,
    reason: 'FIRST_TIME',
    daysSinceLastPractice: null,
    grade: 12,
    pendingPayload: null,
  });

  // Lắng nghe cập nhật trạng thái khách / tiến độ lộ trình để kiểm tra Gate tức thì
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => setGateRefreshNonce((n) => n + 1);
    window.addEventListener('schoolify-guest-onboarding-updated', bump);
    window.addEventListener(CHAPTER_ROADMAP_UPDATED_EVENT, bump);
    return () => {
      window.removeEventListener('schoolify-guest-onboarding-updated', bump);
      window.removeEventListener(CHAPTER_ROADMAP_UPDATED_EVENT, bump);
    };
  }, []);

  // Tự động kiểm tra Khối lớp + Đánh giá năng lực bắt buộc khi vào chuyên đề
  React.useEffect(() => {
    if (!isClientMounted || !isSupportedSubject) return;
    let cancelled = false;

    const evaluateEntryGate = async () => {
      const profileGrade = parseHighSchoolGrade(
        user?.student_profile?.grade_level || (user as any)?.gradeLevel,
      );
      const guestGrade = getGuestOnboarding()?.grade ?? null;
      const sessionGrade = getSessionTopicContext().grade ?? null;
      const resolvedGrade =
        activeGradeOverride ??
        sessionGrade ??
        (isLoggedIn ? profileGrade : guestGrade);

      // Chưa chọn khối lớp (khách mới vào lần đầu) -> Mở modal chọn khối lớp ngay
      if (!resolvedGrade) {
        if (!isLoggedIn && !isAdmin && !forceGateMode) {
          setGuestOnboardingOpen(true);
        } else if (forceGateMode) {
          setDiagnosticGate({ isOpen: true, grade: 12 });
        }
        return;
      }

      if (forceGateMode) {
        setDiagnosticGate({ isOpen: true, grade: resolvedGrade });
        return;
      }

      if (isAdmin) {
        setDiagnosticGate((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
        return;
      }

      const status = await chapterRoadmapService.getDiagnosticStatus(
        fullSubjectSlug,
        resolvedGrade,
      );
      if (cancelled || !status) return;

      if (status.diagnosticRequired && !status.isPrivileged) {
        setDiagnosticGate({ isOpen: true, grade: resolvedGrade });
      } else {
        setDiagnosticGate((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
      }
    };

    void evaluateEntryGate();
    return () => {
      cancelled = true;
    };
  }, [
    isClientMounted,
    isSupportedSubject,
    fullSubjectSlug,
    activeGradeOverride,
    isLoggedIn,
    isAdmin,
    forceGateMode,
    user?.id,
    user?.student_profile?.grade_level,
    gateRefreshNonce,
  ]);

  const buildExamRoomUrl = React.useCallback(
    (payload: StartChapterPracticePayload, useDiamonds?: boolean) => {
      const diffMap: Record<string, string> = {
        BASIC: 'EASY',
        MEDIUM: 'MEDIUM',
        ADVANCED: 'HARD',
      };
      const diamondParam = useDiamonds ? '&useDiamonds=true' : '';
      return `/student/practice/exam-room?subject=${payload.subjectSlug}&level=${payload.level.toLowerCase()}&grade=${payload.grade}&chapter=${payload.chapterId}&track=${payload.track}&format=quiz&duration=${payload.durationMinutes}&quizCount=${payload.questionCount}&count=${payload.questionCount}&practiceMode=TOPIC&difficulty=${diffMap[payload.level] || 'ALL'}${diamondParam}`;
    },
    [],
  );

  const proceedToExamWithPointCheck = React.useCallback(
    async (payload: StartChapterPracticePayload, skipDiagnosticCheck = false) => {
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
          if (!skipDiagnosticCheck && !isDiagnosticPromptSkipped('guest', 'FIRST_TIME')) {
            setDiagnosticModal({
              isOpen: true,
              reason: 'FIRST_TIME',
              daysSinceLastPractice: null,
              grade: payload.grade || 12,
              pendingPayload: payload,
            });
            return;
          }
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

          // 1. Gợi ý làm bài Test Đánh giá năng lực (nếu vào tạo đề lần đầu hoặc >= 30 ngày không luyện)
          if (
            !skipDiagnosticCheck &&
            bal?.diagnosticPrompt?.shouldPrompt &&
            bal.diagnosticPrompt.reason &&
            !isDiagnosticPromptSkipped(user?.id, bal.diagnosticPrompt.reason)
          ) {
            setDiagnosticModal({
              isOpen: true,
              reason: bal.diagnosticPrompt.reason,
              daysSinceLastPractice: bal.diagnosticPrompt.daysSinceLastPractice,
              grade: payload.grade || 12,
              pendingPayload: payload,
            });
            return;
          }

          // 2. Kiểm tra Tia Sáng ⚡ & Ngọc Tri Thức 💎
          if (bal && typeof bal.currentPoints === 'number') {
            const currentDiamonds = Math.max(0, Number(bal.diamonds ?? 0));
            notifyExamPointsUpdated(bal.currentPoints, currentDiamonds);
            if (
              bal.currentPoints <= 0 ||
              bal.currentPoints < costInfo.costPoints
            ) {
              setOutOfPointsModal({
                isOpen: true,
                currentPoints: Math.max(0, bal.currentPoints),
                currentDiamonds,
                requiredPoints: costInfo.costPoints,
                levelLabel: label,
                targetExamUrl: buildExamRoomUrl(payload, true),
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

  const handleStartPractice = React.useCallback(
    async (payload: StartChapterPracticePayload) => {
      await proceedToExamWithPointCheck(payload, false);
    },
    [proceedToExamWithPointCheck],
  );

  const displaySubjectName =
    subjectInfo?.name ||
    (fullSubjectSlug === 'tin-hoc' ? 'Tin Học' : 'Toán Học');

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-slate-50/50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
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
          <div className="min-[900px]:h-[calc(100dvh-5rem)] min-[900px]:min-h-[560px]">
            <ChapterConstellation
              subjectSlug={fullSubjectSlug}
              subjectName={displaySubjectName}
              initialGrade={activeGradeOverride}
              initialTrack={legacyTrack}
              initialLevel={legacyLevel}
              onGradeChange={(g) => setActiveGradeOverride(g)}
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

      <DiagnosticGateOverlay
        isOpen={isSupportedSubject && diagnosticGate.isOpen}
        subjectSlug={fullSubjectSlug}
        subjectName={displaySubjectName}
        grade={diagnosticGate.grade}
        onClose={() => router.push('/luyen-thi')}
        onReadyToEnterExam={(examUrl) => {
          router.push(examUrl);
        }}
      />

      <GradeOnboardingModal
        isOpen={guestOnboardingOpen}
        mode="GUEST_TRIAL"
        preventClose={!pendingPayload}
        subjectName={displaySubjectName}
        onClose={() => {
          setGuestOnboardingOpen(false);
          setPendingPayload(null);
        }}
        onCompleted={(result) => {
          setGuestOnboardingOpen(false);
          setSessionTopicContext({ grade: result.grade });
          setActiveGradeOverride(result.grade);
          setGateRefreshNonce((n) => n + 1);
          if (pendingPayload) {
            setPendingPayload(null);
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
        currentDiamonds={outOfPointsModal.currentDiamonds}
        requiredPoints={outOfPointsModal.requiredPoints}
        levelLabel={outOfPointsModal.levelLabel}
        onUseDiamonds={() => {
          const targetUrl = outOfPointsModal.targetExamUrl;
          setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }));
          if (targetUrl) {
            router.push(targetUrl);
          }
        }}
        onNavigatePricing={() => {
          setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }));
          router.push('/pricing');
        }}
      />

      <DiagnosticPromptModal
        isOpen={diagnosticModal.isOpen}
        onClose={() =>
          setDiagnosticModal((prev) => ({ ...prev, isOpen: false }))
        }
        reason={diagnosticModal.reason}
        daysSinceLastPractice={diagnosticModal.daysSinceLastPractice}
        subjectName={displaySubjectName}
        grade={diagnosticModal.grade}
        onStartDiagnostic={() => {
          const gradeNum = diagnosticModal.grade || 12;
          setDiagnosticModal((prev) => ({ ...prev, isOpen: false, pendingPayload: null }));
          router.push(
            `/student/practice/exam-room?subject=${isSupportedSubject ? fullSubjectSlug : 'toan-hoc'}&level=assessment&grade=${gradeNum}&chapter=1&format=quiz&duration=15&quizCount=12&count=12&practiceMode=ASSESSMENT`,
          );
        }}
        onSkipAndContinue={() => {
          const payloadToContinue = diagnosticModal.pendingPayload;
          markDiagnosticPromptSkipped(user?.id || 'guest', diagnosticModal.reason);
          setDiagnosticModal((prev) => ({ ...prev, isOpen: false, pendingPayload: null }));
          if (payloadToContinue) {
            void proceedToExamWithPointCheck(payloadToContinue, true);
          }
        }}
      />
    </div>
  );
}
