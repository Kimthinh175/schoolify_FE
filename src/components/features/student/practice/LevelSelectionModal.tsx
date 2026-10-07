'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Award,
  Flame,
  Trophy,
  Crown,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Lock,
  FileText,
  Check,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { K12Subject, PracticeLevel, LevelDetail } from '@/types/subject';
import { PRACTICE_LEVELS } from '@/services/mock/subject-data';
import {
  K12_GRADES,
  MATH_GRADE_12_CHAPTERS,
  ExamFormat,
} from '@/services/mock/practice-flow-data';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

interface LevelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: K12Subject | null;
  isLoggedIn?: boolean;
}

type WizardStep = 'LEVEL' | 'GRADE' | 'CHAPTER' | 'FORMAT' | 'DURATION';

const WIZARD_STEPS: { step: WizardStep; number: number; label: string }[] = [
  { step: 'LEVEL', number: 1, label: 'Cấp độ' },
  { step: 'GRADE', number: 2, label: 'Khối lớp' },
  { step: 'CHAPTER', number: 3, label: 'Chương học' },
  { step: 'FORMAT', number: 4, label: 'Hình thức' },
  { step: 'DURATION', number: 5, label: 'Thời gian' },
];

interface DurationOption {
  minutes: number;
  label: string;
  badge: string;
  desc: string;
  badgeColor: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    minutes: 10,
    label: '10 Phút',
    badge: '⚡ Siêu Tốc',
    desc: 'Luyện phản xạ nhanh, ôn tập cấp tốc dạng bài trọng tâm.',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-300',
  },
  {
    minutes: 15,
    label: '15 Phút',
    badge: '📝 15 Phút',
    desc: 'Định dạng bài kiểm tra 15 phút thường xuyên trên lớp SGK mới.',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border-blue-300',
  },
  {
    minutes: 45,
    label: '45 Phút',
    badge: '⭐ Tiêu Chuẩn',
    desc: 'Định dạng bài kiểm tra 1 tiết định kỳ chuẩn SGK 2018 toàn diện.',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300',
  },
  {
    minutes: 60,
    label: '60 Phút',
    badge: '🎯 Chuyên Đề',
    desc: 'Khảo sát chuyên đề chuyên sâu, rèn kỹ năng giải toán phân hóa.',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400 border-purple-300',
  },
  {
    minutes: 90,
    label: '90 Phút',
    badge: '🏆 THPT QG',
    desc: 'Thời lượng chuẩn đề thi Tốt nghiệp THPT Quốc Gia của Bộ GD&ĐT.',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border-rose-300',
  },
];

const LEVEL_ICONS: Record<PracticeLevel, React.ReactNode> = {
  BASIC: <BookOpen className="w-5 h-5 text-emerald-500" />,
  MEDIUM: <Award className="w-5 h-5 text-sky-500" />,
  ADVANCED: <Flame className="w-5 h-5 text-purple-500" />,
  PROVINCIAL_EXCELLENT: <Trophy className="w-5 h-5 text-amber-500" />,
  NATIONAL_EXCELLENT: <Crown className="w-5 h-5 text-rose-500" />,
  ASSESSMENT: <Sparkles className="w-5 h-5 text-[#00B8DD]" />,
};

