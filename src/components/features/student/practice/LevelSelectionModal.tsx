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
  Clock,
  HelpCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { K12Subject, PracticeLevel, LevelDetail } from '@/types/subject';
import { PRACTICE_LEVELS } from '@/services/mock/subject-data';
import { RequireLoginModal } from '@/components/features/auth/RequireLoginModal';
import { cn } from '@/lib/utils';

interface LevelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: K12Subject | null;
  isLoggedIn?: boolean;
}

const LEVEL_ICONS: Record<PracticeLevel, React.ReactNode> = {
  BASIC: <BookOpen className="w-5 h-5 text-emerald-500" />,
  MEDIUM: <Award className="w-5 h-5 text-sky-500" />,
  ADVANCED: <Flame className="w-5 h-5 text-purple-500" />,
  PROVINCIAL_EXCELLENT: <Trophy className="w-5 h-5 text-amber-500" />,
  NATIONAL_EXCELLENT: <Crown className="w-5 h-5 text-rose-500" />,
};

export function LevelSelectionModal({
  isOpen,
  onClose,
  subject,
  isLoggedIn = false,
}: LevelSelectionModalProps) {
  const router = useRouter();
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [selectedGatedLevelName, setSelectedGatedLevelName] = React.useState<string>('');

  if (!subject) return null;

  const handleSelectLevel = (level: LevelDetail) => {
    // Basic level is free trial for everyone without login
    const isFreeTrial = level.id === 'BASIC';

    if (!isLoggedIn && !isFreeTrial) {
      // Require login for Advanced and HSG
      setSelectedGatedLevelName(level.name);
      setRequireLoginOpen(true);
      return;
    }

    onClose();
    router.push(`/student/practice/${subject.slug}/${level.id.toLowerCase()}`);
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
                  Môn Học K-12
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500">{subject.totalExams}+ Đề Luyện Tập</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Luyện Tập Môn {subject.name}
              </div>
            </div>
          </div>
        }
        description={
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 block">
            Chọn 1 trong 5 cấp độ mục tiêu bên dưới để bắt đầu rèn luyện. Cấp độ <strong>Cơ bản</strong> mở tự do cho mọi học sinh luyện thử!
          </span>
        }
      >
        <div className="space-y-3 py-2">
          {PRACTICE_LEVELS.map((level, index) => {
            const icon = LEVEL_ICONS[level.id];
            const isFree = level.id === 'BASIC';

            return (
              <div
                key={level.id}
                onClick={() => handleSelectLevel(level)}
                className={cn(
                  'group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  isFree
                    ? 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#00B8DD] hover:shadow-lg hover:shadow-[#00B8DD]/10'
                )}
              >
                {/* Left Column: Icon & Level details */}
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors">
                        {index + 1}. Cấp Độ {level.name}
                      </h4>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', level.badgeColor)}>
                        {level.badge}
                      </span>
                      {isFree ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Luyện Thử Miễn Phí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          <Lock className="w-3 h-3 text-amber-500" /> Cần Đăng Nhập
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/60">
                        +{level.pointsReward} 💎
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {level.description}
                    </p>
                  </div>
                </div>

                {/* Right Column: CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {level.totalExams} đề sẵn sàng
                  </span>
                  <Button
                    size="sm"
                    variant={isFree ? 'primary' : 'outline'}
                    className={cn(
                      'text-xs font-bold rounded-xl transition-all',
                      isFree
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'group-hover:bg-[#00B8DD] group-hover:text-white group-hover:border-[#00B8DD]'
                    )}
                    rightIcon={isFree ? <ArrowRight className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  >
                    {isFree ? 'Luyện Thử Ngay' : 'Mở Khóa Luyện'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Dialog>

      {/* Auth Gate Modal when clicking Advanced / HSG */}
      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason="ADVANCED_LEVEL"
        targetLevelName={selectedGatedLevelName}
        onContinueGuest={() => {
          setRequireLoginOpen(false);
          // Auto route to basic level
          onClose();
          router.push(`/student/practice/${subject.slug}/basic`);
        }}
      />
    </>
  );
}