export function LevelSelectionModal({
  isOpen,
  onClose,
  subject,
  isLoggedIn = false,
}: LevelSelectionModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const effectiveIsLoggedIn = isLoggedIn || isAuthenticated;

  // Wizard Steps
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('LEVEL');
  const [maxStepReached, setMaxStepReached] = React.useState<number>(1);
  const [isAssessmentMode, setIsAssessmentMode] = React.useState<boolean>(false);

  // Selected State
  const [selectedLevel, setSelectedLevel] = React.useState<LevelDetail>(PRACTICE_LEVELS[0]);
  const [selectedGrade, setSelectedGrade] = React.useState<number>(12);
  const [selectedChapterId, setSelectedChapterId] = React.useState<number>(1);
  const [selectedFormat, setSelectedFormat] = React.useState<ExamFormat>('QUIZ');
  const [quizCount, setQuizCount] = React.useState<number>(10);
  const [essayCount, setEssayCount] = React.useState<number>(5);
  const [selectedDuration, setSelectedDuration] = React.useState<number>(45);

  // Gated Login Modal State
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [selectedGatedLevelName, setSelectedGatedLevelName] = React.useState<string>('');

  // Competency Check State
  const [hasAssessedCompetency, setHasAssessedCompetency] = React.useState<boolean>(false);
  const [assessedLevelName, setAssessedLevelName] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const userId = user?.id || '';
    const subjectSlug = subject?.slug || '';

    const userLevel = (user as any)?.competency_level || user?.student_profile?.competency_level;
    const localUserLevel = userId ? localStorage.getItem(`schoolify_competency_${userId}`) : null;
    const localSubjectLevel = userId && subjectSlug ? localStorage.getItem(`schoolify_competency_${userId}_${subjectSlug}`) : null;

    const resolvedLevel = localSubjectLevel || localUserLevel || userLevel;

    if (resolvedLevel) {
      setHasAssessedCompetency(true);
      const mapLevelName: Record<string, string> = {
        BASIC: 'Cơ Bản',
        MEDIUM: 'Trung Bình',
        ADVANCED: 'Nâng Cao',
        PROVINCIAL_EXCELLENT: 'HSG Tỉnh',
        NATIONAL_EXCELLENT: 'HSG Quốc Gia',
      };
      setAssessedLevelName(mapLevelName[resolvedLevel] || resolvedLevel);
    } else {
      setHasAssessedCompetency(false);
      setAssessedLevelName('');
    }
  }, [user, subject, isOpen]);

  // Reset step on reopen
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('LEVEL');
      setMaxStepReached(1);
      setSelectedLevel(PRACTICE_LEVELS[0]);
      setSelectedGrade(12);
      setSelectedChapterId(1);
      setSelectedFormat('QUIZ');
      setQuizCount(10);
      setEssayCount(5);
      setSelectedDuration(45);
      setIsAssessmentMode(false);
    }
  }, [isOpen]);

  if (!subject) return null;

  // Step calculations & Navigation
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.step === currentStep) + 1;
  const canGoBack = currentStepIndex > 1;
  const canGoForward = currentStepIndex < maxStepReached;

  const handleGoBack = () => {
    if (canGoBack) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 2].step);
    }
  };

  const handleGoForward = () => {
    if (canGoForward) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex].step);
    }
  };

  // Step 1: Handle Assessment Click
  const handleSelectAssessment = () => {
    setIsAssessmentMode(true);
    setSelectedLevel({
      id: 'ASSESSMENT',
      name: 'Đánh Giá Năng Lực',
      badge: 'Chẩn Đoán Nhanh',
      tagline: 'Phân tích trình độ học tập',
      description: 'Bài kiểm tra chẩn đoán năng lực 15 phút.',
      badgeColor: 'bg-sky-100 text-[#007D99] border-sky-300',
      gradient: 'from-[#00B8DD] to-indigo-600',
      pointsReward: 30,
      totalExams: 1,
    });
    setMaxStepReached((prev) => Math.max(prev, 2));
    setCurrentStep('GRADE');
  };

  // Step 1: Handle Level Click
  const handleSelectLevel = (level: LevelDetail) => {
    setIsAssessmentMode(false);
    const isFreeTrial = level.id === 'BASIC' || level.id === 'MEDIUM';

    if (!effectiveIsLoggedIn && !isFreeTrial) {
      setSelectedGatedLevelName(level.name);
      setRequireLoginOpen(true);
      return;
    }

    setSelectedLevel(level);
    setMaxStepReached((prev) => Math.max(prev, 2));
    setCurrentStep('GRADE');
  };

  // Step 2: Handle Grade Click
  const handleSelectGrade = (gradeId: number) => {
    setSelectedGrade(gradeId);
    if (isAssessmentMode) {
      onClose();
      router.push(
        `/student/practice/exam-room?subject=${subject.slug}&level=assessment&grade=${gradeId}&chapter=1&format=quiz&duration=15&count=10&mode=diagnostic`
      );
      return;
    }
    setMaxStepReached((prev) => Math.max(prev, 3));
    setCurrentStep('CHAPTER');
  };

  // Step 3: Handle Chapter Click
  const handleSelectChapter = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    setMaxStepReached((prev) => Math.max(prev, 4));
    setCurrentStep('FORMAT');
  };

  // Step 4: Handle Format Selection
  const handleSelectFormat = (format: ExamFormat) => {
    setSelectedFormat(format);
    if (format === 'QUIZ') {
      setQuizCount((prev) => Math.max(10, Math.min(30, prev)));
    } else if (format === 'ESSAY') {
      setEssayCount((prev) => Math.max(5, Math.min(10, prev)));
    } else if (format === 'MIXED') {
      setQuizCount((prev) => Math.max(5, Math.min(30, prev)));
      setEssayCount((prev) => Math.max(1, Math.min(10, prev)));
    }
  };

  // Step 5: Start Exam
  const handleStartExam = () => {
    onClose();
    const countParam =
      selectedFormat === 'QUIZ'
        ? quizCount
        : selectedFormat === 'ESSAY'
        ? essayCount
        : quizCount + essayCount;

    router.push(
      `/student/practice/exam-room?subject=${subject.slug}&level=${selectedLevel.id.toLowerCase()}&grade=${selectedGrade}&chapter=${selectedChapterId}&format=${selectedFormat.toLowerCase()}&duration=${selectedDuration}&quizCount=${quizCount}&essayCount=${essayCount}&count=${countParam}`
    );
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="2xl"
        title={
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm',
                subject.bgLight
              )}
            >
              <span className={subject.themeColor}>📚</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00B8DD]">
                  Môn {subject.name}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500">Khảo Thí K-12</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {currentStep === 'LEVEL' && 'Bước 1/5: Chọn Cấp Độ Mục Tiêu'}
                {currentStep === 'GRADE' && (isAssessmentMode ? 'Bước 2/2: Chọn Khối Lớp Để Đánh Giá Năng Lực' : 'Bước 2/5: Chọn Khối Lớp')}
                {currentStep === 'CHAPTER' && 'Bước 3/5: Chọn Chương Học (SGK 2018)'}
                {currentStep === 'FORMAT' && 'Bước 4/5: Chọn Hình Thức Đề Thi'}
                {currentStep === 'DURATION' && 'Bước 5/5: Chọn Thời Gian Làm Bài'}
              </div>
            </div>
          </div>
        }
        description={
          <div className="space-y-3 mt-1.5">
            {/* Step Indicators Bar: Stepper with Circles 1-4 and Connecting Lines */}
            <div className="flex items-center w-full px-1 py-1">
              {WIZARD_STEPS.map((s, idx) => {
                const isReached = s.number <= currentStepIndex;
                const isCurrent = s.number === currentStepIndex;
                const isUnlocked = s.number <= maxStepReached;

                return (
                  <React.Fragment key={s.step}>
                    {/* Circle 1-4 */}
                    <button
                      type="button"
                      onClick={() => isUnlocked && setCurrentStep(s.step)}
                      disabled={!isUnlocked}
                      title={`Bước ${s.number}: ${s.label}`}
                      className={cn(
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all select-none',
                        isCurrent
                          ? 'bg-[#00B8DD] text-slate-950 ring-4 ring-[#00B8DD]/25 shadow-md shadow-[#00B8DD]/30 scale-105'
                          : isReached
                          ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                          : isUnlocked
                          ? 'bg-white dark:bg-slate-900 border-2 border-[#00B8DD]/70 text-[#007D99] dark:text-[#00B8DD]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700',
                        isUnlocked && !isCurrent
                          ? 'cursor-pointer hover:opacity-90 active:scale-95'
                          : !isUnlocked
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      )}
                    >
                      {s.number}
                    </button>

                    {/* Connecting Line */}
                    {idx < WIZARD_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1 transition-all duration-300 mx-1 sm:mx-2',
                          currentStepIndex > s.number
                            ? 'bg-[#00B8DD]'
                            : 'bg-slate-200 dark:bg-slate-800'
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Clickable Breadcrumbs (Left) & Navigation Buttons (Right) on the same row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
              {/* Left: Clickable Breadcrumbs to quickly jump */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] min-w-0">
                {/* Step 1: Level */}
                <button
                  type="button"
                  onClick={() => setCurrentStep('LEVEL')}
                  className={cn(
                    'px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold',
                    currentStep === 'LEVEL'
                      ? 'text-[#007D99] dark:text-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  title="Bấm để chuyển nhanh về Bước 1: Chọn cấp độ"
                >
                  {selectedLevel.name}
                </button>

                {/* Step 2: Grade */}
                {maxStepReached >= 2 && (
                  <>
                    <span className="text-slate-400 select-none">➔</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('GRADE')}
                      className={cn(
                        'px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold',
                        currentStep === 'GRADE'
                          ? 'text-[#007D99] dark:text-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                      title="Bấm để chuyển nhanh về Bước 2: Chọn khối lớp"
                    >
                      Lớp {selectedGrade}
                    </button>
                  </>
                )}

                {/* Step 3: Chapter */}
                {maxStepReached >= 3 && (
                  <>
                    <span className="text-slate-400 select-none">➔</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('CHAPTER')}
                      className={cn(
                        'px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold',
                        currentStep === 'CHAPTER'
                          ? 'text-[#007D99] dark:text-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                      title="Bấm để chuyển nhanh về Bước 3: Chọn chương học"
                    >
                      Chương {selectedChapterId}
                    </button>
                  </>
                )}

                {/* Step 4: Format */}
                {maxStepReached >= 4 && (
                  <>
                    <span className="text-slate-400 select-none">➔</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('FORMAT')}
                      className={cn(
                        'px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold',
                        currentStep === 'FORMAT'
                          ? 'text-[#007D99] dark:text-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                      title="Bấm để chuyển nhanh về Bước 4: Chọn hình thức đề"
                    >
                      {selectedFormat === 'QUIZ'
                        ? `Trắc Nghiệm (${quizCount}c)`
                        : selectedFormat === 'ESSAY'
                        ? `Tự Luận (${essayCount}c)`
                        : `Trộn (${quizCount}TN+${essayCount}TL)`}
                    </button>
                  </>
                )}

                {/* Step 5: Duration */}
                {maxStepReached >= 5 && (
                  <>
                    <span className="text-slate-400 select-none">➔</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('DURATION')}
                      className={cn(
                        'px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold',
                        currentStep === 'DURATION'
                          ? 'text-[#007D99] dark:text-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border border-[#00B8DD]/30'
                          : 'text-slate-600 dark:text-slate-400 hover:text-[#00B8DD] hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                      title="Bấm để chuyển nhanh về Bước 5: Chọn thời gian làm bài"
                    >
                      ⏱️ {selectedDuration} Phút
                    </button>
                  </>
                )}
              </div>

              {/* Right Action Buttons: Quay lại & Kế tiếp */}
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {canGoBack && (
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 transition-all cursor-pointer text-xs shadow-2xs hover:scale-102 active:scale-98"
                    title="Quay lại bước trước"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại
                  </button>
                )}

                {canGoForward && (
                  <button
                    type="button"
                    onClick={handleGoForward}
                    className="px-2.5 py-1 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold flex items-center gap-1 transition-all cursor-pointer text-xs shadow-2xs hover:scale-102 active:scale-98"
                    title="Kế tiếp (bước đã mở)"
                  >
                    Kế tiếp
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className="py-2">
          {/* ========================================================================= */}
          {/* STEP 1: CHỌN CẤP ĐỘ                                                       */}
          {/* ========================================================================= */}
          {currentStep === 'LEVEL' && (
            <div className="space-y-3">
              {/* 0. Trạng thái năng lực đã xác định (nếu đã login và đã có kết quả đánh giá) */}
              {effectiveIsLoggedIn && hasAssessedCompetency && (
                <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Năng lực môn này đã xác định: <strong className="font-bold">{assessedLevelName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAssessment}
                    className="text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Làm lại đánh giá
                  </button>
                </div>
              )}

              {/* 0. ĐÁNH GIÁ NĂNG LỰC CỦA BẠN (Hiện trên Cơ bản nếu chưa login hoặc login mà chưa xác định được năng lực) */}
              {(!effectiveIsLoggedIn || !hasAssessedCompetency) && (
                <div
                  onClick={handleSelectAssessment}
                  className={cn(
                    'p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer group relative overflow-hidden',
                    'border-[#00B8DD]/50 hover:border-[#00B8DD] hover:shadow-lg hover:shadow-[#00B8DD]/10',
                    'bg-gradient-to-r from-[#00B8DD]/[0.08] via-sky-50/60 to-indigo-50/40 dark:from-[#00B8DD]/15 dark:via-slate-900 dark:to-indigo-950/20'
                  )}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#00B8DD] to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-[#00B8DD]/25 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors flex items-center gap-1.5">
                          Đánh Giá Năng Lực Của Bạn
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/90 dark:bg-slate-800 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/30 flex items-center gap-1 shadow-2xs">
                          <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          Chẩn Đoán Nhanh
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                        Làm bài test ngắn 15 phút để AI chẩn đoán trình độ và gợi ý lộ trình luyện thi chuẩn xác nhất.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD] bg-white dark:bg-slate-800 border border-[#00B8DD]/40 px-2.5 py-1 rounded-xl flex items-center gap-1 group-hover:bg-[#00B8DD] group-hover:text-white group-hover:border-[#00B8DD] transition-all shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#00B8DD] group-hover:text-white transition-colors" />
                      Đánh Giá Ngay
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              )}

              {/* 1 -> 5: Danh Sách Cấp Độ Mục Tiêu (Cơ Bản -> HSG Quốc Gia) */}
              {PRACTICE_LEVELS.map((level) => {
                const icon = LEVEL_ICONS[level.id];
                const isFree = level.id === 'BASIC' || level.id === 'MEDIUM';

                return (
                  <div
                    key={level.id}
                    onClick={() => handleSelectLevel(level)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer group',
                      'hover:border-[#00B8DD] hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
                      !effectiveIsLoggedIn && !isFree && 'hover:border-amber-400'
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                            {level.name}
                          </h4>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                              level.badgeColor
                            )}
                          >
                            {level.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {level.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isFree ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Luyện Thử
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          Cần Login
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CHỌN KHỐI LỚP (1 - 12)                                            */}
          {/* ========================================================================= */}
          {currentStep === 'GRADE' && (
            <div className="space-y-4">
              {isAssessmentMode ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/60 dark:from-sky-950/40 dark:to-indigo-950/20 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#00B8DD]" />
                  </div>
                  <div>
                    <span className="font-bold">Đánh Giá Năng Lực Môn {subject.name}:</span> Chọn khối lớp bạn đang học để hệ thống cấp đề kiểm tra chẩn đoán 15 phút (10 câu hỏi bao quát chương trình).
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Chọn lớp học bạn muốn luyện đề. Bộ đề mẫu chuẩn GDPT 2018 hiện đã sẵn sàng tại{' '}
                  <strong className="text-[#007D99] dark:text-[#00B8DD]">Lớp 12</strong>.
                </p>
              )}

              {/* Group THPT (10, 11, 12) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#007D99] dark:text-[#00B8DD] block">
                  Cấp Trung Học Phổ Thông (THPT)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 11, 12].map((g) => {
                    const isSelected = selectedGrade === g;
                    const isDemo = g === 12;

                    return (
                      <div
                        key={g}
                        onClick={() => handleSelectGrade(g)}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all cursor-pointer relative group flex items-center justify-center gap-2',
                          isSelected
                            ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/15 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                        )}
                      >
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                          Lớp {g}
                        </span>
                        {isDemo && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-2xs">
                            ⭐ Demo
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group THCS (6, 7, 8, 9) */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Cấp Trung Học Cơ Sở (THCS)
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                  {[6, 7, 8, 9].map((g) => {
                    const isSelected = selectedGrade === g;
                    return (
                      <div
                        key={g}
                        onClick={() => handleSelectGrade(g)}
                        className={cn(
                          'p-3 rounded-xl border text-center cursor-pointer transition-all flex items-center justify-center',
                          isSelected
                            ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/15 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                        )}
                      >
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Lớp {g}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group Tiểu Học (1 - 5) */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Cấp Tiểu Học
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((g) => {
                    const isSelected = selectedGrade === g;
                    return (
                      <div
                        key={g}
                        onClick={() => handleSelectGrade(g)}
                        className={cn(
                          'p-2.5 rounded-xl border text-center cursor-pointer transition-all flex items-center justify-center',
                          isSelected
                            ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/15 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                        )}
                      >
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Lớp {g}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Mode Quick CTA */}
              {isAssessmentMode && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-500">
                    Đang chọn: <strong className="text-slate-900 dark:text-white font-bold">Lớp {selectedGrade}</strong> (10 câu trắc nghiệm • 15 phút)
                  </div>
                  <Button
                    onClick={() => {
                      onClose();
                      router.push(
                        `/student/practice/exam-room?subject=${subject.slug}&level=assessment&grade=${selectedGrade}&chapter=1&format=quiz&duration=15&count=10&mode=diagnostic`
                      );
                    }}
                    className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold gap-1.5 rounded-xl shadow-md text-xs sm:text-sm"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    Vào Làm Bài Đánh Giá Ngay
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CHỌN CHƯƠNG HỌC (SGK MỚI GDPT 2018)                              */}
          {/* ========================================================================= */}
          {currentStep === 'CHAPTER' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Danh sách 6 chương chuẩn SGK Toán {selectedGrade} mới. Chọn chương để luyện đề:
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {MATH_GRADE_12_CHAPTERS.map((ch) => {
                  const isSelected = selectedChapterId === ch.id;

                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch.id)}
                      className={cn(
                        'p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group',
                        isSelected
                          ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/10'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                      )}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors truncate">
                            {ch.name}
                          </h4>
                          {ch.isDemoReady && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 shrink-0 border border-emerald-300">
                              Đủ 3 dạng đề ⭐
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                          {ch.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {ch.examCount} đề
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00B8DD] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CHỌN HÌNH THỨC ĐỀ THI                                             */}
          {/* ========================================================================= */}
          {currentStep === 'FORMAT' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Chọn 1 trong 3 hình thức đề thi để thiết lập cấu hình câu hỏi:
              </p>

              {/* 3 Formats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Trắc Nghiệm */}
                <div
                  onClick={() => handleSelectFormat('QUIZ')}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group',
                    selectedFormat === 'QUIZ'
                      ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/20 ring-2 ring-[#00B8DD]/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {quizCount} Câu
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                      Trắc Nghiệm
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Format chuẩn 2025: 4 lựa chọn, Đúng/Sai và Điền số kết quả.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD]">
                    {quizCount} câu hỏi • Chấm tức thì
                  </div>
                </div>

                {/* 2. Tự Luận */}
                <div
                  onClick={() => handleSelectFormat('ESSAY')}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group',
                    selectedFormat === 'ESSAY'
                      ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/20 ring-2 ring-[#00B8DD]/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4 text-purple-500" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {essayCount} Câu
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                      Tự Luận
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Khung gõ lời giải, tính đạo hàm, bảng biến thiên và đối chiếu barem.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD]">
                    {essayCount} câu tự luận • Barem 4 bước
                  </div>
                </div>

                {/* 3. Trộn Kết Hợp */}
                <div
                  onClick={() => handleSelectFormat('MIXED')}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group',
                    selectedFormat === 'MIXED'
                      ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/20 ring-2 ring-[#00B8DD]/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 flex items-center justify-center font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {quizCount + essayCount} Câu
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                      Trộn (Hỗn Hợp)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Kết hợp cả Trắc nghiệm tốc độ và Tự luận nâng cao khảo thí.
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD]">
                    {quizCount} TN + {essayCount} TL • Đầy đủ dạng
                  </div>
                </div>
              </div>

              {/* Option A: Input tùy chọn số lượng câu hỏi trắc nghiệm (min 10, max 30) */}
              {selectedFormat === 'QUIZ' && (
                <div className="p-4 rounded-2xl bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Số Lượng Câu Hỏi Trắc Nghiệm:
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Nhập số lượng câu hỏi bạn muốn luyện (tối thiểu 10 câu, tối đa 30 câu).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min={10}
                        max={30}
                        value={quizCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val)) {
                            setQuizCount(10);
                          } else {
                            setQuizCount(Math.min(30, Math.max(10, val)));
                          }
                        }}
                        className="w-20 px-3 py-2 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">câu</span>
                    </div>
                  </div>

                  {/* Quick-pick Chips */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#00B8DD]/20 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Chọn nhanh:</span>
                    {[10, 15, 20, 25, 30].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuizCount(num)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                          quizCount === num
                            ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#00B8DD]'
                        )}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option B: Input tùy chọn số lượng câu hỏi tự luận (min 5, max 10) */}
              {selectedFormat === 'ESSAY' && (
                <div className="p-4 rounded-2xl bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-500" />
                        Số Lượng Câu Hỏi Tự Luận:
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Nhập số lượng câu hỏi tự luận bạn muốn luyện (tối thiểu 5 câu, tối đa 10 câu).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min={5}
                        max={10}
                        value={essayCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val)) {
                            setEssayCount(5);
                          } else {
                            setEssayCount(Math.min(10, Math.max(5, val)));
                          }
                        }}
                        className="w-20 px-3 py-2 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">câu</span>
                    </div>
                  </div>

                  {/* Quick-pick Chips for Essay */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#00B8DD]/20 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Chọn nhanh:</span>
                    {[5, 6, 7, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEssayCount(num)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                          essayCount === num
                            ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#00B8DD]'
                        )}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option C: Tùy chọn cấu hình đề Trộn (cả Trắc nghiệm & Tự luận) */}
              {selectedFormat === 'MIXED' && (
                <div className="p-4 rounded-2xl bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Cấu Hình Số Lượng Câu Hỏi Đề Trộn:
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tùy chọn số lượng câu trắc nghiệm (5 - 30) và câu tự luận (1 - 10) trong đề thi:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Trắc nghiệm Config */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Trắc Nghiệm (5-30):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={5}
                            max={30}
                            value={quizCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val)) {
                                setQuizCount(5);
                              } else {
                                setQuizCount(Math.min(30, Math.max(5, val)));
                              }
                            }}
                            className="w-16 px-2 py-1 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00B8DD]"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">câu</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                        {[5, 10, 15, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuizCount(num)}
                            className={cn(
                              'px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer',
                              quizCount === num
                                ? 'bg-[#00B8DD] text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#00B8DD]'
                            )}
                          >
                            {num}c
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tự luận Config */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-purple-500" />
                          Tự Luận (1-10):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={essayCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val)) {
                                setEssayCount(1);
                              } else {
                                setEssayCount(Math.min(10, Math.max(1, val)));
                              }
                            }}
                            className="w-16 px-2 py-1 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00B8DD]"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">câu</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                        {[1, 2, 3, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setEssayCount(num)}
                            className={cn(
                              'px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer',
                              essayCount === num
                                ? 'bg-[#00B8DD] text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#00B8DD]'
                            )}
                          >
                            {num}c
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                    💡 Tổng số câu: <strong className="text-slate-900 dark:text-white">{quizCount + essayCount} câu</strong> ({quizCount} trắc nghiệm + {essayCount} tự luận).
                  </div>
                </div>
              )}

              {/* Step 4 Footer: Next to Step 5 (Duration) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span>Cấu hình đề thi: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {subject.name} • Lớp {selectedGrade} • Chương {selectedChapterId} (
                    {selectedFormat === 'QUIZ'
                      ? `Trắc Nghiệm: ${quizCount} câu`
                      : selectedFormat === 'ESSAY'
                      ? `Tự Luận: ${essayCount} câu`
                      : `Trộn: ${quizCount} TN + ${essayCount} TL`}
                    )
                  </strong>
                </div>

                <Button
                  onClick={() => {
                    setMaxStepReached((prev) => Math.max(prev, 5));
                    setCurrentStep('DURATION');
                  }}
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-[#00B8DD]/25 shrink-0"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Tiếp Tục: Chọn Thời Gian ➔
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: CHỌN THỜI GIAN LÀM BÀI (10p, 15p, 45p, 60p, 90p)                  */}
          {/* ========================================================================= */}
          {currentStep === 'DURATION' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Chọn mốc thời gian làm bài phù hợp với nhu cầu luyện tập của bạn:
              </p>

              {/* 5 Duration Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedDuration === opt.minutes;
                  return (
                    <div
                      key={opt.minutes}
                      onClick={() => setSelectedDuration(opt.minutes)}
                      className={cn(
                        'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative',
                        isSelected
                          ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-[#00B8DD] shadow-md shadow-[#00B8DD]/20 ring-2 ring-[#00B8DD]/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full border', opt.badgeColor)}>
                            {opt.badge}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#00B8DD] text-slate-950 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors flex items-center gap-1.5 mt-1">
                          <Clock className="w-4 h-4 text-[#00B8DD]" />
                          {opt.label}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-3">
                          {opt.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD]">
                        {opt.minutes} phút làm bài
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ready summary bar & Start exam button */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span>Cấu hình hoàn tất: </span>
                  <strong className="text-slate-900 dark:text-white">
                    {subject.name} • Lớp {selectedGrade} • Chương {selectedChapterId} •{' '}
                    {selectedFormat === 'QUIZ'
                      ? `${quizCount} câu TN`
                      : selectedFormat === 'ESSAY'
                      ? `${essayCount} câu TL`
                      : `${quizCount} TN + ${essayCount} TL`}{' '}
                    • Thời gian: {selectedDuration} Phút
                  </strong>
                </div>

                <Button
                  onClick={handleStartExam}
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-[#00B8DD]/25 shrink-0"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Vào Phòng Thi Ngay
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Require Login Gated Modal */}
      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={selectedGatedLevelName}
      />
    </>
  );
}
